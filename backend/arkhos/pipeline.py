"""ArkhosAI 5-agent website generation pipeline with SSE streaming.

Manual agent orchestration for per-agent SSE events.
v0.2: Planner → Designer → Architect → Builder → Reviewer
v0.3: Fleet profiles (Budget/Balanced/Quality) + adaptive budget reallocation

Tramontane v0.2.0:
- Agent.run_stream() with on_pattern callbacks
- validate_output for auto-retry on short Builder output
- RunContext for shared cost tracking
- routing_hint to guide auto-router
- temperature control
- Per-model max_tokens defaults
"""

from __future__ import annotations

import asyncio
import json
import logging
import re
import time
from dataclasses import dataclass, field
from enum import StrEnum
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from collections.abc import AsyncGenerator

from tramontane import Agent, MistralRouter, ParallelGroup, RunContext

from arkhos.data.design_intelligence import get_design_for_industry
from arkhos.generation import SandboxExecutor
from arkhos.integrations.magic_mcp import coordinate_agents, fetch_inspiration
from arkhos.intelligence import (
    get_relevant_skills,
    recall_context,
    record_agent_experience,
    record_generation_experience,
)
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
from arkhos.templates import get_builder_context

logger = logging.getLogger(__name__)


# ── Fleet Profiles ────────────────────────────────────────────────


class FleetProfile(StrEnum):
    """User-selectable generation quality tier."""

    BUDGET = "budget"
    BALANCED = "balanced"
    QUALITY = "quality"


@dataclass
class ProfileConfig:
    """Model and budget configuration for a fleet profile."""

    total_budget_eur: float
    planner_model: str
    designer_model: str
    architect_model: str
    builder_model: str
    reviewer_model: str
    builder_temp: float
    label: str
    est_cost: str
    est_time: str


PROFILES: dict[FleetProfile, ProfileConfig] = {
    FleetProfile.BUDGET: ProfileConfig(
        total_budget_eur=0.01,
        planner_model="ministral-3b",
        designer_model="ministral-7b",
        architect_model="ministral-7b",
        builder_model="devstral-small",
        reviewer_model="ministral-7b",
        builder_temp=0.2,
        label="Budget",
        est_cost="~€0.004",
        est_time="~25s",
    ),
    FleetProfile.BALANCED: ProfileConfig(
        total_budget_eur=0.05,
        planner_model="mistral-small",
        designer_model="mistral-small",
        architect_model="mistral-small",
        builder_model="devstral-small",
        reviewer_model="mistral-small",
        builder_temp=0.2,
        label="Balanced",
        est_cost="~€0.006",
        est_time="~40s",
    ),
    FleetProfile.QUALITY: ProfileConfig(
        total_budget_eur=0.10,
        planner_model="mistral-small",
        designer_model="mistral-small",
        architect_model="mistral-small",
        builder_model="devstral-2",
        reviewer_model="magistral-small",
        builder_temp=0.15,
        label="Quality",
        est_cost="~€0.020",
        est_time="~90s",
    ),
}


# ── Adaptive Budget Manager ──────────────────────────────────────


class AdaptiveBudgetManager:
    """Tracks per-agent spend and redistributes unspent budget to Builder.

    Builder always gets leftover budget from Planner, Designer, Architect.
    Reviewer gets a fixed floor — never starved.
    """

    def __init__(self, total: float, fixed: bool = False) -> None:
        self.total = total
        self.fixed = fixed
        self.spent: dict[str, float] = {}
        self._allocations: dict[str, float] = {}

    def allocate(self, agent: str, amount: float) -> float:
        """Reserve budget for an agent. Returns actual allocation."""
        self._allocations[agent] = amount
        return amount

    def record_spend(self, agent: str, actual_spend: float) -> None:
        """Record what an agent actually spent."""
        self.spent[agent] = actual_spend

    def builder_budget(self, base: float) -> float:
        """Return how much Builder can spend (base + unspent from prior agents)."""
        if self.fixed:
            return base
        pre_builder = ["planner", "designer", "architect"]
        unspent = sum(
            max(0.0, self._allocations.get(a, 0) - self.spent.get(a, 0))
            for a in pre_builder
        )
        return min(base + unspent, self.total * 0.65)

    @property
    def total_spent(self) -> float:
        """Total EUR spent across all agents."""
        return sum(self.spent.values())

    @property
    def remaining(self) -> float:
        """Budget remaining."""
        return self.total - self.total_spent


# Pre-compiled regex for streaming file extraction (used in run_stream loop)
_FILE_TAG_RE = re.compile(
    r'<file\s+path=["\']([^"\']+)["\']\s*>(.*?)</file>',
    re.DOTALL,
)


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


async def _run_agent_task(
    agent: Agent,
    agent_name: str,
    input_text: str,
    router: MistralRouter,
    run_ctx: RunContext,
) -> AgentStepResult:
    """Run a single agent and return its result. Used by asyncio.gather."""
    t0 = time.monotonic()
    response = await agent.run(input_text, router=router, run_context=run_ctx)
    return AgentStepResult(
        agent_name=agent_name,
        model_used=response.model_used,
        output=response.output,
        cost_eur=response.cost_eur,
        duration_s=round(time.monotonic() - t0, 2),
    )


def _create_agents(
    cfg: ProfileConfig | None = None,
    budget_mgr: AdaptiveBudgetManager | None = None,
    prompt: str = "",
) -> dict[str, Agent]:
    """Create the 5 pipeline agents with profile-aware models and budgets.

    Args:
        cfg: Fleet profile config. Falls back to BALANCED if None.
        budget_mgr: Adaptive budget manager for allocation tracking.
        prompt: User prompt for smart skill injection via relevance matching.
    """
    if cfg is None:
        cfg = PROFILES[FleetProfile.BALANCED]

    total = cfg.total_budget_eur

    # Allocate budget percentages per spec
    planner_budget = total * 0.08
    designer_budget = total * 0.20
    architect_budget = total * 0.20
    builder_budget = total * 0.40
    reviewer_budget = total * 0.12

    if budget_mgr:
        budget_mgr.allocate("planner", planner_budget)
        budget_mgr.allocate("designer", designer_budget)
        budget_mgr.allocate("architect", architect_budget)
        # Builder allocation deferred — uses builder_budget() at runtime
        budget_mgr.allocate("reviewer", reviewer_budget)

    # Smart skill injection: only relevant skills per role + prompt
    registry = _get_skills()
    designer_skills = get_relevant_skills(registry, "designer", prompt)
    builder_skills = get_relevant_skills(registry, "builder", prompt)
    reviewer_skills = get_relevant_skills(registry, "reviewer", prompt)

    return {
        "planner": Agent(
            role="Landing Page Planner",
            goal="Convert natural language descriptions into structured page specs",
            backstory=PLANNER_PROMPT,
            model=cfg.planner_model,
            budget_eur=planner_budget,
            temperature=0.1,
            gdpr_level="standard",
            audit_actions=True,
        ),
        "designer": Agent(
            role="Visual Designer",
            goal="Create cohesive design systems for landing pages",
            backstory=DESIGNER_PROMPT + "\n\n## DESIGN SKILLS\n" + designer_skills,
            model=cfg.designer_model,
            budget_eur=designer_budget,
            audit_actions=True,
        ),
        "architect": Agent(
            role="React Project Architect",
            goal="Design optimal React component structure for landing pages",
            backstory=ARCHITECT_PROMPT,
            model=cfg.architect_model,
            budget_eur=architect_budget,
            temperature=0.1,
            audit_actions=True,
        ),
        "builder": Agent(
            role="Frontend Builder",
            goal="Generate complete multi-file React projects with shadcn/ui",
            backstory=BUILDER_PROMPT + "\n\n## BUILDER SKILLS\n" + builder_skills,
            model=cfg.builder_model,
            budget_eur=builder_budget,
            temperature=cfg.builder_temp,
            validate_output=lambda result: len(re.findall(r"</file>", result.output)) >= 5,
            audit_actions=True,
        ),
        "reviewer": Agent(
            role="Code Reviewer",
            goal="Validate React project quality, shadcn/ui usage, and spec compliance",
            backstory=REVIEWER_PROMPT + "\n\n## REVIEWER SKILLS\n" + reviewer_skills,
            model=cfg.reviewer_model,
            budget_eur=reviewer_budget,
            temperature=0.0,
            audit_actions=True,
        ),
    }


def _get_router() -> MistralRouter:
    """Get the app-level router singleton (with telemetry)."""
    from arkhos.app import mistral_router
    return mistral_router


def _get_memory() -> Any:
    """Get the app-level TramontaneMemory singleton."""
    from arkhos.app import memory
    return memory


def _get_skills() -> dict[str, Any]:
    """Get the app-level skill registry."""
    from arkhos.app import skill_registry
    return skill_registry


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


def _emission_order(path: str) -> int:
    """Sort key for streaming files to WebContainers in optimal order."""
    if path == "package.json":
        return 0
    if path in (
        "vite.config.ts", "tailwind.config.ts",
        "postcss.config.js", "tsconfig.json", "index.html",
    ):
        return 1
    if path.startswith("src/lib/"):
        return 2
    if path.startswith("src/components/ui/"):
        return 3
    if path in ("src/index.css", "src/main.tsx"):
        return 4
    if path == "src/sections/Navbar.tsx":
        return 5
    if path.startswith("src/sections/") and "Footer" not in path:
        return 6
    if "Footer" in path:
        return 7
    if path == "src/App.tsx":
        return 8
    return 9


# Invalid lucide-react icons the Builder frequently hallucinates
_ICON_REPLACEMENTS = {
    "Baguette": "Utensils",
    "Croissant": "Coffee",
    "Cheese": "Utensils",
    "Herb": "Leaf",
    "ForkKnife": "Utensils",
    "WineGlass": "Wine",
    "Stove": "Flame",
    "Bowl": "Soup",
    "CloudSync": "Cloud",
    "Bread": "Utensils",
    "Pastry": "Cake",
    "Oven": "Flame",
    "Wheat": "Leaf",
    "Mixer": "Settings",
    "Donut": "Cake",
    "Muffin": "Cake",
    "Pie": "Cake",
    "Spoon": "Utensils",
    "Fork": "Utensils",
    "Knife": "Utensils",
    "Pan": "Flame",
    "Pot": "CookingPot",
    "Grill": "Flame",
}


def _sanitize_icons(content: str) -> str:
    """Replace hallucinated lucide-react icon names with valid alternatives."""
    for bad, good in _ICON_REPLACEMENTS.items():
        if bad in content:
            content = content.replace(bad, good)
            logger.info("Icon fix: %s → %s", bad, good)
    return content


def _sanitize_iframes(content: str) -> str:
    """Remove iframe tags (Google Maps, etc.) that are blocked by COEP."""
    if "<iframe" not in content:
        return content
    # Replace iframe with a styled placeholder
    content = re.sub(
        r'<iframe[^>]*>.*?</iframe>',
        '<div className="rounded-xl bg-muted/30 border p-8 text-center">'
        '<MapPin className="h-8 w-8 text-primary mx-auto mb-2" />'
        '<p className="text-sm text-muted-foreground">Visit us at our location</p>'
        '</div>',
        content,
        flags=re.DOTALL,
    )
    # Also catch self-closing iframes
    content = re.sub(
        r'<iframe[^>]*/?>',
        '<div className="rounded-xl bg-muted/30 border p-8 text-center">'
        '<p className="text-sm text-muted-foreground">Visit us at our location</p>'
        '</div>',
        content,
    )
    logger.info("Removed iframe(s) from generated code")
    return content


# All valid lucide-react icons we allow
_VALID_ICONS = {
    "Menu", "X", "ArrowRight", "ArrowLeft", "Star", "Check", "ChevronDown",
    "ChevronRight", "ChevronUp", "ChevronLeft", "Phone", "Mail", "MapPin",
    "Clock", "Heart", "Share2", "Search", "Home", "User", "Users", "Settings",
    "Shield", "Zap", "Eye", "Download", "Upload", "ExternalLink", "Github",
    "Twitter", "Linkedin", "Instagram", "Facebook", "Send", "MessageSquare",
    "Calendar", "CreditCard", "ShoppingCart", "Package", "Globe", "Lock",
    "Unlock", "Award", "TrendingUp", "BarChart3", "PieChart", "Code",
    "Terminal", "Database", "Cloud", "Server", "Wifi", "Play", "Pause",
    "Plus", "Minus", "Edit", "Trash2", "Copy", "Clipboard", "Bookmark",
    "Flag", "Bell", "AlertTriangle", "Info", "HelpCircle", "CheckCircle",
    "XCircle", "Coffee", "Utensils", "Pizza", "Cake", "Wine", "Music",
    "Camera", "Image", "Sun", "Moon", "Sparkles", "Target", "Layers",
    "Grid", "Layout", "Palette", "Leaf", "Flame", "Droplets", "Mountain",
    "TreePine", "Flower2", "HandPlatter", "CookingPot", "Salad", "Sandwich",
    "IceCream", "Soup", "Building", "Store", "Briefcase", "GraduationCap",
    "Stethoscope", "Hammer", "Truck", "Car", "Plane", "Ship", "Bike",
    "MapPinned", "Navigation", "Route",
}


def _fix_missing_imports(content: str) -> str:
    """Scan JSX for icon/component usage and add missing lucide imports."""
    # Find existing lucide import line
    import_match = re.search(
        r'import\s*\{([^}]+)\}\s*from\s*["\']lucide-react["\']',
        content,
    )
    existing_icons: set[str] = set()
    if import_match:
        existing_icons = {i.strip() for i in import_match.group(1).split(",")}

    # Scan JSX for <IconName usage (capitalized, in JSX context)
    used_in_jsx = set(re.findall(r'<(\w+)\s', content))

    # Find icons used but not imported
    missing = set()
    for name in used_in_jsx:
        if name in _VALID_ICONS and name not in existing_icons:
            missing.add(name)

    if not missing:
        return content

    if import_match:
        # Add missing icons to existing import
        all_icons = sorted(existing_icons | missing)
        new_import = f'import {{ {", ".join(all_icons)} }} from "lucide-react"'
        content = content[:import_match.start()] + new_import + content[import_match.end():]
    else:
        # No lucide import exists — add one after the first import line
        first_import_end = content.find("\n", content.find("import "))
        if first_import_end > 0:
            new_import = f'\nimport {{ {", ".join(sorted(missing))} }} from "lucide-react"'
            content = content[:first_import_end] + new_import + content[first_import_end:]

    logger.info("Auto-imported missing icons: %s", missing)
    return content


def _build_app_tsx(
    files: dict[str, str],
    section_order: list[str] | None = None,
) -> str:
    """Generate App.tsx using Architect section order, not alphabetical.

    Always places Navbar first and Footer last if they exist,
    regardless of whether the Architect listed them.
    """
    available = {
        path.replace("src/sections/", "").replace(".tsx", "")
        for path in files
        if path.startswith("src/sections/") and path.endswith(".tsx")
    }

    # Build the middle section list (everything except Navbar/Footer)
    if section_order:
        # Respect Architect order, only include files that were generated
        middle = [
            s for s in section_order
            if s in available and s not in ("Navbar", "Footer")
        ]
        # Append any generated sections not in blueprint (except Navbar/Footer)
        for s in sorted(available - set(middle) - {"Navbar", "Footer"}):
            middle.append(s)
    else:
        middle = sorted(available - {"Navbar", "Footer"})

    # Always: Navbar first → middle sections → Footer last
    ordered = (
        (["Navbar"] if "Navbar" in available else [])
        + middle
        + (["Footer"] if "Footer" in available else [])
    )

    imports = "\n".join(
        f'import {n} from "./sections/{n}"' for n in ordered
    )
    renders = "\n      ".join(f"<{n} />" for n in ordered)

    return (
        'import React from "react"\n'
        f"{imports}\n\n"
        "export default function App() {\n"
        "  return (\n"
        '    <div className="min-h-screen">\n'
        f"      {renders}\n"
        "    </div>\n"
        "  )\n"
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
    profile: FleetProfile = FleetProfile.BALANCED,
) -> AsyncGenerator[str, None]:
    """Run the 4-agent pipeline, yielding SSE events as each agent completes.

    Each agent runs in sequence and SSE events are yielded between them
    so the frontend can show real-time progress.

    Args:
        prompt: User's natural language website description.
        locale: Default locale for the generated site.
        profile: Fleet quality profile.

    Yields:
        SSE-formatted strings (ready to send via StreamingResponse).
    """
    cfg = PROFILES[profile]
    start_time = time.monotonic()
    agents = _create_agents(cfg)
    agent_results: list[AgentStepResult] = []
    cumulative_cost = 0.0

    try:
        # ── Agent 1: Planner ──────────────────────────────────
        yield format_sse(SSEEventType.AGENT_START, {
            "agent": "planner",
            "model": agents["planner"].model,
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
            "model": agents["designer"].model,
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
            "model": agents["builder"].model,
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
            "model": agents["reviewer"].model,
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


async def run_pipeline_streaming_mcp(
    prompt: str,
    locale: str = "en",
    profile: FleetProfile = FleetProfile.BALANCED,
) -> AsyncGenerator[str, None]:
    """Full pipeline with parallel agent execution — no approval pause.

    Flow:
      Phase 1: Planner (sequential — needs prompt)
      Phase 2: Designer + Architect + MCP inspiration fetch (parallel)
      Phase 3: Builder with streaming file output (sequential — needs phase 2)
      Phase 4: Reviewer (sequential — needs builder output)
      Phase 5: Sandbox preview (optional)

    Yields SSE events for real-time frontend updates.
    """
    cfg = PROFILES[profile]
    budget_mgr = AdaptiveBudgetManager(total=cfg.total_budget_eur)
    start_time = time.monotonic()
    agents = _create_agents(cfg, budget_mgr, prompt)
    agent_results: list[AgentStepResult] = []
    cumulative_cost = 0.0
    total_steps = 5

    try:
        yield format_sse("pipeline_start", {
            "profile": profile.value,
            "label": cfg.label,
            "est_cost": cfg.est_cost,
            "est_time": cfg.est_time,
            "total_budget": cfg.total_budget_eur,
            "parallel_mode": True,
        })

        run_ctx = RunContext(budget_eur=cfg.total_budget_eur, reallocation="adaptive")
        mem = _get_memory()
        router = _get_router()
        registry = _get_skills()

        # ── Phase 1: Planner ──────────────────────────────────────
        yield format_sse(SSEEventType.AGENT_START, {
            "agent": "planner", "model": agents["planner"].model,
            "step": 1, "total_steps": total_steps,
        })

        t0 = time.monotonic()
        planner_skills = get_relevant_skills(registry, "planner", prompt)
        memory_ctx = await recall_context(mem, "planner", prompt)
        planner_input = (
            format_planner_msg(prompt, locale)
            + "\n\n## PLANNING SKILLS\n" + planner_skills
        )
        if memory_ctx:
            planner_input += "\n\n" + memory_ctx

        planner_response = await agents["planner"].run(
            planner_input, router=router, run_context=run_ctx,
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
        budget_mgr.record_spend("planner", planner_step.cost_eur)

        yield format_sse(SSEEventType.AGENT_COMPLETE, {
            "agent": "planner", "model": planner_step.model_used,
            "cost_eur": planner_step.cost_eur,
            "duration_s": planner_step.duration_s,
            "cumulative_cost_eur": round(cumulative_cost, 6),
        })
        await record_agent_experience(
            mem, "planner", prompt[:100], planner_step.output[:200],
            planner_step.model_used, planner_step.cost_eur,
        )

        planner_output = planner_step.output

        # ── Phase 2: Designer + Architect + MCP inspiration (PARALLEL) ──
        yield format_sse(SSEEventType.AGENT_START, {
            "agent": "designer", "model": agents["designer"].model,
            "step": 2, "total_steps": total_steps,
        })
        yield format_sse(SSEEventType.AGENT_START, {
            "agent": "architect", "model": agents["architect"].model,
            "step": 3, "total_steps": total_steps,
        })

        t0 = time.monotonic()
        design_intel = get_design_for_industry(planner_output)
        designer_memory = await recall_context(mem, "designer", planner_output)
        builder_memory = await recall_context(mem, "builder", planner_output)

        designer_input = (
            format_designer_msg(planner_output, design_intel)
            + ("\n\n" + designer_memory if designer_memory else "")
        )
        architect_input = format_architect_msg(planner_output, planner_output)

        # Fetch 21st.dev MCP inspiration in parallel with agents
        async def _fetch_mcp_inspiration() -> str:
            try:
                from arkhos.integrations.magic_mcp import fetch_inspiration
                result = await fetch_inspiration(planner_output[:200])
                if result:
                    logger.info("MCP: fetched design inspiration (%d chars)", len(result))
                return result
            except Exception as e:
                logger.debug("MCP inspiration unavailable: %s", e)
                return ""

        # Run all three in parallel
        designer_result, architect_result, mcp_inspiration = await asyncio.gather(
            _run_agent_task(agents["designer"], "designer", designer_input, router, run_ctx),
            _run_agent_task(agents["architect"], "architect", architect_input, router, run_ctx),
            _fetch_mcp_inspiration(),
        )

        parallel_duration = round(time.monotonic() - t0, 2)
        designer_step = AgentStepResult(
            agent_name="designer",
            model_used=designer_result.model_used,
            output=designer_result.output,
            cost_eur=designer_result.cost_eur,
            duration_s=parallel_duration,
        )
        architect_step = AgentStepResult(
            agent_name="architect",
            model_used=architect_result.model_used,
            output=architect_result.output,
            cost_eur=architect_result.cost_eur,
            duration_s=parallel_duration,
        )
        agent_results.extend([designer_step, architect_step])
        cumulative_cost += designer_step.cost_eur + architect_step.cost_eur
        budget_mgr.record_spend("designer", designer_step.cost_eur)
        budget_mgr.record_spend("architect", architect_step.cost_eur)

        yield format_sse(SSEEventType.AGENT_COMPLETE, {
            "agent": "designer", "model": designer_step.model_used,
            "cost_eur": designer_step.cost_eur,
            "duration_s": designer_step.duration_s,
            "cumulative_cost_eur": round(cumulative_cost, 6),
        })
        yield format_sse(SSEEventType.AGENT_COMPLETE, {
            "agent": "architect", "model": architect_step.model_used,
            "cost_eur": architect_step.cost_eur,
            "duration_s": architect_step.duration_s,
            "cumulative_cost_eur": round(cumulative_cost, 6),
        })

        await record_agent_experience(
            mem, "designer", planner_output[:100], designer_step.output[:200],
            designer_step.model_used, designer_step.cost_eur,
        )
        await record_agent_experience(
            mem, "architect", planner_output[:100], architect_step.output[:200],
            architect_step.model_used, architect_step.cost_eur,
        )

        logger.info(
            "Phase 2 complete (parallel): designer=%.1fs architect=%.1fs total=%.1fs mcp=%s",
            designer_step.duration_s, architect_step.duration_s,
            parallel_duration, "yes" if mcp_inspiration else "no",
        )

        # Extract section order from architect for App.tsx generation
        section_order: list[str] = []
        template_refs = ""
        try:
            arch_data = json.loads(architect_step.output)
            section_names = [s["name"] for s in arch_data.get("sections", [])]
            section_order = section_names
            template_refs = get_builder_context(section_names, max_templates=5)
        except (json.JSONDecodeError, KeyError, TypeError):
            pass

        # Inject MCP inspiration into builder context if available
        if mcp_inspiration:
            template_refs = (template_refs or "") + "\n\n## 21st.dev Inspiration\n" + mcp_inspiration

        # ── Sandbox: scaffold + dev server BEFORE Builder ─────────
        # Lovable-style: start the preview first, files hot-reload as they stream in
        sandbox_executor: SandboxExecutor | None = None
        sandbox_port: int | None = None
        try:
            from arkhos.app import port_manager
            gen_name = f"gen-{int(start_time)}"
            # user_id comes from request context — fallback to gen_name for now
            user_id = gen_name  # TODO: pass real user_id through pipeline
            sandbox_port = port_manager.allocate(gen_name, user_id)
            sandbox_executor = SandboxExecutor()
            scaffold_result = await sandbox_executor.scaffold_project(
                project_name=gen_name,
                port=sandbox_port,
            )
            if scaffold_result.get("success"):
                yield format_sse(SSEEventType.SANDBOX_START, {
                    "message": "Live preview ready — files will appear as they generate",
                    "preview_url": f"/api/preview/{gen_name}",
                })
                logger.info("Sandbox scaffold OK (%.2fs) — live streaming enabled",
                            scaffold_result.get("duration_s", 0))
            else:
                logger.warning("Sandbox scaffold failed: %s", scaffold_result.get("error"))
                if sandbox_port:
                    port_manager.release(gen_name)
                sandbox_executor = None
        except Exception as e:
            logger.warning("Sandbox unavailable, falling back to batch: %s", e)
            if sandbox_port:
                from arkhos.app import port_manager
                port_manager.release(f"gen-{int(start_time)}")
            sandbox_executor = None

        # ── Phase 3: Builder (streaming) ──────────────────────────
        builder_base = cfg.total_budget_eur * 0.40
        effective_builder_budget = budget_mgr.builder_budget(builder_base)
        agents["builder"].budget_eur = effective_builder_budget

        yield format_sse(SSEEventType.AGENT_START, {
            "agent": "builder", "model": agents["builder"].model,
            "step": 4, "total_steps": total_steps,
        })
        t0 = time.monotonic()

        builder_input = format_builder_msg(
            planner_output, designer_step.output,
            architect_step.output, template_refs,
        )
        if builder_memory:
            builder_input += "\n\n" + builder_memory

        # Stream tokens, extract files as </file> tags close
        full_output = ""
        streamed_files: dict[str, str] = {}
        last_emit_pos = 0
        builder_result = None

        async for event in agents["builder"].run_stream(
            builder_input, router=router, run_context=run_ctx,
        ):
            if event.type == "token":
                full_output += event.token
                new_region = full_output[last_emit_pos:]
                for match in _FILE_TAG_RE.finditer(new_region):
                    path = match.group(1).strip()
                    content = match.group(2)
                    if content.startswith("\n"):
                        content = content[1:]
                    if content.endswith("\n"):
                        content = content[:-1]
                    if path not in streamed_files:
                        if path.endswith(".tsx"):
                            content = _sanitize_icons(content)
                            content = _sanitize_iframes(content)
                            content = _fix_missing_imports(content)
                        streamed_files[path] = content
                        # Stream to frontend
                        yield format_sse("file_chunk", {
                            "path": path, "content": content,
                        })
                        # Stream to sandbox (Vite HMR hot-reloads)
                        if sandbox_executor:
                            await sandbox_executor.write_file(path, content)
                        if path == "src/index.css":
                            await asyncio.sleep(0.05)
                if new_region:
                    last_closed = new_region.rfind("</file>")
                    if last_closed >= 0:
                        last_emit_pos += last_closed + len("</file>")
            elif event.type == "complete" and event.result:
                builder_result = event.result
            elif event.type == "error":
                raise RuntimeError(f"Builder streaming error: {event.error}")

        final_output = builder_result.output if builder_result else full_output
        all_files = _parse_file_tags(final_output)

        for path, content in all_files.items():
            if path not in streamed_files:
                if path.endswith(".tsx"):
                    content = _sanitize_icons(content)
                streamed_files[path] = content
                yield format_sse("file_chunk", {"path": path, "content": content})

        files = {**all_files, **streamed_files}

        builder_cost = builder_result.cost_eur if builder_result else 0.0
        builder_model = builder_result.model_used if builder_result else agents["builder"].model
        builder_step = AgentStepResult(
            agent_name="builder",
            model_used=builder_model,
            output=full_output,
            cost_eur=builder_cost,
            duration_s=round(time.monotonic() - t0, 2),
        )
        agent_results.append(builder_step)
        cumulative_cost += builder_step.cost_eur
        budget_mgr.record_spend("builder", builder_step.cost_eur)

        yield format_sse(SSEEventType.AGENT_COMPLETE, {
            "agent": "builder", "model": builder_step.model_used,
            "cost_eur": builder_step.cost_eur,
            "duration_s": builder_step.duration_s,
            "cumulative_cost_eur": round(cumulative_cost, 6),
        })
        await record_agent_experience(
            mem, "builder", planner_output[:100],
            f"{len(files)} files generated",
            builder_step.model_used, builder_step.cost_eur,
        )

        if files:
            app_tsx = _build_app_tsx(files, section_order)
            files["src/App.tsx"] = app_tsx
            yield format_sse("file_chunk", {"path": "src/App.tsx", "content": app_tsx})
            if sandbox_executor:
                await sandbox_executor.write_file("src/App.tsx", app_tsx)

            files["ARKHOS.md"] = _build_arkhos_md(
                prompt=planner_output,
                planner_output=planner_output,
                designer_output=designer_step.output,
                architect_output=architect_step.output,
            )

            yield format_sse("files_ready", {
                "files": files, "file_count": len(files),
            })

            index_css = files.get("src/index.css", "")
            index_html = files.get("index.html", "")
            if index_css or index_html:
                fallback_html = (
                    "<!DOCTYPE html><html><head>"
                    "<meta charset='UTF-8'>"
                    "<meta name='viewport' content='width=device-width,initial-scale=1'>"
                    f"<style>{index_css}</style>"
                    "</head><body style='background:#020408;color:#fff;font-family:sans-serif;'>"
                    "<div style='text-align:center;padding:20vh 2rem'>"
                    "<p style='font-size:1.25rem;opacity:0.8'>Building your site...</p>"
                    "</div></body></html>"
                )
                yield format_sse(SSEEventType.PREVIEW_READY, {
                    "html": fallback_html, "stage": "pre_review",
                })

        # ── Phase 4: Reviewer ─────────────────────────────────────
        yield format_sse(SSEEventType.AGENT_START, {
            "agent": "reviewer", "model": agents["reviewer"].model,
            "step": 5, "total_steps": total_steps,
        })
        t0 = time.monotonic()
        reviewer_response = await agents["reviewer"].run(
            format_reviewer_msg(builder_step.output, planner_output),
            router=router, run_context=run_ctx,
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
        budget_mgr.record_spend("reviewer", reviewer_step.cost_eur)

        yield format_sse(SSEEventType.AGENT_COMPLETE, {
            "agent": "reviewer", "model": reviewer_step.model_used,
            "cost_eur": reviewer_step.cost_eur,
            "duration_s": reviewer_step.duration_s,
            "cumulative_cost_eur": round(cumulative_cost, 6),
        })

        # Apply reviewer fixes (also stream to sandbox)
        reviewer_files = _parse_file_tags(reviewer_step.output)
        if reviewer_files:
            for path, content in reviewer_files.items():
                files[path] = content
                yield format_sse("file_chunk", {"path": path, "content": content})
                if sandbox_executor:
                    await sandbox_executor.write_file(path, content)

        # ── Sandbox complete ──────────────────────────────────────
        if sandbox_executor:
            yield format_sse(SSEEventType.SANDBOX_COMPLETE, {
                "success": True,
                "preview_url": f"/api/preview/gen-{int(start_time)}",
                "stage": "running",
                "duration_s": round(time.monotonic() - start_time, 2),
            })
            await sandbox_executor.close()

        # ── Complete ──────────────────────────────────────────────
        total_duration = round(time.monotonic() - start_time, 2)
        yield format_sse(SSEEventType.GENERATION_COMPLETE, {
            "total_cost_eur": round(cumulative_cost, 6),
            "total_duration_s": total_duration,
            "models_used": [r.model_used for r in agent_results],
            "success": True,
            "parallel_mode": True,
            "sandbox_preview": f"/api/preview/gen-{int(start_time)}" if sandbox_executor else None,
        })

        await record_generation_experience(
            mem,
            prompt=planner_output[:200],
            profile=profile.value,
            total_cost=cumulative_cost,
            models_used=[r.model_used for r in agent_results],
            success=True,
            file_count=len(files) if files else 0,
            reviewer_summary=reviewer_step.output[:200],
        )

        logger.info(
            "MCP pipeline complete: cost=EUR%.4f duration=%.1fs (parallel phases)",
            cumulative_cost, total_duration,
        )

    except Exception as exc:
        logger.exception("MCP pipeline failed: %s", exc)
        error_type, error_msg = _classify_error(exc)
        yield format_sse(SSEEventType.ERROR, {
            "error": error_msg,
            "error_type": error_type,
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
    profile: FleetProfile = FleetProfile.BALANCED,
) -> AsyncGenerator[str, None]:
    """Run ONLY the Planner agent, yield plan_ready, then stop.

    The pipeline pauses here until the user approves the plan.
    """
    cfg = PROFILES[profile]
    agents = _create_agents(cfg)

    try:
        yield format_sse(SSEEventType.AGENT_START, {
            "agent": "planner",
            "model": agents["planner"].model,
            "step": 1,
            "total_steps": 5,
        })

        t0 = time.monotonic()
        registry = _get_skills()
        planner_skills = get_relevant_skills(registry, "planner", prompt)
        mem = _get_memory()
        memory_ctx = await recall_context(mem, "planner", prompt)
        planner_input = (
            format_planner_msg(prompt, locale)
            + "\n\n## PLANNING SKILLS\n"
            + planner_skills
        )
        if memory_ctx:
            planner_input += "\n\n" + memory_ctx
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

        await record_agent_experience(
            mem, "planner", prompt[:100], planner_step.output[:200],
            planner_step.model_used, planner_step.cost_eur,
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
    profile: FleetProfile = FleetProfile.BALANCED,
) -> AsyncGenerator[str, None]:
    """Run Designer → Architect → Builder → Reviewer (v0.2 pipeline).

    Called after user approves the planner output.
    Outputs multi-file React project via files_ready SSE event.
    """
    cfg = PROFILES[profile]
    budget_mgr = AdaptiveBudgetManager(total=cfg.total_budget_eur)
    start_time = time.monotonic()
    agents = _create_agents(cfg, budget_mgr)
    agent_results: list[AgentStepResult] = []
    cumulative_cost = prior_cost
    total_steps = 5  # designer, architect, builder, reviewer

    try:
        # Emit pipeline_start with profile info
        yield format_sse("pipeline_start", {
            "profile": profile.value,
            "label": cfg.label,
            "est_cost": cfg.est_cost,
            "est_time": cfg.est_time,
            "total_budget": cfg.total_budget_eur,
        })

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

        # v0.2.0: agents already have skills in backstory from _create_agents()
        # RunContext tracks cost across the chain automatically
        run_ctx = RunContext(budget_eur=cfg.total_budget_eur, reallocation="adaptive")
        mem = _get_memory()

        # Recall past experiences for Designer and Builder
        designer_memory = await recall_context(mem, "designer", planner_output)
        builder_memory = await recall_context(mem, "builder", planner_output)

        # ── Designer + Architect in PARALLEL (saves ~5-8s) ──
        # Both only need planner_output. ParallelGroup runs them concurrently.
        yield format_sse(SSEEventType.AGENT_START, {
            "agent": "designer", "model": agents["designer"].model,
            "step": 2, "total_steps": total_steps,
        })
        yield format_sse(SSEEventType.AGENT_START, {
            "agent": "architect", "model": agents["architect"].model,
            "step": 3, "total_steps": total_steps,
        })

        t0 = time.monotonic()
        parallel = ParallelGroup(
            agents=[agents["designer"], agents["architect"]],
        )
        parallel_result = await parallel.run(
            inputs={
                "Visual Designer": (
                    format_designer_msg(planner_output, design_intel)
                    + ("\n\n" + designer_memory if designer_memory else "")
                ),
                "React Project Architect": format_architect_msg(
                    planner_output, planner_output,
                ),
            },
            router=_get_router(),
            run_context=run_ctx,
        )
        parallel_duration = round(time.monotonic() - t0, 2)

        # Extract individual results
        designer_res = parallel_result.get("Visual Designer")
        architect_res = parallel_result.get("React Project Architect")

        designer_step = AgentStepResult(
            agent_name="designer",
            model_used=designer_res.model_used,
            output=designer_res.output,
            cost_eur=designer_res.cost_eur,
            duration_s=parallel_duration,
        )
        architect_step = AgentStepResult(
            agent_name="architect",
            model_used=architect_res.model_used,
            output=architect_res.output,
            cost_eur=architect_res.cost_eur,
            duration_s=parallel_duration,
        )
        agent_results.extend([designer_step, architect_step])
        cumulative_cost += designer_step.cost_eur + architect_step.cost_eur

        yield format_sse(SSEEventType.AGENT_COMPLETE, {
            "agent": "designer", "model": designer_step.model_used,
            "cost_eur": designer_step.cost_eur,
            "duration_s": designer_step.duration_s,
            "cumulative_cost_eur": round(cumulative_cost - architect_step.cost_eur, 6),
        })
        yield format_sse(SSEEventType.AGENT_COMPLETE, {
            "agent": "architect", "model": architect_step.model_used,
            "cost_eur": architect_step.cost_eur,
            "duration_s": architect_step.duration_s,
            "cumulative_cost_eur": round(cumulative_cost, 6),
        })
        budget_mgr.record_spend("designer", designer_step.cost_eur)
        budget_mgr.record_spend("architect", architect_step.cost_eur)
        logger.info(
            "Designer+Architect PARALLEL: cost=EUR%.4f duration=%.1fs (saved ~%.0f%%)",
            designer_step.cost_eur + architect_step.cost_eur,
            parallel_duration,
            50.0,  # rough estimate: parallel vs sequential
        )
        await record_agent_experience(
            mem, "designer", planner_output[:100], designer_step.output[:200],
            designer_step.model_used, designer_step.cost_eur,
        )
        await record_agent_experience(
            mem, "architect", planner_output[:100], architect_step.output[:200],
            architect_step.model_used, architect_step.cost_eur,
        )

        # ── Inject template references for Builder ──
        template_refs = ""
        section_order: list[str] | None = None
        try:
            arch_data = json.loads(architect_step.output)
            section_names = [s["name"] for s in arch_data.get("sections", [])]
            section_order = section_names
            template_refs = get_builder_context(section_names, max_templates=5)
            if template_refs:
                logger.info(
                    "Injected %d template references for Builder",
                    template_refs.count("# Premium reference"),
                )
        except (json.JSONDecodeError, KeyError, TypeError):
            pass

        # ── Builder (v0.2: streaming multi-file output) ──
        # Uses run_stream() to emit files to WebContainer in real-time
        # as the LLM generates them, instead of waiting for full response.
        # Adaptive: Builder gets base allocation + unspent from prior agents
        builder_base = cfg.total_budget_eur * 0.40
        effective_builder_budget = budget_mgr.builder_budget(builder_base)
        agents["builder"].budget_eur = effective_builder_budget
        logger.info(
            "Builder budget: base=€%.4f effective=€%.4f (adaptive surplus=€%.4f)",
            builder_base, effective_builder_budget,
            effective_builder_budget - builder_base,
        )

        yield format_sse(SSEEventType.AGENT_START, {
            "agent": "builder", "model": agents["builder"].model,
            "step": 4, "total_steps": total_steps,
        })
        t0 = time.monotonic()

        builder_input = format_builder_msg(
            planner_output,
            designer_step.output,
            architect_step.output,
            template_refs,
        )
        if builder_memory:
            builder_input += "\n\n" + builder_memory

        # Stream tokens, extract files as </file> tags close
        full_output = ""
        streamed_files: dict[str, str] = {}
        last_emit_pos = 0  # track where we last extracted files
        builder_result = None

        async for event in agents["builder"].run_stream(
            builder_input, router=_get_router(), run_context=run_ctx,
        ):
            if event.type == "token":
                full_output += event.token
                # Check for newly completed file tags in the accumulated output
                new_region = full_output[last_emit_pos:]
                for match in _FILE_TAG_RE.finditer(new_region):
                    path = match.group(1).strip()
                    content = match.group(2)
                    if content.startswith("\n"):
                        content = content[1:]
                    if content.endswith("\n"):
                        content = content[:-1]
                    if path not in streamed_files:
                        # Sanitize before emitting to WebContainer
                        if path.endswith(".tsx"):
                            content = _sanitize_icons(content)
                            content = _sanitize_iframes(content)
                            content = _fix_missing_imports(content)
                        streamed_files[path] = content
                        # Emit file immediately to frontend → WebContainer
                        sse_event = format_sse("file_chunk", {
                            "path": path,
                            "content": content,
                        })
                        logger.warning(
                            "STREAMING EMIT: %s (%d chars, sse=%d bytes)",
                            path, len(content), len(sse_event),
                        )
                        yield sse_event
                        # Brief pause after CSS for recompile
                        if path == "src/index.css":
                            await asyncio.sleep(0.05)
                # Move pointer past fully matched region
                if new_region:
                    last_closed = new_region.rfind("</file>")
                    if last_closed >= 0:
                        last_emit_pos += last_closed + len("</file>")

            elif event.type == "complete" and event.result:
                builder_result = event.result
            elif event.type == "error":
                raise RuntimeError(f"Builder streaming error: {event.error}")

        # Re-parse the final clean output (from Tramontane's complete event)
        final_output = builder_result.output if builder_result else full_output
        all_files = _parse_file_tags(final_output)
        logger.warning(
            "BUILDER OUTPUT: %d chars total, streaming=%d files, final_parse=%d files",
            len(final_output), len(streamed_files), len(all_files),
        )

        # v0.2.0: validate_output on Builder auto-retries truncated output
        # No manual retry needed here
        for path, content in all_files.items():
            if path not in streamed_files:
                if path.endswith(".tsx"):
                    content = _sanitize_icons(content)
                streamed_files[path] = content
                yield format_sse("file_chunk", {
                    "path": path,
                    "content": content,
                })
                logger.info("Late-streamed file: %s (%d chars)", path, len(content))

        # Merge all discovered files
        files = {**all_files, **streamed_files}  # streamed takes priority

        builder_cost = builder_result.cost_eur if builder_result else 0.0
        builder_model = builder_result.model_used if builder_result else "devstral-small"
        builder_step = AgentStepResult(
            agent_name="builder",
            model_used=builder_model,
            output=full_output,
            cost_eur=builder_cost,
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
        budget_mgr.record_spend("builder", builder_step.cost_eur)
        await record_agent_experience(
            mem, "builder", planner_output[:100],
            f"{len(files)} files generated",
            builder_step.model_used, builder_step.cost_eur,
        )
        logger.info(
            "Builder complete: cost=EUR%.4f duration=%.1fs files=%d",
            builder_step.cost_eur, builder_step.duration_s, len(files),
        )

        if files:
            # ALWAYS generate App.tsx with correct Architect section order
            # (Builder may output its own App.tsx with wrong order)
            app_tsx = _build_app_tsx(files, section_order)
            files["src/App.tsx"] = app_tsx
            yield format_sse("file_chunk", {
                "path": "src/App.tsx",
                "content": app_tsx,
            })

            # Add ARKHOS.md project memory
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

            # Emit preview_ready HTML fallback for when WC isn't ready yet.
            # Build a minimal HTML page from index.css + sections so the
            # iframe preview has something to show immediately.
            index_css = files.get("src/index.css", "")
            index_html = files.get("index.html", "")
            if index_css or index_html:
                fallback_html = (
                    "<!DOCTYPE html><html><head>"
                    "<meta charset='UTF-8'>"
                    "<meta name='viewport' content='width=device-width,initial-scale=1'>"
                    f"<style>{index_css}</style>"
                    "</head><body style='background:#020408;color:#fff;font-family:sans-serif;'>"
                    "<div style='text-align:center;padding:20vh 2rem'>"
                    "<p style='font-size:1.25rem;opacity:0.8'>Building your site...</p>"
                    "<p style='font-size:0.875rem;opacity:0.5;margin-top:0.5rem'>"
                    "The preview will appear once the build completes.</p>"
                    "</div></body></html>"
                )
                yield format_sse(SSEEventType.PREVIEW_READY, {
                    "html": fallback_html,
                    "stage": "pre_review",
                })

            logger.info("Total files: %d (streamed in real-time)", len(files))
        else:
            # Fallback: treat entire output as single HTML (v0.1 compat)
            logger.warning("No files parsed, falling back to HTML mode")
            yield format_sse(SSEEventType.PREVIEW_READY, {
                "html": builder_step.output, "stage": "pre_review",
            })

        # ── Reviewer ──
        yield format_sse(SSEEventType.AGENT_START, {
            "agent": "reviewer", "model": agents["reviewer"].model,
            "step": 5, "total_steps": total_steps,
        })
        t0 = time.monotonic()
        reviewer_response = await agents["reviewer"].run(
            format_reviewer_msg(builder_step.output, planner_output),
            router=_get_router(),
            run_context=run_ctx,
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
        budget_mgr.record_spend("reviewer", reviewer_step.cost_eur)
        await record_agent_experience(
            mem, "reviewer", planner_output[:100], reviewer_step.output[:200],
            reviewer_step.model_used, reviewer_step.cost_eur,
        )
        logger.info(
            "Reviewer complete: cost=EUR%.4f duration=%.1fs",
            reviewer_step.cost_eur, reviewer_step.duration_s,
        )

        # If reviewer fixed files, emit only the fixed ones as file_chunks
        # Use regex only — _extract_files JSON fallback misparses reviewer JSON
        reviewer_files = _parse_file_tags(reviewer_step.output)
        if reviewer_files:
            for path, content in reviewer_files.items():
                files[path] = content  # update our files dict
                yield format_sse("file_chunk", {
                    "path": path,
                    "content": content,
                })
            logger.info(
                "Reviewer fixed %d files: %s",
                len(reviewer_files), list(reviewer_files.keys()),
            )
        elif not files:
            # v0.1 compat: treat reviewer output as HTML
            yield format_sse(SSEEventType.PREVIEW_READY, {
                "html": reviewer_step.output, "stage": "final",
            })

        # ── Sandbox Preview (cloud on Scaleway or local GPU) ──
        sandbox_preview_url: str | None = None
        if files:
            sandbox_t0 = time.monotonic()
            gen_name = f"gen-{int(start_time)}"
            try:
                from arkhos.app import port_manager
                user_id = gen_name
                sandbox_port = port_manager.allocate(gen_name, user_id)
                sandbox_preview_url = f"/api/preview/{gen_name}"

                async with SandboxExecutor() as executor:
                    yield format_sse(SSEEventType.SANDBOX_START, {
                        "message": "Starting sandbox preview...",
                        "preview_url": sandbox_preview_url,
                    })
                    sandbox_result = await executor.execute_generated_project(
                        project_files=files,
                        project_name=gen_name,
                        port=sandbox_port,
                    )
                    sandbox_elapsed = round(time.monotonic() - sandbox_t0, 2)
                    success = sandbox_result.get("success", False)
                    yield format_sse(SSEEventType.SANDBOX_COMPLETE, {
                        "success": success,
                        "preview_url": sandbox_preview_url if success else None,
                        "stage": sandbox_result.get("stage"),
                        "duration_s": sandbox_elapsed,
                    })
                    if not success:
                        port_manager.release(gen_name)
                        sandbox_preview_url = None
                    logger.info(
                        "Sandbox step: success=%s duration=%.2fs preview=%s",
                        success, sandbox_elapsed, sandbox_preview_url,
                    )
            except Exception as sandbox_exc:
                sandbox_elapsed = round(time.monotonic() - sandbox_t0, 2)
                logger.warning("Sandbox unavailable (%.2fs): %s", sandbox_elapsed, sandbox_exc)
                try:
                    from arkhos.app import port_manager
                    port_manager.release(gen_name)
                except Exception:
                    pass
                sandbox_preview_url = None
                yield format_sse("sandbox_complete", {
                    "success": False,
                    "error": "Sandbox container not available",
                    "stage": "skipped",
                    "duration_s": sandbox_elapsed,
                })

        total_duration = round(time.monotonic() - start_time, 2)
        yield format_sse(SSEEventType.GENERATION_COMPLETE, {
            "total_cost_eur": round(cumulative_cost, 6),
            "total_duration_s": total_duration,
            "models_used": [r.model_used for r in agent_results],
            "success": True,
            "sandbox_preview": sandbox_preview_url,
        })
        logger.info(
            "Build complete: cost=EUR%.4f duration=%.1fs",
            cumulative_cost, total_duration,
        )

        # Record full generation experience
        await record_generation_experience(
            mem,
            prompt=planner_output[:200],
            profile=profile.value,
            total_cost=cumulative_cost,
            models_used=[r.model_used for r in agent_results],
            success=True,
            file_count=len(files) if files else 0,
            reviewer_summary=reviewer_step.output[:200],
        )

    except Exception as exc:
        logger.exception("Build phase failed: %s", exc)
        error_type, error_msg = _classify_error(exc)
        yield format_sse(SSEEventType.ERROR, {
            "error": error_msg,
            "error_type": error_type,
            "agent": agent_results[-1].agent_name if agent_results else "unknown",
        })


async def run_pipeline(
    prompt: str,
    locale: str = "en",
    profile: FleetProfile = FleetProfile.BALANCED,
) -> PipelineResult:
    """Run the pipeline and collect results (non-streaming version).

    Useful for testing and the /api/result endpoint.
    Internally consumes the streaming generator.
    """
    result = PipelineResult(html="")
    start_time = time.monotonic()

    async for _sse_event in run_pipeline_streaming(prompt, locale, profile):
        pass

    result.total_duration_s = round(time.monotonic() - start_time, 2)
    return result
