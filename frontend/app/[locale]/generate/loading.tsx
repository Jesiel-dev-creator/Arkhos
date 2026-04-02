export default function GenerateLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[var(--brand)]/30 border-t-[var(--brand)] rounded-full animate-spin" />
        <p className="text-sm text-[var(--text-muted)]">Loading generator...</p>
      </div>
    </div>
  );
}
