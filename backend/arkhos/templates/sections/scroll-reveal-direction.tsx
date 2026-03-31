"use client";

import { cn } from "@/lib/utils";
import { motion, type Variant } from "framer-motion";
import React, { forwardRef } from "react";

type Direction = "up" | "down" | "left" | "right";

const generateVariants = (
  direction: Direction
): { hidden: Variant; visible: Variant } => {
  const axis = direction === "left" || direction === "right" ? "x" : "y";
  const value = direction === "right" || direction === "down" ? 100 : -100;

  return {
    hidden: { filter: "blur(10px)", opacity: 0, [axis]: value },
    visible: {
      filter: "blur(0px)",
      opacity: 1,
      [axis]: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };
};

const defaultViewport = { amount: 0.3, margin: "0px 0px -200px 0px" };

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  variants?: {
    hidden?: Variant;
    visible?: Variant;
  };
  viewport?: {
    amount?: number;
    margin?: string;
    once?: boolean;
  };
  delay?: number;
  direction?: Direction;
}

const ScrollReveal = forwardRef<HTMLDivElement, ScrollRevealProps>(
  (
    {
      children,
      className,
      variants,
      viewport = defaultViewport,
      delay = 0,
      direction = "down",
      ...rest
    },
    ref
  ) => {
    const baseVariants = variants || generateVariants(direction);
    const modifiedVariants = {
      hidden: baseVariants.hidden,
      visible: {
        ...baseVariants.visible,
        transition: {
          ...(baseVariants.visible as { transition?: Record<string, unknown> })
            .transition,
          delay,
        },
      },
    };

    return (
      <motion.div
        ref={ref}
        whileInView="visible"
        initial="hidden"
        variants={modifiedVariants}
        viewport={viewport}
        className={cn(className)}
        {...rest}
      >
        {children}
      </motion.div>
    );
  }
);

ScrollReveal.displayName = "ScrollReveal";

export default ScrollReveal;
