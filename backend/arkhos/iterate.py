"""Iteration endpoint — single Builder agent call to modify existing HTML."""

from __future__ import annotations

import logging
import time
from typing import TYPE_CHECKING

from tramontane import Agent

if TYPE_CHECKING:
    from collections.abc import AsyncGenerator

from arkhos.sse import SSEEventType, format_sse

logger = logging.getLogger(__name__)

ITERATE_SYSTEM_PROMPT = """\
You are an expert React frontend developer. You will receive an existing single-file
React HTML page and a modification request from the user. Your job is to apply the
requested changes and return the COMPLETE modified HTML file.

RULES:
- Apply ONLY the changes the user requested
- Keep all existing React components, Tailwind classes, GSAP animations intact
- Maintain the CDN imports (React, Babel, Tailwind, GSAP, Lucide)
- Tailwind config uses tailwind.config (NOT tailwindcss.config)
- Icons use lucide vanilla (lucide.icons[name]), NOT lucide-react
- Maintain the component library (Button, Card, Badge, Input, Icon, etc.)
- Keep responsive design and mobile menu
- Keep Unsplash image URLs (don't replace with placeholder services)
- The current year is 2026. All dates must use 2026.
- Output ONLY the complete modified HTML document
- No markdown fences, no explanation — just the HTML
"""


async def run_iteration(
    current_html: str,
    modification_request: str,
    original_spec: str = "",
) -> AsyncGenerator[str, None]:
    """Run a single Builder agent call to modify existing HTML.

    Args:
        current_html: The current HTML to modify.
        modification_request: What the user wants to change.
        original_spec: The original Planner spec (for context).

    Yields:
        SSE-formatted strings.
    """
    builder = Agent(
        role="Frontend Builder",
        goal="Modify an existing HTML page based on user feedback",
        backstory=ITERATE_SYSTEM_PROMPT,
        model="devstral-small",
        budget_eur=0.01,
    )

    input_text = (
        f"## MODIFICATION REQUEST\n{modification_request}\n\n"
        f"## CURRENT HTML\n{current_html}"
    )
    if original_spec:
        input_text = (
            f"## MODIFICATION REQUEST\n{modification_request}\n\n"
            f"## ORIGINAL SPECIFICATION\n{original_spec}\n\n"
            f"## CURRENT HTML\n{current_html}"
        )

    yield format_sse(SSEEventType.AGENT_START, {
        "agent": "builder",
        "model": "devstral-small",
        "step": 1,
        "total_steps": 1,
    })

    t0 = time.monotonic()
    response = await builder.run(input_text)
    duration = round(time.monotonic() - t0, 2)
    cost = response.cost_eur

    yield format_sse(SSEEventType.AGENT_COMPLETE, {
        "agent": "builder",
        "model": response.model_used,
        "cost_eur": cost,
        "duration_s": duration,
        "cumulative_cost_eur": cost,
    })

    yield format_sse(SSEEventType.PREVIEW_READY, {
        "html": response.output,
        "stage": "final",
    })

    yield format_sse(SSEEventType.GENERATION_COMPLETE, {
        "total_cost_eur": cost,
        "total_duration_s": duration,
        "models_used": [response.model_used],
        "success": True,
    })

    logger.info("Iteration complete: cost=EUR%.4f duration=%.1fs", cost, duration)
