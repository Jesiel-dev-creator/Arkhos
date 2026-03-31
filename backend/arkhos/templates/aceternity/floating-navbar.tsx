"use client";

import React, { useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { cn } from "@/lib/utils";

export const FloatingNav = ({
  navItems,
  className,
}: {
  navItems: {
    name: string;
    link: string;
    icon?: React.ReactNode;
  }[];
  className?: string;
}) => {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    if (typeof current === "number") {
      const direction = current - (scrollYProgress.getPrevious() ?? 0);
      if (scrollYProgress.get() < 0.05) {
        setVisible(false);
      } else {
        setVisible(direction < 0);
      }
    }
  });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 1, y: -100 }}
        animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "flex max-w-fit fixed top-10 inset-x-0 mx-auto z-[5000] items-center justify-center",
          className
        )}
      >
        <div className="flex items-center justify-center gap-2 rounded-full border border-border bg-background/80 px-2 py-1.5 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-1">
            {navItems.map((navItem, idx) => (
              <a
                key={`link-${idx}`}
                href={navItem.link}
                className="relative flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <span className="block sm:hidden">{navItem.icon}</span>
                <span className="hidden sm:block">{navItem.name}</span>
              </a>
            ))}
          </div>
          <div className="h-5 w-px bg-border" />
          <button className="relative rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg">
            <span>Login</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FloatingNav;
