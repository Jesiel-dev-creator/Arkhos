"""Pipeline skills — domain knowledge injected into agent prompts."""

import logging
from pathlib import Path

logger = logging.getLogger(__name__)

SKILLS_DIR = Path(__file__).parent


def _read_skill(path: Path, max_chars: int = 10000) -> str:
    """Read a skill file. Generous limit — full content is cheap to send."""
    if not path.exists():
        logger.warning("Skill file not found: %s", path)
        return ""
    content = path.read_text(encoding="utf-8")
    return content[:max_chars]


def _read_dir(directory: Path, max_chars: int = 15000) -> str:
    """Read all .md files in a directory, concatenated."""
    if not directory.exists():
        return ""
    parts = []
    for f in sorted(directory.glob("*.md")):
        parts.append(_read_skill(f, max_chars=5000))
    return "\n\n".join(parts)[:max_chars]


def get_planner_skills(industry: str = "default") -> str:
    """Get planner skills including industry-specific knowledge."""
    base = SKILLS_DIR / "planner"
    shared = SKILLS_DIR / "shared"

    parts = [
        _read_skill(base / "copywriting.md"),
        _read_skill(base / "marketing.md"),
        _read_skill(base / "seo.md"),
        _read_skill(shared / "mistral-prompting.md"),
    ]

    # Industry-specific skill
    industry_file = base / "industries" / f"{industry}.md"
    if industry_file.exists():
        parts.append(_read_skill(industry_file))

    return "\n\n".join(p for p in parts if p)


def get_designer_skills() -> str:
    """Get designer skills for visual design decisions."""
    base = SKILLS_DIR / "designer"
    parts = [
        _read_skill(base / "taste.md"),
        _read_skill(base / "eu-design.md"),
        _read_skill(base / "typography.md"),
    ]
    return "\n\n".join(p for p in parts if p)


def get_builder_skills() -> str:
    """Get builder skills for code generation."""
    base = SKILLS_DIR / "builder"
    parts = [
        _read_skill(base / "react-patterns.md"),
        _read_skill(base / "tailwind.md"),
        _read_skill(base / "shadcn.md"),
        _read_skill(base / "framer-motion.md"),
        _read_skill(base / "accessibility.md"),
        _read_skill(base / "performance.md"),
    ]
    return "\n\n".join(p for p in parts if p)


def get_reviewer_skills() -> str:
    """Get reviewer skills for security and quality checks."""
    base = SKILLS_DIR / "reviewer"
    shared = SKILLS_DIR / "shared"
    parts = [
        _read_skill(base / "security.md"),
        _read_skill(base / "code-quality.md"),
        _read_skill(shared / "eu-gdpr.md"),
    ]
    return "\n\n".join(p for p in parts if p)
