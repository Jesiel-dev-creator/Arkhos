import { useState, useRef, useCallback, useEffect } from "react";
import { Zap, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import type { GenerationStatus } from "@/hooks/useSSE";

const LOCALES = ["EN", "FR", "IT", "DE", "ES"] as const;

interface PromptInputProps {
  onSubmit: (prompt: string, locale: string) => void;
  status: GenerationStatus;
}

export default function PromptInput({ onSubmit, status }: PromptInputProps) {
  const [value, setValue] = useState("");
  const [locale, setLocale] = useState("en");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isRunning = status === "running" || status === "starting";
  const charCount = value.length;
  const isNearLimit = charCount > 800;
  const isOverLimit = charCount > 1000;

  const adjustHeight = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "140px";
    ta.style.height = `${Math.min(Math.max(140, ta.scrollHeight), 300)}px`;
  }, []);

  useEffect(() => { adjustHeight(); }, [value, adjustHeight]);

  const handleSubmit = () => {
    if (!value.trim() || isRunning || isOverLimit) return;
    onSubmit(value.trim(), locale);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && value.trim()) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const fillAndSubmit = (prompt: string) => {
    setValue(prompt);
    setTimeout(() => onSubmit(prompt, locale), 0);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* ── Locale Pills ── */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] uppercase tracking-wider text-[var(--muted)] mr-2"
              style={{ fontFamily: "var(--font-code)" }}>
          Locale
        </span>
        {LOCALES.map((loc) => (
          <button
            key={loc}
            onClick={() => setLocale(loc.toLowerCase())}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all duration-200 ${
              locale === loc.toLowerCase()
                ? "bg-[var(--ember)] text-white shadow-[0_0_12px_rgba(255,107,53,0.25)]"
                : "text-[var(--muted)] border border-[var(--border)] hover:border-[var(--muted)] hover:text-[var(--frost)]"
            }`}
          >
            {loc}
          </button>
        ))}
      </div>

      {/* ── Textarea — glass morphism from Magic MCP ── */}
      <div className="relative group">
        {/* Focus glow ring */}
        <div className="absolute -inset-[1px] rounded-[16px] opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none"
             style={{ background: "linear-gradient(135deg, rgba(0,212,238,0.2), rgba(0,212,238,0.05), rgba(0,212,238,0.2))", filter: "blur(1px)" }} />

        <div className="relative rounded-[16px] overflow-hidden transition-all duration-300"
             style={{
               background: "rgba(13, 27, 42, 0.8)",
               backdropFilter: "blur(16px)",
               WebkitBackdropFilter: "blur(16px)",
               border: "1px solid var(--border)",
               boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03), 0 4px 12px rgba(0,0,0,0.3)",
             }}>
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent pointer-events-none" />

          {/* Inner glow on focus */}
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--cyan)]/[0.03] via-transparent to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe the website you want to build..."
            disabled={isRunning}
            maxLength={1000}
            className="relative w-full px-5 py-5 bg-transparent resize-none text-[var(--frost)] text-[15px] leading-relaxed placeholder:text-[var(--muted)]/50 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ fontFamily: "var(--font-body)", minHeight: "140px", overflow: "hidden" }}
          />

          {/* Bottom bar */}
          <div className="relative flex items-center justify-between px-5 py-3 border-t border-white/[0.05]"
               style={{ background: "rgba(2, 4, 8, 0.3)" }}>
            <span
              className={`text-[11px] transition-colors ${
                isOverLimit ? "text-[var(--error)]" : isNearLimit ? "text-[var(--warning)]" : "text-[var(--muted)]/60"
              }`}
              style={{ fontFamily: "var(--font-code)" }}
            >
              {charCount} / 1000
            </span>

            <motion.button
              onClick={handleSubmit}
              disabled={!value.trim() || isRunning || isOverLimit}
              whileHover={!isRunning && value.trim() ? { scale: 1.03 } : undefined}
              whileTap={!isRunning && value.trim() ? { scale: 0.97 } : undefined}
              className={`relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                !value.trim() || isRunning || isOverLimit
                  ? "bg-[var(--deep)] text-[var(--muted)] cursor-not-allowed"
                  : "bg-gradient-to-r from-[var(--ember)] to-[#FF8C5A] text-white"
              } ${isRunning ? "animate-pulse-ember" : ""}`}
              style={
                value.trim() && !isRunning && !isOverLimit
                  ? { boxShadow: "0 0 20px rgba(255, 107, 53, 0.3), 0 4px 12px rgba(255, 107, 53, 0.2)" }
                  : undefined
              }
            >
              {/* Button hover glow — from Magic MCP */}
              {value.trim() && !isRunning && !isOverLimit && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[var(--ember)] to-[#FF8C5A] opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300 pointer-events-none" />
              )}
              {isRunning ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Building...
                </>
              ) : (
                <>
                  <Zap size={15} />
                  Generate
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── Templates with accent colors ── */}
      <div>
        <p className="text-[10px] uppercase tracking-wider text-[var(--muted)] mb-2.5"
           style={{ fontFamily: "var(--font-code)" }}>
          Templates
        </p>
        <div className="flex flex-col gap-1.5">
          {TEMPLATES.map((t) => (
            <motion.button
              key={t.name}
              onClick={() => fillAndSubmit(t.prompt)}
              disabled={isRunning}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="text-left px-3.5 py-2.5 rounded-[10px] overflow-hidden transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed group/tpl"
              style={{
                background: "rgba(13, 27, 42, 0.4)",
                backdropFilter: "blur(8px)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center gap-3">
                {/* Accent dot */}
                <div className="w-2 h-2 rounded-full flex-shrink-0 transition-shadow duration-300 group-hover/tpl:shadow-[0_0_8px]"
                     style={{ backgroundColor: t.accent, boxShadow: `0 0 0px ${t.accent}` }} />
                <div className="min-w-0">
                  <span className="text-sm text-[var(--frost)] font-medium block group-hover/tpl:text-gradient-ember transition-colors">
                    {t.name}
                  </span>
                  <span className="text-[11px] text-[var(--muted)] block leading-snug truncate">
                    {t.description}
                  </span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

const TEMPLATES = [
  {
    name: "French Bakery",
    description: "Warm modern bakery with menu, story & contact",
    accent: "#FFB020",
    prompt: "A landing page for a French bakery in Paris called 'Le Petit Four'. Modern and warm design with earth tones. Sections: hero with bakery photo, our story, menu highlights with 3 signature pastries, and contact with address and hours. Mobile responsive. Locale: French.",
  },
  {
    name: "SaaS Landing",
    description: "Dark conversion-focused with pricing & features",
    accent: "#00D4EE",
    prompt: "A SaaS landing page for 'CloudSync Pro', a file synchronization tool. Dark mode, conversion-focused. Sections: hero with product screenshot, 3 key features with icons, pricing table (Free/Pro/Enterprise), testimonials, and a call-to-action. Modern and minimal.",
  },
  {
    name: "Dev Portfolio",
    description: "Minimal dark mode projects grid & about",
    accent: "#DCE9F5",
    prompt: "A developer portfolio for 'Alex Chen', a full-stack engineer. Minimal dark mode design. Sections: hero with name and title, featured projects grid (4 projects with thumbnails), skills/tech stack, about me, and contact form. Clean and professional.",
  },
  {
    name: "Italian Restaurant",
    description: "Warm rustic elegance with menu & reservations",
    accent: "#FF6B35",
    prompt: "A landing page for an Italian restaurant in Rome called 'Trattoria Bella'. Warm earth tones with rustic elegance. Sections: hero with restaurant interior, our story, menu highlights (antipasti, primi, secondi, dolci), photo gallery, and reservations with opening hours. Locale: Italian.",
  },
  {
    name: "Creative Agency",
    description: "Bold asymmetric design with case studies",
    accent: "#E040FB",
    prompt: "A landing page for a creative agency called 'Studio Noir'. Bold and asymmetric design, dark with accent colors. Sections: hero with tagline, selected work/case studies (3 projects), services offered, team members (4 people), and contact form. Edgy and modern.",
  },
];
