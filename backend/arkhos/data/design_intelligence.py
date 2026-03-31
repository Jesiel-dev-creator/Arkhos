"""Condensed design intelligence for the Designer agent.

Extracted from UI/UX Pro Max data (96 product types, 68 styles, 57 font pairings).
Maps industry → design recommendations injected into Designer system prompt.
"""

from __future__ import annotations

INDUSTRY_DESIGN_MAP: dict[str, dict[str, object]] = {
    "bakery": {
        "colors": {
            "primary": "#8B4513",
            "secondary": "#F5DEB3",
            "background": "#FFF8F0",
            "accent": "#D2691E",
            "text_primary": "#3A2E22",
            "text_secondary": "#6B5B47",
        },
        "fonts": {"heading": "Playfair Display:700,800", "body": "Lato:400,500,700"},
        "style": "warm, inviting, artisanal, generous whitespace, food photography",
        "sections": ["hero", "about", "menu", "gallery", "contact"],
        "hero_variant": "hero-bakery",
        "avoid": "dark backgrounds, neon colors, geometric ultra-minimal",
    },
    "restaurant": {
        "colors": {
            "primary": "#2C1810",
            "secondary": "#8B0000",
            "background": "#FAF7F2",
            "accent": "#C4A962",
            "text_primary": "#1A1A1A",
            "text_secondary": "#5A5A5A",
        },
        "fonts": {
            "heading": "Cormorant Garamond:600,700",
            "body": "Raleway:300,400,500",
        },
        "style": "elegant, fine dining, warm amber, atmospheric",
        "sections": ["hero", "about", "menu", "reservation", "contact"],
        "hero_variant": "hero-full-width-image",
        "avoid": "bright colors, playful fonts, childlike illustrations",
    },
    "saas": {
        "colors": {
            "primary": "#6366F1",
            "secondary": "#8B5CF6",
            "background": "#0F172A",
            "accent": "#06B6D4",
            "text_primary": "#F1F5F9",
            "text_secondary": "#94A3B8",
        },
        "fonts": {
            "heading": "Plus Jakarta Sans:700,800",
            "body": "DM Sans:400,500",
        },
        "style": "dark, authoritative, gradient headlines, glassmorphism cards",
        "sections": ["hero", "features", "social_proof", "pricing", "cta"],
        "hero_variant": "hero-saas-dark",
        "avoid": "light backgrounds, serif fonts, stock photos of handshakes",
    },
    "portfolio": {
        "colors": {
            "primary": "#111111",
            "secondary": "#EEEEEE",
            "background": "#FAFAFA",
            "accent": "#FF4444",
            "text_primary": "#111111",
            "text_secondary": "#666666",
        },
        "fonts": {"heading": "Bebas Neue:400", "body": "Inter:400,500"},
        "style": "bold, editorial, high contrast, large typography, case studies",
        "sections": ["hero", "work", "about", "skills", "contact"],
        "hero_variant": "hero-split-left",
        "avoid": "cluttered layouts, too many colors, small typography",
    },
    "agency": {
        "colors": {
            "primary": "#0A0A0A",
            "secondary": "#1A1A1A",
            "background": "#FFFFFF",
            "accent": "#FF6B35",
            "text_primary": "#0A0A0A",
            "text_secondary": "#555555",
        },
        "fonts": {"heading": "Syne:700,800", "body": "DM Sans:400,500"},
        "style": "bold, asymmetric, editorial contrast, strong typographic hierarchy",
        "sections": ["hero", "services", "work", "process", "team", "contact"],
        "hero_variant": "hero-dark-particles",
        "avoid": "generic stock photos, predictable grids, corporate blue",
    },
    "ecommerce": {
        "colors": {
            "primary": "#1A1A2E",
            "secondary": "#E94560",
            "background": "#FFFFFF",
            "accent": "#0F3460",
            "text_primary": "#1A1A2E",
            "text_secondary": "#666666",
        },
        "fonts": {
            "heading": "Space Grotesk:600,700",
            "body": "DM Sans:400,500",
        },
        "style": "clean, product-focused, trust indicators, conversion-optimized",
        "sections": ["hero", "products", "features", "testimonials", "cta"],
        "hero_variant": "hero-split-left",
        "avoid": "dark mode for product pages, tiny images",
    },
    "healthcare": {
        "colors": {
            "primary": "#0D9488",
            "secondary": "#5EEAD4",
            "background": "#F0FDFA",
            "accent": "#0F766E",
            "text_primary": "#134E4A",
            "text_secondary": "#5F7A76",
        },
        "fonts": {"heading": "Outfit:600,700", "body": "Inter:400,500"},
        "style": "clean, trustworthy, calming, accessible, professional",
        "sections": ["hero", "services", "team", "testimonials", "contact"],
        "hero_variant": "hero-full-width-image",
        "avoid": "dark themes, aggressive CTAs, stock photos of stethoscopes",
    },
}

# Default fallback
INDUSTRY_DESIGN_MAP["default"] = {
    "colors": {
        "primary": "#1A1A2E",
        "secondary": "#16213E",
        "background": "#FFFFFF",
        "accent": "#E94560",
        "text_primary": "#1A1A2E",
        "text_secondary": "#555555",
    },
    "fonts": {"heading": "Outfit:700", "body": "DM Sans:400,500"},
    "style": "modern, clean, professional",
    "sections": ["hero", "features", "about", "contact"],
    "hero_variant": "hero-full-width-image",
    "avoid": "",
}


def get_design_for_industry(industry: str) -> dict[str, object]:
    """Return design recommendations for the given industry."""
    industry_lower = industry.lower()
    for key, value in INDUSTRY_DESIGN_MAP.items():
        if key in industry_lower or industry_lower in key:
            return value
    # Fuzzy match common terms
    if any(w in industry_lower for w in ("food", "cafe", "bakery", "patisserie")):
        return INDUSTRY_DESIGN_MAP["bakery"]
    if any(w in industry_lower for w in ("tech", "software", "startup", "app")):
        return INDUSTRY_DESIGN_MAP["saas"]
    if any(w in industry_lower for w in ("creative", "studio", "design")):
        return INDUSTRY_DESIGN_MAP["agency"]
    if any(w in industry_lower for w in ("dev", "developer", "engineer")):
        return INDUSTRY_DESIGN_MAP["portfolio"]
    return INDUSTRY_DESIGN_MAP["default"]
