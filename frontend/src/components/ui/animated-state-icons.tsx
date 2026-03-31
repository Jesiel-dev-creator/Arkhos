"use client";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface StateIconProps {
  size?: number; color?: string; className?: string; duration?: number;
}

function useAutoToggle(interval: number) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setOn((v) => !v), interval);
    return () => clearInterval(id);
  }, [interval]);
  return on;
}

export function SuccessIcon({ size = 40, color = "currentColor", className, duration = 2200 }: StateIconProps) {
  const done = useAutoToggle(duration);
  return (
    <svg viewBox="0 0 40 40" fill="none" className={cn("", className)} style={{ width: size, height: size }}>
      <motion.circle cx="20" cy="20" r="16" stroke={color} strokeWidth={2}
        animate={done ? { pathLength: 1, opacity: 1 } : { pathLength: 0.7, opacity: 0.4 }}
        transition={{ duration: 0.5 }} />
      {!done && <motion.circle cx="20" cy="20" r="16" stroke={color} strokeWidth={2} strokeLinecap="round" strokeDasharray="25 75"
        animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "20px 20px" }} />}
      <motion.path d="M12 20l6 6 10-12" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
        animate={done ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
        transition={{ duration: 0.4, delay: done ? 0.2 : 0 }} />
    </svg>
  );
}

export function PlayPauseIcon({ size = 40, color = "currentColor", className, duration = 2400 }: StateIconProps) {
  const playing = useAutoToggle(duration);
  return (
    <svg viewBox="0 0 40 40" fill="none" className={cn("", className)} style={{ width: size, height: size }}>
      <AnimatePresence mode="wait">
        {playing ? (
          <motion.g key="pause" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.25 }} style={{ transformOrigin: "20px 20px" }}>
            <rect x="12" y="10" width="5" height="20" rx="1.5" fill={color} />
            <rect x="23" y="10" width="5" height="20" rx="1.5" fill={color} />
          </motion.g>
        ) : (
          <motion.g key="play" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.25 }} style={{ transformOrigin: "20px 20px" }}>
            <polygon points="14,10 30,20 14,30" fill={color} />
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}

export function DownloadDoneIcon({ size = 40, color = "currentColor", className, duration = 2400 }: StateIconProps) {
  const done = useAutoToggle(duration);
  return (
    <svg viewBox="0 0 40 40" fill="none" className={cn("", className)} style={{ width: size, height: size }}>
      <path d="M8 28v4a2 2 0 002 2h20a2 2 0 002-2v-4" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <AnimatePresence mode="wait">
        {done ? (
          <motion.path key="check" d="M14 22l6 6 8-10" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} exit={{ pathLength: 0, opacity: 0 }} transition={{ duration: 0.35 }} />
        ) : (
          <motion.g key="arrow" initial={{ y: -4, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 8, opacity: 0 }} transition={{ duration: 0.35 }}>
            <line x1="20" y1="6" x2="20" y2="24" stroke={color} strokeWidth={2} strokeLinecap="round" />
            <polyline points="14,18 20,24 26,18" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}

export function ToggleIcon({ size = 40, color = "currentColor", className, duration = 1800 }: StateIconProps) {
  const on = useAutoToggle(duration);
  return (
    <svg viewBox="0 0 40 40" fill="none" className={cn("", className)} style={{ width: size, height: size }}>
      <motion.rect x="5" y="13" width="30" height="14" rx="7" animate={on ? { fill: color, opacity: 0.2 } : { fill: color, opacity: 0.08 }} transition={{ duration: 0.3 }} />
      <rect x="5" y="13" width="30" height="14" rx="7" stroke={color} strokeWidth={2} opacity={on ? 1 : 0.4} />
      <motion.circle cy="20" r="5" fill={color} animate={on ? { cx: 28 } : { cx: 12 }} transition={{ type: "spring", stiffness: 500, damping: 25 }} />
    </svg>
  );
}

const ALL_ICONS = [
  { name: "Success", Icon: SuccessIcon },
  { name: "Play/Pause", Icon: PlayPauseIcon },
  { name: "Download", Icon: DownloadDoneIcon },
  { name: "Toggle", Icon: ToggleIcon },
];

export function AnimatedStateIconsDemo() {
  return (
    <div className="grid grid-cols-4 gap-8 justify-items-center p-8">
      {ALL_ICONS.map(({ name, Icon }) => (
        <div key={name} className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center size-20 rounded-2xl border border-border bg-card">
            <Icon size={36} />
          </div>
          <span className="text-[11px] font-medium text-muted-foreground">{name}</span>
        </div>
      ))}
    </div>
  );
}

export default AnimatedStateIconsDemo;
