"use client";

import { ChevronRight } from "lucide-react";
import { SocialIcons } from "@/components/ui/social-icons";
import { clsx, type ClassValue } from "clsx";
import * as Color from "color-bits";
import { motion } from "framer-motion";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const getRGBA = (
  cssColor: React.CSSProperties["color"],
  fallback: string = "rgba(180, 180, 180)",
): string => {
  if (typeof window === "undefined") return fallback;
  if (!cssColor) return fallback;
  try {
    if (typeof cssColor === "string" && cssColor.startsWith("var(")) {
      const element = document.createElement("div");
      element.style.color = cssColor;
      document.body.appendChild(element);
      const computedColor = window.getComputedStyle(element).color;
      document.body.removeChild(element);
      return Color.formatRGBA(Color.parse(computedColor));
    }
    return Color.formatRGBA(Color.parse(cssColor));
  } catch (e) {
    console.error("Color parsing failed:", e);
    return fallback;
  }
};

const colorWithOpacity = (color: string, opacity: number): string => {
  if (!color.startsWith("rgb")) return color;
  return Color.formatRGBA(Color.alpha(Color.parse(color), opacity));
};

const Icons = {
  logo: ({ className }: { className?: string }) => (
    <div className={cn("w-8 h-8 rounded-lg bg-[#FF6B35] flex items-center justify-center", className)}>
      <span className="text-white font-bold text-sm font-[Syne]">A</span>
    </div>
  ),
  soc2Dark: ({ className }: { className?: string }) => (
    <svg width="46" height="45" viewBox="0 0 46 45" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("size-4", className)}>
      <rect x="3" y="0.863281" width="40" height="40" rx="20" fill="url(#soc2d_bg)" />
      <rect x="6.16" y="4.02" width="33.68" height="33.68" rx="16.84" fill="url(#soc2d_inner)" />
      <path d="M15.04 29.62C14.61 29.62 14.24 29.55 13.92 29.4C13.61 29.25 13.36 29.04 13.18 28.76C13 28.49 12.89 28.17 12.86 27.8L13.84 27.74C13.87 27.98 13.94 28.17 14.03 28.33C14.13 28.48 14.27 28.6 14.43 28.68C14.6 28.76 14.81 28.8 15.06 28.8C15.37 28.8 15.61 28.74 15.77 28.63C15.95 28.51 16.03 28.34 16.03 28.12C16.03 27.98 16 27.86 15.93 27.76C15.86 27.66 15.73 27.56 15.55 27.48C15.37 27.39 15.11 27.3 14.76 27.22C14.31 27.12 13.96 27.01 13.7 26.88C13.45 26.75 13.26 26.6 13.14 26.41C13.03 26.22 12.97 25.99 12.97 25.7C12.97 25.4 13.05 25.13 13.19 24.9C13.35 24.66 13.57 24.48 13.85 24.35C14.14 24.22 14.47 24.16 14.86 24.16C15.26 24.16 15.61 24.23 15.91 24.38C16.2 24.52 16.43 24.73 16.6 24.99C16.77 25.25 16.87 25.55 16.91 25.89L15.94 25.94C15.92 25.75 15.87 25.58 15.77 25.44C15.68 25.29 15.56 25.18 15.4 25.1C15.25 25.02 15.06 24.98 14.85 24.98C14.57 24.98 14.35 25.05 14.19 25.17C14.03 25.3 13.95 25.46 13.95 25.67C13.95 25.81 13.98 25.93 14.05 26.02C14.12 26.11 14.23 26.19 14.4 26.26C14.56 26.33 14.81 26.4 15.13 26.47C15.59 26.57 15.96 26.69 16.23 26.85C16.51 26.99 16.7 27.17 16.82 27.37C16.94 27.57 17 27.8 17 28.07C17 28.38 16.92 28.66 16.76 28.89C16.6 29.12 16.37 29.3 16.07 29.43C15.77 29.56 15.43 29.62 15.04 29.62Z" fill="#F4F4F5"/>
      <text x="23" y="28" textAnchor="middle" fill="#F4F4F5" fontSize="5" fontWeight="600">SOC2</text>
      <text x="23" y="16" textAnchor="middle" fill="#D4D4D8" fontSize="4.5" fontWeight="500">AICPA</text>
      <line x1="10.49" y1="21.25" x2="34.99" y2="21.25" stroke="#E4E4E7" strokeWidth="0.26"/>
      <defs>
        <linearGradient id="soc2d_bg" x1="9.89" y1="6.55" x2="36.04" y2="35.58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#27272A"/><stop offset="1" stopColor="#52525C"/>
        </linearGradient>
        <linearGradient id="soc2d_inner" x1="11.96" y1="8.81" x2="33.98" y2="33.25" gradientUnits="userSpaceOnUse">
          <stop stopColor="#52525C"/><stop offset="1" stopColor="#27272A"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  gdprDark: ({ className }: { className?: string }) => (
    <svg width="46" height="45" viewBox="0 0 46 45" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("size-4", className)}>
      <rect x="3" y="0.863281" width="40" height="40" rx="20" fill="url(#gdprd_bg)"/>
      <circle cx="23" cy="15" r="7" stroke="#D4D4D8" strokeWidth="1.5" fill="none"/>
      <path d="M19 15l2.5 2.5L27 12" stroke="#D4D4D8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <text x="23" y="30" textAnchor="middle" fill="#D4D4D8" fontSize="5.5" fontWeight="700">GDPR</text>
      <defs>
        <linearGradient id="gdprd_bg" x1="9.89" y1="6.55" x2="36.04" y2="35.58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#27272A"/><stop offset="1" stopColor="#52525C"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  mitDark: ({ className }: { className?: string }) => (
    <svg width="46" height="45" viewBox="0 0 46 45" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("size-4", className)}>
      <rect x="3" y="0.863281" width="40" height="40" rx="20" fill="url(#mitd_bg)"/>
      <text x="23" y="18" textAnchor="middle" fill="#D4D4D8" fontSize="5" fontWeight="500">OPEN</text>
      <text x="23" y="24" textAnchor="middle" fill="#D4D4D8" fontSize="5" fontWeight="500">SOURCE</text>
      <text x="23" y="31" textAnchor="middle" fill="#F4F4F5" fontSize="6" fontWeight="700">MIT</text>
      <defs>
        <linearGradient id="mitd_bg" x1="9.89" y1="6.55" x2="36.04" y2="35.58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#27272A"/><stop offset="1" stopColor="#52525C"/>
        </linearGradient>
      </defs>
    </svg>
  ),
};

interface FlickeringGridProps extends React.HTMLAttributes<HTMLDivElement> {
  squareSize?: number;
  gridGap?: number;
  flickerChance?: number;
  color?: string;
  width?: number;
  height?: number;
  className?: string;
  maxOpacity?: number;
  text?: string;
  fontSize?: number;
  fontWeight?: number | string;
}

const FlickeringGrid: React.FC<FlickeringGridProps> = ({
  squareSize = 3,
  gridGap = 3,
  flickerChance = 0.2,
  color = "#B4B4B4",
  width,
  height,
  className,
  maxOpacity = 0.15,
  text = "",
  fontSize = 140,
  fontWeight = 600,
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const memoizedColor = useMemo(() => getRGBA(color), [color]);

  const drawGrid = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, cols: number, rows: number, squares: Float32Array, dpr: number) => {
      ctx.clearRect(0, 0, w, h);
      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = w;
      maskCanvas.height = h;
      const maskCtx = maskCanvas.getContext("2d", { willReadFrequently: true });
      if (!maskCtx) return;

      if (text) {
        maskCtx.save();
        maskCtx.scale(dpr, dpr);
        maskCtx.fillStyle = "white";
        maskCtx.font = `${fontWeight} ${fontSize}px "Syne", "Geist", sans-serif`;
        maskCtx.textAlign = "center";
        maskCtx.textBaseline = "middle";
        maskCtx.fillText(text, w / (2 * dpr), h / (2 * dpr));
        maskCtx.restore();
      }

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * (squareSize + gridGap) * dpr;
          const y = j * (squareSize + gridGap) * dpr;
          const sw = squareSize * dpr;
          const sh = squareSize * dpr;
          const maskData = maskCtx.getImageData(x, y, sw, sh).data;
          const hasText = maskData.some((value, index) => index % 4 === 0 && value > 0);
          const opacity = squares[i * rows + j];
          const finalOpacity = hasText ? Math.min(1, opacity * 3 + 0.4) : opacity;
          ctx.fillStyle = colorWithOpacity(memoizedColor, finalOpacity);
          ctx.fillRect(x, y, sw, sh);
        }
      }
    },
    [memoizedColor, squareSize, gridGap, text, fontSize, fontWeight],
  );

  const setupCanvas = useCallback(
    (canvas: HTMLCanvasElement, w: number, h: number) => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const cols = Math.ceil(w / (squareSize + gridGap));
      const rows = Math.ceil(h / (squareSize + gridGap));
      const squares = new Float32Array(cols * rows);
      for (let i = 0; i < squares.length; i++) squares[i] = Math.random() * maxOpacity;
      return { cols, rows, squares, dpr };
    },
    [squareSize, gridGap, maxOpacity],
  );

  const updateSquares = useCallback(
    (squares: Float32Array, deltaTime: number) => {
      for (let i = 0; i < squares.length; i++) {
        if (Math.random() < flickerChance * deltaTime) squares[i] = Math.random() * maxOpacity;
      }
    },
    [flickerChance, maxOpacity],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let gridParams: ReturnType<typeof setupCanvas>;

    const updateCanvasSize = () => {
      const newWidth = width || container.clientWidth;
      const newHeight = height || container.clientHeight;
      setCanvasSize({ width: newWidth, height: newHeight });
      gridParams = setupCanvas(canvas, newWidth, newHeight);
    };
    updateCanvasSize();

    let lastTime = 0;
    const animate = (time: number) => {
      if (!isInView) return;
      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;
      updateSquares(gridParams.squares, deltaTime);
      drawGrid(ctx, canvas.width, canvas.height, gridParams.cols, gridParams.rows, gridParams.squares, gridParams.dpr);
      animationFrameId = requestAnimationFrame(animate);
    };

    const resizeObserver = new ResizeObserver(() => updateCanvasSize());
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting), { threshold: 0 });
    intersectionObserver.observe(canvas);

    if (isInView) animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, [setupCanvas, updateSquares, drawGrid, width, height, isInView]);

  return (
    <div ref={containerRef} className={cn("h-full w-full", className)} {...props}>
      <canvas ref={canvasRef} className="pointer-events-none" style={{ width: canvasSize.width, height: canvasSize.height }} />
    </div>
  );
};

function useMediaQueryLocal(query: string) {
  const [value, setValue] = useState(false);
  useEffect(() => {
    function checkQuery() {
      setValue(window.matchMedia(query).matches);
    }
    checkQuery();
    window.addEventListener("resize", checkQuery);
    const mq = window.matchMedia(query);
    mq.addEventListener("change", checkQuery);
    return () => {
      window.removeEventListener("resize", checkQuery);
      mq.removeEventListener("change", checkQuery);
    };
  }, [query]);
  return value;
}

const siteConfig = {
  hero: {
    description: "EU-sovereign AI website generator. Built in France, powered by Mistral AI.",
  },
  footerLinks: [
    {
      title: "Product",
      links: [
        { id: 1, title: "Generator", url: "/generate" },
        { id: 2, title: "Gallery", url: "/gallery" },
        { id: 3, title: "Pricing", url: "#pricing" },
        { id: 4, title: "Changelog", url: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { id: 5, title: "About", url: "#" },
        { id: 6, title: "Blog", url: "#" },
        { id: 7, title: "Open Source", url: "https://github.com/Jesiel-dev-creator/Arkhos" },
        { id: 8, title: "Contact", url: "#" },
      ],
    },
    {
      title: "Resources",
      links: [
        { id: 9, title: "Documentation", url: "#" },
        { id: 10, title: "GitHub", url: "https://github.com/Jesiel-dev-creator/Arkhos" },
        { id: 11, title: "Status", url: "#" },
        { id: 12, title: "Support", url: "#" },
      ],
    },
  ],
};

/* Top 5 spoken EU languages — typing effect cycles through them */
const EU_PHRASES = [
  "Build something",    // English
  "Construisez",        // French
  "Etwas bauen",        // German
  "Construye algo",     // Spanish
  "Costruisci",         // Italian
];

function useTypingCycle(phrases: string[], typingSpeed = 50, pauseTime = 2500, deleteSpeed = 25) {
  const [displayText, setDisplayText] = useState(phrases[0]);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [charIndex, setCharIndex] = useState(phrases[0].length);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (isTyping) {
      if (charIndex < currentPhrase.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentPhrase.slice(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        }, typingSpeed + Math.random() * 20);
      } else {
        // Done typing — pause then start deleting
        timeout = setTimeout(() => setIsTyping(false), pauseTime);
      }
    } else {
      if (charIndex > 0) {
        // Delete
        timeout = setTimeout(() => {
          setDisplayText(currentPhrase.slice(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        }, deleteSpeed);
      } else {
        // Move to next phrase and start typing
        const next = (phraseIndex + 1) % phrases.length;
        setPhraseIndex(next);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isTyping, phraseIndex, phrases, typingSpeed, pauseTime, deleteSpeed]);

  return displayText;
}

export const Component = () => {
  const tablet = useMediaQueryLocal("(max-width: 1024px)");
  const typingText = useTypingCycle(EU_PHRASES);

  return (
    <footer id="footer" className="w-full pb-0 bg-[var(--void)]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-start md:justify-between px-6 md:px-10 py-14 gap-10">
        {/* Left column — brand, description, badges, social */}
        <div className="flex flex-col items-start gap-y-5 max-w-xs shrink-0">
          <a href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--ember)' }}>
              <span className="text-white font-bold text-xs font-[Syne]">A</span>
            </div>
            <span className="text-lg font-semibold font-[Syne]" style={{ color: 'var(--text-primary)' }}>ArkhosAI</span>
          </a>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {siteConfig.hero.description}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: "MIT License", color: "var(--green)" },
              { label: "GDPR", color: "var(--violet)" },
              { label: "EU Hosted", color: "var(--cyan)" },
              { label: "Open Source", color: "var(--ember)" },
            ].map((badge) => (
              <span
                key={badge.label}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wide"
                style={{
                  color: badge.color,
                  background: `color-mix(in srgb, ${badge.color} 10%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${badge.color} 20%, transparent)`,
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: badge.color }} />
                {badge.label}
              </span>
            ))}
          </div>
          <SocialIcons />
        </div>

        {/* Right columns — links */}
        <div className="flex flex-col md:flex-row gap-10 lg:gap-16">
          {siteConfig.footerLinks.map((column, i) => (
            <ul key={i} className="flex flex-col gap-y-2.5">
              <li className="mb-1 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{column.title}</li>
              {column.links.map((link) => (
                <li key={link.id} className="group inline-flex cursor-pointer items-center justify-start gap-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <a href={link.url} className="hover:text-[var(--text-primary)] transition-colors">{link.title}</a>
                  <div className="flex size-4 items-center justify-center border border-white/10 rounded translate-x-0 transform opacity-0 transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:opacity-100">
                    <ChevronRight className="h-3 w-3" />
                  </div>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-4 flex flex-col md:flex-row items-center justify-between text-xs border-t border-white/5" style={{ color: 'var(--text-muted)' }}>
        <span>© 2026 Bleucommerce SAS · Orleans, France</span>
        <span>
          Powered by{" "}
          <a href="https://github.com/Jesiel-dev-creator/Arkhos" className="hover:underline" style={{ color: 'var(--ember)' }}>Tramontane</a>
          {" · "}<a href="https://mistral.ai" className="hover:text-[var(--text-secondary)] transition-colors">Mistral AI</a>
          {" · "}<a href="https://scaleway.com" className="hover:text-[var(--text-secondary)] transition-colors">Scaleway</a>
        </span>
      </div>
      <div className="w-full max-w-6xl mx-auto h-48 md:h-64 relative mt-8 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-[var(--void)] z-10 from-40%" />
        <div className="absolute inset-0 mx-6">
          <FlickeringGrid
            text={tablet ? typingText.split(" ")[0] : typingText}
            fontSize={tablet ? 60 : 80}
            className="h-full w-full"
            squareSize={2}
            gridGap={tablet ? 2 : 3}
            color="#FF5D3A"
            maxOpacity={0.25}
            flickerChance={0.1}
          />
        </div>
      </div>
    </footer>
  );
};

export default Component;
