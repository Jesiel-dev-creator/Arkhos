"use client";

import { useTranslations } from "next-intl";
import {
  AnimatedHero,
  AnimatedSection,
} from "@/components/shared/motion";

const ENTRIES = [
  { version: "v0.3", date: "2026-04-02", key: "v030", count: 5, type: "major" },
  { version: "v0.2", date: "2026-03-15", key: "v020", count: 4, type: "minor" },
  { version: "v0.1", date: "2026-02-28", key: "v010", count: 4, type: "major" },
] as const;

const TYPE_STYLES: Record<string, string> = {
  major: "bg-[var(--brand)]/10 text-[var(--brand)]",
  minor: "bg-[var(--surface)] text-[var(--text-secondary)]",
  patch: "bg-[var(--elevated)] text-[var(--text-muted)]",
};

export default function ChangelogPage() {
  const t = useTranslations("pages.changelog");

  return (
    <div className="mx-auto max-w-6xl px-4 py-20">
      {/* Hero */}
      <AnimatedHero className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--brand)]">
          {t("kicker")}
        </p>
        <h1 className="mt-4 font-[var(--font-display)] text-5xl font-extrabold tracking-tight text-[var(--text-primary)]">
          {t("title")}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-[var(--text-secondary)]">
          {t("description")}
        </p>
      </AnimatedHero>

      {/* Timeline */}
      <div className="relative mt-12">
        {/* Vertical timeline bar */}
        <div className="absolute top-0 left-4 bottom-0 w-px bg-[var(--border)] md:left-6" />

        <div className="space-y-8">
          {ENTRIES.map((entry, idx) => (
            <AnimatedSection key={entry.version} delay={idx * 0.1}>
              <div className="relative pl-10 md:pl-14">
                {/* Timeline dot */}
                <div className="absolute top-2 left-2.5 h-3 w-3 rounded-full border-2 border-[var(--brand)] bg-[var(--void)] md:left-4.5" />

                <div className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-lg font-bold text-[var(--text-primary)]">
                      {entry.version}
                    </span>
                    <span className="font-[var(--font-code)] text-xs text-[var(--text-muted)]">
                      {entry.date}
                    </span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-medium ${TYPE_STYLES[entry.type]}`}
                    >
                      {t(`types.${entry.type}`)}
                    </span>
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {Array.from({ length: entry.count }, (_, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"
                      >
                        <span className="h-1 w-1 shrink-0 rounded-full bg-[var(--brand)]" />
                        {t(`entries.${entry.key}.items.${i}`)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </div>
  );
}
