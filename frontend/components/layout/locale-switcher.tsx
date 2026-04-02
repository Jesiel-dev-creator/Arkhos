"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";

const LOCALES = [
  { code: "en", flag: "\uD83C\uDDEC\uD83C\uDDE7", label: "EN" },
  { code: "fr", flag: "\uD83C\uDDEB\uD83C\uDDF7", label: "FR" },
] as const;

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(newLocale: string) {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  }

  return (
    <div className="flex items-center gap-0.5 rounded-md border border-[var(--border)] p-0.5 bg-[var(--deep)]">
      {LOCALES.map((l) => (
        <button
          key={l.code}
          onClick={() => switchLocale(l.code)}
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium
                       transition-colors duration-150 cursor-pointer
                       ${locale === l.code
                         ? "bg-[var(--brand)] text-white"
                         : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                       }`}
        >
          <span className="text-sm">{l.flag}</span>
          {l.label}
        </button>
      ))}
    </div>
  );
}
