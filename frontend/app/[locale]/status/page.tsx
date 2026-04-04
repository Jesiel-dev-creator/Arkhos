"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, XCircle, Loader2, RefreshCw } from "lucide-react";

interface ServiceStatus {
  status: string;
  version?: string;
}

interface ServiceCheck {
  name: string;
  translationKey: string;
  url: string;
  result: ServiceStatus | null;
  loading: boolean;
}

export default function StatusPage() {
  const t = useTranslations("pages.status");
  const [services, setServices] = useState<ServiceCheck[]>([
    {
      name: "api",
      translationKey: "api",
      url: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/health`,
      result: null,
      loading: true,
    },
    {
      name: "sandbox",
      translationKey: "sandbox",
      url: `${process.env.NEXT_PUBLIC_SANDBOX_URL || "http://localhost:8001"}/health`,
      result: null,
      loading: true,
    },
  ]);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkServices = useCallback(() => {
    setServices((prev) =>
      prev.map((s) => ({ ...s, loading: true, result: null })),
    );

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/health`;
    const sandboxUrl = `${process.env.NEXT_PUBLIC_SANDBOX_URL || "http://localhost:8001"}/health`;

    fetch(apiUrl)
      .then((r) => r.json())
      .then((data) => {
        setServices((prev) =>
          prev.map((s) =>
            s.name === "api" ? { ...s, result: data, loading: false } : s,
          ),
        );
      })
      .catch(() => {
        setServices((prev) =>
          prev.map((s) =>
            s.name === "api" ? { ...s, result: null, loading: false } : s,
          ),
        );
      });

    fetch(sandboxUrl)
      .then((r) => r.json())
      .then((data) => {
        setServices((prev) =>
          prev.map((s) =>
            s.name === "sandbox" ? { ...s, result: data, loading: false } : s,
          ),
        );
      })
      .catch(() => {
        setServices((prev) =>
          prev.map((s) =>
            s.name === "sandbox" ? { ...s, result: null, loading: false } : s,
          ),
        );
      });

    setLastChecked(new Date());
  }, []);

  useEffect(() => {
    const id = setTimeout(checkServices, 0);
    const interval = setInterval(checkServices, 30_000);
    return () => { clearTimeout(id); clearInterval(interval); };
  }, [checkServices]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-20">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--brand)]">{t("kicker")}</p>
        <h1 className="mt-4 font-[var(--font-display)] text-5xl font-extrabold tracking-tight text-[var(--text-primary)]">{t("title")}</h1>
        <p className="mt-4 text-lg leading-relaxed text-[var(--text-secondary)]">{t("description")}</p>
      </div>

      <div className="mt-12 space-y-4">
        {services.map((service) => (
          <div
            key={service.name}
            className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-6"
          >
            <div className="flex items-center gap-3">
              {service.loading ? (
                <Loader2 className="w-5 h-5 text-[var(--text-muted)] animate-spin" />
              ) : service.result?.status === "ok" ? (
                <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />
              ) : (
                <XCircle className="w-5 h-5 text-[var(--error)]" />
              )}
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {t(service.translationKey)}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {service.loading
                    ? t("checking")
                    : service.result?.status === "ok"
                      ? `${t("operational")}${service.result.version ? ` \u00b7 ${service.result.version}` : ""}`
                      : t("down")}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        {lastChecked && (
          <p className="text-xs text-[var(--text-muted)]">
            {t("lastChecked")}: {lastChecked.toLocaleTimeString()}
          </p>
        )}
        <button
          type="button"
          onClick={checkServices}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] transition-colors duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {t("refresh")}
        </button>
      </div>
    </div>
  );
}
