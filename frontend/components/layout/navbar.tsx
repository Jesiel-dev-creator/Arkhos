"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Menu, Cpu, LogOut, Settings } from "lucide-react";
import { useAuthContext } from "@/components/auth/auth-provider";
import { ThemeToggle } from "./theme-toggle";
import { LocaleSwitcher } from "./locale-switcher";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const PUBLIC_LINKS = [
  { key: "pricing", href: "/pricing" },
  { key: "gallery", href: "/gallery" },
  { key: "docs", href: "/docs" },
] as const;

const AUTH_LINKS = [
  { key: "dashboard", href: "/dashboard" },
  { key: "gallery", href: "/gallery" },
  { key: "docs", href: "/docs" },
] as const;

function UserAvatar({ user }: { user: { email?: string; user_metadata?: { avatar_url?: string; full_name?: string } } }) {
  const avatarUrl = user.user_metadata?.avatar_url;
  const name = user.user_metadata?.full_name || user.email || "";
  const initial = name.charAt(0).toUpperCase() || "U";

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className="w-7 h-7 rounded-full object-cover"
      />
    );
  }

  return (
    <div
      className="w-7 h-7 rounded-full bg-[var(--brand)] flex items-center justify-center
                  text-xs font-medium text-white select-none"
    >
      {initial}
    </div>
  );
}

export function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { user, loading, signOut } = useAuthContext();

  const isLoggedIn = !loading && !!user;
  const links = isLoggedIn ? AUTH_LINKS : PUBLIC_LINKS;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <div
        className="mx-auto max-w-6xl flex items-center justify-between
                    px-5 py-2.5 rounded-xl
                    bg-[var(--glass-bg)] backdrop-blur-xl
                    border border-[var(--glass-border)]"
      >
        {/* Logo */}
        <Link
          href={isLoggedIn ? "/dashboard" : "/"}
          className="flex items-center gap-2.5 shrink-0
                     focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none rounded-lg"
        >
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
        <div className="hidden lg:flex items-center gap-0.5">
          {links.map((link) => {
            const isActive = pathname.includes(link.href);
            return (
              <Link
                key={link.key}
                href={link.href}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150",
                  "focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none",
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

        {/* Right side — desktop */}
        <div className="hidden lg:flex items-center gap-2">
          <ThemeToggle />
          <LocaleSwitcher />

          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard/settings"
                className="flex items-center justify-center w-9 h-9 rounded-xl
                           text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                           hover:bg-[var(--surface)] transition-colors duration-150
                           focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
                aria-label={t("settings")}
              >
                <Settings className="w-4 h-4" />
              </Link>
              <button
                onClick={() => signOut()}
                className="flex items-center justify-center w-9 h-9 rounded-xl
                           text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                           hover:bg-[var(--surface)] transition-colors duration-150 cursor-pointer
                           focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
                aria-label={t("signOut")}
              >
                <LogOut className="w-4 h-4" />
              </button>
              <UserAvatar user={user} />
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center px-3.5 py-1.5 rounded-xl text-sm font-medium
                         bg-[var(--brand)] text-white
                         hover:brightness-110 transition-all duration-150 cursor-pointer
                         focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
            >
              {t("startBuilding")}
            </Link>
          )}
        </div>

        {/* Mobile */}
        <div className="flex lg:hidden items-center gap-2">
          {!isLoggedIn && (
            <Link
              href="/login"
              className="inline-flex items-center px-3.5 py-1.5 rounded-xl text-sm font-medium
                         bg-[var(--brand)] text-white
                         hover:brightness-110 transition-all duration-150 cursor-pointer
                         focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
            >
              {t("startBuilding")}
            </Link>
          )}

          {isLoggedIn && <UserAvatar user={user} />}

          <Sheet>
            <SheetTrigger
              className="flex items-center justify-center w-9 h-9
                         rounded-md bg-[var(--surface)] border border-[var(--border)]
                         transition-colors duration-150 cursor-pointer
                         focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
              aria-label="Menu"
            >
              <Menu className="w-4 h-4 text-[var(--text-secondary)]" />
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-[var(--deep)] border-[var(--border)] p-0"
            >
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="flex flex-col h-full">
                {/* Nav links */}
                <div className="flex flex-col gap-1 p-4 pt-12">
                  {links.map((link) => {
                    const isActive = pathname.includes(link.href);
                    return (
                      <Link
                        key={link.key}
                        href={link.href}
                        className={cn(
                          "flex w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150",
                          "focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none",
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

                {/* Auth actions — mobile */}
                {isLoggedIn && (
                  <div className="flex flex-col gap-1 px-4 pt-2 border-t border-[var(--border)]">
                    <Link
                      href="/dashboard/settings"
                      className="flex w-full items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
                                 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]
                                 transition-colors duration-150
                                 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
                    >
                      <Settings className="w-4 h-4" />
                      {t("settings")}
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="flex w-full items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
                                 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]
                                 transition-colors duration-150 cursor-pointer
                                 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
                    >
                      <LogOut className="w-4 h-4" />
                      {t("signOut")}
                    </button>
                  </div>
                )}

                {/* Theme + Locale */}
                <div className="flex items-center gap-2 px-4 pt-3 mt-auto pb-6 border-t border-[var(--border)]">
                  <ThemeToggle />
                  <LocaleSwitcher />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
