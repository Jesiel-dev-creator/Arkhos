"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Send, Check, Loader2, Mail, MapPin } from "lucide-react";

export default function ContactPage() {
  const t = useTranslations("pages.contact");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    // Simulate — no backend endpoint yet
    setTimeout(() => setStatus("sent"), 1000);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-20">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--brand)]">{t("kicker")}</p>
        <h1 className="mt-4 font-[var(--font-display)] text-5xl font-extrabold tracking-tight text-[var(--text-primary)]">{t("title")}</h1>
        <p className="mt-4 text-lg leading-relaxed text-[var(--text-secondary)]">{t("description")}</p>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Form */}
        <div>
          {status === "sent" ? (
            <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-6">
              <Check className="w-5 h-5 text-[var(--success)]" />
              <p className="text-sm text-[var(--text-primary)]">{t("success")}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="contact-email" className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">{t("email")}</label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--deep)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">{t("messageLabel")}</label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  placeholder={t("messagePlaceholder")}
                  className="mt-1 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--deep)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={status === "sending"}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium bg-[var(--brand)] text-white hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none transition-all duration-150 cursor-pointer disabled:opacity-50"
              >
                {status === "sending" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {t("send")}
              </button>
            </form>
          )}
        </div>

        {/* Company info */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-6 space-y-5">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-[var(--brand)] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">{t("companyEmail")}</p>
                <a
                  href="mailto:hello@arkhos.ai"
                  className="text-sm text-[var(--brand)] hover:text-[var(--brand-light)] transition-colors duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none rounded-md"
                >
                  hello@arkhos.ai
                </a>
              </div>
            </div>

            <div className="h-px bg-[var(--border)]" />

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[var(--brand)] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">{t("companyLocation")}</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  Bleucommerce SAS
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  Orl\u00e9ans, France
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
