"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Activity, ChevronDown, ChevronUp } from "lucide-react"

interface SystemMonitorProps {
  activeAgents?: number
  totalAgents?: number
  costEur?: number
  elapsedSeconds?: number
  progress?: number
  className?: string
}

export default function SystemMonitor({
  activeAgents = 0,
  totalAgents = 4,
  costEur = 0,
  elapsedSeconds = 0,
  progress = 0,
  className,
}: SystemMonitorProps) {
  const [expanded, setExpanded] = useState(false)

  const formatCost = (eur: number) =>
    `\u20AC${eur.toFixed(4)}`

  const formatTime = (s: number) => {
    if (s < 60) return `${s.toFixed(1)}s`
    const min = Math.floor(s / 60)
    const sec = Math.round(s % 60)
    return `${min}m ${sec}s`
  }

  const isActive = activeAgents > 0

  return (
    <div
      className={`rounded-xl overflow-hidden transition-all duration-300 ${className ?? ""}`}
      style={{
        background: "var(--deep)",
        border: `1px solid ${isActive ? "rgba(0,212,238,0.15)" : "var(--border)"}`,
      }}
    >
      {/* Collapsed header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 transition-colors duration-200 hover:bg-white/[0.02]"
      >
        <Activity
          size={14}
          className={isActive ? "animate-pulse" : ""}
          style={{ color: isActive ? "var(--cyan)" : "var(--muted)" }}
        />
        <span
          className="text-xs font-medium flex-1 text-left"
          style={{ fontFamily: "var(--font-body)", color: "var(--frost)" }}
        >
          System Monitor
        </span>

        {/* Compact stats */}
        <span
          className="text-[10px]"
          style={{ fontFamily: "var(--font-code)", color: "var(--cyan)" }}
        >
          {activeAgents}/{totalAgents}
        </span>

        {expanded ? (
          <ChevronUp size={12} style={{ color: "var(--muted)" }} />
        ) : (
          <ChevronDown size={12} style={{ color: "var(--muted)" }} />
        )}
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div
              className="px-4 pb-4 space-y-3"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 pt-3">
                {/* Active agents */}
                <div>
                  <p
                    className="text-[10px] mb-1"
                    style={{ fontFamily: "var(--font-body)", color: "var(--muted)" }}
                  >
                    Agents
                  </p>
                  <p
                    className="text-lg"
                    style={{ fontFamily: "var(--font-code)", color: "var(--frost)" }}
                  >
                    {activeAgents}
                    <span
                      className="text-[10px] ml-0.5"
                      style={{ color: "var(--muted)" }}
                    >
                      /{totalAgents}
                    </span>
                  </p>
                </div>

                {/* Cost */}
                <div>
                  <p
                    className="text-[10px] mb-1"
                    style={{ fontFamily: "var(--font-body)", color: "var(--muted)" }}
                  >
                    Cost
                  </p>
                  <p
                    className="text-lg"
                    style={{ fontFamily: "var(--font-code)", color: "var(--success)" }}
                  >
                    {formatCost(costEur)}
                  </p>
                </div>

                {/* Time */}
                <div>
                  <p
                    className="text-[10px] mb-1"
                    style={{ fontFamily: "var(--font-body)", color: "var(--muted)" }}
                  >
                    Time
                  </p>
                  <p
                    className="text-lg"
                    style={{ fontFamily: "var(--font-code)", color: "var(--frost)" }}
                  >
                    {formatTime(elapsedSeconds)}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="text-[10px]"
                    style={{ fontFamily: "var(--font-body)", color: "var(--muted)" }}
                  >
                    Generation progress
                  </span>
                  <span
                    className="text-[10px]"
                    style={{ fontFamily: "var(--font-code)", color: "var(--frost)" }}
                  >
                    {Math.round(progress)}%
                  </span>
                </div>
                <div
                  className="w-full h-1.5 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: "linear-gradient(90deg, var(--cyan), var(--ember))",
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
