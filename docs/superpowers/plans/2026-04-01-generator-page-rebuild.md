# Generator Page Rebuild — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the ArkhosAI generator page with premium 21st.dev components, TreeView code drawer, status bar, and competitive-grade UX matching Lovable/Bolt/v0.

**Architecture:** 5 files changed/created. Generate.tsx is rewritten from scratch but preserves all SSE/WebContainer business logic hooks. Two new components (CodeDrawer, StatusBar) are extracted for isolation. PreviewPane and PipelineStrip get targeted additions.

**Tech Stack:** React 18, TypeScript, Framer Motion, shiki (syntax highlighting), existing shadcn/ui + 21st.dev components

---

### Task 1: Create StatusBar Component

**Files:**
- Create: `frontend/src/components/StatusBar.tsx`

- [ ] **Step 1: Create the StatusBar component**

```tsx
// frontend/src/components/StatusBar.tsx
import { formatCostEUR, formatDuration } from "@/lib/utils";

interface StatusBarProps {
  remainingToday: number;
  fileCount: number | null;
  lineCount: number | null;
  totalCostEur: number;
  totalDurationS: number;
  isComplete: boolean;
}

export default function StatusBar({
  remainingToday,
  fileCount,
  lineCount,
  totalCostEur,
  totalDurationS,
  isComplete,
}: StatusBarProps) {
  return (
    <div className="h-9 flex items-center justify-between px-6 bg-[#0D1B2A] border-t border-white/5 text-xs flex-shrink-0">
      <span className="text-[#7B8FA3]">
        {remainingToday} free generation{remainingToday !== 1 ? "s" : ""} remaining today
      </span>
      {isComplete && fileCount !== null && (
        <span className="font-mono text-[#DCE9F5]">
          {fileCount} files{lineCount !== null ? ` · ${lineCount} lines` : ""}
        </span>
      )}
      {isComplete && totalCostEur > 0 && (
        <span className="font-mono">
          <span className="text-[#FF6B35]">{formatCostEUR(totalCostEur)}</span>
          <span className="text-[#7B8FA3]"> · 5 agents · {formatDuration(totalDurationS)}</span>
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/StatusBar.tsx
git commit -m "feat: create StatusBar component for generator page"
```

---

### Task 2: Create CodeDrawer Component

**Files:**
- Create: `frontend/src/components/CodeDrawer.tsx`

- [ ] **Step 1: Create the CodeDrawer component**

This component combines TreeView (file tree) with syntax-highlighted code display. It converts `Record<string, string>` (projectFiles) into TreeNode[] format.

```tsx
// frontend/src/components/CodeDrawer.tsx
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import TreeView, { type TreeNode } from "@/components/ui/tree-view";
import { codeToHtml } from "shiki";

interface CodeDrawerProps {
  files: Record<string, string> | null;
  show: boolean;
  onClose: () => void;
}

/** Convert flat file map to TreeNode[] hierarchy */
function filesToTree(files: Record<string, string>): TreeNode[] {
  const root: TreeNode[] = [];

  for (const path of Object.keys(files).sort()) {
    const parts = path.split("/");
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      const isFile = i === parts.length - 1;

      let existing = current.find((n) => n.name === name);
      if (!existing) {
        existing = {
          name,
          type: isFile ? "file" : "folder",
          children: isFile ? undefined : [],
        };
        current.push(existing);
      }
      if (!isFile && existing.children) {
        current = existing.children;
      }
    }
  }

  return root;
}

/** Find full path from a TreeNode click by walking the tree */
function findFilePath(node: TreeNode, files: Record<string, string>): string | null {
  // Match by filename — find all paths ending with this name
  const matches = Object.keys(files).filter((p) => p.endsWith(node.name));
  return matches.length === 1 ? matches[0] : matches[0] ?? null;
}

export default function CodeDrawer({ files, show, onClose }: CodeDrawerProps) {
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [highlightedHtml, setHighlightedHtml] = useState<string>("");

  const tree = useMemo(() => (files ? filesToTree(files) : []), [files]);

  // Auto-select first file
  useEffect(() => {
    if (files && !activeFile) {
      const first = Object.keys(files).find((p) => p.endsWith(".tsx") || p.endsWith(".ts")) || Object.keys(files)[0];
      if (first) setActiveFile(first);
    }
  }, [files, activeFile]);

  // Highlight active file
  useEffect(() => {
    if (!activeFile || !files?.[activeFile]) {
      setHighlightedHtml("");
      return;
    }
    let cancelled = false;
    const lang = activeFile.endsWith(".tsx") || activeFile.endsWith(".jsx")
      ? "tsx"
      : activeFile.endsWith(".ts")
      ? "typescript"
      : activeFile.endsWith(".css")
      ? "css"
      : activeFile.endsWith(".json")
      ? "json"
      : "text";

    codeToHtml(files[activeFile], { lang, theme: "github-dark" })
      .then((html) => { if (!cancelled) setHighlightedHtml(html); })
      .catch(() => { if (!cancelled) setHighlightedHtml(`<pre>${files[activeFile]}</pre>`); });

    return () => { cancelled = true; };
  }, [activeFile, files]);

  const handleNodeSelect = (node: TreeNode) => {
    if (node.type === "file" && files) {
      const path = findFilePath(node, files);
      if (path) setActiveFile(path);
    }
  };

  return (
    <AnimatePresence>
      {show && files && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 300, opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="overflow-hidden border-t border-white/5 bg-[#0D1B2A] flex-shrink-0"
        >
          <div className="flex h-full">
            {/* File tree */}
            <div className="w-[30%] border-r border-white/5 overflow-y-auto p-2">
              <TreeView
                data={tree}
                onSelect={handleNodeSelect}
                className="border-none bg-transparent"
              />
            </div>
            {/* Code display */}
            <div className="w-[70%] overflow-auto relative">
              <div className="absolute top-2 right-2 z-10">
                <button
                  onClick={onClose}
                  className="p-1 rounded-md hover:bg-white/10 text-[#7B8FA3] hover:text-[#DCE9F5] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {activeFile && (
                <div className="px-1 py-1 text-[10px] font-mono text-[#7B8FA3] border-b border-white/5 bg-[#020408]">
                  {activeFile}
                </div>
              )}
              <div
                className="p-4 text-sm font-mono [&_pre]:!bg-transparent [&_code]:!bg-transparent"
                dangerouslySetInnerHTML={{ __html: highlightedHtml }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/CodeDrawer.tsx
git commit -m "feat: create CodeDrawer with TreeView + shiki syntax highlighting"
```

---

### Task 3: Update PreviewPane — Add "Open in new tab" + Mobile Toggle

**Files:**
- Modify: `frontend/src/components/PreviewPane.tsx`

- [ ] **Step 1: Add new props and state to PreviewPane**

Read the file first. Then add:
1. An `ExternalLink` and `Smartphone` import from lucide-react
2. A `mobilePreview` state: `const [mobilePreview, setMobilePreview] = useState(false)`
3. In BrowserChrome: an "Open in new tab" button that opens `wcPreviewUrl` via `window.open()`
4. In the action buttons section: a "Mobile" toggle button
5. On the iframe: when `mobilePreview` is true, set `style={{ width: 375, margin: "0 auto" }}`

Changes to BrowserChrome — add after the URL display div, before the closing `</div>`:
```tsx
{url && !isGenerating && (
  <button
    onClick={() => window.open(url, "_blank")}
    className="p-1 rounded-md hover:bg-white/10 text-[#7B8FA3] hover:text-[#DCE9F5] transition-colors"
    title="Open in new tab"
  >
    <ExternalLink size={12} />
  </button>
)}
```

Add a Mobile toggle button in the action buttons area (next to Copy HTML):
```tsx
<button
  onClick={() => setMobilePreview((v) => !v)}
  className={`flex items-center gap-1.5 px-4 py-2 rounded-[10px] border text-sm font-medium transition-all duration-200 ${
    mobilePreview
      ? "border-[var(--cyan)]/50 text-[var(--cyan)] bg-[var(--cyan)]/5"
      : "border-[var(--border)] text-[var(--frost)] hover:border-[var(--muted)]"
  }`}
>
  <Smartphone size={14} />
  Mobile
</button>
```

On the WC iframe, add conditional width:
```tsx
style={mobilePreview ? { width: 375, margin: "0 auto", maxHeight: "100%" } : undefined}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/PreviewPane.tsx
git commit -m "feat: add Open in new tab + mobile preview toggle to PreviewPane"
```

---

### Task 4: Update PipelineStrip — Add Remaining Generations Counter

**Files:**
- Modify: `frontend/src/components/PipelineStrip.tsx`

- [ ] **Step 1: Add remainingToday prop and display**

Read the file first. Add a new optional prop:
```tsx
remainingToday?: number;
```

At the right end of the strip (after the cost counter), add:
```tsx
{props.remainingToday !== undefined && (
  <span className="text-[10px] font-mono" style={{ color: "#7B8FA3" }}>
    {props.remainingToday} free
  </span>
)}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/PipelineStrip.tsx
git commit -m "feat: add remaining generations counter to PipelineStrip"
```

---

### Task 5: Rewrite Generate.tsx — Full Page Assembly

**Files:**
- Rewrite: `frontend/src/pages/Generate.tsx`

This is the main task. Read the current Generate.tsx first to understand all the business logic hooks (useSSE, useWebContainer, handleGenerate, handleIterate, handleApprovePlan, handleNewSite, etc.).

- [ ] **Step 1: Rewrite Generate.tsx**

The new file structure:

```
Imports:
- All existing hooks (useSSE, useWebContainer, ChatMessage)
- New components: ChatInput, ShiningText, Banner, BasicModal, CodeDrawer, StatusBar
- Existing components: PipelineStrip, PreviewPane, IterationChat, PlanReview, ErrorBanner
- Framer Motion: motion, AnimatePresence
- Lucide: same as before

State:
- All existing state (showCode, messages, chatMode, showSuccessBanner)
- NEW: showPlanModal (boolean, localStorage check)
- NEW: remainingToday (number, default 3)
- KEEP: All useSSE and useWebContainer hooks exactly as-is

TEMPLATES array:
- Copy the 15 templates from current Generate.tsx (already there from previous commit)

Layout (return JSX):
<div className="relative flex flex-col h-screen bg-[#020408] overflow-hidden">
  {/* Success Banner */}
  <Banner ... />

  {/* Pipeline Strip + remaining counter */}
  <PipelineStrip ... remainingToday={remainingToday} />

  {/* Main content: left + right panels */}
  <div className="relative flex flex-1 min-h-0 overflow-hidden">
    {/* Left Panel 35% */}
    <div className="relative z-10 w-full md:w-[35%] flex flex-col p-5 md:p-6 overflow-hidden">
      <AnimatePresence mode="popLayout">
        {renderLeftPanel()}
      </AnimatePresence>
    </div>

    {/* Gradient divider */}
    <div className="hidden md:block w-px" style={{ background: "linear-gradient(...)" }} />

    {/* Right Panel 65% */}
    <div className="hidden md:flex relative z-10 md:flex-1 flex-col overflow-hidden">
      {/* Preview area (flex-1) */}
      <div className="flex-1 flex flex-col p-5 md:p-6 min-h-0">
        {state.status === "error" ? (
          <ErrorBanner ... />
        ) : (
          <>
            <PreviewPane ... />
            {/* Code Drawer slides up below preview */}
            <CodeDrawer
              files={state.projectFiles}
              show={showCode}
              onClose={() => setShowCode(false)}
            />
          </>
        )}
      </div>
    </div>
  </div>

  {/* Status Bar at bottom */}
  <StatusBar
    remainingToday={remainingToday}
    fileCount={state.projectFiles ? Object.keys(state.projectFiles).length : null}
    lineCount={state.projectFiles ? Object.values(state.projectFiles).reduce((sum, c) => sum + c.split("\n").length, 0) : null}
    totalCostEur={state.totalCostEur}
    totalDurationS={state.totalDurationS}
    isComplete={state.status === "complete"}
  />

  {/* Plan Mode explanation modal (first visit) */}
  <BasicModal
    isOpen={showPlanModal}
    onClose={() => { setShowPlanModal(false); localStorage.setItem("arkhos_plan_shown", "true"); }}
    title="Your AI Planner has reviewed your request"
  >
    <p className="text-sm text-[#7B8FA3] mb-4">
      Check the plan below. If it looks right, click "Build this" to start generating.
      If not, edit your prompt and try again.
    </p>
    <button
      onClick={() => { setShowPlanModal(false); localStorage.setItem("arkhos_plan_shown", "true"); }}
      className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg text-sm hover:bg-[#FF6B35]/90"
    >
      Got it
    </button>
  </BasicModal>
</div>
```

renderLeftPanel() has 3 modes:
- Plan mode: Banner info header + PlanReview + triggers showPlanModal on first visit
- Chat mode: IterationChat (existing)
- Prompt mode: heading + ChatInput + ShiningText when running + 15 template buttons

All callbacks (handleGenerate, handleIterate, handleApprovePlan, handleNewSite) stay identical.

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Test in browser**

Run: `cd frontend && npx vite --port 5200`
Navigate to `http://localhost:5200/generate`
Verify:
- Left panel shows ChatInput with model selector
- Templates render below
- FallingPattern shows in preview area
- Status bar shows at bottom
- Page doesn't crash

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/Generate.tsx
git commit -m "feat: complete generator page rebuild with all premium components"
```

---

### Task 6: Final Integration Test + Push

- [ ] **Step 1: Full TypeScript check**

Run: `cd frontend && npx tsc --noEmit`
Expected: Zero errors

- [ ] **Step 2: Test generation flow**

Start backend: `python3 -m uvicorn arkhos.app:app --port 8000 &`
Start frontend: `cd frontend && npx vite --port 5200`

Test flow:
1. Navigate to `/generate`
2. Verify left panel shows ChatInput + templates
3. Click a template → generation starts
4. Pipeline strip shows agent progress
5. Preview loads in right panel
6. Success banner appears
7. Click "View Code" → CodeDrawer slides up with TreeView
8. Click files in tree → code displays on right
9. Status bar shows file count + cost
10. Iteration chat appears in left panel

- [ ] **Step 3: Final commit and push**

```bash
git add -A
git commit -m "feat: generator page rebuild complete — all premium components integrated

- CodeDrawer with TreeView + shiki syntax highlighting
- StatusBar with remaining generations + file count + cost
- PreviewPane: Open in new tab + mobile preview toggle
- PipelineStrip: remaining generations counter
- BasicModal: first-time plan explanation
- ShiningText: agents working shimmer
- ChatInput: Bolt-style with model selector
- 15 template quick picks
- All business logic preserved (SSE, WebContainer, iterate)"

git push
```
