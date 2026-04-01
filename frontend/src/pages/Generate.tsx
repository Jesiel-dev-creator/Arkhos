import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSSE } from "@/hooks/useSSE";
import type { ChatMessage } from "@/hooks/useSSE";
import { useWebContainer } from "@/hooks/useWebContainer";
import { ChatInput } from "@/components/ui/bolt-style-chat";
import { ShiningText } from "@/components/ui/shining-text";
import { Banner } from "@/components/ui/banner";
import BasicModal from "@/components/ui/modal";
import PipelineStrip from "@/components/PipelineStrip";
import PreviewPane from "@/components/PreviewPane";
import CodeDrawer from "@/components/CodeDrawer";
import StatusBar from "@/components/StatusBar";
import IterationChat from "@/components/IterationChat";
import PlanReview from "@/components/PlanReview";
import ErrorBanner from "@/components/ErrorBanner";

/* ── Template data ── */

type Category = "all" | "food" | "saas" | "portfolio" | "agency" | "professional" | "events";

const TEMPLATES: {
  name: string;
  description: string;
  accent: string;
  category: Category;
  prompt: string;
}[] = [
  // ── Food & Drink ──
  {
    name: "French Bakery",
    description: "Warm modern bakery with menu, story & contact",
    accent: "#FFB020",
    category: "food",
    prompt: "A landing page for an artisanal bakery in Paris called 'Le Petit Four'. Warm earth tones, elegant serif headings, generous whitespace. Sections: full-width hero with bread photography, our story (founded in 2026, family tradition), menu highlights with 3 signature pastries (croissant, macaron, tarte aux pommes with prices in EUR), testimonials from local customers, and contact section with address in Paris, opening hours, phone number. The overall feeling should be warm, inviting, and premium.",
  },
  {
    name: "Italian Restaurant",
    description: "Warm rustic elegance with menu & reservations",
    accent: "#FF6B35",
    category: "food",
    prompt: "A landing page for an Italian restaurant in Bordeaux called 'Trattoria Bella'. Warm earth tones with rustic elegance, elegant serif headings. Sections: full-width hero with restaurant interior photography, our story section (family recipes since generations), menu highlights organized by category (antipasti, primi, secondi, dolci) with prices in EUR, photo gallery of dishes, and reservations section with a booking form, address in Bordeaux, opening hours, phone. Atmospheric and appetizing.",
  },
  {
    name: "Coffee Shop",
    description: "Cozy modern cafe with menu & community",
    accent: "#8B6914",
    category: "food",
    prompt: "A cozy artisan coffee shop called 'Cafe Lumiere' in Lyon, France. Warm, intimate atmosphere. Sections: hero with coffee photo and warm amber lighting, our story (independent roasters since 2024), menu highlights (3 specialty drinks with prices in EUR: Espresso Noisette \u20AC3.50, Latte Caramel \u20AC5.00, Cold Brew Maison \u20AC4.50), community events section, and contact with address in Lyon and opening hours. Warm amber and cream tones. Mobile responsive.",
  },
  // ── SaaS & Tech ──
  {
    name: "SaaS Landing",
    description: "Dark conversion-focused with pricing & features",
    accent: "#00D4EE",
    category: "saas",
    prompt: "A SaaS landing page for 'CloudSync Pro', a file synchronization tool for teams. Dark mode with indigo/cyan accent colors, modern geometric sans-serif fonts. Sections: cinematic dark hero with product dashboard screenshot and two CTA buttons, 3 key features in a bento grid with icons (real-time sync, encryption, team collaboration), pricing table with 3 tiers (Free/Pro/Enterprise), testimonials carousel with avatars and star ratings, FAQ accordion, and a full-width CTA section. Professional and conversion-focused.",
  },
  {
    name: "B2B SaaS",
    description: "Enterprise-focused with social proof & demo CTA",
    accent: "#6366F1",
    category: "saas",
    prompt: "B2B SaaS platform called 'FlowDesk' for enterprise workflow automation. Dark professional design. Sections: hero with dashboard screenshot and 'Book a Demo' CTA, 3 key features in bento grid (automation, analytics, integrations), social proof section with partner logos and testimonials, pricing with 3 tiers (Starter \u20AC29/mo, Pro \u20AC99/mo, Enterprise custom), FAQ accordion, and full-width CTA. Dark navy/indigo palette.",
  },
  {
    name: "Startup Landing",
    description: "YC-style with waitlist signup & traction",
    accent: "#F97316",
    category: "saas",
    prompt: "A startup landing page for 'Beacon', an AI-powered analytics tool. YC-style clean design. Sections: bold hero with large headline and waitlist email signup, traction stats row (10k+ users, 99.9% uptime, 50+ integrations), 3 features with icons, testimonials from early adopters, and minimal footer. Black and orange accent. Fast, confident, no-BS tone.",
  },
  // ── Portfolio ──
  {
    name: "Dev Portfolio",
    description: "Minimal dark mode projects grid & about",
    accent: "#DCE9F5",
    category: "portfolio",
    prompt: "A developer portfolio for 'Alex Chen', a full-stack engineer based in Lyon. Minimal dark mode with high contrast, one bold accent color. Sections: dramatic hero with large name typography and animated intro, featured projects grid (4 projects with Unsplash thumbnails, tech badges, and links), skills section with categorized tech stack (Frontend, Backend, DevOps), about me split layout with photo, and contact form with email and social links. Clean, confident, editorial feel.",
  },
  {
    name: "Photography",
    description: "Full-bleed gallery with elegant typography",
    accent: "#A78BFA",
    category: "portfolio",
    prompt: "A photography portfolio for 'Marie Laurent', a portrait photographer in Toulouse. Elegant minimal design with full-bleed images. Sections: cinematic hero with signature photo, portfolio gallery grid (6 photos with hover overlay showing project name), about section with split layout (photo left, bio right), services & pricing (portrait session \u20AC250, event \u20AC500, corporate \u20AC800), and contact form. Monochrome palette with one accent color.",
  },
  // ── Agency ──
  {
    name: "Creative Agency",
    description: "Bold asymmetric design with case studies",
    accent: "#E040FB",
    category: "agency",
    prompt: "A landing page for a creative agency in Marseille called 'Studio Noir'. Bold dark design with orange accent, strong typographic hierarchy, asymmetric layouts. Sections: statement hero with large animated headline and two CTAs, selected work showcase (3 case studies with large images and project descriptions), services offered (branding, web design, strategy) in card grid, team members (4 people with avatars and roles), and contact section with form and office address in Marseille. Edgy, confident, premium.",
  },
  {
    name: "Consultant",
    description: "Authority-building with case studies & CTA",
    accent: "#0EA5E9",
    category: "agency",
    prompt: "A consulting website for 'Pierre Moreau', a digital transformation consultant based in Nantes. Professional, trust-building design. Sections: hero with professional photo and tagline 'Transform Your Business', expertise areas (3 cards: Strategy, Operations, Technology), case studies (3 success stories with metrics), client testimonials, about section with credentials, and contact form with call booking CTA. Navy and teal palette.",
  },
  // ── Professional ──
  {
    name: "Law Firm",
    description: "Professional trust-building with services",
    accent: "#1E3A5F",
    category: "professional",
    prompt: "A professional website for a law firm in Paris called 'Cabinet Dupont & Associes'. Dark navy, gold accents, trust-building design. Sections: authoritative hero with firm name and tagline, practice areas (4 cards: Corporate, Real Estate, IP, Employment), about the firm (founded 1998, 25+ lawyers), team grid (4 senior partners with photos), client testimonials, and contact section with office address in Paris 8eme, phone, email. Serious, prestigious, French legal aesthetic.",
  },
  {
    name: "Fitness Studio",
    description: "High energy with classes, trainers & pricing",
    accent: "#EF4444",
    category: "professional",
    prompt: "A high-energy fitness studio called 'Pulse Fitness' in Montpellier. Bold, dynamic design with dark background and red accent. Sections: hero with gym photo and 'Start Your Journey' CTA, class schedule (yoga, HIIT, boxing, pilates), trainer profiles (3 trainers with photos), membership pricing (3 tiers: Basic \u20AC29/mo, Premium \u20AC49/mo, VIP \u20AC79/mo), testimonials from members, and contact with address and opening hours. Motivating and modern.",
  },
  // ── Events ──
  {
    name: "Wedding Venue",
    description: "Elegant romantic with gallery & booking",
    accent: "#D4A574",
    category: "events",
    prompt: "An elegant wedding venue called 'Chateau de Lumieres' in Provence, France. Romantic, luxurious design with soft gold and ivory tones, serif headings. Sections: full-width hero with chateau photography, our story (18th century estate), venue spaces gallery (ceremony, reception, gardens), services & packages (3 tiers: Intimate \u20AC8,000, Classic \u20AC15,000, Grand \u20AC25,000), testimonials from couples, and contact/booking form with address in Provence. Dreamy, premium, sophisticated.",
  },
  {
    name: "Boutique Hotel",
    description: "Luxury hospitality with rooms & amenities",
    accent: "#B8860B",
    category: "events",
    prompt: "A boutique hotel called 'Hotel Saint-Germain' in Paris 6eme. Luxury hospitality design with cream, gold, and deep green. Sections: cinematic hero with hotel facade, room types (3 cards: Classique \u20AC180/nuit, Superieure \u20AC260/nuit, Suite \u20AC420/nuit), amenities (spa, restaurant, bar, concierge), guest testimonials, gallery of interiors, and booking section with address and contact. Parisian elegance, refined luxury.",
  },
  {
    name: "Online Store",
    description: "Product showcase with features & hero",
    accent: "#10B981",
    category: "events",
    prompt: "An e-commerce landing page for 'Maison Verte', a sustainable home goods brand in Strasbourg. Clean modern design with green accent. Sections: hero with product lifestyle photo and shop CTA, featured products grid (4 products with photos, names, prices in EUR), brand values (3 icons: sustainable, handmade, local), customer reviews, about section (founded by artisans in Alsace), and newsletter signup with footer. Fresh, eco-conscious, premium.",
  },
];

export default function Generate() {
  const wc = useWebContainer();

  /* Boot WebContainers eagerly on page mount */
  useEffect(() => {
    wc.bootEagerly();
  }, [wc.bootEagerly]);

  /* Write files to WC as they stream in */
  const handleFileChunk = useCallback(
    (path: string, content: string) => {
      wc.writeFile(path, content);
    },
    [wc.writeFile]
  );

  const { state, generate, iterate, approvePlan, reset } = useSSE(handleFileChunk);
  const [showCode, setShowCode] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatMode, setChatMode] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(
    !localStorage.getItem("arkhos_plan_shown")
  );
  const [remainingToday] = useState(3);

  useEffect(() => {
    if (state.status === "complete") setShowSuccessBanner(true);
  }, [state.status]);

  const handleGenerate = useCallback(
    (prompt: string, locale: string) => {
      setShowCode(false);
      setMessages([]);
      setChatMode(false);
      generate(prompt, locale);
    },
    [generate]
  );

  /* Switch to chat mode when generation completes */
  useEffect(() => {
    if (state.status === "complete" && state.originalPrompt && !chatMode) {
      setChatMode(true);
      setMessages((prev) => {
        if (prev.length === 0) {
          return [
            { id: "gen-user", role: "user", content: state.originalPrompt },
            {
              id: "gen-system",
              role: "system",
              content: `Generated \u00b7 5 agents \u00b7 ${state.totalDurationS}s`,
              costEur: state.totalCostEur,
              durationS: state.totalDurationS,
            },
          ];
        }
        return [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "system",
            content: "Updated",
            costEur: state.totalCostEur,
            durationS: state.totalDurationS,
          },
        ];
      });
    }
  }, [
    state.status,
    state.originalPrompt,
    state.totalCostEur,
    state.totalDurationS,
    chatMode,
  ]);

  const handleIterate = useCallback(
    (modification: string) => {
      if (!state.generationId) return;
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "user", content: modification },
      ]);
      iterate(state.generationId, modification);
    },
    [state.generationId, iterate]
  );

  const handleNewSite = useCallback(() => {
    reset();
    setMessages([]);
    setChatMode(false);
    setShowCode(false);
  }, [reset]);

  const handleApprovePlan = useCallback(() => {
    if (state.generationId) {
      approvePlan(state.generationId);
    }
  }, [state.generationId, approvePlan]);

  const handleDismissError = useCallback(() => {
    handleNewSite();
  }, [handleNewSite]);

  /* ── Left panel mode ── */
  const renderLeftPanel = () => {
    const isRunning = state.status === "running" || state.status === "starting";

    // Plan review mode
    if (state.planReady && state.plan) {
      // Trigger plan modal on first plan view
      if (!localStorage.getItem("arkhos_plan_shown")) {
        // Use setTimeout to avoid setState during render
        setTimeout(() => setShowPlanModal(true), 0);
      }

      return (
        <motion.div
          key="plan"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="flex flex-col h-full overflow-y-auto gap-4"
        >
          <Banner
            variant="info"
            title="AI Plan ready"
            description="Review the plan below, then approve or start over."
            show={true}
            onHide={() => {}}
          />
          <PlanReview
            plan={state.plan}
            onApprove={handleApprovePlan}
            onEdit={handleNewSite}
          />
        </motion.div>
      );
    }

    // Chat mode (after generation completes)
    if (chatMode) {
      return (
        <motion.div
          key="chat"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="flex flex-col h-full"
        >
          <IterationChat
            messages={messages}
            originalPrompt={state.originalPrompt}
            status={state.status}
            onIterate={handleIterate}
            onNewSite={handleNewSite}
          />
        </motion.div>
      );
    }

    // Prompt mode (default)
    return (
      <motion.div
        key="prompt"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="flex flex-col gap-5 overflow-y-auto"
      >
        <div className="text-center">
          <h1
            className="text-2xl md:text-3xl font-bold mb-1.5"
            style={{ color: "var(--frost)", fontFamily: "var(--font-display)" }}
          >
            What will you{" "}
            <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent italic">
              build
            </span>
            ?
          </h1>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
          >
            Describe your website and watch 5 AI agents build it live.
          </p>
        </div>

        <ChatInput
          onSend={(msg) => handleGenerate(msg, "en")}
          placeholder="A landing page for a French bakery in Paris..."
          disabled={isRunning}
        />

        {/* ShiningText during generation */}
        <AnimatePresence>
          {isRunning && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center gap-2"
            >
              <div
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: "var(--ember)" }}
              />
              <ShiningText text="agents working..." />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Template grid */}
        <div className="space-y-3">
          <p
            className="text-[10px] uppercase tracking-wider text-[var(--muted)]"
            style={{ fontFamily: "var(--font-code)" }}
          >
            Or start from a template
          </p>
          <div className="grid grid-cols-2 gap-2 max-h-[320px] overflow-y-auto pr-1">
            {TEMPLATES.map((t) => (
              <button
                key={t.name}
                onClick={() => handleGenerate(t.prompt, "en")}
                disabled={isRunning}
                className="text-left px-3 py-3 rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] group/tpl"
                style={{
                  background: "rgba(13, 27, 42, 0.5)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 transition-shadow duration-300 group-hover/tpl:shadow-[0_0_8px]"
                    style={{ backgroundColor: t.accent, boxShadow: `0 0 0px ${t.accent}` }}
                  />
                  <div className="min-w-0">
                    <span className="text-[13px] text-[var(--frost)] font-medium block leading-tight">
                      {t.name}
                    </span>
                    <span className="text-[10px] text-[var(--muted)] block leading-snug mt-0.5 line-clamp-1">
                      {t.description}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="relative flex flex-col h-screen bg-[#020408] overflow-hidden">
      {/* Success Banner */}
      <Banner
        variant="success"
        title="Your site is ready"
        description={`5 agents \u00b7 ${state.totalCostEur ? `\u20AC${state.totalCostEur.toFixed(4)}` : ""}`}
        show={showSuccessBanner}
        onHide={() => setShowSuccessBanner(false)}
        closable
        autoHide={8000}
      />

      <div className="relative flex flex-1 min-h-0 overflow-hidden">
        {/* Subtle top gradient */}
        <div
          className="absolute top-0 left-0 right-0 h-[200px] pointer-events-none z-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,107,53,0.03) 0%, transparent 100%)",
          }}
        />

        {state.status === "complete" && (
          <div
            className="absolute bottom-0 right-0 w-[60%] h-[120px] pointer-events-none z-0"
            style={{
              background:
                "linear-gradient(0deg, rgba(34,214,138,0.04) 0%, transparent 100%)",
            }}
          />
        )}

        {/* ── Left Panel (35%) ── */}
        <div className="relative z-10 w-full md:w-[35%] flex flex-col p-5 md:p-6 overflow-hidden">
          <AnimatePresence mode="popLayout">{renderLeftPanel()}</AnimatePresence>
        </div>

        {/* Gradient Divider */}
        <div
          className="hidden md:block w-px flex-shrink-0"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, var(--border) 20%, var(--border) 80%, transparent 100%)",
          }}
        />

        {/* ── Right Panel (65%) ── */}
        <div className="hidden md:flex relative z-10 md:flex-1 flex-col p-5 md:p-6 overflow-hidden">
          {/* Pipeline Strip — above preview */}
          <PipelineStrip
            agents={state.agents}
            status={state.status}
            totalCostEur={state.totalCostEur}
            totalDurationS={state.totalDurationS}
            timeoutWarning={state.timeoutWarning}
            remainingToday={remainingToday}
          />
          <div className="h-3 flex-shrink-0" />
          {/* Error Banner — replaces preview when error */}
          {state.status === "error" ? (
            <ErrorBanner
              error={state.error || "Unknown error"}
              errorType={state.errorType}
              onRetry={handleNewSite}
              onDismiss={handleDismissError}
            />
          ) : (
            <>
              {/* Preview Pane — flex-1 */}
              <PreviewPane
                status={state.status}
                previewHtml={state.previewHtml}
                finalHtml={state.finalHtml}
                projectFiles={state.projectFiles}
                generationId={state.generationId}
                wcStatus={wc.status}
                wcPreviewUrl={wc.previewUrl}
                wcBuildError={wc.buildError}
                onToggleCode={() => setShowCode((v) => !v)}
                showCode={showCode}
              />

              {/* Code Drawer below preview */}
              <CodeDrawer
                files={state.projectFiles}
                show={showCode}
                onClose={() => setShowCode(false)}
              />
            </>
          )}
        </div>
      </div>

      {/* StatusBar at bottom */}
      <StatusBar
        remainingToday={remainingToday}
        fileCount={state.projectFiles ? Object.keys(state.projectFiles).length : null}
        lineCount={
          state.projectFiles
            ? Object.values(state.projectFiles).reduce(
                (sum, c) => sum + c.split("\n").length,
                0
              )
            : null
        }
        totalCostEur={state.totalCostEur}
        totalDurationS={state.totalDurationS}
        isComplete={state.status === "complete"}
      />

      {/* BasicModal for plan explanation (shows once) */}
      <BasicModal
        isOpen={showPlanModal}
        onClose={() => {
          setShowPlanModal(false);
          localStorage.setItem("arkhos_plan_shown", "true");
        }}
        title="Your AI Planner has reviewed your request"
      >
        <p className="text-sm text-[#7B8FA3] mb-4">
          Check the plan below. If it looks right, click &quot;Build this&quot; to start
          generating.
        </p>
        <button
          onClick={() => {
            setShowPlanModal(false);
            localStorage.setItem("arkhos_plan_shown", "true");
          }}
          className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg text-sm hover:bg-[#FF6B35]/90"
        >
          Got it
        </button>
      </BasicModal>
    </div>
  );
}
