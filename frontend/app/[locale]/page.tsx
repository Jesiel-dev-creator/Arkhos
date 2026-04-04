import { useTranslations } from "next-intl";
import { Check, X, Minus, Clock, Coins, Zap, Shield, Layers, ArrowRight, Play, Monitor, Cpu, GitBranch } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { AnimatedHero, AnimatedSection, StaggerGrid, StaggerItem } from "@/components/shared/motion";

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

const HOW_STEPS = [
  { key: "step1", icon: Zap },
  { key: "step2", icon: Layers },
  { key: "step3", icon: ArrowRight },
] as const;

const FEATURES_TOP = [
  { key: "pipeline", icon: Layers },
  { key: "sovereign", icon: Shield },
] as const;

const FEATURES_BOTTOM = [
  { key: "cost", icon: Coins },
  { key: "opensource", icon: GitBranch },
  { key: "preview", icon: Monitor },
  { key: "profiles", icon: Cpu },
] as const;

const PRICING_TIERS = ["free", "pro", "team"] as const;

export default function Home() {
  const t = useTranslations();

  return (
    <div className="relative overflow-hidden">
      {/* Radial glow -- pointer-events-none so links remain clickable */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.18),transparent_42%)] pointer-events-none" />
      <div className="absolute inset-x-0 top-24 h-72 bg-[linear-gradient(180deg,rgba(99,102,241,0.14),transparent)] blur-3xl pointer-events-none" />

      {/* ── 1. Hero ── */}
      <section className="relative mx-auto max-w-6xl px-4 py-24 sm:py-32">
        <AnimatedHero className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
            {t("hero.kicker")}
          </p>
          <h1 className="mt-6 font-[var(--font-display)] text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[0.95] text-[var(--text-primary)]">
            {t("hero.title")}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--text-secondary)]">
            {t("hero.subtitle")}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/generate"
              className="inline-flex items-center rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-medium text-white hover:brightness-110 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--void)]"
            >
              {t("hero.cta")}
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center rounded-xl border border-[var(--border)] bg-transparent px-5 py-3 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--elevated)] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--void)]"
            >
              {t("hero.cta2")}
            </Link>
          </div>
          <p className="mt-6 text-xs text-[var(--text-muted)] tracking-wide">
            {t("hero.trust")}
          </p>
        </AnimatedHero>

        {/* Product screenshot placeholder */}
        <AnimatedSection delay={0.2} className="mt-16">
          <div className="aspect-video rounded-2xl border border-[var(--border)] bg-[var(--deep)] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Play className="w-10 h-10 text-[var(--text-muted)]" />
              <span className="text-sm text-[var(--text-muted)]">{t("hero.screenshotAlt")}</span>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ── 2. Social Proof Strip ── */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <AnimatedSection variant="fadeIn" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[var(--text-muted)] tracking-wide">
          <span>{t("social.poweredBy")}</span>
          <span className="hidden sm:inline text-[var(--border)]">/</span>
          <span>{t("social.hostedOn")}</span>
          <span className="hidden sm:inline text-[var(--border)]">/</span>
          <span>{t("social.builtWith")}</span>
        </AnimatedSection>
      </section>

      {/* ── 3. How It Works ── */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-20">
        <AnimatedSection className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--brand)]">{t("howItWorks.kicker")}</p>
          <h2 className="mt-4 font-[var(--font-body)] text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
            {t("howItWorks.title")}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-[var(--text-secondary)]">{t("howItWorks.description")}</p>
        </AnimatedSection>

        <StaggerGrid className="mt-12 grid gap-5 sm:grid-cols-3">
          {HOW_STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <StaggerItem key={step.key}>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-6">
                  <span className="text-4xl font-bold text-[var(--brand)]/20">{String(i + 1).padStart(2, "0")}</span>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--brand)]/10">
                      <Icon className="w-4.5 h-4.5 text-[var(--brand)]" />
                    </span>
                    <h3 className="text-base font-medium text-[var(--text-primary)]">
                      {t(`howItWorks.${step.key}.title`)}
                    </h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {t(`howItWorks.${step.key}.body`)}
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGrid>
      </section>

      {/* ── 4. Product Demo (terminal + pipeline) ── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <AnimatedSection className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--brand)]">{t("demo.kicker")}</p>
          <h2 className="mt-4 font-[var(--font-body)] text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
            {t("demo.title")}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-[var(--text-secondary)]">{t("demo.description")}</p>
        </AnimatedSection>

        <StaggerGrid className="mt-12 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Terminal */}
          <StaggerItem>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] overflow-hidden ring-1 ring-[var(--brand)]/5">
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
                    {t("demo.cost")}: <span className="text-[var(--brand)] font-medium">&euro;0.005</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                    <Clock className="w-3.5 h-3.5" />
                    {t("demo.time")}: <span className="text-[var(--text-primary)] font-medium">18s</span>
                  </span>
                </div>
              </div>
            </div>
          </StaggerItem>

          {/* Pipeline viz */}
          <StaggerItem>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-5 ring-1 ring-[var(--brand)]/5">
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
          </StaggerItem>
        </StaggerGrid>
        <AnimatedSection delay={0.1} className="mt-4 text-center">
          <p className="text-xs text-[var(--text-muted)]">{t("demo.caption")}</p>
        </AnimatedSection>
      </section>

      {/* ── 5. Features Bento Grid ── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <AnimatedSection className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--brand)]">{t("features.kicker")}</p>
          <h2 className="mt-4 font-[var(--font-body)] text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
            {t("features.title")}
          </h2>
        </AnimatedSection>

        {/* Top row -- 2 large cards */}
        <StaggerGrid className="mt-12 grid gap-5 sm:grid-cols-2">
          {FEATURES_TOP.map((feat) => {
            const Icon = feat.icon;
            return (
              <StaggerItem key={feat.key}>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-6 min-h-[280px] flex flex-col">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--brand)]/10">
                      <Icon className="w-4.5 h-4.5 text-[var(--brand)]" />
                    </span>
                    <h3 className="text-base font-medium text-[var(--text-primary)]">
                      {t(`features.${feat.key}.title`)}
                    </h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {t(`features.${feat.key}.body`)}
                  </p>
                  <div className="mt-auto pt-5">
                    <div className="aspect-[4/3] rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                      <span className="text-sm text-[var(--text-muted)]">{t("features.visualAlt")}</span>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGrid>

        {/* Bottom row -- 4 smaller cards */}
        <StaggerGrid className="mt-5 grid gap-5 grid-cols-2 lg:grid-cols-4">
          {FEATURES_BOTTOM.map((feat) => {
            const Icon = feat.icon;
            return (
              <StaggerItem key={feat.key}>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-5">
                  <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--brand)]/10">
                    <Icon className="w-4.5 h-4.5 text-[var(--brand)]" />
                  </span>
                  <h3 className="mt-4 text-sm font-medium text-[var(--text-primary)]">
                    {t(`features.${feat.key}.title`)}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                    {t(`features.${feat.key}.body`)}
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGrid>
      </section>

      {/* ── 6. Comparison Table ── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <AnimatedSection className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--brand)]">{t("comparison.kicker")}</p>
          <h2 className="mt-4 font-[var(--font-body)] text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
            {t("comparison.title")}
          </h2>
        </AnimatedSection>
        <AnimatedSection delay={0.15} className="mt-12 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="pb-3 pr-6 text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">{t("comparison.feature")}</th>
                <th className="pb-3 px-4 text-center text-xs font-medium uppercase tracking-[0.18em] text-[var(--brand)] bg-[var(--brand)]/5 rounded-t-xl">{t("comparison.arkhos")}</th>
                <th className="pb-3 px-4 text-center text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">{t("comparison.lovable")}</th>
                <th className="pb-3 px-4 text-center text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">{t("comparison.bolt")}</th>
                <th className="pb-3 pl-4 text-center text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">{t("comparison.v0")}</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.key} className="border-b border-[var(--border)]/50">
                  <td className="py-3 pr-6 text-sm text-[var(--text-secondary)]">{t(`comparison.${row.key}`)}</td>
                  <td className="py-3 px-4 text-center bg-[var(--brand)]/5"><ComparisonCell value={row.arkhos} label={t(`comparison.${row.arkhos}`)} /></td>
                  <td className="py-3 px-4 text-center"><ComparisonCell value={row.lovable} label={t(`comparison.${row.lovable}`)} /></td>
                  <td className="py-3 px-4 text-center"><ComparisonCell value={row.bolt} label={t(`comparison.${row.bolt}`)} /></td>
                  <td className="py-3 pl-4 text-center"><ComparisonCell value={row.v0} label={t(`comparison.${row.v0}`)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </AnimatedSection>
      </section>

      {/* ── 7. Testimonial ── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <AnimatedSection variant="scaleIn" className="max-w-2xl mx-auto text-center">
          <span className="text-6xl font-bold text-[var(--brand)]/20 leading-none select-none" aria-hidden="true">&ldquo;</span>
          <p className="mt-2 text-lg italic leading-relaxed text-[var(--text-secondary)]">
            {t("testimonial.quote")}
          </p>
          <div className="mt-6">
            <p className="text-sm font-medium text-[var(--text-primary)]">{t("testimonial.author")}</p>
            <p className="text-xs text-[var(--text-muted)]">{t("testimonial.role")}</p>
          </div>
        </AnimatedSection>
      </section>

      {/* ── 8. Pricing Preview ── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <AnimatedSection className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--brand)]">{t("pricingPreview.kicker")}</p>
          <h2 className="mt-4 font-[var(--font-body)] text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
            {t("pricingPreview.title")}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-[var(--text-secondary)]">{t("pricingPreview.description")}</p>
        </AnimatedSection>

        <StaggerGrid className="mt-12 grid gap-5 sm:grid-cols-3">
          {PRICING_TIERS.map((tier) => (
            <StaggerItem key={tier}>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-6 text-center">
                <h3 className="text-base font-medium text-[var(--text-primary)]">{t(`pricingPreview.${tier}.name`)}</h3>
                <p className="mt-3 text-2xl font-bold text-[var(--text-primary)]">{t(`pricingPreview.${tier}.price`)}</p>
                <p className="mt-2 text-xs text-[var(--text-muted)]">{t(`pricingPreview.${tier}.desc`)}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGrid>
        <AnimatedSection delay={0.1} className="mt-8 text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--brand)] hover:text-[var(--brand-light)] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--void)]"
          >
            {t("pricingPreview.seeAll")}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </AnimatedSection>
      </section>

      {/* ── 9. Open Source CTA ── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <AnimatedSection className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-8 sm:p-12 text-center">
          <h2 className="font-[var(--font-body)] text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            {t("opensource.title")}
          </h2>
          <p className="mt-3 text-sm text-[var(--text-secondary)] max-w-lg mx-auto">
            {t("opensource.description")}
          </p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <a
              href="https://github.com/arkhos-ai/arkhos"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-transparent px-5 py-3 text-sm font-medium text-[var(--text-primary)] hover:border-[var(--elevated)] hover:bg-[var(--surface)] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--void)]"
            >
              <GitBranch className="w-4 h-4" />
              {t("opensource.cta")}
            </a>
            <p className="text-xs text-[var(--text-muted)]">{t("opensource.community")}</p>
          </div>
        </AnimatedSection>
      </section>

      {/* ── 10. Final CTA ── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <AnimatedSection className="rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-8 sm:p-12 text-center">
          <h2 className="font-[var(--font-body)] text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
            {t("cta.title")}
          </h2>
          <p className="mt-3 text-sm text-[var(--text-secondary)] max-w-lg mx-auto">
            {t("cta.description")}
          </p>
          <div className="mt-6">
            <Link
              href="/generate"
              className="inline-flex items-center rounded-xl bg-[var(--brand)] px-6 py-3 text-sm font-medium text-white hover:brightness-110 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--void)]"
            >
              {t("cta.action")}
            </Link>
          </div>
        </AnimatedSection>
      </section>
    </div>
  );
}
