import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Home() {
  const t = useTranslations();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <p className="text-sm font-medium text-[var(--brand)] mb-4 tracking-wide uppercase">
          AI Website Generator
        </p>
        <h1 className="font-[var(--font-display)] text-4xl sm:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight leading-tight">
          {t("hero.title")}
        </h1>
        <p className="mt-4 text-lg text-[var(--text-secondary)] leading-relaxed">
          {t("hero.subtitle")}
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/generate"
            className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-medium
                       bg-[var(--brand)] text-white
                       hover:brightness-110 transition-all duration-150"
          >
            {t("hero.cta")}
          </Link>
          <a
            href="https://github.com/bleucommerce/arkhos"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-medium
                       bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)]
                       hover:text-[var(--text-primary)] hover:bg-[var(--elevated)]
                       transition-all duration-150"
          >
            GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
