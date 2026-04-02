"use client";

import { Cpu, Clock, FileCode2, Layers } from "lucide-react";
import type { GenerationState } from "@/hooks/use-sse";

interface StatusBarProps {
  state: GenerationState;
}

export function StatusBar({ state }: StatusBarProps) {
  const statusLabel = {
    idle: "Ready",
    starting: "Starting...",
    planning: "Planning...",
    plan_ready: "Plan ready",
    building: "Building...",
    complete: "Complete",
    error: "Error",
  }[state.status];

  return (
    <div className="flex items-center gap-4 px-4 py-2 border-t border-[var(--border)] bg-[var(--deep)] text-[10px] font-[var(--font-code)] text-[var(--text-muted)]">
      {/* Status */}
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

      {/* Cost */}
      {state.totalCostEur > 0 && (
        <div className="flex items-center gap-1">
          <Layers className="w-3 h-3" />
          <span className="tabular-nums">{"\u20AC"}{state.totalCostEur.toFixed(4)}</span>
        </div>
      )}

      {/* Duration */}
      {state.totalDurationS > 0 && (
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span className="tabular-nums">{state.totalDurationS.toFixed(1)}s</span>
        </div>
      )}

      {/* Files */}
      {state.fileCount > 0 && (
        <div className="flex items-center gap-1">
          <FileCode2 className="w-3 h-3" />
          <span>{state.fileCount} files</span>
        </div>
      )}

      {/* Profile */}
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
