"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  CircleDotDashed,
  CircleAlert,
  CircleX,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

// ── Types ──

type TaskStatus = "pending" | "in-progress" | "completed" | "failed" | "blocked";
type Priority = "low" | "medium" | "high" | "critical";

interface SubTask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  tools?: string[];
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  level: number;
  dependencies?: string[];
  subtasks?: SubTask[];
}

interface AgentPlanProps {
  tasks: Task[];
  title?: string;
  defaultExpanded?: string[];
}

// ── Status icons ──

function StatusIcon({ status, size = 16 }: { status: TaskStatus; size?: number }) {
  const cls = `h-[${size}px] w-[${size}px]`;
  switch (status) {
    case "completed":
      return <CheckCircle2 className="text-emerald-400" style={{ width: size, height: size }} />;
    case "in-progress":
      return (
        <CircleDotDashed
          className="text-cyan-400 animate-spin"
          style={{ width: size, height: size, animationDuration: "3s" }}
        />
      );
    case "failed":
      return <CircleX className="text-red-400" style={{ width: size, height: size }} />;
    case "blocked":
      return <CircleAlert className="text-amber-400" style={{ width: size, height: size }} />;
    default:
      return <Circle className="text-zinc-500" style={{ width: size, height: size }} />;
  }
}

// ── Status badge ──

function StatusBadge({ status }: { status: TaskStatus }) {
  const colors: Record<TaskStatus, string> = {
    pending: "bg-zinc-800 text-zinc-400",
    "in-progress": "bg-cyan-500/10 text-cyan-400",
    completed: "bg-emerald-500/10 text-emerald-400",
    failed: "bg-red-500/10 text-red-400",
    blocked: "bg-amber-500/10 text-amber-400",
  };
  return (
    <span className={`text-[10px] rounded px-1.5 py-0.5 ${colors[status]}`}>
      {status}
    </span>
  );
}

// ── Motion variants ──

const itemVariants = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.15 } },
};

const subtaskVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: { height: "auto", opacity: 1, transition: { duration: 0.25 } },
  exit: { height: 0, opacity: 0, transition: { duration: 0.2 } },
};

// ── Main Component ──

export default function AgentPlan({
  tasks,
  title = "Agent Plan",
  defaultExpanded = [],
}: AgentPlanProps) {
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(defaultExpanded)
  );

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const inProgress = tasks.filter((t) => t.status === "in-progress").length;
    return { total, completed, inProgress };
  }, [tasks]);

  return (
    <div className="text-zinc-100 overflow-auto">
      <div className="rounded-lg border border-zinc-800 bg-zinc-950 shadow overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
          <span className="text-xs font-medium text-zinc-400">{title}</span>
          <span className="text-[10px] text-zinc-500 font-mono">
            {stats.completed}/{stats.total} done
            {stats.inProgress > 0 && ` · ${stats.inProgress} active`}
          </span>
        </div>

        {/* Task list */}
        <LayoutGroup>
          <div className="p-3 overflow-hidden">
            <motion.ul className="space-y-1">
              <AnimatePresence initial={false}>
                {tasks.map((task) => {
                  const isExpanded =
                    expanded.has(task.id) || task.status === "in-progress";
                  const hasSubtasks =
                    task.subtasks && task.subtasks.length > 0;

                  return (
                    <motion.li
                      key={task.id}
                      layout
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <div
                        className="group flex items-center px-2 py-1.5 rounded-md hover:bg-zinc-900 transition-colors cursor-pointer"
                        onClick={() => hasSubtasks && toggle(task.id)}
                      >
                        {/* Expand chevron */}
                        <div className="mr-1 flex-shrink-0 w-4 flex items-center justify-center">
                          {hasSubtasks ? (
                            <motion.div
                              animate={{ rotate: isExpanded ? 90 : 0 }}
                              transition={{ duration: 0.15 }}
                            >
                              <ChevronRight className="h-3 w-3 text-zinc-500" />
                            </motion.div>
                          ) : null}
                        </div>

                        {/* Status icon */}
                        <div className="mr-2 flex-shrink-0">
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={task.status}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ duration: 0.2 }}
                            >
                              <StatusIcon status={task.status} />
                            </motion.div>
                          </AnimatePresence>
                        </div>

                        {/* Task title + badge */}
                        <div className="flex flex-1 items-center justify-between min-w-0">
                          <span
                            className={`text-sm truncate ${
                              task.status === "completed"
                                ? "text-zinc-500 line-through"
                                : ""
                            }`}
                          >
                            {task.title}
                          </span>
                          <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                            <StatusBadge status={task.status} />
                          </div>
                        </div>
                      </div>

                      {/* Subtasks */}
                      <AnimatePresence>
                        {isExpanded && hasSubtasks && (
                          <motion.div
                            variants={subtaskVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="overflow-hidden"
                          >
                            <ul className="ml-7 pl-3 border-l border-dashed border-zinc-800 space-y-1 py-1">
                              {task.subtasks!.map((st) => (
                                <li
                                  key={st.id}
                                  className="flex items-center gap-2 py-0.5"
                                >
                                  <StatusIcon status={st.status} size={12} />
                                  <span
                                    className={`text-xs ${
                                      st.status === "completed"
                                        ? "text-zinc-500 line-through"
                                        : "text-zinc-400"
                                    }`}
                                  >
                                    {st.title}
                                  </span>
                                  {st.tools && st.tools.length > 0 && (
                                    <span className="text-[9px] text-zinc-600 font-mono">
                                      {st.tools.join(", ")}
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </motion.ul>
          </div>
        </LayoutGroup>
      </div>
    </div>
  );
}

export type { Task, SubTask, TaskStatus, Priority, AgentPlanProps };
