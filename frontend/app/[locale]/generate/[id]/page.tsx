"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  Code2,
  Eye,
  Download,
  Cpu,
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
import { cn } from "@/lib/utils";

export default function GenerationWorkspacePage() {
  const params = useParams<{ id: string }>();
  const generationId = params.id;
  const t = useTranslations("generate");

  const [files, setFiles] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [activeFile, setActiveFile] = useState<string | null>(null);

  const handleFileChunk = useCallback((path: string, content: string) => {
    setFiles((prev) => ({ ...prev, [path]: content }));
  }, []);

  const { state, connectTo, approvePlan, reset: resetSSE } = useSSE(handleFileChunk);
  const { state: wcState, mountAndServe } = useWebContainer();
  const { state: iterateState, iterate } = useIterate(handleFileChunk);

  const wcTriggered = useRef(false);
  const isComplete = state.status === "complete";
  const isWorking = ["starting", "planning", "building"].includes(state.status);

  useEffect(() => {
    if (generationId && state.status === "idle") {
      connectTo(generationId);
    }
  }, [generationId, state.status, connectTo]);

  const fileList = useMemo(() => Object.keys(files).sort(), [files]);

  useEffect(() => {
    if (!activeFile && fileList.length > 0) {
      setActiveFile(fileList[0]);
    }
  }, [activeFile, fileList]);

  useEffect(() => {
    if (isComplete && Object.keys(files).length > 0 && !wcTriggered.current && wcState.status === "idle") {
      wcTriggered.current = true;
      mountAndServe(files);
    }
  }, [isComplete, files, wcState.status, mountAndServe]);

  const handleIterate = useCallback(
    (modification: string) => {
      if (!generationId) return;
      iterate(generationId, modification);
    },
    [generationId, iterate],
  );

  const handleRetry = useCallback(() => {
    resetSSE();
    if (generationId) connectTo(generationId);
  }, [resetSSE, generationId, connectTo]);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  return (
    <div data-workspace className="h-screen flex flex-col overflow-hidden bg-[var(--void)]">
      {/* ═══ Main area ═══ */}
      <div className="flex-1 flex min-h-0">
        {/* ── Left sidebar: pipeline ── */}
        <aside className="w-64 shrink-0 flex flex-col border-r border-[var(--border)] bg-[var(--deep)]">
          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[var(--border)]">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-6 h-6 rounded-md bg-[var(--brand)] flex items-center justify-center">
                <Cpu className="w-3 h-3 text-white" />
              </div>
              <span className="font-[var(--font-display)] text-sm font-bold text-[var(--text-primary)] tracking-tight">
                Arkhos
              </span>
            </Link>
            <div className="flex-1" />
            <Link
              href="/generate"
              aria-label="Back"
              className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-[var(--surface)] focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none transition-colors duration-150 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            </Link>
          </div>

          {/* Generation ID */}
          <div className="px-4 py-2 border-b border-[var(--border)]">
            <p className="text-[10px] font-[var(--font-code)] text-[var(--text-muted)] truncate">{generationId}</p>
          </div>

          {/* Pipeline agents */}
          <div className="flex-1 overflow-y-auto p-3">
            <PipelinePanel
              agents={state.agents}
              currentAgent={state.currentAgent}
              totalCostEur={state.totalCostEur}
              status={state.status}
            />
          </div>

          {/* Plan review (appears when plan is ready) */}
          {state.status === "plan_ready" && state.plan && (
            <div className="border-t border-[var(--border)] p-3">
              <PlanReview
                plan={state.plan}
                onApprove={() => state.generationId && approvePlan(state.generationId)}
              />
            </div>
          )}
        </aside>

        {/* ── Center: preview / code ── */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Toolbar */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--border)] bg-[var(--deep)]">
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

            <div className="flex-1" />

            {isComplete && (
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

          {/* Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {activeTab === "preview" ? (
              <div className="flex-1 bg-[var(--void)] flex items-center justify-center relative">
                {/* Live preview from WebContainer */}
                {wcState.url ? (
                  <iframe src={wcState.url} className="w-full h-full border-0" sandbox="allow-scripts" title="Live preview" />
                ) : state.previewHtml ? (
                  <iframe srcDoc={state.previewHtml} className="w-full h-full border-0" sandbox="allow-scripts" title="Site preview" />
                ) : state.status === "error" ? (
                  <ErrorPanel error={state.error ?? ""} errorType={state.errorType} onRetry={handleRetry} />
                ) : isWorking || state.status === "plan_ready" ? (
                  /* Skeleton preview — structured, not void */
                  <div className="w-full h-full p-6 flex flex-col gap-4">
                    {/* Fake browser chrome */}
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--deep)] overflow-hidden flex-1 flex flex-col">
                      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-[var(--border)] bg-[var(--surface)]/30">
                        <span className="w-2.5 h-2.5 rounded-full bg-[var(--text-muted)]/20" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[var(--text-muted)]/20" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[var(--text-muted)]/20" />
                        <div className="ml-3 flex-1 h-5 rounded-md bg-[var(--surface)]/50 max-w-xs" />
                      </div>
                      <div className="flex-1 p-8 flex flex-col gap-4">
                        {/* Skeleton page structure */}
                        <div className="h-4 w-24 rounded bg-[var(--surface)]/40 animate-pulse" />
                        <div className="h-8 w-72 rounded bg-[var(--surface)]/30 animate-pulse" />
                        <div className="h-3 w-96 rounded bg-[var(--surface)]/20 animate-pulse" />
                        <div className="h-3 w-80 rounded bg-[var(--surface)]/20 animate-pulse" />
                        <div className="mt-4 grid grid-cols-3 gap-4">
                          <div className="h-32 rounded-lg bg-[var(--surface)]/20 animate-pulse" />
                          <div className="h-32 rounded-lg bg-[var(--surface)]/15 animate-pulse" style={{ animationDelay: "150ms" }} />
                          <div className="h-32 rounded-lg bg-[var(--surface)]/10 animate-pulse" style={{ animationDelay: "300ms" }} />
                        </div>
                        <div className="mt-auto flex items-center gap-3">
                          <div className="w-8 h-8 border-2 border-[var(--brand)]/30 border-t-[var(--brand)] rounded-full animate-spin" />
                          <div>
                            <p className="text-sm text-[var(--text-secondary)]">
                              {state.currentAgent
                                ? t("workspace.agentWorking", { agent: state.currentAgent })
                                : t("workspace.starting")}
                            </p>
                            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                              {state.agents.filter((a) => a.status === "complete").length} of {state.agents.length || "..."} agents complete
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : wcState.status === "booting" || wcState.status === "installing" || wcState.status === "running" ? (
                  <div className="flex flex-col items-center gap-3 px-6 text-center">
                    <div className="w-8 h-8 border-2 border-[var(--brand)]/30 border-t-[var(--brand)] rounded-full animate-spin" />
                    <p className="text-sm text-[var(--text-muted)]">
                      {wcState.status === "booting" ? t("workspace.booting") :
                       wcState.status === "installing" ? t("workspace.installing") :
                       t("workspace.starting")}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-[var(--text-muted)]">{t("workspace.previewPlaceholder")}</p>
                )}
              </div>
            ) : (
              <div className="flex flex-1 overflow-hidden">
                <div className="w-48 shrink-0 border-r border-[var(--border)] bg-[var(--void)] overflow-y-auto">
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
        </main>

        {/* ── Right: Chat — only visible after generation completes ── */}
        {isComplete && (
          <aside className="w-80 shrink-0 flex flex-col border-l border-[var(--border)] bg-[var(--deep)]">
            <IterationChat
              state={iterateState}
              onSend={handleIterate}
              disabled={false}
            />
          </aside>
        )}
      </div>

      {/* ═══ Status bar — always at bottom ═══ */}
      <StatusBar state={state} />
    </div>
  );
}
