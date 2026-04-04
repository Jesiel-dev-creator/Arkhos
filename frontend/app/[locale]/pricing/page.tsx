import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Check, X } from "lucide-react";
import { AnimatedSection, StaggerGrid, StaggerItem } from "@/components/shared/motion";

const FEATURE_KEYS = ["generations", "profiles", "models", "projects", "preview", "support"] as const;

export default function PricingPage() {
  const t = useTranslations("pricing");

  return (
    <div className="mx-auto max-w-6xl px-4 py-20">
      <AnimatedSection className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--brand)]">{t("kicker")}</p>
        <h1 className="mt-4 font-[var(--font-display)] text-5xl font-extrabold tracking-tight text-[var(--text-primary)]">{t("title")}</h1>
        <p className="mt-4 text-lg leading-relaxed text-[var(--text-secondary)]">{t("description")}</p>
      </AnimatedSection>

      <StaggerGrid className="mt-12 grid gap-4 lg:grid-cols-3">
        {/* Free */}
        <StaggerItem><div className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-6 flex flex-col">
          <p className="text-sm font-medium text-[var(--text-secondary)]">{t("free.name")}</p>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-4xl font-extrabold text-[var(--text-primary)]">{t("free.price")}</span>
            <span className="text-sm text-[var(--text-muted)]">{t("free.period")}</span>
          </div>
          <p className="mt-1 text-xs font-[var(--font-code)] text-[var(--text-muted)] tabular-nums">{t("free.costPerGen")}</p>
          <ul className="mt-6 flex-1 space-y-3 text-sm text-[var(--text-secondary)]">
            {FEATURE_KEYS.map((key) => (
              <li key={key} className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-[var(--success)]" />
                {t(`free.features.${key}`)}
              </li>
            ))}
          </ul>
          <Link
            href="/login"
            className="mt-8 inline-flex w-full items-center justify-center rounded-xl border border-[var(--border)] bg-transparent px-5 py-3 text-sm font-medium text-[var(--text-primary)] transition-all duration-150 hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
          >
            {t("free.cta")}
          </Link>
        </div></StaggerItem>

        {/* Pro — highlighted */}
        <StaggerItem><div className="relative rounded-2xl border border-[var(--brand)] bg-[var(--deep)] p-6 flex flex-col">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--brand)] px-3 py-0.5 text-xs font-medium text-white">
            {t("pro.badge")}
          </span>
          <p className="text-sm font-medium text-[var(--brand)]">{t("pro.name")}</p>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-4xl font-extrabold text-[var(--text-primary)]">{t("pro.price")}</span>
            <span className="text-sm text-[var(--text-muted)]">{t("pro.period")}</span>
          </div>
          <p className="mt-1 text-xs font-[var(--font-code)] text-[var(--brand)] tabular-nums">{t("pro.costPerGen")}</p>
          <ul className="mt-6 flex-1 space-y-3 text-sm text-[var(--text-secondary)]">
            {FEATURE_KEYS.map((key) => (
              <li key={key} className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-[var(--success)]" />
                {t(`pro.features.${key}`)}
              </li>
            ))}
          </ul>
          <Link
            href="/login"
            className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-medium text-white transition-all duration-150 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
          >
            {t("pro.cta")}
          </Link>
        </div></StaggerItem>

        {/* Team */}
        <StaggerItem><div className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-6 flex flex-col">
          <p className="text-sm font-medium text-[var(--text-secondary)]">{t("team.name")}</p>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-4xl font-extrabold text-[var(--text-primary)]">{t("team.price")}</span>
            <span className="text-sm text-[var(--text-muted)]">{t("team.period")}</span>
          </div>
          <p className="mt-1 text-xs font-[var(--font-code)] text-[var(--text-muted)] tabular-nums">{t("team.costPerGen")}</p>
          <ul className="mt-6 flex-1 space-y-3 text-sm text-[var(--text-secondary)]">
            {FEATURE_KEYS.map((key) => (
              <li key={key} className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-[var(--success)]" />
                {t(`team.features.${key}`)}
              </li>
            ))}
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-[var(--success)]" />
              {t("team.features.seats")}
            </li>
          </ul>
          <Link
            href="/contact"
            className="mt-8 inline-flex w-full items-center justify-center rounded-xl border border-[var(--border)] bg-transparent px-5 py-3 text-sm font-medium text-[var(--text-primary)] transition-all duration-150 hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
          >
            {t("team.cta")}
          </Link>
        </div></StaggerItem>
      </StaggerGrid>

      {/* Model note */}
      <p className="mt-6 text-center text-xs font-[var(--font-code)] text-[var(--text-muted)] max-w-3xl mx-auto leading-relaxed">
        {t("modelNote")}
      </p>

      {/* Bottom CTA */}
      <div className="mt-12 rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-lg font-medium text-[var(--text-primary)]">{t("cta.title")}</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{t("cta.description")}</p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-medium text-white transition-all duration-150 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
        >
          {t("cta.button")}
        </Link>
      </div>
    </div>
  );
}
