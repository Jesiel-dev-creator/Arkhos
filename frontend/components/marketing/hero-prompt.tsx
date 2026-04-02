"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight, Loader2 } from "lucide-react";
import { apiPost } from "@/lib/api";
import { FleetToggle } from "@/components/generate/fleet-toggle";
import { useTypingPlaceholder } from "@/hooks/use-typing-placeholder";

type Profile = "budget" | "balanced" | "quality";

const PLACEHOLDER_PROMPTS = [
  "A SaaS landing page with pricing, features, and testimonials...",
  "A restaurant site with reservations, menu, and photo gallery...",
  "A developer portfolio with project cards and a dark theme...",
  "An e-commerce store with product grid and shopping cart...",
  "A startup pitch page with team bios and investor CTA...",
  "A photography portfolio with masonry grid and lightbox...",
  "A law firm site with practice areas and contact form...",
  "A fitness studio page with class schedule and membership tiers...",
];

export function HeroPrompt() {
  const t = useTranslations();
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [profile, setProfile] = useState<Profile>("balanced");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const typingText = useTypingPlaceholder(PLACEHOLDER_PROMPTS);

  const handleGenerate = async () => {
    const trimmed = prompt.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiPost<{ generation_id: string }>("/generate", {
        prompt: trimmed,
        locale: "en",
        profile,
      });
      router.push(`/generate/${res.generation_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start generation");
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--deep)]/80 backdrop-blur-xl p-5">
      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          className="w-full resize-none bg-transparent text-sm text-[var(--text-primary)] placeholder:text-transparent focus:outline-none leading-relaxed"
          aria-label={t("hero.placeholder")}
        />
        {/* Typing placeholder — only visible when textarea is empty */}
        {!prompt && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 text-sm leading-relaxed text-[var(--text-muted)]"
          >
            {typingText}
            <span className="inline-block w-[2px] h-[14px] ml-0.5 -mb-[2px] bg-[var(--brand)] animate-pulse" />
          </div>
        )}
      </div>
      <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <FleetToggle value={profile} onChange={setProfile} />
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!prompt.trim() || loading}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium bg-[var(--brand)] text-white hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
          {t("hero.cta")}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-xs text-[var(--error)]">{error}</p>
      )}
      <p className="mt-2 text-[10px] text-[var(--text-muted)]">
        Cmd+Enter to generate
      </p>
    </div>
  );
}
