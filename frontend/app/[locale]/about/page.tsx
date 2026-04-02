import { useTranslations } from "next-intl";

const PRINCIPLE_KEYS = ["sovereign", "transparent", "open"] as const;

export default function AboutPage() {
  const t = useTranslations("pages.about");

  return (
    <div className="mx-auto max-w-5xl px-4 py-20">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--brand)]">{t("kicker")}</p>
        <h1 className="mt-4 font-[var(--font-display)] text-5xl font-extrabold tracking-tight text-[var(--text-primary)]">{t("title")}</h1>
        <p className="mt-4 text-lg leading-relaxed text-[var(--text-secondary)]">{t("description")}</p>
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {PRINCIPLE_KEYS.map((item) => (
          <section key={item} className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-6">
            <p className="text-sm font-medium text-[var(--text-primary)]">{t(`principles.${item}.title`)}</p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">{t(`principles.${item}.body`)}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
