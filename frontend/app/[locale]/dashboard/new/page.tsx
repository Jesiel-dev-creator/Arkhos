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

const TEMPLATE_KEYS = ["bakery", "saas", "portfolio", "restaurant", "agency", "ecommerce"] as const;

export default function NewProjectPage() {
  const t = useTranslations("newProject");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session } = useAuthContext();

  const placeholderPhrases = Array.from({ length: 4 }, (_, i) => t(`placeholders.${i}`));

  const templateKey = searchParams.get("template");
  const initialPrompt = templateKey && TEMPLATE_KEYS.includes(templateKey as typeof TEMPLATE_KEYS[number])
    ? t(`templatePrompts.${templateKey}`)
    : "";

  const [prompt, setPrompt] = useState(initialPrompt);
  const [profile, setProfile] = useState<Profile>("balanced");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const placeholder = useTypingPlaceholder(placeholderPhrases);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || loading || !session) return;
    setLoading(true);
    setError(null);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiBase}/api/generate-mcp`, {
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
          {TEMPLATE_KEYS.map((key) => {
            const templatePrompt = t(`templatePrompts.${key}`);
            return (
              <button
                key={key}
                type="button"
                onClick={() => setPrompt(templatePrompt)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                  "focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none",
                  prompt === templatePrompt
                    ? "bg-[var(--brand)]/10 text-[var(--brand)] border border-[var(--brand)]/20"
                    : "bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--elevated)]",
                )}
              >
                {t(`templateLabels.${key}`)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
