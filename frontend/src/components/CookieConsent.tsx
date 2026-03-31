import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, BarChart3 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const STORAGE_KEY = "arkhos_cookie_consent";

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setShow(true);
  }, []);

  const save = (level: string) => {
    localStorage.setItem(STORAGE_KEY, level);
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto w-full max-w-lg rounded-[20px] overflow-hidden"
              style={{
                background: "rgba(13,27,42,0.92)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: "1px solid var(--border)",
                boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
              }}
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent pointer-events-none rounded-[20px]" />

              <div className="relative p-7">
                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                       style={{ background: "rgba(0,212,238,0.1)", border: "1px solid rgba(0,212,238,0.2)" }}>
                    <Shield size={22} style={{ color: "var(--cyan)" }} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold mb-1.5" style={{ color: "var(--frost)", fontFamily: "var(--font-display)" }}>
                      Your Privacy Matters
                    </h2>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>
                      We use cookies to keep ArkhosAI running. Choose what you're comfortable with.
                    </p>
                  </div>
                </div>

                {/* Cookie categories */}
                <div className="space-y-2.5 mb-7">
                  {/* Essential — always on */}
                  <motion.div
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="flex items-center justify-between px-4 py-3.5 rounded-xl"
                    style={{ background: "rgba(13,27,42,0.5)", border: "1px solid var(--border)" }}
                  >
                    <div className="flex items-start gap-3">
                      <Shield size={16} className="mt-0.5" style={{ color: "var(--muted)" }} />
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-semibold" style={{ color: "var(--frost)" }}>Essential</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full"
                                style={{ background: "rgba(0,212,238,0.12)", color: "var(--cyan)", border: "1px solid rgba(0,212,238,0.2)" }}>
                            Required
                          </span>
                        </div>
                        <p className="text-[12px] leading-snug" style={{ color: "var(--muted)" }}>
                          Session, preferences. Cannot be disabled.
                        </p>
                      </div>
                    </div>
                    <Switch checked disabled className="data-[state=checked]:bg-[var(--cyan)]" />
                  </motion.div>

                  {/* Analytics — toggleable */}
                  <motion.div
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                    className="flex items-center justify-between px-4 py-3.5 rounded-xl"
                    style={{ background: "rgba(13,27,42,0.5)", border: "1px solid var(--border)" }}
                  >
                    <div className="flex items-start gap-3">
                      <BarChart3 size={16} className="mt-0.5" style={{ color: "var(--muted)" }} />
                      <div>
                        <span className="text-sm font-semibold block mb-0.5" style={{ color: "var(--frost)" }}>
                          Analytics
                        </span>
                        <p className="text-[12px] leading-snug" style={{ color: "var(--muted)" }}>
                          EU-hosted (Plausible). No tracking. No IP storage.
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={analytics}
                      onCheckedChange={setAnalytics}
                      className="data-[state=checked]:bg-[var(--cyan)]"
                    />
                  </motion.div>
                </div>

                {/* Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="flex gap-3"
                >
                  <button
                    onClick={() => save(analytics ? "all" : "essential")}
                    className="flex-1 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                    style={{ color: "var(--frost)", border: "1px solid var(--border)", background: "rgba(255,255,255,0.03)" }}
                  >
                    Save Preferences
                  </button>
                  <button
                    onClick={() => save("all")}
                    className="flex-1 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02]"
                    style={{ background: "linear-gradient(135deg, var(--ember), #FF8C5A)", boxShadow: "0 0 20px rgba(255,107,53,0.25)" }}
                  >
                    Accept All
                  </button>
                </motion.div>

                {/* Privacy link */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                  className="text-center text-[11px] mt-4"
                  style={{ color: "var(--muted)" }}
                >
                  <Link to="/legal/privacy" className="underline" style={{ color: "var(--frost)" }}>
                    Privacy Policy
                  </Link>
                  {" · "}
                  <Link to="/legal/cookies" className="underline" style={{ color: "var(--frost)" }}>
                    Cookie Policy
                  </Link>
                </motion.p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
