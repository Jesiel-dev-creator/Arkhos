# Generator Page Rebuild — Design Spec

**Date:** 2026-04-01
**Status:** Approved
**Scope:** Complete rebuild of `frontend/src/pages/Generate.tsx` and supporting components

---

## Overview

Rebuild the ArkhosAI generator page from scratch using all premium 21st.dev components. Based on competitive analysis of Lovable ($6.6B), Bolt.new ($40M ARR), and v0 by Vercel. The goal is a generator experience that matches or exceeds these competitors while showcasing ArkhosAI's unique advantages: EU sovereignty, cost transparency, and the 5-agent pipeline.

## Layout Structure

```
┌──────────────────────────────────────────────────────────────┐
│  Pipeline Strip (5 agent pills + cost counter)    [3 free]   │
├──────────────┬───────────────────────────────────────────────┤
│              │                                               │
│  LEFT PANEL  │            RIGHT PANEL (65%)                  │
│   (35%)      │                                               │
│              │  ┌─────────────────────────────────────────┐  │
│  3 modes:    │  │  Browser Chrome Bar  [↗ New Tab]        │  │
│              │  ├─────────────────────────────────────────┤  │
│  1. Prompt   │  │                                         │  │
│  ChatInput   │  │   FallingPattern (idle)                 │  │
│  +templates  │  │        OR                               │  │
│              │  │   WebContainer preview (building/done)  │  │
│  2. Plan     │  │                                         │  │
│  Review      │  │                                         │  │
│              │  ├─────────────────────────────────────────┤  │
│  3. Chat     │  │  [Download] [Code ▲] [Copy] [Mobile]   │  │
│  Iteration   │  └─────────────────────────────────────────┘  │
│              │                                               │
│              │  ┌─────────────────────────────────────────┐  │
│              │  │  Code Drawer (slides up, collapsible)   │  │
│              │  │  TreeView left │ Code right              │  │
│              │  └─────────────────────────────────────────┘  │
├──────────────┴───────────────────────────────────────────────┤
│  Status: 3 remaining · €0.004 · 5 agents · 23 files · 17s   │
└──────────────────────────────────────────────────────────────┘
```

## Components

| Component | File | Slot | Status |
|-----------|------|------|--------|
| `ChatInput` | `ui/bolt-style-chat.tsx` | Left panel prompt mode | Exists, wired |
| `FallingPattern` | `shaders/falling-pattern.tsx` | Preview idle state (cyan on void) | Exists, wired |
| `ShiningText` | `ui/shining-text.tsx` | "agents working..." shimmer | Exists, wired |
| `Banner` | `ui/banner.tsx` | Success state + plan review header | Exists, wired |
| `TreeView` | `ui/tree-view.tsx` | Code drawer file tree | Exists, NOT wired |
| `BasicModal` | `ui/modal.tsx` | First-time plan explanation | Exists, NOT wired |
| `ShaderLines` | `shaders/shader-lines.tsx` | Subtle bg behind preview chrome | Exists, NOT wired |
| `PipelineStrip` | `PipelineStrip.tsx` | Top bar, 5 agent pills | Exists, wired |
| `PreviewPane` | `PreviewPane.tsx` | Main preview dual-mode WC/HTML | Exists, wired |
| `IterationChat` | `IterationChat.tsx` | Left panel chat mode | Exists, wired |
| `PlanReview` | `PlanReview.tsx` | Plan display | Exists, wired |
| `ErrorBanner` | `ErrorBanner.tsx` | Error display | Exists, wired |

## Section Details

### Pipeline Strip (top bar)

Existing PipelineStrip component. No changes to the component itself. Add agent subtitles (already done in previous commit). Add "3 free remaining" counter on the right side.

### Left Panel — Mode 1: Prompt

- Heading: "What will you *build*?" in Syne, ember gradient italic on "build"
- Subheading: "Describe your website and watch 5 AI agents build it live."
- `ChatInput` from `bolt-style-chat.tsx`:
  - Model selector: Mistral Small (default), Devstral Small, Ministral-3B
  - Attach menu: Upload file, Add image, Import code
  - "Plan first" button
  - Ember "Build" CTA with glow shadow
  - `onSend` → calls `handleGenerate(msg, "en")`
  - `onPlan` → calls `handleGenerate(msg, "en")` (plan mode)
  - `disabled` when generation is running
- When running: `ShiningText` "agents working..." below ChatInput with pulsing dot
- Below: 15 template quick-pick buttons (scrollable, max-h-[280px])
  - Each: accent dot + name + description
  - onClick → `handleGenerate(template.prompt, "en")`
  - Disabled when running

### Left Panel — Mode 2: Plan Review

- `Banner` at top: variant="info", title="AI Plan ready", description="Review the plan below, then approve or start over"
- First visit only: `BasicModal` explaining plan mode
  - Title: "Your AI Planner has reviewed your request"
  - Body: "Check the plan below. If it looks right, click Build it."
  - localStorage key: `arkhos_plan_shown`
  - Shows once, dismissed with "Got it" button
- `PlanReview` component: existing, shows JSON plan in dark monospace container
- Two buttons: "Build this" (ember) + "Edit prompt" (outline)

### Left Panel — Mode 3: Iteration Chat

- Existing `IterationChat` component
- Quick action chips: Change colors, Edit text, Check mobile, Dark mode, Add section
- "+€0.001 per change" cost hint
- `onIterate` → calls iterate SSE endpoint
- `onNewSite` → resets state

### Right Panel — Preview Area

**Idle state:**
- `FallingPattern` component (12-row, cyan #00D4EE on void #020408, density 2, duration 150)
- Centered overlay text: "Your website will appear here" in frost, Zap icon above
- Subtitle: "Describe your website or choose a template" in muted

**Building state:**
- Same FallingPattern background
- Overlay: "Building your website" in frost, `ShiningText` "agents working..." below

**Ready state:**
- Browser chrome bar with:
  - Traffic light dots (red/yellow/green)
  - URL display (WC preview URL or `arkhos.ai/preview/...`)
  - "building..." indicator when still generating
  - **NEW: "Open in new tab" button** (ExternalLink icon) — opens `wcPreviewUrl` in new window
- WebContainer iframe (when WC ready) or HTML srcDoc fallback
- **NEW: Mobile preview toggle** — button that sets iframe width to 375px (centered) for mobile preview

**Action buttons below preview:**
- Download (ember, primary)
- View Code (toggle, opens/closes code drawer)
- Copy HTML
- **NEW: Mobile toggle** (smartphone icon, toggles 375px width)

### Right Panel — Code Drawer (NEW)

Slides up from below the preview when "View Code" is clicked.

- Framer Motion `animate={{ height: showCode ? 300 : 0 }}` with spring transition
- Split layout:
  - Left 30%: `TreeView` component showing all project files
    - Data source: `state.projectFiles` (Record<string, string>)
    - Convert to TreeNode[] format: group by directory (src/sections/, src/components/ui/, etc.)
    - Clicking a file sets `activeFile` state
  - Right 70%: Syntax-highlighted code display
    - Uses shiki (already installed) for syntax highlighting
    - Shows content of `activeFile` from `state.projectFiles`
    - Line numbers, dark theme, Space Mono font
- Divider: draggable resize handle (or fixed split)
- Close button or clicking "View Code" again collapses

### Bottom Status Bar (NEW)

Fixed at bottom of the generate page, full-width.

- Background: `bg-[#0D1B2A] border-t border-white/5`
- Height: 36px, flex row, items-center, px-6
- Left: "3 free generations remaining today" (text-xs, muted)
- Center: file count "23 files · 847 lines" (text-xs, font-mono, frost) — only shown after generation
- Right: "€0.004 · 5 agents · 17.3s" (text-xs, font-mono, ember for cost) — only shown after generation

## Data Flow

All existing SSE/WebContainer/iterate wiring stays untouched:

```
User types prompt
  → ChatInput.onSend(msg, model)
  → handleGenerate(msg, "en")
  → generate(prompt, locale) from useSSE
  → POST /api/generate → SSE stream
  → state updates (agents, previewHtml, projectFiles, etc.)
  → UI reflects state changes
```

The TreeView code drawer reads from `state.projectFiles` which is already populated by the `files_ready` SSE event. No new data fetching needed.

## Files to Create/Modify

| File | Action |
|------|--------|
| `frontend/src/pages/Generate.tsx` | REWRITE — main page with new layout |
| `frontend/src/components/CodeDrawer.tsx` | CREATE — new component: TreeView + code viewer |
| `frontend/src/components/StatusBar.tsx` | CREATE — new bottom status bar |
| `frontend/src/components/PreviewPane.tsx` | MODIFY — add "Open in new tab" + mobile toggle |
| `frontend/src/components/PipelineStrip.tsx` | MODIFY — add remaining generations counter |

Existing components used as-is (no modifications):
- `ChatInput` from `bolt-style-chat.tsx`
- `FallingPattern` from `falling-pattern.tsx`
- `ShiningText` from `shining-text.tsx`
- `Banner` from `banner.tsx`
- `TreeView` from `tree-view.tsx`
- `BasicModal` from `modal.tsx`
- `IterationChat`
- `PlanReview`
- `ErrorBanner`

## Design Tokens

```
Background: #020408 (void)
Panels: #0D1B2A (deep)
Borders: #1C2E42 or white/5
Primary CTA: #FF6B35 (ember)
Accent: #00D4EE (cyan)
Text: #DCE9F5 (frost)
Muted: #7B8FA3
Headings: font-[Syne]
Body: font-[DM_Sans]
Code/prices: font-mono (Space Mono)
```

## What's NOT in Scope

- Backend changes (all SSE/API endpoints stay the same)
- WebContainer boot logic (useWebContainer hook untouched)
- New SSE events or state fields
- Mobile responsive layout (left panel hides on mobile — keep existing behavior)
- ShaderLines background (deferred — adds complexity for marginal visual gain on the generator)
