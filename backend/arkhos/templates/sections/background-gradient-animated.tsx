"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GradientBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  colors?: {
    first?: string;
    second?: string;
    third?: string;
    fourth?: string;
    fifth?: string;
  };
  speed?: "slow" | "normal" | "fast";
}

export default function GradientBackground({
  children,
  className,
  colors = {
    first: "rgba(59, 130, 246, 0.5)",
    second: "rgba(168, 85, 247, 0.5)",
    third: "rgba(236, 72, 153, 0.5)",
    fourth: "rgba(34, 197, 94, 0.3)",
    fifth: "rgba(251, 146, 60, 0.3)",
  },
  speed = "normal",
}: GradientBackgroundProps) {
  const durations = {
    slow: { first: "12s", second: "16s", third: "14s", fourth: "18s", fifth: "20s" },
    normal: { first: "7s", second: "10s", third: "8s", fourth: "12s", fifth: "14s" },
    fast: { first: "4s", second: "6s", third: "5s", fourth: "7s", fifth: "8s" },
  };

  const d = durations[speed];

  return (
    <div
      className={cn(
        "relative w-full h-full overflow-hidden bg-black",
        className
      )}
    >
      <div className="absolute inset-0 blur-[80px] opacity-70">
        <div
          className="absolute w-[50%] h-[50%] top-[10%] left-[20%] rounded-full"
          style={{
            background: `radial-gradient(circle, ${colors.first} 0%, transparent 70%)`,
            animation: `gradFloat1 ${d.first} ease-in-out infinite`,
          }}
        />
        <div
          className="absolute w-[40%] h-[40%] top-[30%] right-[10%] rounded-full"
          style={{
            background: `radial-gradient(circle, ${colors.second} 0%, transparent 70%)`,
            animation: `gradFloat2 ${d.second} ease-in-out infinite`,
          }}
        />
        <div
          className="absolute w-[45%] h-[45%] bottom-[10%] left-[10%] rounded-full"
          style={{
            background: `radial-gradient(circle, ${colors.third} 0%, transparent 70%)`,
            animation: `gradFloat3 ${d.third} ease-in-out infinite`,
          }}
        />
        <div
          className="absolute w-[35%] h-[35%] bottom-[20%] right-[20%] rounded-full"
          style={{
            background: `radial-gradient(circle, ${colors.fourth} 0%, transparent 70%)`,
            animation: `gradFloat4 ${d.fourth} ease-in-out infinite`,
          }}
        />
        <div
          className="absolute w-[30%] h-[30%] top-[50%] left-[50%] rounded-full"
          style={{
            background: `radial-gradient(circle, ${colors.fifth} 0%, transparent 70%)`,
            animation: `gradFloat5 ${d.fifth} ease-in-out infinite`,
          }}
        />
      </div>
      <div className="relative z-10">{children}</div>
      <style>{`
        @keyframes gradFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.1); }
          66% { transform: translate(-20px, 15px) scale(0.95); }
        }
        @keyframes gradFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-25px, 20px) scale(1.05); }
          66% { transform: translate(15px, -25px) scale(1.1); }
        }
        @keyframes gradFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, 15px) scale(1.1); }
          66% { transform: translate(-15px, -20px) scale(0.9); }
        }
        @keyframes gradFloat4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 20px) scale(1.15); }
        }
        @keyframes gradFloat5 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(25px, -15px) scale(1.1); }
        }
      `}</style>
    </div>
  );
}
