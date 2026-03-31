import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "arkhos_cookie_consent";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setShow(true);
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
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
              <a
                href="/legal/cookies"
                className="text-[#DCE9F5] underline hover:text-white transition-colors"
              >
                Learn more
              </a>
            </p>
            <button
              onClick={accept}
              className="shrink-0 rounded-lg bg-[#FF6B35] px-5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#FF6B35]/90 hover:scale-[1.02]"
            >
              Accept
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
