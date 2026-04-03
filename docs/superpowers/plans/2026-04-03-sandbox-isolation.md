# Sandbox Isolation + Preview Proxy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Per-generation port isolation with a FastAPI reverse proxy so multiple users can preview generated sites concurrently, with TTL cleanup and kill-on-new-generation.

**Architecture:** PortManager allocates ports 3010-3060, SandboxExecutor scaffolds Vite on the allocated port, FastAPI proxies HTTP + WebSocket to the right port by generation_id. Background task kills idle servers after 15 min. User's previous generation is killed when they start a new one.

**Tech Stack:** FastAPI, httpx, websockets, asyncio

**Spec:** `docs/superpowers/specs/2026-04-03-sandbox-isolation-design.md`

---

## File Structure

### New Files

```
backend/arkhos/sandbox/ports.py          — PortManager class (allocate, release, TTL, cleanup)
backend/tests/test_ports.py              — PortManager unit tests
```

### Modified Files

```
backend/arkhos/app.py                    — PortManager singleton, cleanup background task
backend/arkhos/routes.py                 — HTTP + WebSocket preview proxy endpoints
backend/arkhos/generation/sandbox_executor.py  — Dynamic port parameter in scaffold
backend/arkhos/pipeline.py               — Allocate port before scaffold in MCP pipeline
frontend/app/[locale]/generate/[id]/page.tsx   — Use proxied preview URL from SSE
arkhos-sandbox/docker-compose.yml        — Expose port range
```

---

### Task 1: PortManager

**Files:**
- Create: `backend/arkhos/sandbox/ports.py`
- Create: `backend/tests/test_ports.py`

- [ ] **Step 1: Write failing tests**

```python
# backend/tests/test_ports.py
"""Tests for PortManager."""

import pytest
import asyncio
from arkhos.sandbox.ports import PortManager


@pytest.fixture
def pm():
    return PortManager(port_range=range(4010, 4015), ttl_seconds=2)


def test_allocate_returns_port(pm):
    port = pm.allocate("gen-1", "user-1")
    assert port in range(4010, 4015)


def test_allocate_different_gens_get_different_ports(pm):
    p1 = pm.allocate("gen-1", "user-1")
    p2 = pm.allocate("gen-2", "user-2")
    assert p1 != p2


def test_get_port_returns_allocated(pm):
    port = pm.allocate("gen-1", "user-1")
    assert pm.get_port("gen-1") == port


def test_get_port_unknown_returns_none(pm):
    assert pm.get_port("nonexistent") is None


def test_release_frees_port(pm):
    port = pm.allocate("gen-1", "user-1")
    pm.release("gen-1")
    assert pm.get_port("gen-1") is None
    # Port should be reusable
    port2 = pm.allocate("gen-2", "user-2")
    assert port2 == port  # recycled from pool


def test_kill_on_new_generation(pm):
    """When same user starts new gen, previous gen's port is released."""
    p1 = pm.allocate("gen-1", "user-1")
    p2 = pm.allocate("gen-2", "user-1")  # same user
    assert pm.get_port("gen-1") is None  # old gen released
    assert pm.get_port("gen-2") == p2
    assert p1 != p2


def test_pool_exhaustion_raises(pm):
    """Pool of 5 ports should exhaust after 5 allocations."""
    for i in range(5):
        pm.allocate(f"gen-{i}", f"user-{i}")
    with pytest.raises(RuntimeError, match="No free ports"):
        pm.allocate("gen-5", "user-5")


def test_get_expired(pm):
    """After TTL, ports show as expired."""
    import time
    pm.allocate("gen-1", "user-1")
    time.sleep(2.1)  # TTL is 2s in test fixture
    expired = pm.get_expired()
    assert len(expired) == 1
    assert expired[0][0] == "gen-1"


def test_touch_resets_ttl(pm):
    """Touching a port resets its TTL."""
    import time
    pm.allocate("gen-1", "user-1")
    time.sleep(1.5)
    pm.touch("gen-1")
    time.sleep(1.0)  # 1.0s after touch, still within 2s TTL
    expired = pm.get_expired()
    assert len(expired) == 0
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /home/jesiel/projects/Arkhos/backend && python3 -m pytest tests/test_ports.py -v
```

Expected: ImportError — `arkhos.sandbox.ports` doesn't exist yet.

- [ ] **Step 3: Implement PortManager**

```python
# backend/arkhos/sandbox/ports.py
"""Port allocation manager for per-generation Vite dev servers."""

from __future__ import annotations

import logging
import time
import threading

logger = logging.getLogger(__name__)

DEFAULT_PORT_RANGE = range(3010, 3061)  # 50 slots
DEFAULT_TTL = 900  # 15 minutes


class PortManager:
    """Manages dynamic port allocation for sandbox Vite servers.

    Features:
    - Allocates ports from a fixed pool
    - Maps generation_id → port and user_id → generation_id
    - Kill-on-new-generation: same user starting new gen releases previous
    - TTL tracking: get_expired() returns ports idle longer than ttl_seconds
    - Thread-safe via threading.Lock
    """

    def __init__(
        self,
        port_range: range = DEFAULT_PORT_RANGE,
        ttl_seconds: int = DEFAULT_TTL,
    ) -> None:
        self._lock = threading.Lock()
        self._pool: list[int] = list(reversed(list(port_range)))  # stack, pop from end
        self._gen_to_port: dict[str, int] = {}
        self._user_to_gen: dict[str, str] = {}
        self._last_access: dict[str, float] = {}
        self._ttl = ttl_seconds

    def allocate(self, gen_id: str, user_id: str) -> int:
        """Allocate a port for a generation. Kills user's previous gen if any."""
        with self._lock:
            # Kill-on-new-generation
            if user_id in self._user_to_gen:
                old_gen = self._user_to_gen[user_id]
                self._release_locked(old_gen)
                logger.info("Killed previous gen %s for user %s", old_gen, user_id)

            if not self._pool:
                raise RuntimeError("No free ports available")

            port = self._pool.pop()
            self._gen_to_port[gen_id] = port
            self._user_to_gen[user_id] = gen_id
            self._last_access[gen_id] = time.monotonic()
            logger.info("Allocated port %d for gen %s (user %s)", port, gen_id, user_id)
            return port

    def release(self, gen_id: str) -> None:
        """Release a port back to the pool."""
        with self._lock:
            self._release_locked(gen_id)

    def _release_locked(self, gen_id: str) -> None:
        """Internal release — caller must hold lock."""
        port = self._gen_to_port.pop(gen_id, None)
        if port is not None:
            self._pool.append(port)
            logger.info("Released port %d for gen %s", port, gen_id)
        self._last_access.pop(gen_id, None)
        # Clean user mapping
        for uid, gid in list(self._user_to_gen.items()):
            if gid == gen_id:
                del self._user_to_gen[uid]
                break

    def get_port(self, gen_id: str) -> int | None:
        """Get the port for a generation, or None if not allocated."""
        return self._gen_to_port.get(gen_id)

    def touch(self, gen_id: str) -> None:
        """Reset the TTL for a generation (called on each preview request)."""
        if gen_id in self._last_access:
            self._last_access[gen_id] = time.monotonic()

    def get_expired(self) -> list[tuple[str, int]]:
        """Return list of (gen_id, port) for generations idle past TTL."""
        now = time.monotonic()
        expired = []
        with self._lock:
            for gen_id, last in list(self._last_access.items()):
                if now - last > self._ttl:
                    port = self._gen_to_port.get(gen_id)
                    if port is not None:
                        expired.append((gen_id, port))
        return expired
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /home/jesiel/projects/Arkhos/backend && python3 -m pytest tests/test_ports.py -v
```

Expected: All 9 tests pass.

- [ ] **Step 5: Update sandbox __init__.py exports**

Add to `backend/arkhos/sandbox/__init__.py`:

```python
from arkhos.sandbox.ports import PortManager
```

And update `__all__`:

```python
__all__ = ["SandboxClient", "SandboxResult", "PortManager"]
```

- [ ] **Step 6: Commit**

```bash
git add backend/arkhos/sandbox/ports.py backend/arkhos/sandbox/__init__.py backend/tests/test_ports.py
git commit -m "feat(sandbox): PortManager with allocation, TTL, kill-on-new-gen"
```

---

### Task 2: PortManager Singleton + Cleanup Background Task

**Files:**
- Modify: `backend/arkhos/app.py`

- [ ] **Step 1: Add PortManager singleton and cleanup task**

In `backend/arkhos/app.py`, add import at top:

```python
from arkhos.sandbox import PortManager
```

Add singleton after the existing singletons (after `skill_registry = load_skills()`):

```python
port_manager = PortManager()
```

Modify the `lifespan` function to start the cleanup background task:

```python
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan: startup and shutdown."""
    skill_count = sum(len(v) for v in skill_registry.values())
    logger.info(
        "ArkhosAI v%s starting (telemetry: %d outcomes, skills: %d, memory: %s)",
        __version__, telemetry.total_outcomes, skill_count, memory.stats(),
    )

    # Start port cleanup background task
    cleanup_task = asyncio.create_task(_port_cleanup_loop())

    yield

    cleanup_task.cancel()
    logger.info("ArkhosAI shutting down")


async def _port_cleanup_loop() -> None:
    """Kill Vite servers idle past TTL every 60 seconds."""
    from arkhos.sandbox import SandboxClient

    sandbox = SandboxClient()
    while True:
        await asyncio.sleep(60)
        expired = port_manager.get_expired()
        for gen_id, port in expired:
            try:
                await sandbox.execute(f"kill $(lsof -t -i:{port}) 2>/dev/null || true")
                port_manager.release(gen_id)
                logger.info("Cleanup: killed idle Vite on port %d (gen %s)", port, gen_id)
            except Exception as e:
                logger.warning("Cleanup failed for port %d: %s", port, e)
```

Also add `import asyncio` at the top if not already present.

- [ ] **Step 2: Verify app starts**

```bash
cd /home/jesiel/projects/Arkhos/backend && python3 -c "from arkhos.app import app, port_manager; print('OK, pool size:', len(port_manager._pool))"
```

Expected: `OK, pool size: 51`

- [ ] **Step 3: Commit**

```bash
git add backend/arkhos/app.py
git commit -m "feat(sandbox): PortManager singleton + TTL cleanup background task"
```

---

### Task 3: SandboxExecutor Dynamic Port

**Files:**
- Modify: `backend/arkhos/generation/sandbox_executor.py`

- [ ] **Step 1: Add port parameter to scaffold_project**

In `sandbox_executor.py`, modify `scaffold_project` signature:

```python
async def scaffold_project(self, project_name: str = "arkhos-app", port: int = 3000) -> dict:
```

Replace the hardcoded Vite config in `SCAFFOLD_FILES` — move it from a module-level constant to a method that accepts the port. Change the `scaffold_project` method to generate the vite config dynamically:

After `await self.sandbox.execute(f"mkdir -p ...")`, before the scaffold file loop, insert:

```python
            # Generate Vite config with dynamic port
            dynamic_vite_config = f"""import {{ defineConfig }} from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({{
  plugins: [react()],
  server: {{
    host: '0.0.0.0',
    port: {port},
    watch: {{
      usePolling: true,
      interval: 100,
    }},
    hmr: {{
      port: {port},
    }},
  }},
}})"""
```

Then in the scaffold file loop, replace the static `vite.config.ts` with the dynamic one:

```python
            for filepath, content in SCAFFOLD_FILES.items():
                # Use dynamic Vite config instead of static one
                if filepath == "vite.config.ts":
                    content = dynamic_vite_config
                full_path = f"{self.workspace}/{filepath}"
                result = await self.sandbox.write_file(path=full_path, content=content)
```

Also update the `pnpm dev` command to not specify a port (Vite reads it from config):

The existing command is:
```python
"nohup pnpm dev > /tmp/dev-server.log 2>&1 &"
```

This is fine — Vite reads the port from `vite.config.ts`. No change needed.

Store the port for the proxy URL:

```python
            self._port = port
```

And update the preview_url in the return to use the proxy path instead of a direct URL:

```python
            return {
                "success": True,
                "preview_url": self.preview_url,
                "port": port,
                "stage": "running",
                "duration_s": elapsed,
            }
```

- [ ] **Step 2: Update SCAFFOLD_FILES to remove the static vite.config.ts**

Change the `vite.config.ts` entry in `SCAFFOLD_FILES` to a placeholder that gets overridden:

```python
    "vite.config.ts": "",  # overridden with dynamic port in scaffold_project()
```

- [ ] **Step 3: Verify it compiles**

```bash
cd /home/jesiel/projects/Arkhos/backend && python3 -c "from arkhos.generation import SandboxExecutor; print('OK')"
```

- [ ] **Step 4: Commit**

```bash
git add backend/arkhos/generation/sandbox_executor.py
git commit -m "feat(sandbox): dynamic port in scaffold_project for per-gen isolation"
```

---

### Task 4: HTTP Preview Proxy

**Files:**
- Modify: `backend/arkhos/routes.py`

- [ ] **Step 1: Add HTTP preview proxy endpoint**

Add these imports at the top of `routes.py`:

```python
import httpx as _httpx
from starlette.responses import Response
```

Add the proxy endpoint (before the `# ── Result / Gallery` section):

```python
# ── Preview Proxy ────────────────────────────────────────────────


@router.get("/preview/{generation_id}/{path:path}")
@router.get("/preview/{generation_id}")
async def preview_proxy(generation_id: str, path: str = "") -> Response:
    """Reverse proxy to the generation's Vite dev server."""
    from arkhos.app import port_manager

    port = port_manager.get_port(generation_id)
    if port is None:
        raise HTTPException(status_code=404, detail="Preview not available")

    port_manager.touch(generation_id)

    target_url = f"http://localhost:{port}/{path}"
    try:
        async with _httpx.AsyncClient() as client:
            resp = await client.get(target_url, timeout=10.0, follow_redirects=True)
            return Response(
                content=resp.content,
                status_code=resp.status_code,
                headers={
                    k: v for k, v in resp.headers.items()
                    if k.lower() not in ("transfer-encoding", "connection")
                },
            )
    except _httpx.ConnectError:
        raise HTTPException(status_code=502, detail="Preview server not ready")
    except _httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Preview server timeout")
```

- [ ] **Step 2: Test manually**

Start backend, allocate a port manually, verify proxy returns 404 for unknown gen:

```bash
curl -s http://localhost:8000/api/preview/nonexistent/ -o /dev/null -w "%{http_code}"
```

Expected: `404`

- [ ] **Step 3: Commit**

```bash
git add backend/arkhos/routes.py
git commit -m "feat(proxy): HTTP reverse proxy for per-gen preview"
```

---

### Task 5: WebSocket Preview Proxy (Vite HMR)

**Files:**
- Modify: `backend/arkhos/routes.py`

- [ ] **Step 1: Install websockets**

```bash
cd /home/jesiel/projects/Arkhos/backend && pip install websockets
```

Add `websockets>=12.0` to `pyproject.toml` dependencies.

- [ ] **Step 2: Add WebSocket proxy endpoint**

Add import at top of `routes.py`:

```python
import websockets
from fastapi import WebSocket, WebSocketDisconnect
```

Add the WebSocket proxy after the HTTP proxy:

```python
@router.websocket("/preview/{generation_id}/")
async def preview_ws_proxy(ws: WebSocket, generation_id: str) -> None:
    """WebSocket proxy for Vite HMR."""
    from arkhos.app import port_manager

    port = port_manager.get_port(generation_id)
    if port is None:
        await ws.close(code=4004, reason="Preview not available")
        return

    port_manager.touch(generation_id)
    await ws.accept()

    try:
        async with websockets.connect(f"ws://localhost:{port}/") as vite_ws:
            async def browser_to_vite():
                try:
                    async for msg in ws.iter_text():
                        await vite_ws.send(msg)
                except WebSocketDisconnect:
                    pass

            async def vite_to_browser():
                try:
                    async for msg in vite_ws:
                        await ws.send_text(msg)
                except websockets.ConnectionClosed:
                    pass

            await asyncio.gather(browser_to_vite(), vite_to_browser())
    except Exception as e:
        logger.warning("HMR proxy error for gen %s: %s", generation_id, e)
    finally:
        try:
            await ws.close()
        except Exception:
            pass
```

- [ ] **Step 3: Commit**

```bash
git add backend/arkhos/routes.py backend/pyproject.toml
git commit -m "feat(proxy): WebSocket proxy for Vite HMR over preview endpoint"
```

---

### Task 6: Pipeline Integration — Allocate Port Before Scaffold

**Files:**
- Modify: `backend/arkhos/pipeline.py`

- [ ] **Step 1: Update MCP pipeline to use PortManager**

In `run_pipeline_streaming_mcp`, find the sandbox scaffold section (around line 1036). Replace:

```python
        # ── Sandbox: scaffold + dev server BEFORE Builder ─────────
        # Lovable-style: start the preview first, files hot-reload as they stream in
        sandbox_executor: SandboxExecutor | None = None
        try:
            sandbox_executor = SandboxExecutor()
            scaffold_result = await sandbox_executor.scaffold_project(
                project_name=f"gen-{int(start_time)}",
            )
            if scaffold_result.get("success"):
                yield format_sse(SSEEventType.SANDBOX_START, {
                    "message": "Live preview ready — files will appear as they generate",
                    "preview_url": scaffold_result.get("preview_url"),
                })
```

With:

```python
        # ── Sandbox: scaffold + dev server BEFORE Builder ─────────
        # Lovable-style: start the preview first, files hot-reload as they stream in
        sandbox_executor: SandboxExecutor | None = None
        sandbox_port: int | None = None
        try:
            from arkhos.app import port_manager
            gen_name = f"gen-{int(start_time)}"
            # user_id comes from request context — fallback to gen_name for now
            user_id = gen_name  # TODO: pass real user_id through pipeline
            sandbox_port = port_manager.allocate(gen_name, user_id)
            sandbox_executor = SandboxExecutor()
            scaffold_result = await sandbox_executor.scaffold_project(
                project_name=gen_name,
                port=sandbox_port,
            )
            if scaffold_result.get("success"):
                yield format_sse(SSEEventType.SANDBOX_START, {
                    "message": "Live preview ready — files will appear as they generate",
                    "preview_url": f"/api/preview/{gen_name}/",
                })
```

Also update the error handling to release the port on failure:

```python
            else:
                logger.warning("Sandbox scaffold failed: %s", scaffold_result.get("error"))
                if sandbox_port:
                    port_manager.release(gen_name)
                sandbox_executor = None
        except Exception as e:
            logger.warning("Sandbox unavailable, falling back to batch: %s", e)
            if sandbox_port:
                from arkhos.app import port_manager
                port_manager.release(f"gen-{int(start_time)}")
            sandbox_executor = None
```

And update the sandbox_complete event at the end to use the proxy URL:

Find:
```python
        if sandbox_executor:
            yield format_sse(SSEEventType.SANDBOX_COMPLETE, {
                "success": True,
                "preview_url": sandbox_executor.preview_url,
```

Replace with:
```python
        if sandbox_executor:
            yield format_sse(SSEEventType.SANDBOX_COMPLETE, {
                "success": True,
                "preview_url": f"/api/preview/gen-{int(start_time)}/",
```

- [ ] **Step 2: Verify it compiles**

```bash
cd /home/jesiel/projects/Arkhos/backend && python3 -c "from arkhos.pipeline import run_pipeline_streaming_mcp; print('OK')"
```

- [ ] **Step 3: Commit**

```bash
git add backend/arkhos/pipeline.py
git commit -m "feat(pipeline): allocate dynamic port before scaffold, use proxy URL"
```

---

### Task 7: Frontend — Use Proxied Preview URL

**Files:**
- Modify: `frontend/app/[locale]/generate/[id]/page.tsx`

- [ ] **Step 1: Update iframe to use preview URL from SSE**

In the workspace page, find where `sandboxReady` is used (around line 348). The current code:

```tsx
const sandboxReady = state.sandbox.status === "running" && state.sandbox.previewUrl;
```

The `sandbox.previewUrl` will now be `/api/preview/{gen_id}/` instead of `http://localhost:3001`. The iframe already uses this value, but it needs to resolve to a full URL. Since it's a relative path, it will be relative to the frontend (localhost:3000). We need it to point to the backend (localhost:8000).

Update the iframe src to use the backend API base:

Find the sandbox iframe:
```tsx
<iframe src={state.sandbox.previewUrl!} className="w-full h-full border-0" sandbox="allow-scripts allow-same-origin" title="Live sandbox preview" />
```

Replace with:
```tsx
<iframe src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}${state.sandbox.previewUrl}`} className="w-full h-full border-0" sandbox="allow-scripts allow-same-origin" title="Live sandbox preview" />
```

- [ ] **Step 2: Verify build**

```bash
cd /home/jesiel/projects/Arkhos/frontend && pnpm next build
```

- [ ] **Step 3: Commit**

```bash
git add frontend/app/[locale]/generate/[id]/page.tsx
git commit -m "feat(workspace): use proxied preview URL from backend"
```

---

### Task 8: docker-compose Port Range

**Files:**
- Modify: `arkhos-sandbox/docker-compose.yml`

- [ ] **Step 1: Expose port range**

Replace the single port mapping:

```yaml
ports:
  - "8001:8001"
  - "3001:3000"
```

With the range:

```yaml
ports:
  - "8001:8001"
  - "3010-3060:3010-3060"
```

- [ ] **Step 2: Rebuild sandbox**

Run in Ubuntu terminal:
```bash
cd ~/arkhos-sandbox
docker compose down
docker compose up -d --build
```

- [ ] **Step 3: Verify ports are exposed**

```bash
docker port arkhos-sandbox | head -10
```

Expected: Shows 8001 and 3010-3060 mappings.

- [ ] **Step 4: Commit**

```bash
git add arkhos-sandbox/docker-compose.yml
git commit -m "feat(sandbox): expose port range 3010-3060 for per-gen isolation"
```

---

### Task 9: Integration Test

**Files:** None (verification only)

- [ ] **Step 1: Run all backend tests**

```bash
cd /home/jesiel/projects/Arkhos/backend && python3 -m pytest tests/ -v
```

Expected: All tests pass (including new port manager tests).

- [ ] **Step 2: Build frontend**

```bash
cd /home/jesiel/projects/Arkhos/frontend && pnpm next build
```

Expected: Clean build.

- [ ] **Step 3: Manual smoke test**

Start both servers:
```bash
# Terminal 1
cd backend && uvicorn arkhos.app:app --host 0.0.0.0 --port 8000

# Terminal 2
cd frontend && pnpm dev
```

Test flow:
1. Login → Dashboard → New project
2. Enter prompt, click Generate
3. Watch pipeline panel — should show sandbox_start with `/api/preview/gen-xxx/` URL
4. Preview iframe loads via proxy
5. Files stream in — Vite HMR updates preview live
6. Start another generation — previous Vite server killed automatically
7. Wait 15+ min (or restart backend) — idle port cleaned up

- [ ] **Step 4: Commit**

```bash
git commit --allow-empty -m "test: sandbox isolation integration verified"
```
