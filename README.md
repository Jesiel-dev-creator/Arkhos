# ArkhosAI

> The EU answer to Lovable. AI-powered website generator.

Describe what you want → 4 Mistral agents build it live → download production HTML.

Powered by [Tramontane](https://pypi.org/project/tramontane/), the open-source Mistral-native agent orchestration framework.

## Quick Start

```bash
# 1. Backend
cd /mnt/c/Users/Admin/Arkhos/Arkhos/backend
cp .env.example .env          # Add your MISTRAL_API_KEY
pip install -e ".[dev]"
uvicorn arkhos.app:app --host 0.0.0.0 --port 8000 --env-file .env

# 2. Frontend (new terminal)
cd /mnt/c/Users/Admin/Arkhos/Arkhos/frontend
pnpm install
pnpm dev
```

Open http://localhost:5173 — backend API is proxied automatically.

## Running (after install)

**Terminal 1 — Backend:**
```bash
cd /mnt/c/Users/Admin/Arkhos/Arkhos/backend
uvicorn arkhos.app:app --host 0.0.0.0 --port 8000 --env-file .env
```

**Terminal 2 — Frontend:**
```bash
cd /mnt/c/Users/Admin/Arkhos/Arkhos/frontend
pnpm dev
```

## Stack

- **Frontend:** React 19 + TypeScript + Vite + pnpm + Tailwind v4 + Shadcn/ui + Framer Motion + GSAP
- **Backend:** FastAPI + Tramontane + SQLite + SSE
- **Models:** Mistral fleet (ministral-3b, mistral-small, devstral-small)
- **Infra:** Scaleway fr-par + Docker + Nginx

## The Pipeline

```
User prompt
  → Planner (ministral-3b)      ~€0.0001
  → Designer (mistral-small)     ~€0.0005
  → Builder (devstral-small)     ~€0.002
  → Reviewer (mistral-small)     ~€0.001
  → Production HTML              ~€0.004 total
```

## License

MIT — Bleucommerce SAS, Orléans, France 🇫🇷
