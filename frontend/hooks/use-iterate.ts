"use client";

import { useCallback, useState } from "react";
import { apiPost, sseUrl } from "@/lib/api";

export interface IterationMessage {
  role: "user" | "assistant";
  content: string;
  costEur?: number;
  durationS?: number;
}

export interface IterateState {
  status: "idle" | "sending" | "building" | "complete" | "error";
  messages: IterationMessage[];
  error: string | null;
}

const INITIAL_STATE: IterateState = {
  status: "idle",
  messages: [],
  error: null,
};

export function useIterate(
  onFileChunk?: (path: string, content: string) => void,
) {
  const [state, setState] = useState<IterateState>({ ...INITIAL_STATE });

  const iterate = useCallback(
    async (generationId: string, modification: string) => {
      setState((prev) => ({
        ...prev,
        status: "sending",
        error: null,
        messages: [
          ...prev.messages,
          { role: "user" as const, content: modification },
        ],
      }));

      try {
        const res = await apiPost<{ generation_id: string }>("/iterate", {
          generation_id: generationId,
          modification,
        });

        setState((prev) => ({ ...prev, status: "building" }));

        const es = new EventSource(sseUrl(`/stream/${res.generation_id}`));

        es.addEventListener("agent_complete", (e: MessageEvent) => {
          try { JSON.parse(e.data); } catch { /* ignore */ }
        });

        es.addEventListener("file_chunk", (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            if (data.path && data.content && onFileChunk) {
              onFileChunk(data.path, data.content);
            }
          } catch { /* ignore */ }
        });

        es.addEventListener("generation_complete", (e: MessageEvent) => {
          es.close();
          try {
            const data = JSON.parse(e.data);
            setState((prev) => ({
              ...prev,
              status: "complete",
              messages: [
                ...prev.messages,
                {
                  role: "assistant" as const,
                  content: "Changes applied.",
                  costEur: data.total_cost_eur,
                  durationS: data.total_duration_s,
                },
              ],
            }));
          } catch {
            setState((prev) => ({ ...prev, status: "complete" }));
          }
        });

        es.addEventListener("error", (e: MessageEvent) => {
          es.close();
          try {
            const data = JSON.parse(e.data);
            setState((prev) => ({
              ...prev,
              status: "error",
              error: data.error ?? "Iteration failed",
            }));
          } catch {
            setState((prev) => ({
              ...prev,
              status: "error",
              error: "Connection lost during iteration",
            }));
          }
        });

        es.onerror = () => {
          es.close();
          setState((prev) => {
            if (prev.status === "complete" || prev.status === "error") return prev;
            return { ...prev, status: "error", error: "Connection lost" };
          });
        };

        return res.generation_id;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          status: "error",
          error: err instanceof Error ? err.message : "Failed to start iteration",
        }));
        return null;
      }
    },
    [onFileChunk],
  );

  const reset = useCallback(() => {
    setState({ ...INITIAL_STATE });
  }, []);

  return { state, iterate, reset };
}
