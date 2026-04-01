/**
 * PipelineStrip — compact horizontal status bar for the 5-agent pipeline.
 * Adapted from 21st.dev Magic MCP StatusBar component.
 */

import { CheckCircle2, Clock, Loader2 } from "lucide-react";
import type { AgentState, GenerationStatus } from "@/hooks/useSSE";
import { formatCostEUR, formatDuration } from "@/lib/utils";

interface PipelineStripProps {
  agents: AgentState[];
  status: GenerationStatus;
  totalCostEur: number;
  totalDurationS: number;
  timeoutWarning?: boolean;
  remainingToday?: number;
}

const LABELS: Record<string, string> = {
  planner: "Plan",
  designer: "Design",
  architect: "Arch",
  builder: "Build",
  reviewer: "Review",
};

const AGENT_SUBTITLES: Record<string, string> = {
  planner: "Understanding your website requirements...",
  designer: "Choosing colors, fonts, and visual style...",
  architect: "Planning React component structure...",
  builder: "Writing your website code...",
  reviewer: "Checking quality and security...",
};

export default function PipelineStrip({
  agents,
  status,
  totalCostEur,
  totalDurationS,
  timeoutWarning,
  remainingToday,
}: PipelineStripProps) {
  const showCost = status === "running" || status === "complete" || status === "starting";

  return (
    <div
      className="flex items-center gap-1 rounded-lg p-2 flex-shrink-0"
      style={{
        background: "rgba(13, 27, 42, 0.7)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Agent pills */}
      {agents.map((agent, i) => (
        <div key={agent.name} className="flex items-center">
          <div
            className="flex items-center gap-1.5 rounded-md border px-2.5 py-1 transition-all duration-300"
            style={{
              background:
                agent.status === "complete"
                  ? "rgba(34, 214, 138, 0.12)"
                  : agent.status === "running"
                  ? "rgba(0, 212, 238, 0.12)"
                  : "rgba(13, 27, 42, 0.4)",
              borderColor:
                agent.status === "complete"
                  ? "rgba(34, 214, 138, 0.25)"
                  : agent.status === "running"
                  ? "rgba(0, 212, 238, 0.25)"
                  : "var(--border)",
              color:
                agent.status === "complete"
                  ? "#22D68A"
                  : agent.status === "running"
                  ? "#00D4EE"
                  : "#7B8FA3",
            }}
          >
            {/* Status icon */}
            {agent.status === "complete" ? (
              <CheckCircle2 size={13} />
            ) : agent.status === "running" ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Clock size={13} />
            )}

            {/* Label */}
            <span
              className="text-[11px] font-medium whitespace-nowrap"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {LABELS[agent.name] || agent.name}
            </span>

            {/* Subtitle for active agent */}
            {agent.status === "running" && AGENT_SUBTITLES[agent.name] && (
              <span
                className="text-[9px] whitespace-nowrap hidden lg:inline"
                style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
              >
                {AGENT_SUBTITLES[agent.name]}
              </span>
            )}
          </div>

          {/* Connector line between pills */}
          {i < agents.length - 1 && (
            <div
              className="h-px w-2 mx-0.5 flex-shrink-0"
              style={{ background: "var(--border)" }}
            />
          )}
        </div>
      ))}

      {/* Timeout warning */}
      {timeoutWarning && (
        <span
          className="text-[10px] ml-auto whitespace-nowrap"
          style={{ color: "var(--warning)", fontFamily: "var(--font-body)" }}
        >
          Taking longer than usual...
        </span>
      )}

      {/* Cost display */}
      {showCost && (
        <div
          className="flex items-center gap-1.5 ml-auto flex-shrink-0 pl-2"
          style={{ fontFamily: "var(--font-code)" }}
        >
          <span className="text-[11px]" style={{ color: "var(--frost)" }}>
            {formatCostEUR(totalCostEur)}
          </span>
          {status === "complete" && totalDurationS > 0 && (
            <span className="text-[10px]" style={{ color: "var(--muted)" }}>
              · {formatDuration(totalDurationS)}
            </span>
          )}
        </div>
      )}

      {/* Remaining generations counter */}
      {remainingToday !== undefined && (
        <span className="text-[10px] font-mono" style={{ color: "#7B8FA3" }}>
          {remainingToday} free
        </span>
      )}
    </div>
  );
}
