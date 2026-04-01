# React Patterns for Generated Projects

## Component Structure

One component per file, using named export and default export together. The Props interface is defined at the top of the file, immediately after imports. Component name matches the filename exactly. Sections go in `src/sections/`, reusable UI in `src/components/ui/`, utility functions in `src/lib/`.

## Styling Rules

No inline styles — use Tailwind CSS classes exclusively. No hardcoded color values in className strings; use CSS custom properties via Tailwind (bg-background, text-foreground, etc.) defined in index.css. This ensures the design system from the Designer agent is applied consistently and can be changed in one place.

## TypeScript Discipline

No `any` types anywhere in the project. Use proper interfaces for all props, state, and API responses. Use `React.FC<Props>` or explicit return types on components. Union types for variant props: `variant: "default" | "outline" | "ghost"`. Optional props use `?` syntax, never `| undefined`.

## Image Handling

Every `<img>` tag requires a meaningful `alt` attribute describing the image content. Images below the fold use `loading="lazy"`. Decorative images use `alt=""` (empty string, not omitted). Use Unsplash via picsum.photos for placeholder images with explicit width and height attributes to prevent layout shift.

## Hook Patterns

`useState` for UI state (open/closed, selected tab, form values). `useEffect` with proper cleanup functions for subscriptions, timers, and event listeners — always return a cleanup function. `useCallback` for event handlers passed to child components to prevent unnecessary re-renders. Never call hooks conditionally or inside loops.

## Anti-Patterns to Avoid

No prop drilling beyond 2 levels — use composition or context instead. Never omit `key` prop in `.map()` renders — use a stable identifier, never array index. No direct DOM manipulation — use refs when necessary. No `useEffect` for derived state — compute during render instead.
