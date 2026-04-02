"use client";

import { AlertTriangle } from "lucide-react";
import { Link } from "@/i18n/navigation";

export default function GenerateError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-center max-w-md">
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--error)]/10">
          <AlertTriangle className="w-5 h-5 text-[var(--error)]" />
        </div>
        <h2 className="text-lg font-[var(--font-display)] font-bold text-[var(--text-primary)]">
          Generation error
        </h2>
        <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
          The generation workspace encountered an error.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={reset}
            className="px-5 py-3 rounded-xl text-sm font-medium bg-[var(--brand)] text-white hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none transition-all duration-150 cursor-pointer"
          >
            Try again
          </button>
          <Link
            href="/generate"
            className="px-5 py-3 rounded-xl text-sm font-medium border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface)] focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none transition-all duration-150"
          >
            New generation
          </Link>
        </div>
      </div>
    </div>
  );
}
