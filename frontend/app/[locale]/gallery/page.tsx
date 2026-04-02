"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Loader2 } from "lucide-react";
import { apiGet } from "@/lib/api";

interface GalleryItem {
  id: string;
  prompt: string;
  cost_eur: number;
}

const SHOWCASE_KEYS = ["saas", "restaurant", "portfolio"] as const;

export default function GalleryPage() {
  const t = useTranslations("pages.gallery");
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiGet<GalleryItem[]>("/gallery")
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-20">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--brand)]">{t("kicker")}</p>
        <h1 className="mt-4 font-[var(--font-display)] text-5xl font-extrabold tracking-tight text-[var(--text-primary)]">
          {t("title")}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-[var(--text-secondary)]">{t("description")}</p>
      </div>

      {/* Showcase (static examples — always visible) */}
      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {SHOWCASE_KEYS.map((item) => (
          <article key={item} className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--deep)]">
            <div className="h-48 bg-[linear-gradient(135deg,rgba(99,102,241,0.24),rgba(15,23,42,0.2))] border-b border-[var(--border)]" />
            <div className="p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand)]">{t(`items.${item}.tag`)}</p>
              <h2 className="mt-3 text-xl font-[var(--font-display)] text-[var(--text-primary)]">
                {t(`items.${item}.title`)}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                {t(`items.${item}.description`)}
              </p>
            </div>
          </article>
        ))}
      </div>

      {/* Community generations (from API) */}
      {loading ? (
        <div className="mt-12 flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 text-[var(--text-muted)] animate-spin" />
        </div>
      ) : items.length > 0 ? (
        <>
          <h2 className="mt-16 text-xs uppercase tracking-[0.22em] text-[var(--brand)]">
            Recent generations
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/generate/${item.id}`}
                className="group rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-5 transition-colors duration-150 hover:border-[var(--brand)]/30 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
              >
                <p className="text-sm text-[var(--text-primary)] line-clamp-2 leading-relaxed">
                  {item.prompt}
                </p>
                <p className="mt-3 text-xs font-[var(--font-code)] text-[var(--text-muted)]">
                  €{item.cost_eur.toFixed(4)}
                </p>
              </Link>
            ))}
          </div>
        </>
      ) : !error ? null : null}

      <div className="mt-12 rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-6 text-center">
        <p className="text-sm text-[var(--text-secondary)]">{t("ctaBody")}</p>
        <Link
          href="/generate"
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-medium text-white hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none transition-all duration-150"
        >
          {t("ctaAction")}
        </Link>
      </div>
    </div>
  );
}
