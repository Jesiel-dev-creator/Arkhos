# Web Performance Optimization

## Core Web Vitals Targets

Largest Contentful Paint (LCP): under 2.5 seconds. The hero image or headline must render fast. First Input Delay (FID): under 100 milliseconds. No heavy JavaScript blocking the main thread during initial load. Cumulative Layout Shift (CLS): under 0.1. All images and embeds must have explicit dimensions. These metrics directly affect Google search ranking and user experience.

## Image Optimization

All images from Unsplash or picsum.photos should include quality and format parameters: `?w=1200&q=80&fm=webp` for hero images, `?w=600&q=80&fm=webp` for cards and thumbnails. Every image element must have explicit `width` and `height` attributes to reserve space and prevent layout shift. Images below the first viewport use `loading="lazy"`. Hero images load eagerly (no lazy attribute).

## Font Loading Strategy

Use `<link rel="preconnect" href="https://fonts.googleapis.com">` and `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` in the document head before the font stylesheet link. This establishes the connection early and reduces font loading time by 100-300ms. Use `font-display: swap` to show fallback text immediately while custom fonts load.

## JavaScript Performance

Tree-shake all imports — import only the specific components and utilities needed, never import entire libraries. Use dynamic `import()` for heavy components not needed on initial render (code syntax highlighting, charts, maps). Avoid `will-change` CSS property except on elements that actually animate — overuse consumes GPU memory. Debounce scroll and resize event handlers.

## Bundle Size Awareness

The generated project should produce a bundle under 200KB gzipped for initial load. shadcn/ui components are individually imported (no barrel file bloat). Framer Motion is the heaviest dependency — import only `motion` and `AnimatePresence`, not the entire library. Icons from Lucide React are tree-shakeable when imported individually.
