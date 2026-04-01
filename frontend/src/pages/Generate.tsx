import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSSE } from "@/hooks/useSSE";
import type { ChatMessage } from "@/hooks/useSSE";
import { useWebContainer } from "@/hooks/useWebContainer";
import { ChatInput } from "@/components/ui/bolt-style-chat";
import { Banner } from "@/components/ui/banner";
import BasicModal from "@/components/ui/modal";
import { SessionNavBar } from "@/components/ui/app-sidebar";
import PipelinePlan from "@/components/PipelinePlan";
// PipelineStrip removed — replaced by PipelinePlan in left panel
import PreviewPane from "@/components/PreviewPane";
import CodeDrawer from "@/components/CodeDrawer";
import StatusBar from "@/components/StatusBar";
import IterationChat from "@/components/IterationChat";
import PlanReview from "@/components/PlanReview";
import ErrorBanner from "@/components/ErrorBanner";

/* Template name → prompt mapping */
const TEMPLATE_PROMPTS: Record<string, string> = {
  "French Bakery": "A landing page for a French bakery in Paris with warm earth tones, menu, about section, and contact",
  "Italian Restaurant": "An Italian restaurant in Bordeaux with warm elegance, menu, reservations, and gallery",
  "Coffee Shop": "A modern coffee shop website with cozy earth tones, menu, locations, and online ordering",
  "SaaS Landing": "A dark SaaS landing page for a project management tool with pricing, features, and CTA",
  "B2B SaaS": "A B2B SaaS landing page with enterprise pricing, social proof, and feature comparison",
  "Startup Landing": "A bold startup landing page with hero section, features grid, team section, and waitlist CTA",
  "Dev Portfolio": "A minimal developer portfolio with dark mode, projects grid, about section, and contact",
  "Photography": "A photography portfolio with full-screen gallery, about section, and booking form",
  "Creative Agency": "A bold creative agency website with asymmetric design, case studies, team, and contact",
  "Consultant": "A professional consultant website with services, testimonials, booking, and about section",
  "Law Firm": "A law firm website with practice areas, attorney profiles, and contact form",
  "Fitness Studio": "A fitness studio website with class schedule, trainer profiles, and membership pricing",
  "Wedding Venue": "A wedding venue website with gallery, packages, availability calendar, and contact",
  "Boutique Hotel": "A boutique hotel website with rooms, amenities, booking, and local attractions",
  "Online Store": "An online store landing page with featured products, categories, and shopping cart",
};

const LOCALES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
];

const TEMPLATE_CHIPS = [
  { name: "French Bakery", prompt: TEMPLATE_PROMPTS["French Bakery"], color: "#FFB020" },
  { name: "SaaS Landing", prompt: TEMPLATE_PROMPTS["SaaS Landing"], color: "#00D4EE" },
  { name: "Dev Portfolio", prompt: TEMPLATE_PROMPTS["Dev Portfolio"], color: "#DCE9F5" },
  { name: "Restaurant", prompt: TEMPLATE_PROMPTS["Italian Restaurant"], color: "#FF6B35" },
  { name: "Creative Agency", prompt: TEMPLATE_PROMPTS["Creative Agency"], color: "#E040FB" },
  { name: "Online Store", prompt: TEMPLATE_PROMPTS["Online Store"], color: "#10B981" },
];

export default function Generate() {
  const wc = useWebContainer();
  const [searchParams, setSearchParams] = useSearchParams();
  const hasProcessedParams = useRef(false);

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
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [remainingToday] = useState(3);
  const [editingPrompt, setEditingPrompt] = useState("");
  const [locale, setLocale] = useState("en");
  const [profile, setProfile] = useState<"budget" | "balanced" | "quality">("balanced");

  useEffect(() => {
    if (state.status === "complete") setShowSuccessBanner(true);
  }, [state.status]);

  const handleGenerate = useCallback(
    (prompt: string, locale: string) => {
      setShowCode(false);
      setMessages([]);
      setChatMode(false);
      generate(prompt, locale, profile);
    },
    [generate, profile]
  );

  /* Auto-fill from ?prompt= or ?template= URL params */
  useEffect(() => {
    if (hasProcessedParams.current) return;
    const prompt = searchParams.get("prompt");
    const template = searchParams.get("template");
    const resolved = prompt || (template ? TEMPLATE_PROMPTS[template] : null);
    if (resolved) {
      hasProcessedParams.current = true;
      // Clear params from URL so refresh doesn't re-trigger
      setSearchParams({}, { replace: true });
      handleGenerate(resolved, locale);
    }
  }, [searchParams, setSearchParams, handleGenerate]);

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
    setEditingPrompt("");
  }, [reset]);

  const handleEditPrompt = useCallback(() => {
    const prompt = state.originalPrompt || "";
    reset();
    setMessages([]);
    setChatMode(false);
    setShowCode(false);
    setEditingPrompt(prompt);
  }, [state.originalPrompt, reset]);

  const handleApprovePlan = useCallback(() => {
    if (state.generationId) {
      approvePlan(state.generationId);
    }
  }, [state.generationId, approvePlan]);

  const handleRetryGeneration = useCallback(() => {
    const prompt = state.originalPrompt || "";
    reset();
    setMessages([]);
    setChatMode(false);
    setShowCode(false);
    setEditingPrompt("");
    if (prompt) {
      handleGenerate(prompt, locale);
    }
  }, [state.originalPrompt, reset, handleGenerate]);

  const handleDismissError = useCallback(() => {
    handleEditPrompt();
  }, [handleEditPrompt]);

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
            onEdit={handleEditPrompt}
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

    // Pipeline running — show user prompt as message + pipeline progress
    if (isRunning) {
      return (
        <motion.div
          key="running"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="flex flex-col gap-4 h-full overflow-y-auto"
        >
          {/* User's prompt as a chat bubble */}
          {state.originalPrompt && (
            <div className="flex justify-end">
              <div
                className="max-w-[85%] rounded-2xl rounded-br-md px-4 py-3 text-sm leading-relaxed"
                style={{
                  background: "rgba(255, 107, 53, 0.1)",
                  border: "1px solid rgba(255, 107, 53, 0.2)",
                  color: "var(--frost)",
                  fontFamily: "var(--font-body)",
                }}
              >
                {state.originalPrompt}
              </div>
            </div>
          )}

          {/* Pipeline progress */}
          <div className="flex-1 min-h-0">
            <PipelinePlan agents={state.agents} status={state.status} />
          </div>
        </motion.div>
      );
    }

    // Prompt mode (idle — no generation running)
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
            Describe your website in plain language. 5 AI agents will design, build, and review it in under 2 minutes.
          </p>
        </div>

        <ChatInput
          key={editingPrompt}
          onSend={(msg) => { setEditingPrompt(""); handleGenerate(msg, locale); }}
          placeholder="A landing page for a French bakery in Paris..."
          disabled={false}
          defaultValue={editingPrompt}
        />

        {/* Locale selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "var(--text-muted)", marginRight: "0.25rem" }}>
            Language:
          </span>
          {LOCALES.map((l) => (
            <button
              key={l.code}
              onClick={() => setLocale(l.code)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                padding: "0.25rem 0.5rem",
                borderRadius: "6px",
                fontSize: "11px",
                fontFamily: "var(--font-body)",
                color: locale === l.code ? "var(--text-primary)" : "var(--text-muted)",
                background: locale === l.code ? "rgba(255,255,255,0.08)" : "transparent",
                border: locale === l.code ? "1px solid var(--border-strong)" : "1px solid transparent",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: "13px" }}>{l.flag}</span>
              {l.code.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Fleet profile toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "var(--text-muted)", marginRight: "0.25rem" }}>
            Quality:
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "2px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", padding: "2px", background: "#0A0D16" }}>
            {([
              { key: "budget" as const, icon: "\uD83D\uDCB0", label: "Budget" },
              { key: "balanced" as const, icon: "\u26A1", label: "Balanced" },
              { key: "quality" as const, icon: "\uD83C\uDFC6", label: "Quality" },
            ]).map((p) => (
              <button
                key={p.key}
                onClick={() => setProfile(p.key)}
                style={{
                  padding: "0.25rem 0.625rem",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontFamily: "var(--font-body)",
                  fontWeight: 500,
                  color: profile === p.key ? "#fff" : "#94A3B8",
                  background: profile === p.key ? "#FF5D3A" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  boxShadow: profile === p.key ? "0 1px 3px rgba(255,93,58,0.3)" : "none",
                }}
              >
                {p.icon} {p.label}
              </button>
            ))}
          </div>
          <span style={{ fontFamily: "var(--font-body)", fontSize: "10px", color: "#475569", marginLeft: "0.25rem" }}>
            {profile === "budget" && "~\u20AC0.004 \u00B7 ~12s"}
            {profile === "balanced" && "~\u20AC0.02 \u00B7 ~20s"}
            {profile === "quality" && "~\u20AC0.08 \u00B7 ~35s"}
          </span>
        </div>

        <div style={{ marginTop: "0.75rem" }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "var(--text-muted)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Or start from a template
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
            {TEMPLATE_CHIPS.map((t) => (
              <button
                key={t.name}
                onClick={() => handleGenerate(t.prompt, locale)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  padding: "0.375rem 0.75rem",
                  borderRadius: "9999px",
                  fontSize: "12px",
                  fontFamily: "var(--font-body)",
                  color: "var(--text-secondary)",
                  background: "transparent",
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = t.color;
                  e.currentTarget.style.color = t.color;
                  e.currentTarget.style.background = `color-mix(in srgb, ${t.color} 8%, transparent)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: t.color, flexShrink: 0 }} />
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <p style={{ fontFamily: "var(--font-code)", fontSize: "10px", color: "var(--text-muted)", marginTop: "1rem", textAlign: "center" }}>
          Free tier: 3 generations/day · Under €0.01 per site · EU hosted
        </p>
      </motion.div>
    );
  };

  return (
    <div className="flex h-screen bg-[#020408] overflow-hidden">
      <SessionNavBar />
      <div className="relative flex flex-col flex-1 overflow-hidden ml-[3.05rem]">
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
          {/* Pipeline progress now in left panel via PipelinePlan */}
          {/* Error Banner — replaces preview when error */}
          {state.status === "error" ? (
            <ErrorBanner
              error={state.error || "Unknown error"}
              errorType={state.errorType}
              onRetry={handleRetryGeneration}
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

      {/* Help button */}
      <button
        onClick={() => setShowHelpModal(true)}
        style={{
          position: "fixed",
          bottom: 36,
          right: 24,
          zIndex: 30,
          width: 32,
          height: 32,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(13, 27, 42, 0.9)",
          backdropFilter: "blur(12px)",
          border: "1px solid var(--border)",
          color: "var(--text-muted)",
          cursor: "pointer",
          fontSize: "14px",
          fontFamily: "var(--font-body)",
          fontWeight: 600,
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--ember)";
          e.currentTarget.style.color = "var(--ember)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border)";
          e.currentTarget.style.color = "var(--text-muted)";
        }}
        aria-label="How it works"
      >
        ?
      </button>

      {/* StatusBar at bottom */}
      <StatusBar
        remainingToday={remainingToday}
        fileCount={state.projectFiles ? Object.keys(state.projectFiles).length : null}
        lineCount={
          state.projectFiles
            ? Object.values(state.projectFiles).reduce(
                (sum, c) => sum + (typeof c === "string" ? c.split("\n").length : 0),
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
        title="Plan Review"
      >
        <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "0.75rem" }}>
          The Planner agent has analyzed your description and created a blueprint for your website. Review the sections, style, and structure below.
        </p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "1rem" }}>
          If everything looks good, click <strong style={{ color: "var(--text-primary)" }}>Build this</strong> to start generation. You can also go back and edit your prompt.
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

      {/* Help modal — always accessible */}
      <BasicModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} title="How ArkhosAI Works" size="lg">
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            ArkhosAI uses 5 specialized AI agents to build your website from a text description. Each agent handles a different part of the process.
          </p>

          {[
            { num: "1", title: "Describe", desc: "Type what you want — a bakery site, a portfolio, a SaaS landing page. Plain language works best.", color: "var(--ember)" },
            { num: "2", title: "Plan", desc: "The Planner agent analyzes your request and creates a blueprint. You review and approve it before building starts.", color: "var(--violet)" },
            { num: "3", title: "Build", desc: "5 agents work in sequence — designing colors, planning layout, writing code, and reviewing for quality.", color: "var(--cyan)" },
            { num: "4", title: "Preview", desc: "Your site appears live in the preview panel. You can download it, view the code, or iterate with follow-up messages.", color: "var(--green)" },
          ].map((step) => (
            <div key={step.num} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
              <span style={{
                width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: 700, fontFamily: "var(--font-body)", flexShrink: 0,
                background: `color-mix(in srgb, ${step.color} 15%, transparent)`, color: step.color,
              }}>
                {step.num}
              </span>
              <div>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "2px" }}>
                  {step.title}
                </p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "0.75rem", display: "flex", gap: "1.5rem" }}>
            <div>
              <p style={{ fontFamily: "var(--font-code)", fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px" }}>Cost</p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--text-primary)" }}>{`Under \u20AC0.01/site`}</p>
            </div>
            <div>
              <p style={{ fontFamily: "var(--font-code)", fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px" }}>Time</p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--text-primary)" }}>~2 minutes</p>
            </div>
            <div>
              <p style={{ fontFamily: "var(--font-code)", fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px" }}>Free tier</p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "var(--text-primary)" }}>3/day</p>
            </div>
          </div>
        </div>
      </BasicModal>
      </div>
    </div>
  );
}
