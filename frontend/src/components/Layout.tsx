import { useState, useEffect, lazy, Suspense } from "react";
import { NavLink, Link, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Globe } from "lucide-react";
import Logo from "./Logo";

const CookieConsent = lazy(() => import("./CookieConsent"));

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/generate", label: "Generate" },
  { to: "/gallery", label: "Gallery" },
  { to: "/pricing", label: "Pricing" },
];

const footerProduct = [
  { to: "/generate", label: "Generator" },
  { to: "/gallery", label: "Gallery" },
  { to: "/pricing", label: "Pricing" },
  { to: "/changelog", label: "Changelog" },
  { to: "/roadmap", label: "Roadmap" },
];

const footerLegal = [
  { to: "/legal/privacy", label: "Privacy" },
  { to: "/legal/terms", label: "Terms" },
  { to: "/legal/cookies", label: "Cookies" },
  { to: "/legal/imprint", label: "Imprint" },
];

const footerFadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" },
  }),
};

function FooterLinkCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-wider mb-1"
            style={{ color: "var(--frost)", fontFamily: "var(--font-body)" }}>
        {title}
      </span>
      {links.map((l) => (
        <Link
          key={l.to}
          to={l.to}
          className="text-xs no-underline transition-colors duration-200 hover:text-[var(--frost)]"
          style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
        >
          {l.label}
        </Link>
      ))}
    </div>
  );
}

export default function Layout() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      {/* ── Navbar ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-4"
        style={{
          paddingTop: isScrolled ? "0.5rem" : "0.75rem",
          paddingBottom: isScrolled ? "0.5rem" : "0.75rem",
          transition: "padding 0.3s ease",
        }}
      >
        <div
          className="relative flex w-full max-w-5xl items-center justify-between rounded-full px-5 py-2.5"
          style={{
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            backgroundColor: isScrolled ? "rgba(13, 27, 42, 0.9)" : "rgba(13, 27, 42, 0.4)",
            border: `1px solid ${isScrolled ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.08)"}`,
            boxShadow: "0 0 0 1px rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.3)",
            transition: "background-color 0.3s, border-color 0.3s",
          }}
        >
          <div className="pointer-events-none absolute inset-0 rounded-full"
               style={{ background: "linear-gradient(to right, rgba(255,255,255,0.05), transparent)" }} />

          <NavLink to="/" className="relative z-10 no-underline">
            <Logo />
          </NavLink>

          <div className="relative z-10 flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 no-underline ${
                    isActive
                      ? "bg-[rgba(255,107,53,0.12)] text-[var(--ember)]"
                      : "text-[var(--muted)] hover:text-[var(--frost)]"
                  }`
                }
                style={{ fontFamily: "var(--font-body)" }}
              >
                {link.label}
              </NavLink>
            ))}
            <div className="mx-2 h-4 w-px" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
            <span className="rounded-full px-2.5 py-1 flex items-center gap-1"
                  style={{ fontFamily: "var(--font-body)", color: "var(--muted)", border: "1px solid var(--border)" }}>
              <Globe size={12} />
              <span className="text-[11px] font-medium">EU</span>
            </span>
          </div>
        </div>
      </nav>

      {/* ── Main ── */}
      <main className="flex-1 pt-20">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── Footer ── */}
      <footer style={{ backgroundColor: "var(--void)", borderTop: "1px solid var(--border)" }}>
        <motion.div
          className="mx-auto grid max-w-5xl grid-cols-2 md:grid-cols-4 gap-8 px-6 py-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {/* Brand */}
          <motion.div custom={0} variants={footerFadeUp}>
            <Logo />
            <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
              EU-sovereign AI
              <br />
              website generator
            </p>
            <p className="mt-3 text-[10px]" style={{ color: "var(--muted)", fontFamily: "var(--font-code)" }}>
              Powered by Tramontane
              <br />
              Mistral · Scaleway
            </p>
          </motion.div>

          {/* Product */}
          <motion.div custom={1} variants={footerFadeUp}>
            <FooterLinkCol title="Product" links={footerProduct} />
          </motion.div>

          {/* Legal */}
          <motion.div custom={2} variants={footerFadeUp}>
            <FooterLinkCol title="Legal" links={footerLegal} />
          </motion.div>

          {/* Connect */}
          <motion.div custom={3} variants={footerFadeUp}>
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider mb-1"
                    style={{ color: "var(--frost)", fontFamily: "var(--font-body)" }}>
                Connect
              </span>
              <a href="https://github.com/Jesiel-dev-creator/Arkhos" target="_blank" rel="noopener noreferrer"
                 className="text-xs no-underline transition-colors duration-200 hover:text-[var(--frost)]"
                 style={{ color: "var(--muted)" }}>
                GitHub
              </a>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom bar */}
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 pb-5"
             style={{ borderTop: "1px solid var(--border)" }}>
          <p className="pt-4 text-[11px]" style={{ color: "var(--muted)" }}>
            &copy; 2026 Bleucommerce SAS &middot; Paris, France
          </p>
          <p className="pt-4 text-[11px]" style={{ color: "var(--ember)", fontFamily: "var(--font-code)" }}>
            &euro;0.004 avg per site
          </p>
        </div>
      </footer>

      {/* ── Cookie Consent ── */}
      <Suspense fallback={null}>
        <CookieConsent />
      </Suspense>
    </div>
  );
}
