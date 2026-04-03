# arkhos/generation/sandbox_executor.py
"""Sandbox executor for ArkhosAI — writes generated code to the sandbox and runs it."""

from __future__ import annotations

import base64
import logging
import shlex
import time

from arkhos.config import get_settings
from arkhos.sandbox import SandboxClient

logger = logging.getLogger(__name__)

# Sandbox runs as user 'sandbox', /workspace is root-owned.
# Use /home/sandbox as writable workspace root.
WORKSPACE_ROOT = "/home/sandbox"


class SandboxExecutor:
    """Handles writing generated code to the sandbox and running it.

    Works in both modes:
    - Cloud: sandbox hosted on Scaleway (ARKHOS_SANDBOX_URL env var)
    - Local: sandbox on user's machine (default localhost:8001)
    """

    def __init__(
        self,
        sandbox_url: str | None = None,
        preview_url: str | None = None,
    ) -> None:
        settings = get_settings()
        self.sandbox = SandboxClient(base_url=sandbox_url or settings.sandbox_url)
        self.preview_url = preview_url or settings.sandbox_preview_url

    async def execute_generated_project(
        self,
        project_files: dict[str, str],
        project_name: str = "arkhos-generated-app",
    ) -> dict:
        """Full flow: health check → write files → pnpm install → dev server."""
        workspace = f"{WORKSPACE_ROOT}/{shlex.quote(project_name)}"
        t0 = time.monotonic()

        try:
            # Step 0: Check sandbox is reachable (retries for cold starts)
            if not await self.sandbox.health_check():
                elapsed = round(time.monotonic() - t0, 2)
                logger.warning("Sandbox unreachable after retries (%.2fs)", elapsed)
                return {
                    "success": False,
                    "error": "Sandbox container not reachable",
                    "stage": "connection",
                    "duration_s": elapsed,
                }

            # Step 1: Create workspace directory
            await self.sandbox.execute(f"mkdir -p {shlex.quote(workspace)}")

            # Step 2: Write all files via base64 (avoids shell injection + /write-file bugs)
            for filepath, content in project_files.items():
                safe_path = shlex.quote(f"{workspace}/{filepath}")
                b64 = base64.b64encode(content.encode()).decode()
                result = await self.sandbox.execute(
                    f"mkdir -p $(dirname {safe_path}) && echo {b64} | base64 -d > {safe_path}"
                )
                if not result.success:
                    elapsed = round(time.monotonic() - t0, 2)
                    logger.error("Failed to write %s: %s", filepath, result.stderr[:200])
                    return {
                        "success": False,
                        "error": f"Failed to write {filepath}: {result.stderr[:200]}",
                        "stage": "write",
                        "duration_s": elapsed,
                    }

            write_elapsed = round(time.monotonic() - t0, 2)
            logger.info("Sandbox: %d files written (%.2fs)", len(project_files), write_elapsed)

            # Step 3: Install dependencies
            install_result = await self.sandbox.execute("pnpm install", cwd=workspace)

            if not install_result.success:
                elapsed = round(time.monotonic() - t0, 2)
                return {
                    "success": False,
                    "error": f"pnpm install failed: {install_result.stderr[:500]}",
                    "stage": "install",
                    "duration_s": elapsed,
                }

            logger.info("Sandbox: pnpm install OK (%.2fs)", install_result.duration_s)

            # Step 4: Start dev server in background
            await self.sandbox.execute(
                "nohup pnpm dev > /tmp/dev-server.log 2>&1 &",
                cwd=workspace,
                timeout=10,
            )

            elapsed = round(time.monotonic() - t0, 2)
            logger.info("Sandbox: dev server started, total %.2fs", elapsed)

            return {
                "success": True,
                "preview_url": self.preview_url,
                "message": "Project running in sandbox",
                "stage": "running",
                "duration_s": elapsed,
            }

        except Exception as e:
            elapsed = round(time.monotonic() - t0, 2)
            logger.error("Sandbox execution failed (%.2fs): %s", elapsed, e)
            return {
                "success": False,
                "error": str(e),
                "stage": "unknown",
                "duration_s": elapsed,
            }

    async def close(self) -> None:
        await self.sandbox.close()

    async def __aenter__(self) -> SandboxExecutor:
        return self

    async def __aexit__(self, *args) -> None:
        await self.close()
