# shadcn/ui Component Usage

## Import Convention

All shadcn/ui components are imported from `@/components/ui/*`. Example: `import { Button } from "@/components/ui/button"`. Never import from `shadcn` or `@shadcn` directly. The components are pre-installed in the project and should be used as-is.

## Conditional Classes with cn()

Use the `cn()` utility from `@/lib/utils` for conditional class merging. Example: `cn("base-classes", isActive && "active-classes", className)`. This properly handles Tailwind class conflicts and is the standard pattern for all shadcn/ui components.

## Core Components

Use these shadcn/ui components for consistent UI patterns:
- **Button**: variants `default`, `outline`, `ghost`, `secondary`, `destructive`, `link`. Sizes: `default`, `sm`, `lg`, `icon`.
- **Card**: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` for structured content blocks.
- **Badge**: for status indicators, tags, and labels.
- **Input** and **Textarea**: for form fields, always with associated `Label`.
- **Accordion**: for FAQ sections — `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`.
- **Tabs**: for content switching — `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`.
- **Sheet**: for mobile navigation — slides in from the side.
- **Dialog**: for modal content — confirmations, forms, details.
- **Avatar**: for team photos and testimonials.
- **Separator**: for visual dividers between content sections.

## Composition Rule

Never modify the shadcn/ui component source files. Instead, compose behavior through `className` prop, wrapping components, or creating higher-level components that use shadcn primitives internally. This ensures components remain upgradeable and consistent.
