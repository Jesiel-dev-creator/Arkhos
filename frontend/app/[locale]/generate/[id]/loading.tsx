import { Loader2 } from "lucide-react";

export default function WorkspaceLoading() {
  return (
    <div className="flex h-screen items-center justify-center bg-[var(--void)]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-6 h-6 text-[var(--brand)] animate-spin" />
        <p className="text-sm text-[var(--text-muted)] font-[var(--font-body)]">
          Loading workspace…
        </p>
      </div>
    </div>
  );
}
