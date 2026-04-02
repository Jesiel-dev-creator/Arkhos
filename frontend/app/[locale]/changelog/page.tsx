import { useTranslations } from "next-intl";

const ENTRIES = [
  { version: "v0.3", date: "2026-04-02", items: ["Next.js 16.2 frontend rebuild", "Electric Indigo design system", "WebContainer live preview", "Iteration chat", "Cost estimator"] },
  { version: "v0.2", date: "2026-03-15", items: ["Tramontane v0.2.3 integration", "Fleet profiles (Budget/Balanced/Quality)", "Parallel Designer + Architect", "Smart skill injection"] },
  { version: "v0.1", date: "2026-02-28", items: ["Initial release", "5-agent pipeline", "SSE streaming", "Basic HTML generation"] },
] as const;

export default function ChangelogPage() {
  const t = useTranslations("pages.changelog");
  return (
    <div className="mx-auto max-w-6xl px-4 py-20">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--brand)]">{t("kicker")}</p>
        <h1 className="mt-4 font-[var(--font-display)] text-5xl font-extrabold tracking-tight text-[var(--text-primary)]">{t("title")}</h1>
        <p className="mt-4 text-lg leading-relaxed text-[var(--text-secondary)]">{t("description")}</p>
      </div>
      <div className="mt-12 space-y-8">
        {ENTRIES.map((entry) => (
          <div key={entry.version} className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-5">
            <div className="flex items-baseline gap-3">
              <span className="text-lg font-[var(--font-display)] font-bold text-[var(--text-primary)]">{entry.version}</span>
              <span className="text-xs font-[var(--font-code)] text-[var(--text-muted)]">{entry.date}</span>
            </div>
            <ul className="mt-3 space-y-1.5">
              {entry.items.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <span className="w-1 h-1 rounded-full bg-[var(--brand)] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
