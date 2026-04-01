import { useState, useEffect, useCallback } from "react";
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

        {/* Pipeline progress during generation */}
        <AnimatePresence>
          {isRunning && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex-1 min-h-0"
            >
              <PipelinePlan agents={state.agents} status={state.status} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Templates now live in the sidebar */}
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
    </div>
  );
}
