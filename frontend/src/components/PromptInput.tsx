import { useState, useRef, useCallback, useEffect } from "react";
import { Zap, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import type { GenerationStatus } from "@/hooks/useSSE";

const LOCALES = ["EN", "FR", "IT", "DE", "ES"] as const;

interface PromptInputProps {
  onSubmit: (prompt: string, locale: string) => void;
  status: GenerationStatus;
}

const PLACEHOLDERS = [
  "A landing page for a French bakery in Paris...",
  "A dark SaaS product for project management...",
  "A portfolio for a creative photographer...",
  "An Italian restaurant with online reservations...",
  "A fitness studio with class schedule and pricing...",
];

export default function PromptInput({ onSubmit, status }: PromptInputProps) {
  const [value, setValue] = useState("");
  const [locale, setLocale] = useState("en");
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
            placeholder={PLACEHOLDERS[placeholderIndex]}
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

      {/* ── Templates with category filter ── */}
      <div>
        <p className="text-[10px] uppercase tracking-wider text-[var(--muted)] mb-2.5"
           style={{ fontFamily: "var(--font-code)" }}>
          Templates
        </p>

        {/* Category pills */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all duration-200 ${
                activeCategory === cat.id
                  ? "bg-[var(--ember)] text-white shadow-[0_0_12px_rgba(255,107,53,0.25)]"
                  : "text-[var(--muted)] border border-[var(--border)] hover:border-[var(--muted)] hover:text-[var(--frost)]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-1.5 max-h-[320px] overflow-y-auto pr-1">
          {TEMPLATES
            .filter((t) => activeCategory === "all" || t.category === activeCategory)
            .map((t) => (
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

type Category = "all" | "food" | "saas" | "portfolio" | "agency" | "professional" | "events";

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "all", label: "All" },
  { id: "food", label: "Food & Drink" },
  { id: "saas", label: "SaaS & Tech" },
  { id: "portfolio", label: "Portfolio" },
  { id: "agency", label: "Agency" },
  { id: "professional", label: "Professional" },
  { id: "events", label: "Events" },
];

const TEMPLATES = [
  // ── Food & Drink ──
  {
    name: "French Bakery",
    description: "Warm modern bakery with menu, story & contact",
    accent: "#FFB020",
    category: "food" as Category,
    prompt: "A landing page for an artisanal bakery in Paris called 'Le Petit Four'. Warm earth tones, elegant serif headings, generous whitespace. Sections: full-width hero with bread photography, our story (founded in 2026, family tradition), menu highlights with 3 signature pastries (croissant, macaron, tarte aux pommes with prices in EUR), testimonials from local customers, and contact section with address in Paris, opening hours, phone number. The overall feeling should be warm, inviting, and premium.",
  },
  {
    name: "Italian Restaurant",
    description: "Warm rustic elegance with menu & reservations",
    accent: "#FF6B35",
    category: "food" as Category,
    prompt: "A landing page for an Italian restaurant in Bordeaux called 'Trattoria Bella'. Warm earth tones with rustic elegance, elegant serif headings. Sections: full-width hero with restaurant interior photography, our story section (family recipes since generations), menu highlights organized by category (antipasti, primi, secondi, dolci) with prices in EUR, photo gallery of dishes, and reservations section with a booking form, address in Bordeaux, opening hours, phone. Atmospheric and appetizing.",
  },
  {
    name: "Coffee Shop",
    description: "Cozy modern café with menu & community",
    accent: "#8B6914",
    category: "food" as Category,
    prompt: "A cozy artisan coffee shop called 'Café Lumière' in Lyon, France. Warm, intimate atmosphere. Sections: hero with coffee photo and warm amber lighting, our story (independent roasters since 2024), menu highlights (3 specialty drinks with prices in EUR: Espresso Noisette €3.50, Latte Caramel €5.00, Cold Brew Maison €4.50), community events section, and contact with address in Lyon and opening hours. Warm amber and cream tones. Mobile responsive.",
  },
  // ── SaaS & Tech ──
  {
    name: "SaaS Landing",
    description: "Dark conversion-focused with pricing & features",
    accent: "#00D4EE",
    category: "saas" as Category,
    prompt: "A SaaS landing page for 'CloudSync Pro', a file synchronization tool for teams. Dark mode with indigo/cyan accent colors, modern geometric sans-serif fonts. Sections: cinematic dark hero with product dashboard screenshot and two CTA buttons, 3 key features in a bento grid with icons (real-time sync, encryption, team collaboration), pricing table with 3 tiers (Free/Pro/Enterprise), testimonials carousel with avatars and star ratings, FAQ accordion, and a full-width CTA section. Professional and conversion-focused.",
  },
  {
    name: "B2B SaaS",
    description: "Enterprise-focused with social proof & demo CTA",
    accent: "#6366F1",
    category: "saas" as Category,
    prompt: "B2B SaaS platform called 'FlowDesk' for enterprise workflow automation. Dark professional design. Sections: hero with dashboard screenshot and 'Book a Demo' CTA, 3 key features in bento grid (automation, analytics, integrations), social proof section with partner logos and testimonials, pricing with 3 tiers (Starter €29/mo, Pro €99/mo, Enterprise custom), FAQ accordion, and full-width CTA. Dark navy/indigo palette.",
  },
  {
    name: "Startup Landing",
    description: "YC-style with waitlist signup & traction",
    accent: "#F97316",
    category: "saas" as Category,
    prompt: "A startup landing page for 'Beacon', an AI-powered analytics tool. YC-style clean design. Sections: bold hero with large headline and waitlist email signup, traction stats row (10k+ users, 99.9% uptime, 50+ integrations), 3 features with icons, testimonials from early adopters, and minimal footer. Black and orange accent. Fast, confident, no-BS tone.",
  },
  // ── Portfolio ──
  {
    name: "Dev Portfolio",
    description: "Minimal dark mode projects grid & about",
    accent: "#DCE9F5",
    category: "portfolio" as Category,
    prompt: "A developer portfolio for 'Alex Chen', a full-stack engineer based in Lyon. Minimal dark mode with high contrast, one bold accent color. Sections: dramatic hero with large name typography and animated intro, featured projects grid (4 projects with Unsplash thumbnails, tech badges, and links), skills section with categorized tech stack (Frontend, Backend, DevOps), about me split layout with photo, and contact form with email and social links. Clean, confident, editorial feel.",
  },
  {
    name: "Photography",
    description: "Full-bleed gallery with elegant typography",
    accent: "#A78BFA",
    category: "portfolio" as Category,
    prompt: "A photography portfolio for 'Marie Laurent', a portrait photographer in Toulouse. Elegant minimal design with full-bleed images. Sections: cinematic hero with signature photo, portfolio gallery grid (6 photos with hover overlay showing project name), about section with split layout (photo left, bio right), services & pricing (portrait session €250, event €500, corporate €800), and contact form. Monochrome palette with one accent color.",
  },
  // ── Agency ──
  {
    name: "Creative Agency",
    description: "Bold asymmetric design with case studies",
    accent: "#E040FB",
    category: "agency" as Category,
    prompt: "A landing page for a creative agency in Marseille called 'Studio Noir'. Bold dark design with orange accent, strong typographic hierarchy, asymmetric layouts. Sections: statement hero with large animated headline and two CTAs, selected work showcase (3 case studies with large images and project descriptions), services offered (branding, web design, strategy) in card grid, team members (4 people with avatars and roles), and contact section with form and office address in Marseille. Edgy, confident, premium.",
  },
  {
    name: "Consultant",
    description: "Authority-building with case studies & CTA",
    accent: "#0EA5E9",
    category: "agency" as Category,
    prompt: "A consulting website for 'Pierre Moreau', a digital transformation consultant based in Nantes. Professional, trust-building design. Sections: hero with professional photo and tagline 'Transform Your Business', expertise areas (3 cards: Strategy, Operations, Technology), case studies (3 success stories with metrics), client testimonials, about section with credentials, and contact form with call booking CTA. Navy and teal palette.",
  },
  // ── Professional ──
  {
    name: "Law Firm",
    description: "Professional trust-building with services",
    accent: "#1E3A5F",
    category: "professional" as Category,
    prompt: "A professional website for a law firm in Paris called 'Cabinet Dupont & Associés'. Dark navy, gold accents, trust-building design. Sections: authoritative hero with firm name and tagline, practice areas (4 cards: Corporate, Real Estate, IP, Employment), about the firm (founded 1998, 25+ lawyers), team grid (4 senior partners with photos), client testimonials, and contact section with office address in Paris 8ème, phone, email. Serious, prestigious, French legal aesthetic.",
  },
  {
    name: "Fitness Studio",
    description: "High energy with classes, trainers & pricing",
    accent: "#EF4444",
    category: "professional" as Category,
    prompt: "A high-energy fitness studio called 'Pulse Fitness' in Montpellier. Bold, dynamic design with dark background and red accent. Sections: hero with gym photo and 'Start Your Journey' CTA, class schedule (yoga, HIIT, boxing, pilates), trainer profiles (3 trainers with photos), membership pricing (3 tiers: Basic €29/mo, Premium €49/mo, VIP €79/mo), testimonials from members, and contact with address and opening hours. Motivating and modern.",
  },
  // ── Events ──
  {
    name: "Wedding Venue",
    description: "Elegant romantic with gallery & booking",
    accent: "#D4A574",
    category: "events" as Category,
    prompt: "An elegant wedding venue called 'Château de Lumières' in Provence, France. Romantic, luxurious design with soft gold and ivory tones, serif headings. Sections: full-width hero with château photography, our story (18th century estate), venue spaces gallery (ceremony, reception, gardens), services & packages (3 tiers: Intimate €8,000, Classic €15,000, Grand €25,000), testimonials from couples, and contact/booking form with address in Provence. Dreamy, premium, sophisticated.",
  },
  {
    name: "Boutique Hotel",
    description: "Luxury hospitality with rooms & amenities",
    accent: "#B8860B",
    category: "events" as Category,
    prompt: "A boutique hotel called 'Hôtel Saint-Germain' in Paris 6ème. Luxury hospitality design with cream, gold, and deep green. Sections: cinematic hero with hotel facade, room types (3 cards: Classique €180/nuit, Supérieure €260/nuit, Suite €420/nuit), amenities (spa, restaurant, bar, concierge), guest testimonials, gallery of interiors, and booking section with address and contact. Parisian elegance, refined luxury.",
  },
  {
    name: "Online Store",
    description: "Product showcase with features & hero",
    accent: "#10B981",
    category: "events" as Category,
    prompt: "An e-commerce landing page for 'Maison Verte', a sustainable home goods brand in Strasbourg. Clean modern design with green accent. Sections: hero with product lifestyle photo and shop CTA, featured products grid (4 products with photos, names, prices in EUR), brand values (3 icons: sustainable, handmade, local), customer reviews, about section (founded by artisans in Alsace), and newsletter signup with footer. Fresh, eco-conscious, premium.",
  },
];
