"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight, Loader2 } from "lucide-react";
import { useAuthContext } from "@/components/auth/auth-provider";
import { FleetToggle } from "@/components/generate/fleet-toggle";
import { useTypingPlaceholder } from "@/hooks/use-typing-placeholder";
import { cn } from "@/lib/utils";

type Profile = "budget" | "balanced" | "quality";

const TEMPLATES: Record<string, { label: string; prompt: string }> = {
  bakery: { label: "Bakery", prompt: "A modern bakery website with online ordering, daily specials, and a gallery of fresh pastries." },
  saas: { label: "SaaS", prompt: "A SaaS landing page with hero, features grid, pricing table, testimonials, and signup CTA." },
  portfolio: { label: "Portfolio", prompt: "A minimal developer portfolio with project showcase, about section, and contact form." },
  restaurant: { label: "Restaurant", prompt: "An elegant restaurant website with menu, reservations, photo gallery, and location map." },
  agency: { label: "Agency", prompt: "A creative agency site with case studies, team section, services grid, and contact page." },
  ecommerce: { label: "E-commerce", prompt: "An e-commerce storefront with product grid, filters, cart, and checkout flow." },
};

export default function NewProjectPage() {
  const t = useTranslations("newProject");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session } = useAuthContext();

  const templateKey = searchParams.get("template");
  const initialPrompt = templateKey && TEMPLATES[templateKey] ? TEMPLATES[templateKey].prompt : "";

  const [prompt, setPrompt] = useState(initialPrompt);
  const [profile, setProfile] = useState<Profile>("balanced");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const placeholder = useTypingPlaceholder([
    "A modern bakery website with online ordering...",
    "A SaaS landing page with pricing and testimonials...",
    "A portfolio site with project showcase...",
    "An elegant restaurant website with reservations...",
  ]);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || loading || !session) return;
    setLoading(true);
    setError(null);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiBase}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ prompt: prompt.trim(), locale: "en", profile }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Request failed" }));
        throw new Error(typeof err.detail === "string" ? err.detail : "Request failed");
      }

      const data = await res.json();
      router.push(`/generate/${data.generation_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setLoading(false);
    }
  }, [prompt, profile, loading, session, router]);

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
      <h1 className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold text-[var(--text-primary)] text-center mb-2">
        {t("title")}
      </h1>
      <p className="text-sm text-[var(--text-muted)] text-center mb-8">
        {t("subtitle")}
      </p>

      {/* Prompt */}
      <div className="relative mb-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleGenerate(); } }}
          placeholder={placeholder}
          rows={4}
          disabled={loading}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--deep)] px-5 py-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none disabled:opacity-50"
        />
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!prompt.trim() || loading}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-[var(--brand)] text-white hover:brightness-110 transition-all duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
          {loading ? t("generating") : t("generate")}
        </button>
      </div>

      {error && (
        <p className="text-xs text-[var(--error)] mb-4 text-center">{error}</p>
      )}

      {/* Fleet toggle */}
      <div className="flex items-center justify-center mb-10">
        <FleetToggle value={profile} onChange={setProfile} />
      </div>

      {/* Templates */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-3 text-center">
          {t("templates")}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {Object.entries(TEMPLATES).map(([key, { label }]) => (
            <button
              key={key}
              type="button"
              onClick={() => setPrompt(TEMPLATES[key].prompt)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                "focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none",
                prompt === TEMPLATES[key].prompt
                  ? "bg-[var(--brand)]/10 text-[var(--brand)] border border-[var(--brand)]/20"
                  : "bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--elevated)]",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
