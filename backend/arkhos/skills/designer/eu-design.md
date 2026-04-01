# EU Design Philosophy

## Color Philosophy

European digital design favors depth and restraint. Deep navy (#0D1B2A), void black (#020408), and warm grays form the foundation. One strong accent color provides energy without overwhelming: electric cyan for tech, warm ember for creative, deep green for sustainability, rich burgundy for luxury. Avoid neon palettes and rainbow gradients. The background should recede; the content should advance. Dark backgrounds with light text convey sophistication. Light backgrounds with dark text convey clarity and openness.

## Typography Recommendations

Display and heading fonts should have personality: Syne (geometric, modern), Clash Display (bold, contemporary), Cabinet Grotesk (clean, European), Space Grotesk (technical, precise). Body text demands readability above all: DM Sans (versatile, clean), Outfit (modern, friendly), Manrope (geometric, professional). Code and technical text: Space Mono (character, readable), JetBrains Mono (developer-focused). Never use Inter, Roboto, or system fonts — they signal generic design. Font loading via Google Fonts CDN with preconnect for performance.

## Layout Principles

Maximum content width: 1280px. Grid: 12 columns with 24px gutters. Section vertical padding: 80-120px on desktop, 48-64px on mobile. Hero section: full viewport height or near-full (min-height: 90vh). Cards: consistent internal padding of 24-32px. Navigation: fixed top, 64-80px height, blurred backdrop on scroll. Footer: generous padding, organized in 3-4 columns.

## Animation Guidelines

Transitions: 200-400ms duration, ease-in-out timing. Never use bounce or elastic easing — they feel playful, not professional. Scroll-triggered reveals: fade up with 20px translate, staggered by 80-100ms between siblings. Hover effects: subtle scale (1.02-1.05) or shadow depth change. Loading states: skeleton screens with subtle pulse, never spinning loaders. Respect prefers-reduced-motion for accessibility.
