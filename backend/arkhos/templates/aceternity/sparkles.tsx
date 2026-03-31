"use client";
import React, { useId, useMemo } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Sparkles effect using Framer Motion.
 * Rewritten from the original tsParticles version to avoid
 * @tsparticles/react, @tsparticles/engine, and @tsparticles/slim dependencies.
 * Uses randomly positioned absolute divs with opacity/scale animation.
 */

type SparklesProps = {
  id?: string;
  className?: string;
  background?: string;
  particleSize?: number;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleColor?: string;
  particleDensity?: number;
};

interface Sparkle {
  id: string;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

function generateSparkles(
  count: number,
  minSize: number,
  maxSize: number,
  speed: number,
): Sparkle[] {
  const sparkles: Sparkle[] = [];
  for (let i = 0; i < count; i++) {
    sparkles.push({
      id: `sparkle-${i}`,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: minSize + Math.random() * (maxSize - minSize),
      delay: Math.random() * (10 / speed),
      duration: (Math.random() * 3 + 1) / (speed / 4),
    });
  }
  return sparkles;
}

export const SparklesCore = ({
  id,
  className,
  background,
  minSize = 1,
  maxSize = 3,
  speed = 4,
  particleColor = "#ffffff",
  particleDensity = 120,
}: SparklesProps) => {
  const generatedId = useId();
  const sparkleId = id || generatedId;

  const sparkles = useMemo(
    () => generateSparkles(particleDensity, minSize, maxSize, speed),
    [particleDensity, minSize, maxSize, speed],
  );

  return (
    <motion.div
      id={sparkleId}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className={cn("relative h-full w-full overflow-hidden", className)}
      style={{
        background: background || "transparent",
      }}
    >
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute rounded-full"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: sparkle.size,
            height: sparkle.size,
            backgroundColor: particleColor,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0.5, 0],
            scale: [0, 1, 0.8, 0],
          }}
          transition={{
            duration: sparkle.duration,
            delay: sparkle.delay,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
        />
      ))}
    </motion.div>
  );
};

export default SparklesCore;
