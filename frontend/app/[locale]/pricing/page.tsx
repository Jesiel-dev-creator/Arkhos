import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const PLAN_KEYS = ["starter", "pro", "team"] as const;
const PLAN_FEATURE_KEYS = ["feature1", "feature2", "feature3"] as const;

export default function PricingPage() {
  const t = useTranslations("pages.pricing");

  return (
    <div className="mx-auto max-w-6xl px-4 py-20">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--brand)]">{t("kicker")}</p>
        <h1 className="mt-4 font-[var(--font-display)] text-5xl font-extrabold tracking-tight text-[var(--text-primary)]">{t("title")}</h1>
        <p className="mt-4 text-lg leading-relaxed text-[var(--text-secondary)]">{t("description")}</p>
      </div>

      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        {PLAN_KEYS.map((plan) => (
          <div key={plan} className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-6">
            <p className="text-sm font-medium text-[var(--brand)]">{t(`plans.${plan}.label`)}</p>
            <h2 className="mt-3 text-2xl font-[var(--font-display)] text-[var(--text-primary)]">{t(`plans.${plan}.price`)}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{t(`plans.${plan}.description`)}</p>
            <ul className="mt-6 space-y-2 text-sm text-[var(--text-secondary)]">
              {PLAN_FEATURE_KEYS.map((feature) => (
                <li key={feature}>• {t(`plans.${plan}.${feature}`)}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-lg font-medium text-[var(--text-primary)]">{t("ctaTitle")}</p>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{t("ctaBody")}</p>
        </div>
        <Link href="/generate" className="inline-flex items-center justify-center rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-medium text-white hover:brightness-110 transition-all duration-150">
          {t("ctaAction")}
        </Link>
      </div>
    </div>
  );
}
