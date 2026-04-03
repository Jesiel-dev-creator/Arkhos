"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight, Loader2 } from "lucide-react";
import { apiPost } from "@/lib/api";
import { FleetToggle } from "@/components/generate/fleet-toggle";
import { useTypingPlaceholder } from "@/hooks/use-typing-placeholder";

type Profile = "budget" | "balanced" | "quality";

const TEMPLATES = [
  { id: "bakery", label: "French Bakery", prompt: "A landing page for a French bakery in Paris with warm earth tones, menu, about section, and contact" },
  { id: "saas", label: "SaaS Landing", prompt: "A dark SaaS landing page for a project management tool with pricing, features, and CTA" },
  { id: "portfolio", label: "Dev Portfolio", prompt: "A minimal developer portfolio with dark mode, projects grid, about section, and contact" },
  { id: "restaurant", label: "Italian Restaurant", prompt: "An Italian restaurant website with warm elegance, menu, reservations, and gallery" },
  { id: "agency", label: "Creative Agency", prompt: "A bold creative agency website with asymmetric design, case studies, team, and contact" },
  { id: "ecommerce", label: "Online Store", prompt: "An online store landing page with featured products, categories, and shopping cart" },
] as const;

const PLACEHOLDER_PROMPTS = [
  "A SaaS landing page with pricing, features, and testimonials...",
  "A restaurant site with reservations, menu, and photo gallery...",
  "A developer portfolio with project cards and a dark theme...",
  "An e-commerce store with product grid and shopping cart...",
  "A startup pitch page with team bios and investor CTA...",
  "A photography portfolio with masonry grid and lightbox...",
];

export function HeroPrompt() {
  const t = useTranslations();
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [profile, setProfile] = useState<Profile>("balanced");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const typingText = useTypingPlaceholder(PLACEHOLDER_PROMPTS);

  const handleGenerate = useCallback(async (text?: string) => {
    const value = (text ?? prompt).trim();
    if (!value || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiPost<{ generation_id: string }>("/generate", {
        prompt: value,
        locale: "en",
        profile,
      });
      router.push(`/generate/${res.generation_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start generation");
      setLoading(false);
    }
  }, [prompt, profile, loading, router]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div id="generate" className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--deep)]/80 backdrop-blur-xl p-5">
      {/* Prompt input */}
      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          className="w-full resize-none bg-transparent text-sm text-[var(--text-primary)] placeholder:text-transparent focus:outline-none leading-relaxed"
          aria-label={t("hero.placeholder")}
        />
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

      {/* Controls row */}
      <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <FleetToggle value={profile} onChange={setProfile} />
        <button
          type="button"
          onClick={() => handleGenerate()}
          disabled={!prompt.trim() || loading}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium bg-[var(--brand)] text-white hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
          {t("hero.cta")}
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-[var(--error)]">{error}</p>}

      {/* Templates */}
      <div className="mt-4 pt-4 border-t border-[var(--border)]/50">
        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">
          {t("generate.templates.label")}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => {
                setPrompt(tmpl.prompt);
                handleGenerate(tmpl.prompt);
              }}
              disabled={loading}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-[var(--text-secondary)] bg-[var(--surface)] border border-[var(--border)] hover:text-[var(--text-primary)] hover:border-[var(--brand)]/30 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none transition-colors duration-150 cursor-pointer disabled:opacity-50"
            >
              {tmpl.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-3 text-[10px] text-[var(--text-muted)]">Cmd+Enter to generate</p>
    </div>
  );
}
