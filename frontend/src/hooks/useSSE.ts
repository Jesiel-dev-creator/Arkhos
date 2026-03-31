import { useCallback, useRef, useState } from "react";

/** SSE event types matching backend/arkhos/sse.py */
export type SSEEventType =
  | "agent_start"
  | "agent_output"
  | "agent_complete"
  | "preview_ready"
  | "generation_complete"
  | "plan_ready"
  | "files_ready"
  | "error";

export interface AgentStartEvent {
  type: "agent_start";
  agent: string;
  model: string;
  step: number;
  total_steps: number;
}

export interface AgentCompleteEvent {
  type: "agent_complete";
  agent: string;
  model: string;
  cost_eur: number;
  duration_s: number;
  cumulative_cost_eur: number;
}

export interface PreviewReadyEvent {
  type: "preview_ready";
  html: string;
  stage: "pre_review" | "final";
}

export interface GenerationCompleteEvent {
  type: "generation_complete";
  total_cost_eur: number;
  total_duration_s: number;
  models_used: string[];
  success: boolean;
}

export interface PlanReadyEvent {
  type: "plan_ready";
  plan: string;
}

export interface ErrorEvent {
  type: "error";
  error: string;
  error_type?: string;
  agent?: string;
}

export type SSEEvent =
  | AgentStartEvent
  | AgentCompleteEvent
  | PreviewReadyEvent
  | GenerationCompleteEvent
  | PlanReadyEvent
  | ErrorEvent;

export type GenerationStatus =
  | "idle"
  | "starting"
  | "running"
  | "complete"
  | "error";

export interface AgentState {
  name: string;
  status: "pending" | "running" | "complete";
  model?: string;
  cost_eur?: number;
  duration_s?: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "system";
  content: string;
  costEur?: number;
  durationS?: number;
}

export interface GenerationState {
  status: GenerationStatus;
  generationId: string | null;
  agents: AgentState[];
  currentAgent: string | null;
  previewHtml: string | null;
  finalHtml: string | null;
  projectFiles: Record<string, string> | null;
  totalCostEur: number;
  totalDurationS: number;
  error: string | null;
  errorType: string | null;
  originalPrompt: string;
  planReady: boolean;
  plan: string | null;
  timeoutWarning: boolean;
}

const INITIAL_AGENTS: AgentState[] = [
  { name: "planner", status: "pending" },
  { name: "designer", status: "pending" },
  { name: "architect", status: "pending" },
  { name: "builder", status: "pending" },
  { name: "reviewer", status: "pending" },
];

const API_BASE = import.meta.env.VITE_API_URL || "";
const TIMEOUT_WARNING_MS = 90_000;
const TIMEOUT_ERROR_MS = 180_000;

export function useSSE() {
  const [state, setState] = useState<GenerationState>({
    status: "idle",
    generationId: null,
    agents: [...INITIAL_AGENTS],
    currentAgent: null,
    previewHtml: null,
    finalHtml: null,
    projectFiles: null,
    totalCostEur: 0,
    totalDurationS: 0,
    error: null,
    errorType: null,
    originalPrompt: "",
    planReady: false,
    plan: null,
    timeoutWarning: false,
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    clearTimers();
    setState({
      status: "idle",
      generationId: null,
      agents: INITIAL_AGENTS.map((a) => ({ ...a })),
      currentAgent: null,
      previewHtml: null,
      finalHtml: null,
      totalCostEur: 0,
      totalDurationS: 0,
      error: null,
      errorType: null,
      originalPrompt: "",
      planReady: false,
      plan: null,
      timeoutWarning: false,
    });
  }, [clearTimers]);

  const processEvent = useCallback(
    (event: SSEEvent) => {
      setState((prev) => {
        switch (event.type) {
          case "agent_start":
            return {
              ...prev,
              currentAgent: event.agent,
              agents: prev.agents.map((a) =>
                a.name === event.agent
                  ? { ...a, status: "running" as const, model: event.model }
                  : a
              ),
            };

          case "agent_complete":
            return {
              ...prev,
              totalCostEur: event.cumulative_cost_eur,
              agents: prev.agents.map((a) =>
                a.name === event.agent
                  ? {
                      ...a,
                      status: "complete" as const,
                      model: event.model,
                      cost_eur: event.cost_eur,
                      duration_s: event.duration_s,
                    }
                  : a
              ),
            };

          case "preview_ready":
            if (event.stage === "final") {
              return {
                ...prev,
                finalHtml: event.html,
                previewHtml: event.html,
              };
            }
            return { ...prev, previewHtml: event.html };

          case "plan_ready":
            return {
              ...prev,
              planReady: true,
              plan: event.plan,
            };

          case "files_ready":
            return {
              ...prev,
              projectFiles: (event as Record<string, unknown>).files as Record<string, string>,
            };

          case "generation_complete":
            if (eventSourceRef.current) {
              eventSourceRef.current.close();
              eventSourceRef.current = null;
            }
            clearTimers();
            return {
              ...prev,
              status: "complete",
              totalCostEur: event.total_cost_eur,
              totalDurationS: event.total_duration_s,
              timeoutWarning: false,
            };

          case "error":
            if (eventSourceRef.current) {
              eventSourceRef.current.close();
              eventSourceRef.current = null;
            }
            clearTimers();
            return {
              ...prev,
              status: "error",
              error: event.error,
              errorType: event.error_type || null,
              timeoutWarning: false,
            };

          default:
            return prev;
        }
      });
    },
    [clearTimers]
  );

  const connectToStream = useCallback(
    (generationId: string) => {
      const es = new EventSource(`${API_BASE}/api/stream/${generationId}`);
      eventSourceRef.current = es;

      const handleEvent = (eventType: string) => (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          processEvent({ type: eventType as SSEEventType, ...data });
        } catch {
          /* ignore parse errors */
        }
      };

      es.addEventListener("agent_start", handleEvent("agent_start"));
      es.addEventListener("agent_complete", handleEvent("agent_complete"));
      es.addEventListener("preview_ready", handleEvent("preview_ready"));
      es.addEventListener(
        "generation_complete",
        handleEvent("generation_complete")
      );
      es.addEventListener("plan_ready", handleEvent("plan_ready"));
      es.addEventListener("files_ready", handleEvent("files_ready"));
      es.addEventListener("error", handleEvent("error"));

      es.onerror = () => {
        es.close();
        setState((prev) => {
          // Don't error if plan is ready — stream ends normally after plan_ready
          if (prev.planReady) return prev;
          if (prev.status === "running") {
            return {
              ...prev,
              status: "error",
              error: "Connection lost",
              errorType: "connection",
            };
          }
          return prev;
        });
      };

      // Timeout timers
      clearTimers();
      warningTimerRef.current = setTimeout(() => {
        setState((prev) =>
          prev.status === "running"
            ? { ...prev, timeoutWarning: true }
            : prev
        );
      }, TIMEOUT_WARNING_MS);

      errorTimerRef.current = setTimeout(() => {
        setState((prev) => {
          if (prev.status === "running") {
            es.close();
            return {
              ...prev,
              status: "error",
              error: "Generation timed out. Try a simpler prompt.",
              errorType: "timeout",
              timeoutWarning: false,
            };
          }
          return prev;
        });
      }, TIMEOUT_ERROR_MS);
    },
    [processEvent, clearTimers]
  );

  const generate = useCallback(
    async (prompt: string, locale: string = "en") => {
      reset();
      setState((prev) => ({
        ...prev,
        status: "starting",
        originalPrompt: prompt,
      }));

      try {
        const res = await fetch(`${API_BASE}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, locale }),
        });

        if (!res.ok) {
          const err = await res
            .json()
            .catch(() => ({ detail: "Request failed" }));
          throw new Error(
            typeof err.detail === "string" ? err.detail : "Request failed"
          );
        }

        const { generation_id } = await res.json();
        setState((prev) => ({
          ...prev,
          generationId: generation_id,
          status: "running",
        }));
        connectToStream(generation_id);
      } catch (err) {
        setState((prev) => ({
          ...prev,
          status: "error",
          error: err instanceof Error ? err.message : "Unknown error",
          errorType: "unknown",
        }));
      }
    },
    [reset, connectToStream]
  );

  const approvePlan = useCallback(
    async (generationId: string) => {
      setState((prev) => ({
        ...prev,
        planReady: false,
        status: "running",
        agents: INITIAL_AGENTS.map((a) =>
          a.name === "planner"
            ? { ...a, status: "complete" as const }
            : a
        ),
      }));

      try {
        const res = await fetch(
          `${API_BASE}/api/approve/${generationId}`,
          { method: "POST" }
        );
        if (!res.ok) {
          const err = await res
            .json()
            .catch(() => ({ detail: "Approve failed" }));
          throw new Error(err.detail || `HTTP ${res.status}`);
        }
        connectToStream(generationId);
      } catch (err) {
        setState((prev) => ({
          ...prev,
          status: "error",
          error: err instanceof Error ? err.message : "Unknown error",
          errorType: "unknown",
        }));
      }
    },
    [connectToStream]
  );

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
        errorType: null,
      }));

      try {
        const res = await fetch(`${API_BASE}/api/iterate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            generation_id: generationId,
            modification,
          }),
        });

        if (!res.ok) {
          const err = await res
            .json()
            .catch(() => ({ detail: "Request failed" }));
          throw new Error(err.detail || `HTTP ${res.status}`);
        }

        const { generation_id } = await res.json();
        setState((prev) => ({
          ...prev,
          generationId: generation_id,
          status: "running",
        }));
        connectToStream(generation_id);
      } catch (err) {
        setState((prev) => ({
          ...prev,
          status: "error",
          error: err instanceof Error ? err.message : "Unknown error",
          errorType: "unknown",
        }));
      }
    },
    [connectToStream]
  );

  return { state, generate, iterate, approvePlan, reset };
}
