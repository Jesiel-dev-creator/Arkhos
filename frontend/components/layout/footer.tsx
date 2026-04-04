import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Globe } from "lucide-react";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
    </svg>
  );
}

const PRODUCT_LINKS = [
  { key: "generate", href: "/login" },
  { key: "gallery", href: "/gallery" },
  { key: "pricing", href: "/pricing" },
  { key: "docs", href: "/docs" },
] as const;

const COMPANY_LINKS = [
  { key: "about", href: "/about" },
  { key: "blog", href: "/blog" },
] as const;

const LEGAL_LINKS = [
  { key: "privacy", href: "/legal/privacy" },
  { key: "terms", href: "/legal/terms" },
  { key: "sales", href: "/legal/sales" },
  { key: "cookies", href: "/legal/cookies" },
  { key: "imprint", href: "/legal/imprint" },
] as const;

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--deep)]">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <span className="font-[var(--font-display)] text-base font-bold text-[var(--text-primary)]">
              Arkhos
            </span>
            <p className="mt-2 text-sm text-[var(--text-muted)] max-w-xs leading-relaxed">
              {t("hero.subtitle")}
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a
                href="https://github.com/bleucommerce/arkhos"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none rounded-md"
              >
                <GitHubIcon className="w-4 h-4" />
              </a>
              <a
                href="https://x.com/arkhosai"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none rounded-md"
              >
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">
              {t("footer.product")}
            </h4>
            <ul className="space-y-2">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none rounded-md"
                  >
                    {t(`nav.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">
              {t("footer.companySection")}
            </h4>
            <ul className="space-y-2">
              {COMPANY_LINKS.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none rounded-md"
                  >
                    {t(`nav.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">
              {t("footer.legal")}
            </h4>
            <ul className="space-y-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none rounded-md"
                  >
                    {t(`footer.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="h-px bg-[var(--border)] my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-[var(--text-muted)]">
            &copy; {new Date().getFullYear()} {t("footer.company")} &middot; {t("footer.location")} &middot; {t("footer.rights")}
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            Powered by{" "}
            <a
              href="https://pypi.org/project/tramontane/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--brand)] hover:brightness-125 transition-all duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none rounded-md"
            >
              Tramontane
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
