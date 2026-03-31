"""In-memory generation store.

Stores generation state and results for retrieval via /api/result/{id}
and for SSE stream subscription. Will be replaced with SQLite in Week 3.
"""

from __future__ import annotations

import asyncio
import logging
import uuid
from dataclasses import dataclass, field
from enum import StrEnum
from typing import Any

logger = logging.getLogger(__name__)


class GenerationStatus(StrEnum):
    """Status of a generation request."""

    PENDING = "pending"
    RUNNING = "running"
    COMPLETE = "complete"
    FAILED = "failed"


@dataclass
class Generation:
    """A single generation request and its result."""

    id: str
    prompt: str
    locale: str
    status: GenerationStatus = GenerationStatus.PENDING
    html: str = ""
    metadata: dict[str, Any] = field(default_factory=dict)
    error: str | None = None
    plan: str = ""
    event_queue: asyncio.Queue[str | None] = field(default_factory=asyncio.Queue)


class GenerationStore:
    """In-memory store for active and completed generations."""

    def __init__(self) -> None:
        self._generations: dict[str, Generation] = {}

    def create(self, prompt: str, locale: str = "en") -> Generation:
        """Create a new generation entry."""
        gen_id = uuid.uuid4().hex[:12]
        generation = Generation(id=gen_id, prompt=prompt, locale=locale)
        self._generations[gen_id] = generation
        logger.info("Created generation %s", gen_id)
        return generation

    def get(self, gen_id: str) -> Generation | None:
        """Get a generation by ID."""
        return self._generations.get(gen_id)

    def list_recent(self, limit: int = 20) -> list[dict[str, Any]]:
        """List recent completed generations for the gallery."""
        completed = [
            g for g in self._generations.values()
            if g.status == GenerationStatus.COMPLETE
        ]
        recent = list(reversed(completed))[:limit]
        return [
            {
                "id": g.id,
                "prompt": g.prompt[:100],
                "cost_eur": g.metadata.get("total_cost_eur", 0),
            }
            for g in recent
        ]


# Singleton store instance
store = GenerationStore()
