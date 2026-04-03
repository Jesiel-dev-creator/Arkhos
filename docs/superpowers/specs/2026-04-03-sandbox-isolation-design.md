# Sandbox Isolation + Preview Proxy

**Date:** 2026-04-03
**Status:** Approved

---

## Overview

Add per-generation port isolation and a reverse proxy so multiple users can preview generated sites concurrently. Phase A (launch): single container, dynamic ports. Phase B (growth): one container per generation via Docker API — same proxy interface, frontend doesn't change.

---

## Architecture

```
Frontend iframe
  → GET /api/preview/{generation_id}/{path}
    → FastAPI proxy (knows gen_id → port mapping)
      → localhost:{dynamic_port} (Vite dev server in sandbox container)

WebSocket (Vite HMR):
  → ws://.../api/preview/{generation_id}/
    → FastAPI WebSocket bridge
      → ws://localhost:{dynamic_port}/
```

### Phase A (launch, 1-5 concurrent users)
- Single sandbox container
- Multiple Vite servers on ports 3010-3060 (50 slots)
- FastAPI reverse proxy routes by generation_id
- PortManager tracks allocation + TTL

### Phase B (growth, 5-50 concurrent users)
- One container per active generation via Docker API
- Same proxy interface — frontend unchanged
- PortManager swaps from port pool to container pool

---

## Components

### 1. PortManager (`backend/arkhos/sandbox/ports.py`)

Manages port allocation, user mapping, and TTL cleanup.

```python
class PortManager:
    PORT_RANGE = range(3010, 3061)  # 50 concurrent slots
    TTL_SECONDS = 900               # 15 minutes idle

    def allocate(gen_id: str, user_id: str) -> int
    def release(gen_id: str) -> None
    def get_port(gen_id: str) -> int | None
    def touch(gen_id: str) -> None          # reset TTL on access
    def get_expired() -> list[tuple[str, int]]
```

**Allocation logic:**
1. If user has an active generation, kill its Vite server and release the port
2. Pop next free port from pool
3. Map gen_id → port, user_id → gen_id
4. Record allocation time for TTL

**Thread safety:** asyncio.Lock on all mutations.

### 2. Preview Proxy (`backend/arkhos/routes.py`)

**HTTP proxy:** `GET /api/preview/{generation_id}/{path:path}`
- Looks up port via PortManager
- Forwards request to `http://localhost:{port}/{path}` via httpx
- Copies response headers + body back to client
- Calls `port_manager.touch(gen_id)` to reset TTL
- Returns 404 if generation not found or port not allocated

**WebSocket proxy:** `WS /api/preview/{generation_id}/`
- Accepts WebSocket from browser
- Connects to `ws://localhost:{port}/` (Vite HMR)
- Bidirectional message forwarding
- Closes both sides on disconnect

### 3. SandboxExecutor Changes

`scaffold_project()` gains a `port` parameter:
- Vite config template uses `server.port = {port}` instead of hardcoded 3000
- HMR config uses same port

### 4. Pipeline Integration

MCP pipeline (`run_pipeline_streaming_mcp`):
- Before scaffold: `port = port_manager.allocate(gen_id, user_id)`
- Pass port to `sandbox_executor.scaffold_project(port=port)`
- `sandbox_start` SSE event includes `preview_url: "/api/preview/{gen_id}/"`
- On pipeline error: `port_manager.release(gen_id)`

### 5. TTL Cleanup

Background task in FastAPI lifespan (runs every 60s):
- Calls `port_manager.get_expired(TTL_SECONDS)`
- For each expired: kill Vite process on that port, release port
- Uses sandbox `/execute` to run `kill $(lsof -t -i:{port})`

**Kill-on-new-generation:**
- Happens inside `port_manager.allocate()` when user already has an active gen
- Immediate — no waiting for TTL

### 6. docker-compose Changes

Expose port range instead of single port:
```yaml
ports:
  - "8001:8001"        # API
  - "3010-3060:3010-3060"  # Dynamic Vite servers
```

### 7. Frontend Changes

Single change in workspace page:
- iframe `src` changes from `http://localhost:3001` (hardcoded) to `/api/preview/{generation_id}/` (from `sandbox_start` SSE event)
- Already receives `preview_url` from SSE — just needs to use relative URL instead of absolute

---

## Flow

```
User clicks Generate
  │
  ├─ POST /api/generate-mcp → generation_id + user_id
  │
  ├─ PortManager.allocate(gen_id, user_id)
  │   ├─ Kill user's previous Vite server (if any)
  │   ├─ Pick next free port (e.g. 3017)
  │   └─ Return 3017
  │
  ├─ SandboxExecutor.scaffold_project(port=3017)
  │   ├─ Write vite.config.ts with port 3017
  │   ├─ pnpm install (cached, ~2s)
  │   └─ Start Vite on port 3017
  │
  ├─ SSE: sandbox_start {preview_url: "/api/preview/{gen_id}/"}
  │
  ├─ Frontend iframe src="/api/preview/{gen_id}/"
  │   ├─ HTTP: FastAPI → localhost:3017
  │   └─ WS: FastAPI → ws://localhost:3017 (HMR)
  │
  ├─ Builder streams files → sandbox → Vite HMR → iframe updates live
  │
  └─ Cleanup (whichever comes first):
      ├─ User starts new generation → immediate kill
      └─ 15 min idle → background task kills
```

---

## Files Changed

| File | Change |
|---|---|
| **New:** `backend/arkhos/sandbox/ports.py` | PortManager class |
| **Modify:** `backend/arkhos/routes.py` | HTTP + WebSocket preview proxy endpoints |
| **Modify:** `backend/arkhos/app.py` | PortManager singleton, cleanup background task |
| **Modify:** `backend/arkhos/generation/sandbox_executor.py` | Dynamic port in scaffold, Vite config template |
| **Modify:** `backend/arkhos/pipeline.py` | Allocate port before scaffold in MCP pipeline |
| **Modify:** `frontend/app/[locale]/generate/[id]/page.tsx` | Use proxied preview URL from SSE |
| **Modify:** `arkhos-sandbox/docker-compose.yml` | Expose port range 3010-3060 |

## Files NOT Changed

- `arkhos-sandbox/app.py` — no changes, just runs commands
- `backend/arkhos/sandbox/client.py` — same API
- `frontend/hooks/use-sse.ts` — already handles sandbox events
- Frontend translation files — no new strings

---

## What This Does NOT Cover

- Ephemeral containers (Phase B) — same proxy interface, different backend
- Screenshot capture for thumbnails — separate feature
- Nginx production proxy — replace FastAPI proxy with Nginx when scaling
- HTTPS/TLS for preview — handled by production reverse proxy
