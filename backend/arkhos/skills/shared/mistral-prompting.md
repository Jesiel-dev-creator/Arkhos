# Mistral Model Prompting Guide

## Model Selection Table

| Task | Model | Temperature | Reasoning |
|------|-------|-------------|-----------|
| Planning/classification | ministral-3b-latest | 0.7 | Fast, cheap, good at structured output |
| Design decisions | mistral-small (magistral) | 0.5-0.8 | Reasoning capability for creative choices |
| Code generation | devstral-small | 0.2 | Low temperature for precise, consistent code |
| Review/validation | mistral-small | 0.3-0.5 | Balanced between precision and flexibility |

## System Prompt Structure

Define a clear role in the first line of the system prompt. Use numbered instructions rather than bullet points — Mistral models follow numbered lists more reliably. Be specific about the output format: provide a JSON schema or example output. Include negative instructions ("Do NOT...") for critical constraints the model might otherwise violate.

## Prompt Engineering Patterns

- **Show, don't tell**: Include a concrete example of the desired output format rather than describing it abstractly. One good example is worth 100 words of description.
- **Specify output format explicitly**: "Respond with a JSON object containing these exact keys: ..." works better than "Return the result as structured data."
- **Constraint ordering**: Put the most important constraints first. Models pay more attention to early instructions.
- **Chain of thought**: For reasoning tasks (Designer, Reviewer), ask the model to think step by step before producing the final output. This improves quality for complex decisions.

## Cost Optimization

Keep system prompts under 2000 tokens. Use the cheapest model that reliably handles the task. ministral-3b costs near zero for classification. Batch simple decisions into a single prompt rather than multiple API calls. Set budget ceilings per agent to prevent runaway costs.
