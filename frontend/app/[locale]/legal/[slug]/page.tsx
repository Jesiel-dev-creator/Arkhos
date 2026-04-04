import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const LEGAL_SLUGS = ["privacy", "terms", "cookies", "imprint", "sales"] as const;

type LegalSlug = (typeof LEGAL_SLUGS)[number];

const SECTION_COUNTS: Record<LegalSlug, number> = {
  privacy: 12,
  terms: 10,
  cookies: 6,
  imprint: 5,
  sales: 9,
};

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
  const sectionCount = SECTION_COUNTS[legalSlug];

  return (
    <div className="mx-auto max-w-4xl px-4 py-20">
      <p className="text-xs uppercase tracking-[0.22em] text-[var(--brand)]">{t(`${legalSlug}.kicker`)}</p>
      <h1 className="mt-4 font-[var(--font-display)] text-5xl font-extrabold tracking-tight text-[var(--text-primary)]">
        {t(`${legalSlug}.title`)}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-[var(--text-secondary)]">
        {t(`${legalSlug}.description`)}
      </p>
      <p className="mt-2 text-xs text-[var(--text-muted)]">
        {t(`${legalSlug}.lastUpdated`)}
      </p>

      {/* Table of contents */}
      <nav className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-5" aria-label="Table of contents">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-3">{t("toc")}</p>
        <ol className="space-y-1.5">
          {Array.from({ length: sectionCount }, (_, i) => i + 1).map((index) => (
            <li key={index}>
              <a
                href={`#section-${index}`}
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--brand)] transition-colors"
              >
                {index}. {t(`${legalSlug}.s${index}.title`)}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* Sections */}
      <div className="mt-10 space-y-6">
        {Array.from({ length: sectionCount }, (_, i) => i + 1).map((index) => (
          <section
            key={index}
            id={`section-${index}`}
            className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-6 scroll-mt-24"
          >
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              {index}. {t(`${legalSlug}.s${index}.title`)}
            </h2>
            <div className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)] whitespace-pre-line">
              {t(`${legalSlug}.s${index}.body`)}
            </div>
          </section>
        ))}
      </div>

      {/* Contact + other legal links */}
      <div className="mt-12 rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-6">
        <p className="text-sm text-[var(--text-secondary)]">{t("contact")}</p>
        <p className="mt-1 text-sm text-[var(--brand)]">privacy@arkhos.ai</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {LEGAL_SLUGS.filter((s) => s !== legalSlug).map((s) => (
          <Link
            key={s}
            href={`/legal/${s}`}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors underline underline-offset-2"
          >
            {t(`${s}.title`)}
          </Link>
        ))}
      </div>
    </div>
  );
}
