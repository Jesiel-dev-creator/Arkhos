import { Zap, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlanReviewProps {
  plan: string;
  onApprove: () => void;
  onEdit: () => void;
}

interface PlanData {
  site_type?: string;
  locale?: string;
  industry?: string;
  color_mood?: string;
  typography_mood?: string;
  sections?: string[];
  style?: string;
  [key: string]: unknown;
}

const KEY_LABELS: Record<string, string> = {
  site_type: "Site type",
  locale: "Locale",
  industry: "Industry",
  color_mood: "Color mood",
  typography_mood: "Typography",
};

const PLAN_KEYS = Object.keys(KEY_LABELS) as Array<keyof typeof KEY_LABELS>;

export default function PlanReview({ plan, onApprove, onEdit }: PlanReviewProps) {
  let parsed: PlanData | null = null;
  try {
    parsed = JSON.parse(plan) as PlanData;
  } catch {
    parsed = null;
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Header label */}
      <span
        className="text-[var(--muted)] tracking-widest uppercase select-none"
        style={{
          fontFamily: "var(--font-code)",
          fontSize: "10px",
        }}
      >
        Plan
      </span>

      {/* Glass card */}
      <div
        className="flex flex-col gap-4 rounded-[16px] p-5 border border-[var(--border)]"
        style={{
          background: "rgba(13, 27, 42, 0.7)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        {parsed !== null ? (
          <>
            {/* Key-value pairs */}
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
              {PLAN_KEYS.map((key) => {
                const value = parsed![key];
                if (value === undefined || value === null) return null;
                return (
                  <div key={key} className="contents">
                    <dt
                      className="text-[var(--muted)] text-xs leading-5 whitespace-nowrap"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {KEY_LABELS[key]}
                    </dt>
                    <dd
                      className="text-[var(--frost)] text-xs leading-5 font-medium"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {String(value)}
                    </dd>
                  </div>
                );
              })}
            </dl>

            {/* Sections pills */}
            {Array.isArray(parsed.sections) && parsed.sections.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span
                  className="text-[var(--muted)] text-[10px] uppercase tracking-widest"
                  style={{ fontFamily: "var(--font-code)" }}
                >
                  Sections
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {parsed.sections.map((section) => (
                    <span
                      key={section}
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                        "bg-[rgba(0,212,238,0.10)] text-[var(--cyan)]"
                      )}
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {section}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Style description */}
            {typeof parsed.style === "string" && parsed.style && (
              <p
                className="text-[var(--muted)] text-xs italic leading-relaxed"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {parsed.style}
              </p>
            )}
          </>
        ) : (
          /* Fallback: raw text */
          <pre
            className="text-[var(--frost)] text-xs leading-relaxed whitespace-pre-wrap break-words"
            style={{ fontFamily: "var(--font-code)" }}
          >
            {plan}
          </pre>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onApprove}
            className={cn(
              "flex items-center gap-2 rounded-[10px] px-4 py-2 text-sm font-medium text-white",
              "transition-all duration-200",
              "hover:brightness-110 active:scale-[0.97]"
            )}
            style={{
              fontFamily: "var(--font-body)",
              background: "var(--ember)",
              boxShadow: "0 0 20px rgba(255, 107, 53, 0.35)",
            }}
            type="button"
          >
            <Zap size={14} />
            Build this
          </button>

          <button
            onClick={onEdit}
            className={cn(
              "flex items-center gap-2 rounded-[10px] px-4 py-2 text-sm",
              "border border-[var(--border)] text-[var(--muted)] bg-transparent",
              "transition-all duration-200",
              "hover:border-[var(--muted)] hover:text-[var(--frost)] active:scale-[0.97]"
            )}
            style={{ fontFamily: "var(--font-body)" }}
            type="button"
          >
            <Pencil size={14} />
            Edit prompt
          </button>
        </div>
      </div>
    </div>
  );
}
