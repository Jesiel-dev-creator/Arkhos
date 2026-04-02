"""Iteration — single Builder call to modify specific files in a React project."""

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
You are an expert React/TypeScript developer. You receive specific files from
an existing React project and a modification request. Apply ONLY the requested
changes and return the modified files using <file> tags.

OUTPUT FORMAT — same as initial generation:
<file path="src/sections/Hero.tsx">
{complete modified file content}
</file>

RULES:
- Output ONLY the files you changed — not unchanged files
- Keep all shadcn/ui imports from @/components/ui/* (pre-installed)
- Keep Tailwind classes, Framer Motion, Lucide React icons
- Maintain responsive design
- Use exact same design system colors/fonts unless asked to change
- NEVER remove sections unless explicitly asked
- Output each file completely with closing </file> tag
- No markdown fences, no explanation — just <file> tags
"""


def _get_relevant_files(
    change_request: str, all_files: dict[str, str]
) -> dict[str, str]:
    """Return only files relevant to the change request.

    Always includes: ARKHOS.md, tailwind.config.ts, src/index.css
    Keyword-based: if "hero" in request → include Hero.tsx
    """
    always_include = {"ARKHOS.md", "tailwind.config.ts", "src/index.css"}
    relevant: dict[str, str] = {
        k: v for k, v in all_files.items() if k in always_include
    }

    req_lower = change_request.lower()

    # Match section names mentioned in the request
    for path, content in all_files.items():
        if not path.startswith("src/sections/"):
            continue
        section_name = (
            path.split("/")[-1].replace(".tsx", "").lower()
        )
        if section_name in req_lower:
            relevant[path] = content

    # Global style changes → include all sections
    global_keywords = [
        "color", "font", "style", "dark", "light", "theme",
        "all", "every", "entire", "whole",
    ]
    if any(kw in req_lower for kw in global_keywords):
        relevant.update({
            k: v
            for k, v in all_files.items()
            if k.startswith("src/sections/")
        })

    # If nothing matched, include all sections (broad change)
    section_count = sum(
        1 for k in relevant if k.startswith("src/sections/")
    )
    if section_count == 0:
        relevant.update({
            k: v
            for k, v in all_files.items()
            if k.startswith("src/sections/")
        })

    return relevant


async def run_iteration(
    modification_request: str,
    all_files: dict[str, str] | None = None,
    current_html: str = "",
) -> AsyncGenerator[str, None]:
    """Run a single Builder call to modify an existing project.

    Args:
        modification_request: What the user wants to change.
        all_files: The full project files dict (v0.2 mode).
        current_html: The current HTML string (v0.1 fallback).

    Yields:
        SSE-formatted strings.
    """
    builder = Agent(
        role="Frontend Builder",
        goal="Modify existing React project files based on user feedback",
        backstory=ITERATE_SYSTEM_PROMPT,
        model="devstral-small",
        budget_eur=0.08,
    )

    # v0.2: smart file selection
    if all_files and len(all_files) > 3:
        relevant = _get_relevant_files(modification_request, all_files)
        arkhos_md = all_files.get("ARKHOS.md", "")

        file_context = "\n\n".join(
            f"--- {path} ---\n{content}"
            for path, content in relevant.items()
            if path != "ARKHOS.md"
        )
        input_text = (
            f"## PROJECT MEMORY\n{arkhos_md}\n\n"
            f"## CHANGE REQUEST\n{modification_request}\n\n"
            f"## RELEVANT FILES\n{file_context}\n\n"
            f"Output only the files you changed using <file> tags."
        )
        logger.info(
            "Iteration: sending %d/%d files to Builder",
            len(relevant),
            len(all_files),
        )
    else:
        # v0.1 fallback: single HTML
        input_text = (
            f"## MODIFICATION REQUEST\n{modification_request}\n\n"
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

    # Parse modified files from response
    if all_files and len(all_files) > 3:
        from arkhos.pipeline import _parse_file_tags

        changed_files = _parse_file_tags(response.output)
        if changed_files:
            for path, content in changed_files.items():
                yield format_sse("file_chunk", {
                    "path": path,
                    "content": content,
                })
            # Merge changed files into full project for zip
            merged = {**all_files, **changed_files}
            yield format_sse("files_ready", {
                "files": merged,
                "file_count": len(merged),
            })
            logger.info(
                "Iteration modified %d files", len(changed_files)
            )
        else:
            # Fallback: treat as HTML
            yield format_sse(SSEEventType.PREVIEW_READY, {
                "html": response.output,
                "stage": "final",
            })
    else:
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
