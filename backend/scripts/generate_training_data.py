"""Run 50 synthetic ArkhosAI generations to bootstrap the self-learning router.

After 50 telemetry outcomes, MistralRouter.suggest_model() activates.
Also populates TramontaneMemory with searchable facts for future generations.

Uses explicit model assignments (BALANCED profile) to control costs.
Previous run with model="auto" cost 6x more than expected.

Estimated cost: ~EUR 0.25 (50 x ~EUR 0.005/generation)
Estimated time: ~40 minutes
"""

from __future__ import annotations

import asyncio
import json
import logging
import random
from datetime import UTC, datetime
from pathlib import Path

from dotenv import load_dotenv
from tramontane import (
    Agent,
    FleetTelemetry,
    MistralRouter,
    ParallelGroup,
    RunContext,
    TramontaneMemory,
)

from arkhos.intelligence import (
    get_relevant_skills,
    load_skills,
    record_agent_experience,
    record_generation_experience,
)

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

TELEMETRY_DB = "arkhos_telemetry.db"
MEMORY_DB = "arkhos_memory.db"
BATCH_SIZE = 50

# 40 diverse base prompts
PROMPTS = [
    "Create a website for a boulangerie in Paris called Le Pain Dore",
    "Build a landing page for a French wine estate in Bordeaux",
    "Create a site for a patisserie in Lyon specializing in macarons",
    "Build a portfolio site for a French architect in Marseille",
    "Create a website for a fromagerie in Orleans",
    "Build a booking page for a chateau hotel in Loire Valley",
    "Create a restaurant website for a bistro in Montmartre",
    "Build a site for a French fashion boutique in Le Marais",
    "Create a website for a lavender farm in Provence",
    "Build a landing page for a French tech startup in Station F",
    "Create a SaaS landing page for an AI writing tool",
    "Build a pricing page for a project management SaaS",
    "Create a developer documentation site for an API",
    "Build a startup landing page with waitlist signup",
    "Create a product launch page for a mobile app",
    "Build a B2B SaaS dashboard landing page",
    "Create a developer portfolio with GitHub integration",
    "Build a landing page for an open-source framework",
    "Create a changelog page for a software product",
    "Build a status page for a cloud service",
    "Create an online store for handmade jewelry",
    "Build a product page for artisan coffee beans",
    "Create a shop for vintage French furniture",
    "Build a subscription box landing page",
    "Create a marketplace for local EU artisans",
    "Create a law firm website in Paris",
    "Build a consulting agency landing page",
    "Create a freelance designer portfolio",
    "Build a medical practice website",
    "Create a real estate agency site in Nice",
    "Create a photography portfolio site",
    "Build a music artist landing page",
    "Create a personal blog with minimalist design",
    "Build a wedding invitation website",
    "Create a travel blog about European destinations",
    "Create a bilingual FR/EN website for an EU consultancy",
    "Build a GDPR-compliant contact page",
    "Create a site for an EU grant application service",
    "Build a multilingual landing page for a Berlin startup",
    "Create a website for an Italian restaurant in Amsterdam",
]

VARIATIONS = [
    "with dark theme", "with light minimal design", "mobile-first responsive",
    "with contact form", "with testimonials section", "with pricing table",
    "with hero video background", "with animated scroll effects",
]


def generate_prompts(count: int) -> list[str]:
    """Generate unique prompts from base + variations."""
    prompts = list(PROMPTS)
    while len(prompts) < count:
        base = random.choice(PROMPTS)
        variation = random.choice(VARIATIONS)
        prompt = f"{base} {variation}"
        if prompt not in prompts:
            prompts.append(prompt)
    random.shuffle(prompts)
    return prompts[:count]


async def run_batch() -> None:
    """Run generations with telemetry + memory recording."""
    telemetry = FleetTelemetry(db_path=TELEMETRY_DB)
    router = MistralRouter(telemetry=telemetry)
    memory = TramontaneMemory(db_path=MEMORY_DB)
    registry = load_skills()

    # Explicit BALANCED profile models — no model="auto" to control costs
    planner = Agent(
        role="Landing Page Planner",
        goal="Create a structured site spec from a description",
        backstory="Expert web project planner specializing in EU businesses",
        model="ministral-3b-latest",
        budget_eur=0.005,
        temperature=0.3,
        gdpr_level="standard",
        audit_actions=True,
    )
    designer = Agent(
        role="Visual Designer",
        goal="Create a design system with colors, fonts, and layout",
        backstory="Senior UI/UX designer for modern web design",
        model="mistral-small-latest",
        budget_eur=0.005,
        temperature=0.5,
        audit_actions=True,
    )
    architect = Agent(
        role="React Project Architect",
        goal="Plan the component tree and file structure",
        backstory="Senior frontend architect",
        model="mistral-small-latest",
        budget_eur=0.005,
        temperature=0.3,
        audit_actions=True,
    )
    builder = Agent(
        role="Frontend Builder",
        goal="Generate production React code with shadcn/ui",
        backstory="Senior frontend developer",
        model="devstral-small-latest",
        budget_eur=0.02,
        temperature=0.3,
        audit_actions=True,
    )
    reviewer = Agent(
        role="Code Reviewer",
        goal="Review code quality and give a score 1-10",
        backstory="Senior code reviewer and QA engineer",
        model="mistral-small-latest",
        budget_eur=0.005,
        temperature=0.2,
        audit_actions=True,
    )

    prompts = generate_prompts(BATCH_SIZE)
    results: list[dict[str, object]] = []
    total_cost = 0.0
    successes = 0
    failures = 0

    output_dir = Path("training_data")
    output_dir.mkdir(exist_ok=True)

    logger.info("Starting %d generation batch...", BATCH_SIZE)
    logger.info("Telemetry before: %d outcomes", telemetry.total_outcomes)
    logger.info("Memory before: %s", memory.stats())

    for i, prompt in enumerate(prompts):
        logger.info("=" * 60)
        logger.info("Generation %d/%d: %s...", i + 1, BATCH_SIZE, prompt[:60])

        ctx = RunContext(budget_eur=0.05, reallocation="adaptive")
        gen_cost = 0.0
        agent_entries: list[dict[str, object]] = []
        models_used: list[str] = []

        # Smart skill injection
        planner_skills = get_relevant_skills(registry, "planner", prompt)
        builder_skills = get_relevant_skills(registry, "builder", prompt)

        try:
            # Planner
            planner_input = prompt + "\n\n## SKILLS\n" + planner_skills
            plan = await planner.run(planner_input, router=router, run_context=ctx)
            agent_entries.append(_entry(planner, plan))
            gen_cost += plan.cost_eur
            models_used.append(plan.model_used)
            await record_agent_experience(
                memory, "planner", prompt[:100], plan.output[:200],
                plan.model_used, plan.cost_eur,
            )

            # Designer + Architect parallel
            parallel = ParallelGroup(agents=[designer, architect])
            par_result = await parallel.run(
                inputs={
                    "Visual Designer": plan.output,
                    "React Project Architect": plan.output,
                },
                router=router, run_context=ctx,
            )
            des = par_result.get("Visual Designer")
            arch = par_result.get("React Project Architect")
            agent_entries.extend([_entry(designer, des), _entry(architect, arch)])
            gen_cost += des.cost_eur + arch.cost_eur
            models_used.extend([des.model_used, arch.model_used])
            await record_agent_experience(
                memory, "designer", prompt[:100], des.output[:200],
                des.model_used, des.cost_eur,
            )
            await record_agent_experience(
                memory, "architect", prompt[:100], arch.output[:200],
                arch.model_used, arch.cost_eur,
            )

            # Builder
            build_input = (
                f"## Spec\n{plan.output}\n\n"
                f"## Design\n{des.output}\n\n"
                f"## Architecture\n{arch.output}\n\n"
                f"## SKILLS\n{builder_skills}"
            )
            code = await builder.run(build_input, router=router, run_context=ctx)
            file_count = code.output.count("</file>")
            agent_entries.append(_entry(builder, code))
            gen_cost += code.cost_eur
            models_used.append(code.model_used)
            await record_agent_experience(
                memory, "builder", prompt[:100], f"{file_count} files",
                code.model_used, code.cost_eur,
            )

            # Reviewer
            review = await reviewer.run(
                code.output[:4000], router=router, run_context=ctx,
            )
            agent_entries.append(_entry(reviewer, review))
            gen_cost += review.cost_eur
            models_used.append(review.model_used)
            await record_agent_experience(
                memory, "reviewer", prompt[:100], review.output[:200],
                review.model_used, review.cost_eur,
            )

            # Generation-level memory
            await record_generation_experience(
                memory, prompt=prompt, profile="balanced",
                total_cost=gen_cost, models_used=models_used,
                success=True, file_count=file_count,
                reviewer_summary=review.output[:200],
            )
            successes += 1

        except Exception:
            logger.exception("Generation %d failed", i + 1)
            failures += 1

        total_cost += gen_cost
        results.append({
            "id": i + 1,
            "prompt": prompt,
            "timestamp": datetime.now(tz=UTC).isoformat(),
            "agents": agent_entries,
            "total_cost_eur": gen_cost,
            "success": failures == 0 or successes > 0,
        })

        if (i + 1) % 10 == 0:
            _save(results, output_dir)
            logger.info(
                "Progress: %d/%d | Cost: EUR %.4f | Success: %d | Failed: %d | Telemetry: %d",
                i + 1, BATCH_SIZE, total_cost, successes, failures,
                telemetry.total_outcomes,
            )

    _save(results, output_dir)
    logger.info("=" * 60)
    logger.info("BATCH COMPLETE")
    logger.info("Total: %d generations", len(results))
    logger.info("Success: %d (%.0f%%)", successes, successes / max(len(results), 1) * 100)
    logger.info("Failed: %d", failures)
    logger.info("Total cost: EUR %.4f", total_cost)
    logger.info("Avg cost/gen: EUR %.4f", total_cost / max(len(results), 1))
    logger.info("Telemetry: %d outcomes", telemetry.total_outcomes)
    logger.info("Memory: %s", memory.stats())


def _entry(agent: Agent, result: object) -> dict[str, object]:
    """Build a result entry dict from agent + result."""
    return {
        "role": agent.role,
        "model_used": result.model_used,  # type: ignore[union-attr]
        "cost_eur": result.cost_eur,  # type: ignore[union-attr]
        "input_tokens": result.input_tokens,  # type: ignore[union-attr]
        "output_tokens": result.output_tokens,  # type: ignore[union-attr]
        "output_length": len(result.output),  # type: ignore[union-attr]
    }


def _save(results: list[dict[str, object]], output_dir: Path) -> None:
    """Save results incrementally."""
    with open(output_dir / "results.json", "w") as f:
        json.dump(results, f, indent=2)


if __name__ == "__main__":
    asyncio.run(run_batch())
