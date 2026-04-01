# Framer Motion Animation Patterns

## Fade Up (Standard Reveal)

The default entrance animation for all content blocks: `initial={{ opacity: 0, y: 20 }}` and `animate={{ opacity: 1, y: 0 }}` with `transition={{ duration: 0.5, ease: "easeOut" }}`. This subtle upward movement draws attention without being distracting.

## Scroll-Triggered Animations

Use `whileInView` with `viewport={{ once: true, margin: "-100px" }}` so elements animate only once as they scroll into view. The negative margin triggers the animation slightly before the element is fully visible, creating a smoother experience. Never use `once: false` — repeated animations are distracting.

## Stagger Children

For lists and grids, use a parent `motion.div` with `variants` containing `staggerChildren: 0.08`. Each child uses `variants` with show/hidden states. This creates a cascading reveal effect. Keep stagger delay between 0.05 and 0.12 seconds — faster feels snappy, slower feels dramatic.

## Hover Interactions

Subtle scale on hover: `whileHover={{ scale: 1.03 }}` for cards, `whileHover={{ scale: 1.05 }}` for buttons. Add `transition={{ type: "spring", stiffness: 300 }}` for responsive feel. Never scale beyond 1.05 — it feels exaggerated.

## Performance Rules

Only animate `transform` (translate, scale, rotate) and `opacity` — these properties are GPU-accelerated and don't trigger layout recalculation. Never animate `width`, `height`, `padding`, `margin`, or `border-width`. Use `AnimatePresence` for mount/unmount animations (modals, toasts, page transitions). Always include `layout` prop when animating elements that change position in the DOM.

## Reduced Motion

Wrap animation variants in a check for `prefers-reduced-motion`. Provide static alternatives: elements appear instantly without movement. Framer Motion respects this automatically when using `useReducedMotion` hook.
