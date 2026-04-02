"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const CONSENT_KEY = "arkhos-cookie-consent";

export function CookieConsent() {
  const t = useTranslations("cookies");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-4 backdrop-blur-xl">
      <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
        {t("message")}{" "}
        <Link href="/legal/cookies" className="underline underline-offset-2 text-[var(--brand)] hover:text-[var(--brand-light)]">
          {t("learnMore")}
        </Link>
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={accept}
          className="px-4 py-2 rounded-xl text-xs font-medium bg-[var(--brand)] text-white hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none transition-all duration-150 cursor-pointer"
        >
          {t("accept")}
        </button>
      </div>
    </div>
  );
}
