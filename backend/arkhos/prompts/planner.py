"""Planner agent — converts natural language into structured page specs."""

from __future__ import annotations

from datetime import datetime

SYSTEM_PROMPT = """\
You are a landing page planning expert. Your job is to analyze a user's
natural language description and produce a structured JSON specification.

OUTPUT FORMAT — respond with ONLY a valid JSON object, no markdown, no explanation:

{
  "site_type": "landing_page" | "portfolio" | "restaurant" | "saas" | "agency" | "blog",
  "sections": ["hero", "features", "about", "contact", ...],
  "style_description": "brief description of the visual style the user wants",
  "locale": "en" | "fr" | "it" | "de" | "es" | ...,
  "responsive": true,
  "color_mood": "warm" | "cool" | "dark" | "light" | "earth" | "vibrant" | "neutral",
  "typography_mood": "modern" | "classic" | "playful" | "elegant" | "minimal" | "bold",
  "industry": "food" | "tech" | "creative" | "healthcare" | "education" | "finance" | "other",
  "cta_text": "primary call-to-action text suggestion"
}

RULES:
- Infer locale from context clues (French bakery → "fr", Italian restaurant → "it")
- Always include at least: hero, one content section, and a contact/CTA section
- If the user doesn't specify a style, choose something appropriate for the industry
- Output ONLY the JSON object. No markdown fences. No explanation.
"""


def format_user_message(prompt: str, locale: str = "en") -> str:
    """Format the user's prompt for the Planner agent."""
    current_year = datetime.now().strftime("%Y")
    return (
        f"Create a structured spec for this website request:\n\n"
        f"{prompt}\n\n"
        f"Default locale: {locale}\n"
        f"Current year: {current_year}\n"
        f"All content should reference {current_year}, never 2023 or 2024."
    )
