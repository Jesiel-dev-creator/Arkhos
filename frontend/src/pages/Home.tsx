import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Eye,
  Unlock,
  Check,
  X,
  AlertTriangle,
  Globe,
  ArrowRight,
  Zap,
  Code,
  Server,
} from "lucide-react";

import AnimatedShaderHero from "@/components/shaders/animated-shader-hero";
import KineticLogStream from "@/components/ui/kinetic-log-stream";
import { PricingSection } from "@/components/ui/pricing-section";
import { FAQ } from "@/components/ui/faq-tabs";
import { NotificationCenterFeed } from "@/components/ui/live-feed";
import AppFooter from "@/components/AppFooter";
import { ShiningText } from "@/components/ui/shining-text";
import ImageGallery from "@/components/ui/image-gallery";
import { SocialIcons } from "@/components/ui/social-icons";
import { ChatInput } from "@/components/ui/bolt-style-chat";

/* ======= Animation variants ======= */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

/* ======= Navbar links ======= */
const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Gallery", href: "/gallery" },
  { label: "Open Source", href: "https://github.com/Jesiel-dev-creator/Arkhos", external: true },
];

/* ======= Stats data ======= */
const stats = [
  { value: "\u20AC0.004", label: "avg per generation" },
  { value: "5 agents", label: "working in parallel" },
  { value: "17s", label: "average build time" },
  { value: "MIT", label: "open source license" },
];

/* ======= EU partners ======= */
const euPartners = [
  {
    src: "/mistral-logo-color-white.png",
    alt: "Mistral AI",
    name: "Mistral AI",
    desc: "French AI models",
    extra: "brightness-90",
  },
  {
    src: "/Scaleway-Logo-Purple.png",
    alt: "Scaleway",
    name: "Scaleway",
    desc: "Paris data centers",
    extra: "",
  },
  {
    src: "/tramontane logo no bg.png",
    alt: "Tramontane",
    name: "Tramontane",
    desc: "Open source orchestration",
    extra: "",
  },
];

/* ======= Pipeline logs ======= */
const pipelineLogs = [
  { type: "INFO" as const, message: "Planner: Analyzing website requirements..." },
  { type: "SUCCESS" as const, message: "Planner: Plan generated -- 6 sections identified" },
  { type: "INFO" as const, message: "Designer: Selecting color palette and typography..." },
  { type: "SUCCESS" as const, message: "Designer: Warm amber palette -- Playfair Display" },
  { type: "INFO" as const, message: "Architect: Planning React component structure..." },
  { type: "SUCCESS" as const, message: "Architect: Blueprint ready -- Hero, Menu, About, Contact" },
  { type: "INFO" as const, message: "Builder: Writing Hero.tsx (47 lines)..." },
  { type: "SUCCESS" as const, message: "Builder: Hero.tsx complete" },
  { type: "INFO" as const, message: "Builder: Writing Features.tsx (89 lines)..." },
  { type: "SUCCESS" as const, message: "Builder: All 6 sections generated" },
  { type: "SUCCESS" as const, message: "Reviewer: Security scan passed. 0 vulnerabilities." },
  { type: "SUCCESS" as const, message: "Generation complete: \u20AC0.004 \u00B7 17.3s \u00B7 23 files" },
];

/* ======= Why ArkhosAI cards ======= */
const whyCards = [
  {
    icon: <Shield className="w-8 h-8 text-[#00D4EE]" />,
    title: "EU Sovereign",
    desc: "Scaleway Paris. Mistral AI. Your data never leaves Europe. GDPR on all plans.",
  },
  {
    icon: <Eye className="w-8 h-8 text-[#FF6B35]" />,
    title: "Transparent Pricing",
    desc: "See exactly what each agent costs in real time. \u20AC0.004 avg. No hidden credits or tokens.",
  },
  {
    icon: <Unlock className="w-8 h-8 text-[#DCE9F5]" />,
    title: "Open Source",
    desc: "MIT license. Self-host on your own servers. Fork it, customize it, own your stack forever.",
  },
];

/* ======= Agents ======= */
const agents = [
  { name: "Planner", model: "ministral-3b", desc: "Understands your requirements", color: "#00D4EE", initial: "P" },
  { name: "Designer", model: "mistral-small", desc: "Chooses colors, fonts, visual style", color: "#E040FB", initial: "D" },
  { name: "Architect", model: "mistral-small", desc: "Plans React component structure", color: "#FFB020", initial: "A" },
  { name: "Builder", model: "devstral-small", desc: "Writes production code", color: "#FF6B35", initial: "B" },
  { name: "Reviewer", model: "mistral-small", desc: "Security scan & quality check", color: "#22D68A", initial: "R" },
];

/* ======= Comparison table ======= */
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
      return <Check className="inline h-4 w-4 text-[var(--green)]" style={{ color: '#34D399' }} />;
    case "no":
      return <X className="inline h-4 w-4 text-[var(--text-muted)]" style={{ color: 'var(--text-muted)' }} />;
    case "warn":
      return <AlertTriangle className="inline h-4 w-4 text-[var(--violet)]" style={{ color: 'var(--violet)' }} />;
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
    lovable: { text: "~$0.50", status: "warn" },
    bolt: { text: "~$0.50", status: "no" },
    v0: { text: "~$1.00", status: "no" },
  },
  {
    feature: "Cost transparency",
    arkhos: { text: "Real-time", status: "yes" },
    lovable: { text: "Hidden", status: "no" },
    bolt: { text: "Hidden", status: "no" },
    v0: { text: "Hidden", status: "no" },
  },
  {
    feature: "Open source",
    arkhos: { text: "MIT", status: "yes" },
    lovable: { text: "No", status: "no" },
    bolt: { text: "Yes", status: "yes" },
    v0: { text: "No", status: "no" },
  },
  {
    feature: "GDPR all plans",
    arkhos: { text: "Yes", status: "yes" },
    lovable: { text: "Business+", status: "warn" },
    bolt: { text: "No", status: "no" },
    v0: { text: "$100/user", status: "warn" },
  },
  {
    feature: "Security review",
    arkhos: { text: "Built-in", status: "yes" },
    lovable: { text: "None", status: "no" },
    bolt: { text: "None", status: "no" },
    v0: { text: "None", status: "no" },
  },
  {
    feature: "Model routing",
    arkhos: { text: "Intelligent", status: "yes" },
    lovable: { text: "Manual", status: "warn" },
    bolt: { text: "Manual", status: "warn" },
    v0: { text: "Fixed", status: "no" },
  },
];

/* ======= Pricing plans ======= */
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

/* ======= FAQ data ======= */
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
        "Three key differences: 1) EU data residency (Scaleway Paris), 2) Full cost transparency (you see what each agent costs), 3) MIT open source -- self-host it, fork it, own your stack.",
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
      {/* ============================================
          SECTION 1: Floating Navbar
          ============================================ */}
      <nav className="sticky top-4 z-50 mx-auto max-w-5xl backdrop-blur-lg bg-[#020408]/80 border border-white/10 rounded-full px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF6B35] font-[Syne] text-sm font-bold text-white">
            A
          </span>
          <span className="font-[Syne] text-lg font-bold text-[#DCE9F5]">
            ArkhosAI
          </span>
        </a>

        {/* Links (hidden on mobile) */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-[DM_Sans] text-[#7B8FA3] hover:text-[#DCE9F5] transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-[DM_Sans] text-[#7B8FA3] hover:text-[#DCE9F5] transition-colors"
              >
                {link.label}
              </a>
            )
          )}
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate("/generate")}
          className="shrink-0 rounded-full bg-[#FF6B35] px-5 py-2 text-sm font-semibold font-[DM_Sans] text-white transition-all duration-200 hover:bg-[#FF6B35]/90 hover:scale-[1.02]"
        >
          Start building free
        </button>
      </nav>

      {/* ============================================
          SECTION 2: Hero (WebGL Shader)
          ============================================ */}
      {/* Hero ambient glow */}
      <div className="absolute inset-0 z-[5] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(255,93,58,0.12) 0%, transparent 60%)' }} />

      <AnimatedShaderHero
        headline={{ line1: "The EU Answer", line2: "to Lovable." }}
        subtitle="5 Mistral agents build your website live. Real React + shadcn/ui. \u20AC0.004 per generation."
        buttons={{
          primary: {
            text: "Start building free \u2192",
            onClick: () => navigate("/generate"),
          },
          secondary: {
            text: "View on GitHub",
            onClick: () =>
              window.open("https://github.com/ArkhosAI/arkhos", "_blank"),
          },
        }}
        trustBadge={{
          text: "EU Sovereign \u00B7 Mistral AI \u00B7 Scaleway Paris \u00B7 MIT Open Source",
          icons: [<Globe key="globe" className="h-4 w-4" />],
        }}
      />

      {/* ============================================
          SECTION 3: Try it now (ChatInput)
          ============================================ */}
      <section className="relative bg-[var(--void)] py-16 px-6 -mt-20 z-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }}>
        <div className="max-w-3xl mx-auto text-center mb-2">
          <p className="text-sm font-medium tracking-wider uppercase" style={{ color: 'var(--cyan)' }}>Try it now</p>
        </div>
        <div className="max-w-3xl mx-auto text-center mb-8">
          <ShiningText text="Try it now -- no signup required" />
        </div>
        <ChatInput
          onSend={(msg) =>
            navigate(`/generate?prompt=${encodeURIComponent(msg)}`)
          }
          placeholder="Describe your website -- a bakery, a SaaS product, a portfolio..."
        />
      </section>

      {/* ============================================
          SECTION 4: Stats Strip
          ============================================ */}
      <section className="bg-[#020408] py-24 px-6" style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(255,93,58,0.06) 0%, transparent 70%)' }}>
        <div className="mx-auto max-w-5xl" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-xl border bg-[var(--deep)] p-6 text-center hover:border-[var(--ember)]/30 transition-colors"
              >
                <p className="font-mono text-4xl font-bold text-[var(--ember)]">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-[var(--text-secondary)] font-[DM_Sans]">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION 5: Powered by EU AI & Cloud
          ============================================ */}
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
            Powered by EU AI {"&"} Cloud
          </motion.h2>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: 'Mistral AI', img: '/mistral-logo-color-white.png' },
              { name: 'Scaleway', img: '/Scaleway-Logo-Purple.png' },
              { name: 'Tramontane', img: '/tramontane logo no bg.png' },
            ].map(brand => (
              <div key={brand.name} className="flex items-center gap-3 px-5 py-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <img src={brand.img} alt={brand.name} className="h-8 w-auto" />
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{brand.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION 6: Pipeline Visualization
          ============================================ */}
      <section className="py-28" style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(34,211,238,0.04) 0%, transparent 60%)' }}>
        <KineticLogStream
          logs={pipelineLogs}
          title="Watch 5 agents build your site in real time"
          subtitle="Each agent specializes -- from planning to security review"
        />
      </section>

      {/* ============================================
          SECTION 7: Why ArkhosAI
          ============================================ */}
      <section id="features" className="bg-[#020408] py-28 px-6" style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(129,140,248,0.05) 0%, transparent 60%)' }}>
        <div className="mx-auto max-w-5xl">
          <motion.h2
            className="mb-14 text-center font-[Syne] text-3xl font-bold text-[#DCE9F5] md:text-4xl"
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
                <h3 className="mt-4 font-[Syne] text-xl font-semibold text-[#DCE9F5]">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm text-[#7B8FA3] font-[DM_Sans]">
                  {card.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION 8: Agents Section
          ============================================ */}
      <section className="bg-[#020408] py-28 px-6" style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(34,211,238,0.04) 0%, transparent 60%)' }}>
        <div className="mx-auto max-w-5xl">
          <motion.h2
            className="mb-14 text-center font-[Syne] text-3xl font-bold text-[#DCE9F5] md:text-4xl"
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
                className="flex flex-col items-center rounded-xl border border-white/5 bg-[#0D1B2A] p-5 text-center"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white"
                  style={{ backgroundColor: agent.color }}
                >
                  {agent.initial}
                </div>
                <h3 className="mt-3 font-[Syne] text-base font-semibold text-[#DCE9F5]">
                  {agent.name}
                </h3>
                <p className="mt-1 text-sm text-[#7B8FA3] font-[DM_Sans]">
                  {agent.desc}
                </p>
                <p className="mt-2 font-mono text-xs text-[#DCE9F5]/40">
                  {agent.model}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION 9: Comparison Table
          ============================================ */}
      <section className="bg-[#020408] py-28 px-6">
        <div className="mx-auto max-w-4xl">
          <motion.h2
            className="mb-14 text-center font-[Syne] text-3xl font-bold text-[#DCE9F5] md:text-4xl"
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
                <tr className="bg-[var(--surface)]" style={{ background: 'var(--surface, #0D1B2A)' }}>
                  <th className="px-5 py-4 text-left font-medium text-[#7B8FA3]" />
                  <th className="px-4 py-4 text-center font-bold text-[#FF6B35]">
                    ArkhosAI
                  </th>
                  <th className="px-4 py-4 text-center font-medium text-[#7B8FA3]">
                    Lovable
                  </th>
                  <th className="px-4 py-4 text-center font-medium text-[#7B8FA3]">
                    Bolt
                  </th>
                  <th className="px-4 py-4 text-center font-medium text-[#7B8FA3]">
                    v0
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={
                      i % 2 === 0 ? "bg-[#0D1B2A]/30" : "bg-transparent"
                    }
                    style={{
                      borderTop: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <td className="px-5 py-3.5 font-medium text-[#DCE9F5]">
                      {row.feature}
                    </td>
                    <td className="px-4 py-3.5 text-center font-semibold text-[#FF6B35] bg-[rgba(255,93,58,0.06)] border-l-2 border-l-[var(--ember)]" style={{ borderLeftColor: 'var(--ember, #FF6B35)' }}>
                      {row.arkhos.text}{" "}
                      <StatusIcon status={row.arkhos.status} />
                    </td>
                    <td className="px-4 py-3.5 text-center text-[#7B8FA3]">
                      {row.lovable.text}{" "}
                      <StatusIcon status={row.lovable.status} />
                    </td>
                    <td className="px-4 py-3.5 text-center text-[#7B8FA3]">
                      {row.bolt.text}{" "}
                      <StatusIcon status={row.bolt.status} />
                    </td>
                    <td className="px-4 py-3.5 text-center text-[#7B8FA3]">
                      {row.v0.text}{" "}
                      <StatusIcon status={row.v0.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          SECTION 10: Gallery Preview
          ============================================ */}
      <section id="gallery" className="bg-[#020408] py-28 px-6">
        <div className="mx-auto max-w-5xl">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="font-[Syne] text-3xl font-bold text-[#DCE9F5] md:text-4xl">
              Built with ArkhosAI
            </h2>
            <p className="mt-3 text-[#7B8FA3] font-[DM_Sans]">
              Real websites, generated by AI in under 2 minutes
            </p>
          </motion.div>
          <ImageGallery />
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate("/gallery")}
              className="inline-flex items-center gap-2 text-sm font-[DM_Sans] text-[#00D4EE] hover:text-[#00D4EE]/80 transition-colors"
            >
              See all generations
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION 11: Pricing
          ============================================ */}
      <section id="pricing" className="bg-[#020408] py-28 px-6" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,93,58,0.05) 0%, transparent 60%)' }}>
        <PricingSection
          heading="Simple, transparent pricing"
          description="Per-workspace pricing. Add unlimited team members."
          plans={pricingPlans}
        />
      </section>

      {/* ============================================
          SECTION 12: FAQ
          ============================================ */}
      <section className="bg-[#020408] py-28">
        <FAQ
          title="Frequently Asked Questions"
          subtitle="Everything you need to know"
          categories={faqCategories}
          faqData={faqData}
        />
      </section>

      {/* ============================================
          SECTION 13: Social + Footer
          ============================================ */}
      <section className="bg-[#020408] py-16 px-6">
        <div className="mx-auto flex max-w-5xl justify-center">
          <SocialIcons />
        </div>
      </section>

      <AppFooter />

      {/* ============================================
          SECTION 14: Cookie Banner
          ============================================ */}
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
              <p className="text-sm text-[#7B8FA3] font-[DM_Sans]">
                We use essential cookies only. No tracking.{" "}
                <a
                  href="/legal/cookies"
                  className="text-[#DCE9F5] underline hover:text-white transition-colors"
                >
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
