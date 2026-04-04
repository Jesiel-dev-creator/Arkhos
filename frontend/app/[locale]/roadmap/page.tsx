import { useTranslations } from "next-intl";

const PHASES = [
  { key: "now", count: 4 },
  { key: "next", count: 4 },
  { key: "later", count: 4 },
] as const;

export default function RoadmapPage() {
  const t = useTranslations("pages.roadmap");
  return (
    <div className="mx-auto max-w-6xl px-4 py-20">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--brand)]">{t("kicker")}</p>
        <h1 className="mt-4 font-[var(--font-display)] text-5xl font-extrabold tracking-tight text-[var(--text-primary)]">{t("title")}</h1>
        <p className="mt-4 text-lg leading-relaxed text-[var(--text-secondary)]">{t("description")}</p>
      </div>
      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {PHASES.map((phase) => (
          <div key={phase.key} className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand)]">{t(`phases.${phase.key}.label`)}</p>
            <p className="mt-2 text-lg font-[var(--font-body)] font-bold text-[var(--text-primary)]">{t(`phases.${phase.key}.title`)}</p>
            <ul className="mt-3 space-y-1.5">
              {Array.from({ length: phase.count }, (_, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <span className="w-1 h-1 rounded-full bg-[var(--brand)] shrink-0" />
                  {t(`items.${phase.key}.${i}`)}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
