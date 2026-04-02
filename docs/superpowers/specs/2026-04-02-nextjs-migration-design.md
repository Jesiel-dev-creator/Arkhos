# ArkhosAI Frontend: Next.js Migration + Redesign

**Date:** 2026-04-02
**Status:** Approved
**Scope:** Full frontend rewrite — Vite SPA → Next.js App Router + Electric Indigo redesign

---

## Decisions Locked

- **Framework:** Next.js App Router (replaces Vite SPA)
- **Styling:** Tailwind only. No inline styles. CSS variables for design tokens.
- **Components:** Clean slate. Fresh shadcn/ui install + ~15 custom components. Drop ~50 unused.
- **Color system:** Electric Indigo #6366F1 (replaces Ember #FF6B35)
- **Typography:** Syne 700-800 display, DM Sans body, JetBrains Mono code
- **Generate page:** Split routes — `/generate` (entry) + `/generate/[id]` (workspace)
- **Theme:** Dark default + Light + System via next-themes
- **i18n:** FR/EN via next-intl, URL prefix strategy
- **Package manager:** pnpm (unchanged)
- **Backend:** FastAPI unchanged. Next.js calls it as external API.
- **Premium components:** 21st.dev Magic MCP + UI/UX Pro Max for inspiration

---

## Architecture

```
frontend-next/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx              (root: fonts, theme, metadata, i18n)
│   │   ├── page.tsx                (Home — SSR)
│   │   ├── generate/
│   │   │   ├── page.tsx            ("use client" — prompt entry)
│   │   │   └── [id]/
│   │   │       └── page.tsx        ("use client" — workspace: SSE + WC)
│   │   ├── gallery/page.tsx        (SSR)
│   │   ├── pricing/page.tsx        (SSG)
│   │   ├── about/page.tsx          (SSG)
│   │   ├── blog/page.tsx           (SSG)
│   │   ├── docs/page.tsx           (SSG)
│   │   ├── contact/page.tsx        (SSG)
│   │   ├── changelog/page.tsx      (SSG)
│   │   ├── roadmap/page.tsx        (SSG)
│   │   ├── status/page.tsx         ("use client")
│   │   ├── support/page.tsx        (SSG)
│   │   └── legal/
│   │       ├── privacy/page.tsx    (SSG)
│   │       ├── terms/page.tsx      (SSG)
│   │       ├── cookies/page.tsx    (SSG)
│   │       └── imprint/page.tsx    (SSG)
│   ├── not-found.tsx
│   └── error.tsx
├── components/
│   ├── ui/                         (shadcn/ui fresh install)
│   ├── generate/                   (PreviewPane, PipelinePlan, CodeDrawer,
│   │                                IterationChat, PlanReview, ErrorBanner,
│   │                                CostCounter, StatusBar, FleetToggle)
│   ├── marketing/                  (Hero, Comparison, AgentViz, PricingTable)
│   └── layout/                     (Navbar, Footer, ThemeToggle, LocaleSwitcher)
├── hooks/
│   ├── use-sse.ts
│   ├── use-web-container.ts
│   └── use-media-query.ts
├── lib/
│   ├── utils.ts                    (cn() helper)
│   └── api.ts                      (fetch wrappers for FastAPI)
├── messages/
│   ├── en.json
│   └── fr.json
├── styles/
│   └── globals.css                 (design tokens + Tailwind base)
├── next.config.ts
├── tailwind.config.ts
├── i18n.ts                         (next-intl config)
└── package.json
```

---

## Design System: Electric Indigo

### Colors

```
BACKGROUNDS (depth hierarchy)
  --void:      #030712    deep space (gray-950)
  --deep:      #0F172A    panels (slate-900)
  --surface:   #1E293B    cards (slate-800)
  --elevated:  #334155    hover/active (slate-700)

BORDERS
  --border:         #1E293B    default
  --border-strong:  #334155    active/focus

BRAND
  --indigo:         #6366F1    primary (indigo-500)
  --indigo-light:   #818CF8    hover (indigo-400)
  --indigo-dark:    #4F46E5    pressed (indigo-600)
  --indigo-glow:    rgba(99,102,241,0.15)

SEMANTIC
  --text-primary:   #F1F5F9    slate-100
  --text-secondary: #94A3B8    slate-400
  --text-muted:     #64748B    slate-500
  --success:        #22C55E    green-500
  --warning:        #F59E0B    amber-500
  --error:          #EF4444    red-500
  --gold:           #CA8A04    premium accents

LIGHT MODE OVERRIDES
  --void:      #FFFFFF
  --deep:      #F8FAFC    slate-50
  --surface:   #F1F5F9    slate-100
  --elevated:  #E2E8F0    slate-200
  --border:    #E2E8F0    slate-200
  --text-primary:   #0F172A    slate-900
  --text-secondary: #475569    slate-600
  --text-muted:     #94A3B8    slate-400
```

### Typography

```
Display:  Syne 700-800           (hero + page titles only, max 2 per page)
Body:     DM Sans 400/500/700    (everything else)
Code:     JetBrains Mono 400     (generated code, technical labels)

Type Scale:
  --text-xs:    0.75rem / 1rem
  --text-sm:    0.875rem / 1.25rem
  --text-base:  1rem / 1.5rem
  --text-lg:    1.125rem / 1.75rem
  --text-xl:    1.25rem / 1.75rem
  --text-2xl:   1.5rem / 2rem
  --text-3xl:   1.875rem / 2.25rem
  --text-4xl:   2.25rem / 2.5rem
  --text-hero:  clamp(2.5rem, 5vw, 4.5rem)
```

### Effects

```
--glow-indigo:   0 0 24px rgba(99,102,241,0.12)
--glow-success:  0 0 16px rgba(34,197,94,0.10)
--glass-bg:      rgba(15,23,42,0.6)
--glass-blur:    blur(12px)
--glass-border:  1px solid rgba(255,255,255,0.06)
--radius-sm:     6px
--radius-md:     8px
--radius-lg:     12px
--transition-fast:  150ms ease
--transition-base:  200ms ease
--transition-slow:  400ms ease
```

---

## Theme Switcher

- Library: `next-themes`
- Modes: Dark (default), Light, System
- Toggle: Sun/Moon icon in navbar
- All tokens defined as CSS variables with `.dark` / `.light` class scoping
- Dark is the premium experience, light is the accessibility option
- Persists via localStorage

## Language Switcher (FR/EN)

- Library: `next-intl`
- Strategy: URL prefix — `/en/generate`, `/fr/generate`
- Default locale: `en` (no prefix)
- Switcher: Flag toggle in navbar (GB / FR)
- Files: `messages/en.json`, `messages/fr.json`
- Scope: All UI labels, marketing copy, legal pages
- Agent names and status messages translated
- User prompts are NOT translated (passed through as-is to backend)

---

## Page Rendering Strategy

| Page | Rendering | Why |
|------|-----------|-----|
| Home | SSR | SEO, dynamic content |
| Generate (entry) | Client | Interactive prompt input |
| Generate [id] | Client | SSE streaming, WebContainers |
| Gallery | SSR | SEO, data fetching |
| Pricing | SSG | Static content |
| About | SSG | Static content |
| Blog | SSG | Static content |
| Docs | SSG | Static content |
| Contact | SSG | Static with form |
| Changelog | SSG | Static content |
| Roadmap | SSG | Static content |
| Status | Client | Live data |
| Support | SSG | Static content |
| Legal (4 pages) | SSG | Static content |

---

## What Transfers (keep logic + text)

### Hooks (rewrite with Tailwind, same logic)
- `useSSE.ts` — SSE types, event handling, state machine
- `useWebContainer.ts` — WebContainer boot, file writing, preview URL
- `use-media-query.ts` — responsive breakpoint detection

### Components (rewrite, no inline styles)
- PreviewPane — iframe + WebContainer preview
- PipelinePlan — 5 agent cards with live status
- CodeDrawer — syntax-highlighted source view
- IterationChat — chat interface for modifications
- PlanReview — planner output approval flow
- ErrorBanner — classified error display
- CostCounter — EUR cost odometer
- StatusBar — generation metadata strip
- FleetToggle — Budget/Balanced/Quality pills

### Text Content
- All marketing page copy
- 15 template prompts + descriptions
- Legal page content (Privacy, Terms, Cookies, Imprint)
- 7 locale options (EN, FR, DE, ES, IT, NL, PT)

## What Gets Dropped

- ~50 duplicate/unused UI components
- All inline `style={{}}` objects
- react-router-dom
- Multiple navbar variants (4 → 1)
- Multiple chat input variants (3 → 1)
- Vite config and imports
- AppFooter.tsx (7 lines, rebuild)
- Layout.tsx (211 lines, replaced by app/layout.tsx)

## What's New

- `app/generate/[id]/page.tsx` — split route for generation workspace
- `components/marketing/` — redesigned hero, comparison, agent visualization
- `components/layout/Navbar.tsx` — one premium navbar with theme + locale toggles
- `components/layout/Footer.tsx` — clean minimal footer
- Indigo #6366F1 color system
- Light mode support
- FR/EN i18n
- JetBrains Mono (upgrade from Space Mono)

---

## Premium Component Strategy

For each major component, use this workflow:
1. Search 21st.dev Magic MCP for inspiration (`21st_magic_component_inspiration`)
2. Search UI/UX Pro Max for design rules (`--design-system` or `--domain`)
3. Build with shadcn/ui primitives + Tailwind
4. Refine with Magic MCP (`21st_magic_component_refiner`)

Target components for premium treatment:
- Navbar (floating glass, theme/locale toggles)
- Hero section (prompt input as the product, live demo)
- Agent pipeline visualization (connected nodes with data flow)
- Pricing table (3-tier with self-hosted highlight)
- Generate workspace layout (left panel + preview)

---

## Migration Order

### Sub-project 1: Scaffold + Infrastructure
- Next.js scaffold with pnpm
- Design tokens in globals.css
- Tailwind config with custom colors
- next-themes setup
- next-intl setup with en.json / fr.json shells
- shadcn/ui fresh install (button, card, dialog, badge, input, textarea, separator, tabs, accordion, sheet, avatar, tooltip, select, scroll-area, switch, skeleton, slider)
- Navbar + Footer components
- Root layout with fonts

### Sub-project 2: Generate Page (the product)
- `/generate/page.tsx` — prompt entry, fleet toggle, templates, locale
- `/generate/[id]/page.tsx` — workspace with SSE + WebContainer
- Port useSSE + useWebContainer hooks
- Port PreviewPane, PipelinePlan, CodeDrawer, IterationChat, PlanReview
- Rewrite all with Tailwind (no inline styles)

### Sub-project 3: Home Page (the marketing)
- Hero with embedded prompt (the product IS the hero)
- Live demo section (auto-generating animation)
- Agent pipeline visualization
- Comparison strip (ArkhosAI vs Lovable vs Bolt vs v0)
- Trust section (EU sovereign badges)
- Pricing section

### Sub-project 4: Remaining Pages
- Port text content from all marketing pages
- Gallery page with SSR
- Status page (client-side)
- Legal pages
- Blog, Docs, Changelog, Roadmap, Support, Contact, About

---

## Anti-Patterns

- No purple gradients
- No rounded-everything
- No Inter or Roboto
- No stock photos
- No emoji icons (Lucide SVGs only)
- No excessive blur/glass
- No inline style={{}} anywhere
- No light mode as default
