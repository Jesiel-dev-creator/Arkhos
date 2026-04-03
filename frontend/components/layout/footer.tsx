import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Code2, Globe } from "lucide-react";

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
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-150"
              >
                <Code2 className="w-4 h-4" />
              </a>
              <a
                href="https://x.com/arkhosai"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Arkhos website"
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-150"
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
                    className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-150"
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
                    className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-150"
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
                    className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-150"
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
            Powered by {" "}
            <a
              href="https://pypi.org/project/tramontane/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--brand)] hover:brightness-125 transition-all duration-150"
            >
              Tramontane
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
