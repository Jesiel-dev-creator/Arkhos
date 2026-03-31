import { useEffect, useRef } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

interface CostCounterProps {
  value: number;
  size?: "sm" | "lg";
  className?: string;
}

export default function CostCounter({
  value,
  size = "sm",
  className,
}: CostCounterProps) {
  const displayRef = useRef<HTMLSpanElement>(null);
  const prevValueRef = useRef(0);

  useEffect(() => {
    if (!displayRef.current) return;

    const obj = { val: prevValueRef.current };
    gsap.to(obj, {
      val: value,
      duration: 0.8,
      ease: "power2.out",
      onUpdate: () => {
        if (displayRef.current) {
          displayRef.current.textContent = `€${obj.val.toFixed(4)}`;
        }
      },
      onComplete: () => {
        /* Flash ember on completion if value increased */
        if (value > prevValueRef.current && displayRef.current) {
          gsap.fromTo(
            displayRef.current,
            { color: "var(--ember)" },
            { color: "var(--frost)", duration: 0.6, ease: "power2.out" }
          );
        }
        prevValueRef.current = value;
      },
    });
  }, [value]);

  return (
    <span
      ref={displayRef}
      className={cn(
        "font-mono tabular-nums text-[var(--frost)]",
        size === "sm" && "text-xs",
        size === "lg" && "text-2xl font-bold",
        className
      )}
      style={{ fontFamily: "var(--font-code)" }}
    >
      €{value.toFixed(4)}
    </span>
  );
}
