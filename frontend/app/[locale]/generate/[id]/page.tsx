"use client";

import { useEffect, useCallback, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Check, ArrowLeft, Code2, Eye, Download } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useSSE } from "@/hooks/use-sse";
import { PipelinePanel } from "@/components/generate/pipeline-panel";
import { StatusBar } from "@/components/generate/status-bar";
import { cn } from "@/lib/utils";

export default function GenerateWorkspace() {
  const params = useParams();
  const generationId = params.id as string;
  const t = useTranslations("generate");

  const [files, setFiles] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [activeFile, setActiveFile] = useState<string | null>(null);

  const handleFileChunk = useCallback((path: string, content: string) => {
    setFiles((prev) => ({ ...prev, [path]: content }));
  }, []);

  const { state, connectTo, approvePlan } = useSSE(handleFileChunk);

  // Connect to the generation stream on mount
  useEffect(() => {
    if (generationId && state.status === "idle") {
      connectTo(generationId);
    }
  }, [generationId, state.status, connectTo]);

  const fileList = Object.keys(files).sort();

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)] bg-[var(--deep)]">
        <div className="flex items-center gap-3">
          <Link
            href="/generate"
            aria-label="Back to generate"
            className="flex items-center justify-center w-8 h-8 rounded-md
                       hover:bg-[var(--surface)] focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none
                       transition-colors duration-150 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[var(--text-muted)]" />
          </Link>
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {t("title")}
            </p>
            <p className="text-[10px] font-[var(--font-code)] text-[var(--text-muted)]">
              {generationId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div
            role="tablist"
            className="flex items-center gap-0.5 rounded-md border border-[var(--border)] p-0.5 bg-[var(--deep)]"
          >
            <button
              role="tab"
              aria-selected={activeTab === "preview"}
              onClick={() => setActiveTab("preview")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none",
                activeTab === "preview"
                  ? "bg-[var(--surface)] text-[var(--text-primary)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
              )}
            >
              <Eye className="w-3 h-3" />
              {t("tabs.preview")}
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "code"}
              onClick={() => setActiveTab("code")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none",
                activeTab === "code"
                  ? "bg-[var(--surface)] text-[var(--text-primary)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
              )}
            >
              <Code2 className="w-3 h-3" />
              {t("tabs.code")}
            </button>
          </div>

          {state.status === "complete" && (
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/download/${generationId}`}
              aria-label="Download project"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                         bg-[var(--brand)] text-white hover:brightness-110
                         focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none
                         transition-all duration-150 cursor-pointer"
            >
              <Download className="w-3 h-3" />
              {t("actions.download")}
            </a>
          )}
        </div>
      </div>

      {/* Main workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — Pipeline + Plan */}
        <div className="w-72 shrink-0 border-r border-[var(--border)] bg-[var(--void)] overflow-y-auto">
          <div className="p-4">
            <PipelinePanel
              agents={state.agents}
              currentAgent={state.currentAgent}
              totalCostEur={state.totalCostEur}
            />
          </div>

          {/* Plan review */}
          {state.status === "plan_ready" && state.plan && (
            <div className="p-4 border-t border-[var(--border)]">
              <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
                {t("sections.plan")}
              </h3>
              <pre className="text-xs font-[var(--font-code)] text-[var(--text-secondary)] whitespace-pre-wrap max-h-48 overflow-y-auto mb-3 leading-relaxed">
                {state.plan}
              </pre>
              <button
                onClick={() => state.generationId && approvePlan(state.generationId)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                           text-sm font-medium bg-[var(--brand)] text-white
                           hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none
                           transition-all duration-150 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                {t("actions.approve")}
              </button>
            </div>
          )}
        </div>

        {/* Right panel — Preview / Code */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeTab === "preview" ? (
            <div className="flex-1 bg-[var(--void)] flex items-center justify-center">
              {state.previewHtml ? (
                <iframe
                  srcDoc={state.previewHtml}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts"
                  title="Site preview"
                />
              ) : state.status === "building" || state.status === "planning" ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-[var(--brand)]/30 border-t-[var(--brand)] rounded-full animate-spin" />
                  <p className="text-sm text-[var(--text-muted)]">
                    {state.currentAgent
                      ? t("workspace.agentWorking", { agent: state.currentAgent })
                      : t("workspace.starting")}
                  </p>
                </div>
              ) : state.status === "complete" ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--success)]/10 flex items-center justify-center">
                    <Check className="w-5 h-5 text-[var(--success)]" />
                  </div>
                  <p className="text-sm text-[var(--text-primary)]">
                    {t("workspace.complete")}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {t("workspace.filesGenerated", { count: state.fileCount })}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">
                  {t("workspace.previewPlaceholder")}
                </p>
              )}
            </div>
          ) : (
            /* Code view */
            <div className="flex flex-1 overflow-hidden">
              {/* File tree */}
              <nav
                aria-label="File tree"
                className="w-52 shrink-0 border-r border-[var(--border)] bg-[var(--deep)] overflow-y-auto"
              >
                <div className="p-2">
                  <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider px-2 py-1.5">
                    {t("workspace.files", { count: fileList.length })}
                  </p>
                  {fileList.map((path) => (
                    <button
                      key={path}
                      onClick={() => setActiveFile(path)}
                      aria-current={activeFile === path ? "true" : undefined}
                      className={cn(
                        "w-full text-left px-2 py-1 rounded text-xs font-[var(--font-code)] truncate transition-colors duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none",
                        activeFile === path
                          ? "bg-[var(--surface)] text-[var(--text-primary)]"
                          : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface)]",
                      )}
                    >
                      {path}
                    </button>
                  ))}
                </div>
              </nav>

              {/* Code content */}
              <div className="flex-1 overflow-auto bg-[var(--void)]">
                {activeFile && files[activeFile] ? (
                  <pre className="p-4 text-xs font-[var(--font-code)] text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                    {files[activeFile]}
                  </pre>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-[var(--text-muted)]">
                      {t("workspace.selectFile")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <StatusBar state={state} />
    </div>
  );
}
