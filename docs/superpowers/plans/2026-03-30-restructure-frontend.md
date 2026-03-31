# ArkhosAI Frontend Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the site structure so visitors land on a marketing page, the builder tool lives at /generate, and dead/unused components are removed.

**Architecture:** Three routes — `/` (landing with interactive dot-canvas hero, pipeline viz, differentiators, CTA), `/generate` (the builder tool with prompt input, agent stream, preview, code view), `/gallery` (gallery page). The current About.tsx becomes the new Landing.tsx at `/`. The current Home.tsx becomes Generate.tsx at `/generate`. Old About route becomes a redirect or is removed. Dead components (AgentBadge, GlowButton) that aren't imported anywhere are deleted.

**Tech Stack:** React 19, React Router v6, TypeScript, Tailwind v4, Framer Motion, GSAP, Shiki

---

### Task 1: Rename pages and update routes

**Files:**
- Rename: `src/pages/About.tsx` → `src/pages/Landing.tsx`
- Rename: `src/pages/Home.tsx` → `src/pages/Generate.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/Layout.tsx`

- [ ] **Step 1: Rename About.tsx → Landing.tsx**

```bash
cd /mnt/c/Users/Admin/Arkhos/Arkhos/frontend
mv src/pages/About.tsx src/pages/Landing.tsx
```

- [ ] **Step 2: Rename Home.tsx → Generate.tsx**

```bash
mv src/pages/Home.tsx src/pages/Generate.tsx
```

- [ ] **Step 3: Update App.tsx routes**

Replace `src/App.tsx` with:

```tsx
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Generate from "./pages/Generate";
import Gallery from "./pages/Gallery";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="generate" element={<Generate />} />
          <Route path="gallery" element={<Gallery />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 4: Update Layout.tsx nav links**

Change the `navLinks` array in `src/components/Layout.tsx` from:

```tsx
const navLinks = [
  { to: "/", label: "Home" },
  { to: "/gallery", label: "Gallery" },
  { to: "/about", label: "About" },
];
```

to:

```tsx
const navLinks = [
  { to: "/", label: "Home" },
  { to: "/generate", label: "Generate" },
  { to: "/gallery", label: "Gallery" },
];
```

- [ ] **Step 5: Update internal links in Landing.tsx**

In `src/pages/Landing.tsx`, the "Start Building" buttons link to `/`. Change all `to="/"` to `to="/generate"`:
- The hero CTA `<Link to="/">` → `<Link to="/generate">`
- The bottom CTA `<Link to="/">` → `<Link to="/generate">`

- [ ] **Step 6: Update internal link in Gallery.tsx**

In `src/pages/Gallery.tsx`, the "Start Building" empty-state link points to `to="/"`. Change it to `to="/generate"`.

- [ ] **Step 7: Verify TypeScript compiles**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

- [ ] **Step 8: Clear Vite cache and verify dev server boots**

```bash
rm -rf node_modules/.vite
pnpm dev
```

Expected: Vite boots clean. `/` shows the landing page with dot-canvas hero. `/generate` shows the builder tool with prompt + agent stream + preview.

---

### Task 2: Delete unused components

**Files:**
- Delete: `src/components/AgentBadge.tsx` (91 lines, not imported anywhere — AgentStream handles agent display)
- Delete: `src/components/GlowButton.tsx` (82 lines, not imported anywhere — PromptInput and PreviewPane use inline styled buttons)

- [ ] **Step 1: Verify neither component is imported**

```bash
cd /mnt/c/Users/Admin/Arkhos/Arkhos/frontend
grep -r "AgentBadge" src/ --include="*.tsx" --include="*.ts"
grep -r "GlowButton" src/ --include="*.tsx" --include="*.ts"
```

Expected: Only hits in the files themselves, no imports from other files.

- [ ] **Step 2: Delete the files**

```bash
rm src/components/AgentBadge.tsx
rm src/components/GlowButton.tsx
```

- [ ] **Step 3: Verify TypeScript still compiles**

```bash
pnpm tsc --noEmit
```

Expected: no errors.

---

### Task 3: Polish the Landing page (/) for first-visit experience

**Files:**
- Modify: `src/pages/Landing.tsx`

The landing page already has the interactive dot-canvas hero, pipeline viz, and differentiators. But it needs a few polish items to work as the true homepage:

- [ ] **Step 1: Add a "Try it now" section between the hero and pipeline**

After the hero bottom-fade div and before the pipeline section, add a brief transition section that teases the product. Insert this block in `Landing.tsx` right after the `h-16` fade div and before the `max-w-4xl` container:

```tsx
{/* ── How It Works teaser ── */}
<div className="max-w-4xl mx-auto px-6 pt-8 pb-12 text-center">
  <p className="text-[10px] uppercase tracking-wider text-[var(--muted)] mb-4"
     style={{ fontFamily: "var(--font-code)" }}>
    How it works
  </p>
  <p className="text-lg text-[var(--frost)]/80 max-w-2xl mx-auto"
     style={{ fontFamily: "var(--font-body)" }}>
    Type a description. Four AI agents — Planner, Designer, Builder, Reviewer —
    build your website in sequence. Watch it happen live. Download production HTML.
  </p>
</div>
```

- [ ] **Step 2: Verify the page renders correctly**

```bash
pnpm dev
```

Open `http://localhost:5173/`. The flow should be: hero → "How it works" → pipeline → differentiators → comparison → CTA.

---

### Task 4: Final verification

- [ ] **Step 1: Full TypeScript check**

```bash
cd /mnt/c/Users/Admin/Arkhos/Arkhos/frontend
pnpm tsc --noEmit
```

- [ ] **Step 2: Clear cache and start fresh**

```bash
rm -rf node_modules/.vite
pnpm dev
```

- [ ] **Step 3: Manual route verification**

Open each route in the browser:
- `http://localhost:5173/` — Landing page with dot-canvas hero, pipeline, differentiators
- `http://localhost:5173/generate` — Builder tool with prompt input, agent stream, preview pane
- `http://localhost:5173/gallery` — Gallery with empty state linking to /generate
- Verify nav links work: Home → /, Generate → /generate, Gallery → /gallery
- Verify "Start Building" buttons on landing page go to /generate
- Verify Gallery empty-state "Start Building" goes to /generate

- [ ] **Step 4: Verify backend proxy still works**

With backend running on port 8000:

```bash
curl -s http://localhost:5173/api/generate -X POST -H "Content-Type: application/json" -d '{"prompt":"test"}'
```

Expected: `{"generation_id":"..."}` — Vite proxy forwards to backend.
