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
