"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Code2,
  Eye,
  Download,
  Cpu,
  Check,
  Loader2,
  Circle,
  RotateCcw,
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  Lightbulb,
  Zap,
  Send,
  Coins,
  Clock,
  Sparkles,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useSSE } from "@/hooks/use-sse";
import { useIterate } from "@/hooks/use-iterate";
import { PlanReview } from "@/components/generate/plan-review";
import { StatusBar } from "@/components/generate/status-bar";
import { CodeBlock } from "@/components/generate/code-block";
import { FileTree } from "@/components/generate/file-tree";
import { ErrorPanel } from "@/components/generate/error-panel";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/auth/auth-provider";
import { cn } from "@/lib/utils";
import type { AgentState } from "@/hooks/use-sse";

type MainView = "preview" | "code";
type PreviewDevice = "desktop" | "tablet" | "mobile";

export default function GenerationWorkspacePage() {
  const params = useParams<{ id: string }>();
  const generationId = params.id;
  const t = useTranslations("generate");
  const router = useRouter();
  const { user, loading: authLoading } = useAuthContext();

  const [files, setFiles] = useState<Record<string, string>>({});
  const [mainView, setMainView] = useState<MainView>("preview");
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("desktop");
  const [chatInput, setChatInput] = useState("");

  const handleFileChunk = useCallback((path: string, content: string) => {
    setFiles((prev) => ({ ...prev, [path]: content }));
  }, []);

  const { state, connectTo, approvePlan, reset: resetSSE } = useSSE(handleFileChunk);
  const { state: iterateState, iterate } = useIterate(handleFileChunk);

  const isComplete = state.status === "complete";
  const isBuilding = ["starting", "planning", "building", "sandbox"].includes(state.status);
  const isPlanReady = state.status === "plan_ready";
  const isIdle = state.status === "idle";
  const isError = state.status === "error";
  const isSandboxing = state.status === "sandbox";
  const sandboxReady = state.sandbox.status === "running" && state.sandbox.previewUrl;

  useEffect(() => {
    if (generationId && isIdle) connectTo(generationId);
  }, [generationId, isIdle, connectTo]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/login?next=/generate/${generationId}`);
    }
  }, [authLoading, user, generationId, router]);

  const fileList = useMemo(() => Object.keys(files).sort(), [files]);

  // Auto-select first file (derived, not effect)
  const effectiveActiveFile = activeFile ?? (fileList.length > 0 ? fileList[0] : null);

  // Auto-switch to code when files arrive without preview
  const effectiveView = (fileList.length > 0 && mainView === "preview" && !state.previewHtml && isComplete) ? "code" : mainView;

  const handleIterate = useCallback(
    (modification: string) => {
      if (!generationId) return;
      iterate(generationId, modification);
    },
    [generationId, iterate],
  );

  const handleChatSubmit = () => {
    const trimmed = chatInput.trim();
    if (!trimmed || !isComplete) return;
    handleIterate(trimmed);
    setChatInput("");
  };

  const handleRetry = useCallback(() => {
    resetSSE();
    if (generationId) connectTo(generationId);
  }, [resetSSE, generationId, connectTo]);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const completedCount = state.agents.filter((a) => a.status === "complete").length;
  const totalAgents = state.agents.length;
  const isBusy = iterateState.status === "sending" || iterateState.status === "building";

  return (
    <div data-workspace className="h-screen flex flex-col overflow-hidden bg-[var(--void)]">
      {/* ═══ Top toolbar ═══ */}
      <div className="flex items-center gap-2 h-11 px-3 border-b border-[var(--border)] bg-[var(--deep)] shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0 mr-1 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none rounded-lg px-1">
          <div className="w-6 h-6 rounded-md bg-[var(--brand)] flex items-center justify-center">
            <Cpu className="w-3 h-3 text-white" />
          </div>
          <span className="font-[var(--font-display)] text-sm font-bold text-[var(--text-primary)] tracking-tight hidden sm:inline">Arkhos</span>
        </Link>

        <div className="w-px h-5 bg-[var(--border)]" />

        {/* View tabs */}
        <div className="flex items-center gap-0.5 ml-1">
          {(["preview", "code"] as const).map((view) => (
            <button key={view} type="button" onClick={() => setMainView(view)} className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none",
              effectiveView === view ? "bg-[var(--surface)] text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface)]/50",
            )}>
              {view === "preview" ? <Eye className="w-3.5 h-3.5" /> : <Code2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{view === "preview" ? t("tabs.preview") : t("tabs.code")}</span>
            </button>
          ))}
        </div>

        {/* Device picker (preview only) */}
        {effectiveView === "preview" && state.previewHtml && (
          <>
            <div className="w-px h-5 bg-[var(--border)] ml-1" />
            <div className="flex items-center gap-0.5 ml-1">
              {([
                { key: "desktop", icon: Monitor },
                { key: "tablet", icon: Tablet },
                { key: "mobile", icon: Smartphone },
              ] as const).map(({ key, icon: Icon }) => (
                <button key={key} type="button" onClick={() => setPreviewDevice(key)} className={cn(
                  "flex items-center justify-center w-7 h-7 rounded-md transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none",
                  previewDevice === key ? "text-[var(--text-primary)] bg-[var(--surface)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
                )} title={key}>
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </>
        )}

        <div className="flex-1 flex items-center justify-center">
          <span className="text-[10px] font-[var(--font-code)] text-[var(--text-muted)] truncate max-w-[120px]">{generationId}</span>
          {state.profile && (
            <span className="ml-2 text-[9px] font-medium uppercase tracking-wider text-[var(--brand)] px-1.5 py-0.5 rounded bg-[var(--brand)]/10">{state.profile}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {isError && (
            <button type="button" onClick={handleRetry} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none">
              <RotateCcw className="w-3 h-3" /> Retry
            </button>
          )}
          {state.previewHtml && (
            <button type="button" onClick={() => { const w = window.open(); if (w) { w.document.write(state.previewHtml!); w.document.close(); } }} className="flex items-center justify-center w-7 h-7 rounded-md text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface)] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none" title="Open in new tab">
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
          {isComplete && (
            <a href={`${apiBase}/api/download/${generationId}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--brand)] text-white hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none transition-all duration-150 cursor-pointer">
              <Download className="w-3 h-3" /> {t("actions.download")}
            </a>
          )}
        </div>
      </div>

      {/* ═══ Main area ═══ */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* ── Left panel: pipeline + chat ── */}
        <div className="w-80 shrink-0 border-r border-[var(--border)] bg-[var(--deep)] flex flex-col">
          {/* Pipeline section */}
          <div className="flex-1 overflow-y-auto">
            {/* Pipeline agents */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">Pipeline</p>
                {state.totalCostEur > 0 && (
                  <span className="text-[10px] font-[var(--font-code)] text-[var(--brand)] tabular-nums">€{state.totalCostEur.toFixed(4)}</span>
                )}
              </div>

              {/* Progress bar */}
              {totalAgents > 0 && (
                <div className="h-1 rounded-full bg-[var(--surface)] mb-4 overflow-hidden">
                  <div className="h-full rounded-full bg-[var(--brand)] transition-all duration-700 ease-out" style={{ width: `${(completedCount / totalAgents) * 100}%` }} />
                </div>
              )}

              {/* Agent list */}
              <AgentList agents={state.agents} status={state.status} sandbox={state.sandbox} />

              {/* Plan review */}
              {isPlanReady && state.plan && (
                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                  <PlanReview plan={state.plan} onApprove={() => state.generationId && approvePlan(state.generationId)} />
                </div>
              )}
            </div>

            {/* Tips during generation */}
            {isBuilding && (
              <div className="px-4 pb-4">
                <GenerationTips />
              </div>
            )}

            {/* Onboarding / status messages */}
            {isIdle && (
              <div className="px-4 pb-4">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--void)]/50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Loader2 className="w-3.5 h-3.5 text-[var(--brand)] animate-spin" />
                    <p className="text-xs font-medium text-[var(--text-primary)]">Loading your generation</p>
                  </div>
                  <p className="text-[10px] font-[var(--font-code)] text-[var(--text-muted)] mb-2">{generationId}</p>
                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">The pipeline will start streaming events shortly.</p>
                </div>
              </div>
            )}

            {isComplete && !iterateState.messages.length && (
              <div className="px-4 pb-4">
                <div className="rounded-xl border border-[var(--brand)]/10 bg-[var(--brand)]/5 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-[var(--brand)]" />
                    <p className="text-xs font-medium text-[var(--text-primary)]">Generation complete</p>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                    Your site is ready! Download it or refine it with the chat below.
                  </p>
                  {(state.totalCostEur > 0 || state.totalDurationS > 0 || state.fileCount > 0) && (
                    <div className="mt-2 flex items-center gap-3 text-[10px] text-[var(--text-muted)]">
                      {state.totalCostEur > 0 && <span className="flex items-center gap-0.5"><Coins className="w-2.5 h-2.5" />€{state.totalCostEur.toFixed(4)}</span>}
                      {state.totalDurationS > 0 && <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{state.totalDurationS.toFixed(1)}s</span>}
                      {state.fileCount > 0 && <span className="flex items-center gap-0.5"><Code2 className="w-2.5 h-2.5" />{state.fileCount} files</span>}
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {["Add a contact form", "Improve mobile responsiveness", "Add animations to the hero", "Change the color scheme", "Add a pricing section"].map((suggestion) => (
                      <button key={suggestion} type="button" onClick={() => { setChatInput(suggestion); }} className="px-2 py-1 rounded-md text-[10px] font-medium text-[var(--brand)] bg-[var(--brand)]/10 hover:bg-[var(--brand)]/20 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none">
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Iteration messages */}
            {iterateState.messages.length > 0 && (
              <div className="px-4 pb-4 space-y-2">
                {iterateState.messages.map((msg, i) => (
                  <div key={i} className={cn(
                    "text-xs leading-relaxed rounded-xl px-3 py-2",
                    msg.role === "user" ? "bg-[var(--brand)]/10 text-[var(--text-primary)] ml-4" : "bg-[var(--surface)] text-[var(--text-secondary)] mr-4",
                  )}>
                    <p>{msg.content}</p>
                    {(msg.costEur !== undefined || msg.durationS !== undefined) && (
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
                        {msg.costEur !== undefined && <span className="flex items-center gap-0.5"><Coins className="w-2.5 h-2.5" />€{msg.costEur.toFixed(4)}</span>}
                        {msg.durationS !== undefined && <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{msg.durationS.toFixed(1)}s</span>}
                      </div>
                    )}
                  </div>
                ))}
                {isBusy && (
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] px-3 py-2">
                    <Loader2 className="w-3 h-3 animate-spin" /> Applying changes...
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Chat input — always at bottom */}
          <div className="border-t border-[var(--border)] p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleChatSubmit(); } }}
                placeholder={isComplete ? "Describe changes..." : isBuilding ? "Generating..." : "Waiting..."}
                disabled={!isComplete || isBusy}
                rows={2}
                className="flex-1 resize-none rounded-xl border border-[var(--border)] bg-[var(--void)] px-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none disabled:opacity-40"
              />
              <button type="button" onClick={handleChatSubmit} disabled={!isComplete || isBusy || !chatInput.trim()} className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--brand)] text-white hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none transition-all duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shrink-0">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="mt-1.5 text-[9px] text-[var(--text-muted)]">
              {isComplete ? "Cmd+Enter to send" : isBuilding ? `${completedCount}/${totalAgents || "..."} agents` : ""}
            </p>
          </div>
        </div>

        {/* ── Right: main content ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* File tree + code (code view) */}
          {effectiveView === "code" ? (
            <div className="flex-1 flex min-h-0 overflow-hidden">
              {fileList.length > 0 && (
                <div className="w-56 shrink-0 border-r border-[var(--border)] bg-[var(--deep)] overflow-y-auto">
                  <div className="px-3 py-2.5 border-b border-[var(--border)]">
                    <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">{t("workspace.files", { count: fileList.length })}</p>
                  </div>
                  <FileTree files={fileList} activeFile={effectiveActiveFile} onSelect={setActiveFile} />
                </div>
              )}
              <div className="flex-1 overflow-auto bg-[var(--void)]">
                {effectiveActiveFile && files[effectiveActiveFile] ? (
                  <CodeBlock code={files[effectiveActiveFile]} filename={effectiveActiveFile} />
                ) : fileList.length === 0 && isBuilding ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <Loader2 className="w-5 h-5 text-[var(--brand)] animate-spin" />
                    <p className="text-sm text-[var(--text-muted)]">Waiting for files...</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-[var(--text-muted)]">{t("workspace.selectFile")}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Preview */
            <div className="flex-1 bg-[var(--void)] overflow-hidden flex items-center justify-center">
              {state.previewHtml ? (
                <div className={cn(
                  "h-full transition-all duration-300 bg-white",
                  previewDevice === "desktop" ? "w-full" : previewDevice === "tablet" ? "w-[768px] rounded-lg border border-[var(--border)] my-4" : "w-[375px] rounded-xl border border-[var(--border)] my-4",
                )}>
                  {sandboxReady ? (
                    <iframe src={state.sandbox.previewUrl!} className="w-full h-full border-0" sandbox="allow-scripts allow-same-origin" title="Live sandbox preview" />
                  ) : (
                    <iframe srcDoc={state.previewHtml} className="w-full h-full border-0" sandbox="allow-scripts allow-same-origin" title="Site preview" />
                  )}
                </div>
              ) : isError ? (
                <ErrorPanel error={state.error ?? ""} errorType={state.errorType} onRetry={handleRetry} />
              ) : isBuilding || isPlanReady ? (
                <PreviewSkeleton agent={state.currentAgent} completed={completedCount} total={totalAgents} t={t} />
              ) : isComplete && !state.previewHtml ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--success)]/10 flex items-center justify-center">
                    <Check className="w-6 h-6 text-[var(--success)]" />
                  </div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{t("workspace.complete")}</p>
                  <p className="text-xs text-[var(--text-muted)]">{t("workspace.filesGenerated", { count: state.fileCount })}</p>
                  <button type="button" onClick={() => setMainView("code")} className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-[var(--brand)] bg-[var(--brand)]/10 hover:bg-[var(--brand)]/20 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none">
                    <Code2 className="w-3.5 h-3.5" /> View generated code
                  </button>
                </div>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">{t("workspace.previewPlaceholder")}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ═══ Status bar ═══ */}
      <StatusBar state={state} />
    </div>
  );
}

/* ── Agent list (left panel) ── */

function AgentList({ agents, status, sandbox }: {
  agents: AgentState[]; status: string; sandbox?: import("@/hooks/use-sse").SandboxState;
}) {
  const isActive = !["idle", "complete", "error"].includes(status);
  const showSkeleton = agents.length === 0 && isActive;

  if (showSkeleton) {
    return (
      <div className="space-y-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={cn("flex items-center gap-3 px-3 py-2 rounded-lg", i === 0 && "bg-[var(--brand)]/5")}>
            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", i === 0 ? "bg-[var(--brand)]/10" : "bg-[var(--surface)]")}>
              {i === 0 ? <Loader2 className="w-3 h-3 text-[var(--brand)] animate-spin" /> : <Circle className="w-2 h-2 text-[var(--text-muted)]/30" />}
            </div>
            <div className="flex-1 space-y-1">
              <div className={cn("h-3 rounded", i === 0 ? "w-16 bg-[var(--surface)] animate-pulse" : "w-12 bg-[var(--surface)]/50")} />
              <div className={cn("h-2 rounded", i === 0 ? "w-24 bg-[var(--surface)]/70 animate-pulse" : "w-20 bg-[var(--surface)]/30")} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (agents.length === 0) {
    return <p className="text-xs text-[var(--text-muted)] text-center py-4">{status === "complete" ? "All agents finished" : status === "error" ? "Pipeline failed" : "Waiting..."}</p>;
  }

  const showSandboxRow = sandbox && sandbox.status !== "idle";

  return (
    <div className="space-y-0.5">
      {agents.map((agent, i) => (
        <div key={`${agent.name}-${i}`}>
          <div className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200",
            agent.status === "running" && "bg-[var(--brand)]/5",
          )}>
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300",
              agent.status === "complete" ? "bg-[var(--success)]/10 border-[var(--success)]/20" :
              agent.status === "running" ? "bg-[var(--brand)]/10 border-[var(--brand)]/30" :
              "bg-[var(--surface)] border-[var(--border)]",
            )}>
              {agent.status === "complete" ? <Check className="w-3 h-3 text-[var(--success)]" /> :
               agent.status === "running" ? <Loader2 className="w-3 h-3 text-[var(--brand)] animate-spin" /> :
               <Circle className="w-2 h-2 text-[var(--text-muted)]/40" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn("text-xs font-medium capitalize", agent.status === "running" ? "text-[var(--text-primary)]" : agent.status === "complete" ? "text-[var(--text-secondary)]" : "text-[var(--text-muted)]")}>
                {agent.name}
              </p>
              <p className="text-[10px] font-[var(--font-code)] text-[var(--text-muted)] truncate">
                {agent.model ?? "waiting..."}
              </p>
            </div>
            {agent.costEur !== undefined && agent.costEur > 0 && (
              <span className="text-[10px] font-[var(--font-code)] text-[var(--text-muted)] tabular-nums shrink-0">€{agent.costEur.toFixed(4)}</span>
            )}
            {agent.status === "running" && (
              <span className="text-[9px] font-medium text-[var(--brand)] animate-pulse shrink-0">live</span>
            )}
          </div>
          {(i < agents.length - 1 || showSandboxRow) && <div className="ml-6 h-1 border-l border-[var(--border)]/50" />}
        </div>
      ))}

      {/* Sandbox step — appears after all agents */}
      {showSandboxRow && (
        <div>
          <div className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200",
            sandbox.status === "starting" && "bg-[var(--brand)]/5",
          )}>
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300",
              sandbox.status === "running" ? "bg-[var(--success)]/10 border-[var(--success)]/20" :
              sandbox.status === "starting" ? "bg-[var(--brand)]/10 border-[var(--brand)]/30" :
              sandbox.status === "failed" ? "bg-[var(--error)]/10 border-[var(--error)]/20" :
              "bg-[var(--surface)] border-[var(--border)]",
            )}>
              {sandbox.status === "running" ? <Check className="w-3 h-3 text-[var(--success)]" /> :
               sandbox.status === "starting" ? <Loader2 className="w-3 h-3 text-[var(--brand)] animate-spin" /> :
               sandbox.status === "failed" ? <Circle className="w-2 h-2 text-[var(--error)]" /> :
               <Circle className="w-2 h-2 text-[var(--text-muted)]/40" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn("text-xs font-medium",
                sandbox.status === "starting" ? "text-[var(--text-primary)]" :
                sandbox.status === "running" ? "text-[var(--text-secondary)]" :
                sandbox.status === "failed" ? "text-[var(--error)]" :
                "text-[var(--text-muted)]",
              )}>
                Sandbox
              </p>
              <p className="text-[10px] font-[var(--font-code)] text-[var(--text-muted)] truncate">
                {sandbox.status === "starting" ? "Installing dependencies..." :
                 sandbox.status === "running" ? "Preview ready" :
                 sandbox.status === "failed" ? (sandbox.error ?? "Failed") :
                 sandbox.status === "skipped" ? "Unavailable" :
                 "waiting..."}
              </p>
            </div>
            {sandbox.durationS > 0 && (
              <span className="text-[10px] font-[var(--font-code)] text-[var(--text-muted)] tabular-nums shrink-0">{sandbox.durationS.toFixed(1)}s</span>
            )}
            {sandbox.status === "starting" && (
              <span className="text-[9px] font-medium text-[var(--brand)] animate-pulse shrink-0">live</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Generation tips ── */

const TIPS = [
  { icon: Zap, text: "Each agent specializes in one task — planning, design, architecture, building, or review." },
  { icon: Coins, text: "Costs are tracked per agent in real-time. You'll see the total in the status bar." },
  { icon: Lightbulb, text: "After generation, you can iterate — describe changes and a Builder agent applies them." },
  { icon: Sparkles, text: "The smart router picks the optimal model for each agent based on past performance." },
  { icon: Eye, text: "The sandbox preview renders your site live as files are generated — watch it take shape in real-time." },
  { icon: Download, text: "Once complete, download your project as a zip — it's a production-ready React app you can deploy anywhere." },
];

function GenerationTips() {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const tip = TIPS[tipIndex];
  const Icon = tip.icon;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--void)]/50 p-3">
      <div className="flex items-start gap-2.5">
        <div className="w-5 h-5 rounded-md bg-[var(--brand)]/10 flex items-center justify-center shrink-0 mt-0.5">
          <Icon className="w-3 h-3 text-[var(--brand)]" />
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)] mb-1">Did you know?</p>
          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{tip.text}</p>
        </div>
      </div>
      {/* Tip progress dots */}
      <div className="flex items-center gap-1 mt-2 ml-7">
        {TIPS.map((_, i) => (
          <div key={i} className={cn("w-1 h-1 rounded-full transition-colors duration-300", i === tipIndex ? "bg-[var(--brand)]" : "bg-[var(--surface)]")} />
        ))}
      </div>
    </div>
  );
}

/* ── Preview skeleton ── */

function PreviewSkeleton({ agent, completed, total, t }: {
  agent: string | null; completed: number; total: number; t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-3xl rounded-xl border border-[var(--border)] bg-[var(--deep)] overflow-hidden shadow-lg shadow-[var(--void)]/50">
        {/* macOS chrome */}
        <div className="flex items-center px-4 py-3 border-b border-[var(--border)] bg-[var(--surface)]/30">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
            <span className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
            <span className="w-3 h-3 rounded-full bg-[#28C840]" />
          </div>
          <div className="flex-1 flex justify-center px-8">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[var(--void)]/50 border border-[var(--border)]/50 w-full max-w-sm">
              <div className="w-3 h-3 rounded-full border border-[var(--success)]/40"><div className="w-full h-full rounded-full bg-[var(--success)]/20" /></div>
              <span className="text-[11px] font-[var(--font-code)] text-[var(--text-muted)]">arkhos-preview.local</span>
            </div>
          </div>
          <div className="w-14" />
        </div>

        {/* Wireframe */}
        <div className="p-6 space-y-5 bg-[var(--void)]/30 min-h-[260px] relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,var(--surface)_50%,transparent_100%)] opacity-[0.04] animate-[shimmer_2.5s_ease-in-out_infinite]" />
          <div className="flex items-center gap-3 relative">
            <div className="h-5 w-16 rounded-md bg-[var(--brand)]/15" />
            <div className="flex-1" />
            <div className="h-3 w-10 rounded bg-[var(--surface)]/60" />
            <div className="h-3 w-10 rounded bg-[var(--surface)]/40" />
            <div className="h-7 w-16 rounded-md bg-[var(--brand)]/20" />
          </div>
          <div className="pt-4 space-y-3 relative">
            <div className="h-2.5 w-20 rounded bg-[var(--brand)]/12" />
            <div className="h-6 w-64 rounded bg-[var(--surface)]/50" />
            <div className="h-3 w-80 rounded bg-[var(--surface)]/30" />
            <div className="flex gap-2 pt-2">
              <div className="h-8 w-24 rounded-lg bg-[var(--brand)]/25" />
              <div className="h-8 w-20 rounded-lg bg-[var(--surface)]/30" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[0.3, 0.2, 0.12].map((op, i) => (
              <div key={i} className="rounded-lg border border-[var(--border)]/50 p-3 space-y-2">
                <div className="h-14 rounded bg-[var(--surface)]" style={{ opacity: op }} />
                <div className="h-2.5 w-3/4 rounded bg-[var(--surface)]" style={{ opacity: op * 0.8 }} />
                <div className="h-2 w-1/2 rounded bg-[var(--surface)]" style={{ opacity: op * 0.6 }} />
              </div>
            ))}
          </div>
        </div>

        {/* Status in browser footer */}
        <div className="px-5 py-2.5 border-t border-[var(--border)] flex items-center gap-3 bg-[var(--deep)]">
          <div className="w-4 h-4 border-2 border-[var(--brand)]/30 border-t-[var(--brand)] rounded-full animate-spin" />
          <p className="text-[11px] text-[var(--text-secondary)]">{agent ? t("workspace.agentWorking", { agent }) : t("workspace.starting")} — building your site</p>
          <div className="flex-1" />
          {total > 0 && (
            <>
              <span className="text-[10px] text-[var(--text-muted)] tabular-nums">{completed}/{total}</span>
              <div className="w-16 h-1 rounded-full bg-[var(--surface)] overflow-hidden">
                <div className="h-full rounded-full bg-[var(--brand)] transition-all duration-700" style={{ width: `${(completed / total) * 100}%` }} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
