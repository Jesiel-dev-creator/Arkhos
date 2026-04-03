"""FastAPI application for ArkhosAI."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import TYPE_CHECKING

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from tramontane import FleetTelemetry, MistralRouter, TramontaneMemory

from arkhos import __version__
from arkhos.intelligence import load_skills
from arkhos.routes import router
from arkhos.user_routes import user_router

load_dotenv()  # Load .env so MISTRAL_API_KEY is available to Tramontane

if TYPE_CHECKING:
    from collections.abc import AsyncGenerator

logger = logging.getLogger(__name__)

# ── App-level singletons ─────────────────────────────────────────
# FleetTelemetry persists routing outcomes to SQLite.
# After ~50 generations the router starts using production data
# instead of hand-crafted rules.
telemetry = FleetTelemetry(db_path="arkhos_telemetry.db")
mistral_router = MistralRouter(telemetry=telemetry)

# Cross-generation memory — learns what works across all generations.
memory = TramontaneMemory(db_path="arkhos_memory.db")

# Skill registry — 24 markdown skill files loaded as MarkdownSkill objects.
# get_relevant_skills() uses .matches() for smart injection.
skill_registry = load_skills()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan: startup and shutdown."""
    skill_count = sum(len(v) for v in skill_registry.values())
    logger.info(
        "ArkhosAI v%s starting (telemetry: %d outcomes, skills: %d, memory: %s)",
        __version__, telemetry.total_outcomes, skill_count, memory.stats(),
    )
    yield
    logger.info("ArkhosAI shutting down")


app = FastAPI(
    title="ArkhosAI",
    description="EU-sovereign AI website generator powered by Mistral",
    version=__version__,
    lifespan=lifespan,
)

# CORS — allow frontend dev server (Week 2)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")
app.include_router(user_router, prefix="/api")


@app.get("/health")
async def health() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "ok", "version": __version__}
