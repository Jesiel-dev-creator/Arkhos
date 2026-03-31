import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSSE } from "@/hooks/useSSE";
import type { ChatMessage } from "@/hooks/useSSE";
import PromptInput from "@/components/PromptInput";
import PipelineStrip from "@/components/PipelineStrip";
import PreviewPane from "@/components/PreviewPane";
import CodeView from "@/components/CodeView";
import IterationChat from "@/components/IterationChat";
import PlanReview from "@/components/PlanReview";
import ErrorBanner from "@/components/ErrorBanner";

export default function Generate() {
  const { state, generate, iterate, approvePlan, reset } = useSSE();
  const [showCode, setShowCode] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatMode, setChatMode] = useState(false);

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
              content: `Generated · 4 agents · ${state.totalDurationS}s`,
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
    // Plan review mode
    if (state.planReady && state.plan) {
      return (
        <motion.div
          key="plan"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="flex flex-col h-full overflow-y-auto"
        >
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
        <div>
          <h1 className="text-2xl md:text-3xl text-[var(--frost)] mb-1.5">
            What will you build?
          </h1>
          <p
            className="text-sm text-[var(--muted)] leading-relaxed"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Describe your website and watch 4 AI agents build it live.
          </p>
        </div>
        <PromptInput onSubmit={handleGenerate} status={state.status} />
      </motion.div>
    );
  };

  return (
    <div className="relative flex h-[calc(100vh-5rem)] overflow-hidden">
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
        {/* Pipeline Strip */}
        <PipelineStrip
          agents={state.agents}
          status={state.status}
          totalCostEur={state.totalCostEur}
          totalDurationS={state.totalDurationS}
          timeoutWarning={state.timeoutWarning}
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
            {/* Preview Pane — DOMINANT */}
            <PreviewPane
              status={state.status}
              previewHtml={state.previewHtml}
              finalHtml={state.finalHtml}
              projectFiles={state.projectFiles}
              generationId={state.generationId}
              onToggleCode={() => setShowCode((v) => !v)}
              showCode={showCode}
            />

            {/* Code View */}
            <AnimatePresence>
              {showCode && state.finalHtml && (
                <CodeView html={state.finalHtml} />
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}
