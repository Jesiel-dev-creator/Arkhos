"""User-specific API routes (auth required)."""

from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter, Depends

from arkhos.auth import get_current_user

logger = logging.getLogger(__name__)

user_router = APIRouter(prefix="/user", tags=["user"])


@user_router.get("/projects")
async def list_projects(user_id: str = Depends(get_current_user)) -> list[dict[str, Any]]:
    """List all projects for the authenticated user."""
    # Frontend currently queries Supabase directly via RLS.
    # This endpoint exists for API completeness and future mobile clients.
    return []


@user_router.get("/usage")
async def get_usage(user_id: str = Depends(get_current_user)) -> dict[str, Any]:
    """Get generation usage stats for the current billing period."""
    return {
        "user_id": user_id,
        "generations_this_month": 0,
        "tier": "free",
        "limits": {
            "max_gens_per_month": 10,
            "allowed_profiles": ["budget"],
        },
    }
