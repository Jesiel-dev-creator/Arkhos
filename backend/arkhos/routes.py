"""API route handlers for ArkhosAI."""

from __future__ import annotations

import asyncio
import io
import json
import logging
import zipfile
from typing import Any

import httpx as _httpx
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from starlette.responses import Response
from tramontane import simulate_pipeline

from arkhos.config import get_settings
from arkhos.pipeline import PROFILES, FleetProfile, _create_agents
from arkhos.rate_limit import rate_limiter
from arkhos.sanitize import sanitize_prompt
from arkhos.sse import SSEEventType, format_sse
from arkhos.store import GenerationStatus, store

logger = logging.getLogger(__name__)

router = APIRouter()


class GenerateRequest(BaseModel):
    """Request body for POST /api/generate."""

    prompt: str = Field(..., min_length=1, max_length=1000)
    locale: str = Field(default="en", max_length=5)
    template: str | None = None
    profile: FleetProfile = FleetProfile.BALANCED


class GenerateResponse(BaseModel):
    """Response body for POST /api/generate."""

    generation_id: str
    remaining_today: int = 0


class IterateRequest(BaseModel):
    """Request body for POST /api/iterate."""

    generation_id: str
    modification: str = Field(..., min_length=1, max_length=1000)


# ── Generate (Planner-only phase) ────────────────────────────────


@router.post("/generate", response_model=GenerateResponse)
async def generate(request: Request, body: GenerateRequest) -> GenerateResponse:
    """Start a new website generation.

    Runs the Planner only. The pipeline pauses until the user approves
    the plan via POST /api/approve/{generation_id}.
    """
    client_ip = request.client.host if request.client else "unknown"

    allowed, reason = rate_limiter.check(client_ip)
    if not allowed:
        raise HTTPException(status_code=429, detail=reason)

    settings = get_settings()
    if len(body.prompt) > settings.max_prompt_length:
        raise HTTPException(
            status_code=400,
            detail=f"Prompt too long: {len(body.prompt)} chars "
            f"(max {settings.max_prompt_length})",
        )

    sanitized = sanitize_prompt(body.prompt)
    generation = store.create(prompt=sanitized, locale=body.locale)

    asyncio.create_task(
        _run_planner(generation.id, sanitized, body.locale, client_ip, body.profile)
    )

    record = rate_limiter._records.get(client_ip)
    count = record.count if record else 0
    remaining = max(0, settings.max_generations_per_ip - count - 1)

    return GenerateResponse(
        generation_id=generation.id,
        remaining_today=remaining,
    )


@router.post("/generate-mcp", response_model=GenerateResponse)
async def generate_mcp(request: Request, body: GenerateRequest) -> GenerateResponse:
    """Start a new website generation using MCP parallel processing.

    Runs the full pipeline with parallel agent coordination for faster generation.
    """
    client_ip = request.client.host if request.client else "unknown"

    allowed, reason = rate_limiter.check(client_ip)
    if not allowed:
        raise HTTPException(status_code=429, detail=reason)

    settings = get_settings()
    if len(body.prompt) > settings.max_prompt_length:
        raise HTTPException(
            status_code=400,
            detail=f"Prompt too long: {len(body.prompt)} chars "
            f"(max {settings.max_prompt_length})",
        )

    sanitized = sanitize_prompt(body.prompt)
    generation = store.create(prompt=sanitized, locale=body.locale)

    generation.metadata["mcp_mode"] = True

    asyncio.create_task(
        _run_pipeline_mcp(
            generation.id, sanitized, body.locale, client_ip, body.profile,
        )
    )

    record = rate_limiter._records.get(client_ip)
    count = record.count if record else 0
    remaining = max(0, settings.max_generations_per_ip - count - 1)

    return GenerateResponse(
        generation_id=generation.id,
        remaining_today=remaining,
    )


async def _run_pipeline_mcp(
    gen_id: str,
    prompt: str,
    locale: str,
    client_ip: str,
    profile: FleetProfile = FleetProfile.BALANCED,
) -> None:
    """Background task: run full pipeline with MCP parallel processing."""
    from arkhos.pipeline import run_pipeline_streaming_mcp

    generation = store.get(gen_id)
    if generation is None:
        return

    generation.status = GenerationStatus.RUNNING
    total_cost = 0.0

    try:
        async for sse_event in run_pipeline_streaming_mcp(
            prompt, locale, profile
        ):
            await generation.event_queue.put(sse_event)

            # Parse SSE data to capture metadata for result endpoint
            for line in sse_event.split("\n"):
                if not line.startswith("data: "):
                    continue
                try:
                    data = json.loads(line[6:])
                except (json.JSONDecodeError, KeyError):
                    continue
                if "total_cost_eur" in data:
                    total_cost = data["total_cost_eur"]
                if data.get("stage") == "final" and "html" in data:
                    generation.html = data["html"]
                if "files" in data and "file_count" in data:
                    generation.metadata["files"] = data["files"]
                if "plan" in data:
                    generation.plan = data["plan"]

        generation.status = GenerationStatus.COMPLETE
        generation.metadata["total_cost_eur"] = total_cost

    except Exception as exc:
        logger.exception("MCP pipeline failed: %s", exc)
        generation.status = GenerationStatus.FAILED
        generation.error = str(exc)
        await generation.event_queue.put(
            format_sse(SSEEventType.ERROR, {
                "error": str(exc),
                "parallel_mode": True,
            })
        )

    await generation.event_queue.put(None)
    rate_limiter.record_generation(client_ip, total_cost)


async def _run_planner(
    gen_id: str, prompt: str, locale: str, client_ip: str,
    profile: FleetProfile = FleetProfile.BALANCED,
) -> None:
    """Background task: run Planner only, then pause for approval."""
    from arkhos.pipeline import run_planner_streaming

    generation = store.get(gen_id)
    if generation is None:
        return

    generation.status = GenerationStatus.RUNNING
    planner_cost = 0.0

    try:
        async for sse_event in run_planner_streaming(prompt, locale, profile):
            await generation.event_queue.put(sse_event)

            for line in sse_event.split("\n"):
                if not line.startswith("data: "):
                    continue
                try:
                    data = json.loads(line[6:])
                except (json.JSONDecodeError, KeyError):
                    continue
                if "plan" in data:
                    generation.plan = data["plan"]
                    generation.metadata["planner_spec"] = data["plan"]
                if data.get("agent") == "planner" and "cost_eur" in data:
                    planner_cost = data["cost_eur"]
                if "error" in data and "error_type" in data:
                    generation.status = GenerationStatus.FAILED
                    generation.error = data["error"]

        if generation.status != GenerationStatus.FAILED:
            generation.status = GenerationStatus.PENDING
            generation.metadata["planner_cost"] = planner_cost
            generation.metadata["locale"] = locale
            generation.metadata["profile"] = profile.value

    except Exception as exc:
        logger.exception("Planner %s failed: %s", gen_id, exc)
        generation.status = GenerationStatus.FAILED
        generation.error = str(exc)
        error_event = format_sse(SSEEventType.ERROR, {"error": str(exc)})
        await generation.event_queue.put(error_event)

    await generation.event_queue.put(None)


# ── Approve (resume build phase) ─────────────────────────────────


@router.post("/approve/{generation_id}")
async def approve_plan(
    generation_id: str, request: Request
) -> dict[str, str]:
    """Resume pipeline after user approves the plan.

    Kicks off Designer → Builder → Reviewer in background.
    """
    client_ip = request.client.host if request.client else "unknown"

    generation = store.get(generation_id)
    if generation is None:
        raise HTTPException(status_code=404, detail="Generation not found")

    if not generation.plan:
        raise HTTPException(status_code=400, detail="No plan to approve")

    # Reset the event queue for the build phase stream
    generation.event_queue = asyncio.Queue()

    profile_str = generation.metadata.get("profile", "balanced")
    build_profile = FleetProfile(profile_str)

    asyncio.create_task(
        _run_build(
            gen_id=generation.id,
            planner_output=generation.plan,
            locale=generation.metadata.get("locale", "en"),
            prior_cost=generation.metadata.get("planner_cost", 0.0),
            client_ip=client_ip,
            profile=build_profile,
        )
    )

    return {"status": "building", "generation_id": generation_id}


async def _run_build(
    gen_id: str,
    planner_output: str,
    locale: str,
    prior_cost: float,
    client_ip: str,
    profile: FleetProfile = FleetProfile.BALANCED,
) -> None:
    """Background task: run Designer + Builder + Reviewer."""
    from arkhos.pipeline import run_build_streaming

    generation = store.get(gen_id)
    if generation is None:
        return

    generation.status = GenerationStatus.RUNNING
    total_cost = prior_cost

    try:
        event_count = 0
        async for sse_event in run_build_streaming(
            planner_output, locale, prior_cost, profile
        ):
            event_count += 1
            event_type = sse_event.split("\n")[0] if sse_event else "?"
            logger.warning("QUEUE PUT #%d: %s (%d bytes)", event_count, event_type, len(sse_event))
            await generation.event_queue.put(sse_event)

            for line in sse_event.split("\n"):
                if not line.startswith("data: "):
                    continue
                try:
                    data = json.loads(line[6:])
                except (json.JSONDecodeError, KeyError):
                    continue
                if "total_cost_eur" in data:
                    total_cost = data["total_cost_eur"]
                if data.get("stage") == "final" and "html" in data:
                    generation.html = data["html"]
                # v0.2: capture multi-file React project
                if "files" in data and "file_count" in data:
                    generation.metadata["files"] = data["files"]

        generation.status = GenerationStatus.COMPLETE
        generation.metadata["total_cost_eur"] = total_cost

        # Log generation costs for pricing verification
        try:
            from supabase import create_client
            settings = get_settings()
            if settings.supabase_url and settings.supabase_service_key:
                sb = create_client(settings.supabase_url, settings.supabase_service_key)
                sb.table("generation_logs").insert({
                    "user_id": generation.metadata.get("user_id"),
                    "project_id": generation.metadata.get("project_id"),
                    "fleet_profile": generation.metadata.get("profile", "balanced"),
                    "prompt_length": len(generation.prompt or ""),
                    "agent_costs": generation.metadata.get("agent_costs", {}),
                    "total_api_cost_eur": total_cost,
                    "sandbox_cost_eur": 0.002,
                    "total_cost_eur": total_cost + 0.002,
                    "duration_s": generation.metadata.get("total_duration_s", 0),
                    "models_used": generation.metadata.get("models_used", []),
                    "file_count": len(generation.metadata.get("files", {})),
                    "success": True,
                }).execute()
                logger.info("Cost logged for generation %s", gen_id)
        except Exception as log_exc:
            logger.warning("Failed to log generation cost: %s", log_exc)

    except Exception as exc:
        logger.exception("Build %s failed: %s", gen_id, exc)
        generation.status = GenerationStatus.FAILED
        generation.error = str(exc)
        error_event = format_sse(SSEEventType.ERROR, {"error": str(exc)})
        await generation.event_queue.put(error_event)

    await generation.event_queue.put(None)
    rate_limiter.record_generation(client_ip, total_cost)


# ── Stream ────────────────────────────────────────────────────────


@router.get("/stream/{generation_id}")
async def stream(generation_id: str) -> StreamingResponse:
    """Stream SSE events for a generation."""
    generation = store.get(generation_id)
    if generation is None:
        raise HTTPException(status_code=404, detail="Generation not found")

    async def event_generator() -> Any:
        while True:
            event = await generation.event_queue.get()
            if event is None:
                break
            yield event

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ── Preview Proxy ────────────────────────────────────────────────


@router.get("/preview/{generation_id}/{path:path}")
@router.get("/preview/{generation_id}")
async def preview_proxy(generation_id: str, path: str = "") -> Response:
    """Reverse proxy to the generation's Vite dev server."""
    from arkhos.app import port_manager

    port = port_manager.get_port(generation_id)
    if port is None:
        raise HTTPException(status_code=404, detail="Preview not available")

    port_manager.touch(generation_id)

    target_url = f"http://localhost:{port}/{path}"
    try:
        async with _httpx.AsyncClient() as client:
            resp = await client.get(target_url, timeout=10.0, follow_redirects=True)
            return Response(
                content=resp.content,
                status_code=resp.status_code,
                headers={
                    k: v for k, v in resp.headers.items()
                    if k.lower() not in ("transfer-encoding", "connection")
                },
            )
    except _httpx.ConnectError:
        raise HTTPException(status_code=502, detail="Preview server not ready")
    except _httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Preview server timeout")


# ── Result / Gallery ─────────────────────────────────────────────


@router.get("/result/{generation_id}")
async def result(generation_id: str) -> dict[str, Any]:
    """Get the result of a completed generation."""
    generation = store.get(generation_id)
    if generation is None:
        raise HTTPException(status_code=404, detail="Generation not found")

    if generation.status in (GenerationStatus.PENDING, GenerationStatus.RUNNING):
        raise HTTPException(status_code=202, detail="Generation in progress")

    if generation.status == GenerationStatus.FAILED:
        raise HTTPException(
            status_code=500, detail=generation.error or "Generation failed"
        )

    return {"html": generation.html, "metadata": generation.metadata}


@router.get("/gallery")
async def gallery() -> list[dict[str, Any]]:
    """List recent public generations."""
    return store.list_recent()


# ── Download (v0.2: zip) ─────────────────────────────────────────


@router.get("/download/{generation_id}")
async def download_project(generation_id: str) -> StreamingResponse:
    """Download the generated project as a zip file."""
    generation = store.get(generation_id)
    if generation is None:
        raise HTTPException(status_code=404, detail="Generation not found")

    if generation.status != GenerationStatus.COMPLETE:
        raise HTTPException(status_code=400, detail="Generation not complete")

    files = generation.metadata.get("files", {})
    project_name = generation.metadata.get("project_name", f"arkhos-{generation_id[:8]}")

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        if files:
            for path, content in files.items():
                zf.writestr(f"{project_name}/{path}", content)
            zf.writestr(
                f"{project_name}/README.md",
                f"# {project_name}\n\nGenerated by [ArkhosAI](https://arkhos.ai)\n\n"
                f"```bash\nnpm install\nnpm run dev\n```\n",
            )
        elif generation.html:
            zf.writestr(f"{project_name}/index.html", generation.html)

    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="application/zip",
        headers={
            "Content-Disposition": f'attachment; filename="{project_name}.zip"'
        },
    )


# ── Iterate ───────────────────────────────────────────────────────


@router.post("/iterate", response_model=GenerateResponse)
async def iterate_endpoint(
    request: Request, body: IterateRequest
) -> GenerateResponse:
    """Apply a modification to an existing generation."""
    client_ip = request.client.host if request.client else "unknown"

    allowed, reason = rate_limiter.check(client_ip)
    if not allowed:
        raise HTTPException(status_code=429, detail=reason)

    original = store.get(body.generation_id)
    if original is None:
        raise HTTPException(status_code=404, detail="Original generation not found")

    if not original.html:
        raise HTTPException(status_code=400, detail="No HTML to iterate on")

    sanitized_mod = sanitize_prompt(body.modification)
    generation = store.create(
        prompt=f"[iterate] {sanitized_mod}",
        locale=original.metadata.get("locale", "en"),
    )
    generation.metadata["parent_generation_id"] = body.generation_id
    generation.metadata["modification"] = sanitized_mod

    asyncio.create_task(
        _run_iteration(
            gen_id=generation.id,
            current_html=original.html,
            all_files=original.metadata.get("files"),
            modification=sanitized_mod,
            client_ip=client_ip,
        )
    )

    settings = get_settings()
    record = rate_limiter._records.get(client_ip)
    count = record.count if record else 0
    remaining = max(0, settings.max_generations_per_ip - count)

    return GenerateResponse(
        generation_id=generation.id,
        remaining_today=remaining,
    )


async def _run_iteration(
    gen_id: str,
    current_html: str,
    all_files: dict[str, str] | None,
    modification: str,
    client_ip: str,
) -> None:
    """Background task: run single-agent iteration."""
    from arkhos.iterate import run_iteration

    generation = store.get(gen_id)
    if generation is None:
        return

    generation.status = GenerationStatus.RUNNING
    total_cost = 0.0

    try:
        async for sse_event in run_iteration(
            modification_request=modification,
            all_files=all_files,
            current_html=current_html,
        ):
            await generation.event_queue.put(sse_event)

            for line in sse_event.split("\n"):
                if not line.startswith("data: "):
                    continue
                try:
                    data = json.loads(line[6:])
                except (json.JSONDecodeError, KeyError):
                    continue
                if "total_cost_eur" in data:
                    total_cost = data["total_cost_eur"]
                if data.get("stage") == "final" and "html" in data:
                    generation.html = data["html"]
                if "files" in data and "file_count" in data:
                    generation.metadata["files"] = data["files"]

        generation.status = GenerationStatus.COMPLETE
        generation.metadata["total_cost_eur"] = total_cost

    except Exception as exc:
        logger.exception("Iteration %s failed: %s", gen_id, exc)
        generation.status = GenerationStatus.FAILED
        generation.error = str(exc)
        error_event = format_sse(SSEEventType.ERROR, {"error": str(exc)})
        await generation.event_queue.put(error_event)

    await generation.event_queue.put(None)
    rate_limiter.record_generation(client_ip, total_cost)


# ── Simulate (cost estimation) ──────────────────────────────────


class SimulateRequest(BaseModel):
    """Request body for POST /api/simulate."""

    prompt: str = Field(..., min_length=1, max_length=1000)
    profile: FleetProfile = FleetProfile.BALANCED


@router.post("/simulate")
async def simulate_generation(body: SimulateRequest) -> dict[str, Any]:
    """Estimate generation cost without making API calls."""
    from arkhos.app import mistral_router

    cfg = PROFILES[body.profile]
    agents_dict = _create_agents(cfg)
    agents_list = [
        agents_dict["planner"],
        agents_dict["designer"],
        agents_dict["architect"],
        agents_dict["builder"],
        agents_dict["reviewer"],
    ]

    sim = simulate_pipeline(
        agents=agents_list,
        input_text=body.prompt,
        budget_eur=cfg.total_budget_eur,
        router=mistral_router,
    )

    return {
        "profile": body.profile.value,
        "estimated_cost_eur": round(sim.total_estimated_cost_eur, 6),
        "estimated_time_s": round(sim.total_estimated_time_s, 1),
        "budget_eur": cfg.total_budget_eur,
        "budget_status": sim.budget_status,
        "models": [a.model for a in agents_list],
        "est_label": cfg.est_cost,
    }


# ── Telemetry stats ─────────────────────────────────────────────


@router.get("/telemetry")
async def telemetry_stats() -> dict[str, Any]:
    """Return fleet telemetry stats (model performance data)."""
    from arkhos.app import telemetry

    return {
        "total_outcomes": telemetry.total_outcomes,
        "model_stats": telemetry.get_model_stats(),
    }


# ── Waitlist ──────────────────────────────────────────────────────


class WaitlistRequest(BaseModel):
    """Request body for POST /api/waitlist."""

    email: str = Field(..., min_length=5, max_length=254)


@router.post("/waitlist")
async def waitlist(body: WaitlistRequest) -> dict[str, str]:
    """Add email to the early access waitlist."""
    from arkhos.waitlist import add_email

    add_email(body.email)
    return {"status": "ok"}
