# ARKHOS AI — Cursor Agent Context

This file defines how coding agents should operate in this repository.

## 1) Source of truth

- Read `CLAUDE.md` first.
- If this file conflicts with `CLAUDE.md`, follow `CLAUDE.md`.
- Align all implementation details with the current codebase, not only roadmap text.

## 2) Product and architecture snapshot

ArkhosAI is an AI website generator with a FastAPI backend and React frontend.

Current backend behavior includes:
- Plan-first flow: `POST /api/generate` runs Planner only and pauses.
- Approval flow: `POST /api/approve/{generation_id}` resumes build pipeline.
- Streaming via SSE: `GET /api/stream/{generation_id}`.
- Result retrieval: `GET /api/result/{generation_id}`.
- Iteration flow: `POST /api/iterate`.
- Download endpoint: `GET /api/download/{generation_id}`.

Current pipeline in code is effectively:
- Planner -> Designer -> Architect -> Builder -> Reviewer

## 3) Non-negotiable rules

- Use `pnpm` only for frontend package management.
- Backend endpoints must remain async.
- Streaming must remain SSE-based (no WebSocket migration unless explicitly requested).
- Costs are always represented in EUR.
- Use logging, not `print()`.
- Keep type hints and docstrings for public backend functions.
- Preserve strict import ordering:
  1. future
  2. stdlib
  3. third-party
  4. internal

## 4) UI and design constraints

For ArkhosAI product UI (not generated websites):
- Follow EU Premium style from `CLAUDE.md`.
- Keep ember as the dominant action color.
- Avoid generic SaaS aesthetics.
- Avoid Inter/Roboto/system font defaults for branded UI.

Animation split:
- Framer Motion for React lifecycle/state-driven transitions.
- GSAP for timeline/cinematic effects.

## 5) Backend implementation guidance

- Keep route handlers thin; place orchestration/business logic in pipeline or domain modules.
- Preserve SSE event compatibility for frontend consumers.
- Keep generation state updates consistent with `GenerationStatus` flow.
- Avoid breaking the queue-based streaming contract in `routes.py`.
- When adding agent steps, update:
  - event step counts
  - cumulative cost handling
  - generation metadata shape

## 6) Frontend implementation guidance

- Respect existing route model in `frontend/src/App.tsx`:
  - standalone pages (home/generate/gallery)
  - shared shell pages under `PageShell`
- Keep lazy loading for secondary pages.
- Maintain compatibility with SSE and WebContainer flows.
- Reuse existing UI primitives/components before creating new ones.

## 7) Safety checks before finishing work

For backend changes:
- Run lint/type checks/tests relevant to touched files.

For frontend changes:
- Run lint/build checks relevant to touched files.

Minimum expected verification commands:
- Backend: project-specific lint/type/test commands from `backend/pyproject.toml`
- Frontend: `pnpm lint` and/or `pnpm build` in `frontend`

If verification cannot be run, explicitly state what was skipped and why.

## 8) Change discipline

- Do not silently refactor unrelated files.
- Keep diffs focused on requested scope.
- Prefer small, composable functions over broad rewrites.
- Preserve backward compatibility for API response/event shapes unless change is requested.

## 9) File priorities for understanding context

Read these first when working:
- `CLAUDE.md`
- `backend/arkhos/routes.py`
- `backend/arkhos/pipeline.py`
- `frontend/src/App.tsx`
- `frontend/src/hooks/useSSE.ts`
- `frontend/src/hooks/useWebContainer.ts`

