"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Menu, X, Cpu } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { LocaleSwitcher } from "./locale-switcher";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { key: "pricing", href: "/pricing" },
  { key: "gallery", href: "/gallery" },
  { key: "docs", href: "/docs" },
  { key: "about", href: "/about" },
] as const;

export function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <div
        className="mx-auto max-w-6xl flex items-center justify-between
                    px-5 py-2.5 rounded-xl
                    bg-[var(--glass-bg)] backdrop-blur-xl
                    border border-[var(--glass-border)]"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div
            className="w-7 h-7 rounded-lg bg-[var(--brand)] flex items-center
                        justify-center transition-shadow duration-200"
          >
            <Cpu className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-[var(--font-display)] text-base font-bold text-[var(--text-primary)] tracking-tight">
            Arkhos
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map((link) => {
            const isActive = pathname.includes(link.href);
            return (
              <Link
                key={link.key}
                href={link.href}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150",
                  isActive
                    ? "text-[var(--text-primary)] bg-[var(--surface)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]",
                )}
              >
                {t(link.key)}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
          <Link
            href="/generate"
            className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-sm font-medium
                       bg-[var(--brand)] text-white
                       hover:brightness-110 transition-all duration-150 cursor-pointer"
          >
            {t("generate")}
          </Link>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex items-center justify-center w-9 h-9
                       rounded-md bg-[var(--surface)] border border-[var(--border)]
                       transition-colors duration-150 cursor-pointer"
            aria-label="Menu"
          >
            {mobileOpen ? (
              <X className="w-4 h-4 text-[var(--text-secondary)]" />
            ) : (
              <Menu className="w-4 h-4 text-[var(--text-secondary)]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden mt-2 mx-auto max-w-6xl rounded-xl
                      bg-[var(--glass-bg)] backdrop-blur-xl
                      border border-[var(--glass-border)] p-3"
        >
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium
                           text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                           hover:bg-[var(--surface)] transition-colors duration-150"
              >
                {t(link.key)}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2 px-4 pt-3 mt-2 border-t border-[var(--border)]">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
        </div>
      )}
    </nav>
  );
}
