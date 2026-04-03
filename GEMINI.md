# ARKHOS AI — Gemini Context

> Read this file completely before doing anything else.
> This is the single source of truth for the ArkhosAI project.
> All instructions from CLAUDE.md apply here — this file adapts them for Gemini.

---

## What This Is

ArkhosAI is the EU answer to Lovable. AI-powered website generator.
User describes what they want → multi-agent pipeline builds it live via SSE streaming → user downloads production React project.

Powered by Tramontane v0.2.3 (`pip install tramontane`), our open-source Mistral-native agent orchestration framework.

**Owner:** Jesiel · Bleucommerce SAS · Orléans, France
**License:** MIT (open-core: free self-host, paid hosted service)
**Status:** v0.3 in development (frontend redesign)

---

## Competitive Context

- Lovable: $6.6B, React+Supabase, US-hosted, $25/mo, no model routing
- Bolt.new: $40M ARR, Claude 4.5, US-hosted, $25/mo, no cost transparency
- v0: Vercel, React+Next.js, US-hosted, $20/mo, frontend-only

Our advantages:
1. Intelligent model routing (Tramontane router picks model per agent)
2. Self-learning router (FleetTelemetry — improves after 50+ generations)
3. Real-time EUR cost per agent (visible during generation)
4. EU sovereign (Scaleway Paris + Mistral French company)
5. Cross-generation memory (learns what works over time)
6. Smart skill injection (relevance-matched, not dumped)
7. Adaptive budget reallocation (unspent flows to Builder)
8. Open source + self-hostable (MIT, Docker)
9. NVIDIA NIM local GPU mode planned (free, offline, private)
10. Fleet profiles: Budget / Balanced / Quality user toggle

---

## The Agent Pipeline

Pipeline is DYNAMIC — agents are discovered at runtime from SSE events.
Current default pipeline (Balanced profile):

```
User prompt
  → Planner (ministral-3b)        ~EUR 0.0001
  → Designer + Architect PARALLEL  ~EUR 0.001 (runs concurrently via ParallelGroup)
  → Builder (devstral-small)       ~EUR 0.005 (gets adaptive budget surplus)
  → Reviewer (mistral-small)       ~EUR 0.001

Total: ~EUR 0.005/generation
```

The pipeline is extensible. Do NOT hardcode agent count in frontend.
New agents can be added in backend without frontend changes.

---

## Tech Stack

### Frontend (Next.js 16.2)
- **Next.js 16.2** + React 19 + TypeScript
- **pnpm** (package manager — NEVER npm or yarn)
- **Tailwind CSS 4.2** (no inline styles, CSS variable tokens)
- **shadcn/ui CLI v4** (installed, base-nova style)
- Custom ThemeProvider in providers.tsx (dark/light/GPU — no next-themes dep)
- **next-intl** (FR/EN i18n with URL prefix strategy)
- **Framer Motion** (React state transitions)
- **GSAP** (cinematic timelines)
- **Lucide React** (icons — NO emoji icons ever)
- EventSource API (SSE consumption)
- App Router with `[locale]` segment

### Backend (FastAPI + Tramontane v0.2.3)
- FastAPI + Uvicorn
- Tramontane v0.2.3 (`pip install tramontane>=0.2.3`)
- SQLite (generations, rate limits, gallery, telemetry, memory)
- SSE via StreamingResponse
- Python 3.12+

### Infrastructure
- Development: WSL2 Ubuntu, project at ~/projects/Arkhos (native Linux filesystem)
- Production: Scaleway fr-par
- Docker + docker-compose
- Nginx reverse proxy + Let's Encrypt SSL

---

## Electric Indigo Design System (v0.3)

Three themes defined in `frontend/app/globals.css`:

```
DARK THEME (default — Cloud mode, Indigo)
  --void:      #030712    (deep space)
  --deep:      #0F172A    (panels)
  --surface:   #1E293B    (cards)
  --elevated:  #334155    (hover/active)
  --brand:     #6366F1    (Electric Indigo — primary)
  --brand-light: #818CF8  (hover)
  --brand-dark:  #4F46E5  (pressed)

LIGHT THEME (Cloud mode, Indigo)
  --void:      #FFFFFF
  --deep:      #F8FAFC
  --surface:   #F1F5F9
  --elevated:  #E2E8F0
  --brand:     #6366F1    (same indigo)

GPU THEME (NVIDIA Local Mode — auto-activates when NIM detected)
  --void:      #0A0A0A    (deeper black)
  --deep:      #141414
  --surface:   #1E1E1E
  --elevated:  #2A2A2A
  --brand:     #76B900    (NVIDIA Green)
  --brand-light: #93D500

Typography:
  Display:  Syne 700-800       (hero text, page titles — max 2 per page)
  Body:     DM Sans 400/500/700 (all body text, UI labels)
  Code:     JetBrains Mono 400  (generated code, technical)

NEVER: Inter, Roboto, system fonts, purple gradients,
       rounded-everything, emoji icons, inline style={{}},
       generic SaaS aesthetic
```

---

## Frontend Architecture

```
frontend/
├── app/
│   ├── globals.css                    (3-theme design tokens + shadcn vars)
│   ├── [locale]/
│   │   ├── layout.tsx                 (root: fonts, theme, i18n, navbar, footer, cookie consent)
│   │   ├── page.tsx                   (Home — hero with embedded prompt, demo, comparison, waitlist)
│   │   ├── generate/
│   │   │   ├── page.tsx               (redirects to / — prompt is on home page)
│   │   │   └── [id]/
│   │   │       └── page.tsx           ("use client" — workspace IDE: SSE + preview + chat)
│   │   ├── gallery/page.tsx           (connected to /api/gallery)
│   │   ├── pricing/page.tsx
│   │   ├── about/page.tsx
│   │   ├── blog/page.tsx
│   │   ├── docs/page.tsx
│   │   ├── changelog/page.tsx
│   │   ├── roadmap/page.tsx
│   │   ├── status/page.tsx            ("use client" — checks /health)
│   │   ├── contact/page.tsx           ("use client" — contact form)
│   │   ├── legal/[slug]/page.tsx      (privacy, terms, cookies, imprint)
│   │   ├── not-found.tsx
│   │   ├── error.tsx
│   │   └── loading.tsx
├── components/
│   ├── ui/                            (shadcn/ui — button, card, dialog, sheet, tabs, etc.)
│   ├── generate/                      (FleetToggle, PipelinePanel, StatusBar, PlanReview,
│   │                                   ErrorPanel, CodeBlock, FileTree, IterationChat, Breadcrumbs)
│   ├── layout/                        (Navbar, Footer, ThemeToggle, LocaleSwitcher)
│   ├── marketing/                     (HeroPrompt, WaitlistForm, TrustStrip)
│   └── shared/                        (CookieConsent)
├── hooks/
│   ├── use-sse.ts                     (SSE engine — dynamic agent discovery)
│   ├── use-iterate.ts                 (POST /api/iterate + SSE reconnection)
│   └── use-typing-placeholder.ts      (typewriter effect for hero prompt)
├── i18n/
│   ├── routing.ts, request.ts, navigation.ts
├── lib/
│   ├── utils.ts                       (cn() helper)
│   └── api.ts                         (apiPost, apiGet, sseUrl)
├── messages/
│   ├── en.json                        (English — all pages, workspace, errors, tips)
│   └── fr.json                        (French with proper diacritics)
├── proxy.ts                           (Next.js 16 proxy — replaces middleware.ts)
└── next.config.ts                     (next-intl plugin, turbopack root)
```

### Key Frontend Decisions
- Agents are dynamic — discovered from SSE `agent_start` events, NOT hardcoded
- All links use `next-intl/navigation` Link (locale-aware)
- proxy.ts (NOT middleware.ts — deprecated in Next.js 16)
- turbopack.root set in next.config.ts
- All interactive elements have focus-visible styles
- iframe sandbox="allow-scripts" only
- Home page IS the generate entry — /generate redirects to /
- Workspace layout: left panel (chat/pipeline) + right panel (preview/code)

---

## Backend Architecture

```
backend/
├── arkhos/
│   ├── app.py                 (FastAPI + singletons: telemetry, router, memory, skills)
│   ├── pipeline.py            (5-agent pipeline with SSE, fleet profiles, adaptive budget)
│   ├── intelligence.py        (smart skill injection + cross-generation memory)
│   ├── routes.py              (API endpoints including /simulate, /telemetry, /waitlist)
│   ├── waitlist.py            (SQLite email storage for launch waitlist)
│   ├── config.py, sse.py, store.py, rate_limit.py, sanitize.py, iterate.py
│   ├── prompts/               (per-agent system prompts)
│   ├── skills/                (24 markdown skill files)
│   ├── data/                  (design intelligence per industry)
│   └── templates/             (component references)
├── tests/
│   ├── test_smoke.py          (8 tests)
│   ├── test_adaptive_budget.py (5 tests)
│   └── test_intelligence.py   (15 tests)
└── pyproject.toml             (tramontane>=0.2.3)
```

---

## API Endpoints

```
POST /api/generate       Body: {prompt, locale, profile}  → {generation_id}
POST /api/approve/{id}   Resume build after plan approval
GET  /api/stream/{id}    SSE stream of agent events
GET  /api/result/{id}    Final result (200=done, 202=running, 404=not found)
GET  /api/gallery         Recent generations
GET  /api/download/{id}  Zip download
POST /api/iterate        Modify existing generation
POST /api/simulate       Cost estimation without API calls
POST /api/waitlist       Email capture for launch
GET  /api/telemetry      Fleet telemetry stats
GET  /health             Health check
```

---

## SSE Event Types

```
pipeline_start    {profile, label, est_cost, est_time, total_budget}
agent_start       {agent, model, step, total_steps}
agent_complete    {agent, model, cost_eur, duration_s, cumulative_cost_eur}
plan_ready        {plan}
file_chunk        {path, content}
files_ready       {files, file_count}
preview_ready     {html, stage}
generation_complete {total_cost_eur, total_duration_s, models_used, success}
error             {error, error_type, agent}
```

---

## Coding Rules

1. Import tramontane as a dependency, never copy its code
2. All FastAPI endpoints are async
3. SSE for all streaming (no WebSocket)
4. EUR for all costs, never USD
5. Type hints everywhere
6. ruff + mypy strict on backend
7. No print() — use logging
8. **pnpm** for frontend — NEVER npm or yarn
9. **Tailwind only** — no inline style={{}} EVER
10. Electric Indigo design system — indigo/void/deep, Syne/DM Sans/JetBrains Mono
11. NEVER Inter, Roboto, purple gradients, emoji icons, or American startup aesthetics
12. All links use next-intl navigation (locale-aware)
13. Focus-visible styles on all interactive elements
14. Dynamic agent count — never hardcode "5 agents" in frontend
15. French translations must have proper diacritics (accents)
16. proxy.ts not middleware.ts (Next.js 16)

---

## Design Standards — STRICT

This product must look like it belongs next to NVIDIA, Apple, Linear, or Vercel.
NOT an indie project. NOT a Lovable/Bolt clone. Industry-level or nothing.

### Mandatory
- Every page follows the same layout rhythm: kicker (xs uppercase tracking) → h1 (Syne 5xl) → description (lg text-secondary) → content grid
- Cards: rounded-2xl, border border-[var(--border)], bg-[var(--deep)], p-5 or p-6
- Spacing: py-20 for page sections, mt-12 between major blocks, gap-4 or gap-5 in grids
- Buttons: rounded-xl, px-5 py-3, text-sm font-medium, hover:brightness-110
- No decorative elements that don't serve a purpose
- No gradients except the hero radial glow (subtle, single use)
- No shadows on cards — depth comes from background color hierarchy (void → deep → surface)
- No border-radius mixing — 2xl for cards, xl for buttons, md for small elements
- Typography hierarchy is sacred: Syne for display only, DM Sans for everything else
- Maximum restraint — if unsure whether to add a visual element, don't

### Reference Aesthetic
- Apple: whitespace, typography-driven, no clutter
- NVIDIA: dark, technical precision, green accents for GPU
- Linear: monochrome depth, clean cards, functional beauty
- Vercel: terminal-like precision, code-focused, no decoration

### What Makes It Look Cheap (NEVER DO)
- Excessive border-radius (pill shapes on cards)
- Multiple gradient directions on one page
- Colored backgrounds on cards (use depth hierarchy instead)
- Emoji or decorative icons that don't convey information
- Inconsistent spacing between sections
- Text that's too small to read (minimum 14px body)
- Hover effects that cause layout shift
- Too many colors on screen at once (indigo + text hierarchy, that's it)

---

## Current Status (April 2026)

### Done — Backend
- 28 tests passing, ruff clean, mypy clean
- Tramontane v0.2.3: 10 exports used
- Fleet profiles + adaptive budget (Budget/Balanced/Quality)
- ParallelGroup for Designer + Architect
- FleetTelemetry: 57+ outcomes, self-learning router active
- TramontaneMemory: 37+ facts, cross-generation learning
- Smart skill injection via MarkdownSkill.matches()
- GDPR standard on Planner, audit_actions on all agents
- /api/simulate, /api/telemetry, /api/waitlist endpoints

### Done — Frontend (13+ pages)
- Next.js 16.2 with Electric Indigo design system
- Three themes: Dark / Light / GPU
- FR/EN i18n with next-intl (full translations with diacritics)
- Home page: embedded prompt with typing animation, templates, demo, comparison, waitlist, trust strip
- Workspace IDE: left panel (chat/pipeline/tips/onboarding) + right panel (preview/code)
- Device preview toggle (desktop/tablet/mobile)
- Cost estimator on generate (POST /api/simulate)
- Gallery connected to /api/gallery
- Pricing, About, Blog, Docs, Changelog, Roadmap, Status, Contact pages
- Legal pages: /legal/[slug] (privacy, terms, cookies, imprint)
- GDPR cookie consent with granular categories
- Custom 404, error, loading boundaries
- shadcn/ui components installed (button, card, dialog, sheet, tabs, etc.)
- Syntax-highlighted CodeBlock with copy button
- Hierarchical FileTree with search
- Iteration chat for post-generation modifications

### TODO
- Live preview (WebContainer removed — evaluate Sandpack as alternative)
- NVIDIA NIM backend (Tramontane v0.2.4)
- Docker deployment config
- User authentication
- End-to-end testing against real backend

---

## NVIDIA NIM Strategy (Planned)

```
Cloud Mode:  User prompt → Mistral API (Paris) → EUR 0.005/gen
GPU Mode:    User prompt → Local NIM (user's RTX) → EUR 0.000/gen
```

When NIM is detected, GPU theme activates automatically (NVIDIA green).

---

## Design Specs

- Redesign spec: `docs/superpowers/specs/2026-04-02-nextjs-migration-design.md`
- Visual spec: `docs/superpowers/specs/2026-04-02-arkhos-redesign.md`
- Skills + memory spec: `docs/superpowers/specs/2026-04-02-skills-memory-design.md`
- Implementation plan: `docs/superpowers/plans/2026-04-02-workspace-and-homepage-polish.md`

---

*Source of truth: This file + CLAUDE.md + Notion ArkhosAI Architecture Plan.*
*Tramontane context: See CLAUDE.md in the tramontane repo root.*
