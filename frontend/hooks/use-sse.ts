"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { sseUrl, apiPost } from "@/lib/api";

/* ── Types ── */

export type GenerationStatus =
  | "idle"
  | "starting"
  | "planning"
  | "plan_ready"
  | "building"
  | "sandbox"
  | "complete"
  | "error";

export interface AgentState {
  name: string;
  status: "pending" | "running" | "complete";
  model?: string;
  costEur?: number;
  durationS?: number;
}

export interface SandboxState {
  status: "idle" | "starting" | "running" | "failed" | "skipped";
  previewUrl: string | null;
  durationS: number;
  error: string | null;
}

export interface GenerationState {
  status: GenerationStatus;
  generationId: string | null;
  agents: AgentState[];
  currentAgent: string | null;
  previewHtml: string | null;
  totalCostEur: number;
  totalDurationS: number;
  plan: string | null;
  error: string | null;
  errorType: string | null;
  profile: string | null;
  estCost: string | null;
  estTime: string | null;
  fileCount: number;
  sandbox: SandboxState;
}

// No hardcoded agent list — agents are discovered from SSE agent_start events.
// This supports future pipeline expansions without frontend changes.

const INITIAL_SANDBOX: SandboxState = {
  status: "idle",
  previewUrl: null,
  durationS: 0,
  error: null,
};

const INITIAL_STATE: GenerationState = {
  status: "idle",
  generationId: null,
  agents: [],
  currentAgent: null,
  previewHtml: null,
  totalCostEur: 0,
  totalDurationS: 0,
  plan: null,
  error: null,
  errorType: null,
  profile: null,
  estCost: null,
  estTime: null,
  fileCount: 0,
  sandbox: { ...INITIAL_SANDBOX },
};

const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_BASE_MS = 1000;

/* ── Hook ── */

export function useSSE(
  onFileChunk?: (path: string, content: string) => void,
) {
  const fileChunkRef = useRef(onFileChunk);
  fileChunkRef.current = onFileChunk;

  const [state, setState] = useState<GenerationState>({ ...INITIAL_STATE });
  const esRef = useRef<EventSource | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => cleanup, [cleanup]);

  const reset = useCallback(() => {
    cleanup();
    reconnectAttempts.current = 0;
    setState({ ...INITIAL_STATE });
  }, [cleanup]);

  const connectToStream = useCallback((generationId: string) => {
    cleanup();
    const es = new EventSource(sseUrl(`/stream/${generationId}`));
    esRef.current = es;
    reconnectAttempts.current = 0;

    function handleData(eventType: string, data: Record<string, unknown>) {
      setState((prev) => {
        switch (eventType) {
          case "pipeline_start":
            return {
              ...prev,
              profile: data.profile as string,
              estCost: data.est_cost as string,
              estTime: data.est_time as string,
            };

          case "agent_start": {
            const agentName = data.agent as string;
            const exists = prev.agents.some((a) => a.name === agentName);
            const updatedAgents = exists
              ? prev.agents.map((a) =>
                  a.name === agentName
                    ? { ...a, status: "running" as const, model: data.model as string }
                    : a,
                )
              : [
                  ...prev.agents,
                  { name: agentName, status: "running" as const, model: data.model as string },
                ];
            return {
              ...prev,
              status: prev.status === "plan_ready" ? "building" : prev.status === "idle" ? "planning" : prev.status,
              currentAgent: agentName,
              agents: updatedAgents,
            };
          }

          case "agent_complete":
            return {
              ...prev,
              totalCostEur: (data.cumulative_cost_eur as number) || prev.totalCostEur,
              agents: prev.agents.map((a) =>
                a.name === data.agent
                  ? {
                      ...a,
                      status: "complete" as const,
                      costEur: data.cost_eur as number,
                      durationS: data.duration_s as number,
                    }
                  : a,
              ),
            };

          case "plan_ready":
            return { ...prev, status: "plan_ready", plan: data.plan as string };

          case "preview_ready":
            return { ...prev, previewHtml: data.html as string };

          case "files_ready":
            return { ...prev, fileCount: (data.file_count as number) || prev.fileCount };

          case "sandbox_start":
            return {
              ...prev,
              status: "sandbox",
              currentAgent: null,
              sandbox: { ...prev.sandbox, status: "starting" },
            };

          case "sandbox_complete": {
            const success = data.success as boolean;
            return {
              ...prev,
              sandbox: {
                status: success ? "running" : data.stage === "skipped" ? "skipped" : "failed",
                previewUrl: (data.preview_url as string) || null,
                durationS: (data.duration_s as number) || 0,
                error: success ? null : (data.error as string) || null,
              },
            };
          }

          case "generation_complete":
            return {
              ...prev,
              status: "complete",
              currentAgent: null,
              totalCostEur: data.total_cost_eur as number,
              totalDurationS: data.total_duration_s as number,
            };

          case "error":
            return {
              ...prev,
              status: "error",
              error: data.error as string,
              errorType: (data.error_type as string) || "unknown",
            };

          default:
            return prev;
        }
      });
    }

    const EVENTS = [
      "pipeline_start", "agent_start", "agent_complete",
      "plan_ready", "preview_ready", "files_ready",
      "sandbox_start", "sandbox_complete",
      "generation_complete", "error",
    ];

    for (const eventName of EVENTS) {
      es.addEventListener(eventName, (e: MessageEvent) => {
        try {
          handleData(eventName, JSON.parse(e.data));
        } catch { /* ignore parse errors */ }
      });
    }

    es.addEventListener("file_chunk", (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data.path && data.content && fileChunkRef.current) {
          fileChunkRef.current(data.path, data.content);
        }
      } catch { /* ignore */ }
    });

    es.onerror = () => {
      es.close();
      esRef.current = null;

      setState((prev) => {
        // Don't reconnect if already complete or errored
        if (prev.status === "complete" || prev.status === "error") return prev;

        // Exponential backoff reconnection
        if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = RECONNECT_BASE_MS * Math.pow(2, reconnectAttempts.current);
          reconnectAttempts.current++;
          reconnectTimer.current = setTimeout(() => {
            connectToStream(generationId);
          }, delay);
          return prev;
        }

        return { ...prev, status: "error", error: "Connection lost after retries" };
      });
    };
  }, [cleanup]);

  const generate = useCallback(
    async (prompt: string, locale: string = "en", profile: string = "balanced") => {
      reset();
      setState((prev) => ({ ...prev, status: "starting" }));

      try {
        const res = await apiPost<{ generation_id: string }>("/generate", {
          prompt, locale, profile,
        });
        setState((prev) => ({
          ...prev,
          generationId: res.generation_id,
          status: "planning",
        }));
        connectToStream(res.generation_id);
      } catch (err) {
        setState((prev) => ({
          ...prev,
          status: "error",
          error: err instanceof Error ? err.message : "Unknown error",
        }));
      }
    },
    [reset, connectToStream],
  );

  // Connect to an existing generation by ID (for workspace page).
  // First checks /api/result to see if the generation already completed.
  // If still in progress (202), connects to the SSE stream.
  const connectTo = useCallback(
    async (generationId: string) => {
      setState((prev) => ({ ...prev, generationId, status: "starting" }));

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/result/${generationId}`,
        );

        if (res.status === 202) {
          // Still in progress — connect to SSE stream
          setState((prev) => ({ ...prev, status: "building" }));
          connectToStream(generationId);
          return;
        }

        if (res.ok) {
          // Generation already completed — load result
          const data = await res.json();
          setState((prev) => ({
            ...prev,
            status: "complete",
            previewHtml: data.html ?? null,
          }));
          return;
        }

        if (res.status === 404) {
          setState((prev) => ({
            ...prev,
            status: "error",
            error: "Generation not found",
            errorType: "unknown",
          }));
          return;
        }

        // Other error — try stream anyway
        setState((prev) => ({ ...prev, status: "building" }));
        connectToStream(generationId);
      } catch {
        // Backend unreachable — try stream anyway
        setState((prev) => ({ ...prev, status: "building" }));
        connectToStream(generationId);
      }
    },
    [connectToStream],
  );

  const approvePlan = useCallback(
    async (generationId: string) => {
      cleanup();

      setState((prev) => ({
        ...prev,
        status: "building",
        agents: prev.agents.map((a) =>
          a.name === "planner" ? { ...a, status: "complete" as const } : a,
        ),
      }));

      try {
        await apiPost(`/approve/${generationId}`, {});
        connectToStream(generationId);
      } catch (err) {
        setState((prev) => ({
          ...prev,
          status: "error",
          error: err instanceof Error ? err.message : "Approval failed",
        }));
      }
    },
    [cleanup, connectToStream],
  );

  return { state, generate, connectTo, approvePlan, reset };
}
