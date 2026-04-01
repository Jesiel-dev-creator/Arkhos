"use client";

import { useMemo } from "react";
import type { AgentState } from "@/hooks/useSSE";
import {
  CheckCircle2,
  Circle,
  CircleDotDashed,
  CircleX,
} from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

interface PipelinePlanProps {
  agents: AgentState[];
  status: string;
}

// Map SSE agent status to plan status
function agentToStatus(agent: AgentState): string {
  if (agent.status === "complete") return "completed";
  if (agent.status === "running") return "in-progress";
  if (agent.status === "error") return "failed";
  return "pending";
}

// Agent definitions with subtasks describing what each does
const AGENT_DEFS = [
  {
    id: "planner",
    title: "Planner Agent",
    description: "Analyzes your prompt and creates a structured site spec",
    model: "ministral-3b",
    subtasks: [
      { id: "p1", title: "Parse requirements", description: "Extract sections, style, locale from your prompt" },
      { id: "p2", title: "Classify industry", description: "Match to bakery, SaaS, portfolio, etc." },
      { id: "p3", title: "Generate site spec", description: "Output structured JSON with sections and style" },
    ],
  },
  {
    id: "designer",
    title: "Designer Agent",
    description: "Creates the visual design system — colors, fonts, layout",
    model: "mistral-small",
    subtasks: [
      { id: "d1", title: "Choose color palette", description: "Primary, secondary, accent colors based on industry" },
      { id: "d2", title: "Select typography", description: "Display, body, and code font families" },
      { id: "d3", title: "Define layout", description: "Spacing, grid, section order" },
    ],
  },
  {
    id: "architect",
    title: "Architect Agent",
    description: "Plans the React component structure and file organization",
    model: "mistral-small",
    subtasks: [
      { id: "a1", title: "Plan sections", description: "Map sections to React components" },
      { id: "a2", title: "Choose UI components", description: "Select shadcn/ui components per section" },
      { id: "a3", title: "Define section order", description: "Navbar → Hero → sections → Footer" },
    ],
  },
  {
    id: "builder",
    title: "Builder Agent",
    description: "Writes production React + TypeScript + Tailwind code",
    model: "devstral-small",
    subtasks: [
      { id: "b1", title: "Generate config files", description: "package.json, vite.config, tailwind.config" },
      { id: "b2", title: "Write CSS variables", description: "index.css with design system tokens" },
      { id: "b3", title: "Build sections", description: "Each section as a React component" },
      { id: "b4", title: "Compose App.tsx", description: "Wire all sections together" },
    ],
  },
  {
    id: "reviewer",
    title: "Reviewer Agent",
    description: "Security scan, quality check, and spec compliance",
    model: "mistral-small",
    subtasks: [
      { id: "r1", title: "Security scan", description: "Check for XSS, hardcoded secrets, unsafe patterns" },
      { id: "r2", title: "Quality check", description: "Validate imports, missing components, TypeScript" },
      { id: "r3", title: "Fix issues", description: "Auto-fix any problems found" },
    ],
  },
];

export default function PipelinePlan({ agents, status }: PipelinePlanProps) {
  // Build task list from agent definitions + real SSE state
  const tasks = useMemo(() => {
    return AGENT_DEFS.map((def, index) => {
      const agentState = agents.find((a) => a.name === def.id);
      const agentStatus = agentState ? agentToStatus(agentState) : "pending";

      // Subtask statuses derived from parent
      const subtasks = def.subtasks.map((st) => ({
        ...st,
        status: agentStatus === "completed" ? "completed"
              : agentStatus === "in-progress" ? "in-progress"
              : agentStatus === "failed" ? "failed"
              : "pending",
        priority: "medium" as const,
        tools: [def.model],
      }));

      return {
        id: def.id,
        title: def.title,
        description: def.description,
        status: agentStatus,
        priority: "high" as const,
        level: 0,
        dependencies: index > 0 ? [AGENT_DEFS[index - 1].id] : [],
        subtasks,
      };
    });
  }, [agents]);

  // Find the currently active agent to auto-expand
  const activeAgent = agents.find((a) => a.status === "running");

  return (
    <div className="text-[var(--text-primary)] overflow-auto">
      <div className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[var(--deep)] shadow overflow-hidden">
        <div className="px-3 py-2 border-b border-[rgba(255,255,255,0.06)]">
          <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
            {status === "complete" ? "Pipeline complete"
             : status === "running" || status === "starting" ? "Pipeline running..."
             : "Pipeline idle"}
          </p>
        </div>
        <LayoutGroup>
          <div className="p-3 overflow-hidden">
            <ul className="space-y-1">
              {tasks.map((task) => {
                const isExpanded = task.id === activeAgent?.name || task.status === "in-progress";
                const isCompleted = task.status === "completed";

                return (
                  <li key={task.id}>
                    <div className="group flex items-center px-2 py-1.5 rounded-md hover:bg-white/[0.03] transition-colors">
                      <div className="mr-2 flex-shrink-0">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={task.status}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                          >
                            {task.status === "completed" ? (
                              <CheckCircle2 className="h-4 w-4 text-[var(--green)]" />
                            ) : task.status === "in-progress" ? (
                              <CircleDotDashed className="h-4 w-4 text-[var(--cyan)] animate-spin" style={{ animationDuration: '3s' }} />
                            ) : task.status === "failed" ? (
                              <CircleX className="h-4 w-4 text-[var(--error)]" />
                            ) : (
                              <Circle className="h-4 w-4 text-[var(--text-muted)]" />
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </div>

                      <div className="flex flex-1 items-center justify-between min-w-0">
                        <span className={`text-sm truncate ${isCompleted ? "text-[var(--text-muted)] line-through" : ""}`}>
                          {task.title}
                        </span>
                        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                          <span className="text-[10px] font-mono text-[var(--text-muted)]">
                            {task.subtasks[0]?.tools?.[0]}
                          </span>
                          <span className={`text-[10px] rounded px-1.5 py-0.5 ${
                            task.status === "completed" ? "bg-[var(--green-dim)] text-[var(--green)]"
                            : task.status === "in-progress" ? "bg-[var(--cyan-dim)] text-[var(--cyan)]"
                            : task.status === "failed" ? "bg-red-500/10 text-red-400"
                            : "bg-white/5 text-[var(--text-muted)]"
                          }`}>
                            {task.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Subtasks when agent is active */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <ul className="ml-6 pl-3 border-l border-dashed border-[rgba(255,255,255,0.1)] space-y-1 py-1">
                            {task.subtasks.map((st) => (
                              <li key={st.id} className="flex items-center gap-2 py-0.5">
                                {st.status === "completed" ? (
                                  <CheckCircle2 className="h-3 w-3 text-[var(--green)]" />
                                ) : st.status === "in-progress" ? (
                                  <CircleDotDashed className="h-3 w-3 text-[var(--cyan)] animate-spin" style={{ animationDuration: '3s' }} />
                                ) : (
                                  <Circle className="h-3 w-3 text-[var(--text-muted)]" />
                                )}
                                <span className={`text-xs ${st.status === "completed" ? "text-[var(--text-muted)] line-through" : "text-[var(--text-secondary)]"}`}>
                                  {st.title}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          </div>
        </LayoutGroup>
      </div>
    </div>
  );
}
