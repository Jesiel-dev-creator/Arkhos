"""JWT authentication for Supabase tokens."""

from __future__ import annotations

import logging

import jwt
from fastapi import HTTPException, Request

from arkhos.config import get_settings

logger = logging.getLogger(__name__)


def get_current_user(request: Request) -> str:
    """FastAPI dependency: extract and validate Supabase JWT.

    Returns the user ID (sub claim) from the token.
    Raises HTTPException 401 if missing or invalid.
    """
    auth_header = request.headers.get("authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authentication token")

    token = auth_header[7:]
    settings = get_settings()

    try:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: no user ID")
        return user_id

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError as e:
        logger.warning("Invalid JWT: %s", e)
        raise HTTPException(status_code=401, detail="Invalid token")
