"use client";

import { AlertTriangle, Clock, Ban, CreditCard, ServerCrash, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";

interface ErrorPanelProps {
  error: string;
  errorType: string | null;
  onRetry?: () => void;
}

const ERROR_CONFIG: Record<string, { icon: typeof AlertTriangle; colorClass: string }> = {
  rate_limit: { icon: Ban, colorClass: "text-[var(--warning)]" },
  timeout: { icon: Clock, colorClass: "text-[var(--warning)]" },
  budget: { icon: CreditCard, colorClass: "text-[var(--warning)]" },
  api_error: { icon: ServerCrash, colorClass: "text-[var(--error)]" },
  unknown: { icon: AlertTriangle, colorClass: "text-[var(--error)]" },
};

export function ErrorPanel({ error, errorType, onRetry }: ErrorPanelProps) {
  const t = useTranslations("generate.errors");
  const type = errorType ?? "unknown";
  const config = ERROR_CONFIG[type] ?? ERROR_CONFIG.unknown;
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center gap-4 px-6 py-8 text-center">
      <div className={`flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--surface)] ${config.colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm font-medium text-[var(--text-primary)]">
          {t(`${type}.title`)}
        </p>
        <p className="mt-1 text-xs text-[var(--text-muted)] max-w-xs">
          {t(`${type}.description`)}
        </p>
        {error && (
          <p className="mt-2 text-[10px] font-[var(--font-code)] text-[var(--text-muted)]/60 max-w-xs break-all">
            {error}
          </p>
        )}
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[var(--brand)] text-white hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none transition-all duration-150 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {t("retry")}
        </button>
      )}
    </div>
  );
}
