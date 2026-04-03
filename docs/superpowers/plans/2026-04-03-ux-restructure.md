# UX Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure Arkhos from marketing-with-prompt into a dashboard-first product with Supabase Auth, tiered pricing, and cost logging.

**Architecture:** Supabase Auth (Google/GitHub OAuth + magic link) gates product routes. Dashboard at `/dashboard` shows project grid. New project page at `/dashboard/new` hosts the prompt UI (moved from homepage). Homepage becomes cinematic marketing with no interactive generation. Backend validates Supabase JWTs and logs all generation costs to a `generation_logs` table for pricing verification.

**Tech Stack:** Next.js 16.2, Supabase Auth + DB + Storage, Stripe Checkout, pnpm, Tailwind CSS 4, shadcn/ui

**Spec:** `docs/superpowers/specs/2026-04-03-ux-restructure-design.md`

---

## File Structure

### New Files

```
frontend/
├── lib/supabase.ts                          (Supabase client singleton)
├── components/auth/
│   ├── auth-provider.tsx                    (SupabaseProvider context)
│   └── use-auth.ts                          (useAuth hook)
├── components/dashboard/
│   ├── project-card.tsx                     (thumbnail, name, status, cost)
│   ├── project-grid.tsx                     (grid + new project card)
│   └── empty-state.tsx                      (first-time user CTA)
├── app/[locale]/login/page.tsx              (Supabase Auth UI)
├── app/[locale]/dashboard/
│   ├── layout.tsx                           (auth guard + product navbar variant)
│   ├── page.tsx                             (project grid page)
│   ├── new/page.tsx                         (prompt page — HeroPrompt relocated)
│   └── settings/page.tsx                    (account, usage, billing stub)
├── .env.example                             (env var documentation)

backend/
├── arkhos/auth.py                           (JWT validation dependency)
├── arkhos/user_routes.py                    (user projects + usage endpoints)
├── tests/test_auth.py                       (auth middleware tests)
```

### Modified Files

```
frontend/
├── components/layout/navbar.tsx             (conditional auth-aware links)
├── app/[locale]/layout.tsx                  (add SupabaseProvider)
├── app/[locale]/page.tsx                    (remove HeroPrompt, cinematic redesign)
├── app/[locale]/generate/[id]/page.tsx      (auth guard, back-to-dashboard, auto-save)
├── app/[locale]/pricing/page.tsx            (real tier data, upgrade CTAs)
├── messages/en.json                         (new translation keys)
├── messages/fr.json                         (new translation keys)
├── package.json                             (add supabase deps)

backend/
├── arkhos/app.py                            (add CORS origin for dashboard, mount user_routes)
├── arkhos/routes.py                         (add JWT auth dependency, generation_logs insert)
├── arkhos/config.py                         (add Supabase env vars)
├── arkhos/rate_limit.py                     (per-user-per-tier replaces IP-based)
```

---

## Task 1: Supabase Project Setup + Environment

**Files:**
- Create: `frontend/.env.example`
- Create: `frontend/.env.local` (gitignored)
- Modify: `backend/arkhos/config.py`
- Modify: `backend/.env`

- [ ] **Step 1: Create Supabase project**

Go to https://supabase.com/dashboard, create project "arkhos-prod" in EU West region.
Under Settings → API, copy: Project URL, anon public key, service role key.
Under Authentication → Providers, enable Google OAuth and GitHub OAuth.
For Google: create OAuth app at https://console.cloud.google.com/apis/credentials, set redirect to `https://<project-ref>.supabase.co/auth/v1/callback`.
For GitHub: create OAuth app at https://github.com/settings/developers, set callback URL to `https://<project-ref>.supabase.co/auth/v1/callback`.

- [ ] **Step 2: Create frontend .env.example**

```bash
# frontend/.env.example
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

- [ ] **Step 3: Create frontend .env.local with real values**

```bash
# frontend/.env.local (gitignored)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

- [ ] **Step 4: Add Supabase config to backend**

In `backend/arkhos/config.py`, add to the `Settings` class after `sandbox_preview_url`:

```python
supabase_url: str = ""
supabase_service_key: str = ""
supabase_jwt_secret: str = ""
```

- [ ] **Step 5: Add Supabase vars to backend .env**

Append to `backend/.env`:

```
ARKHOS_SUPABASE_URL=https://<your-project-ref>.supabase.co
ARKHOS_SUPABASE_SERVICE_KEY=<your-service-role-key>
ARKHOS_SUPABASE_JWT_SECRET=<your-jwt-secret>
```

The JWT secret is under Settings → API → JWT Secret in the Supabase dashboard.

- [ ] **Step 6: Commit**

```bash
git add frontend/.env.example backend/arkhos/config.py
git commit -m "chore: add Supabase env config for auth integration"
```

Do NOT commit `.env.local` or `backend/.env` (they contain secrets).

---

## Task 2: Supabase Database Schema

**Files:**
- None (executed in Supabase SQL editor or via migration)

- [ ] **Step 1: Run schema SQL in Supabase**

Open Supabase Dashboard → SQL Editor. Run this migration:

```sql
-- profiles (extends auth.users)
create table public.profiles (
  id                      uuid primary key references auth.users(id) on delete cascade,
  display_name            text,
  avatar_url              text,
  tier                    text not null default 'free' check (tier in ('free', 'pro', 'team')),
  stripe_customer_id      text,
  generations_this_month  int not null default 0,
  generations_reset_at    timestamptz not null default now(),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', 'User'),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- projects
create table public.projects (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  name            text not null default 'Untitled',
  prompt          text not null,
  status          text not null default 'generating' check (status in ('generating', 'complete', 'failed')),
  fleet_profile   text not null default 'balanced' check (fleet_profile in ('budget', 'balanced', 'quality')),
  total_cost_eur  float not null default 0,
  thumbnail_url   text,
  files_json      jsonb,
  metadata        jsonb not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.projects enable row level security;
create policy "Users can view own projects" on public.projects for select using (auth.uid() = user_id);
create policy "Users can insert own projects" on public.projects for insert with check (auth.uid() = user_id);
create policy "Users can update own projects" on public.projects for update using (auth.uid() = user_id);
create policy "Users can delete own projects" on public.projects for delete using (auth.uid() = user_id);

-- generation_logs (cost tracking for pricing verification)
create table public.generation_logs (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.profiles(id),
  project_id         uuid references public.projects(id) on delete set null,
  fleet_profile      text not null,
  prompt_length      int not null,
  agent_costs        jsonb not null default '{}',
  total_api_cost_eur float not null default 0,
  sandbox_cost_eur   float not null default 0,
  total_cost_eur     float not null default 0,
  duration_s         float not null default 0,
  models_used        jsonb not null default '[]',
  file_count         int not null default 0,
  success            boolean not null default true,
  error              text,
  created_at         timestamptz not null default now()
);

alter table public.generation_logs enable row level security;
create policy "Users can view own logs" on public.generation_logs for select using (auth.uid() = user_id);
create policy "Users can insert own logs" on public.generation_logs for insert with check (auth.uid() = user_id);

create index idx_gen_logs_user_created on public.generation_logs(user_id, created_at);
create index idx_gen_logs_profile on public.generation_logs(fleet_profile, created_at);
create index idx_projects_user on public.projects(user_id, created_at desc);
```

- [ ] **Step 2: Verify tables in Supabase**

Go to Table Editor in Supabase Dashboard. Confirm `profiles`, `projects`, and `generation_logs` tables exist with correct columns.

- [ ] **Step 3: Test profile auto-creation**

In Supabase Dashboard → Authentication → Users, create a test user. Check that a row appears in `profiles` table automatically.

---

## Task 3: Frontend Supabase Client + Auth Provider

**Files:**
- Create: `frontend/lib/supabase.ts`
- Create: `frontend/components/auth/use-auth.ts`
- Create: `frontend/components/auth/auth-provider.tsx`
- Modify: `frontend/package.json` (add deps)
- Modify: `frontend/app/[locale]/layout.tsx` (wrap with provider)

- [ ] **Step 1: Install Supabase dependencies**

```bash
cd frontend && pnpm add @supabase/supabase-js @supabase/auth-ui-react @supabase/auth-ui-shared
```

- [ ] **Step 2: Create Supabase client singleton**

```typescript
// frontend/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

- [ ] **Step 3: Create useAuth hook**

```typescript
// frontend/components/auth/use-auth.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({ user: session?.user ?? null, session, loading: false });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setState({ user: session?.user ?? null, session, loading: false });
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return { ...state, signOut };
}
```

- [ ] **Step 4: Create AuthProvider**

```typescript
// frontend/components/auth/auth-provider.tsx
"use client";

import { createContext, useContext } from "react";
import { useAuth } from "./use-auth";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
```

- [ ] **Step 5: Wrap app in AuthProvider**

In `frontend/app/[locale]/layout.tsx`, add the import and wrap:

Add import at top:
```typescript
import { AuthProvider } from "@/components/auth/auth-provider";
```

Wrap `children` inside the providers (after `NextIntlClientProvider`, before `Navbar`):
```tsx
<NextIntlClientProvider messages={messages}>
  <AuthProvider>
    <Navbar />
    <main className="pt-20">{children}</main>
    <Footer />
    <CookieConsent />
  </AuthProvider>
</NextIntlClientProvider>
```

- [ ] **Step 6: Verify build**

```bash
cd frontend && pnpm next build
```

Expected: Clean build, no errors.

- [ ] **Step 7: Commit**

```bash
git add frontend/lib/supabase.ts frontend/components/auth/ frontend/app/[locale]/layout.tsx frontend/package.json frontend/pnpm-lock.yaml
git commit -m "feat(auth): add Supabase client, useAuth hook, AuthProvider"
```

---

## Task 4: Login Page

**Files:**
- Create: `frontend/app/[locale]/login/page.tsx`
- Modify: `frontend/messages/en.json`
- Modify: `frontend/messages/fr.json`

- [ ] **Step 1: Create login page**

```tsx
// frontend/app/[locale]/login/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Cpu } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/components/auth/auth-provider";

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuthContext();
  const next = searchParams.get("next") || "/dashboard";

  useEffect(() => {
    if (!loading && user) router.replace(next);
  }, [user, loading, router, next]);

  if (loading) return null;
  if (user) return null;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[var(--brand)] flex items-center justify-center">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <span className="font-[var(--font-display)] text-xl font-bold text-[var(--text-primary)] tracking-tight">
            Arkhos
          </span>
        </div>
        <p className="text-center text-sm text-[var(--text-secondary)] mb-6">
          {t("subtitle")}
        </p>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: "#6366F1",
                  brandAccent: "#4F46E5",
                  inputBackground: "var(--deep)",
                  inputText: "var(--text-primary)",
                  inputBorder: "var(--border)",
                },
                borderWidths: { buttonBorderWidth: "0px", inputBorderWidth: "1px" },
                radii: { borderRadiusButton: "0.75rem", inputBorderRadius: "0.75rem" },
              },
            },
          }}
          providers={["google", "github"]}
          redirectTo={typeof window !== "undefined" ? `${window.location.origin}${next}` : undefined}
          magicLink
          view="sign_in"
          showLinks
          localization={{
            variables: {
              sign_in: {
                email_label: t("email"),
                password_label: t("password"),
                button_label: t("signIn"),
                social_provider_text: t("continueWith"),
                link_text: t("noAccount"),
              },
              sign_up: {
                email_label: t("email"),
                password_label: t("password"),
                button_label: t("signUp"),
                social_provider_text: t("continueWith"),
                link_text: t("hasAccount"),
              },
              magic_link: {
                email_input_label: t("email"),
                button_label: t("sendMagicLink"),
              },
            },
          }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add auth translation keys to en.json**

Add to `frontend/messages/en.json` at the top level (after `"generate"`):

```json
"auth": {
  "subtitle": "Sign in to start building",
  "email": "Email",
  "password": "Password",
  "signIn": "Sign in",
  "signUp": "Create account",
  "continueWith": "Continue with",
  "noAccount": "Don't have an account? Sign up",
  "hasAccount": "Already have an account? Sign in",
  "sendMagicLink": "Send magic link"
}
```

- [ ] **Step 3: Add auth translation keys to fr.json**

Add the same block in French:

```json
"auth": {
  "subtitle": "Connectez-vous pour commencer",
  "email": "E-mail",
  "password": "Mot de passe",
  "signIn": "Se connecter",
  "signUp": "Créer un compte",
  "continueWith": "Continuer avec",
  "noAccount": "Pas de compte\u00a0? Inscrivez-vous",
  "hasAccount": "Déjà un compte\u00a0? Connectez-vous",
  "sendMagicLink": "Envoyer le lien magique"
}
```

- [ ] **Step 4: Verify build**

```bash
cd frontend && pnpm next build
```

- [ ] **Step 5: Commit**

```bash
git add frontend/app/[locale]/login/ frontend/messages/en.json frontend/messages/fr.json
git commit -m "feat(auth): add login page with Supabase Auth UI"
```

---

## Task 5: Navbar — Conditional Auth-Aware Links

**Files:**
- Modify: `frontend/components/layout/navbar.tsx`
- Modify: `frontend/messages/en.json`
- Modify: `frontend/messages/fr.json`

- [ ] **Step 1: Update navbar with auth-aware rendering**

Replace the entire content of `frontend/components/layout/navbar.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Menu, Cpu, LogOut, Settings, BarChart3 } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { LocaleSwitcher } from "./locale-switcher";
import { useAuthContext } from "@/components/auth/auth-provider";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const PUBLIC_LINKS = [
  { key: "pricing", href: "/pricing" },
  { key: "gallery", href: "/gallery" },
  { key: "docs", href: "/docs" },
] as const;

const AUTH_LINKS = [
  { key: "dashboard", href: "/dashboard" },
  { key: "gallery", href: "/gallery" },
  { key: "docs", href: "/docs" },
] as const;

export function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { user, loading, signOut } = useAuthContext();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = user ? AUTH_LINKS : PUBLIC_LINKS;

  return (
    <nav className="fixed top-0 inset-x-0 z-50 h-14 border-b border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl">
      <div className="mx-auto max-w-7xl h-full flex items-center justify-between px-4 sm:px-6">
        {/* Left: logo + links */}
        <div className="flex items-center gap-6">
          <Link
            href={user ? "/dashboard" : "/"}
            className="flex items-center gap-2.5 shrink-0 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none rounded-lg"
          >
            <div className="w-7 h-7 rounded-lg bg-[var(--brand)] flex items-center justify-center">
              <Cpu className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-[var(--font-display)] text-[15px] font-bold text-[var(--text-primary)] tracking-tight">
              Arkhos
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(({ key, href }) => (
              <Link
                key={key}
                href={href}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150",
                  "focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none",
                  pathname === href
                    ? "text-[var(--text-primary)] bg-[var(--surface)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]/50",
                )}
              >
                {t(key)}
              </Link>
            ))}
          </div>
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LocaleSwitcher />

          {/* Auth-dependent CTA */}
          {!loading && (
            <>
              {user ? (
                /* Avatar dropdown */
                <div className="hidden md:flex items-center gap-1 ml-1">
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center justify-center w-8 h-8 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
                    title={t("settings")}
                  >
                    <Settings className="w-4 h-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => signOut()}
                    className="flex items-center justify-center w-8 h-8 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
                    title={t("signOut")}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt=""
                      className="w-7 h-7 rounded-full border border-[var(--border)]"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[var(--brand)] flex items-center justify-center text-white text-xs font-medium">
                      {(user.user_metadata?.full_name?.[0] || user.email?.[0] || "U").toUpperCase()}
                    </div>
                  )}
                </div>
              ) : (
                /* "Start building" CTA */
                <Link
                  href="/login"
                  className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-medium bg-[var(--brand)] text-white hover:brightness-110 transition-all duration-150 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none ml-1"
                >
                  {t("startBuilding")}
                </Link>
              )}
            </>
          )}

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface)] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
                aria-label="Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-[var(--deep)] border-[var(--border)]">
              <SheetHeader>
                <SheetTitle className="text-[var(--text-primary)]">Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 mt-4">
                {links.map(({ key, href }) => (
                  <Link
                    key={key}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      pathname === href
                        ? "text-[var(--text-primary)] bg-[var(--surface)]"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
                    )}
                  >
                    {t(key)}
                  </Link>
                ))}

                <div className="my-2 border-t border-[var(--border)]" />

                {user ? (
                  <>
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setMobileOpen(false)}
                      className="px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" /> {t("settings")}
                    </Link>
                    <button
                      type="button"
                      onClick={() => { signOut(); setMobileOpen(false); }}
                      className="px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer text-left flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> {t("signOut")}
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2.5 rounded-xl text-sm font-medium bg-[var(--brand)] text-white text-center hover:brightness-110 transition-all"
                  >
                    {t("startBuilding")}
                  </Link>
                )}

                <div className="my-2 border-t border-[var(--border)]" />
                <div className="flex items-center gap-2 px-3">
                  <ThemeToggle />
                  <LocaleSwitcher />
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

- [ ] **Step 2: Add nav translation keys to en.json**

In the `"nav"` section of `frontend/messages/en.json`, add:

```json
"dashboard": "Dashboard",
"startBuilding": "Start building",
"settings": "Settings",
"signOut": "Sign out"
```

- [ ] **Step 3: Add nav translation keys to fr.json**

```json
"dashboard": "Tableau de bord",
"startBuilding": "Commencer",
"settings": "Paramètres",
"signOut": "Se déconnecter"
```

- [ ] **Step 4: Verify build**

```bash
cd frontend && pnpm next build
```

- [ ] **Step 5: Commit**

```bash
git add frontend/components/layout/navbar.tsx frontend/messages/en.json frontend/messages/fr.json
git commit -m "feat(nav): auth-aware navbar with conditional links"
```

---

## Task 6: Dashboard Layout + Auth Guard

**Files:**
- Create: `frontend/app/[locale]/dashboard/layout.tsx`

- [ ] **Step 1: Create dashboard layout with auth guard**

```tsx
// frontend/app/[locale]/dashboard/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthContext } from "@/components/auth/auth-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-[var(--brand)] animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
```

- [ ] **Step 2: Verify build**

```bash
cd frontend && pnpm next build
```

- [ ] **Step 3: Commit**

```bash
git add frontend/app/[locale]/dashboard/layout.tsx
git commit -m "feat(dashboard): add auth-guarded layout"
```

---

## Task 7: Dashboard Page — Project Grid

**Files:**
- Create: `frontend/components/dashboard/project-card.tsx`
- Create: `frontend/components/dashboard/project-grid.tsx`
- Create: `frontend/components/dashboard/empty-state.tsx`
- Create: `frontend/app/[locale]/dashboard/page.tsx`
- Modify: `frontend/messages/en.json`
- Modify: `frontend/messages/fr.json`

- [ ] **Step 1: Create ProjectCard component**

```tsx
// frontend/components/dashboard/project-card.tsx
"use client";

import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Download, Trash2, Pencil } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

interface ProjectCardProps {
  id: string;
  name: string;
  status: "generating" | "complete" | "failed";
  thumbnailUrl: string | null;
  totalCostEur: number;
  createdAt: string;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
}

export function ProjectCard({
  id, name, status, thumbnailUrl, totalCostEur, createdAt, onDelete, onRename,
}: ProjectCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const handleRename = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== name) onRename(id, trimmed);
    setEditing(false);
  };

  const statusColor = {
    generating: "text-[var(--brand)] bg-[var(--brand)]/10",
    complete: "text-[var(--success)] bg-[var(--success)]/10",
    failed: "text-[var(--error)] bg-[var(--error)]/10",
  }[status];

  const statusLabel = {
    generating: "Generating",
    complete: "Complete",
    failed: "Failed",
  }[status];

  return (
    <div className="group relative rounded-2xl border border-[var(--border)] bg-[var(--deep)] overflow-hidden transition-colors hover:border-[var(--elevated)]">
      {/* Thumbnail */}
      <Link href={`/generate/${id}`} className="block">
        <div className="aspect-[16/10] bg-[var(--surface)] overflow-hidden">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt="" className="w-full h-full object-cover object-top" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-8 h-8 rounded-xl bg-[var(--elevated)] flex items-center justify-center text-[var(--text-muted)] text-xs">
                {name[0]?.toUpperCase() || "?"}
              </div>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          {editing ? (
            <input
              ref={inputRef}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => { if (e.key === "Enter") handleRename(); if (e.key === "Escape") setEditing(false); }}
              className="text-sm font-medium text-[var(--text-primary)] bg-transparent border-b border-[var(--brand)] outline-none w-full"
            />
          ) : (
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">{name}</p>
          )}

          {/* Menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center justify-center w-6 h-6 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] transition-colors opacity-0 group-hover:opacity-100 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none focus-visible:opacity-100"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-7 z-10 w-36 rounded-xl border border-[var(--border)] bg-[var(--deep)] shadow-lg py-1">
                <button type="button" onClick={() => { setEditing(true); setMenuOpen(false); }} className="w-full px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface)] flex items-center gap-2 cursor-pointer">
                  <Pencil className="w-3 h-3" /> Rename
                </button>
                <a href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/download/${id}`} className="w-full px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--surface)] flex items-center gap-2">
                  <Download className="w-3 h-3" /> Download
                </a>
                <button type="button" onClick={() => { onDelete(id); setMenuOpen(false); }} className="w-full px-3 py-1.5 text-xs text-[var(--error)] hover:bg-[var(--error)]/10 flex items-center gap-2 cursor-pointer">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-1.5">
          <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-md", statusColor)}>
            {statusLabel}
          </span>
          <span className="text-[10px] text-[var(--text-muted)]">
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </span>
          {totalCostEur > 0 && (
            <span className="text-[10px] font-[var(--font-code)] text-[var(--text-muted)] tabular-nums ml-auto">
              €{totalCostEur.toFixed(4)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Install date-fns**

```bash
cd frontend && pnpm add date-fns
```

- [ ] **Step 3: Create EmptyState component**

```tsx
// frontend/components/dashboard/empty-state.tsx
"use client";

import { useTranslations } from "next-intl";
import { Plus, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";

const STARTER_TEMPLATES = [
  { key: "saas", emoji: "SaaS landing page" },
  { key: "portfolio", emoji: "Developer portfolio" },
  { key: "bakery", emoji: "Local bakery website" },
];

export function EmptyState() {
  const t = useTranslations("dashboard");

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-16 h-16 rounded-2xl bg-[var(--brand)]/10 flex items-center justify-center mb-6">
        <Sparkles className="w-7 h-7 text-[var(--brand)]" />
      </div>
      <h2 className="text-lg font-medium text-[var(--text-primary)] mb-2">{t("empty.title")}</h2>
      <p className="text-sm text-[var(--text-muted)] mb-6 text-center max-w-sm">{t("empty.description")}</p>
      <Link
        href="/dashboard/new"
        className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium bg-[var(--brand)] text-white hover:brightness-110 transition-all duration-150 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
      >
        <Plus className="w-4 h-4" /> {t("empty.cta")}
      </Link>
      <div className="flex flex-wrap items-center gap-2 mt-6">
        {STARTER_TEMPLATES.map(({ key, emoji }) => (
          <Link
            key={key}
            href={`/dashboard/new?template=${key}`}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-muted)] bg-[var(--surface)] hover:bg-[var(--elevated)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
          >
            {emoji}
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create ProjectGrid component**

```tsx
// frontend/components/dashboard/project-grid.tsx
"use client";

import { Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ProjectCard } from "./project-card";

interface Project {
  id: string;
  name: string;
  status: "generating" | "complete" | "failed";
  thumbnail_url: string | null;
  total_cost_eur: number;
  created_at: string;
}

interface ProjectGridProps {
  projects: Project[];
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
}

export function ProjectGrid({ projects, onDelete, onRename }: ProjectGridProps) {
  const t = useTranslations("dashboard");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {projects.map((p) => (
        <ProjectCard
          key={p.id}
          id={p.id}
          name={p.name}
          status={p.status}
          thumbnailUrl={p.thumbnail_url}
          totalCostEur={p.total_cost_eur}
          createdAt={p.created_at}
          onDelete={onDelete}
          onRename={onRename}
        />
      ))}

      {/* New project card */}
      <Link
        href="/dashboard/new"
        className="rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--deep)] hover:border-[var(--brand)]/50 hover:bg-[var(--brand)]/5 transition-all duration-200 flex flex-col items-center justify-center aspect-[16/10] cursor-pointer group focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
      >
        <div className="w-10 h-10 rounded-xl bg-[var(--surface)] group-hover:bg-[var(--brand)]/10 flex items-center justify-center transition-colors mb-2">
          <Plus className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--brand)] transition-colors" />
        </div>
        <span className="text-sm font-medium text-[var(--text-muted)] group-hover:text-[var(--brand)] transition-colors">
          {t("newProject")}
        </span>
      </Link>
    </div>
  );
}
```

- [ ] **Step 5: Create dashboard page**

```tsx
// frontend/app/[locale]/dashboard/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/components/auth/auth-provider";
import { ProjectGrid } from "@/components/dashboard/project-grid";
import { EmptyState } from "@/components/dashboard/empty-state";

interface Project {
  id: string;
  name: string;
  status: "generating" | "complete" | "failed";
  thumbnail_url: string | null;
  total_cost_eur: number;
  created_at: string;
}

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const { user } = useAuthContext();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("projects")
      .select("id, name, status, thumbnail_url, total_cost_eur, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setProjects((data as Project[]) || []);
        setLoading(false);
      });
  }, [user]);

  const handleDelete = useCallback(async (id: string) => {
    await supabase.from("projects").delete().eq("id", id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleRename = useCallback(async (id: string, name: string) => {
    await supabase.from("projects").update({ name }).eq("id", id);
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-[var(--brand)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-1">
            {t("kicker")}
          </p>
          <h1 className="font-[var(--font-display)] text-2xl font-bold text-[var(--text-primary)]">
            {t("title")}
          </h1>
        </div>
        {projects.length > 0 && (
          <Link
            href="/dashboard/new"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-[var(--brand)] text-white hover:brightness-110 transition-all duration-150 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
          >
            <Plus className="w-4 h-4" /> {t("newProject")}
          </Link>
        )}
      </div>

      {/* Content */}
      {projects.length === 0 ? (
        <EmptyState />
      ) : (
        <ProjectGrid projects={projects} onDelete={handleDelete} onRename={handleRename} />
      )}
    </div>
  );
}
```

- [ ] **Step 6: Add dashboard translation keys to en.json**

```json
"dashboard": {
  "kicker": "Dashboard",
  "title": "Your projects",
  "newProject": "New project",
  "empty": {
    "title": "No projects yet",
    "description": "Create your first project to get started. Describe what you want and our AI agents will build it.",
    "cta": "Create your first project"
  }
}
```

- [ ] **Step 7: Add dashboard translation keys to fr.json**

```json
"dashboard": {
  "kicker": "Tableau de bord",
  "title": "Vos projets",
  "newProject": "Nouveau projet",
  "empty": {
    "title": "Aucun projet",
    "description": "Créez votre premier projet. Décrivez ce que vous voulez et nos agents IA le construiront.",
    "cta": "Créer votre premier projet"
  }
}
```

- [ ] **Step 8: Verify build**

```bash
cd frontend && pnpm next build
```

- [ ] **Step 9: Commit**

```bash
git add frontend/components/dashboard/ frontend/app/[locale]/dashboard/page.tsx frontend/messages/en.json frontend/messages/fr.json frontend/package.json frontend/pnpm-lock.yaml
git commit -m "feat(dashboard): project grid, cards, empty state"
```

---

## Task 8: New Project Page (`/dashboard/new`)

**Files:**
- Create: `frontend/app/[locale]/dashboard/new/page.tsx`
- Modify: `frontend/messages/en.json`
- Modify: `frontend/messages/fr.json`

- [ ] **Step 1: Create new project page**

This reuses the existing `FleetToggle` and `useTypingPlaceholder` but in a dedicated page layout:

```tsx
// frontend/app/[locale]/dashboard/new/page.tsx
"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight, Loader2 } from "lucide-react";
import { useAuthContext } from "@/components/auth/auth-provider";
import { FleetToggle } from "@/components/generate/fleet-toggle";
import { useTypingPlaceholder } from "@/hooks/use-typing-placeholder";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type Profile = "budget" | "balanced" | "quality";

const TEMPLATES: Record<string, { label: string; prompt: string }> = {
  bakery: { label: "Bakery", prompt: "A modern bakery website with online ordering, daily specials, and a gallery of fresh pastries." },
  saas: { label: "SaaS", prompt: "A SaaS landing page with hero, features grid, pricing table, testimonials, and signup CTA." },
  portfolio: { label: "Portfolio", prompt: "A minimal developer portfolio with project showcase, about section, and contact form." },
  restaurant: { label: "Restaurant", prompt: "An elegant restaurant website with menu, reservations, photo gallery, and location map." },
  agency: { label: "Agency", prompt: "A creative agency site with case studies, team section, services grid, and contact page." },
  ecommerce: { label: "E-commerce", prompt: "An e-commerce storefront with product grid, filters, cart, and checkout flow." },
};

export default function NewProjectPage() {
  const t = useTranslations("newProject");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session } = useAuthContext();

  const templateKey = searchParams.get("template");
  const initialPrompt = templateKey && TEMPLATES[templateKey] ? TEMPLATES[templateKey].prompt : "";

  const [prompt, setPrompt] = useState(initialPrompt);
  const [profile, setProfile] = useState<Profile>("balanced");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const placeholder = useTypingPlaceholder();

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || loading || !session) return;
    setLoading(true);
    setError(null);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiBase}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ prompt: prompt.trim(), locale: "en", profile }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Request failed" }));
        throw new Error(typeof err.detail === "string" ? err.detail : "Request failed");
      }

      const data = await res.json();
      router.push(`/generate/${data.generation_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setLoading(false);
    }
  }, [prompt, profile, loading, session, router]);

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
      <h1 className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold text-[var(--text-primary)] text-center mb-2">
        {t("title")}
      </h1>
      <p className="text-sm text-[var(--text-muted)] text-center mb-8">
        {t("subtitle")}
      </p>

      {/* Prompt */}
      <div className="relative mb-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleGenerate(); } }}
          placeholder={placeholder}
          rows={4}
          disabled={loading}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--deep)] px-5 py-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none disabled:opacity-50"
        />
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!prompt.trim() || loading}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-[var(--brand)] text-white hover:brightness-110 transition-all duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
          {loading ? t("generating") : t("generate")}
        </button>
      </div>

      {error && (
        <p className="text-xs text-[var(--error)] mb-4 text-center">{error}</p>
      )}

      {/* Fleet toggle */}
      <div className="flex items-center justify-center mb-10">
        <FleetToggle value={profile} onChange={setProfile} />
      </div>

      {/* Templates */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-3 text-center">
          {t("templates")}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {Object.entries(TEMPLATES).map(([key, { label }]) => (
            <button
              key={key}
              type="button"
              onClick={() => setPrompt(TEMPLATES[key].prompt)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                "focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none",
                prompt === TEMPLATES[key].prompt
                  ? "bg-[var(--brand)]/10 text-[var(--brand)] border border-[var(--brand)]/20"
                  : "bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--elevated)]",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add newProject translation keys to en.json**

```json
"newProject": {
  "title": "What do you want to build?",
  "subtitle": "Describe your website and our AI agents will build it live.",
  "generate": "Generate",
  "generating": "Generating...",
  "templates": "Or start from a template"
}
```

- [ ] **Step 3: Add newProject translation keys to fr.json**

```json
"newProject": {
  "title": "Que voulez-vous créer\u00a0?",
  "subtitle": "Décrivez votre site et nos agents IA le construiront en direct.",
  "generate": "Générer",
  "generating": "Génération...",
  "templates": "Ou commencer avec un modèle"
}
```

- [ ] **Step 4: Verify build**

```bash
cd frontend && pnpm next build
```

- [ ] **Step 5: Commit**

```bash
git add frontend/app/[locale]/dashboard/new/ frontend/messages/en.json frontend/messages/fr.json
git commit -m "feat(dashboard): new project page with prompt, fleet toggle, templates"
```

---

## Task 9: Homepage Redesign — Cinematic Marketing

**Files:**
- Modify: `frontend/app/[locale]/page.tsx`

- [ ] **Step 1: Replace homepage with cinematic marketing**

Replace the entire content of `frontend/app/[locale]/page.tsx`. Remove the `HeroPrompt` import and all interactive generation UI. Keep the existing comparison table and feature cards, add a pipeline visualization section, and change all CTAs to point to `/login`.

This is a large file — the implementing agent should read the current `page.tsx` first, then replace the hero section (remove `HeroPrompt`, add cinematic headline + CTA button), keep the comparison table and feature sections, and update all CTA links from `/#generate` to `/login`.

Key changes:
- Remove: `import { HeroPrompt }` and `<HeroPrompt />` usage
- Hero becomes: kicker + headline (Syne 5xl) + subtitle + `Start building →` button linking to `/login`
- Keep: comparison table, feature cards, demo terminal section
- Footer CTA: `Ready to build?` + button → `/login`

- [ ] **Step 2: Verify build**

```bash
cd frontend && pnpm next build
```

- [ ] **Step 3: Commit**

```bash
git add frontend/app/[locale]/page.tsx
git commit -m "feat(home): cinematic marketing homepage, remove HeroPrompt"
```

---

## Task 10: Backend JWT Auth Middleware

**Files:**
- Create: `backend/arkhos/auth.py`
- Create: `backend/tests/test_auth.py`
- Modify: `backend/arkhos/app.py`

- [ ] **Step 1: Write auth test**

```python
# backend/tests/test_auth.py
"""Tests for JWT authentication middleware."""

import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from arkhos.app import app
from arkhos.auth import get_current_user


client = TestClient(app)


def test_missing_auth_header_returns_401():
    """Endpoints using get_current_user should reject missing auth."""
    response = client.get("/api/user/projects")
    assert response.status_code == 401
    assert "Missing" in response.json()["detail"]


def test_invalid_token_returns_401():
    """Endpoints using get_current_user should reject bad tokens."""
    response = client.get(
        "/api/user/projects",
        headers={"Authorization": "Bearer invalid-token-here"},
    )
    assert response.status_code == 401


def test_valid_token_extracts_user_id():
    """get_current_user should extract sub from a valid JWT."""
    import jwt
    from arkhos.config import get_settings

    settings = get_settings()
    if not settings.supabase_jwt_secret:
        pytest.skip("No JWT secret configured")

    fake_payload = {"sub": "test-user-uuid", "role": "authenticated"}
    token = jwt.encode(fake_payload, settings.supabase_jwt_secret, algorithm="HS256")

    # Directly test the dependency
    from fastapi import Request
    from unittest.mock import AsyncMock

    request = MagicMock()
    request.headers = {"authorization": f"Bearer {token}"}

    # get_current_user is a sync function used as FastAPI dependency
    user_id = get_current_user(request)
    assert user_id == "test-user-uuid"
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd backend && python3 -m pytest tests/test_auth.py -v
```

Expected: ImportError (arkhos.auth doesn't exist yet).

- [ ] **Step 3: Install PyJWT**

```bash
cd backend && pip install PyJWT
```

Add `PyJWT>=2.8` to `pyproject.toml` dependencies.

- [ ] **Step 4: Create auth module**

```python
# backend/arkhos/auth.py
"""JWT authentication for Supabase tokens."""

from __future__ import annotations

import logging

import jwt
from fastapi import HTTPException, Request

from arkhos.config import get_settings

logger = logging.getLogger(__name__)


def get_current_user(request: Request) -> str:
    """FastAPI dependency: extract and validate Supabase JWT.

    Returns the user ID (sub claim) from the token.
    Raises HTTPException 401 if missing or invalid.
    """
    auth_header = request.headers.get("authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authentication token")

    token = auth_header[7:]
    settings = get_settings()

    try:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: no user ID")
        return user_id

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError as e:
        logger.warning("Invalid JWT: %s", e)
        raise HTTPException(status_code=401, detail="Invalid token")
```

- [ ] **Step 5: Run tests**

```bash
cd backend && python3 -m pytest tests/test_auth.py -v
```

Expected: Tests pass (first test requires user_routes to exist — will be added in Task 11).

- [ ] **Step 6: Commit**

```bash
git add backend/arkhos/auth.py backend/tests/test_auth.py backend/pyproject.toml
git commit -m "feat(auth): JWT validation middleware for Supabase tokens"
```

---

## Task 11: Backend User Routes (Projects + Usage)

**Files:**
- Create: `backend/arkhos/user_routes.py`
- Modify: `backend/arkhos/app.py`

- [ ] **Step 1: Create user routes**

```python
# backend/arkhos/user_routes.py
"""User-specific API routes (auth required)."""

from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from arkhos.auth import get_current_user
from arkhos.config import get_settings

logger = logging.getLogger(__name__)

user_router = APIRouter(prefix="/user", tags=["user"])


@user_router.get("/projects")
async def list_projects(user_id: str = Depends(get_current_user)) -> list[dict[str, Any]]:
    """List all projects for the authenticated user."""
    # This endpoint exists for backend-driven project listing.
    # Frontend currently queries Supabase directly via RLS.
    # Keeping this for API completeness and future mobile clients.
    return []


@user_router.get("/usage")
async def get_usage(user_id: str = Depends(get_current_user)) -> dict[str, Any]:
    """Get generation usage stats for the current billing period."""
    return {
        "user_id": user_id,
        "generations_this_month": 0,
        "tier": "free",
        "limits": {
            "max_gens_per_month": 10,
            "allowed_profiles": ["budget"],
        },
    }
```

- [ ] **Step 2: Mount user routes in app.py**

In `backend/arkhos/app.py`, add import and mount:

Add at top with other imports:
```python
from arkhos.user_routes import user_router
```

After the existing `app.include_router(router, prefix="/api")` line, add:
```python
app.include_router(user_router, prefix="/api")
```

- [ ] **Step 3: Add localhost:3000 CORS origin**

In `backend/arkhos/app.py`, update the `allow_origins` list to include the frontend dev server:
```python
allow_origins=["http://localhost:5173", "http://localhost:3000"]
```

This should already be present — verify and add if missing.

- [ ] **Step 4: Run all tests**

```bash
cd backend && python3 -m pytest tests/ -v
```

Expected: All existing tests pass, auth tests pass.

- [ ] **Step 5: Commit**

```bash
git add backend/arkhos/user_routes.py backend/arkhos/app.py
git commit -m "feat(api): user routes for projects and usage"
```

---

## Task 12: Generation Cost Logging

**Files:**
- Modify: `backend/arkhos/routes.py`

- [ ] **Step 1: Add generation_logs insert to _run_build**

In `backend/arkhos/routes.py`, in the `_run_build` function, after `generation.status = GenerationStatus.COMPLETE` (around line 226), add the cost logging logic:

```python
        generation.status = GenerationStatus.COMPLETE
        generation.metadata["total_cost_eur"] = total_cost

        # Log generation costs for pricing verification
        try:
            from supabase import create_client
            settings = get_settings()
            if settings.supabase_url and settings.supabase_service_key:
                sb = create_client(settings.supabase_url, settings.supabase_service_key)
                sb.table("generation_logs").insert({
                    "user_id": generation.metadata.get("user_id"),
                    "project_id": generation.metadata.get("project_id"),
                    "fleet_profile": generation.metadata.get("profile", "balanced"),
                    "prompt_length": len(generation.prompt or ""),
                    "agent_costs": generation.metadata.get("agent_costs", {}),
                    "total_api_cost_eur": total_cost,
                    "sandbox_cost_eur": 0.002,  # estimated, adjust after measurement
                    "total_cost_eur": total_cost + 0.002,
                    "duration_s": generation.metadata.get("total_duration_s", 0),
                    "models_used": generation.metadata.get("models_used", []),
                    "file_count": len(generation.metadata.get("files", {})),
                    "success": True,
                }).execute()
                logger.info("Cost logged for generation %s", gen_id)
        except Exception as log_exc:
            logger.warning("Failed to log generation cost: %s", log_exc)
```

- [ ] **Step 2: Install supabase Python client**

```bash
cd backend && pip install supabase
```

Add `supabase>=2.0` to `pyproject.toml` dependencies.

- [ ] **Step 3: Run tests**

```bash
cd backend && python3 -m pytest tests/ -v
```

Expected: All tests pass (cost logging is wrapped in try/except, no-op if Supabase not configured).

- [ ] **Step 4: Commit**

```bash
git add backend/arkhos/routes.py backend/pyproject.toml
git commit -m "feat(telemetry): log generation costs to Supabase for pricing verification"
```

---

## Task 13: Dashboard Settings Page (Stub)

**Files:**
- Create: `frontend/app/[locale]/dashboard/settings/page.tsx`
- Modify: `frontend/messages/en.json`
- Modify: `frontend/messages/fr.json`

- [ ] **Step 1: Create settings page stub**

```tsx
// frontend/app/[locale]/dashboard/settings/page.tsx
"use client";

import { useTranslations } from "next-intl";
import { useAuthContext } from "@/components/auth/auth-provider";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const { user } = useAuthContext();

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-1">
        {t("kicker")}
      </p>
      <h1 className="font-[var(--font-display)] text-2xl font-bold text-[var(--text-primary)] mb-8">
        {t("title")}
      </h1>

      {/* Account */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-6 mb-5">
        <h2 className="text-sm font-medium text-[var(--text-primary)] mb-4">{t("account")}</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)]">{t("email")}</span>
            <span className="text-xs text-[var(--text-secondary)]">{user?.email ?? "—"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)]">{t("tier")}</span>
            <span className="text-xs font-medium text-[var(--brand)] uppercase">Free</span>
          </div>
        </div>
      </div>

      {/* Usage */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-6 mb-5">
        <h2 className="text-sm font-medium text-[var(--text-primary)] mb-4">{t("usage")}</h2>
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-muted)]">{t("generationsThisMonth")}</span>
          <span className="text-xs font-[var(--font-code)] text-[var(--text-secondary)] tabular-nums">0 / 10</span>
        </div>
        <div className="h-1.5 rounded-full bg-[var(--surface)] mt-3 overflow-hidden">
          <div className="h-full rounded-full bg-[var(--brand)]" style={{ width: "0%" }} />
        </div>
      </div>

      {/* Billing stub */}
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--deep)] p-6 text-center">
        <p className="text-sm text-[var(--text-muted)]">{t("billingComingSoon")}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add settings translation keys to en.json**

```json
"settings": {
  "kicker": "Settings",
  "title": "Account",
  "account": "Account details",
  "email": "Email",
  "tier": "Plan",
  "usage": "Usage",
  "generationsThisMonth": "Generations this month",
  "billingComingSoon": "Billing and plan upgrades coming soon."
}
```

- [ ] **Step 3: Add settings translation keys to fr.json**

```json
"settings": {
  "kicker": "Paramètres",
  "title": "Compte",
  "account": "Détails du compte",
  "email": "E-mail",
  "tier": "Forfait",
  "usage": "Utilisation",
  "generationsThisMonth": "Générations ce mois-ci",
  "billingComingSoon": "Facturation et changement de forfait bientôt disponibles."
}
```

- [ ] **Step 4: Verify build**

```bash
cd frontend && pnpm next build
```

- [ ] **Step 5: Commit**

```bash
git add frontend/app/[locale]/dashboard/settings/ frontend/messages/en.json frontend/messages/fr.json
git commit -m "feat(settings): account and usage page stub"
```

---

## Task 14: Workspace Auth Guard + Back-to-Dashboard

**Files:**
- Modify: `frontend/app/[locale]/generate/[id]/page.tsx`

- [ ] **Step 1: Add auth guard and dashboard back link**

In `frontend/app/[locale]/generate/[id]/page.tsx`:

Add import at top:
```typescript
import { useAuthContext } from "@/components/auth/auth-provider";
```

Inside the component, after the existing `useParams`:
```typescript
const { user, loading: authLoading } = useAuthContext();
const authRouter = useRouter();
```

Add auth redirect effect (after the existing `useEffect` for `connectTo`):
```typescript
useEffect(() => {
  if (!authLoading && !user) {
    authRouter.replace(`/login?next=/generate/${generationId}`);
  }
}, [authLoading, user, authRouter, generationId]);
```

In the toolbar, replace the Arkhos logo link from `href="/"` to `href="/dashboard"` and add "Dashboard" text:

Find the `<Link href="/">` with the Cpu icon and change to:
```tsx
<Link href="/dashboard" className="flex items-center gap-2 shrink-0 mr-1 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none rounded-lg px-1">
```

- [ ] **Step 2: Verify build**

```bash
cd frontend && pnpm next build
```

- [ ] **Step 3: Commit**

```bash
git add frontend/app/[locale]/generate/[id]/page.tsx
git commit -m "feat(workspace): add auth guard and back-to-dashboard link"
```

---

## Task 15: Delete /generate redirect + Update Pricing CTA

**Files:**
- Modify: `frontend/app/[locale]/generate/page.tsx`
- Modify: `frontend/app/[locale]/pricing/page.tsx`

- [ ] **Step 1: Update /generate redirect to dashboard**

Replace content of `frontend/app/[locale]/generate/page.tsx`:

```typescript
import { redirect } from "next/navigation";

export default function GeneratePage() {
  redirect("/dashboard/new");
}
```

- [ ] **Step 2: Update pricing page CTAs**

In `frontend/app/[locale]/pricing/page.tsx`, find any links to `/#generate` and change them to `/login`. The CTA button at the bottom should link to `/login` instead of `/#generate`.

- [ ] **Step 3: Verify build**

```bash
cd frontend && pnpm next build
```

- [ ] **Step 4: Commit**

```bash
git add frontend/app/[locale]/generate/page.tsx frontend/app/[locale]/pricing/page.tsx
git commit -m "chore: update /generate redirect, pricing CTAs point to /login"
```

---

## Task 16: Final Build + Integration Test

**Files:** None (verification only)

- [ ] **Step 1: Full frontend build**

```bash
cd frontend && pnpm next build
```

Expected: Clean build, all routes listed including `/[locale]/dashboard`, `/[locale]/dashboard/new`, `/[locale]/dashboard/settings`, `/[locale]/login`.

- [ ] **Step 2: Full backend tests**

```bash
cd backend && python3 -m pytest tests/ -v
```

Expected: All tests pass.

- [ ] **Step 3: Manual smoke test**

Start both servers:
```bash
# Terminal 1
cd backend && uvicorn arkhos.app:app --host 0.0.0.0 --port 8000

# Terminal 2
cd frontend && pnpm dev
```

Test flow:
1. Visit `http://localhost:3000` — see cinematic homepage, no prompt
2. Click "Start building" → redirected to `/login`
3. Sign in with Google/GitHub → redirected to `/dashboard`
4. See empty state → click "Create your first project"
5. Arrive at `/dashboard/new` with prompt + fleet toggle + templates
6. Enter prompt, click Generate → redirected to `/generate/[id]`
7. Pipeline streams, preview appears
8. Click "← Dashboard" → back to project grid, project card visible

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete UX restructure — auth, dashboard, pricing, cinematic homepage"
```
