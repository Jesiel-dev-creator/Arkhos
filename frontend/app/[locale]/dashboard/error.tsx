"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-6xl px-5 py-20">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[var(--error)]/10 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-[var(--error)]" />
        </div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          Failed to load dashboard
        </h2>
        <p className="text-sm text-[var(--text-muted)] max-w-md">
          {error.message || "Something went wrong. Please try again."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-medium text-white hover:brightness-110 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
        >
          <RotateCcw className="w-4 h-4" />
          Try again
        </button>
      </div>
    </div>
  );
}
