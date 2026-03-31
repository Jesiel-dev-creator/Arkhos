"use client";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface StateIconProps {
  size?: number;
  color?: string;
  className?: string;
  duration?: number;
}

function useAutoToggle(interval: number) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setOn((v) => !v), interval);
    return () => clearInterval(id);
  }, [interval]);
  return on;
}

// 1. SuccessIcon
export function SuccessIcon({
  size = 40,
  color = "currentColor",
  className,
  duration = 2200,
}: StateIconProps) {
  const done = useAutoToggle(duration);
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={cn("", className)}
      style={{ width: size, height: size }}
    >
      <motion.circle
        cx="20"
        cy="20"
        r="16"
        stroke={color}
        strokeWidth={2}
        animate={
          done
            ? { pathLength: 1, opacity: 1 }
            : { pathLength: 0.7, opacity: 0.4 }
        }
        transition={{ duration: 0.5 }}
      />
      {!done && (
        <motion.circle
          cx="20"
          cy="20"
          r="16"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray="25 75"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "20px 20px" }}
        />
      )}
      <motion.path
        d="M12 20l6 6 10-12"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={
          done
            ? { pathLength: 1, opacity: 1 }
            : { pathLength: 0, opacity: 0 }
        }
        transition={{ duration: 0.4, delay: done ? 0.2 : 0 }}
      />
    </svg>
  );
}

// 2. MenuCloseIcon
export function MenuCloseIcon({
  size = 40,
  color = "currentColor",
  className,
  duration = 2000,
}: StateIconProps) {
  const isClose = useAutoToggle(duration);
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={cn("", className)}
      style={{ width: size, height: size }}
    >
      <motion.line
        x1="10"
        y1="12"
        x2="30"
        y2="12"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        animate={
          isClose
            ? { x1: 12, y1: 12, x2: 28, y2: 28 }
            : { x1: 10, y1: 12, x2: 30, y2: 12 }
        }
        transition={{ duration: 0.35 }}
      />
      <motion.line
        x1="10"
        y1="20"
        x2="30"
        y2="20"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        animate={isClose ? { opacity: 0, x2: 10 } : { opacity: 1, x2: 30 }}
        transition={{ duration: 0.2 }}
      />
      <motion.line
        x1="10"
        y1="28"
        x2="30"
        y2="28"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        animate={
          isClose
            ? { x1: 12, y1: 28, x2: 28, y2: 12 }
            : { x1: 10, y1: 28, x2: 30, y2: 28 }
        }
        transition={{ duration: 0.35 }}
      />
    </svg>
  );
}

// 3. PlayPauseIcon
export function PlayPauseIcon({
  size = 40,
  color = "currentColor",
  className,
  duration = 2400,
}: StateIconProps) {
  const playing = useAutoToggle(duration);
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={cn("", className)}
      style={{ width: size, height: size }}
    >
      <AnimatePresence mode="wait">
        {playing ? (
          <motion.g
            key="pause"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ transformOrigin: "20px 20px" }}
          >
            <rect x="12" y="10" width="5" height="20" rx="1.5" fill={color} />
            <rect x="23" y="10" width="5" height="20" rx="1.5" fill={color} />
          </motion.g>
        ) : (
          <motion.g
            key="play"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ transformOrigin: "20px 20px" }}
          >
            <polygon points="14,10 30,20 14,30" fill={color} />
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}

// 4. LockUnlockIcon
export function LockUnlockIcon({
  size = 40,
  color = "currentColor",
  className,
  duration = 2200,
}: StateIconProps) {
  const locked = useAutoToggle(duration);
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={cn("", className)}
      style={{ width: size, height: size }}
    >
      <rect
        x="10"
        y="18"
        width="20"
        height="16"
        rx="3"
        stroke={color}
        strokeWidth={2}
      />
      <motion.path
        d="M14 18v-4a6 6 0 0112 0v4"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        animate={
          locked
            ? { d: "M14 18v-4a6 6 0 0112 0v4" }
            : { d: "M14 18v-4a6 6 0 0112 0v-2" }
        }
        transition={{ duration: 0.3 }}
      />
      <motion.circle
        cx="20"
        cy="26"
        r="2"
        fill={color}
        animate={locked ? { scale: 1 } : { scale: 0.6 }}
        transition={{ duration: 0.2 }}
      />
    </svg>
  );
}

// 5. CopiedIcon
export function CopiedIcon({
  size = 40,
  color = "currentColor",
  className,
  duration = 2200,
}: StateIconProps) {
  const copied = useAutoToggle(duration);
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={cn("", className)}
      style={{ width: size, height: size }}
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.path
            key="check"
            d="M12 21l5 5 11-13"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            exit={{ pathLength: 0, opacity: 0 }}
            transition={{ duration: 0.35 }}
          />
        ) : (
          <motion.g
            key="copy"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <rect
              x="14"
              y="14"
              width="16"
              height="18"
              rx="2"
              stroke={color}
              strokeWidth={2}
            />
            <path
              d="M10 28V10a2 2 0 012-2h14"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}

// 6. NotificationIcon
export function NotificationIcon({
  size = 40,
  color = "currentColor",
  className,
  duration = 2400,
}: StateIconProps) {
  const hasNotif = useAutoToggle(duration);
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={cn("", className)}
      style={{ width: size, height: size }}
    >
      <path
        d="M20 6a8 8 0 018 8c0 4 2 6 2 10H10s2-6 2-10a8 8 0 018-8z"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <path
        d="M16 34a4 4 0 008 0"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <AnimatePresence>
        {hasNotif && (
          <motion.circle
            cx="28"
            cy="10"
            r="4"
            fill={color}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
          />
        )}
      </AnimatePresence>
    </svg>
  );
}

// 7. HeartIcon
export function HeartIcon({
  size = 40,
  color = "currentColor",
  className,
  duration = 2000,
}: StateIconProps) {
  const liked = useAutoToggle(duration);
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={cn("", className)}
      style={{ width: size, height: size }}
    >
      <motion.path
        d="M20 34s-12-7.5-12-16a7 7 0 0112-4.9A7 7 0 0132 18c0 8.5-12 16-12 16z"
        stroke={color}
        strokeWidth={2}
        animate={
          liked
            ? { fill: color, scale: 1.1 }
            : { fill: "transparent", scale: 1 }
        }
        transition={
          liked
            ? { type: "spring", stiffness: 400, damping: 10 }
            : { duration: 0.3 }
        }
        style={{ transformOrigin: "20px 20px" }}
      />
    </svg>
  );
}

// 8. DownloadDoneIcon
export function DownloadDoneIcon({
  size = 40,
  color = "currentColor",
  className,
  duration = 2400,
}: StateIconProps) {
  const done = useAutoToggle(duration);
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={cn("", className)}
      style={{ width: size, height: size }}
    >
      <path
        d="M8 28v4a2 2 0 002 2h20a2 2 0 002-2v-4"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <AnimatePresence mode="wait">
        {done ? (
          <motion.path
            key="check"
            d="M14 22l6 6 8-10"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            exit={{ pathLength: 0, opacity: 0 }}
            transition={{ duration: 0.35 }}
          />
        ) : (
          <motion.g
            key="arrow"
            initial={{ y: -4, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <line
              x1="20"
              y1="6"
              x2="20"
              y2="24"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
            />
            <polyline
              points="14,18 20,24 26,18"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}

// 9. SendIcon
export function SendIcon({
  size = 40,
  color = "currentColor",
  className,
  duration = 2200,
}: StateIconProps) {
  const sent = useAutoToggle(duration);
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={cn("", className)}
      style={{ width: size, height: size }}
    >
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.path
            key="check"
            d="M10 20l7 7 13-14"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            exit={{ pathLength: 0, opacity: 0 }}
            transition={{ duration: 0.35 }}
          />
        ) : (
          <motion.g
            key="send"
            initial={{ x: -5, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 10, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <path
              d="M6 20l28-10-10 28-4-14z"
              stroke={color}
              strokeWidth={2}
              strokeLinejoin="round"
            />
            <line
              x1="20"
              y1="24"
              x2="34"
              y2="10"
              stroke={color}
              strokeWidth={2}
            />
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}

// 10. ToggleIcon
export function ToggleIcon({
  size = 40,
  color = "currentColor",
  className,
  duration = 1800,
}: StateIconProps) {
  const on = useAutoToggle(duration);
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={cn("", className)}
      style={{ width: size, height: size }}
    >
      <motion.rect
        x="5"
        y="13"
        width="30"
        height="14"
        rx="7"
        animate={
          on
            ? { fill: color, opacity: 0.2 }
            : { fill: color, opacity: 0.08 }
        }
        transition={{ duration: 0.3 }}
      />
      <rect
        x="5"
        y="13"
        width="30"
        height="14"
        rx="7"
        stroke={color}
        strokeWidth={2}
        opacity={on ? 1 : 0.4}
      />
      <motion.circle
        cy="20"
        r="5"
        fill={color}
        animate={on ? { cx: 28 } : { cx: 12 }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
      />
    </svg>
  );
}

// 11. EyeToggleIcon
export function EyeToggleIcon({
  size = 40,
  color = "currentColor",
  className,
  duration = 2200,
}: StateIconProps) {
  const visible = useAutoToggle(duration);
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={cn("", className)}
      style={{ width: size, height: size }}
    >
      <motion.path
        d="M4 20s6-10 16-10 16 10 16 10-6 10-16 10S4 20 4 20z"
        stroke={color}
        strokeWidth={2}
        animate={visible ? { opacity: 1 } : { opacity: 0.3 }}
        transition={{ duration: 0.3 }}
      />
      <motion.circle
        cx="20"
        cy="20"
        r="5"
        stroke={color}
        strokeWidth={2}
        animate={visible ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0.3 }}
        transition={{ duration: 0.3 }}
        style={{ transformOrigin: "20px 20px" }}
      />
      <AnimatePresence>
        {!visible && (
          <motion.line
            x1="8"
            y1="32"
            x2="32"
            y2="8"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            exit={{ pathLength: 0 }}
            transition={{ duration: 0.25 }}
          />
        )}
      </AnimatePresence>
    </svg>
  );
}

// 12. VolumeIcon
export function VolumeIcon({
  size = 40,
  color = "currentColor",
  className,
  duration = 2200,
}: StateIconProps) {
  const on = useAutoToggle(duration);
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={cn("", className)}
      style={{ width: size, height: size }}
    >
      <path
        d="M8 16h4l8-6v20l-8-6H8a1 1 0 01-1-1v-6a1 1 0 011-1z"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <AnimatePresence>
        {on ? (
          <motion.g
            key="waves"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.path
              d="M24 14a6 6 0 010 12"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3 }}
            />
            <motion.path
              d="M28 10a10 10 0 010 20"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            />
          </motion.g>
        ) : (
          <motion.g
            key="mute"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.line
              x1="26"
              y1="16"
              x2="34"
              y2="24"
              stroke={color}
              strokeWidth={2.5}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.25 }}
            />
            <motion.line
              x1="34"
              y1="16"
              x2="26"
              y2="24"
              stroke={color}
              strokeWidth={2.5}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.25, delay: 0.1 }}
            />
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}

const ALL_ICONS = [
  { name: "Success", Icon: SuccessIcon },
  { name: "Menu/Close", Icon: MenuCloseIcon },
  { name: "Play/Pause", Icon: PlayPauseIcon },
  { name: "Lock", Icon: LockUnlockIcon },
  { name: "Copied", Icon: CopiedIcon },
  { name: "Notification", Icon: NotificationIcon },
  { name: "Heart", Icon: HeartIcon },
  { name: "Download", Icon: DownloadDoneIcon },
  { name: "Send", Icon: SendIcon },
  { name: "Toggle", Icon: ToggleIcon },
  { name: "Eye", Icon: EyeToggleIcon },
  { name: "Volume", Icon: VolumeIcon },
];

export function AnimatedStateIconsDemo() {
  return (
    <div className="grid grid-cols-4 gap-8 justify-items-center p-8">
      {ALL_ICONS.map(({ name, Icon }) => (
        <div key={name} className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center size-20 rounded-2xl border border-border bg-card">
            <Icon size={36} />
          </div>
          <span className="text-[11px] font-medium text-muted-foreground">
            {name}
          </span>
        </div>
      ))}
    </div>
  );
}

export default AnimatedStateIconsDemo;
