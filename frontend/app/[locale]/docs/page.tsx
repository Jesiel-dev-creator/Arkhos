import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BookOpen, Layers, Server, ArrowRight } from "lucide-react";

const SECTION_KEYS = ["start", "pipeline", "deployment"] as const;

const SECTION_ICONS: Record<(typeof SECTION_KEYS)[number], typeof BookOpen> = {
  start: BookOpen,
  pipeline: Layers,
  deployment: Server,
};

export default function DocsPage() {
  const t = useTranslations("pages.docs");

  return (
    <div className="mx-auto max-w-6xl px-4 py-20">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--brand)]">{t("kicker")}</p>
        <h1 className="mt-4 font-[var(--font-display)] text-5xl font-extrabold tracking-tight text-[var(--text-primary)]">{t("title")}</h1>
        <p className="mt-4 text-lg leading-relaxed text-[var(--text-secondary)]">{t("description")}</p>
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {SECTION_KEYS.map((section) => {
          const Icon = SECTION_ICONS[section];
          return (
            <Link
              key={section}
              href="#"
              className="group flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-6 transition-colors duration-150 hover:border-[var(--brand)]/30 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
            >
              <Icon className="h-5 w-5 text-[var(--brand)]" />
              <p className="mt-4 text-sm font-medium text-[var(--text-primary)]">{t(`sections.${section}.title`)}</p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">{t(`sections.${section}.body`)}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--brand)] transition-colors group-hover:text-[var(--brand-light)]">
                {t("learnMore")} <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
