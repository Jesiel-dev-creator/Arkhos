"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Shield, Eye, Code2, ArrowRight } from "lucide-react";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
    </svg>
  );
}
import {
  AnimatedHero,
  AnimatedSection,
  StaggerGrid,
  StaggerItem,
} from "@/components/shared/motion";

const PRINCIPLE_KEYS = ["sovereign", "transparent", "open"] as const;

const PRINCIPLE_ICONS: Record<(typeof PRINCIPLE_KEYS)[number], typeof Shield> = {
  sovereign: Shield,
  transparent: Eye,
  open: Code2,
};

const STAT_KEYS = ["telemetry", "memory", "cost", "speed"] as const;

export default function AboutPage() {
  const t = useTranslations("pages.about");

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

      {/* Mission statement */}
      <AnimatedSection className="mt-12">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand)]">
            {t("missionKicker")}
          </p>
          <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)]">
            {t("mission")}
          </p>
        </div>
      </AnimatedSection>

      {/* Principles grid */}
      <StaggerGrid className="mt-12 grid gap-4 md:grid-cols-3">
        {PRINCIPLE_KEYS.map((item) => {
          const Icon = PRINCIPLE_ICONS[item];
          return (
            <StaggerItem key={item}>
              <section className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-6">
                <Icon className="h-5 w-5 text-[var(--brand)]" />
                <p className="mt-4 text-sm font-medium text-[var(--text-primary)]">
                  {t(`principles.${item}.title`)}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {t(`principles.${item}.body`)}
                </p>
              </section>
            </StaggerItem>
          );
        })}
      </StaggerGrid>

      {/* Stats strip */}
      <AnimatedSection className="mt-12">
        <StaggerGrid className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {STAT_KEYS.map((stat) => (
            <StaggerItem key={stat}>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-5 text-center">
                <p className="font-[var(--font-display)] text-2xl font-bold text-[var(--text-primary)]">
                  {t(`stats.${stat}`)}
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {t(`stats.${stat}Label`)}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </AnimatedSection>

      {/* Team section */}
      <AnimatedSection className="mt-12">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-6">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {t("team.title")}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
            {t("team.body")}
          </p>
        </div>
      </AnimatedSection>

      {/* Open source CTA */}
      <AnimatedSection className="mt-12">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-6">
          <div className="flex items-start gap-4">
            <GitHubIcon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand)]" />
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {t("opensource.title")}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                {t("opensource.body")}
              </p>
              <Link
                href="https://github.com/ArkhosAI/arkhos"
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-medium text-white transition-all hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
              >
                {t("opensource.cta")}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
