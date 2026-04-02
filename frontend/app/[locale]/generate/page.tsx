"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight, Cpu, Sparkles, Code2, Palette, Search, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiPost } from "@/lib/api";
import { FleetToggle } from "@/components/generate/fleet-toggle";

const TEMPLATES = [
  { id: "bakery", label: "French Bakery", prompt: "A landing page for a French bakery in Paris with warm earth tones, menu, about section, and contact", category: "business" },
  { id: "saas", label: "SaaS Landing", prompt: "A dark SaaS landing page for a project management tool with pricing, features, and CTA", category: "tech" },
  { id: "portfolio", label: "Dev Portfolio", prompt: "A minimal developer portfolio with dark mode, projects grid, about section, and contact", category: "creative" },
  { id: "restaurant", label: "Italian Restaurant", prompt: "An Italian restaurant website with warm elegance, menu, reservations, and gallery", category: "business" },
  { id: "agency", label: "Creative Agency", prompt: "A bold creative agency website with asymmetric design, case studies, team, and contact", category: "creative" },
  { id: "ecommerce", label: "Online Store", prompt: "An online store landing page with featured products, categories, and shopping cart", category: "tech" },
] as const;

const FEATURES = [
  { icon: Sparkles, label: "AI Agent Pipeline", desc: "Multi-agent orchestration with live streaming" },
  { icon: Cpu, label: "Smart Routing", desc: "Optimal model per task" },
  { icon: Code2, label: "React + shadcn", desc: "Production-ready code" },
  { icon: Palette, label: "Design System", desc: "Colors, fonts, layout" },
  { icon: Search, label: "SEO Ready", desc: "Meta tags, responsive" },
  { icon: Shield, label: "EU Sovereign", desc: "GDPR, Mistral, Scaleway" },
] as const;

export default function GeneratePage() {
  const t = useTranslations();
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
          locale: "en",
          profile,
        });
        router.push(`/generate/${res.generation_id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to start generation");
        setLoading(false);
      }
    },
    [profile, loading, router],
  );

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col">
      {/* Hero prompt area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl">
          <h1 className="font-[var(--font-display)] text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight text-center mb-2">
            {t("hero.title")}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] text-center mb-8">
            {t("hero.subtitle")}
          </p>

          {/* Prompt input */}
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
              rows={3}
              className="w-full resize-none rounded-xl border border-[var(--border)]
                         bg-[var(--deep)] px-4 py-3.5 pr-28 text-sm text-[var(--text-primary)]
                         placeholder:text-[var(--text-muted)]
                         focus:outline-none focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)]
                         transition-colors duration-150"
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <FleetToggle value={profile} onChange={setProfile} />
              <button
                onClick={() => handleGenerate(prompt)}
                disabled={!prompt.trim() || loading}
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-150 cursor-pointer",
                  prompt.trim() && !loading
                    ? "bg-[var(--brand)] text-white hover:brightness-110"
                    : "bg-[var(--surface)] text-[var(--text-muted)]",
                )}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="mt-2 text-sm text-[var(--error)]">{error}</p>
          )}

          {/* Templates */}
          <div className="mt-6">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">
              Or start from a template
            </p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => handleGenerate(tmpl.prompt)}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium
                             text-[var(--text-secondary)] bg-[var(--surface)]
                             border border-[var(--border)]
                             hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]
                             transition-colors duration-150 cursor-pointer"
                >
                  {tmpl.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Feature grid */}
      <div className="border-t border-[var(--border)] bg-[var(--deep)] px-4 py-10">
        <div className="mx-auto max-w-4xl grid grid-cols-2 md:grid-cols-3 gap-4">
          {FEATURES.map((feat) => (
            <div
              key={feat.label}
              className="flex items-start gap-3 p-3 rounded-lg"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-[var(--surface)] shrink-0">
                <feat.icon className="w-4 h-4 text-[var(--brand)]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {feat.label}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {feat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
