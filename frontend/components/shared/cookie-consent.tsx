"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Settings2, X } from "lucide-react";

const CONSENT_KEY = "arkhos-cookie-consent";

interface CookiePreferences {
  essential: true; // Always on — cannot be toggled
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true,
  analytics: false,
  marketing: false,
  timestamp: "",
};

function getStoredPreferences(): CookiePreferences | null {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as CookiePreferences;
  } catch {
    return null;
  }
}

function storePreferences(prefs: CookiePreferences): void {
  localStorage.setItem(
    CONSENT_KEY,
    JSON.stringify({ ...prefs, timestamp: new Date().toISOString() }),
  );
}

type ConsentCategory = "analytics" | "marketing";

const CATEGORIES: ConsentCategory[] = ["analytics", "marketing"];

export function CookieConsent() {
  const t = useTranslations("cookieConsent");
  // Lazy initializer: runs only on client, returns true (hidden) on SSR.
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const stored = getStoredPreferences();
    if (stored || navigator.doNotTrack === "1") return true;
    return false;
  });
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    ...DEFAULT_PREFERENCES,
  });

  const visible = !dismissed;

  const acceptAll = useCallback(() => {
    const prefs: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
      timestamp: "",
    };
    storePreferences(prefs);
    setPreferences(prefs);
    setDismissed(true);
  }, []);

  const rejectAll = useCallback(() => {
    const prefs: CookiePreferences = { ...DEFAULT_PREFERENCES };
    storePreferences(prefs);
    setPreferences(prefs);
    setDismissed(true);
  }, []);

  const savePreferences = useCallback(() => {
    storePreferences(preferences);
    setDismissed(true);
  }, [preferences]);

  const toggleCategory = useCallback((category: ConsentCategory) => {
    setPreferences((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] backdrop-blur-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-4 pb-0">
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {t("title")}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
              {t("message")}{" "}
              <Link
                href="/legal/cookies"
                className="underline underline-offset-2 text-[var(--brand)] hover:text-[var(--brand-light)]"
              >
                {t("learnMore")}
              </Link>
            </p>
          </div>
          <button
            type="button"
            onClick={rejectAll}
            aria-label={t("close")}
            className="shrink-0 flex items-center justify-center w-7 h-7 rounded-md text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface)] transition-colors duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Category toggles — expandable */}
        {showDetails && (
          <div className="px-4 pt-3 space-y-2">
            {/* Essential — always on */}
            <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-[var(--surface)]">
              <div>
                <p className="text-xs font-medium text-[var(--text-primary)]">{t("categories.essential.title")}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{t("categories.essential.description")}</p>
              </div>
              <div className="shrink-0 ml-4">
                <div className="w-9 h-5 rounded-full bg-[var(--brand)] relative cursor-not-allowed opacity-60">
                  <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-white" />
                </div>
              </div>
            </div>

            {/* Toggleable categories */}
            {CATEGORIES.map((cat) => (
              <div
                key={cat}
                className="flex items-center justify-between py-2 px-3 rounded-xl bg-[var(--surface)]"
              >
                <div>
                  <p className="text-xs font-medium text-[var(--text-primary)]">
                    {t(`categories.${cat}.title`)}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    {t(`categories.${cat}.description`)}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={preferences[cat]}
                  onClick={() => toggleCategory(cat)}
                  className="shrink-0 ml-4 w-9 h-5 rounded-full relative transition-colors duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
                  style={{
                    backgroundColor: preferences[cat]
                      ? "var(--brand)"
                      : "var(--elevated)",
                  }}
                >
                  <div
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200"
                    style={{
                      left: preferences[cat] ? "calc(100% - 18px)" : "2px",
                    }}
                  />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 p-4">
          <button
            type="button"
            onClick={() => setShowDetails((p) => !p)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] transition-colors duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
          >
            <Settings2 className="w-3 h-3" />
            {showDetails ? t("hideSettings") : t("showSettings")}
          </button>
          <div className="flex-1" />
          <button
            type="button"
            onClick={rejectAll}
            className="px-3 py-2 rounded-xl text-xs font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface)] transition-colors duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
          >
            {t("rejectAll")}
          </button>
          {showDetails ? (
            <button
              type="button"
              onClick={savePreferences}
              className="px-3 py-2 rounded-xl text-xs font-medium bg-[var(--brand)] text-white hover:brightness-110 transition-all duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
            >
              {t("savePreferences")}
            </button>
          ) : (
            <button
              type="button"
              onClick={acceptAll}
              className="px-3 py-2 rounded-xl text-xs font-medium bg-[var(--brand)] text-white hover:brightness-110 transition-all duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
            >
              {t("acceptAll")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
