import { useTranslations } from "next-intl";

const POST_KEYS = ["shipping", "routing", "design"] as const;

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
          <article key={post} className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand)]">{t(`posts.${post}.tag`)}</p>
            <h2 className="mt-3 text-xl font-[var(--font-display)] text-[var(--text-primary)]">{t(`posts.${post}.title`)}</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">{t(`posts.${post}.excerpt`)}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
