"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

const LOCALES = [
  { code: "en", flag: "🇬🇧", label: "EN" },
  { code: "fr", flag: "🇫🇷", label: "FR" },
] as const;

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(newLocale: "en" | "fr") {
    if (newLocale === locale) return;
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <div
      aria-label="Locale switcher"
      className="flex items-center gap-0.5 rounded-md border border-[var(--border)] p-0.5 bg-[var(--deep)]"
    >
      {LOCALES.map((option) => (
        <button
          key={option.code}
          type="button"
          onClick={() => switchLocale(option.code)}
          aria-pressed={locale === option.code}
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium
                       transition-colors duration-150 cursor-pointer focus-visible:ring-2
                       focus-visible:ring-[var(--brand)] focus-visible:outline-none
                       ${locale === option.code
                         ? "bg-[var(--brand)] text-white"
                         : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                       }`}
        >
          <span className="text-sm">{option.flag}</span>
          {option.label}
        </button>
      ))}
    </div>
  );
}
