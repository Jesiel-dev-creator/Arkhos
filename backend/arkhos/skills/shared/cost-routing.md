# Cost-Aware Model Routing

## Routing Principle

Always use the cheapest model that can reliably handle the task. Over-provisioning wastes budget; under-provisioning produces poor results. The goal is maximum quality per euro spent, not minimum cost or maximum capability.

## Model Cost Tiers

| Tier | Model | Approximate Cost | Best For |
|------|-------|-----------------|----------|
| 0 (cheapest) | ministral-3b-latest | ~EUR 0.0001/call | Classification, structured extraction, simple planning |
| 1 (balanced) | mistral-small | ~EUR 0.0005/call | Reasoning, design decisions, code review |
| 2 (capable) | devstral-small | ~EUR 0.002/call | Code generation, complex multi-file output |
| 3 (premium) | magistral-medium | ~EUR 0.005/call | Complex reasoning, architecture decisions |

## Budget Management

Hard ceiling per generation: EUR 0.25. This gives every agent generous room to use skills and templates fully. The builder gets the largest allocation (EUR 0.10) because code generation requires the most tokens. Designer and Reviewer each get EUR 0.05 to work with skills properly. If any agent approaches its budget limit, Tramontane will truncate the response — better to allocate generously than produce low-quality output.

## Global Daily Spend

Daily spend cap: EUR 25.00 across all generations. At EUR 0.01-0.05 per generation typical cost, this allows 500+ generations per day. Rate limiting (3 per IP per day) ensures this budget is distributed fairly across users. Monitor daily spend and alert at 80% threshold.

## When to Upgrade Models

If an agent consistently produces poor results (planner misclassifies industry, builder generates broken code), consider upgrading to the next model tier. Track quality metrics: parse success rate for builder, spec match rate for reviewer. Model upgrades should be data-driven, not speculative.
