# Accessibility Standards (WCAG 2.1 AA)

## Color Contrast

All text must meet WCAG AA contrast requirements: 4.5:1 ratio for normal text (under 18px or under 14px bold), 3:1 ratio for large text (18px+ or 14px+ bold). UI components and graphical objects need 3:1 against adjacent colors. Test every color combination in the design system — accent colors on dark backgrounds are often problematic. Never rely on color alone to convey information (use icons, text labels, or patterns alongside color).

## Button and Interactive Element Accessibility

Every button must have an accessible label. Icon-only buttons require `aria-label` describing the action: `<button aria-label="Close menu">`. Toggle buttons use `aria-pressed`. Links that open new windows need indication: `aria-label="Documentation (opens in new tab)"`. Interactive elements must have a minimum touch target of 44x44px on mobile.

## Form Accessibility

Every input field requires an associated `<label>` element connected via `htmlFor`/`id` pairing, or wrapping the input inside the label. Required fields use `aria-required="true"`. Error messages are linked via `aria-describedby`. Form submission errors are announced to screen readers. Placeholder text is not a substitute for labels — it disappears on focus.

## Focus Management

All interactive elements must have a visible focus indicator — use `focus-visible:ring-2 focus-visible:ring-offset-2` in Tailwind. Focus order follows the visual layout (no positive `tabIndex` values). Modal dialogs trap focus within them. Keyboard navigation works for all functionality: Tab, Shift+Tab, Enter, Escape, Arrow keys for menus.

## Semantic HTML

Use semantic elements: `<nav>` for navigation, `<main>` for primary content, `<section>` with headings, `<article>` for self-contained content. Add `role` attributes only when semantic HTML is insufficient. Include `<h1>` through `<h6>` in proper hierarchy. Images: meaningful `alt` text or `alt=""` for decorative. Add `prefers-reduced-motion` media query to disable animations for users who request it.
