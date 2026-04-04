export default function GalleryLoading() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-20">
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-32 rounded bg-[var(--surface)]" />
        <div className="h-10 w-64 rounded bg-[var(--surface)]" />
        <div className="h-5 w-96 rounded bg-[var(--surface)]" />
      </div>
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-5">
            <div className="aspect-video rounded-xl bg-[var(--surface)] mb-4" />
            <div className="h-4 w-3/4 rounded bg-[var(--surface)] mb-2" />
            <div className="h-3 w-1/2 rounded bg-[var(--surface)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
