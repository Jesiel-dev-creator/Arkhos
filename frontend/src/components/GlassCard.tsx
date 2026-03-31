import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "default" | "elevated" | "outlined";
  padding?: "compact" | "default" | "spacious";
}

const variantClasses = {
  default: "glass",
  elevated: "glass shadow-[var(--shadow-lg)]",
  outlined: "bg-transparent border border-[var(--border)]",
};

const paddingClasses = {
  compact: "p-3",
  default: "p-5",
  spacious: "p-8",
};

export default function GlassCard({
  children,
  className,
  variant = "default",
  padding = "default",
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] transition-all duration-200",
        "hover:border-[var(--muted)]/30 hover:-translate-y-[1px]",
        variantClasses[variant],
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
