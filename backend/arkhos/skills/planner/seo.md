# SEO Best Practices for Generated Pages

## Heading Hierarchy

Every page must have exactly one H1 tag containing the primary keyword or value proposition. H2 tags define major sections. H3 tags are used within sections for sub-topics. Never skip heading levels (H1 directly to H3). Search engines use heading hierarchy to understand content structure and topical relevance.

## Semantic HTML5

Use semantic elements consistently: `<header>` for site header, `<nav>` for navigation, `<main>` for primary content, `<section>` for thematic groupings with headings, `<article>` for self-contained content, `<aside>` for tangential content, and `<footer>` for the page footer. Screen readers and search engines both rely on these landmarks.

## Meta Tags

Required meta tags for every generated page: `<meta name="description" content="...">` (max 150 characters, include primary keyword), `<meta property="og:title">`, `<meta property="og:description">`, `<meta property="og:image">` (1200x630px recommended), `<meta name="twitter:card" content="summary_large_image">`. The title tag should be under 60 characters with the brand name last.

## Performance for SEO

Images below the fold must use `loading="lazy"`. Font files require `<link rel="preconnect">` to the CDN origin. Inline critical CSS for above-the-fold content when possible. Google uses Core Web Vitals as a ranking signal, so LCP under 2.5 seconds is essential.

## Local Business SEO

For local businesses (bakeries, restaurants, agencies), include JSON-LD structured data for `LocalBusiness` schema with name, address, phone, hours, and geo coordinates. Add the business location in the meta description. Include a Google Maps embed or link in the contact section.
