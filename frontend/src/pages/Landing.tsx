import { useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Zap, Sparkles, Download, Brain, Eye,
  Coins, Shield, GitBranch, BarChart3, MessageSquare, Globe,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";

/* ═══════ Interactive Dot Canvas (hero background) ═══════ */
interface Dot {
  x: number; y: number;
  targetOpacity: number; currentOpacity: number; opacitySpeed: number;
  baseRadius: number; currentRadius: number;
}

const DOT_SPACING = 30;
const BASE_OP_MIN = 0.12;
const BASE_OP_MAX = 0.22;
const BASE_R = 1.5;
const INTERACT_R = 180;
const INTERACT_R_SQ = INTERACT_R * INTERACT_R;
const OP_BOOST = 0.7;
const R_BOOST = 3;
const CELL = Math.max(50, Math.floor(INTERACT_R / 1.5));

function DotCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const dotsRef = useRef<Dot[]>([]);
  const gridRef = useRef<Record<string, number[]>>({});
  const sizeRef = useRef({ width: 0, height: 0 });
  const mouseRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });

  const createDots = useCallback(() => {
    const { width, height } = sizeRef.current;
    if (!width || !height) return;
    const dots: Dot[] = [];
    const grid: Record<string, number[]> = {};
    for (let i = 0; i < Math.ceil(width / DOT_SPACING); i++) {
      for (let j = 0; j < Math.ceil(height / DOT_SPACING); j++) {
        const x = i * DOT_SPACING + DOT_SPACING / 2;
        const y = j * DOT_SPACING + DOT_SPACING / 2;
        const key = `${Math.floor(x / CELL)}_${Math.floor(y / CELL)}`;
        if (!grid[key]) grid[key] = [];
        grid[key].push(dots.length);
        const op = Math.random() * (BASE_OP_MAX - BASE_OP_MIN) + BASE_OP_MIN;
        dots.push({ x, y, targetOpacity: op, currentOpacity: op, opacitySpeed: Math.random() * 0.004 + 0.002, baseRadius: BASE_R, currentRadius: BASE_R });
      }
    }
    dotsRef.current = dots;
    gridRef.current = grid;
  }, []);

  const handleResize = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const p = c.parentElement;
    const w = p ? p.clientWidth : window.innerWidth;
    const h = p ? p.clientHeight : window.innerHeight;
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; sizeRef.current = { width: w, height: h }; createDots(); }
  }, [createDots]);

  const handleMouse = useCallback((e: globalThis.MouseEvent) => {
    const c = canvasRef.current;
    if (!c) { mouseRef.current = { x: null, y: null }; return; }
    const r = c.getBoundingClientRect();
    mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
  }, []);

  useEffect(() => {
    handleResize();
    const tick = () => {
      const c = canvasRef.current; const ctx = c?.getContext("2d");
      const dots = dotsRef.current; const grid = gridRef.current;
      const { width, height } = sizeRef.current; const { x: mx, y: my } = mouseRef.current;
      if (!ctx || !dots.length || !width) { frameRef.current = requestAnimationFrame(tick); return; }
      ctx.clearRect(0, 0, width, height);
      const active = new Set<number>();
      if (mx !== null && my !== null) {
        const cx = Math.floor(mx / CELL); const cy = Math.floor(my / CELL);
        const sr = Math.ceil(INTERACT_R / CELL);
        for (let i = -sr; i <= sr; i++) for (let j = -sr; j <= sr; j++) { const k = `${cx + i}_${cy + j}`; if (grid[k]) grid[k].forEach(idx => active.add(idx)); }
      }
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        d.currentOpacity += d.opacitySpeed;
        if (d.currentOpacity >= d.targetOpacity || d.currentOpacity <= BASE_OP_MIN) { d.opacitySpeed = -d.opacitySpeed; d.currentOpacity = Math.max(BASE_OP_MIN, Math.min(d.currentOpacity, BASE_OP_MAX)); d.targetOpacity = Math.random() * (BASE_OP_MAX - BASE_OP_MIN) + BASE_OP_MIN; }
        let f = 0; d.currentRadius = d.baseRadius;
        if (mx !== null && my !== null && active.has(i)) { const dx = d.x - mx; const dy = d.y - my; const sq = dx * dx + dy * dy; if (sq < INTERACT_R_SQ) { f = 1 - Math.sqrt(sq) / INTERACT_R; f *= f; } }
        ctx.beginPath(); ctx.fillStyle = `rgba(255,107,53,${Math.min(1, d.currentOpacity + f * OP_BOOST).toFixed(3)})`; ctx.arc(d.x, d.y, d.baseRadius + f * R_BOOST, 0, Math.PI * 2); ctx.fill();
      }
      frameRef.current = requestAnimationFrame(tick);
    };
    const onLeave = () => { mouseRef.current = { x: null, y: null }; };
    window.addEventListener("mousemove", handleMouse, { passive: true });
    window.addEventListener("resize", handleResize);
    document.documentElement.addEventListener("mouseleave", onLeave);
    frameRef.current = requestAnimationFrame(tick);
    return () => { window.removeEventListener("resize", handleResize); window.removeEventListener("mousemove", handleMouse); document.documentElement.removeEventListener("mouseleave", onLeave); if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [handleResize, handleMouse]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-60" />;
}

/* ═══════ Page ═══════ */
const fadeUp: Variants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const FEATURES = [
  { icon: Coins, color: "#FF6B35", title: "€0.004 per site", desc: "500x cheaper than competitors. Full production HTML for less than a cent." },
  { icon: Shield, color: "#00D4EE", title: "EU Sovereign", desc: "Scaleway Paris + Mistral AI. Your data never leaves Europe. GDPR compliant." },
  { icon: GitBranch, color: "#22D68A", title: "Open Source", desc: "MIT license. Self-host on your own infrastructure. No vendor lock-in." },
  { icon: Brain, color: "#FF6B35", title: "4-Agent Pipeline", desc: "Planner → Designer → Builder → Reviewer. Each agent specialized." },
  { icon: BarChart3, color: "#00D4EE", title: "Cost Transparent", desc: "See exactly what each agent costs in real-time. No hidden fees, ever." },
  { icon: MessageSquare, color: "#22D68A", title: "Iterate Live", desc: "Chat to refine. Change colors, add sections, modify text — live." },
];

const TEMPLATES = [
  { name: "French Bakery", desc: "Warm, modern, menu + contact", accent: "#FFB020" },
  { name: "SaaS Landing", desc: "Dark, conversion-focused, pricing", accent: "#00D4EE" },
  { name: "Dev Portfolio", desc: "Minimal dark mode, projects grid", accent: "#DCE9F5" },
  { name: "Italian Restaurant", desc: "Earth tones, menu + reservations", accent: "#FF6B35" },
  { name: "Creative Agency", desc: "Bold, asymmetric, case studies", accent: "#E040FB" },
];

const COMPARISON = [
  { feature: "Cost per site", lovable: "~$0.50", bolt: "~$0.30", v0: "~$1.00", arkhos: "€0.004" },
  { feature: "EU data residency", lovable: "Optional", bolt: "No", v0: "No", arkhos: "Default" },
  { feature: "Self-hostable", lovable: "No", bolt: "No", v0: "No", arkhos: "Yes (MIT)" },
  { feature: "Cost transparency", lovable: "Hidden", bolt: "Hidden", v0: "Partial", arkhos: "Full" },
  { feature: "Open source", lovable: "No", bolt: "No", v0: "No", arkhos: "MIT" },
  { feature: "Training opt-out", lovable: "Yes", bolt: "Unknown", v0: "$100/mo", arkhos: "Free" },
];

export default function Landing() {
  /* Features use Framer Motion whileInView — no GSAP needed */

  return (
    <div className="relative overflow-hidden">

      {/* ═══ HERO ═══ */}
      <div className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden">
        <DotCanvas />
        <div className="absolute inset-0 z-[1] pointer-events-none"
             style={{ background: "radial-gradient(ellipse 80% 50% at 50% 40%, rgba(255,107,53,0.1), transparent 70%), radial-gradient(ellipse 60% 40% at 50% 60%, rgba(0,212,238,0.06), transparent 70%)" }} />

        <main className="relative z-10 flex flex-col items-center text-center px-4 py-20 max-w-5xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ duration: 0.6, delay: 0.2 }} className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                 style={{ background: "rgba(255,107,53,0.08)", border: "1px solid rgba(255,107,53,0.2)", backdropFilter: "blur(8px)", color: "var(--ember)" }}>
              <Sparkles size={14} />
              <span style={{ fontFamily: "var(--font-body)" }}>EU-Sovereign AI Technology</span>
            </div>
          </motion.div>

          <motion.h1 variants={fadeUp} initial="hidden" animate="visible" transition={{ duration: 0.6, delay: 0.4 }}
                      className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-[1.05] mb-6" style={{ color: "var(--frost)" }}>
            The EU Answer<br /><span className="text-gradient-ember">to Lovable</span>
          </motion.h1>

          <motion.p variants={fadeUp} initial="hidden" animate="visible" transition={{ duration: 0.6, delay: 0.6 }}
                     className="text-lg sm:text-xl max-w-3xl mx-auto mb-10 leading-relaxed" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>
            4 AI agents build your website live. €0.004 per site. EU sovereign. Open source.
          </motion.p>

          <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ duration: 0.6, delay: 0.8 }}
                       className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
              <Link to="/generate" className="group relative overflow-hidden inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white no-underline"
                    style={{ background: "linear-gradient(135deg, var(--ember), #FF8C5A)", boxShadow: "0 0 30px rgba(255,107,53,0.35)" }}>
                <span className="relative z-10 flex items-center gap-2">
                  <Zap size={18} />Start Building Free<ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--ember)] to-[#FF9966] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
              <a href="https://github.com/bleucommerce/arkhos" target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold no-underline hover:bg-white/5"
                 style={{ color: "var(--frost)", background: "rgba(255,255,255,0.03)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.08)" }}>
                View on GitHub
              </a>
            </motion.div>
          </motion.div>

          {/* Trust badges */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ duration: 0.6, delay: 1.0 }}
                       className="mt-10 flex flex-wrap items-center justify-center gap-3 text-xs" style={{ color: "var(--muted)" }}>
            {["🇫🇷 Built in France", "GDPR Compliant", "MIT License"].map((t) => (
              <span key={t} className="px-3 py-1 rounded-full" style={{ border: "1px solid var(--border)" }}>{t}</span>
            ))}
          </motion.div>
        </main>
      </div>

      {/* ═══ TRUST BAR — Powered By Logos ═══ */}
      <div className="py-12 px-6" style={{ background: "var(--void)" }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-[10px] uppercase tracking-wider mb-6"
             style={{ fontFamily: "var(--font-code)", color: "var(--muted)" }}>
            Powered by
          </p>
          <div className="flex items-center justify-center gap-10 md:gap-16 flex-wrap">
            <img src="/mistral-logo-color-white.png" alt="Mistral AI" className="h-8 opacity-60 hover:opacity-100 transition-opacity duration-300" />
            <img src="/Scaleway-Logomark-Purple.png" alt="Scaleway" className="h-8 opacity-60 hover:opacity-100 transition-opacity duration-300" />
            <img src="/Tramontane.png" alt="Tramontane" className="h-7 opacity-60 hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>
      </div>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="relative py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] uppercase tracking-wider mb-3" style={{ fontFamily: "var(--font-code)", color: "var(--muted)" }}>HOW IT WORKS</p>
            <h2 className="text-2xl sm:text-3xl font-[800]" style={{ fontFamily: "var(--font-display)", color: "var(--frost)" }}>Three steps. One cent.</h2>
          </div>
          <div className="relative">
            <div className="hidden md:block absolute top-1/2 left-[16.67%] right-[16.67%] h-px -translate-y-1/2 z-0" style={{ background: "rgba(255,107,53,0.15)" }} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative z-10">
              {[
                { num: "01", icon: Eye, title: "Describe", desc: "Type what you want in plain language — any industry, any language." },
                { num: "02", icon: Brain, title: "Watch", desc: "4 AI agents work in sequence, streaming live. See every step." },
                { num: "03", icon: Download, title: "Download", desc: "Get production-ready React HTML. One file. No dependencies." },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div key={s.num} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, delay: i * 0.15 }}
                    whileHover={{ y: -6 }}
                    className="group relative w-full rounded-2xl p-8 text-center cursor-default"
                    style={{ background: "rgba(13,27,42,0.6)", border: "1px solid var(--border)", backdropFilter: "blur(12px)" }}>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--ember)]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div className="text-4xl font-[800] mb-4" style={{ fontFamily: "var(--font-display)", background: "linear-gradient(135deg, #FF6B35, #FF9966)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.num}</div>
                    <div className="mx-auto mb-4 flex items-center justify-center w-12 h-12 rounded-xl" style={{ background: "rgba(255,107,53,0.08)", border: "1px solid rgba(255,107,53,0.15)" }}>
                      <Icon size={22} style={{ color: "var(--ember)" }} />
                    </div>
                    <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "var(--font-display)", color: "var(--frost)" }}>{s.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ fontFamily: "var(--font-body)", color: "var(--muted)" }}>{s.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES GRID (from Magic MCP) ═══ */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] uppercase tracking-wider mb-3" style={{ fontFamily: "var(--font-code)", color: "var(--muted)" }}>WHY ARKHOSAI</p>
            <h2 className="text-2xl sm:text-3xl font-[800]" style={{ fontFamily: "var(--font-display)", color: "var(--frost)" }}>Built different. Built in Europe.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, delay: i * 0.08 }}
                  whileHover={{ y: -4 }}
                  className="group relative overflow-hidden rounded-2xl p-7 cursor-default transition-all duration-300"
                  style={{ background: "rgba(13,27,42,0.5)", backdropFilter: "blur(12px)", border: "1px solid var(--border)" }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent pointer-events-none" />
                  <div className="relative z-10">
                    <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl mb-5 group-hover:scale-110 transition-transform duration-300"
                         style={{ background: `${f.color}15`, border: `1px solid ${f.color}25` }}>
                      <Icon size={20} style={{ color: f.color }} />
                    </div>
                    <h3 className="text-base font-semibold mb-2 transition-colors duration-300" style={{ color: "var(--frost)" }}>{f.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>{f.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ COMPARISON TABLE ═══ */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[10px] uppercase tracking-wider mb-3" style={{ fontFamily: "var(--font-code)", color: "var(--muted)" }}>THE COMPETITION</p>
            <h2 className="text-2xl sm:text-3xl font-[800]" style={{ fontFamily: "var(--font-display)", color: "var(--frost)" }}>How we compare</h2>
          </div>
          <div className="overflow-x-auto rounded-2xl" style={{ border: "1px solid var(--border)" }}>
            <table className="w-full text-sm" style={{ fontFamily: "var(--font-body)" }}>
              <thead>
                <tr style={{ background: "rgba(13,27,42,0.8)" }}>
                  <th className="text-left px-5 py-4 font-medium" style={{ color: "var(--muted)" }}>Feature</th>
                  <th className="text-center px-4 py-4 font-medium" style={{ color: "var(--muted)" }}>Lovable</th>
                  <th className="text-center px-4 py-4 font-medium" style={{ color: "var(--muted)" }}>Bolt.new</th>
                  <th className="text-center px-4 py-4 font-medium" style={{ color: "var(--muted)" }}>v0</th>
                  <th className="text-center px-4 py-4 font-semibold" style={{ color: "var(--ember)" }}>ArkhosAI</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={i} style={{ borderTop: "1px solid var(--border)", background: i % 2 === 0 ? "rgba(13,27,42,0.3)" : "transparent" }}>
                    <td className="px-5 py-3.5 font-medium" style={{ color: "var(--frost)" }}>{row.feature}</td>
                    <td className="text-center px-4 py-3.5" style={{ color: "var(--muted)" }}>{row.lovable}</td>
                    <td className="text-center px-4 py-3.5" style={{ color: "var(--muted)" }}>{row.bolt}</td>
                    <td className="text-center px-4 py-3.5" style={{ color: "var(--muted)" }}>{row.v0}</td>
                    <td className="text-center px-4 py-3.5 font-semibold" style={{ color: "var(--ember)" }}>{row.arkhos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══ TEMPLATES ═══ */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[10px] uppercase tracking-wider mb-3" style={{ fontFamily: "var(--font-code)", color: "var(--muted)" }}>TEMPLATES</p>
            <h2 className="text-2xl sm:text-3xl font-[800]" style={{ fontFamily: "var(--font-display)", color: "var(--frost)" }}>Start from a template</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {TEMPLATES.map((t) => (
              <Link key={t.name} to="/generate"
                className="group rounded-xl p-5 no-underline transition-all duration-300 hover:-translate-y-1"
                style={{ background: "rgba(13,27,42,0.5)", border: "1px solid var(--border)", backdropFilter: "blur(8px)" }}>
                <div className="w-3 h-3 rounded-full mb-3 group-hover:scale-125 transition-transform" style={{ backgroundColor: t.accent }} />
                <p className="text-sm font-medium mb-1" style={{ color: "var(--frost)" }}>{t.name}</p>
                <p className="text-[11px] leading-snug" style={{ color: "var(--muted)" }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ OPEN SOURCE CTA ═══ */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center rounded-2xl p-12"
             style={{ background: "rgba(13,27,42,0.5)", border: "1px solid var(--border)", backdropFilter: "blur(12px)" }}>
          <h2 className="text-2xl sm:text-3xl font-[800] mb-3" style={{ fontFamily: "var(--font-display)", color: "var(--frost)" }}>
            Fork it. Self-host it. Make it yours.
          </h2>
          <p className="text-sm mb-8 max-w-lg mx-auto" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>
            ArkhosAI is MIT licensed. Run it on your own infrastructure with your own Mistral API key. No limits. No fees.
          </p>
          <a href="https://github.com/bleucommerce/arkhos" target="_blank" rel="noopener noreferrer"
             className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium no-underline transition-all hover:scale-[1.02]"
             style={{ color: "var(--frost)", border: "1px solid var(--border)", background: "rgba(255,255,255,0.03)" }}>
            <Globe size={16} /> View on GitHub
          </a>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-[800] mb-4" style={{ fontFamily: "var(--font-display)", color: "var(--frost)" }}>
            Start building <span className="text-gradient-ember">for free</span>
          </h2>
          <p className="text-sm mb-8" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>
            No account required. 3 generations per day. No credit card.
          </p>
          <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} className="inline-block">
            <Link to="/generate"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white no-underline"
              style={{ background: "linear-gradient(135deg, var(--ember), #FF8C5A)", boxShadow: "0 0 30px rgba(255,107,53,0.3)" }}>
              <Zap size={18} /> Start Building Free <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
