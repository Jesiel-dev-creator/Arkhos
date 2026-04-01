# Code Quality Review Standards

## Naming Conventions

Components use PascalCase: `HeroSection`, `PricingCard`. Files match component names: `HeroSection.tsx`. Props interfaces use the component name suffixed with Props: `HeroSectionProps`. CSS variables use kebab-case: `--primary-color`. Constants use UPPER_SNAKE_CASE: `MAX_RETRIES`. Event handlers use the `handle` prefix: `handleClick`, `handleSubmit`.

## Dead Code Detection

Remove all unused imports — they increase bundle size and confuse readers. Remove all unused variables and functions. Remove commented-out code blocks — version control exists for a reason. Remove empty useEffect hooks or components that render nothing. ESLint and TypeScript strict mode catch most of these, but manual review catches semantic dead code.

## Console and Debug Artifacts

No `console.log`, `console.warn`, or `console.error` statements in production code. No `debugger` statements. No `TODO` or `FIXME` comments that indicate unfinished work being shipped. No `@ts-ignore` or `@ts-expect-error` comments suppressing legitimate type errors — fix the types instead.

## Error Handling

Every async operation must have error handling. Fetch calls need `.catch()` or try/catch with meaningful error states displayed to users. Form submissions need validation before sending. Image loading should have fallback states. Network errors should show user-friendly messages, not raw error objects.

## TypeScript Strictness

Enable `strict: true` in tsconfig. No `any` types — use `unknown` when the type is genuinely unknown, then narrow with type guards. All function parameters and return types should be explicit. Use discriminated unions for state management: `{ status: "loading" } | { status: "success", data: T } | { status: "error", message: string }`.

## DRY and YAGNI

Extract repeated patterns into shared components or utilities. If the same JSX structure appears in 3+ places, it should be a component. But do not prematurely abstract — YAGNI (You Ain't Gonna Need It). Build for the current requirements, not hypothetical future ones. Simple, readable code is better than clever, abstracted code.
