"use client";

import { useTranslations } from "next-intl";
import { useAuthContext } from "@/components/auth/auth-provider";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const { user } = useAuthContext();

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-1">
        {t("kicker")}
      </p>
      <h1 className="font-[var(--font-display)] text-2xl font-bold text-[var(--text-primary)] mb-8">
        {t("title")}
      </h1>

      {/* Account */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-6 mb-5">
        <h2 className="text-sm font-medium text-[var(--text-primary)] mb-4">{t("account")}</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)]">{t("email")}</span>
            <span className="text-xs text-[var(--text-secondary)]">{user?.email ?? "—"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)]">{t("tier")}</span>
            <span className="text-xs font-medium text-[var(--brand)] uppercase">Free</span>
          </div>
        </div>
      </div>

      {/* Usage */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-6 mb-5">
        <h2 className="text-sm font-medium text-[var(--text-primary)] mb-4">{t("usage")}</h2>
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-muted)]">{t("generationsThisMonth")}</span>
          <span className="text-xs font-[var(--font-code)] text-[var(--text-secondary)] tabular-nums">0 / 10</span>
        </div>
        <div className="h-1.5 rounded-full bg-[var(--surface)] mt-3 overflow-hidden">
          <div className="h-full rounded-full bg-[var(--brand)]" style={{ width: "0%" }} />
        </div>
      </div>

      {/* Billing stub */}
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--deep)] p-6 text-center">
        <p className="text-sm text-[var(--text-muted)]">{t("billingComingSoon")}</p>
      </div>
    </div>
  );
}
