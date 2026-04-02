"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  Code2,
  Eye,
  Download,
  MessageSquare,
  PanelRightClose,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useSSE } from "@/hooks/use-sse";
import { useWebContainer } from "@/hooks/use-web-container";
import { useIterate } from "@/hooks/use-iterate";
import { PipelinePanel } from "@/components/generate/pipeline-panel";
import { PlanReview } from "@/components/generate/plan-review";
import { StatusBar } from "@/components/generate/status-bar";
import { CodeBlock } from "@/components/generate/code-block";
import { FileTree } from "@/components/generate/file-tree";
import { ErrorPanel } from "@/components/generate/error-panel";
import { IterationChat } from "@/components/generate/iteration-chat";
import { Breadcrumbs } from "@/components/generate/breadcrumbs";
import { cn } from "@/lib/utils";

export default function GenerationWorkspacePage() {
  const params = useParams<{ id: string }>();
  const generationId = params.id;
  const t = useTranslations("generate");

  const [files, setFiles] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const handleFileChunk = useCallback((path: string, content: string) => {
    setFiles((prev) => ({ ...prev, [path]: content }));
  }, []);

  const { state, connectTo, approvePlan, reset: resetSSE } = useSSE(handleFileChunk);
  const { state: wcState, mountAndServe } = useWebContainer();
  const { state: iterateState, iterate } = useIterate(handleFileChunk);

  const wcTriggered = useRef(false);

  // Connect to generation stream on mount
  useEffect(() => {
    if (generationId && state.status === "idle") {
      connectTo(generationId);
    }
  }, [generationId, state.status, connectTo]);

  const fileList = useMemo(() => Object.keys(files).sort(), [files]);

  // Auto-select first file
  useEffect(() => {
    if (!activeFile && fileList.length > 0) {
      setActiveFile(fileList[0]);
    }
  }, [activeFile, fileList]);

  // Boot WebContainer when generation completes
  useEffect(() => {
    if (
      state.status === "complete" &&
      Object.keys(files).length > 0 &&
      !wcTriggered.current &&
      wcState.status === "idle"
    ) {
      wcTriggered.current = true;
      mountAndServe(files);
    }
  }, [state.status, files, wcState.status, mountAndServe]);

  // Auto-open chat when generation completes
  useEffect(() => {
    if (state.status === "complete") {
      setChatOpen(true);
    }
  }, [state.status]);

  const handleIterate = useCallback(
    (modification: string) => {
      if (!generationId) return;
      iterate(generationId, modification);
    },
    [generationId, iterate],
  );

  const handleRetry = useCallback(() => {
    resetSSE();
    if (generationId) {
      connectTo(generationId);
    }
  }, [resetSSE, generationId, connectTo]);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  return (
    <div data-workspace className="min-h-[calc(100vh-5rem)] flex flex-col px-4 pb-4">
      <div className="mx-auto w-full max-w-[1600px] flex-1 flex flex-col gap-3">
        {/* ── Top bar ── */}
        <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--deep)] px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/generate"
              aria-label="Back"
              className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-[var(--surface)] focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none transition-colors duration-150 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[var(--text-muted)]" />
            </Link>
            <div className="flex flex-col gap-0.5">
              <Breadcrumbs generationId={generationId} />
              <p className="text-sm font-medium text-[var(--text-primary)]">{t("title")}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switcher */}
            <div role="tablist" className="flex items-center gap-0.5 rounded-lg border border-[var(--border)] p-0.5 bg-[var(--void)]">
              {(["preview", "code"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none",
                    activeTab === tab
                      ? "bg-[var(--surface)] text-[var(--text-primary)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
                  )}
                >
                  {tab === "preview" ? <Eye className="w-3 h-3" /> : <Code2 className="w-3 h-3" />}
                  {t(`tabs.${tab}`)}
                </button>
              ))}
            </div>

            {/* Chat toggle */}
            <button
              type="button"
              onClick={() => setChatOpen((p) => !p)}
              aria-label="Toggle iteration chat"
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none",
                chatOpen
                  ? "bg-[var(--brand)]/10 text-[var(--brand)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface)]",
              )}
            >
              {chatOpen ? <PanelRightClose className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
            </button>

            {/* Download */}
            {state.status === "complete" && (
              <a
                href={`${apiBase}/api/download/${generationId}`}
                aria-label={t("actions.download")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--brand)] text-white hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none transition-all duration-150 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                {t("actions.download")}
              </a>
            )}
          </div>
        </div>

        {/* ── Main grid ── */}
        <div className={cn(
          "grid flex-1 gap-3",
          chatOpen
            ? "lg:grid-cols-[280px_minmax(0,1fr)_320px]"
            : "lg:grid-cols-[280px_minmax(0,1fr)]",
        )}>
          {/* Left: Pipeline + Plan */}
          <aside className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] overflow-hidden flex flex-col max-h-64 lg:max-h-none">
            <div className="flex-1 overflow-y-auto p-4">
              <PipelinePanel
                agents={state.agents}
                currentAgent={state.currentAgent}
                totalCostEur={state.totalCostEur}
              />
            </div>

            {state.status === "plan_ready" && state.plan && (
              <div className="border-t border-[var(--border)] p-4">
                <PlanReview
                  plan={state.plan}
                  onApprove={() => state.generationId && approvePlan(state.generationId)}
                />
              </div>
            )}
          </aside>

          {/* Center: Preview / Code */}
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] overflow-hidden flex flex-col min-h-[36rem]">
            <div className="flex-1 flex flex-col overflow-hidden">
              {activeTab === "preview" ? (
                <div className="flex-1 bg-[var(--void)] flex items-center justify-center">
                  {wcState.url ? (
                    <iframe
                      src={wcState.url}
                      className="w-full h-full border-0"
                      sandbox="allow-scripts"
                      title="Live preview"
                    />
                  ) : state.previewHtml ? (
                    <iframe
                      srcDoc={state.previewHtml}
                      className="w-full h-full border-0"
                      sandbox="allow-scripts"
                      title="Site preview"
                    />
                  ) : state.status === "error" ? (
                    <ErrorPanel
                      error={state.error ?? ""}
                      errorType={state.errorType}
                      onRetry={handleRetry}
                    />
                  ) : wcState.status === "booting" || wcState.status === "installing" || wcState.status === "running" ? (
                    <div className="flex flex-col items-center gap-3 px-6 text-center">
                      <div className="w-8 h-8 border-2 border-[var(--brand)]/30 border-t-[var(--brand)] rounded-full animate-spin" />
                      <p className="text-sm text-[var(--text-muted)]">
                        {wcState.status === "booting" ? t("workspace.booting") :
                         wcState.status === "installing" ? t("workspace.installing") :
                         t("workspace.starting")}
                      </p>
                    </div>
                  ) : state.status === "building" || state.status === "planning" || state.status === "starting" ? (
                    <div className="flex flex-col items-center gap-3 px-6 text-center">
                      <div className="w-8 h-8 border-2 border-[var(--brand)]/30 border-t-[var(--brand)] rounded-full animate-spin" />
                      <p className="text-sm text-[var(--text-muted)]">
                        {state.currentAgent ? t("workspace.agentWorking", { agent: state.currentAgent }) : t("workspace.starting")}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--text-muted)]">{t("workspace.previewPlaceholder")}</p>
                  )}
                </div>
              ) : (
                <div className="flex flex-1 overflow-hidden">
                  <div className="w-44 lg:w-56 shrink-0 border-r border-[var(--border)] bg-[var(--void)] overflow-y-auto">
                    <div className="px-2 py-2">
                      <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider px-2 py-1.5">
                        {t("workspace.files", { count: fileList.length })}
                      </p>
                    </div>
                    <FileTree files={fileList} activeFile={activeFile} onSelect={setActiveFile} />
                  </div>

                  <div className="flex-1 overflow-auto bg-[var(--void)]">
                    {activeFile && files[activeFile] ? (
                      <CodeBlock code={files[activeFile]} filename={activeFile} />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-sm text-[var(--text-muted)]">{t("workspace.selectFile")}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <StatusBar state={state} />
          </section>

          {/* Right: Iteration chat */}
          {chatOpen && (
            <aside className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] overflow-hidden flex flex-col h-80 lg:h-auto lg:min-h-[36rem]">
              <IterationChat
                state={iterateState}
                onSend={handleIterate}
                disabled={state.status !== "complete"}
              />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
