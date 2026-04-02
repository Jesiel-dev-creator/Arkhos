"use client";

import { useRef, useState } from "react";
import { Send, Loader2, Coins, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import type { IterateState } from "@/hooks/use-iterate";
import { cn } from "@/lib/utils";

interface IterationChatProps {
  state: IterateState;
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function IterationChat({ state, onSend, disabled }: IterationChatProps) {
  const t = useTranslations("generate.iterate");
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || state.status === "sending" || state.status === "building") return;
    onSend(trimmed);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isBusy = state.status === "sending" || state.status === "building";

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
          {t("title")}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {state.messages.length === 0 && (
          <p className="text-xs text-[var(--text-muted)] text-center py-8">
            {t("placeholder")}
          </p>
        )}
        {state.messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "text-xs leading-relaxed rounded-xl px-3 py-2 max-w-[90%]",
              msg.role === "user"
                ? "ml-auto bg-[var(--brand)]/10 text-[var(--text-primary)]"
                : "bg-[var(--surface)] text-[var(--text-secondary)]",
            )}
          >
            <p>{msg.content}</p>
            {(msg.costEur !== undefined || msg.durationS !== undefined) && (
              <div className="mt-1.5 flex items-center gap-3 text-[10px] text-[var(--text-muted)]">
                {msg.costEur !== undefined && (
                  <span className="flex items-center gap-1">
                    <Coins className="w-2.5 h-2.5" /> €{msg.costEur.toFixed(4)}
                  </span>
                )}
                {msg.durationS !== undefined && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> {msg.durationS.toFixed(1)}s
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
        {isBusy && (
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Loader2 className="w-3 h-3 animate-spin" />
            {t("working")}
          </div>
        )}
      </div>

      <div className="border-t border-[var(--border)] p-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("inputPlaceholder")}
            disabled={disabled || isBusy}
            rows={2}
            className="flex-1 resize-none rounded-xl border border-[var(--border)] bg-[var(--void)] px-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none disabled:opacity-50"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={disabled || isBusy || !input.trim()}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--brand)] text-white hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="mt-1.5 text-[10px] text-[var(--text-muted)]">
          {t("hint")}
        </p>
      </div>
    </div>
  );
}
