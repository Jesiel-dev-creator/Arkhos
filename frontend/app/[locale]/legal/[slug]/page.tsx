import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

const LEGAL_SLUGS = ["privacy", "terms", "cookies", "imprint"] as const;

type LegalSlug = (typeof LEGAL_SLUGS)[number];

export function generateStaticParams() {
  return LEGAL_SLUGS.map((slug) => ({ slug }));
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!LEGAL_SLUGS.includes(slug as LegalSlug)) {
    notFound();
  }

  const t = await getTranslations("legal");
  const legalSlug = slug as LegalSlug;

  return (
    <div className="mx-auto max-w-4xl px-4 py-20">
      <p className="text-xs uppercase tracking-[0.22em] text-[var(--brand)]">{t(`${legalSlug}.kicker`)}</p>
      <h1 className="mt-4 font-[var(--font-display)] text-5xl font-extrabold tracking-tight text-[var(--text-primary)]">
        {t(`${legalSlug}.title`)}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-[var(--text-secondary)]">
        {t(`${legalSlug}.description`)}
      </p>

      <div className="mt-10 space-y-4">
        {[1, 2, 3].map((index) => (
          <section key={index} className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-6">
            <h2 className="text-lg font-medium text-[var(--text-primary)]">{t(`${legalSlug}.section${index}Title`)}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{t(`${legalSlug}.section${index}Body`)}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
