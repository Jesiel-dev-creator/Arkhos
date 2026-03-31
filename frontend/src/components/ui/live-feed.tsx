"use client";
import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type FeedItem = { id: string; title: string; message: string; time: string };

type NotificationFeedProps = {
  cardTitle?: string;
  cardDescription?: string;
  feed?: FeedItem[];
};

const defaultFeed: FeedItem[] = [
  { id: "1", title: "Planner", message: "Analyzing: French bakery site", time: "1m" },
  { id: "2", title: "Designer", message: "Palette: warm amber + cream", time: "2m" },
  { id: "3", title: "Builder", message: "Hero.tsx generated (47 lines)", time: "3m" },
  { id: "4", title: "Reviewer", message: "Security scan: 0 issues", time: "4m" },
];

export const NotificationCenterFeed = ({
  cardTitle = "Live feed",
  cardDescription = "Auto-scrolling pipeline updates",
  feed = defaultFeed,
}: NotificationFeedProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [items, setItems] = useState(feed);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isHovered) return;
    timerRef.current = setInterval(() => {
      setItems((prev) => { const [first, ...rest] = prev; return [...rest, first]; });
    }, 1600);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isHovered]);

  return (
    <motion.div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
      className={cn("relative flex max-w-[350px] items-center justify-center", "rounded-lg border border-[#0D1B2A] bg-[#020408] p-6")}>
      <div className="relative h-[230px] w-[264px] overflow-hidden rounded-[14px] bg-[#0D1B2A] p-2">
        <div className="absolute left-3 top-2 text-[9px] text-[#DCE9F5]/40">
          {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
        </div>
        <div className="absolute inset-x-2 bottom-2 top-8">
          {items.map((it, i) => (
            <motion.div key={it.id + i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
              className="mb-2 rounded-md border border-[#0D1B2A] bg-[#0D1B2A]/80 p-2 text-xs shadow">
              <div className="flex items-center justify-between">
                <span className="font-medium text-[#DCE9F5]">{it.title}</span>
                <span className="text-[10px] text-[#DCE9F5]/40">{it.time}</span>
              </div>
              <div className="mt-1 truncate text-[#DCE9F5]/60">{it.message}</div>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-0 left-0 h-[160px] w-full rounded-b-lg" style={{ backgroundImage: 'linear-gradient(to top, #020408 65%, transparent 100%)' }} />
      <div className="absolute bottom-4 left-0 w-full px-6">
        <h3 className="text-sm font-semibold text-[#FF6B35]">{cardTitle}</h3>
        <p className="mt-1 text-xs text-[#DCE9F5]/40">{cardDescription}</p>
      </div>
    </motion.div>
  );
};

export default NotificationCenterFeed;
