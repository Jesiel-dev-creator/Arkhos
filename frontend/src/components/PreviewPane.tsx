import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Code, Copy, X, Check, Globe, ExternalLink, Smartphone } from "lucide-react";
import gsap from "gsap";
import type { GenerationStatus } from "@/hooks/useSSE";
import { FallingPattern } from "@/components/shaders/falling-pattern";
/* WebContainer state received via props from Generate.tsx */

/** Inject <base target="_self"> so all links stay inside the iframe */
function sandboxHtml(html: string): string {
  if (!html) return html;
  const baseTag = '<base target="_self">';
  if (html.includes("<head>")) {
    return html.replace("<head>", `<head>${baseTag}`);
  }
  if (html.includes("<HEAD>")) {
    return html.replace("<HEAD>", `<HEAD>${baseTag}`);
  }
  return baseTag + html;
}

interface PreviewPaneProps {
  status: GenerationStatus;
  previewHtml: string | null;
  finalHtml: string | null;
  projectFiles: Record<string, string> | null;
  generationId?: string | null;
  wcStatus?: string;
  wcPreviewUrl?: string | null;
  wcBuildError?: string | null;
  onToggleCode: () => void;
  showCode: boolean;
}

export default function PreviewPane({
  status,
  previewHtml,
  finalHtml,
  generationId,
  wcStatus,
  wcPreviewUrl,
  wcBuildError,
  onToggleCode,
  showCode,
}: PreviewPaneProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [mobilePreview, setMobilePreview] = useState(false);
  const revealDone = useRef(false);

  /* WC state from parent (Generate.tsx owns the WebContainer) */
  const wcReady = wcStatus === "ready" && !!wcPreviewUrl;
  const wcBooting = !!wcStatus && wcStatus !== "idle" && wcStatus !== "ready" && wcStatus !== "error";
  const isGenerating = status === "running" || status === "starting";
  // Only show WC iframe after generation has started or completed (not before)
  const hasGenerated = status === "complete" || status === "running" || !!previewHtml;

  /* GSAP reveal when preview first appears */
  useEffect(() => {
    if (!previewHtml || revealDone.current) return;
    /* Wait a tick for the iframe to mount in DOM */
    const raf = requestAnimationFrame(() => {
      if (iframeRef.current) {
        revealDone.current = true;
        gsap.fromTo(
          iframeRef.current,
          { opacity: 0, scale: 0.97 },
          { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" }
        );
      }
      if (containerRef.current) {
        gsap.fromTo(
          containerRef.current,
          { boxShadow: "0 0 0px rgba(255, 107, 53, 0)" },
          { boxShadow: "0 0 30px rgba(255, 107, 53, 0.15)", duration: 1, ease: "power2.out" }
        );
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [previewHtml]);

  useEffect(() => {
    if (status === "idle" || status === "starting") {
      revealDone.current = false;
    }
  }, [status]);

  const handleDownload = async () => {
    if (generationId) {
      try {
        const res = await fetch(`/api/download/${generationId}`);
        if (!res.ok) throw new Error(`Download failed: ${res.status}`);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `arkhos-${generationId.slice(0, 8)}.zip`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Download failed:", err);
      }
    } else if (finalHtml) {
      const blob = new Blob([finalHtml], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "arkhos-site.html";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleCopy = async () => {
    if (!finalHtml) return;
    await navigator.clipboard.writeText(finalHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isComplete = status === "complete";
  const isLoading = status === "running" || status === "starting";

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-3">
      {/* ── Preview Container ── */}
      <div
        ref={containerRef}
        className="relative flex-1 min-h-[500px] rounded-[16px] overflow-hidden transition-all duration-700"
        style={{
          background: "rgba(13, 27, 42, 0.6)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: isLoading
            ? "1px solid rgba(255, 107, 53, 0.3)"
            : "1px solid rgba(0, 212, 238, 0.15)",
          boxShadow: isLoading
            ? "0 0 30px rgba(255, 107, 53, 0.08), inset 0 1px 0 rgba(255,255,255,0.03)"
            : "0 0 30px rgba(0, 212, 238, 0.08), inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
      >
        {/* ── Idle + Loading State — Interactive ember canvas ── */}
        {((status === "idle" && !hasGenerated) || (isLoading && !previewHtml)) && (
          <div className="absolute inset-0">
            <FallingPattern
              color="#00D4EE"
              backgroundColor="#020408"
              density={1}
              duration={120}
              blurIntensity="0.6em"
            />
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-sm font-medium mb-1"
                 style={{ color: "var(--frost)", fontFamily: "var(--font-body)" }}>
                {isLoading ? "Building your website" : "Your website will appear here"}
              </p>
              {isLoading ? (
                <p className="text-[11px] animate-pulse"
                   style={{ color: "var(--cyan)", fontFamily: "var(--font-code)" }}>
                  agents working...
                </p>
              ) : (
                <p className="text-[11px]"
                   style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>
                  Describe your website or choose a template
                </p>
              )}
            </div>
          </div>
        )}

        {/* WC boots silently — ember canvas handles all loading states */}

        {/* ── WebContainer preview (v0.2 — only after generation starts) ── */}
        {wcReady && hasGenerated && (
          <div className="h-full flex flex-col">
            <BrowserChrome url={wcPreviewUrl ?? undefined} generationId={generationId} isGenerating={isGenerating} />
            <iframe
              src={wcPreviewUrl ?? undefined}
              className={mobilePreview ? "flex-1 border-0 bg-white" : "w-full flex-1 border-0 bg-white"}
              style={mobilePreview ? { width: 375, margin: "0 auto" } : undefined}
              title="Generated site preview (WebContainer)"
            />
          </div>
        )}

        {/* ── HTML preview (v0.1 fallback — when WC not ready) ── */}
        {previewHtml && !wcReady && (
          <div className="h-full flex flex-col">
            <BrowserChrome generationId={generationId} />
            <iframe
              ref={iframeRef}
              srcDoc={sandboxHtml(previewHtml)}
              sandbox="allow-scripts allow-same-origin"
              className="w-full flex-1 border-0 bg-white"
              title="Website preview"
              style={{ opacity: revealDone.current ? 1 : 0, transition: "opacity 0.8s ease-out" }}
              onLoad={() => {
                if (iframeRef.current) iframeRef.current.style.opacity = "1";
              }}
            />
          </div>
        )}

        {/* ── WC error fallback — show message when nothing else renders ── */}
        {!wcReady && !wcBooting && !previewHtml && wcStatus === "error" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-8">
              <p className="text-sm mb-2" style={{ color: "var(--frost)" }}>
                Preview sandbox failed to start
              </p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                Try refreshing the page. Your generation data is saved.
              </p>
            </div>
          </div>
        )}

        {/* Build error banner (non-blocking) */}
        {wcBuildError && (
          <div className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-between px-3 py-2"
               style={{ background: "rgba(255,69,96,0.1)", borderTop: "1px solid rgba(255,69,96,0.3)" }}>
            <span className="text-[11px] truncate" style={{ color: "var(--error)", fontFamily: "var(--font-code)" }}>
              {wcBuildError.slice(0, 120)}
            </span>
          </div>
        )}
      </div>

      {/* ── Action Buttons ── */}
      <AnimatePresence>
        {isComplete && (finalHtml || generationId) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2"
          >
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-[var(--ember)] text-white text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{ boxShadow: "0 0 20px rgba(255, 107, 53, 0.25)" }}
            >
              <Download size={14} />
              Download
            </button>
            <button
              onClick={onToggleCode}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-[10px] border text-sm font-medium transition-all duration-200 ${
                showCode
                  ? "border-[var(--cyan)]/50 text-[var(--cyan)] bg-[var(--cyan)]/5"
                  : "border-[var(--border)] text-[var(--frost)] hover:border-[var(--muted)] hover:bg-[var(--deep)]/50"
              }`}
            >
              {showCode ? <X size={14} /> : <Code size={14} />}
              {showCode ? "Hide Code" : "View Code"}
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] border border-[var(--border)] text-sm font-medium text-[var(--frost)] hover:border-[var(--muted)] hover:bg-[var(--deep)]/50 transition-all duration-200"
            >
              {copied ? <Check size={14} className="text-[var(--success)]" /> : <Copy size={14} />}
              {copied ? "Copied!" : "Copy HTML"}
            </button>
            <button
              onClick={() => setMobilePreview((v) => !v)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-[10px] border text-sm font-medium transition-all duration-200 ${
                mobilePreview
                  ? "border-[var(--cyan)]/50 text-[var(--cyan)] bg-[var(--cyan)]/5"
                  : "border-[var(--border)] text-[var(--frost)] hover:border-[var(--muted)] hover:bg-[var(--deep)]/50"
              }`}
            >
              <Smartphone size={14} />
              Mobile
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Browser Chrome Bar ── */
function BrowserChrome({ url, generationId, isGenerating }: {
  url?: string; generationId?: string | null; isGenerating?: boolean;
}) {
  return (
    <div className="relative">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--border)] bg-[var(--void)]/60">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--error)]/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--warning)]/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--success)]/60" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-md bg-[var(--deep)] text-[10px]">
            {isGenerating ? (
              <span className="animate-pulse" style={{ color: "var(--ember)", fontFamily: "var(--font-code)" }}>
                building...
              </span>
            ) : (
              <>
                <Globe size={10} style={{ color: "var(--muted)" }} />
                <span style={{ fontFamily: "var(--font-code)", color: "var(--muted)" }}>
                  {url || `arkhos.ai/preview/${generationId ? generationId.slice(0, 8) : "..."}`}
                </span>
              </>
            )}
          </div>
        </div>
      {url && !isGenerating && (
        <button
          onClick={() => window.open(url, "_blank")}
          className="p-1 rounded-md hover:bg-white/10 text-[var(--muted)] hover:text-[var(--frost)]"
        >
          <ExternalLink size={12} />
        </button>
      )}
      </div>
      {/* Ember progress bar during generation */}
      {isGenerating && (
        <div className="h-[2px] w-full overflow-hidden bg-[#0D1B2A]">
          <div
            className="h-full bg-gradient-to-r from-[#FF6B35] via-[#FFB347] to-[#FF6B35] animate-pulse"
            style={{
              width: "60%",
              animation: "progress-slide 2s ease-in-out infinite",
            }}
          />
          <style>{`
            @keyframes progress-slide {
              0% { transform: translateX(-100%); }
              50% { transform: translateX(80%); }
              100% { transform: translateX(-100%); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}

