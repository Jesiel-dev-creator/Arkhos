# Arkhos UX Restructure — Auth, Dashboard, Pricing

**Date:** 2026-04-03
**Status:** Draft — pricing numbers are estimates, to be verified against real telemetry after 50+ generations.

---

## Overview

Restructure Arkhos from a marketing-page-with-embedded-prompt into a proper product with auth, dashboard, and tiered pricing. Separate marketing site (public) from product (auth-gated).

**Core decisions:**
- Supabase Auth (Google OAuth, GitHub OAuth, magic link — no passwords)
- Dashboard-first flow (login → project grid → new project page → workspace)
- Homepage becomes pure cinematic marketing (no working prompt)
- Pricing: Free (€0) / Pro (€12/mo) / Team (€29/mo) via Stripe

**Target personas:**
- Solo indie dev / freelancer (technical, wants IDE feel)
- Startup founder / non-technical (wants guided prompt experience)

---

## Route Architecture

### Public (no auth)

| Route | Purpose | Rendering |
|---|---|---|
| `/` | Cinematic marketing homepage | SSR |
| `/pricing` | Pricing tiers (existing, updated) | SSG |
| `/gallery` | Public showcase | SSR |
| `/docs` | Documentation (existing) | SSG |
| `/about` | About page (existing) | SSG |
| `/blog` | Blog (existing) | SSG |
| `/legal/[slug]` | Legal pages (existing) | SSG |
| `/login` | Supabase Auth UI (sign in + sign up in one page, tabs) | Client |

### Product (auth required)

| Route | Purpose | Rendering |
|---|---|---|
| `/dashboard` | Project grid + "New project" card | Client |
| `/dashboard/new` | Prompt page (fleet toggle, templates) | Client |
| `/dashboard/settings` | Account settings, usage, billing | Client |
| `/generate/[id]` | Workspace (pipeline, preview, code, chat) | Client |

### Removed

| Route | Reason |
|---|---|
| `/generate/page.tsx` | Was redirect to `/`, now deleted |
| `HeroPrompt` on homepage | Moves to `/dashboard/new` |
| Navbar "Generate" button | Replaced with conditional auth-aware links |

---

## Auth System

### Provider

Supabase Auth — hosted initially, self-hostable on Scaleway later for full EU sovereignty.

### Login Methods

1. **Google OAuth** — covers non-technical users
2. **GitHub OAuth** — covers developers
3. **Magic link (email)** — fallback, no passwords ever

No password auth. No username/password forms. No "forgot password" flow. Magic link + OAuth covers both personas with zero friction.

### Session Handling

- `SupabaseProvider` wraps the app (client-side Supabase JS)
- `useAuth()` hook: `user`, `signIn()`, `signOut()`, `loading`
- Protected routes: `/dashboard/*` and `/generate/*` check auth in layout
- Redirect to `/login?next={current_path}` if not authenticated
- API calls include Supabase JWT: `Authorization: Bearer {token}`
- Backend validates JWT via Supabase public key (stateless, no session store)

### Database Schema (Supabase)

```sql
-- profiles (extends auth.users)
create table profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  display_name    text,
  avatar_url      text,
  tier            text not null default 'free' check (tier in ('free', 'pro', 'team')),
  stripe_customer_id text,
  generations_this_month int not null default 0,
  generations_reset_at timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- RLS: users can only read/update their own profile
alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- projects (replaces in-memory store for logged-in users)
create table projects (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles(id) on delete cascade,
  name            text not null default 'Untitled',
  prompt          text not null,
  status          text not null default 'generating' check (status in ('generating', 'complete', 'failed')),
  fleet_profile   text not null default 'balanced' check (fleet_profile in ('budget', 'balanced', 'quality')),
  total_cost_eur  float not null default 0,
  thumbnail_url   text,
  files_json      jsonb,
  metadata        jsonb not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- RLS: users can only see/edit their own projects
alter table projects enable row level security;
create policy "Users can view own projects" on projects for select using (auth.uid() = user_id);
create policy "Users can insert own projects" on projects for insert with check (auth.uid() = user_id);
create policy "Users can update own projects" on projects for update using (auth.uid() = user_id);
create policy "Users can delete own projects" on projects for delete using (auth.uid() = user_id);

-- generation_logs (cost tracking for pricing verification)
create table generation_logs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles(id),
  project_id      uuid references projects(id) on delete set null,
  fleet_profile   text not null,
  prompt_length   int not null,
  agent_costs     jsonb not null default '{}',  -- {"planner": 0.0001, "designer": 0.0005, ...}
  total_api_cost_eur float not null default 0,
  sandbox_cost_eur   float not null default 0,  -- estimated sandbox compute cost
  total_cost_eur     float not null default 0,  -- api + sandbox
  duration_s      float not null default 0,
  models_used     jsonb not null default '[]',
  file_count      int not null default 0,
  success         boolean not null default true,
  error           text,
  created_at      timestamptz not null default now()
);

-- RLS: users can view own logs, admins can view all (for pricing analysis)
alter table generation_logs enable row level security;
create policy "Users can view own logs" on generation_logs for select using (auth.uid() = user_id);

-- Index for monthly reset queries and cost analysis
create index idx_gen_logs_user_created on generation_logs(user_id, created_at);
create index idx_gen_logs_profile on generation_logs(fleet_profile, created_at);
```

### Cost Logging for Pricing Verification

**Critical:** All generation costs are logged to `generation_logs` with per-agent breakdowns. This allows:

1. **Verify estimated costs** — compare predicted vs actual API spend per profile
2. **Adjust pricing** — if real costs differ from estimates below, tiers can be adjusted
3. **Monitor abuse** — identify users hitting limits or generating excessive costs
4. **Dashboard analytics** — admin endpoint to query aggregate costs vs revenue

The backend pipeline already tracks per-agent costs via SSE events. After `generation_complete`, insert a row into `generation_logs` with the full breakdown.

**Admin query for pricing verification:**
```sql
-- After 50+ generations, run this to check real costs
select
  fleet_profile,
  count(*) as total_gens,
  round(avg(total_api_cost_eur)::numeric, 6) as avg_api_cost,
  round(max(total_api_cost_eur)::numeric, 6) as max_api_cost,
  round(percentile_cont(0.95) within group (order by total_api_cost_eur)::numeric, 6) as p95_api_cost,
  round(avg(duration_s)::numeric, 1) as avg_duration_s
from generation_logs
where success = true
group by fleet_profile;
```

---

## Pricing

### IMPORTANT: Estimated costs — verify after 50+ real generations

These costs are based on Mistral API published pricing and Scaleway DEV1-S estimates.
After launch, query `generation_logs` to verify real numbers before committing to these tiers publicly.

### Cost Estimates Per Generation

| Profile | Mistral API (est.) | Sandbox compute (est.) | Total (est.) |
|---|---|---|---|
| Budget | ~€0.005 | ~€0.002 | **~€0.007** |
| Balanced | ~€0.01 | ~€0.002 | **~€0.012** |
| Quality | ~€0.05 | ~€0.002 | **~€0.052** |

Sandbox estimate: Scaleway DEV1-S (~€0.01/hr), ~1 min per generation ≈ €0.002.

### Fixed Monthly Costs (Estimated)

| Item | Cost |
|---|---|
| Scaleway backend (DEV1-M) | ~€15/mo |
| Scaleway sandbox container(s) | ~€15-30/mo |
| Supabase (free tier, then Pro) | €0-25/mo |
| Domain + SSL | ~€2/mo |
| **Total infra** | **~€35-70/mo** |

### Tier Structure

| | Free | Pro | Team |
|---|---|---|---|
| **Price** | €0 | €12/mo | €29/mo |
| **Generations/mo** | 10 | 100 | 500 (soft cap) |
| **Profiles allowed** | Budget only | All three | All three |
| **Projects saved** | 3 max | Unlimited | Unlimited |
| **Download zip** | Yes | Yes | Yes |
| **Sandbox preview TTL** | 5 min | 30 min | Persistent |
| **Support** | Community (GitHub) | Email | Priority |
| **Seats** | 1 | 1 | 5 |

### Why These Numbers

**Free tier (acquisition):**
- 10 Budget-only gens/mo: worst case €0.07/user/mo
- 1,000 free users = €70/mo — survivable
- Budget-only is the upgrade trigger (users want Quality)
- 3 project cap creates storage pressure → upgrade

**Pro at €12/mo (not €25 like competitors):**
- 100 gens at Balanced: €1.20 actual cost → **€10.80 margin (90%)**
- 100 gens at Quality: €5.20 actual cost → **€6.80 margin (57%)**
- Real usage ~20-40 gens/mo → margin is 85%+
- Undercutting Lovable/Bolt by 50% — market entry advantage
- Impulse buy price point

**Team at €29/mo:**
- 5 seats, 500 gen pool (Balanced: €6 cost → **€23 margin**)
- Heavy Quality usage: 500 × €0.052 = €26 → near break-even (unlikely scenario)

**Break-even:**
- Fixed costs: ~€50/mo
- Need: 5 Pro users to cover infra
- At 50 Pro users: €600/mo revenue, ~€540 profit
- At 200 Pro users: €2,400/mo revenue

### Payment Processing

Stripe Checkout:
- User clicks "Upgrade" on `/dashboard/settings` or `/pricing`
- Redirects to Stripe hosted checkout page
- Stripe handles: cards, invoices, cancellation, EU VAT, SCA compliance
- Webhook → updates `profiles.tier` in Supabase
- Monthly generation counter resets on billing cycle date

### Rate Limiting (per-user, replaces IP-based)

```python
# Backend: check tier limits before generation
TIER_LIMITS = {
    "free":  {"max_gens_per_month": 10,  "allowed_profiles": ["budget"]},
    "pro":   {"max_gens_per_month": 100, "allowed_profiles": ["budget", "balanced", "quality"]},
    "team":  {"max_gens_per_month": 500, "allowed_profiles": ["budget", "balanced", "quality"]},
}
```

---

## Navbar

### Conditional Rendering

| State | Left side | Right side |
|---|---|---|
| Logged out | Logo · Pricing · Gallery · Docs | **Start building →** (link to `/login`) |
| Logged in | Logo · Dashboard · Gallery · Docs | Avatar dropdown (Settings · Usage · Sign out) |

- "Generate" button removed entirely
- "Start building" is the sole CTA for logged-out users (brand button style)
- Avatar dropdown shows user's Google/GitHub avatar + display name
- Theme toggle and locale switcher remain in both states

---

## Homepage Redesign

Pure cinematic marketing. No working prompt. No product interaction.

### Sections (top to bottom)

1. **Hero**
   - Kicker: `OPEN-SOURCE AI BUILDER` (xs uppercase tracking)
   - Headline: `Build production websites with AI agents.` (Syne 5xl)
   - Subheadline: one line about EU, transparent, open source (DM Sans lg)
   - CTA: `Start building →` (brand button → `/login` or `/dashboard`)
   - Radial glow (existing, single subtle use)

2. **How it works** (pipeline visual)
   - Animated or static visualization of the 5-agent pipeline
   - Not interactive — visual storytelling only
   - Shows: Prompt → Planner → Designer + Architect → Builder → Reviewer → Live site
   - Real-time cost counter animation (demonstrates transparency)

3. **Why Arkhos** (existing 3-card grid, refined)
   - Sovereign: EU-hosted on Scaleway, data stays in Europe
   - Transparent: Real-time EUR cost per agent, no hidden bills
   - Open source: MIT licensed, self-hostable, Docker deploy

4. **Comparison table** (new)
   - Arkhos vs Lovable vs Bolt.new vs v0
   - Columns: EU hosting, Open source, GPU mode, Cost transparency, Price
   - Arkhos wins every row except "established user base"

5. **Footer CTA**
   - `Ready to build?` + `Start building →` button
   - Links: GitHub, Twitter/X, Discord (community)

### What Gets Removed from Homepage
- `HeroPrompt` component (moves to `/dashboard/new`)
- Template cards in hero section
- Fleet toggle
- Any interactive generation UI

---

## Dashboard Page (`/dashboard`)

### Layout

Full-width project grid. Top bar with navigation. No sidebar.

### Components

**Project card:**
- Thumbnail image (screenshot of generated site)
- Project name (click to rename inline)
- Relative time ("2h ago", "yesterday")
- Status badge: `Complete` (green) / `Generating` (brand pulse) / `Failed` (red)
- Cost: `€0.0045` (small, muted)
- Click → navigates to `/generate/[id]`
- `...` menu → Rename, Download zip, Delete

**"New project" card:**
- Dashed border, `+` icon, brand color
- Click → navigates to `/dashboard/new`
- Always appears as the last card in the grid

**Empty state (new user):**
- Centered message: "No projects yet"
- Large `+ Create your first project` button
- 3 template suggestions below

### Data Flow

- `useProjects()` hook fetches from Supabase `projects` table
- Real-time subscription for status updates (generating → complete)
- Thumbnails stored in Supabase Storage, referenced by `thumbnail_url`

---

## New Project Page (`/dashboard/new`)

### Layout

Centered content, max-width container. Clean, focused.

### Components (top to bottom)

1. **Headline:** "What do you want to build?" (Syne display)
2. **Prompt textarea** (large, auto-growing, placeholder with rotating examples)
3. **Generate button** (brand, `Cmd+Enter` shortcut)
4. **Fleet profile toggle:** Budget / Balanced / Quality with cost estimates
5. **Template grid:** 6+ template cards (bakery, SaaS, portfolio, restaurant, agency, e-commerce)
6. **Clicking a template** fills the prompt and auto-selects Balanced profile

### Generation Flow

1. User submits prompt
2. `POST /api/generate` with Supabase JWT → creates project in DB
3. Navigate to `/generate/[id]` (workspace)
4. SSE stream begins, pipeline panel populates
5. On `generation_complete` → update project status + save files to Supabase

---

## Workspace Changes (`/generate/[id]`)

Minimal changes to existing workspace:

1. **Auth guard** — redirect to `/login` if not authenticated
2. **Back navigation** — "← Dashboard" in top toolbar (replaces logo link to `/`)
3. **Auto-save** — on `generation_complete`, update project in Supabase (status, files, cost)
4. **Thumbnail capture** — after preview ready, generate screenshot for dashboard card
5. **Project name** — editable in toolbar, syncs to Supabase

Everything else stays: pipeline panel, preview/code tabs, device picker, chat iteration, status bar, sandbox integration.

---

## Implementation Notes

### Frontend New Files

```
frontend/
├── app/[locale]/
│   ├── login/page.tsx              (Supabase Auth UI)
│   ├── dashboard/
│   │   ├── layout.tsx              (auth guard, product navbar)
│   │   ├── page.tsx                (project grid)
│   │   ├── new/page.tsx            (prompt page — HeroPrompt moves here)
│   │   └── settings/page.tsx       (account, usage, billing)
├── components/
│   ├── auth/
│   │   ├── auth-provider.tsx       (SupabaseProvider)
│   │   ├── auth-guard.tsx          (redirect if not authed)
│   │   └── use-auth.ts            (useAuth hook)
│   ├── dashboard/
│   │   ├── project-card.tsx        (thumbnail, name, status, cost)
│   │   ├── project-grid.tsx        (grid layout + new project card)
│   │   └── empty-state.tsx         (first-time user)
│   └── layout/
│       └── navbar.tsx              (updated: conditional auth-aware links)
├── lib/
│   └── supabase.ts                (Supabase client singleton)
```

### Backend Changes

- Validate Supabase JWT on protected endpoints
- Insert into `generation_logs` on every `generation_complete`
- New endpoints: `GET /api/user/projects`, `GET /api/user/usage`
- Rate limiting: per-user-per-tier (replaces IP-based)
- Stripe webhook endpoint for tier changes

### Dependencies

- `@supabase/supabase-js` (frontend)
- `@supabase/auth-ui-react` + `@supabase/auth-ui-shared` (login page)
- `supabase` Python client or JWT validation library (backend)
- `stripe` (backend webhook + frontend checkout redirect)

---

## What This Spec Does NOT Cover

- Team collaboration features (inviting members, shared projects)
- Custom domain deployment for generated sites
- NVIDIA NIM / GPU mode integration
- WebContainer browser-side preview (replaced by sandbox)
- Admin dashboard for cost monitoring (use SQL queries on `generation_logs` initially)

These are future work, not blockers for this restructure.
