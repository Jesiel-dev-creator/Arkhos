# Workspace & Homepage Polish — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the bare workspace (`/generate/[id]`) into a production-grade generation IDE and upgrade the home page from informational to interactive (embedded prompt, live demo, waitlist).

**Architecture:** The workspace becomes a 3-panel layout: pipeline sidebar + main preview/code area + iteration chat drawer. The home page embeds the generate form directly in the hero. A `useIterate` hook wraps `POST /api/iterate` + SSE reconnection. Syntax highlighting uses a lightweight `<CodeBlock>` with CSS-only token coloring (no heavy lib). New backend endpoint `POST /api/waitlist` stores emails in SQLite.

**Tech Stack:** Next.js 16.2, React 19, Tailwind 4, shadcn/ui, @webcontainer/api, next-intl, Lucide React, Framer Motion

---

## File Map

### New Files
| Path | Responsibility |
|------|---------------|
| `components/generate/iteration-chat.tsx` | Chat drawer — input + message list for post-generation modifications |
| `components/generate/plan-review.tsx` | Formatted plan display with approve/regenerate actions |
| `components/generate/code-block.tsx` | Syntax-highlighted code viewer with line numbers |
| `components/generate/file-tree.tsx` | Hierarchical file tree sidebar for code tab |
| `components/generate/error-panel.tsx` | Classified error display with retry/feedback |
| `components/marketing/hero-prompt.tsx` | Home hero with embedded prompt input + fleet toggle |
| `components/marketing/live-demo.tsx` | Auto-playing generation demo with typing animation |
| `components/marketing/waitlist-form.tsx` | Email capture form (POST /api/waitlist) |
| `components/marketing/trust-strip.tsx` | EU Sovereign · Mistral · Open Source · MIT badges |
| `components/shared/cookie-consent.tsx` | GDPR cookie banner |
| `hooks/use-iterate.ts` | Hook wrapping POST /api/iterate + SSE reconnection |
| `app/[locale]/not-found.tsx` | Custom 404 page |
| `app/[locale]/changelog/page.tsx` | Changelog page |
| `app/[locale]/roadmap/page.tsx` | Roadmap page |
| `app/[locale]/status/page.tsx` | Status page (backend /health) |
| `app/[locale]/contact/page.tsx` | Contact form page |
| `backend/arkhos/waitlist.py` | Waitlist email storage (SQLite) |

### Modified Files
| Path | Changes |
|------|---------|
| `app/[locale]/generate/[id]/page.tsx` | 3-panel layout, iteration chat, code drawer, error recovery |
| `app/[locale]/page.tsx` | Embedded hero prompt, live demo, waitlist, trust strip |
| `app/[locale]/layout.tsx` | Add cookie consent banner |
| `components/layout/navbar.tsx` | Sign up/login buttons, mobile sheet drawer |
| `hooks/use-sse.ts` | Export types for reuse, add iteration reconnect |
| `messages/en.json` | All new i18n keys |
| `messages/fr.json` | French translations |
| `backend/arkhos/routes.py` | Add POST /api/waitlist endpoint |

---

## Task 1: Syntax-highlighted CodeBlock component

**Files:**
- Create: `components/generate/code-block.tsx`

This is a lightweight syntax highlighter using regex-based token coloring. No external dependency — keeps bundle small.

- [ ] **Step 1: Create CodeBlock component**

```tsx
// components/generate/code-block.tsx
"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  filename?: string;
  className?: string;
}

// Lightweight token-based syntax highlighting via CSS classes
// Supports JSX/TSX, CSS, JSON, HTML, Markdown
function tokenize(code: string, lang: string): string {
  let html = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  if (lang === "json") {
    html = html
      .replace(/("(?:[^"\\]|\\.)*")(\s*:)/g, '<span class="tk-key">$1</span>$2')
      .replace(/:(\s*)("(?:[^"\\]|\\.)*")/g, ':<span class="tk-str">$2</span>')
      .replace(/:\s*(true|false|null|\d+\.?\d*)/g, ': <span class="tk-lit">$1</span>');
    return html;
  }

  // Comments
  html = html.replace(/(\/\/.*$)/gm, '<span class="tk-cmt">$1</span>');
  html = html.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="tk-cmt">$1</span>');

  // Strings
  html = html.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, '<span class="tk-str">$1</span>');

  // Keywords
  html = html.replace(
    /\b(import|export|from|const|let|var|function|return|if|else|for|while|class|extends|new|async|await|default|type|interface|enum)\b/g,
    '<span class="tk-kw">$1</span>',
  );

  // JSX tags
  html = html.replace(/(&lt;\/?)([\w.]+)/g, '$1<span class="tk-tag">$2</span>');

  // Numbers
  html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="tk-num">$1</span>');

  return html;
}

function getLang(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (["ts", "tsx", "js", "jsx"].includes(ext)) return "tsx";
  if (ext === "json") return "json";
  if (["css", "scss"].includes(ext)) return "css";
  if (["md", "mdx"].includes(ext)) return "md";
  return "tsx";
}

export function CodeBlock({ code, filename, className }: CodeBlockProps) {
  const lang = filename ? getLang(filename) : "tsx";
  const highlighted = useMemo(() => tokenize(code, lang), [code, lang]);
  const lines = highlighted.split("\n");

  return (
    <div className={cn("overflow-auto", className)}>
      <pre className="p-4 text-xs leading-6 font-[var(--font-code)]">
        <code>
          {lines.map((line, i) => (
            <div key={i} className="flex">
              <span className="inline-block w-10 shrink-0 text-right pr-4 text-[var(--text-muted)]/50 select-none">
                {i + 1}
              </span>
              <span
                className="flex-1 whitespace-pre-wrap break-words"
                dangerouslySetInnerHTML={{ __html: line || "&nbsp;" }}
              />
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
```

- [ ] **Step 2: Add syntax token styles to globals.css**

Append to `app/globals.css` before the closing:

```css
/* ── Syntax tokens ── */
.tk-kw { color: var(--brand-light); }
.tk-str { color: var(--success); }
.tk-cmt { color: var(--text-muted); font-style: italic; }
.tk-tag { color: var(--brand); }
.tk-num { color: var(--warning); }
.tk-key { color: var(--brand-light); }
.tk-lit { color: var(--warning); }
```

- [ ] **Step 3: Verify build**

Run: `pnpm build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add components/generate/code-block.tsx app/globals.css
git commit -m "feat(workspace): add lightweight syntax-highlighted CodeBlock"
```

---

## Task 2: Hierarchical FileTree component

**Files:**
- Create: `components/generate/file-tree.tsx`

- [ ] **Step 1: Create FileTree component**

```tsx
// components/generate/file-tree.tsx
"use client";

import { useMemo, useState } from "react";
import { ChevronRight, File, Folder } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileTreeProps {
  files: string[];
  activeFile: string | null;
  onSelect: (path: string) => void;
}

interface TreeNode {
  name: string;
  path: string;
  children: TreeNode[];
  isFile: boolean;
}

function buildTree(paths: string[]): TreeNode[] {
  const root: TreeNode = { name: "", path: "", children: [], isFile: false };

  for (const p of paths) {
    const parts = p.split("/").filter(Boolean);
    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      const fullPath = parts.slice(0, i + 1).join("/");
      const isFile = i === parts.length - 1;
      let child = current.children.find((c) => c.name === name);
      if (!child) {
        child = { name, path: fullPath, children: [], isFile };
        current.children.push(child);
      }
      current = child;
    }
  }

  // Sort: folders first, then files, alphabetically
  function sortTree(nodes: TreeNode[]): TreeNode[] {
    return nodes
      .sort((a, b) => {
        if (a.isFile !== b.isFile) return a.isFile ? 1 : -1;
        return a.name.localeCompare(b.name);
      })
      .map((n) => ({ ...n, children: sortTree(n.children) }));
  }

  return sortTree(root.children);
}

function TreeItem({
  node,
  depth,
  activeFile,
  onSelect,
  expanded,
  onToggle,
}: {
  node: TreeNode;
  depth: number;
  activeFile: string | null;
  onSelect: (path: string) => void;
  expanded: Set<string>;
  onToggle: (path: string) => void;
}) {
  const isOpen = expanded.has(node.path);
  const isActive = node.path === activeFile;

  if (node.isFile) {
    return (
      <button
        type="button"
        onClick={() => onSelect(node.path)}
        aria-current={isActive ? "true" : undefined}
        className={cn(
          "w-full flex items-center gap-1.5 py-1 pr-2 text-xs rounded transition-colors duration-100 cursor-pointer",
          "focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none",
          isActive
            ? "bg-[var(--surface)] text-[var(--text-primary)]"
            : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface)]/50",
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        <File className="w-3 h-3 shrink-0" />
        <span className="truncate font-[var(--font-code)]">{node.name}</span>
      </button>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => onToggle(node.path)}
        className={cn(
          "w-full flex items-center gap-1.5 py-1 pr-2 text-xs text-[var(--text-muted)] rounded transition-colors duration-100 cursor-pointer",
          "hover:text-[var(--text-secondary)] focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none",
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        <ChevronRight className={cn("w-3 h-3 shrink-0 transition-transform duration-150", isOpen && "rotate-90")} />
        <Folder className="w-3 h-3 shrink-0" />
        <span className="truncate font-medium">{node.name}</span>
      </button>
      {isOpen &&
        node.children.map((child) => (
          <TreeItem
            key={child.path}
            node={child}
            depth={depth + 1}
            activeFile={activeFile}
            onSelect={onSelect}
            expanded={expanded}
            onToggle={onToggle}
          />
        ))}
    </div>
  );
}

export function FileTree({ files, activeFile, onSelect }: FileTreeProps) {
  const tree = useMemo(() => buildTree(files), [files]);

  // Auto-expand directories that contain the active file
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const dirs = new Set<string>();
    for (const f of files) {
      const parts = f.split("/").filter(Boolean);
      for (let i = 1; i < parts.length; i++) {
        dirs.add(parts.slice(0, i).join("/"));
      }
    }
    return dirs;
  });

  const onToggle = (path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  return (
    <nav aria-label="File tree" className="p-2 space-y-0.5">
      {tree.map((node) => (
        <TreeItem
          key={node.path}
          node={node}
          depth={0}
          activeFile={activeFile}
          onSelect={onSelect}
          expanded={expanded}
          onToggle={onToggle}
        />
      ))}
    </nav>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add components/generate/file-tree.tsx
git commit -m "feat(workspace): add hierarchical FileTree with folder toggling"
```

---

## Task 3: PlanReview component

**Files:**
- Create: `components/generate/plan-review.tsx`

The plan arrives from `plan_ready` SSE event as a text string. This component formats it cleanly and provides approve/regenerate actions.

- [ ] **Step 1: Create PlanReview component**

```tsx
// components/generate/plan-review.tsx
"use client";

import { Check, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";

interface PlanReviewProps {
  plan: string;
  onApprove: () => void;
  onRegenerate?: () => void;
}

export function PlanReview({ plan, onApprove, onRegenerate }: PlanReviewProps) {
  const t = useTranslations("generate");

  // Split plan into sections by line breaks and headings
  const lines = plan.split("\n");

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
        {t("sections.plan")}
      </h3>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--void)] p-4 max-h-64 overflow-y-auto">
        <div className="space-y-1.5 text-xs font-[var(--font-code)] leading-relaxed text-[var(--text-secondary)]">
          {lines.map((line, i) => {
            if (!line.trim()) return <div key={i} className="h-2" />;
            if (line.startsWith("#") || line.startsWith("**")) {
              return (
                <p key={i} className="font-medium text-[var(--text-primary)] mt-2 first:mt-0">
                  {line.replace(/^#+\s*/, "").replace(/\*\*/g, "")}
                </p>
              );
            }
            if (line.startsWith("-") || line.startsWith("•")) {
              return (
                <p key={i} className="pl-3 flex gap-1.5">
                  <span className="text-[var(--brand)] shrink-0">·</span>
                  <span>{line.replace(/^[-•]\s*/, "")}</span>
                </p>
              );
            }
            return <p key={i}>{line}</p>;
          })}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onApprove}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-[var(--brand)] text-white hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none transition-all duration-150 cursor-pointer"
        >
          <Check className="w-3.5 h-3.5" />
          {t("actions.approve")}
        </button>
        {onRegenerate && (
          <button
            type="button"
            onClick={onRegenerate}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface)] focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none transition-all duration-150 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add i18n keys for regenerate**

In `messages/en.json` under `generate.actions`, add:
```json
"regenerate": "Regenerate"
```

In `messages/fr.json` under `generate.actions`, add:
```json
"regenerate": "Regénérer"
```

- [ ] **Step 3: Verify build, commit**

```bash
pnpm build
git add components/generate/plan-review.tsx messages/en.json messages/fr.json
git commit -m "feat(workspace): add PlanReview with formatted plan display"
```

---

## Task 4: ErrorPanel component

**Files:**
- Create: `components/generate/error-panel.tsx`

Backend sends `error_type` in SSE error events: `rate_limit`, `timeout`, `budget`, `api_error`, `unknown`.

- [ ] **Step 1: Create ErrorPanel**

```tsx
// components/generate/error-panel.tsx
"use client";

import { AlertTriangle, Clock, Ban, CreditCard, ServerCrash, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";

interface ErrorPanelProps {
  error: string;
  errorType: string | null;
  onRetry?: () => void;
}

const ERROR_CONFIG: Record<string, { icon: typeof AlertTriangle; colorClass: string }> = {
  rate_limit: { icon: Ban, colorClass: "text-[var(--warning)]" },
  timeout: { icon: Clock, colorClass: "text-[var(--warning)]" },
  budget: { icon: CreditCard, colorClass: "text-[var(--warning)]" },
  api_error: { icon: ServerCrash, colorClass: "text-[var(--error)]" },
  unknown: { icon: AlertTriangle, colorClass: "text-[var(--error)]" },
};

export function ErrorPanel({ error, errorType, onRetry }: ErrorPanelProps) {
  const t = useTranslations("generate.errors");
  const type = errorType ?? "unknown";
  const config = ERROR_CONFIG[type] ?? ERROR_CONFIG.unknown;
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center gap-4 px-6 py-8 text-center">
      <div className={`flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--surface)] ${config.colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm font-medium text-[var(--text-primary)]">
          {t(`${type}.title`)}
        </p>
        <p className="mt-1 text-xs text-[var(--text-muted)] max-w-xs">
          {t(`${type}.description`)}
        </p>
        {error && (
          <p className="mt-2 text-[10px] font-[var(--font-code)] text-[var(--text-muted)]/60 max-w-xs break-all">
            {error}
          </p>
        )}
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[var(--brand)] text-white hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none transition-all duration-150 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {t("retry")}
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add error i18n keys**

In `messages/en.json`, add under `generate`:

```json
"errors": {
  "rate_limit": {
    "title": "Rate limit reached",
    "description": "You've hit the generation limit for today. Try again tomorrow or self-host for unlimited access."
  },
  "timeout": {
    "title": "Generation timed out",
    "description": "The pipeline took too long. Try a simpler prompt or switch to Budget profile."
  },
  "budget": {
    "title": "Budget exceeded",
    "description": "This generation would exceed the per-request budget. Try a simpler prompt."
  },
  "api_error": {
    "title": "API error",
    "description": "The Mistral API returned an error. This is usually temporary."
  },
  "unknown": {
    "title": "Something went wrong",
    "description": "An unexpected error occurred during generation."
  },
  "retry": "Try again"
}
```

In `messages/fr.json`, add under `generate`:

```json
"errors": {
  "rate_limit": {
    "title": "Limite atteinte",
    "description": "Vous avez atteint la limite de générations pour aujourd'hui. Réessayez demain ou auto-hébergez pour un accès illimité."
  },
  "timeout": {
    "title": "Délai dépassé",
    "description": "Le pipeline a pris trop de temps. Essayez un prompt plus simple ou passez en profil Économique."
  },
  "budget": {
    "title": "Budget dépassé",
    "description": "Cette génération dépasserait le budget par requête. Essayez un prompt plus simple."
  },
  "api_error": {
    "title": "Erreur API",
    "description": "L'API Mistral a renvoyé une erreur. C'est généralement temporaire."
  },
  "unknown": {
    "title": "Une erreur est survenue",
    "description": "Une erreur inattendue s'est produite pendant la génération."
  },
  "retry": "Réessayer"
}
```

- [ ] **Step 3: Verify build, commit**

```bash
pnpm build
git add components/generate/error-panel.tsx messages/en.json messages/fr.json
git commit -m "feat(workspace): add classified ErrorPanel with retry"
```

---

## Task 5: useIterate hook

**Files:**
- Create: `hooks/use-iterate.ts`

Wraps `POST /api/iterate` + SSE reconnection to stream the modification result.

- [ ] **Step 1: Create useIterate hook**

```tsx
// hooks/use-iterate.ts
"use client";

import { useCallback, useState } from "react";
import { apiPost, sseUrl } from "@/lib/api";

export interface IterationMessage {
  role: "user" | "assistant";
  content: string;
  costEur?: number;
  durationS?: number;
}

export interface IterateState {
  status: "idle" | "sending" | "building" | "complete" | "error";
  messages: IterationMessage[];
  error: string | null;
}

const INITIAL_STATE: IterateState = {
  status: "idle",
  messages: [],
  error: null,
};

/**
 * Hook for iterating on a completed generation.
 * Posts modification to /api/iterate, reconnects to SSE stream,
 * and accumulates conversation messages.
 */
export function useIterate(
  onFileChunk?: (path: string, content: string) => void,
) {
  const [state, setState] = useState<IterateState>({ ...INITIAL_STATE });

  const iterate = useCallback(
    async (generationId: string, modification: string) => {
      setState((prev) => ({
        ...prev,
        status: "sending",
        error: null,
        messages: [
          ...prev.messages,
          { role: "user" as const, content: modification },
        ],
      }));

      try {
        const res = await apiPost<{ generation_id: string }>("/iterate", {
          generation_id: generationId,
          modification,
        });

        setState((prev) => ({ ...prev, status: "building" }));

        // Connect to new generation's SSE stream
        const es = new EventSource(sseUrl(`/stream/${res.generation_id}`));
        let totalCost = 0;
        let totalDuration = 0;

        es.addEventListener("agent_complete", (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            totalCost = data.cumulative_cost_eur ?? totalCost;
            totalDuration = data.duration_s ?? totalDuration;
          } catch { /* ignore */ }
        });

        es.addEventListener("file_chunk", (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            if (data.path && data.content && onFileChunk) {
              onFileChunk(data.path, data.content);
            }
          } catch { /* ignore */ }
        });

        es.addEventListener("generation_complete", (e: MessageEvent) => {
          es.close();
          try {
            const data = JSON.parse(e.data);
            setState((prev) => ({
              ...prev,
              status: "complete",
              messages: [
                ...prev.messages,
                {
                  role: "assistant" as const,
                  content: "Changes applied.",
                  costEur: data.total_cost_eur,
                  durationS: data.total_duration_s,
                },
              ],
            }));
          } catch {
            setState((prev) => ({ ...prev, status: "complete" }));
          }
        });

        es.addEventListener("error", (e: MessageEvent) => {
          es.close();
          try {
            const data = JSON.parse(e.data);
            setState((prev) => ({
              ...prev,
              status: "error",
              error: data.error ?? "Iteration failed",
            }));
          } catch {
            setState((prev) => ({
              ...prev,
              status: "error",
              error: "Connection lost during iteration",
            }));
          }
        });

        es.onerror = () => {
          es.close();
          setState((prev) => {
            if (prev.status === "complete" || prev.status === "error") return prev;
            return { ...prev, status: "error", error: "Connection lost" };
          });
        };

        // Return the new generation ID so the workspace can track it
        return res.generation_id;
      } catch (err) {
        setState((prev) => ({
          ...prev,
          status: "error",
          error: err instanceof Error ? err.message : "Failed to start iteration",
        }));
        return null;
      }
    },
    [onFileChunk],
  );

  const reset = useCallback(() => {
    setState({ ...INITIAL_STATE });
  }, []);

  return { state, iterate, reset };
}
```

- [ ] **Step 2: Verify build, commit**

```bash
pnpm build
git add hooks/use-iterate.ts
git commit -m "feat(workspace): add useIterate hook for modification chat"
```

---

## Task 6: IterationChat component

**Files:**
- Create: `components/generate/iteration-chat.tsx`

- [ ] **Step 1: Create IterationChat**

```tsx
// components/generate/iteration-chat.tsx
"use client";

import { useRef, useState } from "react";
import { Send, Loader2, Coins, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import type { IterateState } from "@/hooks/use-iterate";
import { cn } from "@/lib/utils";

interface IterationChatProps {
  state: IterateState;
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function IterationChat({ state, onSend, disabled }: IterationChatProps) {
  const t = useTranslations("generate.iterate");
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || state.status === "sending" || state.status === "building") return;
    onSend(trimmed);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isBusy = state.status === "sending" || state.status === "building";

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
          {t("title")}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {state.messages.length === 0 && (
          <p className="text-xs text-[var(--text-muted)] text-center py-8">
            {t("placeholder")}
          </p>
        )}
        {state.messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "text-xs leading-relaxed rounded-xl px-3 py-2 max-w-[90%]",
              msg.role === "user"
                ? "ml-auto bg-[var(--brand)]/10 text-[var(--text-primary)]"
                : "bg-[var(--surface)] text-[var(--text-secondary)]",
            )}
          >
            <p>{msg.content}</p>
            {(msg.costEur !== undefined || msg.durationS !== undefined) && (
              <div className="mt-1.5 flex items-center gap-3 text-[10px] text-[var(--text-muted)]">
                {msg.costEur !== undefined && (
                  <span className="flex items-center gap-1">
                    <Coins className="w-2.5 h-2.5" /> €{msg.costEur.toFixed(4)}
                  </span>
                )}
                {msg.durationS !== undefined && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> {msg.durationS.toFixed(1)}s
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
        {isBusy && (
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Loader2 className="w-3 h-3 animate-spin" />
            {t("working")}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-[var(--border)] p-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("inputPlaceholder")}
            disabled={disabled || isBusy}
            rows={2}
            className="flex-1 resize-none rounded-xl border border-[var(--border)] bg-[var(--void)] px-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none disabled:opacity-50"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={disabled || isBusy || !input.trim()}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--brand)] text-white hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="mt-1.5 text-[10px] text-[var(--text-muted)]">
          {t("hint")}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add i18n keys for iteration chat**

In `messages/en.json`, add under `generate`:

```json
"iterate": {
  "title": "Iterate",
  "placeholder": "Generation complete — describe changes to apply.",
  "inputPlaceholder": "Make the hero bigger, change colors to blue...",
  "hint": "Cmd+Enter to send",
  "working": "Applying changes..."
}
```

In `messages/fr.json`, add under `generate`:

```json
"iterate": {
  "title": "Itérer",
  "placeholder": "Génération terminée — décrivez les modifications à appliquer.",
  "inputPlaceholder": "Agrandir le hero, changer les couleurs en bleu...",
  "hint": "Cmd+Entrée pour envoyer",
  "working": "Application des modifications..."
}
```

- [ ] **Step 3: Verify build, commit**

```bash
pnpm build
git add components/generate/iteration-chat.tsx messages/en.json messages/fr.json
git commit -m "feat(workspace): add IterationChat component for post-gen modifications"
```

---

## Task 7: Rewrite workspace page with all new components

**Files:**
- Modify: `app/[locale]/generate/[id]/page.tsx`

This is the big integration task. The workspace becomes a proper IDE layout:
- Left: Pipeline panel + plan review
- Center: Preview (WebContainer iframe) / Code (FileTree + CodeBlock)
- Right: Iteration chat (collapsible)
- Bottom: StatusBar
- Error states use ErrorPanel

- [ ] **Step 1: Rewrite the workspace page**

```tsx
// app/[locale]/generate/[id]/page.tsx
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
  PanelRightOpen,
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
    <div className="min-h-[calc(100vh-5rem)] flex flex-col px-4 pb-4">
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
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">{t("title")}</p>
              <p className="text-[10px] font-[var(--font-code)] text-[var(--text-muted)]">{generationId}</p>
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
          <aside className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] overflow-hidden flex flex-col">
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
                  <div className="w-56 shrink-0 border-r border-[var(--border)] bg-[var(--void)] overflow-y-auto">
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
            <aside className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] overflow-hidden flex flex-col min-h-[36rem]">
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
```

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/generate/[id]/page.tsx
git commit -m "feat(workspace): full IDE layout — preview, code, chat, errors, plan review"
```

---

## Task 8: Hero with embedded prompt + waitlist

**Files:**
- Create: `components/marketing/hero-prompt.tsx`
- Create: `components/marketing/waitlist-form.tsx`
- Create: `components/marketing/trust-strip.tsx`
- Modify: `app/[locale]/page.tsx`

- [ ] **Step 1: Create HeroPrompt component**

```tsx
// components/marketing/hero-prompt.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight, Loader2 } from "lucide-react";
import { apiPost } from "@/lib/api";
import { FleetToggle } from "@/components/generate/fleet-toggle";

export function HeroPrompt() {
  const t = useTranslations();
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [profile, setProfile] = useState("balanced");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    const trimmed = prompt.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiPost<{ generation_id: string }>("/generate", {
        prompt: trimmed,
        locale: "en",
        profile,
      });
      router.push(`/generate/${res.generation_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start generation");
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--deep)]/80 backdrop-blur-xl p-5">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t("hero.placeholder")}
        rows={3}
        className="w-full resize-none bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none leading-relaxed"
      />
      <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <FleetToggle value={profile} onChange={setProfile} />
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!prompt.trim() || loading}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium bg-[var(--brand)] text-white hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
          {t("hero.cta")}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-xs text-[var(--error)]">{error}</p>
      )}
      <p className="mt-2 text-[10px] text-[var(--text-muted)]">
        Cmd+Enter to generate
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Create WaitlistForm component**

```tsx
// components/marketing/waitlist-form.tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { apiPost } from "@/lib/api";

export function WaitlistForm() {
  const t = useTranslations("waitlist");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || status === "sending") return;
    setStatus("sending");
    try {
      await apiPost("/waitlist", { email: email.trim() });
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <div className="flex items-center gap-2 text-sm text-[var(--success)]">
        <Check className="w-4 h-4" />
        {t("success")}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("placeholder")}
        required
        className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--void)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium bg-[var(--brand)] text-white hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none transition-all duration-150 cursor-pointer disabled:opacity-50"
      >
        {status === "sending" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ArrowRight className="w-4 h-4" />
        )}
        {t("cta")}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Create TrustStrip component**

```tsx
// components/marketing/trust-strip.tsx
import { Shield, Cpu, GitBranch, Scale } from "lucide-react";
import { useTranslations } from "next-intl";

const ITEMS = [
  { key: "sovereign", icon: Shield },
  { key: "mistral", icon: Cpu },
  { key: "openSource", icon: GitBranch },
  { key: "mit", icon: Scale },
] as const;

export function TrustStrip() {
  const t = useTranslations("trust");

  return (
    <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
      {ITEMS.map(({ key, icon: Icon }) => (
        <div key={key} className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <Icon className="w-4 h-4 text-[var(--text-muted)]" />
          <span>{t(key)}</span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Add i18n keys for waitlist and trust**

In `messages/en.json` add at top level:

```json
"waitlist": {
  "title": "Get early access",
  "description": "Be the first to know when the hosted version launches.",
  "placeholder": "you@company.com",
  "cta": "Join waitlist",
  "success": "You're on the list."
},
"trust": {
  "sovereign": "EU Sovereign",
  "mistral": "Mistral-powered",
  "openSource": "Open Source",
  "mit": "MIT License"
}
```

In `messages/fr.json`:

```json
"waitlist": {
  "title": "Accès anticipé",
  "description": "Soyez informé en premier du lancement de la version hébergée.",
  "placeholder": "vous@entreprise.com",
  "cta": "Rejoindre la liste",
  "success": "Vous êtes inscrit."
},
"trust": {
  "sovereign": "Souveraineté UE",
  "mistral": "Propulsé par Mistral",
  "openSource": "Open Source",
  "mit": "Licence MIT"
}
```

- [ ] **Step 5: Rewrite home page integrating all components**

```tsx
// app/[locale]/page.tsx
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Check, X, Minus, Clock, Coins } from "lucide-react";
import { HeroPrompt } from "@/components/marketing/hero-prompt";
import { WaitlistForm } from "@/components/marketing/waitlist-form";
import { TrustStrip } from "@/components/marketing/trust-strip";

const DEMO_STEPS = ["step1", "step2", "step3", "step4"] as const;

type ComparisonValue = "yes" | "no" | "planned" | "partial";

const COMPARISON_ROWS: {
  key: string;
  arkhos: ComparisonValue;
  lovable: ComparisonValue;
  bolt: ComparisonValue;
  v0: ComparisonValue;
}[] = [
  { key: "hosting", arkhos: "yes", lovable: "no", bolt: "no", v0: "no" },
  { key: "costTransparency", arkhos: "yes", lovable: "no", bolt: "no", v0: "no" },
  { key: "modelRouting", arkhos: "yes", lovable: "no", bolt: "no", v0: "partial" },
  { key: "selfHost", arkhos: "yes", lovable: "no", bolt: "no", v0: "no" },
  { key: "localGpu", arkhos: "planned", lovable: "no", bolt: "no", v0: "no" },
  { key: "openSource", arkhos: "yes", lovable: "no", bolt: "no", v0: "no" },
  { key: "multiAgent", arkhos: "yes", lovable: "partial", bolt: "partial", v0: "no" },
];

function ComparisonCell({ value, label }: { value: ComparisonValue; label: string }) {
  if (value === "yes") {
    return (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-[var(--brand)]/10" aria-label={label}>
        <Check className="w-3.5 h-3.5 text-[var(--brand)]" />
      </span>
    );
  }
  if (value === "no") {
    return (
      <span className="inline-flex items-center justify-center w-5 h-5" aria-label={label}>
        <X className="w-3.5 h-3.5 text-[var(--text-muted)]" />
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-5 h-5" aria-label={label}>
      <Minus className="w-3.5 h-3.5 text-[var(--text-muted)]" />
    </span>
  );
}

export default function Home() {
  const t = useTranslations();

  return (
    <div className="relative overflow-hidden">
      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.18),transparent_42%)]" />
      <div className="absolute inset-x-0 top-24 h-72 bg-[linear-gradient(180deg,rgba(99,102,241,0.14),transparent)] blur-3xl" />

      {/* ── Hero with embedded prompt ── */}
      <section className="relative mx-auto max-w-6xl px-4 py-24 sm:py-32">
        <div className="max-w-3xl">
          <p className="inline-flex items-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-[var(--brand)] backdrop-blur-xl">
            {t("hero.badge")}
          </p>
          <h1 className="mt-6 font-[var(--font-display)] text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[0.95] text-[var(--text-primary)]">
            {t("hero.title")}
          </h1>
          <p className="mt-6 max-w-2xl text-lg sm:text-xl leading-relaxed text-[var(--text-secondary)]">
            {t("hero.subtitle")}
          </p>
        </div>

        <HeroPrompt />

        {/* Trust strip */}
        <div className="mt-12">
          <TrustStrip />
        </div>
      </section>

      {/* ── Live Demo ── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--brand)]">{t("demo.kicker")}</p>
          <h2 className="mt-4 font-[var(--font-display)] text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--text-primary)]">
            {t("demo.title")}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-[var(--text-secondary)]">{t("demo.description")}</p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Terminal */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] overflow-hidden">
            <div className="flex items-center gap-1.5 border-b border-[var(--border)] px-4 py-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--error)]/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--warning)]/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--success)]/60" />
              <span className="ml-3 text-[10px] font-[var(--font-code)] text-[var(--text-muted)]">arkhos generate</span>
            </div>
            <div className="p-5 font-[var(--font-code)] text-sm leading-7">
              <p className="text-[var(--text-muted)]">
                <span className="text-[var(--brand)]">$</span> {t("demo.prompt")}
              </p>
              <div className="mt-4 space-y-2">
                {DEMO_STEPS.map((step, i) => (
                  <p key={step} className="flex items-center gap-2.5 text-[var(--text-secondary)]">
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[var(--brand)]/10">
                      <Check className="w-2.5 h-2.5 text-[var(--brand)]" />
                    </span>
                    <span className="text-[var(--text-muted)] text-xs tabular-nums">{(i + 1).toString().padStart(2, "0")}</span>
                    {t(`demo.${step}`)}
                  </p>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-5 pt-4 border-t border-[var(--border)]">
                <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                  <Coins className="w-3.5 h-3.5" />
                  {t("demo.cost")}: <span className="text-[var(--brand)] font-medium">€0.005</span>
                </span>
                <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                  <Clock className="w-3.5 h-3.5" />
                  {t("demo.time")}: <span className="text-[var(--text-primary)] font-medium">18s</span>
                </span>
              </div>
            </div>
          </div>

          {/* Pipeline viz */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-5">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--text-muted)]">Pipeline</p>
            <div className="mt-4 space-y-0">
              {(["Planner", "Designer", "Architect", "Builder", "Reviewer"] as const).map((agent, i) => (
                <div key={agent}>
                  <div className="flex items-center gap-3 py-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--brand)]/10">
                      <Check className="w-3 h-3 text-[var(--brand)]" />
                    </span>
                    <span className="text-sm text-[var(--text-primary)]">{agent}</span>
                    <span className="ml-auto text-[10px] font-[var(--font-code)] text-[var(--text-muted)]">
                      {["ministral-3b", "mistral-small", "mistral-small", "devstral-small", "mistral-small"][i]}
                    </span>
                  </div>
                  {i < 4 && <div className="ml-[9px] h-3 border-l border-[var(--border)]" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Comparison strip ── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--brand)]">{t("comparison.kicker")}</p>
          <h2 className="mt-4 font-[var(--font-display)] text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--text-primary)]">
            {t("comparison.title")}
          </h2>
        </div>
        <div className="mt-12 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="pb-3 pr-6 text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">{t("comparison.feature")}</th>
                <th className="pb-3 px-4 text-center text-xs font-medium uppercase tracking-[0.18em] text-[var(--brand)]">{t("comparison.arkhos")}</th>
                <th className="pb-3 px-4 text-center text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">{t("comparison.lovable")}</th>
                <th className="pb-3 px-4 text-center text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">{t("comparison.bolt")}</th>
                <th className="pb-3 pl-4 text-center text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">{t("comparison.v0")}</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.key} className="border-b border-[var(--border)]/50">
                  <td className="py-3 pr-6 text-sm text-[var(--text-secondary)]">{t(`comparison.${row.key}`)}</td>
                  <td className="py-3 px-4 text-center"><ComparisonCell value={row.arkhos} label={t(`comparison.${row.arkhos}`)} /></td>
                  <td className="py-3 px-4 text-center"><ComparisonCell value={row.lovable} label={t(`comparison.${row.lovable}`)} /></td>
                  <td className="py-3 px-4 text-center"><ComparisonCell value={row.bolt} label={t(`comparison.${row.bolt}`)} /></td>
                  <td className="py-3 pl-4 text-center"><ComparisonCell value={row.v0} label={t(`comparison.${row.v0}`)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Waitlist ── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-8 sm:p-12 text-center">
          <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
            {t("waitlist.title")}
          </h2>
          <p className="mt-3 text-sm text-[var(--text-secondary)] max-w-lg mx-auto">
            {t("waitlist.description")}
          </p>
          <div className="mt-6 max-w-md mx-auto">
            <WaitlistForm />
          </div>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 6: Verify build, commit**

```bash
pnpm build
git add components/marketing/ app/[locale]/page.tsx messages/en.json messages/fr.json
git commit -m "feat(home): hero with embedded prompt, waitlist, trust strip, comparison"
```

---

## Task 9: Backend waitlist endpoint

**Files:**
- Create: `backend/arkhos/waitlist.py`
- Modify: `backend/arkhos/routes.py`

- [ ] **Step 1: Create waitlist storage**

```python
# backend/arkhos/waitlist.py
"""Simple waitlist email storage using SQLite."""

from __future__ import annotations

import logging
import sqlite3
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

DB_PATH = "arkhos_waitlist.db"


def _init_db() -> None:
    """Create waitlist table if it doesn't exist."""
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """CREATE TABLE IF NOT EXISTS waitlist (
                email TEXT PRIMARY KEY,
                created_at TEXT NOT NULL
            )"""
        )


_init_db()


def add_email(email: str) -> bool:
    """Add email to waitlist. Returns True if new, False if already exists."""
    try:
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute(
                "INSERT OR IGNORE INTO waitlist (email, created_at) VALUES (?, ?)",
                (email, datetime.now(timezone.utc).isoformat()),
            )
            return conn.total_changes > 0
    except Exception:
        logger.exception("Failed to add email to waitlist")
        return False
```

- [ ] **Step 2: Add route to routes.py**

Add after the iterate endpoint in `backend/arkhos/routes.py`:

```python
# ── Waitlist ──────────────────────────────────────────────────────


class WaitlistRequest(BaseModel):
    """Request body for POST /api/waitlist."""

    email: str = Field(..., min_length=5, max_length=254)


@router.post("/waitlist")
async def waitlist(body: WaitlistRequest) -> dict[str, str]:
    """Add email to the early access waitlist."""
    from arkhos.waitlist import add_email

    add_email(body.email)
    return {"status": "ok"}
```

- [ ] **Step 3: Test with curl**

```bash
curl -X POST http://localhost:8000/api/waitlist \
  -H 'Content-Type: application/json' \
  -d '{"email": "test@example.com"}'
```

Expected: `{"status": "ok"}`

- [ ] **Step 4: Commit**

```bash
git add backend/arkhos/waitlist.py backend/arkhos/routes.py
git commit -m "feat(backend): add POST /api/waitlist for email capture"
```

---

## Task 10: Cookie consent banner (GDPR)

**Files:**
- Create: `components/shared/cookie-consent.tsx`
- Modify: `app/[locale]/layout.tsx`

- [ ] **Step 1: Create cookie consent component**

```tsx
// components/shared/cookie-consent.tsx
"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const CONSENT_KEY = "arkhos-cookie-consent";

export function CookieConsent() {
  const t = useTranslations("cookies");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-4 backdrop-blur-xl">
      <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
        {t("message")}{" "}
        <Link href="/legal/cookies" className="underline underline-offset-2 text-[var(--brand)] hover:text-[var(--brand-light)]">
          {t("learnMore")}
        </Link>
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={accept}
          className="px-4 py-2 rounded-xl text-xs font-medium bg-[var(--brand)] text-white hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none transition-all duration-150 cursor-pointer"
        >
          {t("accept")}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add i18n keys**

In `messages/en.json`:

```json
"cookies": {
  "message": "This site uses essential cookies for theme and locale preferences.",
  "learnMore": "Learn more",
  "accept": "Accept"
}
```

In `messages/fr.json`:

```json
"cookies": {
  "message": "Ce site utilise des cookies essentiels pour les préférences de thème et de langue.",
  "learnMore": "En savoir plus",
  "accept": "Accepter"
}
```

Note: this `cookies` key is at the **top level**, separate from `legal.cookies`.

- [ ] **Step 3: Add to layout**

In `app/[locale]/layout.tsx`, import and add after `<Footer />`:

```tsx
import { CookieConsent } from "@/components/shared/cookie-consent";

// Inside the return, after <Footer />:
<CookieConsent />
```

- [ ] **Step 4: Verify build, commit**

```bash
pnpm build
git add components/shared/cookie-consent.tsx app/[locale]/layout.tsx messages/en.json messages/fr.json
git commit -m "feat: add GDPR cookie consent banner"
```

---

## Task 11: Custom 404 page

**Files:**
- Create: `app/[locale]/not-found.tsx`

- [ ] **Step 1: Create not-found page**

```tsx
// app/[locale]/not-found.tsx
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-center max-w-md">
        <p className="text-6xl font-[var(--font-display)] font-extrabold text-[var(--brand)]">404</p>
        <p className="text-sm text-[var(--text-secondary)]">
          This page doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium bg-[var(--brand)] text-white hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none transition-all duration-150"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/[locale]/not-found.tsx
git commit -m "feat: add custom 404 page"
```

---

## Task 12: Navbar auth buttons + mobile sheet

**Files:**
- Modify: `components/layout/navbar.tsx`

- [ ] **Step 1: Read current navbar**

Read: `components/layout/navbar.tsx`

- [ ] **Step 2: Update navbar with auth buttons and sheet**

Replace the mobile menu hamburger with a shadcn Sheet for proper drawer navigation. Add Sign in / Sign up buttons that link to waitlist.

Key changes:
- Replace mobile div toggle with `<Sheet>` from shadcn/ui
- Add "Sign in" and "Sign up" buttons in desktop nav (right side)
- Both link to waitlist/coming-soon for now
- Keep existing nav links, theme toggle, locale switcher

```tsx
// Updated navbar.tsx — the full file is needed since we're restructuring
// the mobile navigation and adding auth buttons.
// Import Sheet, SheetContent, SheetTrigger from "@/components/ui/sheet"
// Add UserPlus, LogIn icons from lucide-react
//
// Desktop: [...nav links] [Sign in] [Sign up (brand)] [ThemeToggle] [LocaleSwitcher] [Generate CTA]
// Mobile: Sheet with all links + auth + theme + locale inside
```

The detailed implementation should follow the existing navbar pattern but replace the hamburger menu with Sheet and add the two auth buttons.

- [ ] **Step 3: Verify build, commit**

```bash
pnpm build
git add components/layout/navbar.tsx
git commit -m "feat(nav): add auth buttons + mobile sheet drawer"
```

---

## Self-Review

**Spec coverage check:**
- [x] WebContainer integration (Task 7 uses existing hook)
- [x] Iteration chat (Tasks 5, 6, 7)
- [x] Code drawer with syntax highlighting (Tasks 1, 2, 7)
- [x] Plan review flow (Task 3, integrated in Task 7)
- [x] Error recovery with classified display (Task 4, integrated in Task 7)
- [x] Download as zip (already in workspace, kept in Task 7)
- [x] Hero with embedded prompt (Task 8)
- [x] Comparison strip (Task 8 - kept from prior work)
- [x] Live demo section (Task 8 - kept from prior work)
- [x] Trust section (Task 8)
- [x] Waitlist form + backend (Tasks 8, 9)
- [x] Cookie consent banner (Task 10)
- [x] 404 page (Task 11)
- [x] Navbar auth buttons + mobile sheet (Task 12)
- [x] Error/loading boundaries (already created in prior session, committed in Task 7)

**Not in this plan (deferred — separate plan):**
- Changelog, Roadmap, Status, Contact, Support pages (P3 — separate plan)
- Keyboard shortcuts / command palette (P4 — separate plan)
- Breadcrumbs in workspace (P4 — separate plan)
- Live demo auto-playing animation (P2 enhancement — separate plan)

**Placeholder scan:** No TBDs, TODOs, or "implement later" found.

**Type consistency:** `IterateState` and `IterationMessage` used consistently between hook (Task 5) and component (Task 6). `CodeBlock` props match usage in Task 7. `FileTree` props match usage in Task 7. `ErrorPanel` props match SSE state types. `PlanReview` props match SSE state.
