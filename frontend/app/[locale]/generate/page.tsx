"use client";

import { useState, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Cpu, Sparkles, Code2, Palette, Search, Shield } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { apiPost } from "@/lib/api";
import { FleetToggle } from "@/components/generate/fleet-toggle";

const TEMPLATES = [
  { id: "bakery", label: "French Bakery", prompt: "A landing page for a French bakery in Paris with warm earth tones, menu, about section, and contact" },
  { id: "saas", label: "SaaS Landing", prompt: "A dark SaaS landing page for a project management tool with pricing, features, and CTA" },
  { id: "portfolio", label: "Dev Portfolio", prompt: "A minimal developer portfolio with dark mode, projects grid, about section, and contact" },
  { id: "restaurant", label: "Italian Restaurant", prompt: "An Italian restaurant website with warm elegance, menu, reservations, and gallery" },
  { id: "agency", label: "Creative Agency", prompt: "A bold creative agency website with asymmetric design, case studies, team, and contact" },
  { id: "ecommerce", label: "Online Store", prompt: "An online store landing page with featured products, categories, and shopping cart" },
] as const;

const FEATURE_KEYS = ["agents", "routing", "react", "design", "seo", "sovereign"] as const;
const FEATURE_ICONS = {
  agents: Sparkles,
  routing: Cpu,
  react: Code2,
  design: Palette,
  seo: Search,
  sovereign: Shield,
} as const;

export default function GeneratePage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [profile, setProfile] = useState<"budget" | "balanced" | "quality">("balanced");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;
      setLoading(true);
      setError(null);

      try {
        const res = await apiPost<{ generation_id: string }>("/generate", {
          prompt: text.trim(),
          locale,
          profile,
        });
        router.push(`/generate/${res.generation_id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to start generation");
        setLoading(false);
      }
    },
    [locale, profile, loading, router],
  );

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl">
          <p className="text-xs font-medium text-[var(--brand)] mb-3 tracking-[0.24em] uppercase text-center">
            {t("hero.badge")}
          </p>
          <h1 className="font-[var(--font-display)] text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight text-center mb-2">
            {t("generate.title")}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] text-center mb-8">
            {t("hero.subtitle")}
          </p>

          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate(prompt);
                }
              }}
              placeholder={t("hero.placeholder")}
              rows={4}
              className="w-full resize-none rounded-2xl border border-[var(--border)] bg-[var(--deep)] px-4 py-4 pr-28 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] transition-colors duration-150"
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <FleetToggle value={profile} onChange={setProfile} />
              <button
                type="button"
                onClick={() => handleGenerate(prompt)}
                disabled={!prompt.trim() || loading}
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none",
                  prompt.trim() && !loading
                    ? "bg-[var(--brand)] text-white hover:brightness-110"
                    : "bg-[var(--surface)] text-[var(--text-muted)]",
                )}
                aria-label={t("hero.cta")}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {error && <p className="mt-2 text-sm text-[var(--error)]">{error}</p>}

          <div className="mt-6">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">
              {t("generate.templates.label")}
            </p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleGenerate(template.prompt)}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] bg-[var(--surface)] border border-[var(--border)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none transition-colors duration-150 cursor-pointer"
                >
                  {template.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--border)] bg-[var(--deep)] px-4 py-10">
        <div className="mx-auto max-w-4xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {FEATURE_KEYS.map((key) => {
            const Icon = FEATURE_ICONS[key];
            return (
              <div key={key} className="flex items-start gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--void)]/40">
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-[var(--surface)] shrink-0">
                  <Icon className="w-4 h-4 text-[var(--brand)]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {t(`generate.features.${key}`)}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {t(`generate.features.${key}Desc`)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
