"use client";

import { useTranslations } from "next-intl";
import { Cpu, Clock, FileCode2, Layers } from "lucide-react";
import type { GenerationState } from "@/hooks/use-sse";

interface StatusBarProps {
  state: GenerationState;
}

export function StatusBar({ state }: StatusBarProps) {
  const t = useTranslations("generate");

  const statusLabel = {
    idle: t("status.idle"),
    starting: t("status.starting"),
    planning: t("status.planning"),
    plan_ready: t("status.planReady"),
    building: t("status.building"),
    complete: t("status.complete"),
    error: t("status.error"),
  }[state.status];

  return (
    <div className="flex items-center gap-4 px-4 py-2 border-t border-[var(--border)] bg-[var(--deep)] text-[10px] font-[var(--font-code)] text-[var(--text-muted)]">
      <div className="flex items-center gap-1.5">
        <div
          className={`w-1.5 h-1.5 rounded-full ${
            state.status === "complete"
              ? "bg-[var(--success)]"
              : state.status === "error"
                ? "bg-[var(--error)]"
                : state.status === "idle"
                  ? "bg-[var(--text-muted)]"
                  : "bg-[var(--brand)] animate-pulse"
          }`}
        />
        {statusLabel}
      </div>

      {state.totalCostEur > 0 && (
        <div className="flex items-center gap-1">
          <Layers className="w-3 h-3" />
          <span className="tabular-nums">€{state.totalCostEur.toFixed(4)}</span>
        </div>
      )}

      {state.totalDurationS > 0 && (
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span className="tabular-nums">{state.totalDurationS.toFixed(1)}s</span>
        </div>
      )}

      {state.fileCount > 0 && (
        <div className="flex items-center gap-1">
          <FileCode2 className="w-3 h-3" />
          <span>{t("workspace.filesGenerated", { count: state.fileCount })}</span>
        </div>
      )}

      {state.profile && (
        <div className="flex items-center gap-1 ml-auto">
          <Cpu className="w-3 h-3" />
          <span className="uppercase">{state.profile}</span>
          {state.estCost && <span>&middot; {state.estCost}</span>}
        </div>
      )}
    </div>
  );
}
