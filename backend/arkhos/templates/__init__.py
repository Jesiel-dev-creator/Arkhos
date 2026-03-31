"""Pre-built section templates for the Builder agent context.

Two template sources, tagged differently for the Builder:
- sections/   (21st.dev)  → SECTION REFERENCE: layout/structure base
- aceternity/ (Aceternity) → EFFECT REFERENCE: backgrounds, animations,
                              micro-interactions within sections
"""

from pathlib import Path

TEMPLATES_DIR = Path(__file__).parent / "sections"
ACETERNITY_DIR = Path(__file__).parent / "aceternity"

SECTION_MAP: dict[str, list[str]] = {
    "hero": [
        "hero-bakery", "hero-saas-dark", "hero-split", "hero-agency",
        "hero-dark-gradient", "hero-dark-space", "hero-minimal-modern",
        "hero-minimalist-clean", "hero-startup-landing", "hero-startup-centered",
        "hero-video-background",
    ],
    "features": [
        "features-bento", "features-3col", "features-alternating",
        "features-icon-grid", "features-tabs-showcase", "features-comparison-table",
        "features-timeline-steps", "features-bounce-cards", "features-grid-hover",
        "features-zigzag-layout", "features-sidebar-list",
    ],
    "testimonials": [
        "testimonials-cards", "testimonials-animated-carousel",
        "testimonials-sliding-cards", "testimonials-bento-grid",
        "testimonials-single-quote", "testimonials-star-ratings",
        "testimonials-dark-photo-cards",
    ],
    "social_proof": [
        "logo-cloud", "logo-cloud-marquee", "logo-cloud-grid",
        "logo-marquee-scroller", "logo-partners-cards",
    ],
    "navbar": [
        "navbar-glass", "navbar-floating-glass", "navbar-scroll-collapse",
        "navbar-resizable-animated", "navbar-mega-menu",
        "navbar-animated-mega-dropdown", "navbar-minimal-dark",
    ],
    "footer": [
        "footer-4col", "footer-columns-links", "footer-advanced-social",
        "footer-minimal-centered", "footer-newsletter-social", "footer-dark-modern",
    ],
    "cta": [
        "cta-fullwidth", "cta-banner-stats", "cta-banner-buttons",
        "cta-default-balanced", "cta-newsletter-blue", "cta-newsletter-card",
        "cta-gradient-purple", "cta-gradient-radial", "cta-minimal-clean",
        "cta-checklist", "cta-card-with-image",
    ],
    "pricing": [
        "pricing-3col", "pricing-three-tiers", "pricing-animated-tiers",
        "pricing-toggle-switch", "pricing-comparison-table",
        "pricing-glassy-dark-light", "pricing-enterprise-suite",
    ],
    "about": ["about-split"],
    "contact": ["contact-split"],
    "menu": ["menu-grid"],
    "faq": [
        "faq-accordion", "accordion-faq-simple", "accordion-faq-categorized",
        "accordion-animated-smooth", "accordion-collapsible-list",
    ],
    "stats": ["stats-row"],
    "team": ["team-grid", "card-team-member"],
    "cards": [
        "card-animated-hover", "card-floating-3d", "card-blog-post",
        "card-feature-icon", "card-pricing-minimal", "card-product-showcase",
    ],
    "comparison": [
        "comparison-table-features", "comparison-before-after",
        "comparison-pricing-toggle",
    ],
    "scroll": [
        "scroll-reveal-text", "scroll-reveal-direction", "scroll-progress-bar",
        "scroll-horizontal-gallery", "scroll-infinite-marquee",
    ],
    "background": [
        "background-pattern", "background-gradient-animated",
        "background-particles-canvas",
    ],
}


# Aceternity effects mapped by usage context
ACETERNITY_MAP: dict[str, list[str]] = {
    "hero_bg": [
        "aurora-background", "spotlight", "lamp-effect",
        "background-beams", "hero-highlight",
    ],
    "section_bg": [
        "wavy-background", "background-gradient",
        "grid-dot-backgrounds", "sparkles",
    ],
    "text_effect": [
        "typewriter-effect", "text-generate-effect",
    ],
    "card_effect": [
        "3d-card-effect", "card-hover-effect", "card-stack",
        "moving-border", "animated-tooltip",
    ],
    "layout": [
        "bento-grid", "infinite-moving-cards",
        "sticky-scroll-reveal",
    ],
    "nav": [
        "floating-navbar",
    ],
}


def get_template(name: str) -> str:
    """Read a single template file by name (without extension)."""
    f = TEMPLATES_DIR / f"{name}.tsx"
    return f.read_text() if f.exists() else ""


def get_aceternity(name: str) -> str:
    """Read an Aceternity effect template by name (without extension)."""
    f = ACETERNITY_DIR / f"{name}.tsx"
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
    if any(w in section_lower for w in ["card", "grid", "showcase"]):
        return [get_template(n) for n in SECTION_MAP["cards"]]
    if any(w in section_lower for w in ["compare", "comparison", "versus", "vs"]):
        return [get_template(n) for n in SECTION_MAP["comparison"]]
    if any(w in section_lower for w in ["scroll", "marquee", "reveal"]):
        return [get_template(n) for n in SECTION_MAP["scroll"]]
    if any(w in section_lower for w in ["background", "bg", "pattern", "particle"]):
        return [get_template(n) for n in SECTION_MAP["background"]]

    return []


def _get_aceternity_for_section(section_name: str) -> list[str]:
    """Return Aceternity effect code relevant to a section type."""
    s = section_name.lower()

    # Hero sections get hero backgrounds
    if any(w in s for w in ["hero", "banner", "header", "jumbotron"]):
        return [get_aceternity(n) for n in ACETERNITY_MAP["hero_bg"]
                if (ACETERNITY_DIR / f"{n}.tsx").exists()]

    # Content sections get subtle backgrounds
    if any(w in s for w in ["feature", "about", "stat", "team",
                             "testimonial", "pricing", "faq"]):
        return [get_aceternity(n) for n in ACETERNITY_MAP["section_bg"]
                if (ACETERNITY_DIR / f"{n}.tsx").exists()]

    # Card-heavy sections get card effects
    if any(w in s for w in ["card", "portfolio", "project", "work",
                             "menu", "product"]):
        return [get_aceternity(n) for n in ACETERNITY_MAP["card_effect"]
                if (ACETERNITY_DIR / f"{n}.tsx").exists()]

    # Nav sections
    if any(w in s for w in ["nav", "navbar"]):
        return [get_aceternity(n) for n in ACETERNITY_MAP["nav"]
                if (ACETERNITY_DIR / f"{n}.tsx").exists()]

    return []


def get_builder_context(section_names: list[str], max_templates: int = 3) -> str:
    """Build reference context for the Builder from both template sources.

    21st.dev sections → tagged as SECTION REFERENCE (layout/structure)
    Aceternity effects → tagged as EFFECT REFERENCE (bg, animations)
    """
    section_refs: list[str] = []
    effect_refs: list[str] = []
    seen: set[str] = set()

    for name in section_names:
        # Layer 1: 21st.dev section structure (max 1 per section type)
        templates = get_templates_for_section(name)
        for template in templates[:1]:
            key = template[:50]
            if key not in seen and template:
                seen.add(key)
                section_refs.append(
                    f"# SECTION REFERENCE for '{name}' — "
                    f"use as layout/structure base:\n"
                    f"{template[:1200]}\n..."
                )
        if len(section_refs) >= max_templates:
            break

    # Layer 2: Aceternity effects (max 2 total, pick best matches)
    effect_seen: set[str] = set()
    for name in section_names:
        effects = _get_aceternity_for_section(name)
        for effect in effects[:1]:
            ekey = effect[:50]
            if ekey not in effect_seen and effect:
                effect_seen.add(ekey)
                effect_refs.append(
                    f"# EFFECT REFERENCE — use for backgrounds, "
                    f"animations, micro-interactions within sections:\n"
                    f"{effect[:1000]}\n..."
                )
            if len(effect_refs) >= 2:
                break
        if len(effect_refs) >= 2:
            break

    parts: list[str] = []
    if section_refs:
        parts.append(
            "## PREMIUM SECTION REFERENCES\n"
            "Match this quality level. Adapt colors/fonts/content "
            "to the design system.\n\n"
            + "\n\n".join(section_refs)
        )
    if effect_refs:
        parts.append(
            "## ACETERNITY EFFECT REFERENCES\n"
            "Layer these effects BEHIND or WITHIN section components "
            "for premium visual quality. Combine a section structure "
            "(above) with an effect (below).\n\n"
            + "\n\n".join(effect_refs)
        )

    if not parts:
        return ""
    return "\n\n" + "\n\n".join(parts)
