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
} from "lucide-react";
import {
  Stepper,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperSeparator,
  StepperTitle,
  StepperDescription,
  StepperNav,
} from "@/components/ui/stepper";

import AnimatedShaderHero from "@/components/shaders/animated-shader-hero";
import { ShaderAnimation } from "@/components/shaders/shader-animation";
import PipelinePlan from "@/components/PipelinePlan";
import { PricingSection } from "@/components/ui/pricing-section";
import { FAQ } from "@/components/ui/faq-tabs";
import AppFooter from "@/components/AppFooter";
import { OfferCarousel, type Offer } from "@/components/ui/offer-carousel";
import { SocialIcons } from "@/components/ui/social-icons";
import { ChatInput } from "@/components/ui/bolt-style-chat";
import GradientButton from "@/components/ui/gradient-button";

/* ======= Animation variants ======= */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

/* ======= Section divider ======= */
function SectionDivider() {
  return (
    <div
      className="h-px w-full"
      style={{ background: "rgba(255,255,255,0.05)" }}
    />
  );
}

/* ======= Navbar links ======= */
const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Gallery", href: "/gallery" },
  { label: "Open Source", href: "https://github.com/Jesiel-dev-creator/Arkhos", external: true },
];

/* ======= Showcase offers (What you can build) ======= */
const showcaseOffers: Offer[] = [
  {
    id: "bakery",
    imageSrc: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80",
    imageAlt: "French bakery website",
    tag: "Restaurant",
    title: "French Bakery",
    description: "Warm, modern bakery with menu and contact.",
    brandLogoSrc: "/mistral-logo-color-white.png",
    brandName: "Mistral AI",
    href: "/generate?prompt=A+landing+page+for+a+French+bakery+in+Paris",
  },
  {
    id: "saas",
    imageSrc: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80",
    imageAlt: "SaaS dashboard",
    tag: "SaaS",
    title: "B2B SaaS Landing",
    description: "Dark, conversion-focused with pricing and features.",
    brandLogoSrc: "/mistral-logo-color-white.png",
    brandName: "Mistral AI",
    href: "/generate?prompt=A+SaaS+landing+page+for+a+project+management+tool",
  },
  {
    id: "portfolio",
    imageSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
    imageAlt: "Developer portfolio",
    tag: "Portfolio",
    title: "Dev Portfolio",
    description: "Minimal dark mode with projects grid.",
    brandLogoSrc: "/mistral-logo-color-white.png",
    brandName: "Mistral AI",
    href: "/generate?prompt=A+developer+portfolio+for+a+full-stack+engineer",
  },
  {
    id: "restaurant",
    imageSrc: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",
    imageAlt: "Italian restaurant",
    tag: "Restaurant",
    title: "Italian Restaurant",
    description: "Warm elegance with menu and reservations.",
    brandLogoSrc: "/mistral-logo-color-white.png",
    brandName: "Mistral AI",
    href: "/generate?prompt=An+Italian+restaurant+in+Bordeaux+with+reservations",
  },
  {
    id: "agency",
    imageSrc: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&q=80",
    imageAlt: "Creative agency",
    tag: "Agency",
    title: "Creative Agency",
    description: "Bold asymmetric design with case studies.",
    brandLogoSrc: "/mistral-logo-color-white.png",
    brandName: "Mistral AI",
    href: "/generate?prompt=A+creative+agency+in+Marseille+with+case+studies",
  },
];

/* ======= Pipeline logs ======= */
/* Demo pipeline agents — shows completed state on the homepage */
const demoPipelineAgents: import("@/hooks/useSSE").AgentState[] = [
  { name: "planner", status: "complete", model: "ministral-3b", cost_eur: 0, duration_s: 1.2 },
  { name: "designer", status: "complete", model: "mistral-small", cost_eur: 0.0003, duration_s: 1.9 },
  { name: "architect", status: "complete", model: "mistral-small", cost_eur: 0.0007, duration_s: 9.5 },
  { name: "builder", status: "complete", model: "devstral-small", cost_eur: 0.0042, duration_s: 95.3 },
  { name: "reviewer", status: "complete", model: "mistral-small", cost_eur: 0.001, duration_s: 12.1 },
];

/* ======= Why ArkhosAI cards (copywriting: benefit-led, specific) ======= */
const whyCards = [
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Your data stays in Europe",
    desc: "Hosted on Scaleway Paris. Powered by Mistral, a French AI company. GDPR-compliant on every plan, including free.",
    color: "#818CF8",
    label: "EU Sovereign",
  },
  {
    icon: <Eye className="w-6 h-6" />,
    title: "You see what you pay",
    desc: "Every agent shows its cost in real time. No credits, no tokens, no surprise bills. Under \u20AC0.01 per site.",
    color: "#22D3EE",
    label: "Transparent",
  },
  {
    icon: <Unlock className="w-6 h-6" />,
    title: "You own the code",
    desc: "MIT license. Download, self-host, fork, customize. No vendor lock-in. Your website, your servers, your rules.",
    color: "#34D399",
    label: "Open Source",
  },
];

/* ======= Agents (copywriting: what they DO for the user, not technical specs) ======= */
const agents = [
  {
    name: "Planner",
    desc: "Reads your prompt and maps out every section, style choice, and content block your site needs.",
    gradient: "linear-gradient(135deg, #818CF8, #6366F1)",
    initial: "P",
    color: "#818CF8",
  },
  {
    name: "Designer",
    desc: "Picks your color palette, fonts, and spacing. Matches the aesthetic to your industry.",
    gradient: "linear-gradient(135deg, #F472B6, #EC4899)",
    initial: "D",
    color: "#F472B6",
  },
  {
    name: "Architect",
    desc: "Decides which React components to use and how to organize the project files.",
    gradient: "linear-gradient(135deg, #22D3EE, #06B6D4)",
    initial: "A",
    color: "#22D3EE",
  },
  {
    name: "Builder",
    desc: "Writes every line of React, TypeScript, and Tailwind CSS. The one that does the heavy lifting.",
    gradient: "linear-gradient(135deg, #FF5D3A, #FF8C5A)",
    initial: "B",
    color: "#FF5D3A",
  },
  {
    name: "Reviewer",
    desc: "Scans for security issues, missing imports, and accessibility problems. Fixes what it finds.",
    gradient: "linear-gradient(135deg, #34D399, #10B981)",
    initial: "R",
    color: "#34D399",
  },
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
      return <Check className="inline h-4 w-4" style={{ color: "#34D399" }} />;
    case "no":
      return <X className="inline h-4 w-4" style={{ color: "var(--text-muted)" }} />;
    case "warn":
      return <AlertTriangle className="inline h-4 w-4" style={{ color: "var(--violet)" }} />;
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
    arkhos: { text: "<\u20AC0.01", status: "yes" },
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
      question: "What does under \u20AC0.01 mean?",
      answer:
        "That\u2019s the typical AI cost per website generation. It covers all 5 agents (Planner, Designer, Architect, Builder, Reviewer) running on Mistral models. Actual cost varies by complexity.",
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
    <div className="min-h-screen bg-[var(--void)]">
      {/* ============================================
          SECTION 1: Floating Navbar
          ============================================ */}
      <nav className="sticky top-4 z-50 mx-auto max-w-5xl backdrop-blur-lg bg-[var(--void)]/80 border border-white/10 rounded-full px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF6B35] font-[Syne] text-sm font-bold text-white">
            A
          </span>
          <span className="font-[Syne] text-lg font-bold text-[var(--text-primary)]">
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
                className="text-sm font-[DM_Sans] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-[DM_Sans] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                {link.label}
              </a>
            )
          )}
        </div>

        {/* CTA */}
        <GradientButton onClick={() => navigate("/generate")} width="180px" height="38px">
          Start building free
        </GradientButton>
      </nav>

      {/* ============================================
          SECTION 2: Hero (WebGL Shader) + ChatInput
          ============================================ */}
      <div className="relative">
        <AnimatedShaderHero
          headline={{ line1: "Describe it.", line2: "We build it." }}
          subtitle={"AI builds your website in under 2 minutes. EU-hosted. Under \u20AC0.01 per site. Open source."}
          trustBadge={{
            text: "EU Data \u00B7 Mistral AI \u00B7 MIT License \u00B7 GDPR included",
            icons: [<Globe key="globe" className="h-4 w-4" />],
          }}
        />
        {/* ChatInput overlaid on hero — THIS is the CTA */}
        <div className="absolute bottom-[15%] md:bottom-[18%] left-0 right-0 z-20 px-4">
          <div className="max-w-2xl mx-auto space-y-4">
            <ChatInput
              onSend={(msg) =>
                navigate(`/generate?prompt=${encodeURIComponent(msg)}`)
              }
              placeholder="Describe your website — a bakery, a SaaS product, a portfolio..."
            />
            <p className="text-center text-xs tracking-wide" style={{ color: 'var(--text-muted)' }}>
              No signup required · Free · 3 generations per day
            </p>
          </div>
        </div>
      </div>

      <SectionDivider />

      {/* ============================================
          SECTION 3: Tech Credibility Strip
          ============================================ */}
      <section className="relative z-10 bg-[var(--void)] py-10 px-6">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-xs uppercase tracking-widest mb-6" style={{ color: 'var(--text-muted)' }}>
            Built with
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {[
              { name: 'Mistral AI', img: '/mistral-logo-color-white.png', desc: 'French AI models' },
              { name: 'Scaleway', img: '/Scaleway-Logo-Purple.png', desc: 'Paris datacenter' },
              { name: 'Tramontane', img: '/tramontane logo no bg.png', desc: 'Open source orchestration' },
            ].map(brand => (
              <div key={brand.name} className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
                <img src={brand.img} alt={brand.name} className="h-6 w-auto" />
                <span className="text-xs hidden md:inline" style={{ color: 'var(--text-muted)' }}>{brand.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ============================================
          SECTION 4: What You Can Build (OfferCarousel)
          ============================================ */}
      <section className="bg-[var(--void)] py-20 md:py-28 px-6">
        <div className="mx-auto max-w-6xl">
          <motion.h2 className="text-center font-[Syne] text-3xl font-bold tracking-[-0.02em] md:text-4xl mb-4" style={{ color: 'var(--text-primary)' }}
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ duration: 0.5 }}>
            What you can build
          </motion.h2>
          <p className="text-center mb-12 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Each site generated in under 2 minutes. Real React + shadcn/ui. Click any to try it.
          </p>
          <OfferCarousel offers={showcaseOffers} />
        </div>
      </section>

      <SectionDivider />

      {/* ============================================
          SECTION 5: The Pipeline (PipelinePlan + ShaderAnimation bg)
          ============================================ */}
      <section className="relative py-20 md:py-28 px-6 overflow-hidden">
        {/* ShaderAnimation background at low opacity */}
        <div className="absolute inset-0 z-0 opacity-[0.15]">
          <ShaderAnimation />
        </div>
        <div className="relative z-10">
          <motion.h2
            className="mb-4 text-center font-[Syne] tracking-[-0.02em] text-3xl font-bold text-[var(--text-primary)] md:text-4xl"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            5 agents, one pipeline
          </motion.h2>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-center mb-12">
            Each agent specializes. Click to explore what they do.
          </p>

          {/* Interactive PipelinePlan — same component used in the generator */}
          <div className="mx-auto max-w-2xl">
            <PipelinePlan
              agents={demoPipelineAgents}
              status="complete"
            />
          </div>

          {/* Stats in context below the pipeline */}
          <div className="mx-auto max-w-3xl mt-12 flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {[
              { value: "5 agents", label: "in sequence" },
              { value: "<\u20AC0.01", label: "per generation" },
              { value: "~2 min", label: "build time" },
              { value: "MIT", label: "open source" },
            ].map((stat, i) => (
              <motion.div key={stat.label} variants={fadeUp} initial="hidden" whileInView="visible"
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}
                className="text-center">
                <p className="font-mono text-lg font-bold" style={{ color: 'var(--ember)' }}>{stat.value}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ============================================
          SECTION 6: Why ArkhosAI
          ============================================ */}
      <section id="features" className="relative bg-[var(--void)] py-20 md:py-28 px-6 overflow-hidden" style={{ background: "radial-gradient(ellipse at 80% 50%, rgba(129,140,248,0.05) 0%, transparent 60%)" }}>
        <div className="mx-auto max-w-5xl relative z-10">
          <motion.h2
            className="mb-4 text-center font-[Syne] tracking-[-0.02em] text-3xl font-bold text-[var(--text-primary)] md:text-4xl"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Built different
          </motion.h2>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto text-center mb-14">
            Three things every competitor gets wrong. We fix all of them.
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {whyCards.map((card, i) => (
              <motion.div
                key={card.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                whileHover={{ scale: 1.02, y: -4 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="group rounded-2xl p-8 transition-all duration-300"
                style={{
                  background: "var(--grad-card)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {/* Label + icon */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-300"
                    style={{ background: `${card.color}15`, color: card.color }}>
                    {card.icon}
                  </div>
                  <span className="text-xs font-mono uppercase tracking-wider" style={{ color: card.color }}>
                    {card.label}
                  </span>
                </div>
                {/* Benefit-led title */}
                <h3 className="font-[Syne] text-xl font-bold text-[var(--text-primary)] mb-3">
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  {card.desc}
                </p>
                {/* Bottom accent line on hover */}
                <div className="h-[2px] w-0 group-hover:w-full mt-6 rounded-full transition-all duration-500"
                  style={{ background: card.color }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ============================================
          SECTION 7: Agents
          ============================================ */}
      <section className="bg-[var(--void)] py-20 md:py-28 px-6" style={{ background: "radial-gradient(ellipse at 20% 50%, rgba(34,211,238,0.04) 0%, transparent 60%)" }}>
        <div className="mx-auto max-w-3xl">
          <motion.h2
            className="mb-4 text-center font-[Syne] tracking-[-0.02em] text-3xl font-bold text-[var(--text-primary)] md:text-4xl"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Your AI team
          </motion.h2>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto text-center mb-14">
            Five agents work in sequence. Click any step to learn more.
          </p>

          <Stepper
            defaultValue={1}
            orientation="vertical"
            className="mx-auto max-w-2xl"
            indicators={{
              completed: <Check className="size-4" />,
            }}
          >
            <StepperNav>
              {agents.map((agent, i) => (
                <StepperItem key={agent.name} step={i + 1}>
                  <StepperTrigger className="py-3">
                    <StepperIndicator
                      className="size-10 text-base font-bold data-[state=completed]:text-white data-[state=active]:text-white"
                      style={{
                        background: agent.gradient,
                      }}
                    >
                      {agent.initial}
                    </StepperIndicator>
                    <div className="ml-1">
                      <StepperTitle className="text-base font-[Syne] font-bold text-[var(--text-primary)]">
                        {agent.name}
                      </StepperTitle>
                      <StepperDescription className="text-sm text-[var(--text-secondary)] mt-0.5">
                        {agent.desc}
                      </StepperDescription>
                    </div>
                  </StepperTrigger>
                  {i < agents.length - 1 && (
                    <StepperSeparator
                      className="group-data-[state=completed]/step:bg-[var(--green)]"
                      style={{ marginLeft: '19px' }}
                    />
                  )}
                </StepperItem>
              ))}
            </StepperNav>
          </Stepper>
        </div>
      </section>

      <SectionDivider />

      {/* ============================================
          SECTION 8: Comparison Table
          ============================================ */}
      <section className="relative bg-[var(--void)] py-20 md:py-28 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />
        <div className="mx-auto max-w-4xl relative z-10">
          <motion.h2
            className="mb-4 text-center font-[Syne] tracking-[-0.02em] text-3xl font-bold text-[var(--text-primary)] md:text-4xl"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ duration: 0.5 }}
          >
            Not all AI builders are equal
          </motion.h2>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto text-center mb-14">
            We checked. Here are the facts.
          </p>
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
            className="overflow-x-auto rounded-2xl"
            style={{ background: 'var(--grad-card)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th className="px-6 py-5 text-left text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }} />
                  <th className="px-5 py-5 text-center">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full"
                      style={{ background: 'var(--ember-glow)', border: '1px solid rgba(255,93,58,0.2)' }}>
                      <span className="w-2 h-2 rounded-full" style={{ background: 'var(--ember)' }} />
                      <span className="text-sm font-bold" style={{ color: 'var(--ember)' }}>ArkhosAI</span>
                    </span>
                  </th>
                  <th className="px-5 py-5 text-center text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Lovable</th>
                  <th className="px-5 py-5 text-center text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Bolt</th>
                  <th className="px-5 py-5 text-center text-sm font-medium" style={{ color: 'var(--text-muted)' }}>v0</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <motion.tr
                    key={row.feature}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="group transition-colors hover:bg-white/[0.02]"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    <td className="px-6 py-4 font-medium text-[var(--text-primary)]">{row.feature}</td>
                    <td className="px-5 py-4 text-center" style={{ background: 'rgba(255,93,58,0.04)' }}>
                      <span className="inline-flex items-center gap-1.5 font-semibold" style={{ color: 'var(--ember)' }}>
                        {row.arkhos.text} <StatusIcon status={row.arkhos.status} />
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center text-[var(--text-secondary)]">
                      <span className="inline-flex items-center gap-1.5">{row.lovable.text} <StatusIcon status={row.lovable.status} /></span>
                    </td>
                    <td className="px-5 py-4 text-center text-[var(--text-secondary)]">
                      <span className="inline-flex items-center gap-1.5">{row.bolt.text} <StatusIcon status={row.bolt.status} /></span>
                    </td>
                    <td className="px-5 py-4 text-center text-[var(--text-secondary)]">
                      <span className="inline-flex items-center gap-1.5">{row.v0.text} <StatusIcon status={row.v0.status} /></span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ============================================
          SECTION 9: Pricing
          ============================================ */}
      <section id="pricing" className="bg-[var(--void)] py-20 md:py-28 px-6" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(255,93,58,0.05) 0%, transparent 60%)" }}>
        <PricingSection
          heading="Simple, transparent pricing"
          description="Per-workspace pricing. Add unlimited team members."
          plans={pricingPlans}
        />
      </section>

      <SectionDivider />

      {/* ============================================
          SECTION 10: FAQ
          ============================================ */}
      <section className="bg-[var(--void)] py-20 md:py-28">
        <FAQ
          title="Frequently Asked Questions"
          subtitle="Everything you need to know"
          categories={faqCategories}
          faqData={faqData}
        />
      </section>

      <SectionDivider />

      {/* ============================================
          SECTION 11: Final CTA (repeat ChatInput)
          ============================================ */}
      <section className="bg-[var(--void)] py-20 md:py-28 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-[Syne] text-3xl font-bold tracking-[-0.02em] md:text-4xl mb-4" style={{ color: 'var(--text-primary)' }}>
            Ready to build?
          </h2>
          <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
            No signup. No credit card. Just describe what you want.
          </p>
          <ChatInput
            onSend={(msg) => navigate(`/generate?prompt=${encodeURIComponent(msg)}`)}
            placeholder="Describe your website..."
          />
        </div>
      </section>

      <SectionDivider />

      {/* ============================================
          SECTION 12: Social + Footer
          ============================================ */}
      <section className="bg-[var(--void)] py-20 md:py-28 px-6">
        <div className="mx-auto flex max-w-5xl justify-center">
          <SocialIcons />
        </div>
      </section>

      <AppFooter />

      {/* ============================================
          Cookie Banner
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
            <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 rounded-xl border border-[#1C2E42] bg-[var(--deep)]/90 px-6 py-4 backdrop-blur-xl">
              <p className="text-sm text-[var(--text-secondary)] font-[DM_Sans]">
                We use essential cookies only. No tracking.{" "}
                <a
                  href="/legal/cookies"
                  className="text-[var(--text-primary)] underline hover:text-white transition-colors"
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
