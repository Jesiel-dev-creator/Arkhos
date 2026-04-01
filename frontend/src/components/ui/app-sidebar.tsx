import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Zap,
  Image,
  CreditCard,
  ExternalLink,
  Settings,
  ChevronDown,
  PanelLeft,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

/* ── Template data for sidebar ── */
const SIDEBAR_TEMPLATES = [
  { name: "French Bakery", accent: "#FFB020" },
  { name: "Italian Restaurant", accent: "#FF6B35" },
  { name: "Coffee Shop", accent: "#8B6914" },
  { name: "SaaS Landing", accent: "#00D4EE" },
  { name: "B2B SaaS", accent: "#6366F1" },
  { name: "Startup Landing", accent: "#F97316" },
  { name: "Dev Portfolio", accent: "#DCE9F5" },
  { name: "Photography", accent: "#A78BFA" },
  { name: "Creative Agency", accent: "#E040FB" },
  { name: "Consultant", accent: "#0EA5E9" },
  { name: "Law Firm", accent: "#1E3A5F" },
  { name: "Fitness Studio", accent: "#EF4444" },
  { name: "Wedding Venue", accent: "#D4A574" },
  { name: "Boutique Hotel", accent: "#B8860B" },
  { name: "Online Store", accent: "#10B981" },
];

/* ── Animation variants ── */
const sidebarVariants = {
  expanded: { width: 220 },
  collapsed: { width: 49 },
};

const itemVariants = {
  expanded: { opacity: 1, x: 0 },
  collapsed: { opacity: 0, x: -8 },
};

/* ── Nav item ── */
function NavItem({
  href,
  icon: Icon,
  label,
  isActive,
  isCollapsed,
  external,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`
        flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors duration-150
        ${isActive ? "bg-[#FF6B35]/10 text-[#FF6B35]" : "text-[#7B8FA3] hover:bg-white/5 hover:text-[#DCE9F5]"}
      `}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {!isCollapsed && (
        <motion.span variants={itemVariants} className="truncate">
          {label}
        </motion.span>
      )}
    </a>
  );
}

/* ── Main sidebar ── */
export function SessionNavBar() {
  const { pathname } = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [templatesOpen, setTemplatesOpen] = useState(false);

  return (
    <motion.nav
      initial={false}
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => {
        setIsCollapsed(true);
        setTemplatesOpen(false);
      }}
      className="fixed left-0 top-0 h-screen z-40 flex flex-col bg-[#020408] border-r border-[#1C2E42] overflow-hidden"
    >
      {/* Brand header */}
      <div className="flex h-[54px] w-full shrink-0 border-b border-[#1C2E42] p-2 items-center">
        <a href="/" className="flex items-center gap-2 px-2">
          <div className="w-6 h-6 rounded-md bg-[#FF6B35] flex items-center justify-center">
            <span className="text-white font-bold text-xs font-[Syne]">A</span>
          </div>
          <motion.span variants={itemVariants}>
            {!isCollapsed && (
              <span className="text-sm font-semibold text-[#DCE9F5] font-[Syne]">ArkhosAI</span>
            )}
          </motion.span>
        </a>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-2">
        <div className="flex flex-col gap-0.5 px-2">
          {/* Top nav */}
          <NavItem href="/" icon={LayoutDashboard} label="Home" isActive={pathname === "/"} isCollapsed={isCollapsed} />
          <NavItem href="/generate" icon={Zap} label="Generator" isActive={pathname === "/generate"} isCollapsed={isCollapsed} />
          <NavItem href="/gallery" icon={Image} label="Gallery" isActive={pathname === "/gallery"} isCollapsed={isCollapsed} />
          <NavItem href="/#pricing" icon={CreditCard} label="Pricing" isActive={false} isCollapsed={isCollapsed} />

          {/* Separator */}
          <div className="h-px bg-[#1C2E42] my-2" />

          {/* Templates section */}
          <button
            onClick={() => !isCollapsed && setTemplatesOpen((v) => !v)}
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm text-[#7B8FA3] hover:bg-white/5 hover:text-[#DCE9F5] transition-colors duration-150 w-full"
          >
            <ChevronDown
              className={`w-4 h-4 shrink-0 transition-transform duration-200 ${templatesOpen ? "rotate-0" : "-rotate-90"}`}
            />
            {!isCollapsed && (
              <motion.span variants={itemVariants} className="truncate text-[10px] uppercase tracking-wider font-medium">
                Templates
              </motion.span>
            )}
          </button>

          <AnimatePresence initial={false}>
            {templatesOpen && !isCollapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-0.5 pl-2 py-1">
                  {SIDEBAR_TEMPLATES.map((t) => (
                    <a
                      key={t.name}
                      href={`/generate?template=${encodeURIComponent(t.name)}`}
                      className="flex items-center gap-2 px-2 py-1 rounded-md text-xs text-[#7B8FA3] hover:bg-white/5 hover:text-[#DCE9F5] transition-colors duration-150"
                    >
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: t.accent }}
                      />
                      <span className="truncate">{t.name}</span>
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Separator */}
          <div className="h-px bg-[#1C2E42] my-2" />

          {/* Bottom nav */}
          <NavItem
            href="https://github.com/Jesiel-dev-creator/Arkhos"
            icon={ExternalLink}
            label="GitHub"
            isActive={false}
            isCollapsed={isCollapsed}
            external
          />
          <NavItem href="#" icon={Settings} label="Settings" isActive={false} isCollapsed={isCollapsed} />
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-[#1C2E42] p-2">
        {!isCollapsed ? (
          <motion.div
            variants={itemVariants}
            className="flex flex-col gap-0.5 px-2 py-1"
          >
            <span className="text-[10px] text-[#7B8FA3]">3 free remaining</span>
            <span className="text-[10px] text-[#FF6B35] font-mono">{"\u20AC"}0.004 avg</span>
          </motion.div>
        ) : (
          <button
            onClick={() => setIsCollapsed(false)}
            className="flex items-center justify-center w-full py-1 text-[#7B8FA3] hover:text-[#DCE9F5] transition-colors"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.nav>
  );
}
