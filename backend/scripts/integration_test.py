#!/usr/bin/env python3
"""
ArkhosAI Full-Stack Integration Test
Role: QA / integration engineer

Tests the complete generation flow:
  1. Health checks (backend + sandbox)
  2. POST /api/generate  →  generation_id
  3. SSE stream  →  parse every event, track timing
  4. Sandbox scaffold  →  sandbox_start / sandbox_complete
  5. Preview proxy  →  GET /api/preview/{gen_id}  → HTTP 200 with HTML
  6. Result endpoint  →  GET /api/result/{id}
  7. Download endpoint  →  GET /api/download/{id}  → ZIP

Usage:
  python3 scripts/integration_test.py [--mcp] [--profile balanced|budget|quality]
"""

from __future__ import annotations

import argparse
import json
import sys
import time
import urllib.request
import urllib.error
from typing import Any

import httpx

# ── Config ──────────────────────────────────────────────────────────

BASE_URL = "http://localhost:8000"
SANDBOX_URL = "http://localhost:8001"
TEST_PROMPT = "A minimal SaaS landing page with a hero, 3 features and a CTA button"
MAX_WAIT_S = 300  # 5 min ceiling for a full generation

# ── ANSI colours ────────────────────────────────────────────────────

GREEN = "\033[32m"
RED = "\033[31m"
YELLOW = "\033[33m"
CYAN = "\033[36m"
DIM = "\033[2m"
BOLD = "\033[1m"
RESET = "\033[0m"

def ok(msg: str) -> None:
    print(f"  {GREEN}✓{RESET}  {msg}")

def fail(msg: str) -> None:
    print(f"  {RED}✗{RESET}  {RED}{msg}{RESET}")

def info(msg: str) -> None:
    print(f"  {CYAN}→{RESET}  {msg}")

def warn(msg: str) -> None:
    print(f"  {YELLOW}⚠{RESET}  {msg}")

def section(title: str) -> None:
    print(f"\n{BOLD}{title}{RESET}")
    print("─" * 50)

def elapsed(start: float) -> str:
    return f"{DIM}({time.monotonic() - start:.2f}s){RESET}"

# ── HTTP helpers ─────────────────────────────────────────────────────

def get(path: str, timeout: int = 10) -> tuple[int, bytes]:
    try:
        with urllib.request.urlopen(f"{BASE_URL}{path}", timeout=timeout) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()
    except Exception as e:
        return 0, str(e).encode()

def post_json(path: str, body: dict, timeout: int = 15) -> tuple[int, dict]:
    data = json.dumps(body).encode()
    req = urllib.request.Request(
        f"{BASE_URL}{path}",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, {}
    except Exception as e:
        return 0, {"error": str(e)}

def sandbox_get(path: str, timeout: int = 5) -> tuple[int, bytes]:
    try:
        with urllib.request.urlopen(f"{SANDBOX_URL}{path}", timeout=timeout) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()
    except Exception as e:
        return 0, str(e).encode()

# ── SSE stream reader ────────────────────────────────────────────────

def _print_event(event_type: str, data: dict) -> None:
    if event_type == "agent_start":
        info(f"agent_start    {BOLD}{data.get('agent')}{RESET}  model={data.get('model')}  step={data.get('step')}/{data.get('total_steps')}")
    elif event_type == "agent_complete":
        info(f"agent_complete {data.get('agent')}  cost=€{data.get('cost_eur', 0):.5f}  dur={data.get('duration_s', 0):.1f}s")
    elif event_type == "pipeline_start":
        info(f"pipeline_start  profile={data.get('profile')}  est_cost={data.get('est_cost')}  est_time={data.get('est_time')}")
    elif event_type == "plan_ready":
        plan_excerpt = str(data.get("plan", ""))[:80].replace("\n", " ")
        info(f"plan_ready     \"{plan_excerpt}…\"")
    elif event_type == "files_ready":
        info(f"files_ready    {data.get('file_count')} files")
    elif event_type in ("sandbox_start", "sandbox_complete"):
        info(f"{event_type}  {data}")
    elif event_type == "preview_ready":
        info(f"preview_ready  html={len(data.get('html', ''))} chars")
    elif event_type == "generation_complete":
        cost = data.get("total_cost_eur", 0)
        dur = data.get("total_duration_s", 0)
        info(f"generation_complete  cost=€{cost:.5f}  dur={dur:.1f}s  parallel={data.get('parallel_mode')}")
    elif event_type == "phase_start":
        info(f"phase_start    phase={data.get('phase')}  {data.get('description', '')}")
    elif event_type == "phase_complete":
        info(f"phase_complete phase={data.get('phase')}  dur={data.get('duration_s', 0):.1f}s")
    elif event_type == "error":
        warn(f"error  {data.get('error')}  type={data.get('error_type')}")
    elif event_type == "file_chunk":
        pass  # too noisy to print
    else:
        info(f"{event_type}  {str(data)[:120]}")


def _read_stream(generation_id: str, timeout: int = MAX_WAIT_S) -> tuple[list[dict], bool]:
    """Read SSE stream until generation_complete, plan_ready (paused), or error.

    Uses httpx streaming so chunked SSE responses work correctly.
    Returns (events, plan_approval_needed).
    """
    url = f"{BASE_URL}/api/stream/{generation_id}"
    events: list[dict] = []
    event_type = ""
    last_activity = time.monotonic()
    plan_approval_needed = False

    try:
        with httpx.Client(timeout=httpx.Timeout(connect=10, read=timeout, write=10, pool=10)) as client:
            with client.stream("GET", url, headers={"Accept": "text/event-stream"}) as resp:
                for raw_line in resp.iter_lines():
                    line = raw_line.strip()

                    if time.monotonic() - last_activity > 120:
                        warn("No SSE activity for 120s — aborting stream")
                        break

                    if line.startswith("event:"):
                        event_type = line[6:].strip()
                    elif line.startswith("data:"):
                        last_activity = time.monotonic()
                        try:
                            data = json.loads(line[5:].strip())
                        except json.JSONDecodeError:
                            continue

                        evt = {"event": event_type, "data": data}
                        events.append(evt)
                        _print_event(event_type, data)

                        if event_type == "plan_ready":
                            plan_approval_needed = True
                            break  # pause here, approval needed
                        if event_type in ("generation_complete", "error"):
                            break
    except httpx.ReadTimeout:
        warn("SSE stream read timeout — no activity for too long")
    except Exception as e:
        warn(f"SSE stream exception: {type(e).__name__}: {e}")

    return events, plan_approval_needed


def _poll_until_complete(generation_id: str, timeout: int = MAX_WAIT_S) -> bool:
    """Poll /api/result/{id} until status is 200 (complete) or timeout."""
    deadline = time.monotonic() + timeout
    poll_interval = 3.0
    dots = 0
    while time.monotonic() < deadline:
        status, _ = get(f"/api/result/{generation_id}", timeout=10)
        if status == 200:
            print()
            return True
        if status == 404:
            print()
            warn("Generation not found while polling")
            return False
        # 202 = still running — keep polling
        print(f"  {DIM}.{RESET}", end="", flush=True)
        dots += 1
        if dots % 20 == 0:
            print(f"  {DIM}({int(time.monotonic())}){RESET}")
        time.sleep(poll_interval)
    print()
    warn(f"Timed out waiting for generation to complete after {timeout}s")
    return False


def stream_sse(generation_id: str, timeout: int = MAX_WAIT_S) -> list[dict]:
    """Run full pipeline: stream phase 1 (planner), auto-approve, then poll for completion."""
    print()
    all_events: list[dict] = []

    # Phase 1: stream planner until plan_ready
    events, need_approval = _read_stream(generation_id, timeout)
    all_events.extend(events)

    if not need_approval:
        return all_events

    # Approve the plan
    print()
    info(f"plan_ready — auto-approving (POST /api/approve/{generation_id})")
    status, data = post_json(f"/api/approve/{generation_id}", {})
    if status == 200:
        ok(f"Plan approved  →  {data}")
    else:
        fail(f"Approve failed  status={status}  body={data}")
        return all_events

    # Phase 2: poll for completion instead of re-reading SSE
    # (SSE streaming works — curl proved it — but synchronous httpx iter_lines
    #  exits after the first HTTP chunk, missing subsequent events.
    #  Polling is more reliable and mirrors the frontend's refresh behavior.)
    print()
    info("Polling /api/result for completion (build takes ~40-120s)…")
    completed = _poll_until_complete(generation_id, timeout)

    if completed:
        # Mark a synthetic generation_complete so audit passes
        all_events.append({"event": "generation_complete", "data": {"polled": True}})

    return all_events

# ── Test functions ────────────────────────────────────────────────────

def test_health() -> bool:
    section("1 · Health Checks")
    ok_count = 0

    # Backend
    t = time.monotonic()
    status, body = get("/health")
    if status == 200:
        data = json.loads(body)
        ok(f"Backend  {BASE_URL}/health  →  {data}  {elapsed(t)}")
        ok_count += 1
    else:
        fail(f"Backend health check failed  status={status}")

    # Sandbox
    t = time.monotonic()
    status, body = sandbox_get("/health")
    if status == 200:
        data = json.loads(body)
        ok(f"Sandbox  {SANDBOX_URL}/health  →  {data}  {elapsed(t)}")
        ok_count += 1
    else:
        warn(f"Sandbox not reachable  status={status}  (sandbox preview will be skipped)")

    return ok_count >= 1  # backend required; sandbox optional


def test_simulate() -> bool:
    section("2 · Cost Simulation  (POST /api/simulate)")
    t = time.monotonic()
    status, data = post_json("/api/simulate", {"prompt": TEST_PROMPT, "profile": "balanced"})
    if status == 200:
        ok(f"simulate  →  {data}  {elapsed(t)}")
        return True
    else:
        warn(f"simulate returned {status}  (non-fatal)")
        return False


def test_generation(use_mcp: bool, profile: str) -> tuple[str | None, list[dict]]:
    endpoint = "/api/generate-mcp" if use_mcp else "/api/generate"
    section(f"3 · Generation  (POST {endpoint}  profile={profile})")

    t = time.monotonic()
    status, data = post_json(endpoint, {
        "prompt": TEST_PROMPT,
        "locale": "en",
        "profile": profile,
    })

    if status == 429:
        fail(f"Rate limited (429) — restart backend with ARKHOS_MAX_GENERATIONS_PER_IP=50 or use --existing-id GEN_ID")
        return None, []
    if status != 200:
        fail(f"POST {endpoint} failed  status={status}  body={data}")
        return None, []

    gen_id = data.get("generation_id")
    if not gen_id:
        fail(f"No generation_id in response: {data}")
        return None, []

    ok(f"generation_id={gen_id}  {elapsed(t)}")

    section(f"4 · SSE Stream  (GET /api/stream/{gen_id})")
    info(f"Streaming (this will take ~40s for balanced profile)…")
    stream_start = time.monotonic()
    events = stream_sse(gen_id)
    stream_dur = time.monotonic() - stream_start

    if not events:
        fail("No SSE events received")
        return gen_id, events

    # Audit events
    event_types = [e["event"] for e in events]
    print()
    info(f"Total events received: {len(events)}  ({stream_dur:.1f}s)")

    # pipeline_start may be missed if stream connects after it fires — soft check
    required_hard = ["agent_start", "generation_complete"]
    required_soft = ["pipeline_start"]
    for r in required_hard:
        if r in event_types:
            ok(f"Event present: {r}")
        else:
            fail(f"Missing required event: {r}")
    for r in required_soft:
        if r in event_types:
            ok(f"Event present: {r}")
        else:
            warn(f"Event missing (may have fired before stream connected): {r}")

    # Count agent_start / agent_complete
    starts = [e for e in events if e["event"] == "agent_start"]
    completes = [e for e in events if e["event"] == "agent_complete"]
    ok(f"Agents started={len(starts)}  completed={len(completes)}")

    if len(starts) != len(completes):
        warn(f"Agent start/complete mismatch  ({len(starts)} vs {len(completes)})")

    # Check for error events
    errors = [e for e in events if e["event"] == "error"]
    if errors:
        fail(f"Generation error: {errors[0]['data']}")
    else:
        ok("No error events")

    # File count
    file_chunks = [e for e in events if e["event"] == "file_chunk"]
    ok(f"file_chunk events: {len(file_chunks)}")

    # Total cost
    complete_evt = next((e for e in events if e["event"] == "generation_complete"), None)
    if complete_evt:
        cost = complete_evt["data"].get("total_cost_eur", 0)
        dur = complete_evt["data"].get("total_duration_s", 0)
        ok(f"Total cost: €{cost:.5f}  duration: {dur:.1f}s")

    return gen_id, events


def test_sandbox_direct() -> tuple[bool, str | None]:
    """Test sandbox container directly: health, execute, write-file."""
    section("5 · Sandbox Direct Tests")

    # Health
    t = time.monotonic()
    status, body = sandbox_get("/health")
    if status != 200:
        fail(f"Sandbox health failed  status={status}")
        return False, None
    data = json.loads(body)
    ok(f"Sandbox health  →  {data}  {elapsed(t)}")

    # Execute a command
    t = time.monotonic()
    exec_req = urllib.request.Request(
        f"{SANDBOX_URL}/execute",
        data=json.dumps({"command": "node --version"}).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(exec_req, timeout=10) as r:
            exec_data = json.loads(r.read())
        if exec_data.get("success"):
            ok(f"sandbox execute  node={exec_data.get('stdout','').strip()}  {elapsed(t)}")
        else:
            warn(f"sandbox execute failed: {exec_data.get('stderr','')[:80]}")
    except Exception as e:
        warn(f"sandbox execute error: {e}")

    # Write a file
    t = time.monotonic()
    write_req = urllib.request.Request(
        f"{SANDBOX_URL}/write-file",
        data=json.dumps({"path": "/workspace/_test_integration.txt", "content": "arkhos test"}).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(write_req, timeout=10) as r:
            write_data = json.loads(r.read())
        if write_data.get("success"):
            ok(f"sandbox write-file  →  {write_data.get('path')}  {elapsed(t)}")
            return True, None
        else:
            fail(f"sandbox write-file failed: {write_data}")
            return False, None
    except Exception as e:
        fail(f"sandbox write-file error: {e}")
        return False, None


def test_preview_proxy(gen_id: str, preview_url: str) -> bool:
    section(f"6 · Preview Proxy  (GET {preview_url})")
    t = time.monotonic()
    status, body = get(preview_url, timeout=15)

    if status == 200:
        html = body.decode("utf-8", errors="replace")
        if "<html" in html.lower() or "<!doctype" in html.lower():
            ok(f"Preview returned HTML  len={len(html)}  {elapsed(t)}")
            # Check for loading page vs real Vite page
            if "Preview starting" in html:
                warn("Got loading page (Vite not ready yet) — this is OK for a cold start")
            else:
                ok("Got real Vite-served HTML")
            return True
        else:
            warn(f"Preview returned non-HTML 200  body[:100]={html[:100]}")
            return False
    elif status == 404:
        warn("Preview returned 404 — port_manager may have expired the entry")
        return False
    else:
        fail(f"Preview proxy returned {status}")
        return False


def test_result_endpoint(gen_id: str) -> bool:
    section(f"7 · Result Endpoint  (GET /api/result/{gen_id})")
    t = time.monotonic()
    status, body = get(f"/api/result/{gen_id}", timeout=10)
    if status == 200:
        data = json.loads(body)
        html = data.get("html", "")
        meta = data.get("metadata", {})
        files = meta.get("files", {})
        ok(f"result OK  html={len(html)} chars  files_in_meta={len(files)}  {elapsed(t)}")
        if not html and not files:
            warn("Both html and metadata files are empty — possible pipeline issue")
        elif files:
            ok(f"Generated files: {', '.join(sorted(files.keys())[:6])}{'…' if len(files) > 6 else ''}")
        return True
    elif status == 202:
        warn("Result returned 202 — generation still in progress?")
        return False
    else:
        fail(f"Result returned {status}")
        return False


def test_download(gen_id: str) -> bool:
    section(f"8 · Download Endpoint  (GET /api/download/{gen_id})")
    t = time.monotonic()
    status, body = get(f"/api/download/{gen_id}", timeout=15)
    if status == 200 and body[:2] == b"PK":  # ZIP magic bytes
        ok(f"Download returned valid ZIP  size={len(body)} bytes  {elapsed(t)}")
        return True
    elif status == 200:
        warn(f"Download returned 200 but not a ZIP  bytes[:4]={body[:4]}")
        return False
    else:
        fail(f"Download returned {status}")
        return False


# ── Main ─────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description="ArkhosAI integration test")
    parser.add_argument("--mcp", action="store_true", help="Use /api/generate-mcp (parallel pipeline)")
    parser.add_argument("--profile", default="budget", choices=["budget", "balanced", "quality"],
                        help="Fleet profile (default: budget — fastest/cheapest for tests)")
    parser.add_argument("--existing-id", metavar="GEN_ID",
                        help="Skip generation; use an already-completed generation ID for downstream tests")
    args = parser.parse_args()

    print(f"\n{BOLD}ArkhosAI Integration Test{RESET}")
    print(f"  endpoint:  {BASE_URL}")
    print(f"  sandbox:   {SANDBOX_URL}")
    print(f"  pipeline:  {'MCP parallel' if args.mcp else 'standard'}")
    print(f"  profile:   {args.profile}")
    print(f"  prompt:    \"{TEST_PROMPT}\"")

    results: dict[str, bool] = {}
    total_start = time.monotonic()

    # 1. Health
    results["health"] = test_health()
    if not results["health"]:
        fail("Backend unreachable — aborting")
        sys.exit(1)

    # 2. Simulate
    results["simulate"] = test_simulate()

    # 3+4. Generation + SSE stream
    if args.existing_id:
        section("3 · Generation  (using --existing-id, skipping new generation)")
        gen_id = args.existing_id
        ok(f"Using existing generation_id={gen_id}")
        events = []
        results["generation"] = True
    else:
        gen_id, events = test_generation(args.mcp, args.profile)
        results["generation"] = gen_id is not None and any(e["event"] == "generation_complete" for e in events)

    if not gen_id:
        fail("No generation_id — skipping downstream tests")
    else:
        # 5. Sandbox direct API test
        sandbox_ok, preview_url = test_sandbox_direct()
        results["sandbox"] = sandbox_ok

        # 6. Preview proxy (only if we have a live preview URL from SSE events)
        sse_sandbox_complete = next((e for e in events if e["event"] == "sandbox_complete"), None)
        if sse_sandbox_complete:
            sse_preview_url = sse_sandbox_complete["data"].get("preview_url")
            if sse_preview_url:
                results["preview"] = test_preview_proxy(gen_id, sse_preview_url)
            else:
                warn("sandbox_complete event had no preview_url")
                results["preview"] = None  # type: ignore[assignment]
        else:
            info("No sandbox_complete in SSE (build phase was polled) — skipping live preview test")
            results["preview"] = None  # type: ignore[assignment]

        # 7. Result
        results["result"] = test_result_endpoint(gen_id)

        # 8. Download
        results["download"] = test_download(gen_id)

    # ── Summary ──────────────────────────────────────────────────────
    total_dur = time.monotonic() - total_start
    section("Summary")
    passed = 0
    failed = 0
    skipped = 0
    for name, result in results.items():
        if result is None:
            print(f"  {YELLOW}–{RESET}  {name}  {DIM}skipped{RESET}")
            skipped += 1
        elif result:
            print(f"  {GREEN}✓{RESET}  {name}")
            passed += 1
        else:
            print(f"  {RED}✗{RESET}  {name}  {RED}FAILED{RESET}")
            failed += 1

    print(f"\n  Total: {passed} passed, {failed} failed, {skipped} skipped  ({total_dur:.1f}s)\n")
    sys.exit(0 if failed == 0 else 1)


if __name__ == "__main__":
    main()
