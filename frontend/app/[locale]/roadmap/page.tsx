"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Check, CircleDot, CircleDashed, ArrowRight } from "lucide-react";
import {
  AnimatedHero,
  AnimatedSection,
  StaggerGrid,
  StaggerItem,
} from "@/components/shared/motion";

const PHASES = [
  { key: "now", count: 6, status: "inProgress", StatusIcon: CircleDot },
  { key: "next", count: 5, status: "planned", StatusIcon: CircleDashed },
  { key: "later", count: 6, status: "exploring", StatusIcon: CircleDashed },
] as const;

const STATUS_STYLES: Record<string, string> = {
  inProgress: "bg-emerald-500/10 text-emerald-400",
  planned: "bg-[var(--brand)]/10 text-[var(--brand)]",
  exploring: "bg-[var(--elevated)] text-[var(--text-muted)]",
};

const ITEM_ICONS: Record<string, typeof Check> = {
  inProgress: CircleDot,
  planned: CircleDashed,
  exploring: CircleDashed,
};

export default function RoadmapPage() {
  const t = useTranslations("pages.roadmap");

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

      {/* Phase columns */}
      <StaggerGrid className="mt-12 grid gap-5 lg:grid-cols-3">
        {PHASES.map((phase) => {
          const ItemIcon = ITEM_ICONS[phase.status];
          return (
            <StaggerItem key={phase.key}>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand)]">
                    {t(`phases.${phase.key}.label`)}
                  </p>
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[phase.status]}`}
                  >
                    {t(`phases.${phase.key}.status`)}
                  </span>
                </div>
                <p className="mt-2 text-lg font-bold text-[var(--text-primary)]">
                  {t(`phases.${phase.key}.title`)}
                </p>
                <ul className="mt-3 space-y-2">
                  {Array.from({ length: phase.count }, (_, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)]"
                    >
                      <ItemIcon className="h-3.5 w-3.5 shrink-0 text-[var(--brand)]" />
                      {t(`items.${phase.key}.${i}`)}
                    </li>
                  ))}
                </ul>
              </div>
            </StaggerItem>
          );
        })}
      </StaggerGrid>

      {/* Feature request CTA */}
      <AnimatedSection className="mt-12">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-6 text-center">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {t("featureRequest.title")}
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-medium text-white transition-all hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
          >
            {t("featureRequest.cta")}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </AnimatedSection>
    </div>
  );
}
