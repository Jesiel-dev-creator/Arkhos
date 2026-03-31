import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Palette, Code2, ShieldCheck, Check, X, LayoutGrid } from "lucide-react";
import gsap from "gsap";
import type { AgentState, GenerationStatus } from "@/hooks/useSSE";
import { formatCostEUR, formatDuration } from "@/lib/utils";
import CostCounter from "./CostCounter";

interface AgentStreamProps {
  agents: AgentState[];
  status: GenerationStatus;
  totalCostEur: number;
  totalDurationS: number;
  timeoutWarning?: boolean;
}

const AGENT_META: Record<string, { label: string; icon: typeof Brain }> = {
  planner: { label: "Planner", icon: Brain },
  designer: { label: "Designer", icon: Palette },
  architect: { label: "Architect", icon: LayoutGrid },
  builder: { label: "Builder", icon: Code2 },
  reviewer: { label: "Reviewer", icon: ShieldCheck },
};

export default function PipelineStrip({ agents, status, totalCostEur, totalDurationS, timeoutWarning }: AgentStreamProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  /* GSAP stagger entrance */
  useEffect(() => {
    if (status === "running" && !hasAnimated.current && stripRef.current) {
      hasAnimated.current = true;
      const items = stripRef.current.querySelectorAll("[data-agent-item]");
      gsap.from(items, { x: 20, opacity: 0, stagger: 0.08, duration: 0.3, ease: "power2.out" });
    }
    if (status === "idle") {
      hasAnimated.current = false;
      setExpandedAgent(null);
    }
  }, [status]);

  /* Auto-expand running agent, clear if expanded agent no longer exists */
  useEffect(() => {
    const running = agents.find((a) => a.status === "running");
    if (running) {
      setExpandedAgent(running.name);
    } else if (expandedAgent && !agents.find((a) => a.name === expandedAgent)) {
      setExpandedAgent(null);
    }
  }, [agents, expandedAgent]);

  const showCost = status === "running" || status === "complete" || status === "starting";

  return (
    <div className="flex-shrink-0">
      {/* ── Compact Horizontal Strip ── */}
      <div
        ref={stripRef}
        className="flex items-center gap-3 px-4 py-2.5 rounded-[12px]"
        style={{
          background: "rgba(13, 27, 42, 0.7)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid var(--border)",
        }}
      >
        <span
          className="text-[9px] uppercase tracking-wider flex-shrink-0"
          style={{ fontFamily: "var(--font-code)", color: "var(--muted)" }}
        >
          Pipeline
        </span>

        <div className="flex items-center gap-3 flex-1">
          {agents.map((agent) => (
            <AgentPill
              key={agent.name}
              agent={agent}
              isExpanded={expandedAgent === agent.name}
              onClick={() =>
                setExpandedAgent(expandedAgent === agent.name ? null : agent.name)
              }
            />
          ))}
        </div>

        {/* Timeout warning */}
        {timeoutWarning && (
          <span className="text-[11px] ml-auto flex-shrink-0"
                style={{ color: "var(--warning)", fontFamily: "var(--font-body)" }}>
            Taking longer than usual...
          </span>
        )}

        {/* Cost on the right */}
        {showCost && (
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            <CostCounter value={totalCostEur} size="sm" />
            {status === "complete" && totalDurationS > 0 && (
              <span
                className="text-[10px]"
                style={{ fontFamily: "var(--font-code)", color: "var(--muted)" }}
              >
                · {formatDuration(totalDurationS)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Expanded Agent Detail ── */}
      <AnimatePresence>
        {expandedAgent && agents.find((a) => a.name === expandedAgent) && (
          <AgentDetail
            agent={agents.find((a) => a.name === expandedAgent)!}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Agent Pill (in the strip) ── */
function AgentPill({
  agent,
  isExpanded,
  onClick,
}: {
  agent: AgentState;
  isExpanded: boolean;
  onClick: () => void;
}) {
  const meta = AGENT_META[agent.name] || { label: agent.name, icon: Brain };
  const dotRef = useRef<HTMLSpanElement>(null);

  const isRunning = agent.status === "running";
  const isComplete = agent.status === "complete";
  const isError = agent.status === "error";

  useEffect(() => {
    if (isRunning && dotRef.current) {
      const tl = gsap.timeline({ repeat: -1 });
      tl.to(dotRef.current, { scale: 1.5, opacity: 1, duration: 0.5, ease: "sine.inOut" })
        .to(dotRef.current, { scale: 0.8, opacity: 0.4, duration: 0.5, ease: "sine.inOut" });
      return () => { tl.kill(); };
    }
  }, [isRunning]);

  return (
    <button
      data-agent-item
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all duration-200 cursor-pointer ${
        isExpanded ? "bg-white/[0.06]" : "hover:bg-white/[0.04]"
      }`}
      type="button"
    >
      {/* Status indicator */}
      {isRunning ? (
        <span
          ref={dotRef}
          className="w-[7px] h-[7px] rounded-full flex-shrink-0"
          style={{ backgroundColor: "var(--cyan)", boxShadow: "0 0 6px rgba(0,212,238,0.6)" }}
        />
      ) : isComplete ? (
        <Check size={12} strokeWidth={2.5} style={{ color: "var(--success)" }} />
      ) : isError ? (
        <X size={12} style={{ color: "var(--error)" }} />
      ) : (
        <span
          className="w-[7px] h-[7px] rounded-full border flex-shrink-0"
          style={{ borderColor: "var(--muted)", opacity: 0.4 }}
        />
      )}

      {/* Name */}
      <span
        className={`text-[12px] font-medium whitespace-nowrap ${
          isRunning ? "text-[var(--cyan)]" :
          isComplete ? "text-[var(--muted)]" :
          isError ? "text-[var(--error)]" :
          "text-[var(--muted)]/50"
        }`}
        style={{ fontFamily: "var(--font-body)" }}
      >
        {meta.label}
      </span>
    </button>
  );
}

/* ── Expanded Detail Dropdown ── */
function AgentDetail({ agent }: { agent: AgentState }) {
  const meta = AGENT_META[agent.name] || { label: agent.name, icon: Brain };
  const isRunning = agent.status === "running";
  const isComplete = agent.status === "complete";

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="overflow-hidden"
    >
      <div
        className="flex items-center gap-3 px-4 py-2.5 mt-1.5 rounded-[10px]"
        style={{
          background: "rgba(13, 27, 42, 0.5)",
          border: `1px solid ${
            isRunning ? "rgba(0,212,238,0.2)" :
            isComplete ? "rgba(34,214,138,0.15)" :
            "var(--border)"
          }`,
        }}
      >
        {/* Icon */}
        {isRunning ? (
          <motion.span
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ color: "var(--cyan)" }}
          >
            <meta.icon size={14} />
          </motion.span>
        ) : isComplete ? (
          <Check size={14} strokeWidth={2.5} style={{ color: "var(--success)" }} />
        ) : (
          <meta.icon size={14} style={{ color: "var(--muted)" }} />
        )}

        {/* Name */}
        <span className="text-[12px] font-semibold text-[var(--frost)]"
              style={{ fontFamily: "var(--font-body)" }}>
          {meta.label}
        </span>

        {/* Model badge */}
        {agent.model && (
          <span
            className="text-[10px] px-2 py-0.5 rounded-full"
            style={{
              fontFamily: "var(--font-code)",
              backgroundColor: isRunning ? "rgba(0,212,238,0.08)" : "rgba(13,27,42,0.8)",
              color: isRunning ? "var(--cyan)" : "var(--muted)",
              border: `1px solid ${isRunning ? "rgba(0,212,238,0.2)" : "var(--border)"}`,
            }}
          >
            {agent.model}
          </span>
        )}

        {/* Running: processing text */}
        {isRunning && (
          <span className="text-[11px] ml-auto" style={{ color: "rgba(0,212,238,0.6)", fontFamily: "var(--font-body)" }}>
            Processing
            <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
              ...
            </motion.span>
          </span>
        )}

        {/* Complete: cost + duration */}
        {isComplete && (
          <div className="flex items-center gap-2 ml-auto">
            {agent.cost_eur !== undefined && (
              <span className="text-[11px]" style={{ fontFamily: "var(--font-code)", color: "var(--success)" }}>
                {formatCostEUR(agent.cost_eur)}
              </span>
            )}
            {agent.duration_s !== undefined && (
              <span className="text-[11px]" style={{ fontFamily: "var(--font-code)", color: "var(--muted)" }}>
                {formatDuration(agent.duration_s)}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
