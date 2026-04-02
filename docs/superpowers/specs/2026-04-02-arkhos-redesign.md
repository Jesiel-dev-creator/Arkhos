# ArkhosAI Redesign — From Indie to $6B Aesthetic

**Date:** 2026-04-02
**Status:** Saved for later implementation
**Goal:** Make ArkhosAI look like it belongs next to Linear, Stripe, and Vercel

---

## The Problem

ArkhosAI is now genuinely powerful (10 tramontane exports, self-learning router,
smart skills, cross-generation memory, fleet profiles, parallel agents, GDPR).
But the UI still looks like a weekend project. The gap between backend sophistication
and frontend polish is the biggest risk to credibility.

## Design Direction: European Precision Dark

Not cyberpunk. Not startup green. Not generic SaaS blue.
**European luxury tech** — think Linear meets Stripe but darker and more European.
Restrained, precise, confident. The kind of product that doesn't need to shout.

Reference products: Linear, Vercel, Raycast, Arc Browser, Figma (dark mode)

---

## Color System — Evolved

The current palette is good but needs refinement. Keep the DNA, elevate the execution.

### Current → Proposed

```
BACKGROUNDS (depth hierarchy)
  --void:     #020408  →  #030712    (slightly warmer, less dead)
  --deep:     #0D1B2A  →  #0F172A    (align with slate-900, industry standard)
  --surface:  (new)       #1E293B    (card/panel surface — slate-800)
  --elevated: (new)       #334155    (hover states, active panels — slate-700)

BORDERS
  --border:   #1C2E42  →  #1E293B    (subtle, matches surface)
  --border-strong: (new)  #334155    (active/focus borders)

BRAND — THE IDENTITY
  --ember:    #FF6B35  →  #FF5D3A    (slightly more red, more premium, less orange)
  --cyan:     #00D4EE  →  #38BDF8    (sky-400 — softer, less neon, more Vercel)

SEMANTIC
  --frost:    #DCE9F5  →  #F1F5F9    (slate-100 — cleaner white)
  --muted:    #7B8FA3  →  #94A3B8    (slate-400 — better contrast)
  --success:  #22D68A  →  #22C55E    (green-500 — industry standard)
  --warning:  #FFB020  →  #F59E0B    (amber-500)
  --error:    #FF4560  →  #EF4444    (red-500)

ACCENT (new)
  --gold:     (new)       #CA8A04    (premium accent for badges, EU trust)
```

### Why These Changes

1. **Warmer void** — #030712 feels alive, #020408 feels dead
2. **Softer cyan** — #38BDF8 reads "professional intelligence", #00D4EE reads "gaming"
3. **Redder ember** — #FF5D3A is more premium-orange, less traffic-cone-orange
4. **Slate alignment** — Using Tailwind slate scale means every shade works together
5. **Gold accent** — For EU trust badges, premium tier indicators, completion states

---

## Typography — Keep + Refine

### Option A: Keep Current (Recommended)
- **Display:** Syne 700-800 (distinctive, European, recognizable)
- **Body:** DM Sans 400/500/700 (excellent readability)
- **Code:** Space Mono 400

Syne is ArkhosAI's typographic identity. Don't change it.
But refine the usage: Syne only for hero text and page titles (max 2 per page).
Everything else is DM Sans.

### Option B: Upgrade to Space Grotesk / DM Sans
More "tech startup" feel. Space Grotesk has unique character shapes
that feel modern and European. But loses the distinctive Syne identity.

**Verdict: Stay with Syne + DM Sans.** It's already distinctive.

### Type Scale (refined)

```
--text-xs:    0.75rem / 1rem      (badges, labels)
--text-sm:    0.875rem / 1.25rem  (secondary, captions)
--text-base:  1rem / 1.5rem       (body text)
--text-lg:    1.125rem / 1.75rem  (lead paragraphs)
--text-xl:    1.25rem / 1.75rem   (section subtitles)
--text-2xl:   1.5rem / 2rem       (section titles)
--text-3xl:   1.875rem / 2.25rem  (page subtitles)
--text-4xl:   2.25rem / 2.5rem    (page titles — Syne)
--text-hero:  clamp(2.5rem, 5vw, 4.5rem)  (hero only — Syne 800)
```

---

## Landing Page Structure

Pattern: **Interactive Product Demo** (Result 1 + 6 from search)

```
1. Hero
   - Syne 800 headline: "Build beautiful websites with AI. In seconds."
   - Subtext: DM Sans, muted, one line
   - Prompt input field (THE product, right in the hero)
   - Fleet profile pills (Budget / Balanced / Quality)
   - No stock photos. The product IS the hero.

2. Live Demo Section
   - Embedded iframe showing a real generated website
   - "Generated in 8 seconds · €0.005 · 5 AI agents"
   - Auto-plays a generation with typing animation
   - This is THE money shot. Not a screenshot — a LIVE demo.

3. Agent Pipeline Visualization
   - 5 agents shown as connected nodes
   - Planner → Designer+Architect (parallel) → Builder → Reviewer
   - Each shows: model name, avg cost, avg time
   - Animated data flow between nodes
   - "Powered by Tramontane — open-source agent orchestration"

4. Comparison Strip
   - ArkhosAI vs Lovable vs Bolt vs v0
   - Columns: Price, Speed, EU Sovereign, Self-hostable, Open Source
   - ArkhosAI wins on 4/5 columns (only loses on "ecosystem maturity")

5. Trust Section
   - "EU Sovereign · GDPR Standard · Mistral-powered · Open Source"
   - Scaleway Paris badge, Mistral badge, MIT license badge
   - NO fake SOC2/HIPAA badges (learned this lesson already)

6. Pricing
   - Free (3/day, cloud)
   - Pro (unlimited, cloud, €19/mo)
   - Self-Hosted (unlimited, your GPU, €0/forever)
   - The self-hosted row is the headline grabber

7. Footer
   - Minimal. Bleucommerce SAS · Orléans, France
   - GitHub, Discord, Twitter links
   - Legal links
```

---

## Generate Page Redesign

The core product page. Currently functional but needs polish.

### Layout

```
┌─────────────────────────────────────────────────────┐
│  SessionNavBar (slim, dark, logo left, status right) │
├──────────────────────┬──────────────────────────────┤
│                      │                              │
│  Left Panel (380px)  │  Preview (fluid)             │
│                      │                              │
│  ┌────────────────┐  │  ┌──────────────────────┐    │
│  │ Prompt Input   │  │  │                      │    │
│  │ (bolt-style)   │  │  │  Live Preview        │    │
│  └────────────────┘  │  │  (WebContainer)      │    │
│                      │  │                      │    │
│  ┌────────────────┐  │  │                      │    │
│  │ Fleet Toggle   │  │  │                      │    │
│  │ ⚡ Balanced    │  │  │                      │    │
│  └────────────────┘  │  │                      │    │
│                      │  └──────────────────────┘    │
│  ┌────────────────┐  │                              │
│  │ Pipeline Plan  │  │  ┌──────────────────────┐    │
│  │ (5 agents)     │  │  │ Status Bar           │    │
│  │ with live cost │  │  │ €0.005 · 12s · 10    │    │
│  └────────────────┘  │  │ files · devstral     │    │
│                      │  └──────────────────────┘    │
│  ┌────────────────┐  │                              │
│  │ Iteration Chat │  │                              │
│  └────────────────┘  │                              │
├──────────────────────┴──────────────────────────────┤
│  Code Drawer (slides up from bottom)                │
└─────────────────────────────────────────────────────┘
```

### Key Visual Changes

1. **Pipeline Plan** — Agent cards with subtle ember glow when active,
   gray when pending, green check when complete. Show model name + live cost.
   Designer+Architect show "parallel" badge.

2. **Status Bar** — Bottom of preview, always visible:
   `€0.005 · 12.3s · 10 files · devstral-small · BALANCED`
   If local GPU: `€0.000 · 5.2s · Local GPU · RTX 4090` (green badge)

3. **Preview transition** — Skeleton → blur-in to real site. Not a hard cut.
   GSAP timeline: skeleton pulses → content blurs in over 400ms.

4. **Fleet toggle** — Already shipped. But needs visual refinement:
   rounded pill group, ember active state, est cost/time below.

---

## Component Design Tokens

```css
/* Surfaces */
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;

/* Shadows (subtle, no heavy drop shadows) */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
--shadow-md: 0 4px 12px rgba(0,0,0,0.25);
--shadow-lg: 0 8px 24px rgba(0,0,0,0.3);
--shadow-glow-ember: 0 0 20px rgba(255,93,58,0.15);
--shadow-glow-cyan: 0 0 20px rgba(56,189,248,0.10);

/* Borders */
--border-default: 1px solid var(--border);
--border-active: 1px solid var(--border-strong);
--border-ember: 1px solid rgba(255,93,58,0.3);

/* Transitions */
--transition-fast: 150ms ease;
--transition-base: 200ms ease;
--transition-slow: 400ms ease;

/* Glass effect (for cards, panels) */
--glass-bg: rgba(15,23,42,0.6);
--glass-border: 1px solid rgba(255,255,255,0.06);
--glass-blur: blur(12px);
```

---

## Animation Strategy (unchanged from CLAUDE.md)

- **Framer Motion** → React lifecycle (mount/unmount, layout transitions)
- **GSAP** → Cinematic timelines (hero entrance, preview reveal, cost counter)

### Key Animations

1. **Hero entrance** — GSAP timeline: title slides up (0.6s) → subtitle fades (0.3s) → input appears (0.3s)
2. **Agent card activation** — Framer Motion: scale(1.02), ember border glow, spinner icon
3. **Preview reveal** — GSAP: skeleton → blur(20px) → blur(0) over 400ms
4. **Cost counter** — GSAP: number ticks up from 0 to final cost (odometer effect)
5. **Generation complete** — Framer Motion: success badge scales in, download button ember glow

---

## What NOT to Change

- Syne + DM Sans + Space Mono (typographic identity)
- Ember as primary CTA color (brand recognition)
- Dark-first approach (the product is dark mode)
- SSE streaming UX (agent-by-agent progress)
- WebContainer live preview (the core value prop)

## Anti-Patterns to Avoid

- Purple gradients (every AI startup does this)
- Rounded-everything (looks toyish)
- Inter or Roboto (generic)
- Light mode default (undermines the premium dark feel)
- Stock photos of happy people (we're a dev tool)
- Excessive blur/glass (performance killer, looks like 2023)
- Emoji icons in the UI (use Lucide SVGs)

---

## Implementation Priority

1. **Color system update** (1 session) — Update CSS variables, biggest visual impact
2. **Landing page rewrite** (2 sessions) — Hero with live demo, comparison, pricing
3. **Generate page polish** (1 session) — Pipeline cards, transitions, status bar
4. **Component refinement** (1 session) — Buttons, cards, inputs with new tokens
