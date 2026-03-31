import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorBannerProps {
  error: string;
  errorType: string | null;
  onRetry: () => void;
  onDismiss: () => void;
}

export default function ErrorBanner({
  error,
  errorType,
  onRetry,
  onDismiss,
}: ErrorBannerProps) {
  const isRateLimit = errorType === "rate_limit";

  return (
    <div
      className="flex flex-col gap-3 rounded-[12px] p-4"
      style={{
        background: "rgba(13, 27, 42, 0.7)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderLeft: "3px solid var(--error)",
        border: "1px solid var(--border)",
        borderLeftColor: "var(--error)",
        borderLeftWidth: "3px",
      }}
    >
      {/* Icon + title row */}
      <div className="flex items-center gap-2">
        <AlertTriangle
          size={15}
          className="shrink-0"
          style={{ color: "var(--error)" }}
        />
        <span
          className="text-sm font-medium text-[var(--frost)]"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Generation failed
        </span>
      </div>

      {/* Error message */}
      <p
        className="text-sm leading-relaxed text-[var(--muted)] pl-[23px]"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {error}
      </p>

      {/* Action buttons */}
      <div className="flex gap-2 pl-[23px]">
        {isRateLimit ? (
          <span
            className="text-xs text-[var(--muted)] italic"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Resets tomorrow
          </span>
        ) : (
          <button
            onClick={onRetry}
            className={cn(
              "flex items-center gap-1.5 rounded-[10px] px-3 py-1.5 text-xs font-medium text-white",
              "transition-all duration-200",
              "hover:brightness-110 active:scale-[0.97]"
            )}
            style={{
              fontFamily: "var(--font-body)",
              background: "var(--ember)",
              boxShadow: "0 0 16px rgba(255, 107, 53, 0.25)",
            }}
            type="button"
          >
            Try Again
          </button>
        )}

        <button
          onClick={onDismiss}
          className={cn(
            "rounded-[10px] px-3 py-1.5 text-xs",
            "border border-[var(--border)] text-[var(--muted)] bg-transparent",
            "transition-all duration-200",
            "hover:border-[var(--muted)] hover:text-[var(--frost)] active:scale-[0.97]"
          )}
          style={{ fontFamily: "var(--font-body)" }}
          type="button"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
