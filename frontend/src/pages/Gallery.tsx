import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AppFooter from "@/components/AppFooter";
import { ShiningText } from "@/components/ui/shining-text";
import ImageGallery from "@/components/ui/image-gallery";
import { SocialIcons } from "@/components/ui/social-icons";
import GradientButton from "@/components/ui/gradient-button";

interface GalleryItem {
  id: string;
  prompt: string;
  cost: string;
  category: string;
  createdAt: string;
}

const DEMO_ITEMS: GalleryItem[] = [
  { id: "1", prompt: "A French bakery in Paris with warm earth tones", cost: "0.004", category: "bakery", createdAt: "2026-03-31" },
  { id: "2", prompt: "Dark SaaS landing for a project management tool", cost: "0.005", category: "saas", createdAt: "2026-03-31" },
  { id: "3", prompt: "Minimal developer portfolio with dark mode", cost: "0.003", category: "portfolio", createdAt: "2026-03-30" },
  { id: "4", prompt: "Italian restaurant in Bordeaux with reservations", cost: "0.004", category: "restaurant", createdAt: "2026-03-30" },
  { id: "5", prompt: "Creative agency with case studies and bold design", cost: "0.005", category: "agency", createdAt: "2026-03-29" },
  { id: "6", prompt: "B2B SaaS with enterprise pricing and social proof", cost: "0.006", category: "saas", createdAt: "2026-03-29" },
];

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Bakeries", value: "bakery" },
  { label: "SaaS", value: "saas" },
  { label: "Portfolio", value: "portfolio" },
  { label: "Restaurant", value: "restaurant" },
  { label: "Agency", value: "agency" },
];

/* ======= Navbar links ======= */
const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Gallery", href: "/gallery" },
  { label: "Open Source", href: "https://github.com/ArkhosAI/arkhos", external: true },
];

/* ======= Animation variants ======= */
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const gridVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

export default function Gallery() {
  const navigate = useNavigate();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    fetch("/api/gallery")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setItems(data);
        } else {
          setItems(DEMO_ITEMS);
        }
        setLoading(false);
      })
      .catch(() => {
        setItems(DEMO_ITEMS);
        setLoading(false);
      });
  }, []);

  const filtered = activeFilter === "all"
    ? items
    : items.filter((item) => item.category === activeFilter);

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
        <GradientButton onClick={() => navigate("/generate")} width="180px" height="40px">
          Start building free
        </GradientButton>
      </nav>

      {/* ============================================
          SECTION 2: Header
          ============================================ */}
      <div className="text-center py-20">
        <h1 className="font-[Syne] text-4xl md:text-5xl font-bold text-[#DCE9F5]">
          Built with ArkhosAI
        </h1>
        <div className="mt-4 flex justify-center">
          <ShiningText text="Real websites, generated by AI in under 2 minutes" />
        </div>
      </div>

      {/* ============================================
          SECTION 3: Featured Gallery
          ============================================ */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-[Syne] text-2xl md:text-3xl font-bold text-[#DCE9F5] text-center mb-10">
            Featured Generations
          </h2>
          <ImageGallery />
        </div>
      </section>

      {/* ============================================
          SECTION 4: Filter Pills
          ============================================ */}
      <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center gap-2 mb-10 justify-center">
        {FILTERS.map((filter) => (
          <motion.button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={
              activeFilter === filter.value
                ? "bg-[#FF6B35] text-white rounded-full px-4 py-1.5 text-sm font-[DM_Sans] transition-colors"
                : "bg-transparent text-[#DCE9F5]/50 border border-white/10 rounded-full px-4 py-1.5 text-sm font-[DM_Sans] hover:border-white/20 transition-colors"
            }
          >
            {filter.label}
          </motion.button>
        ))}
      </div>

      {/* ============================================
          SECTION 5: Gallery Grid
          ============================================ */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-white/5 bg-[#0D1B2A] overflow-hidden">
                <div className="w-full h-48 bg-[#020408] animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 w-3/4 rounded bg-white/5 animate-pulse" />
                  <div className="h-3 w-1/2 rounded bg-white/5 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          /* ============================================
             SECTION 6: Empty State
             ============================================ */
          <div className="text-center py-20">
            <p className="text-[#7B8FA3] text-lg font-[DM_Sans]">
              No {activeFilter} sites yet
            </p>
            <div className="mt-4">
              <GradientButton onClick={() => navigate("/generate")} width="220px" height="42px">
                Be the first to build one
              </GradientButton>
            </div>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={gridVariants}
          >
            {filtered.map((item) => (
              <motion.div
                key={item.id}
                variants={cardVariants}
                className="group rounded-xl border border-white/5 bg-[#0D1B2A] overflow-hidden hover:border-[#FF6B35]/30 transition-all duration-300"
              >
                {/* Gradient preview placeholder */}
                <div className="relative w-full h-48 overflow-hidden bg-[#020408]">
                  <div className="w-full h-full bg-gradient-to-br from-[#0D1B2A] to-[#020408]" />
                </div>
                {/* Card content */}
                <div className="p-4 space-y-3">
                  <p className="text-sm text-[#DCE9F5] font-[DM_Sans] line-clamp-2">
                    {item.prompt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#FF6B35]">
                      &euro;{item.cost}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full border border-[#00D4EE]/20 text-[#00D4EE]">
                      {item.category}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/generate?prompt=${encodeURIComponent(item.prompt)}`)}
                    className="w-full text-sm text-center py-2 rounded-lg border border-white/10 text-[#DCE9F5]/70 font-[DM_Sans] hover:bg-white/5 hover:text-[#DCE9F5] transition-colors"
                  >
                    Build something like this
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* ============================================
          SECTION 8: Social Icons
          ============================================ */}
      <section className="py-12 px-6">
        <div className="mx-auto flex max-w-5xl justify-center">
          <SocialIcons />
        </div>
      </section>

      {/* ============================================
          SECTION 9: Footer
          ============================================ */}
      <AppFooter />
    </div>
  );
}
