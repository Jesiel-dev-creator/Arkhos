"use client";

import { useTranslations } from "next-intl";
import { Check, Loader2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgentState } from "@/hooks/use-sse";
import type { GenerationStatus } from "@/hooks/use-sse";

interface PipelinePanelProps {
  agents: AgentState[];
  currentAgent: string | null;
  totalCostEur: number;
  status: GenerationStatus;
}

// Skeleton slots shown while waiting for agents to arrive from SSE.
// These are NOT hardcoded agent names — just anonymous placeholder shapes.
const SKELETON_COUNT = 5;

export function PipelinePanel({ agents, currentAgent, totalCostEur, status }: PipelinePanelProps) {
  const t = useTranslations("generate");

  const showSkeleton = agents.length === 0 && status !== "idle" && status !== "complete" && status !== "error";
  const completedCount = agents.filter((a) => a.status === "complete").length;
  const totalCount = agents.length || (showSkeleton ? SKELETON_COUNT : 0);

  return (
    <div className="flex flex-col gap-1">
      {/* Header with step counter */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
            {t("sections.pipeline")}
          </h3>
          {totalCount > 0 && (
            <span className="text-[10px] font-[var(--font-code)] text-[var(--text-muted)] tabular-nums">
              {completedCount}/{totalCount}
            </span>
          )}
        </div>
        <span className="text-xs font-[var(--font-code)] text-[var(--brand)] tabular-nums">
          €{totalCostEur.toFixed(4)}
        </span>
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="h-1 rounded-full bg-[var(--surface)] mb-3 overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--brand)] transition-all duration-500 ease-out"
            style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
          />
        </div>
      )}

      {/* Agent cards or skeleton slots */}
      {showSkeleton
        ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <div key={i}>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
                <div className="flex items-center justify-center w-5 h-5 shrink-0">
                  {i === 0 ? (
                    <Loader2 className="w-3.5 h-3.5 text-[var(--brand)] animate-spin" />
                  ) : (
                    <Circle className="w-2.5 h-2.5 text-[var(--text-muted)]/30" />
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className={cn(
                    "h-3 rounded bg-[var(--surface)]",
                    i === 0 ? "w-20 animate-pulse" : "w-16 opacity-40",
                  )} />
                  <div className={cn(
                    "h-2 rounded bg-[var(--surface)]",
                    i === 0 ? "w-28 animate-pulse" : "w-24 opacity-20",
                  )} />
                </div>
              </div>
              {i < SKELETON_COUNT - 1 && (
                <div className="ml-[22px] w-px h-1.5 bg-[var(--border)]/30" />
              )}
            </div>
          ))
        : agents.map((agent, i) => (
            <div key={`${agent.name}-${i}`}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200",
                  agent.status === "running" && "bg-[var(--brand)]/5 border border-[var(--brand)]/10",
                  agent.status === "complete" && "opacity-80",
                )}
              >
                <div className="flex items-center justify-center w-5 h-5 shrink-0">
                  {agent.status === "complete" ? (
                    <div className="w-5 h-5 rounded-full bg-[var(--success)]/10 flex items-center justify-center">
                      <Check className="w-3 h-3 text-[var(--success)]" />
                    </div>
                  ) : agent.status === "running" ? (
                    <div className="w-5 h-5 rounded-full bg-[var(--brand)]/10 flex items-center justify-center">
                      <Loader2 className="w-3 h-3 text-[var(--brand)] animate-spin" />
                    </div>
                  ) : (
                    <Circle className="w-2.5 h-2.5 text-[var(--text-muted)]/40" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <span
                    className={cn(
                      "text-sm font-medium capitalize block",
                      agent.status === "running"
                        ? "text-[var(--text-primary)]"
                        : agent.status === "complete"
                          ? "text-[var(--text-secondary)]"
                          : "text-[var(--text-muted)]",
                    )}
                  >
                    {agent.name}
                  </span>
                  <span className="text-[10px] font-[var(--font-code)] text-[var(--text-muted)] truncate block">
                    {agent.model ?? "waiting..."}
                  </span>
                </div>

                {agent.status === "complete" && agent.costEur !== undefined && agent.costEur > 0 ? (
                  <span className="text-[10px] font-[var(--font-code)] text-[var(--text-muted)] tabular-nums shrink-0">
                    €{agent.costEur.toFixed(4)}
                  </span>
                ) : agent.status === "running" && agent.durationS === undefined ? (
                  <span className="text-[10px] font-[var(--font-code)] text-[var(--brand)] tabular-nums shrink-0 animate-pulse">
                    running
                  </span>
                ) : null}
              </div>

              {i < agents.length - 1 && (
                <div className="ml-[22px] w-px h-1.5 bg-[var(--border)]" />
              )}
            </div>
          ))}

      {/* Empty state */}
      {agents.length === 0 && !showSkeleton && status === "idle" && (
        <div className="px-3 py-6 text-center">
          <p className="text-xs text-[var(--text-muted)]">Connecting...</p>
        </div>
      )}
    </div>
  );
}
