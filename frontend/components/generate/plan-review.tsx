"use client";

import { Check, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";

interface PlanReviewProps {
  plan: string;
  onApprove: () => void;
  onRegenerate?: () => void;
}

export function PlanReview({ plan, onApprove, onRegenerate }: PlanReviewProps) {
  const t = useTranslations("generate");

  const lines = plan.split("\n");

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
        {t("sections.plan")}
      </h3>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--void)] p-4 max-h-64 overflow-y-auto">
        <div className="space-y-1.5 text-xs font-[var(--font-code)] leading-relaxed text-[var(--text-secondary)]">
          {lines.map((line, i) => {
            if (!line.trim()) return <div key={i} className="h-2" />;
            if (line.startsWith("#") || line.startsWith("**")) {
              return (
                <p key={i} className="font-medium text-[var(--text-primary)] mt-2 first:mt-0">
                  {line.replace(/^#+\s*/, "").replace(/\*\*/g, "")}
                </p>
              );
            }
            if (line.startsWith("-") || line.startsWith("•")) {
              return (
                <p key={i} className="pl-3 flex gap-1.5">
                  <span className="text-[var(--brand)] shrink-0">·</span>
                  <span>{line.replace(/^[-•]\s*/, "")}</span>
                </p>
              );
            }
            return <p key={i}>{line}</p>;
          })}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onApprove}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-[var(--brand)] text-white hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none transition-all duration-150 cursor-pointer"
        >
          <Check className="w-3.5 h-3.5" />
          {t("actions.approve")}
        </button>
        {onRegenerate && (
          <button
            type="button"
            onClick={onRegenerate}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface)] focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none transition-all duration-150 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
