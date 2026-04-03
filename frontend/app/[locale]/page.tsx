import { useTranslations } from "next-intl";
import { Check, X, Minus, Clock, Coins } from "lucide-react";
import { Link } from "@/i18n/navigation";

const DEMO_STEPS = ["step1", "step2", "step3", "step4"] as const;

type ComparisonValue = "yes" | "no" | "planned" | "partial";

const COMPARISON_ROWS: {
  key: string;
  arkhos: ComparisonValue;
  lovable: ComparisonValue;
  bolt: ComparisonValue;
  v0: ComparisonValue;
}[] = [
  { key: "hosting", arkhos: "yes", lovable: "no", bolt: "no", v0: "no" },
  { key: "costTransparency", arkhos: "yes", lovable: "no", bolt: "no", v0: "no" },
  { key: "modelRouting", arkhos: "yes", lovable: "no", bolt: "no", v0: "partial" },
  { key: "selfHost", arkhos: "yes", lovable: "no", bolt: "no", v0: "no" },
  { key: "localGpu", arkhos: "planned", lovable: "no", bolt: "no", v0: "no" },
  { key: "openSource", arkhos: "yes", lovable: "no", bolt: "no", v0: "no" },
  { key: "multiAgent", arkhos: "yes", lovable: "partial", bolt: "partial", v0: "no" },
];

function ComparisonCell({ value, label }: { value: ComparisonValue; label: string }) {
  if (value === "yes") {
    return (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-[var(--brand)]/10" aria-label={label}>
        <Check className="w-3.5 h-3.5 text-[var(--brand)]" />
      </span>
    );
  }
  if (value === "no") {
    return (
      <span className="inline-flex items-center justify-center w-5 h-5" aria-label={label}>
        <X className="w-3.5 h-3.5 text-[var(--text-muted)]" />
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-5 h-5" aria-label={label}>
      <Minus className="w-3.5 h-3.5 text-[var(--text-muted)]" />
    </span>
  );
}

export default function Home() {
  const t = useTranslations();

  return (
    <div className="relative overflow-hidden">
      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.18),transparent_42%)]" />
      <div className="absolute inset-x-0 top-24 h-72 bg-[linear-gradient(180deg,rgba(99,102,241,0.14),transparent)] blur-3xl" />

      {/* ── Hero — cinematic marketing ── */}
      <section className="relative mx-auto max-w-6xl px-4 py-24 sm:py-32">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
            {t("hero.kicker")}
          </p>
          <h1 className="mt-6 font-[var(--font-display)] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[0.95] text-[var(--text-primary)]">
            {t("hero.title")}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--text-secondary)]">
            {t("hero.subtitle")}
          </p>
          <div className="mt-10">
            <Link
              href="/login"
              className="inline-flex items-center rounded-xl bg-[var(--brand)] px-6 py-3 text-sm font-medium text-white hover:brightness-110 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--void)]"
            >
              {t("hero.cta")}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Live Demo ── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--brand)]">{t("demo.kicker")}</p>
          <h2 className="mt-4 font-[var(--font-display)] text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--text-primary)]">
            {t("demo.title")}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-[var(--text-secondary)]">{t("demo.description")}</p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Terminal */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] overflow-hidden">
            <div className="flex items-center gap-1.5 border-b border-[var(--border)] px-4 py-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--error)]/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--warning)]/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--success)]/60" />
              <span className="ml-3 text-[10px] font-[var(--font-code)] text-[var(--text-muted)]">arkhos generate</span>
            </div>
            <div className="p-5 font-[var(--font-code)] text-sm leading-7">
              <p className="text-[var(--text-muted)]">
                <span className="text-[var(--brand)]">$</span> {t("demo.prompt")}
              </p>
              <div className="mt-4 space-y-2">
                {DEMO_STEPS.map((step, i) => (
                  <p key={step} className="flex items-center gap-2.5 text-[var(--text-secondary)]">
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[var(--brand)]/10">
                      <Check className="w-2.5 h-2.5 text-[var(--brand)]" />
                    </span>
                    <span className="text-[var(--text-muted)] text-xs tabular-nums">{(i + 1).toString().padStart(2, "0")}</span>
                    {t(`demo.${step}`)}
                  </p>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-5 pt-4 border-t border-[var(--border)]">
                <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                  <Coins className="w-3.5 h-3.5" />
                  {t("demo.cost")}: <span className="text-[var(--brand)] font-medium">€0.005</span>
                </span>
                <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                  <Clock className="w-3.5 h-3.5" />
                  {t("demo.time")}: <span className="text-[var(--text-primary)] font-medium">18s</span>
                </span>
              </div>
            </div>
          </div>

          {/* Pipeline viz */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-5">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--text-muted)]">Pipeline</p>
            <div className="mt-4 space-y-0">
              {(["Planner", "Designer", "Architect", "Builder", "Reviewer"] as const).map((agent, i) => (
                <div key={agent}>
                  <div className="flex items-center gap-3 py-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--brand)]/10">
                      <Check className="w-3 h-3 text-[var(--brand)]" />
                    </span>
                    <span className="text-sm text-[var(--text-primary)]">{agent}</span>
                    <span className="ml-auto text-[10px] font-[var(--font-code)] text-[var(--text-muted)]">
                      {["ministral-3b", "mistral-small", "mistral-small", "devstral-small", "mistral-small"][i]}
                    </span>
                  </div>
                  {i < 4 && <div className="ml-[9px] h-3 border-l border-[var(--border)]" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Comparison strip ── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--brand)]">{t("comparison.kicker")}</p>
          <h2 className="mt-4 font-[var(--font-display)] text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--text-primary)]">
            {t("comparison.title")}
          </h2>
        </div>
        <div className="mt-12 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="pb-3 pr-6 text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">{t("comparison.feature")}</th>
                <th className="pb-3 px-4 text-center text-xs font-medium uppercase tracking-[0.18em] text-[var(--brand)]">{t("comparison.arkhos")}</th>
                <th className="pb-3 px-4 text-center text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">{t("comparison.lovable")}</th>
                <th className="pb-3 px-4 text-center text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">{t("comparison.bolt")}</th>
                <th className="pb-3 pl-4 text-center text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">{t("comparison.v0")}</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.key} className="border-b border-[var(--border)]/50">
                  <td className="py-3 pr-6 text-sm text-[var(--text-secondary)]">{t(`comparison.${row.key}`)}</td>
                  <td className="py-3 px-4 text-center"><ComparisonCell value={row.arkhos} label={t(`comparison.${row.arkhos}`)} /></td>
                  <td className="py-3 px-4 text-center"><ComparisonCell value={row.lovable} label={t(`comparison.${row.lovable}`)} /></td>
                  <td className="py-3 px-4 text-center"><ComparisonCell value={row.bolt} label={t(`comparison.${row.bolt}`)} /></td>
                  <td className="py-3 pl-4 text-center"><ComparisonCell value={row.v0} label={t(`comparison.${row.v0}`)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-8 sm:p-12 text-center">
          <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
            {t("cta.title")}
          </h2>
          <p className="mt-3 text-sm text-[var(--text-secondary)] max-w-lg mx-auto">
            {t("cta.description")}
          </p>
          <div className="mt-6">
            <Link
              href="/login"
              className="inline-flex items-center rounded-xl bg-[var(--brand)] px-6 py-3 text-sm font-medium text-white hover:brightness-110 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--void)]"
            >
              {t("cta.action")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
