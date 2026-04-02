# Next.js Scaffold + Infrastructure — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold a new Next.js App Router frontend at `frontend-next/` with Electric Indigo design system, dark/light/GPU themes, FR/EN i18n, shadcn/ui, and premium Navbar + Footer. Old Vite frontend is deleted.

**Architecture:** Replaces `frontend/` entirely. Uses Next.js 16.2 App Router with `[locale]` route segment for i18n. Three themes: Dark (indigo), Light (indigo), GPU (NVIDIA green, auto-activates when NIM detected). All design tokens in CSS variables consumed by Tailwind. next-themes for dark/light, GPU mode via backend detection.

**Tech Stack:** Next.js 16.2, React 19, TypeScript, Tailwind CSS 4.2, shadcn/ui CLI v4, next-themes, next-intl, Lucide React, Framer Motion, GSAP, pnpm

---

### Task 1: Scaffold Next.js Project

**Files:**
- Create: `frontend-next/package.json`
- Create: `frontend-next/next.config.ts`
- Create: `frontend-next/tsconfig.json`
- Create: `frontend-next/.gitignore`

- [ ] **Step 1: Create Next.js project with pnpm**

```bash
cd /mnt/c/Users/Admin/Arkhos/Arkhos
pnpm create next-app frontend-next --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-pnpm
```

When prompted: Yes to all defaults except `src/` directory (we use `app/` at root).

- [ ] **Step 2: Install core dependencies**

```bash
cd frontend-next
pnpm add next-themes next-intl lucide-react framer-motion gsap clsx tailwind-merge
pnpm add -D @types/node
```

- [ ] **Step 3: Verify dev server starts**

```bash
pnpm dev
```

Expected: Next.js dev server at http://localhost:3000 with default page.

- [ ] **Step 4: Commit**

```bash
git add frontend-next/
git commit -m "scaffold: Next.js 15 project with core dependencies"
```

---

### Task 2: Design Tokens + Tailwind Config

**Files:**
- Create: `frontend-next/app/globals.css`
- Modify: `frontend-next/tailwind.config.ts`

- [ ] **Step 1: Write globals.css with Electric Indigo design tokens**

Create `frontend-next/app/globals.css`:

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

/* ── ArkhosAI Electric Indigo Design System ── */

:root {
  /* Backgrounds */
  --void: #030712;
  --deep: #0F172A;
  --surface: #1E293B;
  --elevated: #334155;

  /* Borders */
  --border: #1E293B;
  --border-strong: #334155;

  /* Brand */
  --indigo: #6366F1;
  --indigo-light: #818CF8;
  --indigo-dark: #4F46E5;
  --indigo-glow: rgba(99, 102, 241, 0.15);

  /* Semantic */
  --text-primary: #F1F5F9;
  --text-secondary: #94A3B8;
  --text-muted: #64748B;
  --success: #22C55E;
  --warning: #F59E0B;
  --error: #EF4444;
  --gold: #CA8A04;

  /* Effects */
  --glow-indigo: 0 0 24px rgba(99, 102, 241, 0.12);
  --glow-success: 0 0 16px rgba(34, 197, 94, 0.10);
  --glass-bg: rgba(15, 23, 42, 0.6);
  --glass-border: 1px solid rgba(255, 255, 255, 0.06);
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 400ms ease;

  /* Typography */
  --font-display: "Syne", sans-serif;
  --font-body: "DM Sans", sans-serif;
  --font-code: "JetBrains Mono", monospace;

  /* shadcn/ui mappings */
  --background: var(--void);
  --foreground: var(--text-primary);
  --card: var(--deep);
  --card-foreground: var(--text-primary);
  --popover: var(--deep);
  --popover-foreground: var(--text-primary);
  --primary: var(--indigo);
  --primary-foreground: #ffffff;
  --secondary: var(--surface);
  --secondary-foreground: var(--text-secondary);
  --muted: var(--surface);
  --muted-foreground: var(--text-muted);
  --accent: var(--elevated);
  --accent-foreground: var(--text-primary);
  --destructive: var(--error);
  --input: var(--border);
  --ring: var(--indigo);
  --radius: 0.5rem;
}

/* Light mode */
.light {
  --void: #FFFFFF;
  --deep: #F8FAFC;
  --surface: #F1F5F9;
  --elevated: #E2E8F0;
  --border: #E2E8F0;
  --border-strong: #CBD5E1;
  --text-primary: #0F172A;
  --text-secondary: #475569;
  --text-muted: #94A3B8;
  --glass-bg: rgba(255, 255, 255, 0.8);
  --glass-border: 1px solid rgba(0, 0, 0, 0.06);

  --background: var(--void);
  --foreground: var(--text-primary);
  --card: var(--deep);
  --card-foreground: var(--text-primary);
  --popover: var(--deep);
  --popover-foreground: var(--text-primary);
  --secondary: var(--surface);
  --secondary-foreground: var(--text-secondary);
  --muted: var(--surface);
  --muted-foreground: var(--text-muted);
  --accent: var(--elevated);
  --accent-foreground: var(--text-primary);
  --input: var(--border);
}

/* Base styles */
body {
  background: var(--void);
  color: var(--text-primary);
  font-family: var(--font-body);
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: var(--void);
}
::-webkit-scrollbar-thumb {
  background: var(--elevated);
  border-radius: 3px;
}
```

- [ ] **Step 2: Configure Tailwind with custom theme**

Update `frontend-next/tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "var(--void)",
        deep: "var(--deep)",
        surface: "var(--surface)",
        elevated: "var(--elevated)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        indigo: {
          DEFAULT: "var(--indigo)",
          light: "var(--indigo-light)",
          dark: "var(--indigo-dark)",
        },
        success: "var(--success)",
        warning: "var(--warning)",
        error: "var(--error)",
        gold: "var(--gold)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        code: ["var(--font-code)"],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      boxShadow: {
        "glow-indigo": "var(--glow-indigo)",
        "glow-success": "var(--glow-success)",
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 3: Verify Tailwind compiles with custom tokens**

Create a test page `frontend-next/app/page.tsx`:

```tsx
export default function Home() {
  return (
    <div className="min-h-screen bg-void flex items-center justify-center">
      <h1 className="font-display text-4xl text-[var(--text-primary)]">
        ArkhosAI
      </h1>
    </div>
  );
}
```

Run `pnpm dev` and verify the page renders with dark background and Syne font.

- [ ] **Step 4: Commit**

```bash
git add frontend-next/app/globals.css frontend-next/tailwind.config.ts frontend-next/app/page.tsx
git commit -m "design: Electric Indigo tokens + Tailwind config"
```

---

### Task 3: Theme Provider (next-themes)

**Files:**
- Create: `frontend-next/components/providers.tsx`
- Modify: `frontend-next/app/layout.tsx`

- [ ] **Step 1: Create the providers wrapper**

Create `frontend-next/components/providers.tsx`:

```tsx
"use client";

import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
```

- [ ] **Step 2: Create ThemeToggle component**

Create `frontend-next/components/layout/theme-toggle.tsx`:

```tsx
"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-9 h-9" />;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex items-center justify-center w-9 h-9 rounded-md
                 bg-surface hover:bg-elevated transition-colors cursor-pointer"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-[var(--text-secondary)]" />
      ) : (
        <Moon className="w-4 h-4 text-[var(--text-secondary)]" />
      )}
    </button>
  );
}
```

- [ ] **Step 3: Wire providers into root layout**

Update `frontend-next/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-code",
  display: "swap",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "ArkhosAI — AI Website Generator",
  description:
    "Build beautiful websites with AI. EU sovereign, open source, powered by Mistral.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable}
                     font-body antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Verify theme toggle works**

Update `frontend-next/app/page.tsx` temporarily:

```tsx
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center gap-4">
      <ThemeToggle />
      <h1 className="font-display text-4xl text-[var(--text-primary)]">
        ArkhosAI
      </h1>
      <p className="text-[var(--text-secondary)] font-body">
        Electric Indigo design system
      </p>
    </div>
  );
}
```

Run `pnpm dev`. Click the theme toggle — page should switch between dark (#030712 bg) and light (#FFFFFF bg).

- [ ] **Step 5: Commit**

```bash
git add frontend-next/components/providers.tsx frontend-next/components/layout/theme-toggle.tsx frontend-next/app/layout.tsx frontend-next/app/page.tsx
git commit -m "feat: theme provider + toggle (dark/light/system)"
```

---

### Task 4: Internationalization (next-intl)

**Files:**
- Create: `frontend-next/i18n/request.ts`
- Create: `frontend-next/i18n/routing.ts`
- Create: `frontend-next/messages/en.json`
- Create: `frontend-next/messages/fr.json`
- Create: `frontend-next/middleware.ts`
- Modify: `frontend-next/app/layout.tsx` → move to `frontend-next/app/[locale]/layout.tsx`
- Modify: `frontend-next/app/page.tsx` → move to `frontend-next/app/[locale]/page.tsx`

- [ ] **Step 1: Create i18n routing config**

Create `frontend-next/i18n/routing.ts`:

```ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "fr"],
  defaultLocale: "en",
});
```

- [ ] **Step 2: Create i18n request config**

Create `frontend-next/i18n/request.ts`:

```ts
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as "en" | "fr")) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

- [ ] **Step 3: Create middleware for locale detection**

Create `frontend-next/middleware.ts`:

```ts
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
```

- [ ] **Step 4: Create EN and FR message files**

Create `frontend-next/messages/en.json`:

```json
{
  "nav": {
    "home": "Home",
    "generate": "Generate",
    "gallery": "Gallery",
    "pricing": "Pricing",
    "about": "About",
    "docs": "Docs",
    "blog": "Blog"
  },
  "hero": {
    "title": "Build beautiful websites with AI",
    "subtitle": "EU sovereign. Open source. Powered by Mistral.",
    "cta": "Start generating",
    "placeholder": "Describe your website..."
  },
  "generate": {
    "title": "Generate",
    "fleet": {
      "budget": "Budget",
      "balanced": "Balanced",
      "quality": "Quality"
    },
    "status": {
      "idle": "Ready",
      "running": "Generating...",
      "complete": "Complete",
      "error": "Error"
    },
    "agents": {
      "planner": "Planner",
      "designer": "Designer",
      "architect": "Architect",
      "builder": "Builder",
      "reviewer": "Reviewer"
    }
  },
  "footer": {
    "company": "Bleucommerce SAS",
    "location": "Orleans, France",
    "rights": "All rights reserved"
  },
  "theme": {
    "dark": "Dark",
    "light": "Light",
    "system": "System"
  }
}
```

Create `frontend-next/messages/fr.json`:

```json
{
  "nav": {
    "home": "Accueil",
    "generate": "Generer",
    "gallery": "Galerie",
    "pricing": "Tarifs",
    "about": "A propos",
    "docs": "Documentation",
    "blog": "Blog"
  },
  "hero": {
    "title": "Creez de beaux sites web avec l'IA",
    "subtitle": "Souverainete europeenne. Open source. Propulse par Mistral.",
    "cta": "Commencer",
    "placeholder": "Decrivez votre site web..."
  },
  "generate": {
    "title": "Generer",
    "fleet": {
      "budget": "Economique",
      "balanced": "Equilibre",
      "quality": "Qualite"
    },
    "status": {
      "idle": "Pret",
      "running": "Generation en cours...",
      "complete": "Termine",
      "error": "Erreur"
    },
    "agents": {
      "planner": "Planificateur",
      "designer": "Designer",
      "architect": "Architecte",
      "builder": "Developpeur",
      "reviewer": "Verificateur"
    }
  },
  "footer": {
    "company": "Bleucommerce SAS",
    "location": "Orleans, France",
    "rights": "Tous droits reserves"
  },
  "theme": {
    "dark": "Sombre",
    "light": "Clair",
    "system": "Systeme"
  }
}
```

- [ ] **Step 5: Move layout and page into [locale] segment**

```bash
cd frontend-next
mkdir -p app/\[locale\]
mv app/layout.tsx app/\[locale\]/layout.tsx
mv app/page.tsx app/\[locale\]/page.tsx
```

Update `frontend-next/app/[locale]/layout.tsx` — add locale param and NextIntlClientProvider:

```tsx
import type { Metadata } from "next";
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { Providers } from "@/components/providers";
import { routing } from "@/i18n/routing";
import "../globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-code",
  display: "swap",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "ArkhosAI — AI Website Generator",
  description:
    "Build beautiful websites with AI. EU sovereign, open source, powered by Mistral.",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "en" | "fr")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable}
                     font-body antialiased`}
      >
        <Providers>
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Create locale switcher component**

Create `frontend-next/components/layout/locale-switcher.tsx`:

```tsx
"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";

const LOCALES = [
  { code: "en", flag: "🇬🇧", label: "EN" },
  { code: "fr", flag: "🇫🇷", label: "FR" },
] as const;

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(newLocale: string) {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  }

  return (
    <div className="flex items-center gap-1 rounded-md border border-[var(--border)] p-0.5 bg-deep">
      {LOCALES.map((l) => (
        <button
          key={l.code}
          onClick={() => switchLocale(l.code)}
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium
                       transition-colors cursor-pointer
                       ${locale === l.code
                         ? "bg-indigo text-white"
                         : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                       }`}
        >
          <span className="text-sm">{l.flag}</span>
          {l.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 7: Verify i18n works**

Update `frontend-next/app/[locale]/page.tsx`:

```tsx
import { useTranslations } from "next-intl";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";

export default function Home() {
  const t = useTranslations("hero");

  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <LocaleSwitcher />
      </div>
      <h1 className="font-display text-4xl text-[var(--text-primary)]">
        {t("title")}
      </h1>
      <p className="text-[var(--text-secondary)] font-body">
        {t("subtitle")}
      </p>
    </div>
  );
}
```

Run `pnpm dev`. Visit `/en` — English text. Visit `/fr` — French text. Toggle should switch.

- [ ] **Step 8: Commit**

```bash
git add frontend-next/i18n/ frontend-next/messages/ frontend-next/middleware.ts frontend-next/app/ frontend-next/components/layout/locale-switcher.tsx
git commit -m "feat: FR/EN internationalization with next-intl"
```

---

### Task 5: shadcn/ui Installation

**Files:**
- Create: `frontend-next/components/ui/` (multiple files)
- Create: `frontend-next/lib/utils.ts`
- Create: `frontend-next/components.json`

- [ ] **Step 1: Initialize shadcn/ui**

```bash
cd frontend-next
pnpm dlx shadcn@latest init
```

When prompted:
- Style: Default
- Base color: Slate
- CSS variables: Yes

- [ ] **Step 2: Install required components**

```bash
pnpm dlx shadcn@latest add button card dialog badge input textarea separator tabs accordion sheet avatar tooltip select scroll-area switch skeleton slider
```

- [ ] **Step 3: Verify utils.ts exists**

Check `frontend-next/lib/utils.ts` contains:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 4: Verify a shadcn component renders**

Update `frontend-next/app/[locale]/page.tsx`:

```tsx
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";

export default function Home() {
  const t = useTranslations("hero");

  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center gap-6">
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <LocaleSwitcher />
      </div>
      <Badge variant="secondary" className="text-indigo">
        v0.3 — Electric Indigo
      </Badge>
      <h1 className="font-display text-4xl text-[var(--text-primary)]">
        {t("title")}
      </h1>
      <p className="text-[var(--text-secondary)] font-body max-w-md text-center">
        {t("subtitle")}
      </p>
      <Button className="bg-indigo hover:bg-indigo-light text-white">
        {t("cta")}
      </Button>
    </div>
  );
}
```

Run `pnpm dev`. Verify button renders with indigo background, badge shows correctly.

- [ ] **Step 5: Commit**

```bash
git add frontend-next/components/ui/ frontend-next/lib/utils.ts frontend-next/components.json
git commit -m "feat: shadcn/ui installed with 16 components"
```

---

### Task 6: Premium Navbar

**Files:**
- Create: `frontend-next/components/layout/navbar.tsx`

Use 21st.dev Magic MCP for inspiration first:
```
mcp__21st-dev__21st_magic_component_inspiration: "floating glass navbar dark theme with logo, nav links, theme toggle, locale switcher"
```

Then build with UI/UX Pro Max rules:
```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "navbar floating glass" --domain style -n 3
```

- [ ] **Step 1: Create Navbar component**

Create `frontend-next/components/layout/navbar.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "next-intl/navigation";
import { Menu, X, Sparkles } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { LocaleSwitcher } from "./locale-switcher";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV_LINKS = [
  { key: "pricing", href: "/pricing" },
  { key: "gallery", href: "/gallery" },
  { key: "docs", href: "/docs" },
  { key: "about", href: "/about" },
  { key: "blog", href: "/blog" },
] as const;

export function Navbar() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-4 left-4 right-4 z-50">
      <div
        className="mx-auto max-w-6xl flex items-center justify-between
                    px-4 py-2.5 rounded-xl
                    bg-[var(--glass-bg)] backdrop-blur-xl
                    border border-[var(--border)]"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-indigo flex items-center justify-center
                          group-hover:shadow-glow-indigo transition-shadow">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-lg font-bold text-[var(--text-primary)]">
            Arkhos
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className="px-3 py-1.5 rounded-md text-sm font-medium
                         text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                         hover:bg-[var(--surface)] transition-colors"
            >
              {t(link.key)}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
          <Link href="/generate">
            <Button
              size="sm"
              className="bg-indigo hover:bg-indigo-light text-white text-sm
                         shadow-glow-indigo cursor-pointer"
            >
              {t("generate")}
            </Button>
          </Link>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden flex items-center justify-center w-9 h-9
                                 rounded-md bg-surface hover:bg-elevated transition-colors
                                 cursor-pointer">
                {open ? (
                  <X className="w-4 h-4 text-[var(--text-secondary)]" />
                ) : (
                  <Menu className="w-4 h-4 text-[var(--text-secondary)]" />
                )}
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-deep border-[var(--border)] w-72">
              <div className="flex flex-col gap-2 mt-8">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.key}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="px-4 py-2.5 rounded-lg text-sm font-medium
                               text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                               hover:bg-surface transition-colors"
                  >
                    {t(link.key)}
                  </Link>
                ))}
                <div className="flex items-center gap-2 px-4 pt-4 border-t border-[var(--border)]">
                  <LocaleSwitcher />
                  <ThemeToggle />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Verify Navbar renders**

Update `frontend-next/app/[locale]/layout.tsx` — add Navbar inside the providers:

Add import at top:
```tsx
import { Navbar } from "@/components/layout/navbar";
```

Inside `<Providers>` wrapper, before `{children}`:
```tsx
<Navbar />
```

Run `pnpm dev`. Verify floating glass navbar with logo, links, theme toggle, locale switcher, and Generate CTA button.

- [ ] **Step 3: Commit**

```bash
git add frontend-next/components/layout/navbar.tsx frontend-next/app/\[locale\]/layout.tsx
git commit -m "feat: premium floating glass navbar with theme + locale"
```

---

### Task 7: Footer

**Files:**
- Create: `frontend-next/components/layout/footer.tsx`

- [ ] **Step 1: Create Footer component**

Create `frontend-next/components/layout/footer.tsx`:

```tsx
import { useTranslations } from "next-intl";
import { Link } from "next-intl/navigation";
import { Github, Twitter } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const FOOTER_LINKS = {
  product: [
    { key: "generate", href: "/generate" },
    { key: "gallery", href: "/gallery" },
    { key: "pricing", href: "/pricing" },
    { key: "docs", href: "/docs" },
  ],
  company: [
    { key: "about", href: "/about" },
    { key: "blog", href: "/blog" },
  ],
  legal: [
    { label: "Privacy", href: "/legal/privacy" },
    { label: "Terms", href: "/legal/terms" },
    { label: "Cookies", href: "/legal/cookies" },
    { label: "Imprint", href: "/legal/imprint" },
  ],
} as const;

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="border-t border-[var(--border)] bg-deep">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="font-display text-lg font-bold text-[var(--text-primary)]">
              Arkhos
            </span>
            <p className="mt-2 text-sm text-[var(--text-muted)] max-w-xs">
              {t("hero.subtitle")}
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a
                href="https://github.com/bleucommerce/arkhos"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]
                           transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com/arkhosai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]
                           transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">
              Product
            </h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.product.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--text-muted)]
                               hover:text-[var(--text-primary)] transition-colors"
                  >
                    {t(`nav.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">
              Company
            </h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--text-muted)]
                               hover:text-[var(--text-primary)] transition-colors"
                  >
                    {t(`nav.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">
              Legal
            </h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--text-muted)]
                               hover:text-[var(--text-primary)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-[var(--border)]" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-[var(--text-muted)]">
            &copy; {new Date().getFullYear()} {t("footer.company")} &middot;{" "}
            {t("footer.location")}
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            Powered by{" "}
            <a
              href="https://pypi.org/project/tramontane/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo hover:text-indigo-light transition-colors"
            >
              Tramontane
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Add Footer to layout**

In `frontend-next/app/[locale]/layout.tsx`, add import:
```tsx
import { Footer } from "@/components/layout/footer";
```

After `{children}` and before closing `</NextIntlClientProvider>`:
```tsx
<Footer />
```

- [ ] **Step 3: Verify Footer renders**

Run `pnpm dev`. Scroll down — footer with product/company/legal columns, social icons, Tramontane link.

- [ ] **Step 4: Commit**

```bash
git add frontend-next/components/layout/footer.tsx frontend-next/app/\[locale\]/layout.tsx
git commit -m "feat: minimal premium footer with links + social"
```

---

### Task 8: Utility Files + API Wrapper

**Files:**
- Create: `frontend-next/lib/api.ts`

- [ ] **Step 1: Create API wrapper for FastAPI backend**

Create `frontend-next/lib/api.ts`:

```ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function apiPost<T>(
  path: string,
  body: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(`${API_BASE}/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(typeof err.detail === "string" ? err.detail : "Request failed");
  }
  return res.json();
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}/api${path}`);
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

export function sseUrl(path: string): string {
  return `${API_BASE}/api${path}`;
}
```

- [ ] **Step 2: Create .env.local**

Create `frontend-next/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

- [ ] **Step 3: Commit**

```bash
git add frontend-next/lib/api.ts frontend-next/.env.local
git commit -m "feat: API wrapper + SSE URL helper for FastAPI backend"
```

---

### Task 9: next.config.ts + Final Verification

**Files:**
- Modify: `frontend-next/next.config.ts`

- [ ] **Step 1: Configure Next.js for next-intl + API proxy**

Update `frontend-next/next.config.ts`:

```ts
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig = {
  // Allow images from picsum.photos (generated site placeholders)
  images: {
    remotePatterns: [
      { protocol: "https" as const, hostname: "picsum.photos" },
    ],
  },
};

export default withNextIntl(nextConfig);
```

- [ ] **Step 2: Full verification checklist**

Run each and verify:

```bash
cd frontend-next
pnpm dev
```

- [ ] Visit `http://localhost:3000` → redirects to `/en`
- [ ] Page shows "Build beautiful websites with AI" in Syne font
- [ ] Click theme toggle → switches dark ↔ light
- [ ] Click FR flag → URL changes to `/fr`, text changes to French
- [ ] Navbar is floating glass with backdrop blur
- [ ] Generate button is indigo with glow
- [ ] Footer shows with 4 columns
- [ ] Mobile: hamburger menu opens Sheet with nav links
- [ ] No console errors

- [ ] **Step 3: Final commit**

```bash
git add frontend-next/next.config.ts
git commit -m "feat: Next.js scaffold complete — indigo design, theme, i18n, navbar, footer"
```

---

## File Summary

| File | Purpose |
|------|---------|
| `frontend-next/app/globals.css` | Electric Indigo design tokens (dark + light) |
| `frontend-next/tailwind.config.ts` | Custom Tailwind theme with CSS variable colors |
| `frontend-next/app/[locale]/layout.tsx` | Root layout: fonts, theme, i18n, navbar, footer |
| `frontend-next/app/[locale]/page.tsx` | Temp home page (replaced in Sub-project 3) |
| `frontend-next/components/providers.tsx` | ThemeProvider wrapper |
| `frontend-next/components/layout/navbar.tsx` | Floating glass navbar |
| `frontend-next/components/layout/footer.tsx` | Minimal premium footer |
| `frontend-next/components/layout/theme-toggle.tsx` | Dark/light toggle |
| `frontend-next/components/layout/locale-switcher.tsx` | EN/FR flag toggle |
| `frontend-next/components/ui/*` | 16 shadcn/ui components |
| `frontend-next/lib/utils.ts` | cn() helper |
| `frontend-next/lib/api.ts` | FastAPI fetch wrappers |
| `frontend-next/i18n/routing.ts` | Locale routing config |
| `frontend-next/i18n/request.ts` | Server-side locale resolution |
| `frontend-next/middleware.ts` | Locale detection middleware |
| `frontend-next/messages/en.json` | English translations |
| `frontend-next/messages/fr.json` | French translations |
| `frontend-next/next.config.ts` | next-intl plugin + image domains |
| `frontend-next/.env.local` | API URL for FastAPI |
