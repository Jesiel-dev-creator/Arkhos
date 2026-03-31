"use client";

import { useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from "framer-motion";
import { cn } from "@/lib/utils";

interface ScrollProgressProps {
  className?: string;
  variant?: "default" | "rainbow" | "ocean" | "sunset" | "fire" | "ice" | "solid";
  size?: "xs" | "sm" | "default" | "lg" | "xl";
  position?: "top" | "bottom";
  showPercentage?: boolean;
  percentagePosition?: "left" | "right" | "center";
  springConfig?: {
    stiffness?: number;
    damping?: number;
    restDelta?: number;
  };
}

const variantClasses: Record<string, string> = {
  default: "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500",
  rainbow:
    "bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500",
  ocean: "bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-600",
  sunset: "bg-gradient-to-r from-orange-400 via-red-500 to-pink-500",
  fire: "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600",
  ice: "bg-gradient-to-r from-blue-200 via-cyan-300 to-blue-400",
  solid: "bg-blue-500",
};

const sizeClasses: Record<string, string> = {
  xs: "h-0.5",
  sm: "h-1",
  default: "h-1.5",
  lg: "h-2",
  xl: "h-3",
};

export default function ScrollProgress({
  className,
  variant = "default",
  size = "default",
  position = "top",
  showPercentage = false,
  percentagePosition = "right",
  springConfig = {
    stiffness: 200,
    damping: 50,
    restDelta: 0.001,
  },
}: ScrollProgressProps) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, springConfig);

  const [percentage, setPercentage] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setPercentage(Math.round(latest * 100));
  });

  const positionClass =
    position === "top" ? "inset-x-0 top-0" : "inset-x-0 bottom-0";

  const progressBarClasses = cn(
    "fixed z-30 origin-left",
    positionClass,
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  const percentageClasses = cn(
    "fixed z-40 text-xs font-medium bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-2 py-1 rounded",
    position === "top" ? "top-2" : "bottom-2",
    percentagePosition === "left" && "left-4",
    percentagePosition === "right" && "right-4",
    percentagePosition === "center" && "left-1/2 -translate-x-1/2"
  );

  return (
    <>
      <motion.div
        className={progressBarClasses}
        style={{ scaleX }}
      />
      {showPercentage && (
        <motion.div
          className={percentageClasses}
          style={{ opacity: scrollYProgress }}
        >
          <motion.span>{percentage}%</motion.span>
        </motion.div>
      )}
    </>
  );
}
