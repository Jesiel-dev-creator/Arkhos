# ARKHOS AI — Claude Code Master Context

> Read this file completely before doing anything else.
> This is the single source of truth for the ArkhosAI project.

---

## What This Is

ArkhosAI is the EU answer to Lovable. AI-powered website generator.
User describes what they want → 4 Mistral agents build it live via SSE streaming → user downloads production HTML.

Powered by Tramontane (`pip install tramontane`), our open-source Mistral-native agent orchestration framework.

**Owner:** Jesiel · Bleucommerce SAS · Orléans, France 🇫🇷
**License:** MIT (open-core: free self-host, paid hosted service)
**Status:** v0.1 in development

---

## Competitive Context

- Lovable: $6.6B, React+Supabase, US-hosted, $25/mo, no model routing
- Bolt.new: $40M ARR, Claude 4.5, US-hosted, $25/mo, no cost transparency
- v0: Vercel, React+Next.js, US-hosted, $20/mo, frontend-only

Our advantages:
1. Intelligent model routing (Tramontane router picks model per agent)
2. Real-time EUR cost per agent (visible during generation)
3. EU sovereign (Scaleway Paris + Mistral French company)
4. Built-in security review (Reviewer agent catches vulns)
5. Open source + self-hostable (MIT, Docker)

---

## The 4-Agent Pipeline

```
User prompt
  → Planner (ministral-3b)      ~€0.0001  classify + structure
  → Designer (magistral-small)   ~€0.0005  colors + fonts + layout
  → Builder (devstral-small)     ~€0.002   generate HTML/CSS/JS
  → Reviewer (auto)              ~€0.001   validate + fix
  → Final HTML delivered

Total: ~€0.004/generation · ~17 seconds
```

### Agent 1: PLANNER
- Model: ministral-3b-latest (tier 0, near-zero cost)
- Input: User's natural language description
- Output: Structured JSON spec (site_type, sections, style, locale, responsive)

### Agent 2: DESIGNER
- Model: auto (router decides, likely magistral-small for reasoning)
- Input: Planner's JSON spec
- Output: Design system JSON (colors, fonts, layout, spacing, animations)
- Uses UI/UX Pro Max product-type data for smarter recommendations

### Agent 3: BUILDER
- Model: auto (router decides, likely devstral-small for code)
- Input: Planner spec + Designer system
- Output: Complete HTML + CSS + JS as a single file
- Constraints: valid HTML5, responsive, meta tags, Google Fonts CDN, placeholder images from picsum.photos, no external deps beyond CDN fonts and GSAP CDN

### Agent 4: REVIEWER
- Model: auto (router decides)
- Input: Generated HTML
- Output: Quality report + fixed HTML if issues found
- Checks: HTML validity, responsive breakpoints, accessibility, SEO meta tags, matches original spec

---

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- **pnpm** (package manager — NEVER npm or yarn)
- Tailwind CSS
- Shadcn/ui (accessible component primitives)
- Framer Motion (React state transitions: mount/unmount, layout animations)
- GSAP (cinematic/timeline animations: hero entrance, preview reveal, cost counter, ember glow)
- EventSource API (SSE consumption)
- Prism.js or Shiki (code syntax highlighting)

### Backend
- FastAPI + Uvicorn
- Tramontane (`pip install tramontane`) — the pipeline engine
- SQLite (generations, rate limits, gallery)
- SSE via StreamingResponse
- Python 3.12+

### Infrastructure
- Scaleway fr-par (production)
- Docker + docker-compose
- Nginx reverse proxy + Let's Encrypt SSL

---

## Animation Split

Two animation libraries, clear responsibilities:
- **Framer Motion** → React lifecycle: component mount/unmount, layout transitions,
  agent card expand/collapse, panel slides
- **GSAP** → Cinematic/timeline: hero section entrance sequence, preview iframe reveal
  (skeleton → real page), cost counter tick-up, ember glow pulse on Generate button,
  completion celebration sequence

Rule: if it's tied to React state, use Framer Motion. If it's a sequenced timeline or DOM animation, use GSAP.

---

## EU Premium Design System

This is NOT a generic SaaS. It should feel like European luxury tech.
Reference: Linear meets Stripe but darker and more European.

```
Palette:
  --void:    #020408   (deep space background)
  --deep:    #0D1B2A   (card/panel backgrounds)
  --border:  #1C2E42   (subtle dividers)
  --cyan:    #00D4EE   (intelligence, Mistral)
  --ember:   #FF6B35   (CTA, action — DOMINANT for ArkhosAI)
  --frost:   #DCE9F5   (primary text)
  --muted:   #7B8FA3   (secondary text)
  --success: #22D68A   (confirmations)
  --warning: #FFB020   (caution)
  --error:   #FF4560   (errors)

Typography:
  Display:  Syne 800       (hero text, page titles)
  Body:     DM Sans 400/500/700 (all body text, UI labels)
  Code:     Space Mono 400  (generated code, technical)

NEVER: Inter, Roboto, system fonts, purple gradients,
       rounded-everything, generic SaaS aesthetic
```

This design system applies ONLY to ArkhosAI's own UI.
Generated websites use their own design systems created by the Designer agent.

---

## SSE Event Stream

This is what makes it feel like Lovable. Each agent sends events:

```
event: agent_start
data: {"agent": "planner", "model": "ministral-3b"}

event: agent_output
data: {"agent": "planner", "chunk": "Analyzing requirements..."}

event: agent_complete
data: {"agent": "planner", "cost_eur": 0.0001, "duration_s": 1.2}

event: agent_start
data: {"agent": "designer", "model": "magistral-small"}

... (streaming chunks from each agent)

event: preview_ready
data: {"html": "<full generated HTML>"}

event: generation_complete
data: {"total_cost_eur": 0.004, "total_time_s": 17}
```

---

## API Endpoints

```
POST /api/generate
  Body: {"prompt": str, "locale": str, "template": str | null}
  Returns: {"generation_id": str}
  Rate limit: 3 generations/IP/day

GET /api/stream/{generation_id}
  Returns: SSE stream of agent events

GET /api/result/{generation_id}
  Returns: {"html": str, "metadata": {...}}

GET /api/gallery
  Returns: [{id, prompt, preview_url, cost_eur}]

GET /health
```

---

## Tramontane Integration

```python
from tramontane import Agent, Pipeline

# Agents are created with role/goal/backstory (identity fields)
# The backstory field carries the detailed system prompt instructions
# Agent.run(input_text) uses these to build the system message automatically

planner = Agent(
    role="Landing Page Planner",
    goal="Convert descriptions into structured page specs",
    backstory="Expert UX strategist...",  # + detailed prompt
    model="ministral-3b-latest",
    budget_eur=0.001,
)

# Pipeline uses handoff graph: Planner → Designer → Builder → Reviewer
pipeline = Pipeline(
    name="arkhos-website-generator",
    agents=[planner, designer, builder, reviewer],
    handoffs=[
        ("Landing Page Planner", "Visual Designer"),
        ("Visual Designer", "Frontend Builder"),
        ("Frontend Builder", "Code Reviewer"),
    ],
    budget_eur=0.02,
)

result = await pipeline.run(input_text=user_prompt)
```

---

## Rate Limiting + Cost Control

| Limit | Value |
|-------|-------|
| Generations per IP per day | 3 |
| Budget per generation | EUR 0.02 (hard ceiling) |
| Global daily spend | EUR 5.00 |
| Max prompt length | 1000 chars |

---

## Templates (ship with v0.1)

1. French bakery in Paris — warm, modern, menu + about + contact
2. SaaS landing page — dark, conversion-focused, pricing + features + CTA
3. Developer portfolio — minimal, dark mode, projects grid + about + contact
4. Italian restaurant — warm earth tones, menu + reservation + gallery
5. Creative agency — bold, asymmetric, case studies + team + contact

---

## UI/UX Pro Max (for generated websites ONLY)

UI/UX Pro Max is installed at `.claude/skills/ui-ux-pro-max/`.
It provides searchable design databases via:
```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain <domain>
```

**SCOPE:** Used ONLY for improving GENERATED website output.
The Designer and Builder agent system prompts can reference Pro Max
product-type data (bakery → warm palettes, SaaS → dark conversion, etc.)
for smarter design system generation.

**NOT** used for ArkhosAI's own UI. ArkhosAI UI = EU Premium design system, period.

---

## Tools & Skills on Claude Code

- **UI/UX Pro Max** — design intelligence for generated websites (see section above)
- Firecrawl MCP (crawl + scrape)
- Supabase MCP (for v0.3 backend generation)
- 21st.dev Magic MCP (React component generation)
- Shadcn UI MCP (component library reference)

---

## Build Order (4 weeks)

### Week 1: Pipeline + SSE (the engine)
1. Create repo, CLAUDE.md, pyproject.toml
2. backend/arkhos/pipeline.py — 4 agents, Tramontane pipeline
3. backend/arkhos/sse.py — SSE event formatting
4. backend/arkhos/app.py — FastAPI with /generate + /stream
5. Test: prompt → pipeline → SSE events → HTML output

### Week 2: React UI (the experience)
1. Frontend scaffold (pnpm create vite + React + TypeScript + Tailwind + GSAP)
2. PromptInput component + template buttons
3. AgentStream component (real-time agent progress)
4. PreviewPane component (iframe rendering)
5. CostBadge component (live EUR tracking)
6. Wire up useSSE hook to backend

### Week 3: Polish (the product)
1. Gallery page + SQLite storage
2. CodeView component (syntax highlighted source)
3. DownloadButton
4. Rate limiting (IP-based)
5. 5 templates
6. Mobile responsive
7. Error handling

### Week 4: Deploy (the launch)
1. Docker build (frontend + backend)
2. Nginx + SSL config
3. Scaleway deployment
4. Domain setup
5. README + About page
6. Launch

---

## Coding Rules

1. Import tramontane as a dependency, never copy its code
2. All FastAPI endpoints are async
3. SSE for all streaming (no WebSocket for v0.1)
4. EUR for all costs, never USD
5. Type hints everywhere
6. Docstrings on every public method
7. ruff + mypy strict on backend
8. No print() — use logging
9. Standard import order: future → stdlib → third-party → internal
10. EU Premium design for ArkhosAI UI: void/cyan/ember, Syne/DM Sans/Space Mono
11. NEVER Inter, Roboto, purple gradients, or American startup aesthetics
12. **pnpm** for all frontend packages — NEVER npm or yarn

---

## Key UI Moments

1. Prompt submission — ember glow on Generate button
2. Agent streaming — each agent card expands, showing model name + live cost
3. Preview render — iframe fades from skeleton to real page (THE MONEY SHOT)
4. Completion — success badge, total cost, download button glows ember

---

*Source of truth: This file + Notion ArkhosAI Architecture Plan.*
*Tramontane context: See CLAUDE.md in the tramontane repo root.*
