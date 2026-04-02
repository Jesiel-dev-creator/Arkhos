# Codex Frontend Notes

Use this alongside the main Codex doc in .codex/CODEX.md when touching the frontend.

## Frontend guardrails

- Preserve the current route structure in frontend/src/App.tsx.
- Keep lazy loading for secondary pages where it already exists.
- Maintain compatibility with SSE and WebContainer behavior.
- Reuse existing UI primitives before adding new ones.

## Framework caution

The frontend contains frontend/AGENTS.md, which warns that the current Next.js version may differ from older conventions. Read the relevant local docs before making framework-level changes.
