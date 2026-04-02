import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Home() {
  const t = useTranslations();

  return (
    <div className="relative overflow-hidden min-h-[calc(100vh-5rem)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.18),transparent_42%)]" />
      <div className="absolute inset-x-0 top-24 h-72 bg-[linear-gradient(180deg,rgba(99,102,241,0.14),transparent)] blur-3xl" />

      <section className="relative mx-auto max-w-6xl px-4 py-24 sm:py-32">
        <div className="max-w-3xl">
          <p className="inline-flex items-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-[var(--brand)] backdrop-blur-xl">
            {t("hero.badge")}
          </p>
          <h1 className="mt-6 font-[var(--font-display)] text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[0.95] text-[var(--text-primary)]">
            {t("hero.title")}
          </h1>
          <p className="mt-6 max-w-2xl text-lg sm:text-xl leading-relaxed text-[var(--text-secondary)]">
            {t("hero.subtitle")}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Link
              href="/generate"
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-medium bg-[var(--brand)] text-white hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none transition-all duration-150"
            >
              {t("hero.cta")}
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-medium border border-[var(--border)] bg-[var(--glass-bg)] text-[var(--text-primary)] hover:bg-[var(--surface)] focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none transition-all duration-150"
            >
              {t("nav.docs")}
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--deep)]/80 p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Pipeline</p>
            <p className="mt-3 text-2xl font-[var(--font-display)] text-[var(--text-primary)]">Planner → Builder</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">Multi-agent orchestration with live streaming, review loops, and production-minded output.</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--deep)]/80 p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Sovereignty</p>
            <p className="mt-3 text-2xl font-[var(--font-display)] text-[var(--text-primary)]">EU-hosted by design</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">Built around Mistral, Scaleway, and a transparent cost model teams can actually reason about.</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--deep)]/80 p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Output</p>
            <p className="mt-3 text-2xl font-[var(--font-display)] text-[var(--text-primary)]">Fast, editable code</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">Generate responsive frontend code, inspect the file stream, and keep a clean path to iteration.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
