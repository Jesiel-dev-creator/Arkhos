"use client";

import { useTranslations } from "next-intl";
import { Check, Loader2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgentState } from "@/hooks/use-sse";

interface PipelinePanelProps {
  agents: AgentState[];
  currentAgent: string | null;
  totalCostEur: number;
}

export function PipelinePanel({ agents, currentAgent, totalCostEur }: PipelinePanelProps) {
  const t = useTranslations("generate");

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
          {t("sections.pipeline")}
        </h3>
        <span className="text-xs font-[var(--font-code)] text-[var(--brand)] tabular-nums">
          {totalCostEur > 0 ? `€${totalCostEur.toFixed(4)}` : "€0.0000"}
        </span>
      </div>
      {agents.map((agent, i) => (
        <div key={`${agent.name}-${i}`}>
          <div
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200",
              (agent.status === "running" || currentAgent === agent.name) && "bg-[var(--surface)]",
            )}
          >
            <div className="flex items-center justify-center w-5 h-5 shrink-0">
              {agent.status === "complete" ? (
                <Check className="w-3.5 h-3.5 text-[var(--success)]" />
              ) : agent.status === "running" ? (
                <Loader2 className="w-3.5 h-3.5 text-[var(--brand)] animate-spin" />
              ) : (
                <Circle className="w-2.5 h-2.5 text-[var(--text-muted)]" />
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
              {agent.model && (
                <span className="text-[10px] font-[var(--font-code)] text-[var(--text-muted)] truncate block">
                  {agent.model}
                </span>
              )}
            </div>

            {agent.costEur !== undefined && agent.costEur > 0 && (
              <span className="text-[10px] font-[var(--font-code)] text-[var(--text-muted)] tabular-nums shrink-0">
                €{agent.costEur.toFixed(4)}
              </span>
            )}
          </div>

          {i < agents.length - 1 && (
            <div className="ml-[22px] w-px h-1.5 bg-[var(--border)]" />
          )}
        </div>
      ))}
    </div>
  );
}
