"""ArkhosAI 5-agent website generation pipeline with SSE streaming.

Manual agent orchestration for per-agent SSE events.
v0.2: Planner → Designer → Architect → Builder → Reviewer

Uses Agent.run(input_text) directly (not Pipeline.run()) so we can
emit SSE events between each agent step.

Tramontane API (v0.1.4):
- Agent.run(input_text) — system prompt auto-built from role/goal/backstory
- AgentResult: .output, .model_used, .cost_eur, .duration_seconds
"""

from __future__ import annotations

import json
import logging
import re
import time
from dataclasses import dataclass, field
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from collections.abc import AsyncGenerator

from tramontane import Agent

from arkhos.data.design_intelligence import get_design_for_industry
from arkhos.prompts.architect import SYSTEM_PROMPT as ARCHITECT_PROMPT
from arkhos.prompts.architect import format_user_message as format_architect_msg
from arkhos.prompts.builder import SYSTEM_PROMPT as BUILDER_PROMPT
from arkhos.prompts.builder import format_user_message as format_builder_msg
from arkhos.prompts.designer import SYSTEM_PROMPT as DESIGNER_PROMPT
from arkhos.prompts.designer import format_user_message as format_designer_msg
from arkhos.prompts.planner import SYSTEM_PROMPT as PLANNER_PROMPT
from arkhos.prompts.planner import format_user_message as format_planner_msg
from arkhos.prompts.reviewer import SYSTEM_PROMPT as REVIEWER_PROMPT
from arkhos.prompts.reviewer import format_user_message as format_reviewer_msg
from arkhos.sse import SSEEventType, format_sse

logger = logging.getLogger(__name__)


@dataclass
class AgentStepResult:
    """Result from a single agent execution."""

    agent_name: str
    model_used: str
    output: str
    cost_eur: float
    duration_s: float


@dataclass
class PipelineResult:
    """Complete pipeline execution result."""

    html: str
    agent_results: list[AgentStepResult] = field(default_factory=list)
    total_cost_eur: float = 0.0
    total_duration_s: float = 0.0
    models_used: list[str] = field(default_factory=list)
    success: bool = True
    error: str | None = None


def _create_agents() -> dict[str, Agent]:
    """Create the 5 pipeline agents (v0.2).

    The backstory field carries the full system prompt instructions
    because Tramontane auto-builds the system message from
    role + goal + backstory.
    """
    return {
        "planner": Agent(
            role="Landing Page Planner",
            goal="Convert natural language descriptions into structured page specs",
            backstory=PLANNER_PROMPT,
            model="ministral-3b-latest",
            budget_eur=0.005,
        ),
        "designer": Agent(
            role="Visual Designer",
            goal="Create cohesive design systems for landing pages",
            backstory=DESIGNER_PROMPT,
            model="mistral-small",
            reasoning=True,
            budget_eur=0.01,
        ),
        "architect": Agent(
            role="React Project Architect",
            goal="Design optimal React component structure for landing pages",
            backstory=ARCHITECT_PROMPT,
            model="mistral-small",
            reasoning=True,
            budget_eur=0.005,
        ),
        "builder": Agent(
            role="Frontend Builder",
            goal="Generate complete multi-file React projects with shadcn/ui",
            backstory=BUILDER_PROMPT,
            model="devstral-small",
            budget_eur=0.03,
        ),
        "reviewer": Agent(
            role="Code Reviewer",
            goal="Validate React project quality, shadcn/ui usage, and spec compliance",
            backstory=REVIEWER_PROMPT,
            model="mistral-small",
            budget_eur=0.01,
        ),
    }


def _parse_file_tags(text: str) -> dict[str, str]:
    """Parse <file path="...">content</file> blocks from Builder output.

    Returns all files with complete closing tags. Partial files are discarded.
    """
    files: dict[str, str] = {}
    pattern = re.compile(
        r'<file\s+path=["\']([^"\']+)["\']\s*>(.*?)</file>',
        re.DOTALL,
    )
    for match in pattern.finditer(text):
        path = match.group(1).strip()
        content = match.group(2)
        if content.startswith("\n"):
            content = content[1:]
        if content.endswith("\n"):
            content = content[:-1]
        files[path] = content
    return files


def _build_app_tsx(files: dict[str, str]) -> str:
    """Generate App.tsx from the section files that were actually produced."""
    section_names: list[str] = []
    for path in sorted(files):
        if path.startswith("src/sections/") and path.endswith(".tsx"):
            name = path.replace("src/sections/", "").replace(".tsx", "")
            section_names.append(name)

    ordered: list[str] = []
    if "Navbar" in section_names:
        ordered.append("Navbar")
        section_names.remove("Navbar")
    footer = None
    if "Footer" in section_names:
        footer = "Footer"
        section_names.remove("Footer")
    ordered.extend(section_names)
    if footer:
        ordered.append(footer)

    imports = "\n".join(
        f'import {n} from "./sections/{n}";' for n in ordered
    )
    renders = "\n      ".join(f"<{n} />" for n in ordered)

    return (
        'import React from "react";\n'
        f"{imports}\n\n"
        "export default function App() {\n"
        "  return (\n"
        '    <div className="min-h-screen">\n'
        f"      {renders}\n"
        "    </div>\n"
        "  );\n"
        "}\n"
    )


def _build_arkhos_md(
    prompt: str,
    planner_output: str,
    designer_output: str,
    architect_output: str,
) -> str:
    """Project memory file for accurate iterations."""
    return (
        "# ARKHOS Project Memory\n\n"
        f"## Original Prompt\n{prompt}\n\n"
        f"## Site Spec (Planner)\n{planner_output}\n\n"
        f"## Design System (Designer)\n{designer_output}\n\n"
        f"## Component Structure (Architect)\n{architect_output}\n\n"
        "## Rules for Iteration\n"
        "- NEVER change design system colors/fonts unless explicitly asked\n"
        "- NEVER remove sections unless explicitly asked\n"
        "- Use shadcn/ui from @/components/ui/* (pre-installed)\n"
        "- Use Framer Motion for animations\n"
        "- Use Lucide React for icons\n"
    )


def _extract_files(builder_output: str) -> dict[str, str]:
    """Extract files from Builder output (file-tag or JSON format).

    1. Try file-tag format: <file path="...">content</file>
    2. Fallback: try JSON format: {"files": {...}}
    3. If successful, generate App.tsx from the section files found.
    """
    raw = builder_output.strip()

    # Method 1: file-tag format (preferred, streaming-friendly)
    files = _parse_file_tags(raw)
    if files:
        logger.info("Parsed %d files from file-tag format", len(files))

    # Method 2: JSON fallback
    if len(files) < 3:
        try:
            cleaned = raw
            if cleaned.startswith("```"):
                cleaned = cleaned.split("```", 2)[1]
                if cleaned.startswith("json"):
                    cleaned = cleaned[4:]
            parsed = json.loads(cleaned)
            if isinstance(parsed, dict) and "files" in parsed:
                files = dict(parsed["files"])
            elif isinstance(parsed, dict):
                files = dict(parsed)
            if files:
                logger.info("Parsed %d files from JSON format", len(files))
        except (json.JSONDecodeError, IndexError):
            pass

        # Method 2b: json-repair
        if len(files) < 3:
            try:
                from json_repair import repair_json

                repaired = repair_json(raw)
                parsed = json.loads(repaired)
                if isinstance(parsed, dict) and "files" in parsed:
                    files = dict(parsed["files"])
                elif isinstance(parsed, dict):
                    files = dict(parsed)
                if files:
                    logger.info(
                        "Parsed %d files from json-repair", len(files)
                    )
            except Exception:
                pass

    if not files:
        logger.error("Failed to parse any files from Builder output")
        return {}

    # Generate App.tsx from the sections that were actually produced
    if "src/App.tsx" not in files:
        files["src/App.tsx"] = _build_app_tsx(files)
        logger.info("Generated App.tsx from %d sections", len([
            p for p in files if p.startswith("src/sections/")
        ]))

    return files


async def run_pipeline_streaming(
    prompt: str,
    locale: str = "en",
) -> AsyncGenerator[str, None]:
    """Run the 4-agent pipeline, yielding SSE events as each agent completes.

    Each agent runs in sequence and SSE events are yielded between them
    so the frontend can show real-time progress.

    Args:
        prompt: User's natural language website description.
        locale: Default locale for the generated site.

    Yields:
        SSE-formatted strings (ready to send via StreamingResponse).
    """
    start_time = time.monotonic()
    agents = _create_agents()
    agent_results: list[AgentStepResult] = []
    cumulative_cost = 0.0

    try:
        # ── Agent 1: Planner ──────────────────────────────────
        yield format_sse(SSEEventType.AGENT_START, {
            "agent": "planner",
            "model": "ministral-3b-latest",
            "step": 1,
            "total_steps": 5,
        })

        t0 = time.monotonic()
        planner_input = format_planner_msg(prompt, locale)
        planner_response = await agents["planner"].run(
            planner_input,
        )

        planner_step = AgentStepResult(
            agent_name="planner",
            model_used=planner_response.model_used,
            output=planner_response.output,
            cost_eur=planner_response.cost_eur,
            duration_s=round(time.monotonic() - t0, 2),
        )
        agent_results.append(planner_step)
        cumulative_cost += planner_step.cost_eur

        yield format_sse(SSEEventType.AGENT_COMPLETE, {
            "agent": "planner",
            "model": planner_step.model_used,
            "cost_eur": planner_step.cost_eur,
            "duration_s": planner_step.duration_s,
            "cumulative_cost_eur": round(cumulative_cost, 6),
        })
        logger.info(
            "Planner complete: model=%s cost=EUR%.4f duration=%.1fs",
            planner_step.model_used,
            planner_step.cost_eur,
            planner_step.duration_s,
        )

        # ── Agent 2: Designer ─────────────────────────────────
        yield format_sse(SSEEventType.AGENT_START, {
            "agent": "designer",
            "model": "mistral-small",
            "step": 2,
            "total_steps": 5,
        })

        t0 = time.monotonic()
        designer_input = format_designer_msg(planner_step.output)
        designer_response = await agents["designer"].run(
            designer_input,
        )

        designer_step = AgentStepResult(
            agent_name="designer",
            model_used=designer_response.model_used,
            output=designer_response.output,
            cost_eur=designer_response.cost_eur,
            duration_s=round(time.monotonic() - t0, 2),
        )
        agent_results.append(designer_step)
        cumulative_cost += designer_step.cost_eur

        yield format_sse(SSEEventType.AGENT_COMPLETE, {
            "agent": "designer",
            "model": designer_step.model_used,
            "cost_eur": designer_step.cost_eur,
            "duration_s": designer_step.duration_s,
            "cumulative_cost_eur": round(cumulative_cost, 6),
        })
        logger.info(
            "Designer complete: model=%s cost=EUR%.4f duration=%.1fs",
            designer_step.model_used,
            designer_step.cost_eur,
            designer_step.duration_s,
        )

        # ── Agent 3: Builder ──────────────────────────────────
        yield format_sse(SSEEventType.AGENT_START, {
            "agent": "builder",
            "model": "devstral-small",
            "step": 3,
            "total_steps": 5,
        })

        t0 = time.monotonic()
        builder_input = format_builder_msg(
            planner_step.output, designer_step.output
        )
        builder_response = await agents["builder"].run(
            builder_input,
        )

        builder_step = AgentStepResult(
            agent_name="builder",
            model_used=builder_response.model_used,
            output=builder_response.output,
            cost_eur=builder_response.cost_eur,
            duration_s=round(time.monotonic() - t0, 2),
        )
        agent_results.append(builder_step)
        cumulative_cost += builder_step.cost_eur

        yield format_sse(SSEEventType.AGENT_COMPLETE, {
            "agent": "builder",
            "model": builder_step.model_used,
            "cost_eur": builder_step.cost_eur,
            "duration_s": builder_step.duration_s,
            "cumulative_cost_eur": round(cumulative_cost, 6),
        })
        logger.info(
            "Builder complete: model=%s cost=EUR%.4f duration=%.1fs",
            builder_step.model_used,
            builder_step.cost_eur,
            builder_step.duration_s,
        )

        # Emit preview with the Builder's HTML (before review)
        yield format_sse(SSEEventType.PREVIEW_READY, {
            "html": builder_step.output,
            "stage": "pre_review",
        })

        # ── Agent 4: Reviewer ─────────────────────────────────
        yield format_sse(SSEEventType.AGENT_START, {
            "agent": "reviewer",
            "model": "mistral-small",
            "step": 4,
            "total_steps": 5,
        })

        t0 = time.monotonic()
        reviewer_input = format_reviewer_msg(
            builder_step.output, planner_step.output
        )
        reviewer_response = await agents["reviewer"].run(
            reviewer_input,
        )

        reviewer_step = AgentStepResult(
            agent_name="reviewer",
            model_used=reviewer_response.model_used,
            output=reviewer_response.output,
            cost_eur=reviewer_response.cost_eur,
            duration_s=round(time.monotonic() - t0, 2),
        )
        agent_results.append(reviewer_step)
        cumulative_cost += reviewer_step.cost_eur

        yield format_sse(SSEEventType.AGENT_COMPLETE, {
            "agent": "reviewer",
            "model": reviewer_step.model_used,
            "cost_eur": reviewer_step.cost_eur,
            "duration_s": reviewer_step.duration_s,
            "cumulative_cost_eur": round(cumulative_cost, 6),
        })
        logger.info(
            "Reviewer complete: model=%s cost=EUR%.4f duration=%.1fs",
            reviewer_step.model_used,
            reviewer_step.cost_eur,
            reviewer_step.duration_s,
        )

        # Emit final preview (reviewed HTML)
        yield format_sse(SSEEventType.PREVIEW_READY, {
            "html": reviewer_step.output,
            "stage": "final",
        })

        # ── Generation Complete ───────────────────────────────
        total_duration = round(time.monotonic() - start_time, 2)
        yield format_sse(SSEEventType.GENERATION_COMPLETE, {
            "total_cost_eur": round(cumulative_cost, 6),
            "total_duration_s": total_duration,
            "models_used": [r.model_used for r in agent_results],
            "success": True,
        })
        logger.info(
            "Pipeline complete: cost=EUR%.4f duration=%.1fs",
            cumulative_cost,
            total_duration,
        )

    except Exception as exc:
        logger.exception("Pipeline failed: %s", exc)
        yield format_sse(SSEEventType.ERROR, {
            "error": str(exc),
            "agent": agent_results[-1].agent_name if agent_results else "unknown",
        })


def _classify_error(exc: Exception) -> tuple[str, str]:
    """Classify an exception into user-friendly error type + message."""
    msg = str(exc)
    if "rate_limit" in msg.lower() or "429" in msg:
        return "rate_limit", "Mistral API rate limit reached. Try again in a minute."
    if "timeout" in msg.lower():
        return "timeout", "Agent timed out. Try a simpler prompt."
    if "budget" in msg.lower():
        return "budget_exceeded", "Budget exceeded. Try a simpler prompt."
    if "api" in msg.lower() or "500" in msg:
        return "api_error", "AI service temporarily unavailable. Please try again."
    return "unknown", msg


async def run_planner_streaming(
    prompt: str,
    locale: str = "en",
) -> AsyncGenerator[str, None]:
    """Run ONLY the Planner agent, yield plan_ready, then stop.

    The pipeline pauses here until the user approves the plan.
    """
    agents = _create_agents()

    try:
        yield format_sse(SSEEventType.AGENT_START, {
            "agent": "planner",
            "model": "ministral-3b-latest",
            "step": 1,
            "total_steps": 5,
        })

        t0 = time.monotonic()
        planner_input = format_planner_msg(prompt, locale)
        planner_response = await agents["planner"].run(planner_input)

        planner_step = AgentStepResult(
            agent_name="planner",
            model_used=planner_response.model_used,
            output=planner_response.output,
            cost_eur=planner_response.cost_eur,
            duration_s=round(time.monotonic() - t0, 2),
        )

        yield format_sse(SSEEventType.AGENT_COMPLETE, {
            "agent": "planner",
            "model": planner_step.model_used,
            "cost_eur": planner_step.cost_eur,
            "duration_s": planner_step.duration_s,
            "cumulative_cost_eur": round(planner_step.cost_eur, 6),
        })

        yield format_sse(SSEEventType.PLAN_READY, {
            "plan": planner_step.output,
        })

        logger.info(
            "Planner complete, plan_ready: cost=EUR%.4f",
            planner_step.cost_eur,
        )

    except Exception as exc:
        logger.exception("Planner failed: %s", exc)
        error_type, error_msg = _classify_error(exc)
        yield format_sse(SSEEventType.ERROR, {
            "error": error_msg,
            "error_type": error_type,
            "agent": "planner",
        })


async def run_build_streaming(
    planner_output: str,
    locale: str = "en",
    prior_cost: float = 0.0,
) -> AsyncGenerator[str, None]:
    """Run Designer → Architect → Builder → Reviewer (v0.2 pipeline).

    Called after user approves the planner output.
    Outputs multi-file React project via files_ready SSE event.
    """
    start_time = time.monotonic()
    agents = _create_agents()
    agent_results: list[AgentStepResult] = []
    cumulative_cost = prior_cost
    total_steps = 5  # designer, architect, builder, reviewer

    try:
        # ── Designer (with UX Pro Max design intelligence) ──
        # Extract industry from planner output for design guidance
        design_intel = ""
        try:
            planner_json = json.loads(planner_output)
            industry = planner_json.get("industry", "other")
            intel_data = get_design_for_industry(industry)
            design_intel = json.dumps(intel_data, indent=2)
        except (json.JSONDecodeError, KeyError):
            pass

        yield format_sse(SSEEventType.AGENT_START, {
            "agent": "designer", "model": "mistral-small",
            "step": 2, "total_steps": total_steps,
        })
        t0 = time.monotonic()
        designer_response = await agents["designer"].run(
            format_designer_msg(planner_output, design_intel),
        )
        designer_step = AgentStepResult(
            agent_name="designer",
            model_used=designer_response.model_used,
            output=designer_response.output,
            cost_eur=designer_response.cost_eur,
            duration_s=round(time.monotonic() - t0, 2),
        )
        agent_results.append(designer_step)
        cumulative_cost += designer_step.cost_eur
        yield format_sse(SSEEventType.AGENT_COMPLETE, {
            "agent": "designer", "model": designer_step.model_used,
            "cost_eur": designer_step.cost_eur,
            "duration_s": designer_step.duration_s,
            "cumulative_cost_eur": round(cumulative_cost, 6),
        })
        logger.info(
            "Designer complete: cost=EUR%.4f duration=%.1fs",
            designer_step.cost_eur, designer_step.duration_s,
        )

        # ── Architect (NEW in v0.2) ──
        yield format_sse(SSEEventType.AGENT_START, {
            "agent": "architect", "model": "mistral-small",
            "step": 3, "total_steps": total_steps,
        })
        t0 = time.monotonic()
        architect_response = await agents["architect"].run(
            format_architect_msg(planner_output, designer_step.output),
        )
        architect_step = AgentStepResult(
            agent_name="architect",
            model_used=architect_response.model_used,
            output=architect_response.output,
            cost_eur=architect_response.cost_eur,
            duration_s=round(time.monotonic() - t0, 2),
        )
        agent_results.append(architect_step)
        cumulative_cost += architect_step.cost_eur
        yield format_sse(SSEEventType.AGENT_COMPLETE, {
            "agent": "architect", "model": architect_step.model_used,
            "cost_eur": architect_step.cost_eur,
            "duration_s": architect_step.duration_s,
            "cumulative_cost_eur": round(cumulative_cost, 6),
        })
        logger.info(
            "Architect complete: cost=EUR%.4f duration=%.1fs",
            architect_step.cost_eur, architect_step.duration_s,
        )

        # ── Builder (v0.2: multi-file JSON output) ──
        yield format_sse(SSEEventType.AGENT_START, {
            "agent": "builder", "model": "devstral-small",
            "step": 4, "total_steps": total_steps,
        })
        t0 = time.monotonic()
        builder_response = await agents["builder"].run(
            format_builder_msg(
                planner_output,
                designer_step.output,
                architect_step.output,
            ),
        )
        builder_step = AgentStepResult(
            agent_name="builder",
            model_used=builder_response.model_used,
            output=builder_response.output,
            cost_eur=builder_response.cost_eur,
            duration_s=round(time.monotonic() - t0, 2),
        )
        agent_results.append(builder_step)
        cumulative_cost += builder_step.cost_eur
        yield format_sse(SSEEventType.AGENT_COMPLETE, {
            "agent": "builder", "model": builder_step.model_used,
            "cost_eur": builder_step.cost_eur,
            "duration_s": builder_step.duration_s,
            "cumulative_cost_eur": round(cumulative_cost, 6),
        })
        logger.info(
            "Builder complete: cost=EUR%.4f duration=%.1fs",
            builder_step.cost_eur, builder_step.duration_s,
        )

        # Parse files from Builder output (file-tag or JSON format)
        files = _extract_files(builder_step.output)
        if files:
            # Stream files one-by-one → frontend writes each to WC → HMR
            ordered = sorted(files.keys(), key=lambda p: (
                0 if p == "package.json" else
                1 if p in ("vite.config.ts", "tailwind.config.ts",
                           "postcss.config.js", "tsconfig.json") else
                2 if p == "src/index.css" else
                3 if p.startswith("src/lib/") else
                4 if p.startswith("src/components/ui/") else
                5 if p == "src/main.tsx" else
                6 if p.startswith("src/sections/") else
                7  # App.tsx last
            ))
            for path in ordered:
                yield format_sse("file_chunk", {
                    "path": path,
                    "content": files[path],
                })
            # Add ARKHOS.md project memory for iterations
            files["ARKHOS.md"] = _build_arkhos_md(
                prompt=planner_output,
                planner_output=planner_output,
                designer_output=designer_step.output,
                architect_output=architect_step.output,
            )
            # Emit files_ready for zip download
            yield format_sse("files_ready", {
                "files": files,
                "file_count": len(files),
            })
            logger.info("Streamed %d files via file_chunk", len(files))
        else:
            # Fallback: treat entire output as single HTML (v0.1 compat)
            logger.warning("No files parsed, falling back to HTML mode")
            yield format_sse(SSEEventType.PREVIEW_READY, {
                "html": builder_step.output, "stage": "pre_review",
            })

        # ── Reviewer ──
        yield format_sse(SSEEventType.AGENT_START, {
            "agent": "reviewer", "model": "mistral-small",
            "step": 5, "total_steps": total_steps,
        })
        t0 = time.monotonic()
        reviewer_response = await agents["reviewer"].run(
            format_reviewer_msg(builder_step.output, planner_output),
        )
        reviewer_step = AgentStepResult(
            agent_name="reviewer",
            model_used=reviewer_response.model_used,
            output=reviewer_response.output,
            cost_eur=reviewer_response.cost_eur,
            duration_s=round(time.monotonic() - t0, 2),
        )
        agent_results.append(reviewer_step)
        cumulative_cost += reviewer_step.cost_eur
        yield format_sse(SSEEventType.AGENT_COMPLETE, {
            "agent": "reviewer", "model": reviewer_step.model_used,
            "cost_eur": reviewer_step.cost_eur,
            "duration_s": reviewer_step.duration_s,
            "cumulative_cost_eur": round(cumulative_cost, 6),
        })
        logger.info(
            "Reviewer complete: cost=EUR%.4f duration=%.1fs",
            reviewer_step.cost_eur, reviewer_step.duration_s,
        )

        # If reviewer fixed files, emit updated files_ready
        reviewer_files = _extract_files(reviewer_step.output)
        if reviewer_files:
            yield format_sse("files_ready", {
                "files": reviewer_files,
                "file_count": len(reviewer_files),
                "stage": "final",
            })
        elif not files:
            # v0.1 compat: treat reviewer output as HTML
            yield format_sse(SSEEventType.PREVIEW_READY, {
                "html": reviewer_step.output, "stage": "final",
            })

        total_duration = round(time.monotonic() - start_time, 2)
        yield format_sse(SSEEventType.GENERATION_COMPLETE, {
            "total_cost_eur": round(cumulative_cost, 6),
            "total_duration_s": total_duration,
            "models_used": [r.model_used for r in agent_results],
            "success": True,
        })
        logger.info(
            "Build complete: cost=EUR%.4f duration=%.1fs",
            cumulative_cost, total_duration,
        )

    except Exception as exc:
        logger.exception("Build phase failed: %s", exc)
        error_type, error_msg = _classify_error(exc)
        yield format_sse(SSEEventType.ERROR, {
            "error": error_msg,
            "error_type": error_type,
            "agent": agent_results[-1].agent_name if agent_results else "unknown",
        })


async def run_pipeline(prompt: str, locale: str = "en") -> PipelineResult:
    """Run the pipeline and collect results (non-streaming version).

    Useful for testing and the /api/result endpoint.
    Internally consumes the streaming generator.
    """
    result = PipelineResult(html="")
    start_time = time.monotonic()

    async for _sse_event in run_pipeline_streaming(prompt, locale):
        pass

    result.total_duration_s = round(time.monotonic() - start_time, 2)
    return result
