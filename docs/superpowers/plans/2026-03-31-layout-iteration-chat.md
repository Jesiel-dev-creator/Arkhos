# Layout Restructure + Iteration Chat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the preview pane dominant (80% of right panel) with a compact pipeline strip, and add iteration chat so users can refine generated sites with single-agent Builder calls.

**Architecture:** Backend gets a new `/api/iterate` endpoint that runs a single Builder agent on existing HTML + a modification request. Frontend gets a chat mode in the left panel that activates after generation completes, and the pipeline strip becomes a compact horizontal bar. The `useSSE` hook gains an `iterate()` method and chat message state.

**Tech Stack:** FastAPI, Tramontane Agent, React 19, TypeScript, Framer Motion, GSAP, Tailwind v4

---

## File Structure

**Create:**
- `backend/arkhos/iterate.py` — Single-agent iteration function (async generator yielding SSE events)
- `frontend/src/components/IterationChat.tsx` — Chat thread with scrollable messages + input
- `frontend/src/components/PipelineStrip.tsx` — Compact horizontal pipeline strip (replaces AgentStream)

**Modify:**
- `backend/arkhos/routes.py` — Add `POST /api/iterate` endpoint + `_run_iteration` background task
- `frontend/src/hooks/useSSE.ts` — Add `iterate()` function, `ChatMessage` type, `messages` state, `originalPrompt` tracking
- `frontend/src/pages/Generate.tsx` — New layout with mode switch (prompt vs chat), preview-dominant right panel
- `frontend/src/components/PreviewPane.tsx` — Add `generationId` prop for browser chrome URL

**Delete:**
- `frontend/src/components/AgentStream.tsx` — Replaced by PipelineStrip

---

### Task 1: Backend — Create iterate.py

**Files:**
- Create: `backend/arkhos/iterate.py`

- [ ] **Step 1: Create the iterate module**

Write `backend/arkhos/iterate.py`:

```python
"""Iteration endpoint — single Builder agent call to modify existing HTML."""

from __future__ import annotations

import logging
import time
from collections.abc import AsyncGenerator

from tramontane import Agent

from arkhos.sse import SSEEventType, format_sse

logger = logging.getLogger(__name__)

ITERATE_SYSTEM_PROMPT = """\
You are an expert frontend developer. You will receive an existing HTML page
and a modification request from the user. Your job is to apply the requested
changes to the HTML and return the COMPLETE modified HTML.

RULES:
- Apply ONLY the changes the user requested
- Keep everything else exactly the same
- Maintain all existing styles, fonts, colors unless the user asks to change them
- Maintain responsive design
- Maintain accessibility
- Output ONLY the complete modified HTML document
- No markdown fences, no explanation — just the HTML
"""


async def run_iteration(
    current_html: str,
    modification_request: str,
    original_spec: str = "",
) -> AsyncGenerator[str, None]:
    """Run a single Builder agent call to modify existing HTML.

    Args:
        current_html: The current HTML to modify.
        modification_request: What the user wants to change.
        original_spec: The original Planner spec (for context).

    Yields:
        SSE-formatted strings.
    """
    builder = Agent(
        role="Frontend Builder",
        goal="Modify an existing HTML page based on user feedback",
        backstory=ITERATE_SYSTEM_PROMPT,
        model="devstral-small",
        budget_eur=0.01,
    )

    input_text = (
        f"## MODIFICATION REQUEST\n{modification_request}\n\n"
        f"## CURRENT HTML\n{current_html}"
    )
    if original_spec:
        input_text = (
            f"## MODIFICATION REQUEST\n{modification_request}\n\n"
            f"## ORIGINAL SPECIFICATION\n{original_spec}\n\n"
            f"## CURRENT HTML\n{current_html}"
        )

    yield format_sse(SSEEventType.AGENT_START, {
        "agent": "builder",
        "model": "devstral-small",
        "step": 1,
        "total_steps": 1,
    })

    t0 = time.monotonic()
    response = await builder.run(input_text)
    duration = round(time.monotonic() - t0, 2)
    cost = response.cost_eur

    yield format_sse(SSEEventType.AGENT_COMPLETE, {
        "agent": "builder",
        "model": response.model_used,
        "cost_eur": cost,
        "duration_s": duration,
        "cumulative_cost_eur": cost,
    })

    yield format_sse(SSEEventType.PREVIEW_READY, {
        "html": response.output,
        "stage": "final",
    })

    yield format_sse(SSEEventType.GENERATION_COMPLETE, {
        "total_cost_eur": cost,
        "total_duration_s": duration,
        "models_used": [response.model_used],
        "success": True,
    })

    logger.info("Iteration complete: cost=EUR%.4f duration=%.1fs", cost, duration)
```

- [ ] **Step 2: Verify import works**

```bash
cd /mnt/c/Users/Admin/Arkhos/Arkhos/backend
python3 -c "from arkhos.iterate import run_iteration; print('OK')"
```

- [ ] **Step 3: Run ruff + mypy**

```bash
ruff check arkhos/iterate.py
mypy arkhos/iterate.py --ignore-missing-imports
```

---

### Task 2: Backend — Add /api/iterate route

**Files:**
- Modify: `backend/arkhos/routes.py`

- [ ] **Step 1: Add IterateRequest model and iterate endpoint**

Add these imports at the top of `routes.py` (the existing imports stay):

The file already imports: `asyncio`, `json`, `logging`, `Any`, `APIRouter`, `HTTPException`, `Request`, `StreamingResponse`, `BaseModel`, `Field`, `get_settings`, `run_pipeline_streaming`, `rate_limiter`, `SSEEventType`, `format_sse`, `GenerationStatus`, `store`.

After the existing `GenerateResponse` class, add:

```python
class IterateRequest(BaseModel):
    """Request body for POST /api/iterate."""

    generation_id: str
    modification: str = Field(..., min_length=1, max_length=1000)
```

After the existing `gallery` function at the bottom of the file, add:

```python
@router.post("/iterate", response_model=GenerateResponse)
async def iterate(request: Request, body: IterateRequest) -> GenerateResponse:
    """Apply a modification to an existing generation.

    Uses a single Builder agent call (not the full pipeline).
    Returns a new generation_id for streaming the result.
    """
    client_ip = request.client.host if request.client else "unknown"

    allowed, reason = rate_limiter.check(client_ip)
    if not allowed:
        raise HTTPException(status_code=429, detail=reason)

    original = store.get(body.generation_id)
    if original is None:
        raise HTTPException(status_code=404, detail="Original generation not found")

    if not original.html:
        raise HTTPException(status_code=400, detail="Original generation has no HTML")

    generation = store.create(
        prompt=f"[iterate] {body.modification}",
        locale=original.metadata.get("locale", "en"),
    )
    generation.metadata["parent_generation_id"] = body.generation_id
    generation.metadata["modification"] = body.modification

    asyncio.create_task(
        _run_iteration(
            gen_id=generation.id,
            current_html=original.html,
            modification=body.modification,
            original_spec=original.metadata.get("planner_spec", ""),
            client_ip=client_ip,
        )
    )

    return GenerateResponse(generation_id=generation.id)


async def _run_iteration(
    gen_id: str,
    current_html: str,
    modification: str,
    original_spec: str,
    client_ip: str,
) -> None:
    """Background task: run single-agent iteration."""
    from arkhos.iterate import run_iteration

    generation = store.get(gen_id)
    if generation is None:
        return

    generation.status = GenerationStatus.RUNNING
    total_cost = 0.0

    try:
        async for sse_event in run_iteration(current_html, modification, original_spec):
            await generation.event_queue.put(sse_event)

            for line in sse_event.split("\n"):
                if not line.startswith("data: "):
                    continue
                try:
                    data = json.loads(line[6:])
                except (json.JSONDecodeError, KeyError):
                    continue
                if "total_cost_eur" in data:
                    total_cost = data["total_cost_eur"]
                if data.get("stage") == "final" and "html" in data:
                    generation.html = data["html"]

        generation.status = GenerationStatus.COMPLETE
        generation.metadata["total_cost_eur"] = total_cost

    except Exception as exc:
        logger.exception("Iteration %s failed: %s", gen_id, exc)
        generation.status = GenerationStatus.FAILED
        generation.error = str(exc)
        error_event = format_sse(SSEEventType.ERROR, {"error": str(exc)})
        await generation.event_queue.put(error_event)

    await generation.event_queue.put(None)
    rate_limiter.record_generation(client_ip, total_cost)
```

- [ ] **Step 2: Also save planner_spec in _run_generation**

In the existing `_run_generation` function, modify the metadata assignment. Change:

```python
        generation.status = GenerationStatus.COMPLETE
        generation.metadata = {
            "total_cost_eur": total_cost,
            "locale": locale,
        }
```

to:

```python
        generation.status = GenerationStatus.COMPLETE
        generation.metadata["total_cost_eur"] = total_cost
        generation.metadata["locale"] = locale
```

And add planner spec capture: inside the `for line in sse_event.split("\n"):` block, after the existing `if data.get("stage") == "final"` check, add:

```python
                # Capture planner output for iteration context
                if data.get("agent") == "planner" and "cost_eur" not in data:
                    pass  # agent_start, skip
                # We actually need to capture from agent_complete - but we don't
                # have the output there. Instead, capture the first preview_ready
                # as a rough proxy. Better: capture from the agent_output events.
```

Actually, the simplest approach: since the planner output goes to the designer as input, and we don't have direct access to intermediate agent outputs in the SSE stream, we should skip planner_spec capture for now. The iteration will work fine without it — the Builder gets the full HTML context which is sufficient. Remove the `original_spec` parameter from the iterate call, passing `""` always.

- [ ] **Step 3: Run ruff + mypy on the whole backend**

```bash
cd /mnt/c/Users/Admin/Arkhos/Arkhos/backend
ruff check arkhos/
mypy arkhos/ --ignore-missing-imports
```

---

### Task 3: Frontend — Update useSSE hook with iterate + messages

**Files:**
- Modify: `frontend/src/hooks/useSSE.ts`

- [ ] **Step 1: Add ChatMessage type and iterate function**

Add `ChatMessage` interface after the existing `GenerationState` interface:

```typescript
export interface ChatMessage {
  id: string;
  role: "user" | "system";
  content: string;
  costEur?: number;
  durationS?: number;
}
```

Add `messages` and `originalPrompt` to `GenerationState`:

```typescript
export interface GenerationState {
  status: GenerationStatus;
  generationId: string | null;
  agents: AgentState[];
  currentAgent: string | null;
  previewHtml: string | null;
  finalHtml: string | null;
  totalCostEur: number;
  totalDurationS: number;
  error: string | null;
  messages: ChatMessage[];
  originalPrompt: string;
}
```

Update the initial state in `useState` to include `messages: []` and `originalPrompt: ""`.

Update `reset()` to also reset `messages: []` and `originalPrompt: ""`.

In `generate()`, after `reset()` and before `setState(starting)`, save the prompt:

```typescript
setState((prev) => ({ ...prev, status: "starting", originalPrompt: prompt }));
```

After `generation_complete` event in `processEvent`, the messages get added in the Generate page component (not in the hook). The hook just tracks state.

Add a new `connectToStream` helper (extracted from generate to reuse in iterate):

```typescript
const connectToStream = useCallback(
  (generationId: string) => {
    const es = new EventSource(`${API_BASE}/api/stream/${generationId}`);
    eventSourceRef.current = es;

    const handleEvent = (eventType: string) => (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        processEvent({ type: eventType as SSEEventType, ...data });
      } catch {
        /* ignore */
      }
    };

    es.addEventListener("agent_start", handleEvent("agent_start"));
    es.addEventListener("agent_complete", handleEvent("agent_complete"));
    es.addEventListener("preview_ready", handleEvent("preview_ready"));
    es.addEventListener("generation_complete", handleEvent("generation_complete"));
    es.addEventListener("error", handleEvent("error"));

    es.onerror = () => {
      es.close();
      setState((prev) => {
        if (prev.status === "running") {
          return { ...prev, status: "error", error: "Connection lost" };
        }
        return prev;
      });
    };
  },
  [processEvent]
);
```

Refactor `generate()` to use `connectToStream`.

Add `iterate()`:

```typescript
const iterate = useCallback(
  async (generationId: string, modification: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setState((prev) => ({
      ...prev,
      status: "running",
      agents: [{ name: "builder", status: "pending" as const }],
      currentAgent: null,
      error: null,
    }));

    try {
      const res = await fetch(`${API_BASE}/api/iterate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generation_id: generationId, modification }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Request failed" }));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }

      const { generation_id } = await res.json();
      setState((prev) => ({ ...prev, generationId: generation_id, status: "running" }));
      connectToStream(generation_id);
    } catch (err) {
      setState((prev) => ({
        ...prev,
        status: "error",
        error: err instanceof Error ? err.message : "Unknown error",
      }));
    }
  },
  [connectToStream]
);
```

Return: `{ state, generate, iterate, reset }`.

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /mnt/c/Users/Admin/Arkhos/Arkhos/frontend
pnpm tsc --noEmit
```

---

### Task 4: Frontend — Create PipelineStrip component

**Files:**
- Create: `frontend/src/components/PipelineStrip.tsx`
- Delete: `frontend/src/components/AgentStream.tsx`

- [ ] **Step 1: Create PipelineStrip.tsx**

This is a compact horizontal bar (~48px) showing all 4 agents in a row with status dots, plus a cost counter on the right. The existing `AgentStream.tsx` already has this layout (it was rewritten to a strip in a previous task). Copy and rename it.

Read the current `AgentStream.tsx` and save it as `PipelineStrip.tsx` with these changes:
- Rename the default export to `PipelineStrip`
- Keep the same props interface: `agents`, `status`, `totalCostEur`, `totalDurationS`
- Keep the same internal components: `AgentPill`, `AgentDetail`
- No logic changes, just the rename

- [ ] **Step 2: Delete AgentStream.tsx**

```bash
rm frontend/src/components/AgentStream.tsx
```

- [ ] **Step 3: Update Generate.tsx import**

Change `import AgentStream from "@/components/AgentStream"` to `import PipelineStrip from "@/components/PipelineStrip"` and update the JSX usage. (This will be done in Task 6 when we rewrite Generate.tsx.)

- [ ] **Step 4: Verify TypeScript**

```bash
pnpm tsc --noEmit
```

Note: This will fail because Generate.tsx still imports AgentStream. That's OK — Task 6 will fix it.

---

### Task 5: Frontend — Create IterationChat component

**Files:**
- Create: `frontend/src/components/IterationChat.tsx`

- [ ] **Step 1: Create IterationChat.tsx**

```tsx
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, RotateCcw, Check, Loader2 } from "lucide-react";
import type { ChatMessage, GenerationStatus } from "@/hooks/useSSE";
import { formatCostEUR, formatDuration } from "@/lib/utils";

interface IterationChatProps {
  messages: ChatMessage[];
  originalPrompt: string;
  status: GenerationStatus;
  onIterate: (modification: string) => void;
  onNewSite: () => void;
}

export default function IterationChat({
  messages,
  originalPrompt,
  status,
  onIterate,
  onNewSite,
}: IterationChatProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const isRunning = status === "running" || status === "starting";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status]);

  const handleSubmit = () => {
    if (!input.trim() || isRunning) return;
    onIterate(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header: New site button + truncated prompt */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={onNewSite}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 border"
          style={{
            color: "var(--muted)",
            borderColor: "var(--border)",
            fontFamily: "var(--font-body)",
          }}
        >
          <RotateCcw size={11} />
          New site
        </button>
      </div>

      <p
        className="text-sm font-medium mb-4 line-clamp-2"
        style={{ color: "var(--frost)", fontFamily: "var(--font-body)" }}
      >
        {originalPrompt.length > 80
          ? originalPrompt.slice(0, 80) + "..."
          : originalPrompt}
      </p>

      {/* Chat thread */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-3.5 py-2.5 rounded-xl text-[13px] leading-relaxed ${
                msg.role === "user"
                  ? "rounded-br-sm"
                  : "rounded-bl-sm"
              }`}
              style={{
                background:
                  msg.role === "user"
                    ? "rgba(13, 27, 42, 0.7)"
                    : "rgba(13, 27, 42, 0.4)",
                border: `1px solid ${
                  msg.role === "user"
                    ? "rgba(255,255,255,0.06)"
                    : "var(--border)"
                }`,
                backdropFilter: msg.role === "user" ? "blur(8px)" : undefined,
                color:
                  msg.role === "user" ? "var(--frost)" : "var(--muted)",
                fontFamily: "var(--font-body)",
              }}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.costEur !== undefined && (
                <div className="flex items-center gap-2 mt-1.5 pt-1.5"
                     style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <Check size={11} style={{ color: "var(--success)" }} />
                  <span style={{ fontFamily: "var(--font-code)", color: "var(--success)", fontSize: "10px" }}>
                    {formatCostEUR(msg.costEur)}
                  </span>
                  {msg.durationS !== undefined && (
                    <span style={{ fontFamily: "var(--font-code)", color: "var(--muted)", fontSize: "10px" }}>
                      · {formatDuration(msg.durationS)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* In-progress bubble */}
        <AnimatePresence>
          {isRunning && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl rounded-bl-sm text-[13px]"
                style={{
                  background: "rgba(13, 27, 42, 0.4)",
                  border: "1px solid rgba(0, 212, 238, 0.15)",
                  color: "var(--cyan)",
                  fontFamily: "var(--font-body)",
                }}
              >
                <Loader2 size={13} className="animate-spin" />
                Updating...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="flex-shrink-0">
        <div className="flex items-center gap-2">
          <div
            className="flex-1 relative rounded-xl overflow-hidden"
            style={{
              background: "rgba(13, 27, 42, 0.6)",
              border: "1px solid var(--border)",
              backdropFilter: "blur(8px)",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Change colors, add sections..."
              disabled={isRunning}
              className="w-full px-4 py-2.5 bg-transparent text-[13px] text-[var(--frost)] placeholder:text-[var(--muted)]/50 focus:outline-none disabled:opacity-40"
              style={{ fontFamily: "var(--font-body)" }}
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isRunning}
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-30"
            style={{
              background: input.trim() && !isRunning ? "var(--ember)" : "var(--deep)",
              color: input.trim() && !isRunning ? "white" : "var(--muted)",
            }}
          >
            <ArrowRight size={16} />
          </button>
        </div>
        <p className="text-[10px] mt-1.5 text-right"
           style={{ color: "var(--muted)", fontFamily: "var(--font-code)" }}>
          ~EUR0.001 per iteration
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
pnpm tsc --noEmit
```

---

### Task 6: Frontend — Rewrite Generate.tsx with new layout + mode switch

**Files:**
- Modify: `frontend/src/pages/Generate.tsx`

- [ ] **Step 1: Rewrite Generate.tsx**

```tsx
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSSE } from "@/hooks/useSSE";
import type { ChatMessage } from "@/hooks/useSSE";
import PromptInput from "@/components/PromptInput";
import PipelineStrip from "@/components/PipelineStrip";
import PreviewPane from "@/components/PreviewPane";
import CodeView from "@/components/CodeView";
import IterationChat from "@/components/IterationChat";

export default function Generate() {
  const { state, generate, iterate, reset } = useSSE();
  const [showCode, setShowCode] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatMode, setChatMode] = useState(false);

  const handleGenerate = useCallback(
    (prompt: string, locale: string) => {
      setShowCode(false);
      setMessages([]);
      setChatMode(false);
      generate(prompt, locale);
    },
    [generate]
  );

  /* Switch to chat mode when generation completes */
  useEffect(() => {
    if (state.status === "complete" && state.originalPrompt && !chatMode) {
      setChatMode(true);
      setMessages((prev) => {
        if (prev.length === 0) {
          return [
            {
              id: "gen-user",
              role: "user",
              content: state.originalPrompt,
            },
            {
              id: "gen-system",
              role: "system",
              content: `Generated · 4 agents · ${state.totalDurationS}s`,
              costEur: state.totalCostEur,
              durationS: state.totalDurationS,
            },
          ];
        }
        /* Iteration completed — add system response to last user message */
        return [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "system",
            content: "Updated",
            costEur: state.totalCostEur,
            durationS: state.totalDurationS,
          },
        ];
      });
    }
  }, [state.status, state.originalPrompt, state.totalCostEur, state.totalDurationS, chatMode]);

  const handleIterate = useCallback(
    (modification: string) => {
      if (!state.generationId) return;
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "user", content: modification },
      ]);
      iterate(state.generationId, modification);
    },
    [state.generationId, iterate]
  );

  const handleNewSite = useCallback(() => {
    reset();
    setMessages([]);
    setChatMode(false);
    setShowCode(false);
  }, [reset]);

  return (
    <div className="relative flex h-[calc(100vh-5rem)] overflow-hidden">
      {/* Subtle top gradient */}
      <div
        className="absolute top-0 left-0 right-0 h-[200px] pointer-events-none z-0"
        style={{ background: "linear-gradient(180deg, rgba(255,107,53,0.03) 0%, transparent 100%)" }}
      />

      {/* Success glow */}
      {state.status === "complete" && (
        <div
          className="absolute bottom-0 right-0 w-[60%] h-[120px] pointer-events-none z-0"
          style={{ background: "linear-gradient(0deg, rgba(34,214,138,0.04) 0%, transparent 100%)" }}
        />
      )}

      {/* ── Left Panel (35%) ── */}
      <div className="relative z-10 w-full md:w-[35%] flex flex-col p-5 md:p-6 overflow-hidden">
        <AnimatePresence mode="popLayout">
          {chatMode ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col h-full"
            >
              <IterationChat
                messages={messages}
                originalPrompt={state.originalPrompt}
                status={state.status}
                onIterate={handleIterate}
                onNewSite={handleNewSite}
              />
            </motion.div>
          ) : (
            <motion.div
              key="prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-5 overflow-y-auto"
            >
              <div>
                <h1 className="text-2xl md:text-3xl text-[var(--frost)] mb-1.5">
                  What will you build?
                </h1>
                <p
                  className="text-sm text-[var(--muted)] leading-relaxed"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Describe your website and watch 4 AI agents build it live.
                </p>
              </div>
              <PromptInput onSubmit={handleGenerate} status={state.status} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Gradient Divider */}
      <div
        className="hidden md:block w-px flex-shrink-0"
        style={{
          background: "linear-gradient(180deg, transparent 0%, var(--border) 20%, var(--border) 80%, transparent 100%)",
        }}
      />

      {/* ── Right Panel (65%) ── */}
      <div className="hidden md:flex relative z-10 md:flex-1 flex-col p-5 md:p-6 overflow-hidden">
        {/* Pipeline Strip — compact ~48px */}
        <PipelineStrip
          agents={state.agents}
          status={state.status}
          totalCostEur={state.totalCostEur}
          totalDurationS={state.totalDurationS}
        />

        <div className="h-3 flex-shrink-0" />

        {/* Preview Pane — DOMINANT */}
        <PreviewPane
          status={state.status}
          previewHtml={state.previewHtml}
          finalHtml={state.finalHtml}
          generationId={state.generationId}
          onToggleCode={() => setShowCode((v) => !v)}
          showCode={showCode}
        />

        {/* Code View */}
        <AnimatePresence>
          {showCode && state.finalHtml && <CodeView html={state.finalHtml} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update PreviewPane to accept generationId prop**

In `PreviewPane.tsx`, add `generationId?: string | null` to the props interface. In the browser chrome URL bar, change the static text to show the generation ID:

```tsx
<span style={{ fontFamily: "var(--font-code)" }}>
  arkhos.ai/preview/{generationId ? generationId.slice(0, 8) : "..."}
</span>
```

- [ ] **Step 3: Verify TypeScript**

```bash
pnpm tsc --noEmit
```

---

### Task 7: Final verification

- [ ] **Step 1: Backend lint + type check**

```bash
cd /mnt/c/Users/Admin/Arkhos/Arkhos/backend
ruff check arkhos/
mypy arkhos/ --ignore-missing-imports
```

- [ ] **Step 2: Frontend TypeScript check**

```bash
cd /mnt/c/Users/Admin/Arkhos/Arkhos/frontend
pnpm tsc --noEmit
```

- [ ] **Step 3: Clear Vite cache**

```bash
rm -rf node_modules/.vite
```

- [ ] **Step 4: Boot both servers and test**

Terminal 1:
```bash
cd /mnt/c/Users/Admin/Arkhos/Arkhos/backend
uvicorn arkhos.app:app --host 0.0.0.0 --port 8000
```

Terminal 2:
```bash
cd /mnt/c/Users/Admin/Arkhos/Arkhos/frontend
pnpm dev
```

Manual test:
1. Open http://localhost:5173/generate
2. Click "French Bakery" template → watch generation
3. Preview should be HUGE (500px+ height)
4. Pipeline strip is ONE compact bar (~48px)
5. After completion → left panel switches to chat mode
6. Type "make the header dark navy blue" → submit
7. Preview updates with single Builder agent run
8. Click "New site" → resets to prompt mode
