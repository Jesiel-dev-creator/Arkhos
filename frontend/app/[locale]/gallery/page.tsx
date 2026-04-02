import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const ITEM_KEYS = ["saas", "restaurant", "portfolio"] as const;

export default function GalleryPage() {
  const t = useTranslations("pages.gallery");

  return (
    <div className="mx-auto max-w-6xl px-4 py-20">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--brand)]">{t("kicker")}</p>
        <h1 className="mt-4 font-[var(--font-display)] text-5xl font-extrabold tracking-tight text-[var(--text-primary)]">{t("title")}</h1>
        <p className="mt-4 text-lg leading-relaxed text-[var(--text-secondary)]">{t("description")}</p>
      </div>

      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {ITEM_KEYS.map((item) => (
          <article key={item} className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--deep)]">
            <div className="h-48 bg-[linear-gradient(135deg,rgba(99,102,241,0.24),rgba(15,23,42,0.2))] border-b border-[var(--border)]" />
            <div className="p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand)]">{t(`items.${item}.tag`)}</p>
              <h2 className="mt-3 text-xl font-[var(--font-display)] text-[var(--text-primary)]">{t(`items.${item}.title`)}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{t(`items.${item}.description`)}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-6 text-center">
        <p className="text-sm text-[var(--text-secondary)]">{t("ctaBody")}</p>
        <Link href="/generate" className="mt-4 inline-flex items-center justify-center rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-medium text-white hover:brightness-110 transition-all duration-150">
          {t("ctaAction")}
        </Link>
      </div>
    </div>
  );
}
