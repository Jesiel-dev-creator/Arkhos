# ARKHOS AI — Claude Code Master Context

> Read this file completely before doing anything else.
> This is the single source of truth for the ArkhosAI project.

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
11. Docker sandbox preview (cloud on Scaleway + local GPU, same API)

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

**MCP Parallel Pipeline (New):**

```
User prompt
  → PHASE 1: Planner + Designer PARALLEL (MCP)  ~EUR 0.0006 (~44% faster)
  → PHASE 2: Builder + Reviewer PARALLEL (MCP)   ~EUR 0.0029 (~25% faster)

Total: ~EUR 0.0035/generation (~50% faster overall)
```

The pipeline is extensible. Do NOT hardcode agent count in frontend.
New agents can be added in backend without frontend changes.

**MCP Integration:** See MCP.md for full parallel execution architecture.

---

## Tech Stack

### Frontend (REBUILT — Next.js 16.2)
- **Next.js 16.2** + React 19 + TypeScript
- **pnpm** (package manager — NEVER npm or yarn)
- **Tailwind CSS 4.2** (no inline styles, CSS variable tokens)
- **shadcn/ui CLI v4** (fresh install, clean slate)
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

### Tramontane Exports Used (10 of 30+)
```python
from tramontane import (
    Agent,              # Core agent
    MistralRouter,      # Smart model routing + telemetry
    RunContext,          # Adaptive budget reallocation
    ParallelGroup,      # Designer + Architect concurrent
    FleetTelemetry,     # Self-learning router (57+ outcomes)
    TramontaneMemory,   # Cross-generation learning
    MarkdownSkill,      # Smart skill injection
    simulate_pipeline,  # Cost estimation endpoint
)
# Also: Agent fields gdpr_level, audit_actions
```

### MCP Integration (New)
```python
from arkhos.integrations.magic_mcp import (
    MagicMCP,           # MCP client for parallel coordination
    coordinate_agents,  # Parallel agent execution
    fetch_inspiration,  # Design inspiration from MCP
)
```

### Sandbox (Docker — Cloud + Local)
- **Cloud mode:** Sandbox container hosted on Scaleway fr-par (per-generation)
- **Local/GPU mode:** Sandbox on user's machine (Docker, same API)
- **Status:** RUNNING on localhost:8001 (WSL2 Ubuntu)
- Container: Node 22 + pnpm, FastAPI, runs as user `sandbox` (uid 1000)
- **API endpoints:**
  - `POST /execute` — `{command, cwd?}` → `{stdout, stderr, success, returncode}`
  - `POST /write-file` — `{path, content}` → ⚠️ has bug (cwd attr error), use base64 via /execute instead
  - No `/health` endpoint — health check uses `POST /execute {command: "echo ok"}`
- **Workspace:** `/home/sandbox/` (writable). `/workspace` is root-owned, NOT writable.
- `SandboxClient` (arkhos/sandbox/client.py): async httpx, retries, health check via execute
- `SandboxExecutor` (arkhos/generation/sandbox_executor.py): base64 file writing → pnpm install → dev server
- Config via env: `ARKHOS_SANDBOX_URL` (default http://localhost:8001), `ARKHOS_SANDBOX_PREVIEW_URL` (default http://localhost:3001)
- Pipeline integration: runs after Reviewer, emits `sandbox_start`/`sandbox_complete` SSE
- Graceful degradation: if sandbox unreachable, generation still succeeds with HTML fallback preview

### Infrastructure
- Development: WSL2 Ubuntu, project at ~/Arkhos (native Linux filesystem)
- Production: Scaleway fr-par (backend + sandbox containers)
- Docker + docker-compose
- Nginx reverse proxy + Let's Encrypt SSL

---

## Electric Indigo Design System (v0.3)

**REPLACES the old Ember palette.** Three themes:

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

## Frontend Architecture (Next.js 16.2)

```
frontend/
├── app/
│   ├── globals.css                    (3-theme design tokens)
│   ├── [locale]/
│   │   ├── layout.tsx                 (root: fonts, theme, i18n, navbar, footer)
│   │   ├── page.tsx                   (Home — SSR)
│   │   ├── generate/
│   │   │   ├── page.tsx               ("use client" — prompt entry)
│   │   │   └── [id]/
│   │   │       └── page.tsx           ("use client" — workspace: SSE + preview)
│   │   ├── gallery/page.tsx           (SSR — TODO)
│   │   ├── pricing/page.tsx           (SSG — TODO)
│   │   ├── about/page.tsx             (SSG — TODO)
│   │   └── ... (blog, docs, contact, legal — TODO)
├── components/
│   ├── ui/                            (shadcn/ui — fresh install via CLI)
│   ├── generate/                      (FleetToggle, PipelinePanel, StatusBar)
│   ├── layout/                        (Navbar, Footer, ThemeToggle, LocaleSwitcher)
│   └── marketing/                     (TODO: Hero, Comparison, AgentViz, PricingTable)
├── hooks/
│   ├── use-sse.ts                     (SSE engine — dynamic agent discovery)
│   └── use-web-container.ts           (TODO: port from old frontend)
├── i18n/
│   ├── routing.ts                     (locale config)
│   ├── request.ts                     (server-side locale)
│   └── navigation.ts                  (Link, usePathname, useRouter)
├── lib/
│   ├── utils.ts                       (cn() helper)
│   └── api.ts                         (FastAPI fetch wrappers)
├── messages/
│   ├── en.json                        (English translations)
│   └── fr.json                        (French translations with proper diacritics)
├── proxy.ts                           (Next.js 16 proxy — replaces middleware.ts)
└── next.config.ts                     (next-intl plugin, turbopack root)
```

### Key Frontend Decisions
- Agents are dynamic — discovered from SSE `agent_start` events, NOT hardcoded
- All links use `next-intl/navigation` Link (locale-aware)
- proxy.ts (NOT middleware.ts — deprecated in Next.js 16)
- No pnpm-workspace.yaml (not a monorepo)
- turbopack.root set in next.config.ts
- All interactive elements have focus-visible styles
- iframe sandbox="allow-scripts" only (no allow-same-origin)
- Split routes: /generate (entry) → /generate/[id] (workspace)

---

## Backend Architecture

```
backend/
├── arkhos/
│   ├── app.py                 (FastAPI + singletons: telemetry, router, memory, skills)
│   ├── pipeline.py            (5-agent pipeline + MCP parallel pipeline with SSE)
│   ├── intelligence.py        (smart skill injection + cross-generation memory)
│   ├── routes.py              (API endpoints including /simulate, /telemetry, /generate-mcp)
│   ├── config.py              (pydantic-settings: env vars, sandbox URLs)
│   ├── sse.py, store.py, rate_limit.py, sanitize.py, iterate.py
│   ├── integrations/
│   │   └── magic_mcp.py        (MCP client, parallel coordination, error handling)
│   ├── sandbox/
│   │   ├── __init__.py        (exports SandboxClient, SandboxResult)
│   │   └── client.py          (async httpx client, health check, retries, timing)
│   ├── generation/
│   │   ├── __init__.py        (exports SandboxExecutor)
│   │   └── sandbox_executor.py (write files → pnpm install → dev server)
│   ├── prompts/               (per-agent system prompts)
│   ├── skills/                (26 markdown skill files — includes MCP skills)
│   │   ├── shared/             (mistral-prompting, cost-routing, eu-gdpr, parallel-processing)
│   │   ├── builder/            (react-patterns, tailwind, shadcn, framer-motion, mcp-integration)
│   │   ├── designer/           (taste, eu-design, typography)
│   │   ├── planner/            (copywriting, marketing, seo, industries/)
│   │   └── reviewer/          (security, code-quality)
│   ├── data/                  (design intelligence per industry)
│   └── templates/             (Aceternity-style component references)
├── scripts/
│   └── generate_training_data.py  (50-gen batch for telemetry + memory bootstrap)
├── tests/
│   ├── test_smoke.py          (8 tests — API endpoints)
│   ├── test_adaptive_budget.py (5 tests — budget allocation)
│   └── test_intelligence.py   (15 tests — skills + memory)
└── pyproject.toml             (tramontane>=0.2.3, httpx>=0.28.0, pydantic>=2.0.0)
```

### App-Level Singletons (in app.py)
```python
telemetry = FleetTelemetry(db_path="arkhos_telemetry.db")   # 57+ outcomes
mistral_router = MistralRouter(telemetry=telemetry)          # Self-learning
memory = TramontaneMemory(db_path="arkhos_memory.db")        # 37+ facts
skill_registry = load_skills()                                # 23 MarkdownSkills
```

### Fleet Profiles (verified against Mistral API pricing)
```
BUDGET:   ~EUR 0.004/gen  ministral-3b Planner, ministral-7b Design/Arch/Review, devstral-small Builder  ~25s
BALANCED: ~EUR 0.006/gen  mistral-small all, devstral-small Builder                                      ~40s
QUALITY:  ~EUR 0.020/gen  mistral-small Plan/Design/Arch, devstral-2 Builder, magistral-small Reviewer   ~90s
```

Cost differentiation: 1x → 1.4x → 4.8x (Budget → Balanced → Quality)
Budget allocation: Planner 8% / Designer 20% / Architect 20% / Builder 40% / Reviewer 12%
Adaptive: unspent from early agents flows to Builder (capped 65%)

---

## API Endpoints

```
POST /api/generate       Body: {prompt, locale, profile}  → {generation_id}
POST /api/generate-mcp   Body: {prompt, locale, profile}  → {generation_id} (MCP parallel)
POST /api/approve/{id}   Resume build after plan approval
GET  /api/stream/{id}    SSE stream of agent events
GET  /api/result/{id}    Final result
GET  /api/gallery         Recent generations
GET  /api/download/{id}  Zip download
POST /api/iterate        Modify existing generation
POST /api/simulate       Cost estimation without API calls
GET  /api/telemetry      Fleet telemetry stats
GET  /health             Health check
```

---

## SSE Event Types

```
pipeline_start      {profile, label, est_cost, est_time, total_budget}
phase_start         {phase, description}                    ← MCP parallel phases
phase_complete      {phase, duration_s}                     ← MCP parallel phases
agent_start         {agent, model, step, total_steps}
agent_complete      {agent, model, cost_eur, duration_s, cumulative_cost_eur}
plan_ready          {plan}
file_chunk          {path, content}     ← streamed in real-time
files_ready         {files, file_count}
preview_ready       {html, stage}
sandbox_start       {message}
sandbox_complete    {success, preview_url, stage, duration_s}
generation_complete {total_cost_eur, total_duration_s, models_used, success, sandbox_preview, parallel_mode}
error               {error, error_type, agent, parallel_mode}
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
- Tramontane integration: 10 exports used (was 3)
- Fleet profiles + adaptive budget (Budget/Balanced/Quality)
- ParallelGroup for Designer + Architect (saves ~5-8s)
- FleetTelemetry: 57+ outcomes, self-learning router active
- TramontaneMemory: 37+ facts, cross-generation learning active
- Smart skill injection via MarkdownSkill.matches()
- GDPR standard on Planner, audit_actions on all agents
- /api/simulate + /api/telemetry endpoints

### Done — Frontend (9 pages built)
- Next.js 16.2 with Electric Indigo design system
- Three themes: Dark (indigo) / Light (indigo) / GPU (NVIDIA green)
- FR/EN i18n with next-intl (full translations with diacritics)
- Home page with hero, radial glow, 3-card feature grid
- Generate entry: /generate (prompt, fleet toggle, templates)
- Generate workspace: /generate/[id] (pipeline panel, preview/code tabs, status bar)
- Pricing page (3 tiers: Starter/Pro/Team + CTA)
- About page (3 principles: Sovereign/Transparent/Open)
- Gallery page (3 showcase items + CTA)
- Blog page (3 posts)
- Docs page (3 sections: Start/Pipeline/Deployment)
- Legal pages: /legal/[slug] (privacy, terms, cookies, imprint — dynamic route)
- Floating glass navbar + minimal footer
- Custom ThemeProvider (no next-themes dependency)

### Done — Sandbox
- SandboxClient: async httpx, health check with cold-start retries, per-command timing
- SandboxExecutor: write files → pnpm install → background dev server
- Pipeline integration: sandbox_start/sandbox_complete SSE events after Reviewer
- Configurable via env: ARKHOS_SANDBOX_URL, ARKHOS_SANDBOX_PREVIEW_URL
- Graceful degradation: generation succeeds even if sandbox is down
- Works identically for cloud (Scaleway) and local (GPU/Docker) modes

### TODO (next session)
- ✅ **MCP Integration COMPLETED** (April 2026)
  - Parallel pipeline implementation
  - MagicMCP client with error handling
  - MCP skills for all agents
  - Docker setup for parallel execution
  - API endpoint `/generate-mcp`
  - Phase-based SSE events
  - Comprehensive documentation in MCP.md

- Sandbox Dockerfile + docker-compose service (Node 20 + pnpm, /execute + /health API)
- Sandbox file write API (replace heredoc with JSON POST to avoid content injection)
- Per-generation sandbox isolation (dynamic port or reverse proxy by generation ID)
- Sandbox workspace cleanup (TTL or post-download)
- Sandbox resource limits (CPU/memory/time caps in container)
- Handle `sandbox_start`/`sandbox_complete` in frontend use-sse.ts
- Connect Gallery to /api/gallery (currently static)
- Loading/error boundaries (loading.tsx, error.tsx)
- Polish: Home page needs live demo section, comparison strip
- NVIDIA NIM backend (Tramontane v0.2.4)
- Docker deployment config (backend + sandbox in docker-compose)
- shadcn/ui components (not yet installed — run `pnpm dlx shadcn@latest init`)

---

## NVIDIA NIM Strategy (Planned)

NIM containers = local GPU inference. Same Mistral API, different URL.
When NIM is detected, GPU theme activates automatically (NVIDIA green).

```
Cloud Mode:  User prompt → Mistral API (Paris) → EUR 0.005/gen
             Preview → Scaleway sandbox container → ARKHOS_SANDBOX_URL
GPU Mode:    User prompt → Local NIM (user's RTX) → EUR 0.000/gen
             Preview → Local Docker sandbox → localhost:8001
```

Tramontane already has local_mode in MistralRouter.
NIMBackend = change base_url + dummy API key. Nearly zero code change.
Sandbox works identically in both modes — same SandboxClient API, different URL.

---

## Design Specs

Full redesign spec: `docs/superpowers/specs/2026-04-02-nextjs-migration-design.md`
Redesign visual spec: `docs/superpowers/specs/2026-04-02-arkhos-redesign.md`
Skills + memory spec: `docs/superpowers/specs/2026-04-02-skills-memory-design.md`
Scaffold plan: `docs/superpowers/plans/2026-04-02-nextjs-scaffold.md`

---

*Source of truth: This file + Notion ArkhosAI Architecture Plan.*
*Tramontane context: See CLAUDE.md in the tramontane repo root.*
