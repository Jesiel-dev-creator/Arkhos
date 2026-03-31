"use client";
import { cn } from "@/lib/utils";
import React from "react";

/**
 * CSS-only wavy background effect.
 * Rewritten from the original canvas + simplex-noise version
 * to avoid the simplex-noise dependency.
 * Uses layered pseudo-elements with CSS keyframe animations.
 */
export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors,
  blur = 10,
  speed = "fast",
  waveOpacity = 0.5,
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  colors?: string[];
  blur?: number;
  speed?: "slow" | "fast";
  waveOpacity?: number;
  [key: string]: unknown;
}) => {
  const waveColors = colors ?? [
    "#38bdf8",
    "#818cf8",
    "#c084fc",
    "#e879f9",
    "#22d3ee",
  ];

  const animationDuration = speed === "fast" ? "8s" : "16s";

  return (
    <div
      className={cn(
        "relative flex h-screen flex-col items-center justify-center overflow-hidden bg-background",
        containerClassName,
      )}
    >
      {/* CSS wave layers */}
      <div
        className="absolute inset-0 z-0"
        style={{ filter: `blur(${blur}px)` }}
      >
        {waveColors.map((color, i) => (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              opacity: waveOpacity,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "-50%",
                right: "-50%",
                top: `${35 + i * 6}%`,
                height: "200px",
                background: `linear-gradient(180deg, transparent 0%, ${color} 50%, transparent 100%)`,
                animation: `wavyMove${i} ${animationDuration} ease-in-out infinite`,
                transform: `skewY(${-3 + i * 1.5}deg)`,
                borderRadius: "40%",
              }}
            />
          </div>
        ))}
      </div>

      {/* Keyframe styles */}
      <style>{`
        ${waveColors
          .map(
            (_, i) => `
          @keyframes wavyMove${i} {
            0%, 100% {
              transform: translateX(${-5 + i * 2}%) skewY(${-3 + i * 1.5}deg) scaleY(1);
            }
            25% {
              transform: translateX(${3 - i}%) skewY(${-1 + i * 0.8}deg) scaleY(${0.8 + i * 0.05});
            }
            50% {
              transform: translateX(${5 - i * 2}%) skewY(${-4 + i * 1.2}deg) scaleY(${1.1 - i * 0.03});
            }
            75% {
              transform: translateX(${-2 + i}%) skewY(${-2 + i * 1.0}deg) scaleY(${0.9 + i * 0.04});
            }
          }
        `,
          )
          .join("\n")}
      `}</style>

      <div className={cn("relative z-10", className)} {...props}>
        {children}
      </div>
    </div>
  );
};

export default WavyBackground;
