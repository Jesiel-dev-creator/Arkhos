"""Smart skill injection + cross-generation memory for ArkhosAI.

Replaces dumb text concatenation of all skill files with relevance-matched
injection via tramontane MarkdownSkill.matches(). Adds TramontaneMemory
for cross-generation learning.
"""

from __future__ import annotations

import logging
from pathlib import Path

from tramontane import MarkdownSkill, TramontaneMemory

logger = logging.getLogger(__name__)

SKILLS_DIR = Path(__file__).parent / "skills"

# Role → subdirectory mapping
_ROLE_DIRS: dict[str, list[str]] = {
    "planner": ["planner", "planner/industries"],
    "designer": ["designer"],
    "architect": [],  # Architect uses shared only
    "builder": ["builder"],
    "reviewer": ["reviewer"],
}


def load_skills(
    skills_dir: Path | None = None,
) -> dict[str, list[MarkdownSkill]]:
    """Load all .md skill files as MarkdownSkill objects, grouped by role.

    Returns:
        Dict mapping role names to lists of MarkdownSkill instances.
        "shared" key contains skills available to all roles.
    """
    base = skills_dir or SKILLS_DIR
    registry: dict[str, list[MarkdownSkill]] = {
        "planner": [],
        "designer": [],
        "builder": [],
        "reviewer": [],
        "shared": [],
    }

    for role, subdirs in _ROLE_DIRS.items():
        for subdir in subdirs:
            dir_path = base / subdir
            if not dir_path.exists():
                continue
            for md_file in sorted(dir_path.glob("*.md")):
                content = md_file.read_text(encoding="utf-8")[:5000]
                skill = MarkdownSkill(
                    name=md_file.stem,
                    description=f"{role} skill: {md_file.stem}",
                    instructions=content,
                    triggers=_extract_triggers(md_file.stem, role),
                )
                registry[role].append(skill)

    # Shared skills
    shared_dir = base / "shared"
    if shared_dir.exists():
        for md_file in sorted(shared_dir.glob("*.md")):
            content = md_file.read_text(encoding="utf-8")[:5000]
            skill = MarkdownSkill(
                name=md_file.stem,
                description=f"shared skill: {md_file.stem}",
                instructions=content,
            )
            registry["shared"].append(skill)

    total = sum(len(v) for v in registry.values())
    logger.info("Loaded %d skills across %d roles", total, len(registry))
    return registry


def _extract_triggers(stem: str, role: str) -> list[str]:
    """Generate trigger keywords from file stem and role."""
    triggers = [stem.replace("-", " "), stem.replace("-", "")]
    # Industry-specific triggers
    industry_triggers: dict[str, list[str]] = {
        "bakery": ["bakery", "boulangerie", "patisserie", "bread", "pastry"],
        "restaurant": ["restaurant", "bistro", "cafe", "dining", "food"],
        "saas": ["saas", "software", "dashboard", "pricing", "b2b"],
        "portfolio": ["portfolio", "developer", "freelance", "personal"],
        "ecommerce": ["ecommerce", "shop", "store", "product", "cart"],
        "agency": ["agency", "creative", "studio", "design agency"],
    }
    if stem in industry_triggers:
        triggers.extend(industry_triggers[stem])
    return triggers


def get_relevant_skills(
    registry: dict[str, list[MarkdownSkill]],
    role: str,
    prompt: str,
    top_k: int = 4,
) -> str:
    """Get the most relevant skills for an agent given the prompt.

    Uses MarkdownSkill.matches() for relevance scoring instead of
    dumping all skills. Returns concatenated instructions text.
    """
    candidates = list(registry.get(role, []))
    candidates.extend(registry.get("shared", []))

    if not candidates:
        return ""

    # Score and rank
    scored = [(skill, skill.matches(prompt)) for skill in candidates]
    scored.sort(key=lambda x: x[1], reverse=True)

    # Take top_k with score > 0
    selected = [s for s, score in scored[:top_k] if score > 0]

    # If nothing matched well, fall back to all role skills (no shared)
    if not selected:
        selected = registry.get(role, [])[:top_k]

    parts = [s._instructions for s in selected]
    result = "\n\n".join(parts)
    logger.debug(
        "Skills for %s: %d/%d selected (%s)",
        role, len(selected), len(candidates),
        ", ".join(s.name for s in selected),
    )
    return result


async def recall_context(
    memory: TramontaneMemory,
    role: str,
    prompt: str,
    top_k: int = 3,
) -> str:
    """Recall relevant past experiences for an agent.

    Returns formatted context string, or empty string if no memories.
    """
    query = f"{role} {prompt[:200]}"
    try:
        results = await memory.recall(query, top_k=top_k)
    except Exception as exc:
        # Embeddings API may be unavailable (401, quota, network)
        # Degrade gracefully — generation still works without memory context
        import logging
        logging.getLogger(__name__).debug("Memory recall unavailable: %s", exc)
        return ""

    if not results:
        return ""

    parts = []
    for r in results:
        content = r.get("content", "")
        if content:
            parts.append(f"- {content}")

    if not parts:
        return ""

    context = "## Past Experience (from previous generations)\n" + "\n".join(parts)
    logger.debug("Recalled %d memories for %s", len(parts), role)
    return context


async def record_agent_experience(
    memory: TramontaneMemory,
    agent_role: str,
    prompt_summary: str,
    output_summary: str,
    model: str,
    cost: float,
    success: bool = True,
) -> None:
    """Record an agent's run as experience + searchable fact."""
    # Experiential log (append-only)
    await memory.record_experience(
        action_type=f"{agent_role.lower()}_run",
        summary=f"{agent_role} on '{prompt_summary[:100]}': {output_summary[:200]}",
        outcome="success" if success else "failed",
        score=1.0 if success else 0.0,
        agent_role=agent_role,
        model=model,
        cost=cost,
    )
    # Searchable fact (recall() searches factual_memory via embeddings)
    fact = (
        f"{agent_role} used {model} (EUR {cost:.4f}) "
        f"for '{prompt_summary[:80]}': {output_summary[:150]}"
    )
    await memory.retain(
        content=fact,
        entity=agent_role.lower(),
        category="agent_experience",
        source="pipeline",
    )


async def record_generation_experience(
    memory: TramontaneMemory,
    prompt: str,
    profile: str,
    total_cost: float,
    models_used: list[str],
    success: bool,
    file_count: int = 0,
    reviewer_summary: str = "",
) -> None:
    """Record a complete generation as experience + searchable fact."""
    summary = (
        f"Generated site for '{prompt[:80]}' "
        f"[{profile}] {file_count} files, "
        f"models: {', '.join(set(models_used))}"
    )
    outcome = "success" if success else "failed"
    if reviewer_summary:
        outcome += f" | reviewer: {reviewer_summary[:100]}"

    # Experiential log
    await memory.record_experience(
        action_type="generation_complete",
        summary=summary,
        outcome=outcome,
        score=1.0 if success else 0.0,
        cost=total_cost,
    )
    # Searchable fact for future generations
    fact = (
        f"Generation [{profile}] '{prompt[:80]}': "
        f"{file_count} files, EUR {total_cost:.4f}, "
        f"{'success' if success else 'failed'}"
    )
    if reviewer_summary:
        fact += f". Reviewer: {reviewer_summary[:100]}"
    await memory.retain(
        content=fact,
        entity="generation",
        category="generation_result",
        source="pipeline",
    )
