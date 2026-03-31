"""Prompt sanitization for user inputs."""

from __future__ import annotations

import re


def sanitize_prompt(prompt: str) -> str:
    """Remove potentially dangerous content from user prompts."""
    cleaned = re.sub(r"<[^>]+>", "", prompt)
    cleaned = re.sub(r"javascript:", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"data:", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned
