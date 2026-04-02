# ARKHOS AI — Codex Context

This folder is the Codex-specific entrypoint for working in this repository.

## Source of truth

- Read ../CLAUDE.md first.
- Use ../CURSOR.md as the practical implementation companion.
- If this file conflicts with ../CLAUDE.md, follow ../CLAUDE.md.

## Project snapshot

ArkhosAI is an AI-powered website generator with:

- FastAPI backend
- React and TypeScript frontend
- SSE-based streaming UX
- A multi-agent pipeline centered on Planner, Designer, Architect, Builder, and Reviewer stages

## Codex operating rules

- Use pnpm only for frontend package management.
- Keep backend route handlers thin and async.
- Preserve SSE contracts and generation event shapes.
- Keep costs in EUR.
- Use logging instead of print().
- Keep changes focused and avoid unrelated refactors.
- Prefer updating existing components and patterns over introducing parallel abstractions.

## Architecture files to read first

- ../backend/arkhos/routes.py
- ../backend/arkhos/pipeline.py
- ../frontend/src/App.tsx
- ../frontend/src/hooks/useSSE.ts
- ../frontend/src/hooks/useWebContainer.ts

## Product UI constraints

For ArkhosAI's own interface:

- Follow the EU Premium direction from ../CLAUDE.md.
- Keep ember as the dominant action color.
- Avoid generic SaaS styling.
- Avoid Inter, Roboto, and system-font-looking branded UI.

Animation split:

- Framer Motion for React state and lifecycle transitions
- GSAP for cinematic, sequenced, or timeline-driven motion

## Verification before finishing

For backend work, run the relevant checks from ../backend/pyproject.toml.

For frontend work, run the relevant checks in ../frontend, typically:

- pnpm lint
- pnpm build

If verification cannot be run, say what was skipped and why.
