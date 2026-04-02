"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("generate.status");

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-center max-w-md">
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--error)]/10">
          <AlertTriangle className="w-5 h-5 text-[var(--error)]" />
        </div>
        <h2 className="text-lg font-[var(--font-display)] font-bold text-[var(--text-primary)]">
          {t("error")}
        </h2>
        <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
          Something went wrong loading this page.
        </p>
        <button
          type="button"
          onClick={reset}
          className="px-5 py-3 rounded-xl text-sm font-medium bg-[var(--brand)] text-white hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none transition-all duration-150 cursor-pointer"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
