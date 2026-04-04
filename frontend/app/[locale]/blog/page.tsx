import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";

const POST_KEYS = ["shipping", "routing", "design"] as const;

const POST_DATES: Record<(typeof POST_KEYS)[number], string> = {
  shipping: "2026-03-28",
  routing: "2026-03-21",
  design: "2026-03-14",
};

export default function BlogPage() {
  const t = useTranslations("pages.blog");

  return (
    <div className="mx-auto max-w-6xl px-4 py-20">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--brand)]">{t("kicker")}</p>
        <h1 className="mt-4 font-[var(--font-display)] text-5xl font-extrabold tracking-tight text-[var(--text-primary)]">{t("title")}</h1>
        <p className="mt-4 text-lg leading-relaxed text-[var(--text-secondary)]">{t("description")}</p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {POST_KEYS.map((post) => (
          <Link
            key={post}
            href="#"
            className="group flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-6 transition-colors duration-150 hover:border-[var(--brand)]/30 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
          >
            <time
              dateTime={POST_DATES[post]}
              className="text-xs font-[var(--font-code)] text-[var(--text-muted)]"
            >
              {POST_DATES[post]}
            </time>
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-[var(--brand)]">{t(`posts.${post}.tag`)}</p>
            <h2 className="mt-3 text-xl font-[var(--font-body)] font-bold text-[var(--text-primary)]">{t(`posts.${post}.title`)}</h2>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">{t(`posts.${post}.excerpt`)}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--brand)] transition-colors group-hover:text-[var(--brand-light)]">
              {t("readMore")} <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
