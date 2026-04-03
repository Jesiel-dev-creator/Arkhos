"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function StatusPage() {
  const t = useTranslations("pages.status");
  const [health, setHealth] = useState<{ status: string; version: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    fetch(`${base}/health`)
      .then((r) => r.json())
      .then((data) => { setHealth(data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-20">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--brand)]">{t("kicker")}</p>
        <h1 className="mt-4 font-[var(--font-display)] text-5xl font-extrabold tracking-tight text-[var(--text-primary)]">{t("title")}</h1>
        <p className="mt-4 text-lg leading-relaxed text-[var(--text-secondary)]">{t("description")}</p>
      </div>
      <div className="mt-12 rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-6">
        <div className="flex items-center gap-3">
          {loading ? (
            <Loader2 className="w-5 h-5 text-[var(--text-muted)] animate-spin" />
          ) : health?.status === "ok" ? (
            <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />
          ) : (
            <XCircle className="w-5 h-5 text-[var(--error)]" />
          )}
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {t("api")}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {loading ? t("checking") : health?.status === "ok" ? `${t("operational")} · ${health.version}` : t("down")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
