"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  BookOpen,
  Layers,
  Gauge,
  Monitor,
  Code2,
  Server,
  ArrowRight,
} from "lucide-react";
import {
  AnimatedHero,
  AnimatedSection,
  StaggerGrid,
  StaggerItem,
} from "@/components/shared/motion";

const STEP_KEYS = ["step1", "step2", "step3"] as const;

const SECTION_KEYS = [
  "start",
  "pipeline",
  "profiles",
  "sandbox",
  "api",
  "deployment",
] as const;

const SECTION_ICONS: Record<(typeof SECTION_KEYS)[number], typeof BookOpen> = {
  start: BookOpen,
  pipeline: Layers,
  profiles: Gauge,
  sandbox: Monitor,
  api: Code2,
  deployment: Server,
};

const SECTION_HREFS: Record<(typeof SECTION_KEYS)[number], string> = {
  start: "/docs/getting-started",
  pipeline: "/docs/pipeline",
  profiles: "/docs/fleet-profiles",
  sandbox: "/docs/sandbox",
  api: "/docs/api-reference",
  deployment: "/docs/deployment",
};

export default function DocsPage() {
  const t = useTranslations("pages.docs");

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

      {/* Quick start */}
      <AnimatedSection className="mt-12">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand)]">
          {t("quickstart.title")}
        </p>
        <StaggerGrid className="mt-6 grid gap-4 md:grid-cols-3">
          {STEP_KEYS.map((step, i) => (
            <StaggerItem key={step}>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-5">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[var(--brand)] text-xs font-bold text-white">
                  {i + 1}
                </span>
                <p className="mt-3 text-sm font-medium text-[var(--text-primary)]">
                  {t(`quickstart.${step}`)}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </AnimatedSection>

      {/* Documentation sections */}
      <StaggerGrid className="mt-12 grid gap-4 md:grid-cols-2">
        {SECTION_KEYS.map((section) => {
          const Icon = SECTION_ICONS[section];
          return (
            <StaggerItem key={section}>
              <Link
                href={SECTION_HREFS[section]}
                className="group flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-6 transition-colors duration-150 hover:border-[var(--brand)]/30 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
              >
                <Icon className="h-5 w-5 text-[var(--brand)]" />
                <p className="mt-4 text-sm font-medium text-[var(--text-primary)]">
                  {t(`sections.${section}.title`)}
                </p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {t(`sections.${section}.body`)}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--brand)] transition-colors group-hover:text-[var(--brand-light)]">
                  {t("learnMore")} <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </StaggerItem>
          );
        })}
      </StaggerGrid>

      {/* API reference preview */}
      <AnimatedSection className="mt-12">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand)]">
            {t("apiPreview.title")}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
            {t("apiPreview.body")}
          </p>
          <div className="mt-4 rounded-xl bg-[var(--void)] p-4">
            <pre className="overflow-x-auto font-[var(--font-code)] text-xs leading-relaxed text-[var(--text-secondary)]">
              <code>{`POST /api/generate
Content-Type: application/json

{
  "prompt": "A SaaS landing page for a project management tool",
  "locale": "en",
  "profile": "balanced"
}

→ { "generation_id": "gen_abc123" }
→ GET /api/stream/gen_abc123  (SSE)`}</code>
            </pre>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
