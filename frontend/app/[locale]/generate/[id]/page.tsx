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
  Workflow,
  MessageSquare,
  FolderTree,
  ChevronUp,
  ChevronDown,
  Check,
  Loader2,
  Circle,
  Copy,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useSSE } from "@/hooks/use-sse";
import { useWebContainer } from "@/hooks/use-web-container";
import { useIterate } from "@/hooks/use-iterate";
import { PlanReview } from "@/components/generate/plan-review";
import { StatusBar } from "@/components/generate/status-bar";
import { CodeBlock } from "@/components/generate/code-block";
import { FileTree } from "@/components/generate/file-tree";
import { ErrorPanel } from "@/components/generate/error-panel";
import { IterationChat } from "@/components/generate/iteration-chat";
import { cn } from "@/lib/utils";
import type { AgentState } from "@/hooks/use-sse";

type BottomTab = "pipeline" | "chat" | null;
type SideView = "preview" | "code" | "files";

export default function GenerationWorkspacePage() {
  const params = useParams<{ id: string }>();
  const generationId = params.id;
  const t = useTranslations("generate");

  const [files, setFiles] = useState<Record<string, string>>({});
  const [activeView, setActiveView] = useState<SideView>("preview");
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [bottomTab, setBottomTab] = useState<BottomTab>("pipeline");
  const [bottomExpanded, setBottomExpanded] = useState(true);

  const handleFileChunk = useCallback((path: string, content: string) => {
    setFiles((prev) => ({ ...prev, [path]: content }));
  }, []);

  const { state, connectTo, approvePlan, reset: resetSSE } = useSSE(handleFileChunk);
  const { state: wcState, mountAndServe } = useWebContainer();
  const { state: iterateState, iterate } = useIterate(handleFileChunk);

  const wcTriggered = useRef(false);
  const isComplete = state.status === "complete";
  const isWorking = ["starting", "planning", "building", "plan_ready"].includes(state.status);

  useEffect(() => {
    if (generationId && state.status === "idle") connectTo(generationId);
  }, [generationId, state.status, connectTo]);

  const fileList = useMemo(() => Object.keys(files).sort(), [files]);

  useEffect(() => {
    if (!activeFile && fileList.length > 0) setActiveFile(fileList[0]);
  }, [activeFile, fileList]);

  useEffect(() => {
    if (isComplete && Object.keys(files).length > 0 && !wcTriggered.current && wcState.status === "idle") {
      wcTriggered.current = true;
      mountAndServe(files);
    }
  }, [isComplete, files, wcState.status, mountAndServe]);

  // Auto-switch to chat tab when generation completes
  useEffect(() => {
    if (isComplete) setBottomTab("chat");
  }, [isComplete]);

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

  const toggleBottom = (tab: BottomTab) => {
    if (bottomTab === tab) {
      setBottomExpanded((p) => !p);
    } else {
      setBottomTab(tab);
      setBottomExpanded(true);
    }
  };

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const completedCount = state.agents.filter((a) => a.status === "complete").length;
  const totalAgents = state.agents.length;

  return (
    <div data-workspace className="h-screen flex flex-col overflow-hidden bg-[var(--void)]">
      <div className="flex-1 flex min-h-0">
        {/* ═══ Activity bar (48px, icon-only) ═══ */}
        <div className="w-12 shrink-0 flex flex-col items-center py-3 gap-1 border-r border-[var(--border)] bg-[var(--deep)]">
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--brand)] mb-3 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none">
            <Cpu className="w-3.5 h-3.5 text-white" />
          </Link>

          {/* View buttons */}
          <ActivityButton
            icon={Eye}
            active={activeView === "preview"}
            onClick={() => setActiveView("preview")}
            label="Preview"
          />
          <ActivityButton
            icon={Code2}
            active={activeView === "code"}
            onClick={() => setActiveView("code")}
            label="Code"
          />
          <ActivityButton
            icon={FolderTree}
            active={activeView === "files"}
            onClick={() => setActiveView("files")}
            label="Files"
          />

          <div className="flex-1" />

          {/* Bottom panel toggles */}
          <ActivityButton
            icon={Workflow}
            active={bottomTab === "pipeline" && bottomExpanded}
            onClick={() => toggleBottom("pipeline")}
            label="Pipeline"
            badge={isWorking ? completedCount.toString() : undefined}
          />
          {isComplete && (
            <ActivityButton
              icon={MessageSquare}
              active={bottomTab === "chat" && bottomExpanded}
              onClick={() => toggleBottom("chat")}
              label="Chat"
            />
          )}

          <div className="mt-1">
            <Link
              href="/"
              aria-label="Back"
              className="flex items-center justify-center w-8 h-8 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface)] transition-colors duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* ═══ Main area ═══ */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Toolbar */}
          <div className="flex items-center gap-3 px-4 py-2 border-b border-[var(--border)] bg-[var(--deep)]">
            <p className="text-xs font-[var(--font-code)] text-[var(--text-muted)] truncate max-w-[200px]">
              {generationId}
            </p>

            {state.profile && (
              <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)] px-2 py-0.5 rounded-md bg-[var(--surface)]">
                {state.profile}
              </span>
            )}

            <div className="flex-1" />

            {isComplete && (
              <a
                href={`${apiBase}/api/download/${generationId}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--brand)] text-white hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none transition-all duration-150 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                {t("actions.download")}
              </a>
            )}
          </div>

          {/* Content area */}
          <div className="flex-1 flex min-h-0 overflow-hidden">
            {/* File tree sidebar (when files view or code view) */}
            {(activeView === "files" || activeView === "code") && fileList.length > 0 && (
              <div className="w-52 shrink-0 border-r border-[var(--border)] bg-[var(--deep)] overflow-y-auto">
                <div className="px-3 py-2">
                  <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    {t("workspace.files", { count: fileList.length })}
                  </p>
                </div>
                <FileTree files={fileList} activeFile={activeFile} onSelect={(f) => { setActiveFile(f); setActiveView("code"); }} />
              </div>
            )}

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              {activeView === "preview" ? (
                <div className="flex-1 bg-[var(--void)] flex items-center justify-center">
                  {wcState.url ? (
                    <iframe src={wcState.url} className="w-full h-full border-0" sandbox="allow-scripts" title="Live preview" />
                  ) : state.previewHtml ? (
                    <iframe srcDoc={state.previewHtml} className="w-full h-full border-0" sandbox="allow-scripts" title="Site preview" />
                  ) : state.status === "error" ? (
                    <ErrorPanel error={state.error ?? ""} errorType={state.errorType} onRetry={handleRetry} />
                  ) : isWorking ? (
                    <PreviewSkeleton agent={state.currentAgent} completed={completedCount} total={totalAgents} t={t} />
                  ) : wcState.status !== "idle" && wcState.status !== "error" ? (
                    <div className="flex flex-col items-center gap-3 text-center">
                      <div className="w-8 h-8 border-2 border-[var(--brand)]/30 border-t-[var(--brand)] rounded-full animate-spin" />
                      <p className="text-sm text-[var(--text-muted)]">
                        {wcState.status === "booting" ? t("workspace.booting") : wcState.status === "installing" ? t("workspace.installing") : t("workspace.starting")}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--text-muted)]">{t("workspace.previewPlaceholder")}</p>
                  )}
                </div>
              ) : activeView === "code" || activeView === "files" ? (
                <div className="flex-1 overflow-auto bg-[var(--void)]">
                  {activeFile && files[activeFile] ? (
                    <CodeBlock code={files[activeFile]} filename={activeFile} />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-sm text-[var(--text-muted)]">{t("workspace.selectFile")}</p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          {/* ═══ Bottom panel (collapsible) ═══ */}
          {bottomTab && (
            <div className={cn("border-t border-[var(--border)] bg-[var(--deep)] flex flex-col", bottomExpanded ? "h-56" : "h-8")}>
              {/* Bottom panel header */}
              <div className="flex items-center gap-2 px-3 h-8 shrink-0 border-b border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => { setBottomTab("pipeline"); setBottomExpanded(true); }}
                  className={cn(
                    "text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded transition-colors cursor-pointer",
                    bottomTab === "pipeline" ? "text-[var(--text-primary)] bg-[var(--surface)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
                  )}
                >
                  Pipeline {totalAgents > 0 && `(${completedCount}/${totalAgents})`}
                </button>
                {isComplete && (
                  <button
                    type="button"
                    onClick={() => { setBottomTab("chat"); setBottomExpanded(true); }}
                    className={cn(
                      "text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded transition-colors cursor-pointer",
                      bottomTab === "chat" ? "text-[var(--text-primary)] bg-[var(--surface)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
                    )}
                  >
                    Iterate
                  </button>
                )}
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={() => setBottomExpanded((p) => !p)}
                  className="flex items-center justify-center w-5 h-5 rounded text-[var(--text-muted)] hover:text-[var(--text-secondary)] cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
                >
                  {bottomExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                </button>
              </div>

              {/* Bottom panel content */}
              {bottomExpanded && (
                <div className="flex-1 overflow-hidden">
                  {bottomTab === "pipeline" ? (
                    <div className="h-full overflow-y-auto">
                      {/* Plan review */}
                      {state.status === "plan_ready" && state.plan ? (
                        <div className="p-3">
                          <PlanReview plan={state.plan} onApprove={() => state.generationId && approvePlan(state.generationId)} />
                        </div>
                      ) : (
                        /* Horizontal pipeline */
                        <HorizontalPipeline agents={state.agents} currentAgent={state.currentAgent} status={state.status} />
                      )}
                    </div>
                  ) : bottomTab === "chat" ? (
                    <IterationChat state={iterateState} onSend={handleIterate} disabled={!isComplete} />
                  ) : null}
                </div>
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

/* ── Activity bar button ── */

function ActivityButton({
  icon: Icon,
  active,
  onClick,
  label,
  badge,
}: {
  icon: typeof Eye;
  active: boolean;
  onClick: () => void;
  label: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "relative flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none",
        active
          ? "bg-[var(--surface)] text-[var(--text-primary)]"
          : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface)]/50",
      )}
    >
      <Icon className="w-4 h-4" />
      {badge && (
        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[var(--brand)] text-white text-[8px] font-bold flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
}

/* ── Horizontal pipeline (bottom panel) ── */

function HorizontalPipeline({
  agents,
  currentAgent,
  status,
}: {
  agents: AgentState[];
  currentAgent: string | null;
  status: string;
}) {
  const showSkeleton = agents.length === 0 && status !== "idle" && status !== "complete" && status !== "error";
  const skeletonCount = 5;

  const nodes = showSkeleton
    ? Array.from({ length: skeletonCount }, (_, i) => ({
        name: "",
        status: i === 0 ? ("running" as const) : ("pending" as const),
        model: undefined,
        costEur: undefined,
        durationS: undefined,
        isSkeleton: true,
      }))
    : agents.map((a) => ({ ...a, isSkeleton: false }));

  return (
    <div className="h-full flex items-center px-6 gap-0 overflow-x-auto">
      {nodes.map((node, i) => (
        <div key={node.name || `skeleton-${i}`} className="flex items-center shrink-0">
          {/* Agent node */}
          <div className={cn(
            "flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl transition-all duration-300 min-w-[90px]",
            node.status === "running" && "bg-[var(--brand)]/5",
          )}>
            {/* Status circle */}
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
              node.status === "complete" && "bg-[var(--success)]/10",
              node.status === "running" && "bg-[var(--brand)]/10 ring-2 ring-[var(--brand)]/20",
              node.status === "pending" && "bg-[var(--surface)]",
            )}>
              {node.status === "complete" ? (
                <Check className="w-3.5 h-3.5 text-[var(--success)]" />
              ) : node.status === "running" ? (
                <Loader2 className="w-3.5 h-3.5 text-[var(--brand)] animate-spin" />
              ) : (
                <Circle className="w-2.5 h-2.5 text-[var(--text-muted)]/30" />
              )}
            </div>

            {/* Name */}
            {node.isSkeleton ? (
              <div className="h-3 w-14 rounded bg-[var(--surface)] animate-pulse" />
            ) : (
              <span className={cn(
                "text-xs font-medium capitalize",
                node.status === "running" ? "text-[var(--text-primary)]" :
                node.status === "complete" ? "text-[var(--text-secondary)]" :
                "text-[var(--text-muted)]/50",
              )}>
                {node.name}
              </span>
            )}

            {/* Model + cost */}
            {node.isSkeleton ? (
              <div className="h-2 w-16 rounded bg-[var(--surface)]/50 animate-pulse" />
            ) : (
              <span className="text-[9px] font-[var(--font-code)] text-[var(--text-muted)] truncate max-w-[80px]">
                {node.model ?? ""}
                {node.costEur !== undefined && node.costEur > 0 ? ` · €${node.costEur.toFixed(4)}` : ""}
              </span>
            )}
          </div>

          {/* Connector line */}
          {i < nodes.length - 1 && (
            <div className="relative w-8 h-px bg-[var(--border)] shrink-0">
              {/* Animated dot on the connector for active transitions */}
              {node.status === "complete" && nodes[i + 1]?.status === "running" && (
                <div className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[var(--brand)] animate-[flow_1s_ease-in-out_infinite]" />
              )}
            </div>
          )}
        </div>
      ))}

      {agents.length === 0 && !showSkeleton && (
        <p className="text-xs text-[var(--text-muted)]">Connecting to pipeline...</p>
      )}
    </div>
  );
}

/* ── Preview skeleton ── */

function PreviewSkeleton({
  agent,
  completed,
  total,
  t,
}: {
  agent: string | null;
  completed: number;
  total: number;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="w-full h-full p-4 flex flex-col">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--deep)] overflow-hidden flex-1 flex flex-col">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--border)]">
          <div className="flex items-center gap-1.5">
            <span className="w-[10px] h-[10px] rounded-full bg-[#FF5F57]" />
            <span className="w-[10px] h-[10px] rounded-full bg-[#FEBC2E]" />
            <span className="w-[10px] h-[10px] rounded-full bg-[#28C840]" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-[var(--surface)]/50 max-w-xs w-full">
              <span className="text-[10px] font-[var(--font-code)] text-[var(--text-muted)]">arkhos-preview.local</span>
            </div>
          </div>
          <div className="w-16" />
        </div>

        {/* Page wireframe */}
        <div className="flex-1 p-8 space-y-6 overflow-hidden">
          {/* Nav skeleton */}
          <div className="flex items-center gap-4">
            <div className="h-4 w-20 rounded bg-[var(--surface)]/50 animate-pulse" />
            <div className="flex-1" />
            <div className="h-3 w-12 rounded bg-[var(--surface)]/30 animate-pulse" />
            <div className="h-3 w-12 rounded bg-[var(--surface)]/30 animate-pulse" style={{ animationDelay: "75ms" }} />
            <div className="h-3 w-12 rounded bg-[var(--surface)]/30 animate-pulse" style={{ animationDelay: "150ms" }} />
          </div>

          {/* Hero skeleton */}
          <div className="py-8 space-y-3">
            <div className="h-3 w-24 rounded bg-[var(--brand)]/15 animate-pulse" />
            <div className="h-8 w-80 rounded bg-[var(--surface)]/40 animate-pulse" style={{ animationDelay: "100ms" }} />
            <div className="h-3 w-96 rounded bg-[var(--surface)]/25 animate-pulse" style={{ animationDelay: "200ms" }} />
            <div className="h-3 w-72 rounded bg-[var(--surface)]/20 animate-pulse" style={{ animationDelay: "250ms" }} />
            <div className="mt-4 flex gap-3">
              <div className="h-9 w-28 rounded-lg bg-[var(--brand)]/20 animate-pulse" style={{ animationDelay: "300ms" }} />
              <div className="h-9 w-20 rounded-lg bg-[var(--surface)]/25 animate-pulse" style={{ animationDelay: "350ms" }} />
            </div>
          </div>

          {/* Cards skeleton */}
          <div className="grid grid-cols-3 gap-4">
            <div className="h-36 rounded-xl bg-[var(--surface)]/20 animate-pulse" style={{ animationDelay: "400ms" }} />
            <div className="h-36 rounded-xl bg-[var(--surface)]/15 animate-pulse" style={{ animationDelay: "500ms" }} />
            <div className="h-36 rounded-xl bg-[var(--surface)]/10 animate-pulse" style={{ animationDelay: "600ms" }} />
          </div>
        </div>

        {/* Progress overlay at bottom */}
        <div className="px-6 py-3 border-t border-[var(--border)] flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[var(--brand)]/30 border-t-[var(--brand)] rounded-full animate-spin" />
          <div>
            <p className="text-xs text-[var(--text-secondary)]">
              {agent ? t("workspace.agentWorking", { agent }) : t("workspace.starting")}
            </p>
            {total > 0 && (
              <p className="text-[10px] text-[var(--text-muted)] tabular-nums">
                {completed}/{total} agents
              </p>
            )}
          </div>
          <div className="flex-1" />
          {/* Mini progress bar */}
          {total > 0 && (
            <div className="w-24 h-1 rounded-full bg-[var(--surface)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--brand)] transition-all duration-700 ease-out"
                style={{ width: `${(completed / total) * 100}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
