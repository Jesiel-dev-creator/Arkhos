"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Check, ArrowLeft, Code2, Eye, Download } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useSSE } from "@/hooks/use-sse";
import { PipelinePanel } from "@/components/generate/pipeline-panel";
import { StatusBar } from "@/components/generate/status-bar";
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

  const { state, connectTo, approvePlan } = useSSE(handleFileChunk);

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

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col px-4 pb-4">
      <div className="mx-auto w-full max-w-7xl flex-1 flex flex-col gap-4">
        <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--deep)] px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/generate"
              aria-label="Back to generate"
              className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-[var(--surface)] focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none transition-colors duration-150 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[var(--text-muted)]" />
            </Link>
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">{t("title")}</p>
              <p className="text-[10px] font-[var(--font-code)] text-[var(--text-muted)]">{generationId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div role="tablist" className="flex items-center gap-0.5 rounded-md border border-[var(--border)] p-0.5 bg-[var(--void)]">
              <button
                type="button"
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
                type="button"
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

        <div className="grid flex-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] overflow-hidden">
            <div className="p-4">
              <PipelinePanel agents={state.agents} currentAgent={state.currentAgent} totalCostEur={state.totalCostEur} />
            </div>

            {state.status === "plan_ready" && state.plan && (
              <div className="border-t border-[var(--border)] p-4">
                <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
                  {t("sections.plan")}
                </h3>
                <pre className="text-xs font-[var(--font-code)] text-[var(--text-secondary)] whitespace-pre-wrap max-h-48 overflow-y-auto mb-3 leading-relaxed">
                  {state.plan}
                </pre>
                <button
                  type="button"
                  onClick={() => state.generationId && approvePlan(state.generationId)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-[var(--brand)] text-white hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none transition-all duration-150 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  {t("actions.approve")}
                </button>
              </div>
            )}
          </aside>

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] overflow-hidden flex flex-col min-h-[36rem]">
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
                  ) : state.status === "building" || state.status === "planning" || state.status === "starting" ? (
                    <div className="flex flex-col items-center gap-3 px-6 text-center">
                      <div className="w-8 h-8 border-2 border-[var(--brand)]/30 border-t-[var(--brand)] rounded-full animate-spin" />
                      <p className="text-sm text-[var(--text-muted)]">
                        {state.currentAgent ? t("workspace.agentWorking", { agent: state.currentAgent }) : t("workspace.starting")}
                      </p>
                    </div>
                  ) : state.status === "complete" ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--surface)]">
                        <Check className="w-5 h-5 text-[var(--success)]" />
                      </div>
                      <p className="text-sm text-[var(--text-primary)]">{t("workspace.complete")}</p>
                      <p className="text-xs text-[var(--text-muted)]">{t("workspace.filesGenerated", { count: state.fileCount })}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--text-muted)]">{t("workspace.previewPlaceholder")}</p>
                  )}
                </div>
              ) : (
                <div className="flex flex-1 overflow-hidden">
                  <nav aria-label="File tree" className="w-56 shrink-0 border-r border-[var(--border)] bg-[var(--void)] overflow-y-auto">
                    <div className="p-2">
                      <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider px-2 py-1.5">
                        {t("workspace.files", { count: fileList.length })}
                      </p>
                      {fileList.map((path) => (
                        <button
                          key={path}
                          type="button"
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

                  <div className="flex-1 overflow-auto bg-[var(--void)]">
                    {activeFile ? (
                      <pre className="p-4 text-xs leading-6 font-[var(--font-code)] text-[var(--text-secondary)] whitespace-pre-wrap break-words">
                        {files[activeFile]}
                      </pre>
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
        </div>
      </div>
    </div>
  );
}
