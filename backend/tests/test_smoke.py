"""Smoke tests for ArkhosAI backend — no Mistral API key needed."""

from __future__ import annotations

import pytest
from httpx import ASGITransport, AsyncClient

from arkhos.app import app


@pytest.fixture
async def client() -> AsyncClient:
    """Create an async test client."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_health(client: AsyncClient) -> None:
    """Health endpoint returns OK."""
    r = await client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_generate_empty_prompt(client: AsyncClient) -> None:
    """Generate rejects empty prompts."""
    r = await client.post("/api/generate", json={"prompt": "", "locale": "en"})
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_result_not_found(client: AsyncClient) -> None:
    """Result 404 for unknown ID."""
    r = await client.get("/api/result/nonexistent123")
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_stream_not_found(client: AsyncClient) -> None:
    """Stream 404 for unknown ID."""
    r = await client.get("/api/stream/nonexistent123")
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_gallery_empty(client: AsyncClient) -> None:
    """Gallery returns empty list."""
    r = await client.get("/api/gallery")
    assert r.status_code == 200
    assert r.json() == []


@pytest.mark.asyncio
async def test_generate_returns_id(client: AsyncClient) -> None:
    """Generate returns a generation_id."""
    r = await client.post(
        "/api/generate", json={"prompt": "A simple page", "locale": "en"}
    )
    assert r.status_code == 200
    data = r.json()
    assert "generation_id" in data
    assert len(data["generation_id"]) == 12


@pytest.mark.asyncio
async def test_approve_not_found(client: AsyncClient) -> None:
    """Approve 404 for unknown ID."""
    r = await client.post("/api/approve/nonexistent123")
    assert r.status_code == 404


def test_sanitization() -> None:
    """Sanitize removes dangerous content."""
    from arkhos.sanitize import sanitize_prompt

    assert sanitize_prompt("<script>alert('xss')</script>") == "alert('xss')"
    assert sanitize_prompt("javascript:alert(1)") == "alert(1)"
    assert sanitize_prompt("normal text") == "normal text"
    assert sanitize_prompt("  lots   of   spaces  ") == "lots of spaces"
