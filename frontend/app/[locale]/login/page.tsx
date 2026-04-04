"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Cpu, Loader2, Mail, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/components/auth/auth-provider";
import { cn } from "@/lib/utils";

type AuthView = "sign_in" | "sign_up" | "magic_link" | "forgot_password";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.02 10.02 0 0 0 2 12c0 1.61.39 3.14 1.07 4.49l3.77-2.4Z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" fill="#EA4335" />
    </svg>
  );
}

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuthContext();
  const next = searchParams.get("next") || "/dashboard";

  const [view, setView] = useState<AuthView>("sign_in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) router.replace(next);
  }, [user, authLoading, router, next]);

  const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}${next}` : undefined;

  const handleOAuth = useCallback(async (provider: "google" | "github") => {
    setError(null);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: redirectUrl },
    });
    if (err) setError(err.message);
  }, [redirectUrl]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (view === "sign_in") {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      } else if (view === "sign_up") {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectUrl },
        });
        if (err) throw err;
        setSuccess(t("checkEmailConfirm"));
      } else if (view === "magic_link") {
        const { error: err } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: redirectUrl },
        });
        if (err) throw err;
        setSuccess(t("checkEmailMagic"));
      } else if (view === "forgot_password") {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectUrl,
        });
        if (err) throw err;
        setSuccess(t("checkEmailReset"));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [view, email, password, redirectUrl, t]);

  if (authLoading || user) return null;

  const showPassword = view === "sign_in" || view === "sign_up";
  const isBack = view !== "sign_in";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[var(--brand)] flex items-center justify-center">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <span className="font-[var(--font-display)] text-xl font-bold text-[var(--text-primary)] tracking-tight">
            Arkhos
          </span>
        </div>

        {/* Title */}
        <h1 className="text-center text-lg font-semibold text-[var(--text-primary)] mb-1">
          {view === "sign_in" && t("titleSignIn")}
          {view === "sign_up" && t("titleSignUp")}
          {view === "magic_link" && t("titleMagicLink")}
          {view === "forgot_password" && t("titleForgotPassword")}
        </h1>
        <p className="text-center text-sm text-[var(--text-secondary)] mb-6">
          {view === "sign_in" && t("subtitleSignIn")}
          {view === "sign_up" && t("subtitleSignUp")}
          {view === "magic_link" && t("subtitleMagicLink")}
          {view === "forgot_password" && t("subtitleForgotPassword")}
        </p>

        {/* OAuth — only on sign_in and sign_up */}
        {(view === "sign_in" || view === "sign_up") && (
          <div className="space-y-2 mb-6">
            <button
              type="button"
              onClick={() => handleOAuth("google")}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--deep)] px-5 py-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface)] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
            >
              {t("socialProvider")} <GoogleIcon className="w-4 h-4" /> Google
            </button>
            <button
              type="button"
              onClick={() => handleOAuth("github")}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--deep)] px-5 py-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface)] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
            >
              {t("socialProvider")} <GitHubIcon className="w-4 h-4" /> GitHub
            </button>
          </div>
        )}

        {/* Divider */}
        {(view === "sign_in" || view === "sign_up") && (
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{t("or")}</span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
              {t("email")}
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("emailPlaceholder")}
              disabled={loading}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--deep)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none disabled:opacity-50"
            />
          </div>

          {showPassword && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                {view === "sign_up" ? t("createPassword") : t("passwordLabel")}
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("passwordPlaceholder")}
                disabled={loading}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--deep)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none disabled:opacity-50"
              />
            </div>
          )}

          {/* Forgot password link — only on sign_in */}
          {view === "sign_in" && (
            <button
              type="button"
              onClick={() => { setView("forgot_password"); setError(null); setSuccess(null); }}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors cursor-pointer focus-visible:outline-none focus-visible:text-[var(--brand)]"
            >
              {t("forgotPassword")}
            </button>
          )}

          {/* Error / Success */}
          {error && <p className="text-xs text-[var(--error)] text-center">{error}</p>}
          {success && <p className="text-xs text-[var(--success)] text-center">{success}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none",
              view === "sign_in" || view === "sign_up"
                ? "bg-[var(--brand)] text-white hover:brightness-110"
                : "bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--elevated)] border border-[var(--border)]",
            )}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (view === "magic_link" || view === "forgot_password") ? (
              <Mail className="w-4 h-4" />
            ) : null}
            {view === "sign_in" && (loading ? t("signingIn") : t("signIn"))}
            {view === "sign_up" && (loading ? t("signingUp") : t("signUp"))}
            {view === "magic_link" && (loading ? t("sendingMagicLink") : t("sendMagicLink"))}
            {view === "forgot_password" && (loading ? t("sendingReset") : t("resetPassword"))}
          </button>
        </form>

        {/* Navigation links */}
        <div className="mt-6 space-y-2 text-center">
          {/* Back to sign in — shown on all non-sign_in views */}
          {isBack && (
            <button
              type="button"
              onClick={() => { setView("sign_in"); setError(null); setSuccess(null); }}
              className="flex items-center justify-center gap-1.5 w-full text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer focus-visible:outline-none focus-visible:text-[var(--brand)]"
            >
              <ArrowLeft className="w-3 h-3" />
              {t("backToSignIn")}
            </button>
          )}

          {/* Toggle sign_in ↔ sign_up */}
          {view === "sign_in" && (
            <>
              <button
                type="button"
                onClick={() => { setView("sign_up"); setError(null); setSuccess(null); }}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors cursor-pointer focus-visible:outline-none focus-visible:text-[var(--brand)]"
              >
                {t("noAccount")}
              </button>
              <span className="text-[var(--text-muted)] text-xs mx-2">·</span>
              <button
                type="button"
                onClick={() => { setView("magic_link"); setError(null); setSuccess(null); }}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors cursor-pointer focus-visible:outline-none focus-visible:text-[var(--brand)]"
              >
                {t("magicLinkOption")}
              </button>
            </>
          )}
          {view === "sign_up" && (
            <button
              type="button"
              onClick={() => { setView("sign_in"); setError(null); setSuccess(null); }}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors cursor-pointer focus-visible:outline-none focus-visible:text-[var(--brand)]"
            >
              {t("hasAccount")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
