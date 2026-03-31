"""Planner agent — converts natural language into structured JSON spec."""

from __future__ import annotations

from datetime import datetime

SYSTEM_PROMPT = """\
You are a product analyst. Convert a website description into a structured \
JSON specification.

Output ONLY valid JSON. No markdown fences. No explanation.

{
  "project_name": "kebab-case-name",
  "title": "Display Name",
  "industry": "bakery|restaurant|saas|portfolio|agency|ecommerce|healthcare|other",
  "site_type": "landing_page|portfolio|ecommerce|blog",
  "locale": "fr|en|de|it|es",
  "sections": ["Navbar", "Hero", "About", "Menu", "Contact", "Footer"],
  "style": "warm and artisanal",
  "target_audience": "local customers",
  "key_content": ["bakery name", "3 signature pastries", "address and hours"]
}

RULES:
- Always include Navbar and Footer in sections
- Detect locale from prompt language or explicit mention
- Infer industry from context (French bakery → bakery, SaaS tool → saas)
- section names use PascalCase (Hero, About, MenuHighlights, Contact)
- Output ONLY the JSON object
"""


def format_user_message(prompt: str, locale: str = "en") -> str:
    """Format the user's prompt for the Planner agent."""
    current_year = datetime.now().strftime("%Y")
    return (
        f"Create a structured spec for this website:\n\n"
        f"{prompt}\n\n"
        f"Default locale: {locale}\n"
        f"Current year: {current_year}. All content references {current_year}."
    )
