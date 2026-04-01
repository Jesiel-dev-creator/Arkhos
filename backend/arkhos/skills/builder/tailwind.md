# Tailwind CSS Patterns

## Responsive Design

Mobile-first approach: base classes apply to mobile, then layer on `sm:`, `md:`, `lg:`, and `xl:` prefixes for larger screens. Common breakpoints: `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`. Grid columns: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` for responsive grids. Padding: `px-4 md:px-8 lg:px-16` for responsive horizontal spacing.

## Dark Mode

Use the `dark:` prefix for dark mode variants. Define CSS custom properties for semantic colors in index.css with both light and dark values. Apply via Tailwind config: `bg-background`, `text-foreground`, `border-border`. This allows the entire color scheme to change with a single class toggle.

## CSS Custom Properties

Define the design system as CSS variables in `:root` and `.dark` selectors within `src/index.css`. Map them in `tailwind.config.ts` under `theme.extend.colors`. This connects the Designer agent's output directly to Tailwind utilities without hardcoding hex values throughout components.

## Spacing Consistency

Use Tailwind's built-in spacing scale consistently. Common values: `p-4` (16px), `p-6` (24px), `p-8` (32px), `gap-4`, `gap-6`, `gap-8` for grid and flex gaps. Section vertical padding: `py-16 md:py-24 lg:py-32`. Never use arbitrary values like `p-[17px]` when a standard utility exists.

## Layout Utilities

Max content width: `max-w-7xl mx-auto` (1280px centered). Full-bleed sections: remove max-width, add `px-4 md:px-8`. Flex layouts: `flex items-center justify-between` for navbars. Grid layouts: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6` for card grids.
