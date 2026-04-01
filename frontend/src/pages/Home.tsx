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
} from "lucide-react";

import AnimatedShaderHero from "@/components/shaders/animated-shader-hero";
import KineticLogStream from "@/components/ui/kinetic-log-stream";
import { PricingSection } from "@/components/ui/pricing-section";
import { FAQ } from "@/components/ui/faq-tabs";
import AppFooter from "@/components/AppFooter";
import { OfferCarousel, type Offer } from "@/components/ui/offer-carousel";
import { SocialIcons } from "@/components/ui/social-icons";
import { ChatInput } from "@/components/ui/bolt-style-chat";

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
  { type: "SUCCESS" as const, message: "Generation complete: \u20AC0.007 \u00B7 1m 58s \u00B7 23 files" },
];

/* ======= Why ArkhosAI cards ======= */
const whyCards = [
  {
    icon: <Shield className="w-8 h-8 text-[#818CF8]" />,
    title: "EU Sovereign",
    desc: "Scaleway Paris. Mistral AI. Your data never leaves Europe. GDPR on all plans.",
    hoverBorder: "hover:border-[#818CF8]/30",
    iconBg: "bg-[#818CF8]/10",
  },
  {
    icon: <Eye className="w-8 h-8 text-[#22D3EE]" />,
    title: "Transparent Pricing",
    desc: "See exactly what each agent costs in real time. Under \u20AC0.01 per site. No hidden credits or tokens.",
    hoverBorder: "hover:border-[#22D3EE]/30",
    iconBg: "bg-[#22D3EE]/10",
  },
  {
    icon: <Unlock className="w-8 h-8 text-[#34D399]" />,
    title: "Open Source",
    desc: "MIT license. Self-host on your own servers. Fork it, customize it, own your stack forever.",
    hoverBorder: "hover:border-[#34D399]/30",
    iconBg: "bg-[#34D399]/10",
  },
];

/* ======= Agents ======= */
const agents = [
  {
    name: "Planner",
    model: "ministral-3b",
    desc: "Understands your requirements",
    gradient: "linear-gradient(135deg, #818CF8, #6366F1)",
    initial: "P",
    hoverShadow: "hover:shadow-[0_0_20px_rgba(129,140,248,0.1)]",
    hoverBorder: "hover:border-[#818CF8]/20",
  },
  {
    name: "Designer",
    model: "mistral-small",
    desc: "Chooses colors, fonts, visual style",
    gradient: "linear-gradient(135deg, #F472B6, #EC4899)",
    initial: "D",
    hoverShadow: "hover:shadow-[0_0_20px_rgba(244,114,182,0.1)]",
    hoverBorder: "hover:border-[#F472B6]/20",
  },
  {
    name: "Architect",
    model: "mistral-small",
    desc: "Plans React component structure",
    gradient: "linear-gradient(135deg, #22D3EE, #06B6D4)",
    initial: "A",
    hoverShadow: "hover:shadow-[0_0_20px_rgba(34,211,238,0.1)]",
    hoverBorder: "hover:border-[#22D3EE]/20",
  },
  {
    name: "Builder",
    model: "devstral-small",
    desc: "Writes production code",
    gradient: "linear-gradient(135deg, #FF5D3A, #FF8C5A)",
    initial: "B",
    hoverShadow: "hover:shadow-[0_0_20px_rgba(255,93,58,0.1)]",
    hoverBorder: "hover:border-[#FF5D3A]/20",
  },
  {
    name: "Reviewer",
    model: "mistral-small",
    desc: "Security scan & quality check",
    gradient: "linear-gradient(135deg, #34D399, #10B981)",
    initial: "R",
    hoverShadow: "hover:shadow-[0_0_20px_rgba(52,211,153,0.1)]",
    hoverBorder: "hover:border-[#34D399]/20",
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
        <button
          onClick={() => navigate("/generate")}
          className="shrink-0 rounded-full bg-[#FF6B35] px-5 py-2 text-sm font-semibold font-[DM_Sans] text-white transition-all duration-200 hover:bg-[#FF6B35]/90 hover:scale-[1.02]"
        >
          Start building free
        </button>
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
          SECTION 5: How It Works (3 Steps + Terminal)
          ============================================ */}
      <section className="py-20 md:py-28 px-6" style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(34,211,238,0.04) 0%, transparent 60%)" }}>
        <motion.h2
          className="mb-4 text-center font-[Syne] tracking-[-0.02em] text-3xl font-bold text-[var(--text-primary)] md:text-4xl"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          How it works
        </motion.h2>
        <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-center mb-14">
          From description to deployed website in three steps.
        </p>

        {/* 3-step explainer */}
        <div className="mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            { step: "1", title: "Describe", desc: "Tell us what you want in plain language. Industry, style, sections." },
            { step: "2", title: "Generate", desc: "5 AI agents build your site. Under \u20AC0.01. Takes about 2 minutes." },
            { step: "3", title: "Ship", desc: "Download, deploy, or iterate. Real React code you own." },
          ].map((s, i) => (
            <motion.div key={s.step} variants={fadeUp} initial="hidden" whileInView="visible"
              viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center">
              <div className="w-10 h-10 rounded-full mx-auto mb-4 flex items-center justify-center text-sm font-bold"
                style={{ background: 'var(--ember-glow)', color: 'var(--ember)' }}>
                {s.step}
              </div>
              <h3 className="font-[Syne] text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{s.title}</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Pipeline terminal */}
        <KineticLogStream
          logs={pipelineLogs}
          title="Watch 5 agents build your site in real time"
          subtitle="Each agent specializes -- from planning to security review"
        />
      </section>

      <SectionDivider />

      {/* ============================================
          SECTION 6: Why ArkhosAI
          ============================================ */}
      <section id="features" className="bg-[var(--void)] py-20 md:py-28 px-6" style={{ background: "radial-gradient(ellipse at 80% 50%, rgba(129,140,248,0.05) 0%, transparent 60%)" }}>
        <div className="mx-auto max-w-5xl">
          <motion.h2
            className="mb-4 text-center font-[Syne] tracking-[-0.02em] text-3xl font-bold text-[var(--text-primary)] md:text-4xl"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Why ArkhosAI
          </motion.h2>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-center mb-14">
            Built for teams that care about sovereignty, transparency, and ownership.
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {whyCards.map((card, i) => (
              <motion.div
                key={card.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                whileHover={{ scale: 1.02 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className={`rounded-2xl p-8 transition-colors ${card.hoverBorder}`}
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBg}`}>
                  {card.icon}
                </div>
                <h3 className="mt-4 font-[Syne] text-xl font-semibold text-[var(--text-primary)]">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)] font-[DM_Sans]">
                  {card.desc}
                </p>
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
        <div className="mx-auto max-w-5xl">
          <motion.h2
            className="mb-4 text-center font-[Syne] tracking-[-0.02em] text-3xl font-bold text-[var(--text-primary)] md:text-4xl"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Meet the agents
          </motion.h2>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-center mb-14">
            Five specialized AI agents, each with a distinct role in building your website.
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {agents.map((agent, i) => (
              <motion.div
                key={agent.name}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={`flex flex-col items-center rounded-xl bg-[var(--deep)] p-5 text-center transition-all ${agent.hoverShadow} ${agent.hoverBorder}`}
                style={{ border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white"
                  style={{ background: agent.gradient }}
                >
                  {agent.initial}
                </div>
                <h3 className="mt-3 font-[Syne] text-base font-semibold text-[var(--text-primary)]">
                  {agent.name}
                </h3>
                <p className="mt-1 text-sm text-[var(--text-secondary)] font-[DM_Sans]">
                  {agent.desc}
                </p>
                <p className="mt-2 font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                  {agent.model}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ============================================
          SECTION 8: Comparison Table
          ============================================ */}
      <section className="bg-[var(--void)] py-20 md:py-28 px-6">
        <div className="mx-auto max-w-4xl">
          <motion.h2
            className="mb-4 text-center font-[Syne] tracking-[-0.02em] text-3xl font-bold text-[var(--text-primary)] md:text-4xl"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            How we compare
          </motion.h2>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-center mb-14">
            See how ArkhosAI stacks up against US-hosted alternatives.
          </p>
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
                <tr style={{ background: "var(--surface, var(--deep))" }}>
                  <th className="px-5 py-4 text-left font-medium text-[var(--text-secondary)]" />
                  <th className="px-4 py-4 text-center font-bold text-[#FF6B35]">
                    ArkhosAI
                  </th>
                  <th className="px-4 py-4 text-center font-medium text-[var(--text-secondary)]">
                    Lovable
                  </th>
                  <th className="px-4 py-4 text-center font-medium text-[var(--text-secondary)]">
                    Bolt
                  </th>
                  <th className="px-4 py-4 text-center font-medium text-[var(--text-secondary)]">
                    v0
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={
                      i % 2 === 0 ? "bg-[var(--deep)]/30" : "bg-transparent"
                    }
                    style={{
                      borderTop: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <td className="px-5 py-3.5 font-medium text-[var(--text-primary)]">
                      {row.feature}
                    </td>
                    <td className="px-4 py-3.5 text-center font-semibold text-[#FF6B35]">
                      {row.arkhos.text}{" "}
                      <StatusIcon status={row.arkhos.status} />
                    </td>
                    <td className="px-4 py-3.5 text-center text-[var(--text-secondary)]">
                      {row.lovable.text}{" "}
                      <StatusIcon status={row.lovable.status} />
                    </td>
                    <td className="px-4 py-3.5 text-center text-[var(--text-secondary)]">
                      {row.bolt.text}{" "}
                      <StatusIcon status={row.bolt.status} />
                    </td>
                    <td className="px-4 py-3.5 text-center text-[var(--text-secondary)]">
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
