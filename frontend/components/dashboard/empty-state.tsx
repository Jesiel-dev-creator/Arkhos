"use client";

import { Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const templates = [
  { key: "saas", label: "SaaS Landing" },
  { key: "portfolio", label: "Portfolio" },
  { key: "bakery", label: "Bakery" },
];

export function EmptyState() {
  const t = useTranslations("dashboard");

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-12 h-12 rounded-full bg-[var(--brand)]/10 flex items-center justify-center mb-5">
        <Sparkles className="w-5 h-5 text-[var(--brand)]" />
      </div>

      <h2 className="text-xl font-semibold text-[var(--text-primary)] font-[var(--font-display)]">
        {t("empty.title")}
      </h2>

      <p className="mt-2 max-w-md text-sm text-[var(--text-secondary)] font-[var(--font-body)]">
        {t("empty.description")}
      </p>

      <Link
        href="/dashboard/new"
        className="mt-6 inline-flex items-center rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-medium text-white hover:brightness-110 transition-all focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
      >
        {t("empty.cta")}
      </Link>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {templates.map((tmpl) => (
          <Link
            key={tmpl.key}
            href={`/dashboard/new?template=${tmpl.key}`}
            className="rounded-xl border border-[var(--border)] bg-[var(--deep)] px-4 py-2 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--elevated)] hover:text-[var(--text-primary)] transition-colors font-[var(--font-body)] focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
          >
            {tmpl.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
