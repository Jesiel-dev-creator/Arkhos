import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, RotateCcw, Check, Loader2 } from "lucide-react";
import type { ChatMessage, GenerationStatus } from "@/hooks/useSSE";
import { formatCostEUR, formatDuration } from "@/lib/utils";

interface IterationChatProps {
  messages: ChatMessage[];
  originalPrompt: string;
  status: GenerationStatus;
  onIterate: (modification: string) => void;
  onNewSite: () => void;
}

export default function IterationChat({
  messages,
  originalPrompt,
  status,
  onIterate,
  onNewSite,
}: IterationChatProps) {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isRunning = status === "running" || status === "starting";

  /* Auto-scroll to bottom */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status]);

  /* Auto-resize textarea — from Magic MCP */
  const adjustHeight = useCallback((reset?: boolean) => {
    const ta = textareaRef.current;
    if (!ta) return;
    if (reset) { ta.style.height = "24px"; return; }
    ta.style.height = "24px";
    ta.style.height = `${Math.min(Math.max(24, ta.scrollHeight), 120)}px`;
  }, []);

  useEffect(() => { adjustHeight(); }, [input, adjustHeight]);

  const handleSubmit = () => {
    if (!input.trim() || isRunning) return;
    onIterate(input.trim());
    setInput("");
    adjustHeight(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const hasText = input.trim().length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <button
          onClick={onNewSite}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 border hover:bg-white/[0.04]"
          style={{ color: "var(--muted)", borderColor: "var(--border)", fontFamily: "var(--font-body)" }}
        >
          <RotateCcw size={11} />
          New site
        </button>
      </div>

      <p
        className="text-sm font-medium mb-3 line-clamp-2 flex-shrink-0"
        style={{ color: "var(--frost)", fontFamily: "var(--font-body)" }}
      >
        {originalPrompt.length > 80 ? originalPrompt.slice(0, 80) + "..." : originalPrompt}
      </p>

      {/* ── Chat thread ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1 min-h-0">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] px-3.5 py-2.5 rounded-xl text-[13px] leading-relaxed ${
                msg.role === "user" ? "rounded-br-sm" : "rounded-bl-sm"
              }`}
              style={{
                background: msg.role === "user" ? "rgba(13, 27, 42, 0.7)" : "rgba(13, 27, 42, 0.4)",
                border: `1px solid ${msg.role === "user" ? "rgba(255,255,255,0.06)" : "var(--border)"}`,
                backdropFilter: msg.role === "user" ? "blur(8px)" : undefined,
                color: msg.role === "user" ? "var(--frost)" : "var(--muted)",
                fontFamily: "var(--font-body)",
              }}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.costEur !== undefined && (
                <div
                  className="flex items-center gap-2 mt-1.5 pt-1.5"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <Check size={11} style={{ color: "var(--success)" }} />
                  <span style={{ fontFamily: "var(--font-code)", color: "var(--success)", fontSize: "10px" }}>
                    {formatCostEUR(msg.costEur)}
                  </span>
                  {msg.durationS !== undefined && (
                    <span style={{ fontFamily: "var(--font-code)", color: "var(--muted)", fontSize: "10px" }}>
                      · {formatDuration(msg.durationS)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* In-progress bubble */}
        <AnimatePresence>
          {isRunning && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl rounded-bl-sm text-[13px]"
                style={{
                  background: "rgba(13, 27, 42, 0.4)",
                  border: "1px solid rgba(0, 212, 238, 0.15)",
                  color: "var(--cyan)",
                  fontFamily: "var(--font-body)",
                }}
              >
                <Loader2 size={13} className="animate-spin" />
                Updating...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Premium Chat Input — from Magic MCP ── */}
      <div className="flex-shrink-0">
        <div className="relative">
          {/* Glass container */}
          <div
            className="relative rounded-[20px] overflow-hidden transition-all duration-300"
            style={{
              background: "rgba(13, 27, 42, 0.8)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: `1px solid ${isFocused ? "rgba(0,212,238,0.2)" : "rgba(255,255,255,0.08)"}`,
              boxShadow: isFocused
                ? "0 0 15px rgba(0,212,238,0.12), 0 0 30px rgba(0,212,238,0.06), 0 4px 20px rgba(0,0,0,0.3)"
                : "0 4px 20px rgba(0,0,0,0.2)",
            }}
          >
            {/* Gradient overlay for glass depth */}
            <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none" />

            {/* Inner content: textarea + send button */}
            <div className="relative flex items-end gap-3 p-3 pl-4">
              {/* Auto-expanding textarea */}
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Refine your website..."
                  disabled={isRunning}
                  rows={1}
                  className="w-full bg-transparent border-0 outline-none resize-none text-[14px] leading-relaxed py-1.5 text-[var(--frost)] placeholder:text-[var(--muted)]/40 disabled:opacity-40"
                  style={{
                    fontFamily: "var(--font-body)",
                    minHeight: "24px",
                    maxHeight: "120px",
                  }}
                />
              </div>

              {/* Circular send button — from Magic MCP */}
              <motion.button
                onClick={handleSubmit}
                disabled={!hasText || isRunning}
                whileHover={hasText && !isRunning ? { scale: 1.08 } : undefined}
                whileTap={hasText && !isRunning ? { scale: 0.92 } : undefined}
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
                style={{
                  background: hasText && !isRunning
                    ? "linear-gradient(135deg, var(--ember), #FF8C5A)"
                    : "rgba(255,255,255,0.04)",
                  color: hasText && !isRunning ? "white" : "var(--muted)",
                  boxShadow: hasText && !isRunning
                    ? "0 0 16px rgba(255,107,53,0.4), 0 0 4px rgba(255,107,53,0.2)"
                    : "none",
                  cursor: hasText && !isRunning ? "pointer" : "not-allowed",
                  opacity: !hasText || isRunning ? 0.4 : 1,
                }}
              >
                <ArrowUp size={16} />
              </motion.button>
            </div>

            {/* Bottom highlight line — from Magic MCP */}
            <div
              className="absolute bottom-0 left-4 right-4 h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }}
            />
          </div>
        </div>

        {/* Cost hint */}
        <p
          className="text-[10px] mt-2 text-right pr-1"
          style={{ color: "var(--muted)", fontFamily: "var(--font-code)" }}
        >
          ~€0.001 per iteration
        </p>
      </div>
    </div>
  );
}
