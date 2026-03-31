"use client"

import { useRef, useCallback, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ArrowUp } from "lucide-react"

interface ClaudeStyleChatInputProps {
  onSubmit: (value: string) => void
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  modelName?: string
  maxLength?: number
  placeholder?: string
  className?: string
}

export default function ClaudeStyleChatInput({
  onSubmit,
  value,
  onChange,
  disabled = false,
  modelName = "auto",
  maxLength = 1000,
  placeholder = "Describe the website you want to build...",
  className,
}: ClaudeStyleChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  const hasText = value.trim().length > 0
  const charCount = value.length

  /* Auto-resize */
  const adjustHeight = useCallback((reset?: boolean) => {
    const ta = textareaRef.current
    if (!ta) return
    if (reset) { ta.style.height = "48px"; return }
    ta.style.height = "48px"
    ta.style.height = `${Math.min(Math.max(48, ta.scrollHeight), 200)}px`
  }, [])

  useEffect(() => { adjustHeight() }, [value, adjustHeight])

  const handleSubmit = () => {
    if (!hasText || disabled) return
    onSubmit(value.trim())
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className={`w-full max-w-2xl mx-auto ${className ?? ""}`}>
      <div
        className="relative rounded-2xl overflow-hidden transition-all duration-300"
        style={{
          background: "rgba(13,27,42,0.85)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: `1px solid ${isFocused ? "rgba(0,212,238,0.25)" : "rgba(255,255,255,0.08)"}`,
          boxShadow: isFocused
            ? "0 0 24px rgba(0,212,238,0.1), 0 0 48px rgba(0,212,238,0.04), 0 8px 32px rgba(0,0,0,0.3)"
            : "0 4px 24px rgba(0,0,0,0.2)",
        }}
      >
        {/* Glass gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent pointer-events-none" />

        {/* Textarea */}
        <div className="relative px-5 pt-4 pb-2">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full bg-transparent border-0 outline-none resize-none text-[15px] leading-relaxed text-[var(--frost)] placeholder:text-[var(--muted)]/35 disabled:opacity-40"
            style={{
              fontFamily: "var(--font-body)",
              minHeight: "48px",
              maxHeight: "200px",
            }}
          />
        </div>

        {/* Bottom bar */}
        <div
          className="relative flex items-center justify-between px-5 py-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
        >
          {/* Left: model indicator + file hint */}
          <div className="flex items-center gap-3">
            <span
              className="text-[11px] px-2.5 py-1 rounded-md"
              style={{
                fontFamily: "var(--font-code)",
                color: "var(--cyan)",
                background: "rgba(0,212,238,0.08)",
                border: "1px solid rgba(0,212,238,0.12)",
              }}
            >
              {modelName}
            </span>
            <span
              className="text-[11px] hidden sm:inline"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--muted)",
                opacity: 0.5,
              }}
            >
              Drag files or paste images
            </span>
          </div>

          {/* Right: char count + submit */}
          <div className="flex items-center gap-3">
            <span
              className="text-[10px]"
              style={{
                fontFamily: "var(--font-code)",
                color: charCount > maxLength * 0.9 ? "var(--warning)" : "var(--muted)",
              }}
            >
              {charCount}/{maxLength}
            </span>

            <motion.button
              onClick={handleSubmit}
              disabled={!hasText || disabled}
              whileHover={hasText && !disabled ? { scale: 1.08 } : undefined}
              whileTap={hasText && !disabled ? { scale: 0.92 } : undefined}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300"
              style={{
                background: hasText && !disabled
                  ? "linear-gradient(135deg, var(--ember), #FF8C5A)"
                  : "rgba(255,255,255,0.04)",
                color: hasText && !disabled ? "#fff" : "var(--muted)",
                boxShadow: hasText && !disabled
                  ? "0 0 16px rgba(255,107,53,0.4), 0 0 4px rgba(255,107,53,0.2)"
                  : "none",
                cursor: hasText && !disabled ? "pointer" : "not-allowed",
                opacity: !hasText || disabled ? 0.35 : 1,
              }}
            >
              <ArrowUp size={15} />
            </motion.button>
          </div>
        </div>

        {/* Bottom glow line */}
        <div
          className="absolute bottom-0 left-5 right-5 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)" }}
        />
      </div>
    </div>
  )
}
