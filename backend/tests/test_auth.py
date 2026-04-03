"""Tests for JWT authentication middleware."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

import jwt as pyjwt
import pytest
from fastapi import HTTPException

from arkhos.auth import get_current_user


def test_get_current_user_missing_header():
    """get_current_user raises 401 when no auth header."""
    request = MagicMock()
    request.headers = {}

    with pytest.raises(HTTPException) as exc_info:
        get_current_user(request)
    assert exc_info.value.status_code == 401
    assert "Missing" in exc_info.value.detail


def test_get_current_user_missing_bearer_prefix():
    """get_current_user raises 401 when Bearer prefix is missing."""
    request = MagicMock()
    request.headers = {"authorization": "Token some-token"}

    with pytest.raises(HTTPException) as exc_info:
        get_current_user(request)
    assert exc_info.value.status_code == 401
    assert "Missing" in exc_info.value.detail


def test_get_current_user_invalid_token():
    """get_current_user raises 401 for bad JWT."""
    request = MagicMock()
    request.headers = {"authorization": "Bearer invalid-token"}

    with pytest.raises(HTTPException) as exc_info:
        get_current_user(request)
    assert exc_info.value.status_code == 401
    assert "Invalid token" in exc_info.value.detail


def test_get_current_user_valid_token():
    """get_current_user extracts user ID from valid JWT."""
    fake_secret = "test-secret-key-for-testing"
    payload = {
        "sub": "test-user-uuid-123",
        "role": "authenticated",
        "aud": "authenticated",
    }
    token = pyjwt.encode(payload, fake_secret, algorithm="HS256")

    request = MagicMock()
    request.headers = {"authorization": f"Bearer {token}"}

    with patch("arkhos.auth.get_settings") as mock_settings:
        mock_settings.return_value.supabase_jwt_secret = fake_secret
        user_id = get_current_user(request)
        assert user_id == "test-user-uuid-123"


def test_get_current_user_expired_token():
    """get_current_user raises 401 for expired JWT."""
    import time

    fake_secret = "test-secret-key-for-testing"
    payload = {
        "sub": "test-user-uuid-123",
        "aud": "authenticated",
        "exp": int(time.time()) - 3600,  # Expired 1 hour ago
    }
    token = pyjwt.encode(payload, fake_secret, algorithm="HS256")

    request = MagicMock()
    request.headers = {"authorization": f"Bearer {token}"}

    with patch("arkhos.auth.get_settings") as mock_settings:
        mock_settings.return_value.supabase_jwt_secret = fake_secret
        with pytest.raises(HTTPException) as exc_info:
            get_current_user(request)
        assert exc_info.value.status_code == 401
        assert "expired" in exc_info.value.detail.lower()


def test_get_current_user_no_sub_claim():
    """get_current_user raises 401 when token has no sub claim."""
    fake_secret = "test-secret-key-for-testing"
    payload = {
        "role": "authenticated",
        "aud": "authenticated",
    }
    token = pyjwt.encode(payload, fake_secret, algorithm="HS256")

    request = MagicMock()
    request.headers = {"authorization": f"Bearer {token}"}

    with patch("arkhos.auth.get_settings") as mock_settings:
        mock_settings.return_value.supabase_jwt_secret = fake_secret
        with pytest.raises(HTTPException) as exc_info:
            get_current_user(request)
        assert exc_info.value.status_code == 401
        assert "no user ID" in exc_info.value.detail
