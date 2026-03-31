import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Code, Copy, X, Check, Zap, Globe } from "lucide-react";
import gsap from "gsap";
import type { GenerationStatus } from "@/hooks/useSSE";
import {
  useWebContainer,
  type WebContainerStatus,
} from "@/hooks/useWebContainer";

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
  onToggleCode: () => void;
  showCode: boolean;
}

export default function PreviewPane({
  status,
  previewHtml,
  finalHtml,
  projectFiles,
  generationId,
  onToggleCode,
  showCode,
}: PreviewPaneProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const revealDone = useRef(false);

  /* WebContainers for multi-file React projects (optional — graceful fallback) */
  const wc = useWebContainer();
  const wcMounted = useRef(false);
  const wcFailed = useRef(false);

  useEffect(() => {
    if (
      projectFiles &&
      Object.keys(projectFiles).length > 3 &&
      !wcMounted.current &&
      !wcFailed.current
    ) {
      wcMounted.current = true;
      wc.mountProject(projectFiles).catch(() => {
        wcFailed.current = true;
      });
    }
  }, [projectFiles, wc]);

  useEffect(() => {
    if (status === "idle" || status === "starting") {
      wcMounted.current = false;
      wcFailed.current = false;
    }
  }, [status]);

  /* If WebContainer errored, treat as HTML mode */
  useEffect(() => {
    if (wc.status === "error") {
      wcFailed.current = true;
    }
  }, [wc.status]);

  const wcActive = wc.status === "ready" && wc.previewUrl && !wcFailed.current;
  const wcLoading =
    !wcFailed.current &&
    wcMounted.current &&
    wc.status !== "idle" &&
    wc.status !== "ready" &&
    wc.status !== "error";

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

  const handleDownload = () => {
    if (!finalHtml) return;
    const blob = new Blob([finalHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "arkhos-site.html";
    a.click();
    URL.revokeObjectURL(url);
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
        className="relative flex-1 min-h-[500px] rounded-[16px] overflow-hidden"
        style={{
          background: "rgba(13, 27, 42, 0.6)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid var(--border)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
      >
        {/* ── Idle State ── */}
        {status === "idle" && !previewHtml && (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Dot grid background */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
            <div className="relative z-10 flex flex-col items-center text-center">
              {/* Glowing ember icon */}
              <div className="relative mb-5">
                <div className="absolute inset-0 bg-[var(--ember)]/20 blur-2xl rounded-full" />
                <div className="relative w-14 h-14 rounded-2xl border border-[var(--ember)]/20 bg-gradient-to-br from-[var(--ember)]/10 to-transparent flex items-center justify-center">
                  <Zap size={24} className="text-[var(--ember)]" />
                </div>
              </div>
              <p className="text-sm text-[var(--frost)]/80 font-medium mb-1"
                 style={{ fontFamily: "var(--font-body)" }}>
                Your website will appear here
              </p>
              <p className="text-[11px] text-[var(--muted)]"
                 style={{ fontFamily: "var(--font-body)" }}>
                Describe your website or choose a template to start
              </p>
            </div>
          </div>
        )}

        {/* ── Loading State — Premium Skeleton ── */}
        {isLoading && !previewHtml && <PreviewSkeleton />}

        {/* ── WebContainer status overlay ── */}
        {wcLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center"
               style={{ background: "rgba(2,4,8,0.9)" }}>
            <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin mb-3"
                 style={{ borderColor: "var(--cyan)", borderTopColor: "transparent" }} />
            <p className="text-sm font-medium" style={{ color: "var(--frost)", fontFamily: "var(--font-body)" }}>
              {wc.status === "booting" && "Starting sandbox..."}
              {wc.status === "installing" && "Installing packages..."}
              {wc.status === "starting" && "Starting dev server..."}
              {wc.status === "error" && "Sandbox error"}
            </p>
            <p className="text-[11px] mt-1" style={{ color: "var(--muted)" }}>
              {wc.status === "booting" && "WebContainer initializing"}
              {wc.status === "installing" && "npm install running"}
              {wc.status === "starting" && "Vite HMR ready soon"}
              {wc.status === "error" && (wc.error || "Falling back to static preview")}
            </p>
          </div>
        )}

        {/* ── WebContainer preview (v0.2 mode) ── */}
        {wcActive && (
          <div className="h-full flex flex-col">
            <BrowserChrome url={wc.previewUrl} generationId={generationId} />
            <iframe
              src={wc.previewUrl}
              className="w-full flex-1 border-0 bg-white"
              title="Generated site preview (WebContainer)"
            />
          </div>
        )}

        {/* ── HTML preview (v0.1 fallback) ── */}
        {previewHtml && !wcActive && (
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
      </div>

      {/* ── Action Buttons ── */}
      <AnimatePresence>
        {isComplete && finalHtml && (
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
              Download HTML
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Browser Chrome Bar ── */
function BrowserChrome({ url, generationId }: { url?: string; generationId?: string | null }) {
  const displayUrl = url || `arkhos.ai/preview/${generationId ? generationId.slice(0, 8) : "..."}`;
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--border)] bg-[var(--void)]/60">
      <div className="flex gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--error)]/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--warning)]/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--success)]/60" />
      </div>
      <div className="flex-1 flex justify-center">
        <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-md bg-[var(--deep)] text-[10px] text-[var(--muted)]">
          <Globe size={10} />
          <span style={{ fontFamily: "var(--font-code)" }}>{displayUrl}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Premium Skeleton Loading — from Magic MCP ── */
function SkeletonBar({ w, h, className = "" }: { w: string; h: number; className?: string }) {
  return (
    <div
      className={`rounded-[5px] ${className}`}
      style={{
        width: w,
        height: h,
        background: "var(--border)",
        opacity: 0.35,
      }}
    />
  );
}

function PreviewSkeleton() {
  const [shimmerPos, setShimmerPos] = useState(-100);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setShimmerPos((p) => (p >= 200 ? -100 : p + 1.5));
    }, 16);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 0.4));
    }, 30);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Diagonal shimmer sweep — from Magic MCP */}
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          background: `linear-gradient(135deg, transparent ${shimmerPos}%, rgba(0,212,238,0.02) ${shimmerPos + 10}%, rgba(0,212,238,0.06) ${shimmerPos + 20}%, rgba(0,212,238,0.02) ${shimmerPos + 30}%, transparent ${shimmerPos + 40}%)`,
        }}
      />

      {/* Cyan progress line at top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] z-30 overflow-hidden" style={{ background: "var(--border)", opacity: 0.3 }}>
        <div
          className="h-full transition-[width] duration-100 ease-linear"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, rgba(0,212,238,0.3), var(--cyan), rgba(0,212,238,0.3))",
            boxShadow: "0 0 8px rgba(0,212,238,0.4)",
          }}
        />
      </div>

      {/* Skeleton page layout */}
      <div className="relative z-10 p-6 space-y-5">
        {/* Fake navbar */}
        <div className="flex items-center justify-between">
          <SkeletonBar w="100px" h={24} />
          <div className="flex items-center gap-4">
            <SkeletonBar w="50px" h={14} />
            <SkeletonBar w="60px" h={14} />
            <SkeletonBar w="55px" h={14} />
            <SkeletonBar w="70px" h={28} className="rounded-full" />
          </div>
        </div>

        {/* Fake hero */}
        <div className="pt-6 pb-4 space-y-4">
          <div className="flex justify-center">
            <SkeletonBar w="70%" h={40} />
          </div>
          <div className="flex justify-center">
            <SkeletonBar w="50%" h={40} />
          </div>
          <div className="flex justify-center pt-1">
            <SkeletonBar w="60%" h={18} />
          </div>
          <div className="flex justify-center gap-3 pt-3">
            <SkeletonBar w="120px" h={40} className="rounded-full" />
            <SkeletonBar w="120px" h={40} className="rounded-full" />
          </div>
        </div>

        {/* Fake 3-col cards */}
        <div className="grid grid-cols-3 gap-4 pt-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-3 rounded-lg p-4" style={{ border: "1px solid rgba(28,46,66,0.3)" }}>
              <SkeletonBar w="100%" h={100} className="rounded-md" />
              <SkeletonBar w="75%" h={14} />
              <SkeletonBar w="100%" h={10} />
              <SkeletonBar w="85%" h={10} />
            </div>
          ))}
        </div>

        {/* Fake content section */}
        <div className="space-y-2.5 pt-4">
          <SkeletonBar w="40%" h={24} />
          <SkeletonBar w="100%" h={12} />
          <SkeletonBar w="92%" h={12} />
          <SkeletonBar w="85%" h={12} />
          <SkeletonBar w="78%" h={12} />
        </div>

        {/* Fake footer */}
        <div className="pt-6" style={{ borderTop: "1px solid rgba(28,46,66,0.25)" }}>
          <div className="flex items-center justify-between">
            <SkeletonBar w="80px" h={16} />
            <div className="flex gap-3">
              <SkeletonBar w="30px" h={30} className="rounded-full" />
              <SkeletonBar w="30px" h={30} className="rounded-full" />
              <SkeletonBar w="30px" h={30} className="rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Center status pill overlay */}
      <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex items-center gap-2.5 px-5 py-2.5 rounded-full"
          style={{
            background: "rgba(13,27,42,0.85)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,107,53,0.2)",
            boxShadow: "0 0 30px rgba(0,0,0,0.4), 0 0 15px rgba(255,107,53,0.1)",
          }}
        >
          <motion.span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: "var(--ember)", boxShadow: "0 0 8px rgba(255,107,53,0.6)" }}
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-[13px] font-medium text-[var(--frost)]" style={{ fontFamily: "var(--font-body)" }}>
            Building your website
          </span>
          <motion.span
            className="text-[13px] text-[var(--muted)]"
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            ...
          </motion.span>
        </motion.div>
      </div>
    </div>
  );
}
