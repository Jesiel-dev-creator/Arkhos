import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Eye, Unlock, Check, X, AlertTriangle, Globe } from "lucide-react";

import ShadcnBlocksNavbar from "@/components/ui/shadcnblocks-navbar";
import AnimatedShaderHero from "@/components/shaders/animated-shader-hero";
import KineticLogStream from "@/components/ui/kinetic-log-stream";
import PricingSection from "@/components/ui/pricing-section";
import FAQ from "@/components/ui/faq-tabs";
import NotificationCenterFeed from "@/components/ui/live-feed";
import AppFooter from "@/components/AppFooter";
import { Card, CardContent } from "@/components/ui/card";

/* ======= Animation variants ======= */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

/* ======= Section 4: Pipeline logs ======= */
const pipelineLogs = [
  { type: "INFO" as const, message: "Planner: Analyzing website requirements..." },
  { type: "SUCCESS" as const, message: "Planner: Plan generated \u2014 6 sections identified" },
  { type: "INFO" as const, message: "Designer: Selecting color palette and typography..." },
  { type: "SUCCESS" as const, message: "Designer: Warm amber palette \u2014 Playfair Display" },
  { type: "INFO" as const, message: "Architect: Planning React component structure..." },
  { type: "SUCCESS" as const, message: "Architect: Blueprint ready \u2014 Hero, Menu, About, Contact" },
  { type: "INFO" as const, message: "Builder: Writing Hero.tsx (47 lines)..." },
  { type: "SUCCESS" as const, message: "Builder: Hero.tsx complete" },
  { type: "INFO" as const, message: "Builder: Writing Features.tsx (89 lines)..." },
  { type: "SUCCESS" as const, message: "Builder: All 6 sections generated" },
  { type: "SUCCESS" as const, message: "Reviewer: Security scan passed. 0 vulnerabilities." },
  { type: "SUCCESS" as const, message: "Generation complete: \u20AC0.004 \u00B7 17.3s \u00B7 23 files" },
];

/* ======= Section 5: Why ArkhosAI cards ======= */
const whyCards = [
  {
    icon: <Shield className="w-8 h-8 text-[#00D4EE]" />,
    title: "EU Sovereign",
    desc: "Scaleway Paris. Mistral AI. Your data never leaves Europe. GDPR on all plans.",
  },
  {
    icon: <Eye className="w-8 h-8 text-[#FF6B35]" />,
    title: "Transparent Pricing",
    desc: "See exactly what each agent costs. \u20AC0.004 avg per site. No hidden credits.",
  },
  {
    icon: <Unlock className="w-8 h-8 text-[#DCE9F5]" />,
    title: "Open Source",
    desc: "MIT license. Self-host it. Fork it. Own your stack forever.",
  },
];

/* ======= Section 6: Agents ======= */
const agents = [
  { name: "Planner", model: "ministral-3b", desc: "Understands your requirements", color: "#00D4EE", initial: "P" },
  { name: "Designer", model: "mistral-small", desc: "Chooses colors, fonts, visual style", color: "#E040FB", initial: "D" },
  { name: "Architect", model: "mistral-small", desc: "Plans React component structure", color: "#FFB020", initial: "A" },
  { name: "Builder", model: "devstral-small", desc: "Writes production code", color: "#FF6B35", initial: "B" },
  { name: "Reviewer", model: "mistral-small", desc: "Security scan & quality check", color: "#22D68A", initial: "R" },
];

/* ======= Comparison helper ======= */
type CellStatus = "yes" | "no" | "warn";

interface ComparisonRow {
  feature: string;
  arkhos: { text: string; status: CellStatus };
  lovable: { text: string; status: CellStatus };
  bolt: { text: string; status: CellStatus };
  v0: { text: string; status: CellStatus };
}

function StatusIcon({ status }: { status: CellStatus }) {
  switch (status) {
    case "yes":
      return <Check className="inline h-4 w-4 text-[#22D68A]" />;
    case "no":
      return <X className="inline h-4 w-4 text-[#FF4560]" />;
    case "warn":
      return <AlertTriangle className="inline h-4 w-4 text-[#FFB020]" />;
  }
}

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Data residency",
    arkhos: { text: "EU", status: "yes" },
    lovable: { text: "US", status: "warn" },
    bolt: { text: "US", status: "no" },
    v0: { text: "US", status: "no" },
  },
  {
    feature: "Cost/generation",
    arkhos: { text: "\u20AC0.004", status: "yes" },
    lovable: { text: "~\u20AC0.50", status: "warn" },
    bolt: { text: "~\u20AC0.30", status: "no" },
    v0: { text: "~\u20AC0.20", status: "no" },
  },
  {
    feature: "Transparency",
    arkhos: { text: "Full", status: "yes" },
    lovable: { text: "Hidden", status: "no" },
    bolt: { text: "Hidden", status: "no" },
    v0: { text: "Hidden", status: "no" },
  },
  {
    feature: "Open source",
    arkhos: { text: "MIT", status: "yes" },
    lovable: { text: "No", status: "no" },
    bolt: { text: "No", status: "no" },
    v0: { text: "No", status: "no" },
  },
  {
    feature: "GDPR all plans",
    arkhos: { text: "Yes", status: "yes" },
    lovable: { text: "No", status: "no" },
    bolt: { text: "No", status: "no" },
    v0: { text: "No", status: "no" },
  },
];

/* ======= Section 8: Pricing plans ======= */
const pricingPlans = [
  {
    name: "Free",
    info: "Get started, no credit card",
    price: { monthly: 0, yearly: 0 },
    features: [
      { text: "3 generations per day" },
      { text: "EU hosting (Scaleway Paris)" },
      { text: "MIT open source" },
      { text: "Community support" },
    ],
    btn: { text: "Start free", href: "/generate" },
  },
  {
    name: "Pro",
    info: "For professionals and freelancers",
    price: { monthly: 25, yearly: 250 },
    features: [
      { text: "100 generations per month" },
      { text: "Priority queue" },
      { text: "Custom domain export" },
      { text: "Email support" },
      { text: "Team collaboration" },
    ],
    btn: { text: "Start Pro trial", href: "/generate" },
    highlighted: true,
  },
  {
    name: "Team",
    info: "For agencies and teams",
    price: { monthly: 50, yearly: 500 },
    features: [
      { text: "Unlimited generations" },
      { text: "Team roles & permissions" },
      { text: "GDPR DPA included" },
      { text: "Priority support" },
      { text: "Custom branding" },
      { text: "API access" },
    ],
    btn: { text: "Contact sales", href: "/generate" },
  },
];

/* ======= Section 9: FAQ data ======= */
const faqCategories = {
  general: "General",
  pricing: "Pricing",
  technical: "Technical",
  privacy: "Privacy",
};

const faqData = {
  general: [
    {
      question: "What is ArkhosAI?",
      answer:
        "ArkhosAI is an EU-sovereign AI website generator. Describe what you want, and 5 Mistral AI agents build a complete React + shadcn/ui website in under 2 minutes.",
    },
    {
      question: "How does it differ from Lovable and Bolt?",
      answer:
        "Three key differences: 1) EU data residency (Scaleway Paris), 2) Full cost transparency (you see what each agent costs), 3) MIT open source \u2014 self-host it, fork it, own your stack.",
    },
    {
      question: "Is it really open source?",
      answer:
        "Yes. MIT license. The entire codebase including the AI pipeline is on GitHub. You can self-host it on your own infrastructure.",
    },
  ],
  pricing: [
    {
      question: "Why per-workspace, not per-user?",
      answer:
        "We believe teams shouldn\u2019t pay more for collaborating. One workspace price, unlimited team members. Add your whole team for \u20AC50/month.",
    },
    {
      question: "What does \u20AC0.004 mean?",
      answer:
        "That\u2019s the average AI cost per website generation. It covers all 5 agents (Planner, Designer, Architect, Builder, Reviewer) running on Mistral models.",
    },
    {
      question: "Can I self-host for free?",
      answer:
        "Yes. The MIT license means you can run ArkhosAI on your own servers. You only pay for the Mistral API calls directly.",
    },
  ],
  technical: [
    {
      question: "What AI models power ArkhosAI?",
      answer:
        "We use Mistral AI models exclusively: ministral-3b for planning, mistral-small for design/architecture/review, and devstral-small for code generation.",
    },
    {
      question: "What tech stack do generated sites use?",
      answer:
        "React 18 + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion. Production-ready, no vendor lock-in.",
    },
    {
      question: "Can I self-host?",
      answer:
        "Yes. Docker deployment, works with any Mistral-compatible API endpoint. Full docs on GitHub.",
    },
  ],
  privacy: [
    {
      question: "Where is my data stored?",
      answer:
        "All data is stored on Scaleway servers in Paris, France. Your data never leaves the EU.",
    },
    {
      question: "Do you train on my data?",
      answer:
        "No. We never train on user data. Your website descriptions and generated code are yours alone.",
    },
    {
      question: "GDPR compliance?",
      answer:
        "Yes. Full GDPR compliance on all plans including Free. DPA (Data Processing Agreement) available on Team plan.",
    },
  ],
};

/* ======= Stats data ======= */
const stats = [
  { value: "\u20AC0.004", label: "avg per generation" },
  { value: "5", label: "agents work in parallel" },
  { value: "MIT", label: "open source license" },
  { value: "EU", label: "sovereign by default" },
];

/* ======= Cookie consent storage key ======= */
const COOKIE_KEY = "arkhos_cookie_consent";

/* ===============================================
   HOME PAGE
   =============================================== */
export default function Home() {
  const navigate = useNavigate();
  const [showCookieBanner, setShowCookieBanner] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(COOKIE_KEY)) {
      setShowCookieBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem(COOKIE_KEY, "accepted");
    setShowCookieBanner(false);
  };

  return (
    <div className="min-h-screen bg-[#020408]">
      {/* -- SECTION 1: Navbar -- */}
      <ShadcnBlocksNavbar />

      {/* -- SECTION 2: Hero -- */}
      <AnimatedShaderHero
        headline={{ line1: "The EU Answer", line2: "to Lovable." }}
        subtitle={"4 Mistral agents build your site live. Real React + shadcn/ui. \u20AC0.004 per generation."}
        buttons={{
          primary: { text: "Start building free \u2192", onClick: () => navigate("/generate") },
          secondary: { text: "See how it works" },
        }}
        trustBadge={{
          text: "EU Sovereign \u00B7 Mistral AI \u00B7 Scaleway Paris \u00B7 MIT Open Source",
          icons: [<Globe key="globe" className="h-4 w-4" />],
        }}
      />

      {/* -- SECTION 3: Stats Strip -- */}
      <section className="bg-[#020408] py-20 px-6">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="bg-[#0D1B2A] border border-white/5 rounded-xl p-6 text-center ring-0">
                <CardContent className="p-0">
                  <p className="font-[Syne] text-4xl font-bold text-[#FF6B35]">{stat.value}</p>
                  <p className="mt-1 text-sm text-[#DCE9F5]/60 font-[DM_Sans]">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* -- SECTION 3.5: Powered by EU AI & Cloud -- */}
      <section className="bg-[#020408] py-20 px-6">
        <div className="mx-auto max-w-4xl">
          <motion.h2
            className="mb-10 text-center font-[Syne] text-3xl font-bold text-[#DCE9F5] md:text-4xl"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Powered by EU AI {"&"} Cloud
          </motion.h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, delay: 0 }}
              className="flex flex-col items-center rounded-xl border border-white/5 bg-[#0D1B2A] p-8 text-center">
              <img src="/mistral-logo-color-white.png" alt="Mistral AI" className="h-10 w-auto mb-4 brightness-90" />
              <p className="text-lg font-semibold text-[#DCE9F5]">Mistral AI</p>
              <p className="mt-2 text-sm text-[#7B8FA3]">French AI models. EU data sovereignty.</p>
            </motion.div>
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, delay: 0.12 }}
              className="flex flex-col items-center rounded-xl border border-white/5 bg-[#0D1B2A] p-8 text-center">
              <img src="/Scaleway-Logo-Purple.png" alt="Scaleway" className="h-10 w-auto mb-4" />
              <p className="text-lg font-semibold text-[#DCE9F5]">Scaleway</p>
              <p className="mt-2 text-sm text-[#7B8FA3]">Paris data centers. GDPR by default.</p>
            </motion.div>
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, delay: 0.24 }}
              className="flex flex-col items-center rounded-xl border border-white/5 bg-[#0D1B2A] p-8 text-center">
              <img src="/tramontane logo no bg.png" alt="Tramontane" className="h-10 w-auto mb-4" />
              <p className="text-lg font-semibold text-[#DCE9F5]">Tramontane</p>
              <p className="mt-2 text-sm text-[#7B8FA3]">Open source agent orchestration.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* -- SECTION 4: Pipeline Visualization -- */}
      <section className="py-24">
        <KineticLogStream
          logs={pipelineLogs}
          title="Watch 5 agents build your site in real time"
        />
      </section>

      {/* -- SECTION 5: Why ArkhosAI -- */}
      <section className="bg-[#020408] py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <motion.h2
            className="mb-12 text-center font-[Syne] text-3xl font-bold text-[#DCE9F5] md:text-4xl"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Why ArkhosAI
          </motion.h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {whyCards.map((card, i) => (
              <motion.div
                key={card.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="rounded-2xl border border-[#00D4EE]/10 bg-[#0D1B2A] p-8"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00D4EE]/10">
                  {card.icon}
                </div>
                <h3 className="mt-4 text-xl font-semibold text-[#DCE9F5]">{card.title}</h3>
                <p className="mt-2 text-sm text-[#DCE9F5]/60 font-[DM_Sans]">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* -- SECTION 6: Agents Section -- */}
      <section className="bg-[#020408] py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <motion.h2
            className="mb-12 text-center font-[Syne] text-3xl font-bold text-[#DCE9F5] md:text-4xl"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Meet the agents
          </motion.h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {agents.map((agent, i) => (
              <motion.div
                key={agent.name}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Card className="bg-[#0D1B2A] border border-white/5 rounded-xl p-5 ring-0">
                  <CardContent className="flex flex-col items-center p-0 text-center">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white"
                      style={{ backgroundColor: agent.color }}
                    >
                      {agent.initial}
                    </div>
                    <h3 className="mt-3 text-base font-semibold text-[#DCE9F5]">{agent.name}</h3>
                    <p className="mt-1 text-sm text-[#DCE9F5]/60 font-[DM_Sans]">{agent.desc}</p>
                    <p className="mt-2 font-mono text-xs text-[#DCE9F5]/40">{agent.model}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* -- SECTION 7: Comparison Table -- */}
      <section className="bg-[#020408] py-24 px-6">
        <div className="mx-auto max-w-4xl">
          <motion.h2
            className="mb-12 text-center font-[Syne] text-3xl font-bold text-[#DCE9F5] md:text-4xl"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            How we compare
          </motion.h2>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="overflow-x-auto rounded-xl border border-white/5"
          >
            <table className="w-full text-sm font-[DM_Sans]">
              <thead>
                <tr className="bg-[#0D1B2A]">
                  <th className="px-5 py-4 text-left font-medium text-[#DCE9F5]/60" />
                  <th className="px-4 py-4 text-center font-bold text-[#FF6B35]">ArkhosAI</th>
                  <th className="px-4 py-4 text-center font-medium text-[#DCE9F5]/60">Lovable</th>
                  <th className="px-4 py-4 text-center font-medium text-[#DCE9F5]/60">Bolt</th>
                  <th className="px-4 py-4 text-center font-medium text-[#DCE9F5]/60">v0</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={i % 2 === 0 ? "bg-[#0D1B2A]/30" : "bg-transparent"}
                    style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <td className="px-5 py-3.5 font-medium text-[#DCE9F5]">{row.feature}</td>
                    <td className="px-4 py-3.5 text-center font-semibold text-[#FF6B35]">
                      {row.arkhos.text} <StatusIcon status={row.arkhos.status} />
                    </td>
                    <td className="px-4 py-3.5 text-center text-[#DCE9F5]/60">
                      {row.lovable.text} <StatusIcon status={row.lovable.status} />
                    </td>
                    <td className="px-4 py-3.5 text-center text-[#DCE9F5]/60">
                      {row.bolt.text} <StatusIcon status={row.bolt.status} />
                    </td>
                    <td className="px-4 py-3.5 text-center text-[#DCE9F5]/60">
                      {row.v0.text} <StatusIcon status={row.v0.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* -- SECTION 8: Pricing -- */}
      <section id="pricing" className="bg-[#020408] py-24 px-6">
        <PricingSection
          heading="Simple, transparent pricing"
          description="Per-workspace pricing. Add unlimited team members."
          plans={pricingPlans}
        />
      </section>

      {/* -- SECTION 9: FAQ -- */}
      <section className="bg-[#020408] py-24">
        <FAQ
          title="Frequently Asked Questions"
          subtitle="Everything you need to know"
          categories={faqCategories}
          faqData={faqData}
        />
      </section>

      {/* -- SECTION 10: Live Feed -- */}
      <section className="bg-[#020408] py-24 px-6">
        <div className="mx-auto flex max-w-5xl justify-center">
          <NotificationCenterFeed />
        </div>
      </section>

      {/* -- SECTION 11: Footer -- */}
      <AppFooter />

      {/* -- Cookie Consent Banner -- */}
      <AnimatePresence>
        {showCookieBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4"
          >
            <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 rounded-xl border border-[#1C2E42] bg-[#0D1B2A]/90 px-6 py-4 backdrop-blur-xl">
              <p className="text-sm text-[#DCE9F5]/70 font-[DM_Sans]">
                We use essential cookies only. No tracking.{" "}
                <a href="/legal/cookies" className="text-[#DCE9F5] underline hover:text-white transition-colors">
                  Learn more
                </a>
              </p>
              <button
                onClick={acceptCookies}
                className="shrink-0 rounded-lg bg-[#FF6B35] px-5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#FF6B35]/90 hover:scale-[1.02]"
              >
                Accept
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
