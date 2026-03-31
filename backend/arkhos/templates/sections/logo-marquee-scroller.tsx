"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface Logo {
  src: string;
  alt: string;
  gradient: {
    from: string;
    via: string;
    to: string;
  };
}

interface MarqueeLogoScrollerProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  logos: Logo[];
  speed?: "normal" | "slow" | "fast";
}

const defaultLogos: Logo[] = [
  {
    src: "https://svgl.app/library/procure.svg",
    alt: "Partner 1",
    gradient: { from: "#668CFF", via: "#0049FF", to: "#003199" },
  },
  {
    src: "https://svgl.app/library/shopify.svg",
    alt: "Partner 2",
    gradient: { from: "#FFE766", via: "#FFCE00", to: "#B38F00" },
  },
  {
    src: "https://svgl.app/library/blender.svg",
    alt: "Partner 3",
    gradient: { from: "#6690F0", via: "#255BE3", to: "#193B99" },
  },
  {
    src: "https://svgl.app/library/figma.svg",
    alt: "Partner 4",
    gradient: { from: "#C4C2FF", via: "#9896FF", to: "#5B4DCC" },
  },
  {
    src: "https://svgl.app/library/spotify.svg",
    alt: "Partner 5",
    gradient: { from: "#FF66A1", via: "#FF007A", to: "#B3005A" },
  },
  {
    src: "https://svgl.app/library/lottielab.svg",
    alt: "Partner 6",
    gradient: { from: "#D9FF5A", via: "#AFFF01", to: "#7A9900" },
  },
  {
    src: "https://svgl.app/library/google-cloud.svg",
    alt: "Partner 7",
    gradient: { from: "#8AA7FF", via: "#5F86FF", to: "#3A5ACC" },
  },
  {
    src: "https://svgl.app/library/bing.svg",
    alt: "Partner 8",
    gradient: { from: "#67F0D1", via: "#2AE5B9", to: "#1B8F72" },
  },
];

const MarqueeLogoScroller = React.forwardRef<HTMLDivElement, MarqueeLogoScrollerProps>(
  (
    {
      title = "Trusted by Businesses Worldwide",
      description = "Founders, developers, and business leaders across the globe chose us for their digital asset operations.",
      logos = defaultLogos,
      speed = "normal",
      className,
      ...props
    },
    ref
  ) => {
    const durationMap = {
      normal: "40s",
      slow: "80s",
      fast: "5s",
    };
    const animationDuration = durationMap[speed];

    return (
      <>
        <style>{`
          @keyframes marquee {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
        `}</style>

        <section
          ref={ref}
          aria-label={title}
          className={cn(
            "w-full bg-background text-foreground rounded-lg border overflow-hidden",
            className
          )}
          {...props}
        >
          <div className="p-6 md:p-8 lg:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 lg:gap-8 pb-6 md:pb-8 border-b">
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tighter text-balance">
                {title}
              </h2>
              <p className="text-muted-foreground self-start lg:justify-self-end text-balance">
                {description}
              </p>
            </div>
          </div>

          <div
            className="w-full overflow-hidden"
            style={{
              maskImage:
                "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            }}
          >
            <div
              className="flex w-max items-center gap-4 py-4 pr-4 hover:[animation-play-state:paused] transition-all duration-300 ease-in-out"
              style={{
                animation: `marquee ${animationDuration} linear infinite`,
              }}
            >
              {[...logos, ...logos].map((logo, index) => (
                <div
                  key={index}
                  className="group relative h-24 w-40 shrink-0 flex items-center justify-center rounded-lg bg-secondary/70 overflow-hidden"
                >
                  <div
                    style={
                      {
                        "--from": logo.gradient.from,
                        "--via": logo.gradient.via,
                        "--to": logo.gradient.to,
                      } as React.CSSProperties
                    }
                    className="absolute inset-0 scale-150 opacity-0 transition-all duration-700 ease-out group-hover:opacity-100 group-hover:scale-100 bg-gradient-to-br from-[var(--from)] via-[var(--via)] to-[var(--to)]"
                  />
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    className="relative h-3/4 w-auto object-contain"
                    crossOrigin="anonymous"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </>
    );
  }
);

MarqueeLogoScroller.displayName = "MarqueeLogoScroller";

export default MarqueeLogoScroller;
