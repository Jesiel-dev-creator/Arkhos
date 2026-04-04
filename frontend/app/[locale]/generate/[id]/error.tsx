"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-screen items-center justify-center bg-[var(--void)]">
      <div className="flex flex-col items-center gap-4 max-w-md text-center px-6">
        <div className="w-12 h-12 rounded-2xl bg-[var(--error)]/10 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-[var(--error)]" />
        </div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] font-[var(--font-body)]">
          Something went wrong
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          {error.message || "An unexpected error occurred while loading the workspace."}
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
