"""Pre-built section templates for the Builder agent context."""

from pathlib import Path

TEMPLATES_DIR = Path(__file__).parent / "sections"

SECTION_MAP: dict[str, list[str]] = {
    "hero": ["hero-bakery", "hero-saas-dark", "hero-split", "hero-agency"],
    "features": ["features-bento", "features-3col", "features-alternating"],
    "testimonials": ["testimonials-cards"],
    "social_proof": ["logo-cloud"],
    "navbar": ["navbar-glass"],
    "footer": ["footer-4col"],
    "cta": ["cta-fullwidth"],
    "pricing": ["pricing-3col"],
    "about": ["about-split"],
    "contact": ["contact-split"],
    "menu": ["menu-grid"],
    "faq": ["faq-accordion"],
    "stats": ["stats-row"],
    "team": ["team-grid"],
}


def get_template(name: str) -> str:
    """Read a single template file by name (without extension)."""
    f = TEMPLATES_DIR / f"{name}.tsx"
    return f.read_text() if f.exists() else ""


def get_templates_for_section(section_name: str) -> list[str]:
    """Return template source code for a section type keyword."""
    section_lower = section_name.lower()

    # Direct key match
    for key, names in SECTION_MAP.items():
        if key in section_lower or section_lower in key:
            return [get_template(n) for n in names if (TEMPLATES_DIR / f"{n}.tsx").exists()]

    # Fuzzy fallbacks
    if any(w in section_lower for w in ["hero", "banner", "header", "jumbotron"]):
        return [get_template(n) for n in SECTION_MAP["hero"]]
    if any(w in section_lower for w in ["feature", "benefit", "service"]):
        return [get_template(n) for n in SECTION_MAP["features"]]
    if any(w in section_lower for w in ["review", "testimonial", "client"]):
        return [get_template(n) for n in SECTION_MAP["testimonials"]]
    if any(w in section_lower for w in ["contact", "reach", "find", "trouvez"]):
        return [get_template(n) for n in SECTION_MAP["contact"]]
    if any(w in section_lower for w in ["menu", "product", "item", "dish", "carte"]):
        return [get_template(n) for n in SECTION_MAP["menu"]]
    if any(w in section_lower for w in ["price", "pricing", "tarif", "plan"]):
        return [get_template(n) for n in SECTION_MAP["pricing"]]
    if any(w in section_lower for w in ["about", "story", "histoire", "notre"]):
        return [get_template(n) for n in SECTION_MAP["about"]]
    if any(w in section_lower for w in ["faq", "question", "accordion"]):
        return [get_template(n) for n in SECTION_MAP["faq"]]
    if any(w in section_lower for w in ["team", "equipe", "member"]):
        return [get_template(n) for n in SECTION_MAP["team"]]
    if any(w in section_lower for w in ["stat", "number", "counter", "chiffre"]):
        return [get_template(n) for n in SECTION_MAP["stats"]]
    if any(w in section_lower for w in ["cta", "call", "action", "newsletter"]):
        return [get_template(n) for n in SECTION_MAP["cta"]]
    if any(w in section_lower for w in ["nav", "header", "menu"]):
        return [get_template(n) for n in SECTION_MAP["navbar"]]
    if any(w in section_lower for w in ["footer", "pied"]):
        return [get_template(n) for n in SECTION_MAP["footer"]]
    if any(w in section_lower for w in ["logo", "partner", "trust", "client"]):
        return [get_template(n) for n in SECTION_MAP["social_proof"]]

    return []


def get_builder_context(section_names: list[str], max_templates: int = 3) -> str:
    """Build reference context for the Builder from section names."""
    refs: list[str] = []
    seen: set[str] = set()

    for name in section_names:
        templates = get_templates_for_section(name)
        for template in templates[:1]:  # max 1 per section type
            key = template[:50]
            if key not in seen and template:
                seen.add(key)
                refs.append(
                    f"# Premium reference for '{name}' "
                    f"(adapt design system, don't copy verbatim):\n"
                    f"{template[:1200]}\n..."
                )
        if len(refs) >= max_templates:
            break

    if not refs:
        return ""
    return (
        "\n\n## PREMIUM SECTION REFERENCES\n"
        "Match this quality level. Adapt colors/fonts/content to the design system.\n\n"
        + "\n\n".join(refs)
    )
