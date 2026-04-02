# Skills + Memory Integration Design

**Date:** 2026-04-02
**Status:** Approved
**Approach:** Minimal integration (Approach 1)

## Decisions

- Cross-generation memory first (not per-user session)
- Smart injection via MarkdownSkill.matches() (not executable skills)
- Record at both pipeline + agent level

## Architecture

New file: `backend/arkhos/intelligence.py`

Two new singletons in `app.py`:
- `memory = TramontaneMemory(db_path="arkhos_memory.db")`
- `skill_registry` loaded from `arkhos/skills/**/*.md` via `MarkdownSkill`

### intelligence.py API

```python
def load_skills(skills_dir: Path) -> dict[str, list[MarkdownSkill]]
    # Returns {"planner": [...], "designer": [...], "builder": [...], "reviewer": [...], "shared": [...]}

def get_relevant_skills(registry, role: str, prompt: str, top_k: int = 4) -> str
    # Uses MarkdownSkill.matches(prompt) to pick top_k relevant skills
    # Returns concatenated text (same format as current get_*_skills())

async def recall_context(memory, role: str, prompt: str, top_k: int = 3) -> str
    # Calls memory.recall(f"{role} {prompt_keywords}", top_k=top_k)
    # Returns formatted context string or "" if empty

async def record_agent_experience(memory, agent_role, prompt_summary, result, model, cost)
    # Calls memory.record_experience(action_type=f"{agent_role}_run", ...)

async def record_generation_experience(memory, prompt, profile, total_cost, models, success, reviewer_output)
    # Calls memory.record_experience(action_type="generation_complete", ...)
```

### Pipeline integration points

In `run_build_streaming()`:
1. Before each agent: call `get_relevant_skills()` + `recall_context()`
2. After each agent: call `record_agent_experience()`
3. After pipeline complete: call `record_generation_experience()`

In `run_planner_streaming()`:
1. Replace `get_planner_skills("default")` with `get_relevant_skills(registry, "planner", prompt)`
2. Add `recall_context()` before planner
3. Add `record_agent_experience()` after planner

### Data flow

- `get_relevant_skills()` returns top 3-4 skill files based on prompt relevance (not all 24)
- `recall_context()` returns empty string on fresh memory — purely additive, no breaking change
- Existing `.md` skill files are unchanged
- SSE event format is unchanged

### Skill loading

24 existing `.md` files mapped to roles:
- `skills/planner/*.md` + `skills/planner/industries/*.md` → planner skills
- `skills/designer/*.md` → designer skills
- `skills/builder/*.md` → builder skills
- `skills/reviewer/*.md` → reviewer skills
- `skills/shared/*.md` → available to all roles

### Memory DB

SQLite at `arkhos_memory.db`. Stores:
- Agent experiences (role, model, cost, outcome per run)
- Generation summaries (prompt, profile, total cost, success)
- Extracted facts from reviewer output (quality insights)

### Testing

- `test_intelligence.py`: skill loading, relevance matching, memory record/recall
- Verify existing pipeline tests still pass
- Verify SSE format unchanged
