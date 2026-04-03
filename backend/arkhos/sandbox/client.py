# arkhos/sandbox/client.py
"""Sandbox client for ArkhosAI — async execution in Docker containers."""

from __future__ import annotations

import asyncio
import logging
import time
from dataclasses import dataclass
from typing import Any

import httpx

logger = logging.getLogger(__name__)


@dataclass
class SandboxResult:
    """Result of a sandbox command execution."""

    success: bool
    stdout: str
    stderr: str
    returncode: int
    duration_s: float = 0.0
    error: str | None = None


class SandboxClient:
    """Async sandbox client for executing code in sandbox containers.

    Works in both modes:
    - Cloud: sandbox hosted on Scaleway (production)
    - Local: sandbox on user's machine (GPU/self-hosted)
    """

    def __init__(
        self,
        base_url: str = "http://localhost:8001",
        timeout: float = 180.0,
        max_retries: int = 2,
        connect_retries: int = 2,
        connect_retry_delay: float = 1.5,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.max_retries = max_retries
        self.connect_retries = connect_retries
        self.connect_retry_delay = connect_retry_delay
        self._client: httpx.AsyncClient | None = None

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                timeout=self.timeout,
                limits=httpx.Limits(max_connections=10, max_keepalive_connections=5),
            )
        return self._client

    async def health_check(self) -> bool:
        """Check if the sandbox container is reachable, with retries for cold starts."""
        client = await self._get_client()
        for attempt in range(self.connect_retries + 1):
            try:
                # Sandbox has no /health — probe with a simple execute
                resp = await client.post(
                    f"{self.base_url}/execute",
                    json={"command": "echo ok"},
                    timeout=5.0,
                )
                if resp.status_code == 200:
                    return True
            except (httpx.ConnectError, httpx.TimeoutException):
                if attempt < self.connect_retries:
                    logger.debug(
                        "Sandbox not ready (attempt %d/%d), retrying in %.1fs...",
                        attempt + 1, self.connect_retries + 1, self.connect_retry_delay,
                    )
                    await asyncio.sleep(self.connect_retry_delay)
        return False

    async def execute(
        self,
        command: str,
        cwd: str = "/workspace",
        timeout: float | None = None,
    ) -> SandboxResult:
        """Execute a shell command in the sandbox container."""
        client = await self._get_client()
        payload = {"command": command, "cwd": cwd}
        t0 = time.monotonic()

        for attempt in range(self.max_retries + 1):
            try:
                response = await client.post(
                    f"{self.base_url}/execute",
                    json=payload,
                    timeout=timeout or self.timeout,
                )
                response.raise_for_status()
                data = response.json()
                elapsed = round(time.monotonic() - t0, 2)

                result = SandboxResult(
                    success=data.get("success", False),
                    stdout=data.get("stdout", ""),
                    stderr=data.get("stderr", ""),
                    returncode=data.get("returncode", -1),
                    duration_s=elapsed,
                    error=data.get("error"),
                )

                if result.success:
                    logger.debug("Sandbox OK (%.2fs): %s", elapsed, command[:80])
                else:
                    logger.warning(
                        "Sandbox FAIL (%.2fs): %s | %s",
                        elapsed, command[:80], result.stderr[:200],
                    )

                return result

            except httpx.TimeoutException:
                if attempt == self.max_retries:
                    elapsed = round(time.monotonic() - t0, 2)
                    logger.error("Sandbox timeout after %d attempts (%.2fs): %s", self.max_retries, elapsed, command[:80])
                    return SandboxResult(
                        success=False, stdout="", stderr="", returncode=-1,
                        duration_s=elapsed, error="Timeout",
                    )
                await asyncio.sleep(1)

            except Exception as e:
                if attempt == self.max_retries:
                    elapsed = round(time.monotonic() - t0, 2)
                    logger.error("Sandbox error (%.2fs): %s", elapsed, e)
                    return SandboxResult(
                        success=False, stdout="", stderr="", returncode=-1,
                        duration_s=elapsed, error=str(e),
                    )
                await asyncio.sleep(1)

        # Unreachable, but satisfies type checker
        return SandboxResult(success=False, stdout="", stderr="", returncode=-1, error="Exhausted retries")

    async def write_file(self, path: str, content: str) -> SandboxResult:
        """Write a file to the sandbox via JSON API (no shell interpolation)."""
        client = await self._get_client()
        t0 = time.monotonic()

        for attempt in range(self.max_retries + 1):
            try:
                response = await client.post(
                    f"{self.base_url}/write-file",
                    json={"path": path, "content": content},
                    timeout=self.timeout,
                )
                response.raise_for_status()
                data = response.json()
                elapsed = round(time.monotonic() - t0, 2)

                result = SandboxResult(
                    success=data.get("success", False),
                    stdout=data.get("stdout", ""),
                    stderr=data.get("stderr", ""),
                    returncode=data.get("returncode", 0),
                    duration_s=elapsed,
                    error=data.get("error"),
                )

                if result.success:
                    logger.debug("Sandbox write OK (%.2fs): %s", elapsed, path)
                else:
                    logger.warning("Sandbox write FAIL (%.2fs): %s | %s", elapsed, path, result.error)

                return result

            except httpx.TimeoutException:
                if attempt == self.max_retries:
                    elapsed = round(time.monotonic() - t0, 2)
                    logger.error("Sandbox write timeout (%.2fs): %s", elapsed, path)
                    return SandboxResult(
                        success=False, stdout="", stderr="", returncode=-1,
                        duration_s=elapsed, error="Timeout",
                    )
                await asyncio.sleep(1)

            except Exception as e:
                if attempt == self.max_retries:
                    elapsed = round(time.monotonic() - t0, 2)
                    logger.error("Sandbox write error (%.2fs): %s", elapsed, e)
                    return SandboxResult(
                        success=False, stdout="", stderr="", returncode=-1,
                        duration_s=elapsed, error=str(e),
                    )
                await asyncio.sleep(1)

        return SandboxResult(success=False, stdout="", stderr="", returncode=-1, error="Exhausted retries")

    async def close(self) -> None:
        """Close the HTTP client."""
        if self._client and not self._client.is_closed:
            await self._client.aclose()
            self._client = None

    async def __aenter__(self) -> SandboxClient:
        return self

    async def __aexit__(self, *args: Any) -> None:
        await self.close()
