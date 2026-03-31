"use client";

import React, { useState, useRef } from "react";
import {
  motion,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";

export const AnimatedTooltip = ({
  items,
}: {
  items: {
    id: number;
    name: string;
    designation: string;
    image: string;
  }[];
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const springConfig = { stiffness: 100, damping: 15 };
  const x = useMotionValue(0);
  const animationFrameRef = useRef<number | null>(null);

  const rotate = useSpring(
    useTransform(x, [-100, 100], [-45, 45]),
    springConfig
  );
  const translateX = useSpring(
    useTransform(x, [-100, 100], [-50, 50]),
    springConfig
  );

  const handleMouseMove = (event: React.MouseEvent<HTMLImageElement>) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(() => {
      const halfWidth = (event.target as HTMLElement).offsetWidth / 2;
      x.set(event.nativeEvent.offsetX - halfWidth);
    });
  };

  return (
    <>
      {items.map((item) => (
        <div
          className="group relative -mr-4"
          key={item.name}
          onMouseEnter={() => setHoveredIndex(item.id)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === item.id && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.6 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { type: "spring", stiffness: 260, damping: 10 },
                }}
                exit={{ opacity: 0, y: 20, scale: 0.6 }}
                style={{ translateX, rotate, whiteSpace: "nowrap" }}
                className="absolute -top-16 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center justify-center rounded-md bg-background px-4 py-2 text-xs shadow-xl border border-border"
              >
                <div className="absolute inset-x-10 -bottom-px z-30 h-px w-[20%] bg-gradient-to-r from-transparent via-primary to-transparent" />
                <div className="absolute -bottom-px left-10 z-30 h-px w-[40%] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
                <div className="relative z-30 text-base font-bold text-foreground">
                  {item.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {item.designation}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <img
            onMouseMove={handleMouseMove}
            height={100}
            width={100}
            src={item.image}
            alt={item.name}
            crossOrigin="anonymous"
            className="relative !m-0 h-14 w-14 rounded-full border-2 border-border object-cover object-top !p-0 transition duration-500 group-hover:z-30 group-hover:scale-105"
          />
        </div>
      ))}
    </>
  );
};

export default AnimatedTooltip;
