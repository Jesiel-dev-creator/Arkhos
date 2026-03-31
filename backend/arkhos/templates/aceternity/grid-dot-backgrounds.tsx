"use client";

import { cn } from "@/lib/utils";

export function DotBackground({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex h-[50rem] w-full items-center justify-center bg-background",
        className
      )}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(hsl(var(--muted-foreground) / 0.3) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      <div className="relative z-20">{children}</div>
    </div>
  );
}

export function GridBackground({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex h-[50rem] w-full items-center justify-center bg-background",
        className
      )}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
                           linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)`,
          backgroundSize: "4rem 4rem",
        }}
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      <div className="relative z-20">{children}</div>
    </div>
  );
}

export function GridSmallBackground({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex h-[50rem] w-full items-center justify-center bg-background",
        className
      )}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
                           linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)`,
          backgroundSize: "1.5rem 1.5rem",
        }}
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      <div className="relative z-20">{children}</div>
    </div>
  );
}

export default DotBackground;
