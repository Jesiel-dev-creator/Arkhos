"""FastAPI application for ArkhosAI."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import TYPE_CHECKING

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from arkhos import __version__
from arkhos.routes import router

load_dotenv()  # Load .env so MISTRAL_API_KEY is available to Tramontane

if TYPE_CHECKING:
    from collections.abc import AsyncGenerator

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan: startup and shutdown."""
    logger.info("ArkhosAI v%s starting", __version__)
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


@app.get("/health")
async def health() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "ok", "version": __version__}
