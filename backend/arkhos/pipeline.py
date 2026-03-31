"""ArkhosAI 4-agent website generation pipeline with SSE streaming.

Manual agent orchestration for per-agent SSE events.
Planner → Designer → Builder → Reviewer

Uses Agent.run(input_text) directly (not Pipeline.run()) so we can
emit SSE events between each agent step.

Tramontane API (v0.1.4):
- Agent.run(input_text) — system prompt auto-built from role/goal/backstory
- AgentResult: .output, .model_used, .cost_eur, .duration_seconds
"""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass, field
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from collections.abc import AsyncGenerator

from tramontane import Agent

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
    """Create the 4 pipeline agents.

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
        "builder": Agent(
            role="Frontend Builder",
            goal="Generate production-quality HTML/CSS/JS",
            backstory=BUILDER_PROMPT,
            model="devstral-small",
            budget_eur=0.02,
        ),
        "reviewer": Agent(
            role="Code Reviewer",
            goal="Validate HTML quality, accessibility, and spec compliance",
            backstory=REVIEWER_PROMPT,
            model="mistral-small",
            budget_eur=0.01,
        ),
    }


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
            "total_steps": 4,
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
            "total_steps": 4,
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
            "total_steps": 4,
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
            "total_steps": 4,
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
            "total_steps": 4,
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
    """Run Designer + Builder + Reviewer using the approved plan.

    Called after user approves the planner output.
    """
    start_time = time.monotonic()
    agents = _create_agents()
    agent_results: list[AgentStepResult] = []
    cumulative_cost = prior_cost

    try:
        # ── Designer ──
        yield format_sse(SSEEventType.AGENT_START, {
            "agent": "designer", "model": "mistral-small",
            "step": 2, "total_steps": 4,
        })
        t0 = time.monotonic()
        designer_response = await agents["designer"].run(
            format_designer_msg(planner_output),
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

        # ── Builder ──
        yield format_sse(SSEEventType.AGENT_START, {
            "agent": "builder", "model": "devstral-small",
            "step": 3, "total_steps": 4,
        })
        t0 = time.monotonic()
        builder_response = await agents["builder"].run(
            format_builder_msg(planner_output, designer_step.output),
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
        yield format_sse(SSEEventType.PREVIEW_READY, {
            "html": builder_step.output, "stage": "pre_review",
        })

        # ── Reviewer ──
        yield format_sse(SSEEventType.AGENT_START, {
            "agent": "reviewer", "model": "mistral-small",
            "step": 4, "total_steps": 4,
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
