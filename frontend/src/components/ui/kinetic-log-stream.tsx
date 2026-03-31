"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

interface LogEntry { id: number; type: string; icon: React.ReactNode; color: string; message: string; timestamp: string; }

interface KineticLogStreamProps {
  logs?: Array<{ type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'; message: string }>;
  autoPlay?: boolean;
  title?: string;
  subtitle?: string;
}

const logTypes = [
  { type: 'INFO', icon: <Info className="h-4 w-4 text-[#00D4EE]" />, color: 'text-[#00D4EE]' },
  { type: 'SUCCESS', icon: <CheckCircle className="h-4 w-4 text-green-400" />, color: 'text-green-400' },
  { type: 'WARNING', icon: <AlertTriangle className="h-4 w-4 text-yellow-400" />, color: 'text-yellow-400' },
];

const defaultMessages = [
  { type: 'INFO' as const, message: 'Planner: Analyzing website requirements...' },
  { type: 'SUCCESS' as const, message: 'Planner: Plan generated — 6 sections identified' },
  { type: 'INFO' as const, message: 'Designer: Selecting color palette and typography...' },
  { type: 'SUCCESS' as const, message: 'Designer: Warm amber palette selected — Playfair Display' },
  { type: 'INFO' as const, message: 'Architect: Planning React component structure...' },
  { type: 'SUCCESS' as const, message: 'Architect: Blueprint ready — Hero, Menu, About, Contact' },
  { type: 'INFO' as const, message: 'Builder: Writing Hero.tsx...' },
  { type: 'SUCCESS' as const, message: 'Builder: Hero.tsx complete (47 lines)' },
  { type: 'INFO' as const, message: 'Builder: Writing Menu.tsx...' },
  { type: 'SUCCESS' as const, message: 'Builder: Menu.tsx complete (89 lines)' },
  { type: 'SUCCESS' as const, message: 'Reviewer: Security scan passed — 0 vulnerabilities' },
  { type: 'SUCCESS' as const, message: 'Generation complete: €0.004 · 17.3s · 23 files' },
];

export default function KineticLogStream({ logs = defaultMessages, title = "Live System Feed", subtitle = "Watch 5 agents build your site in real time" }: KineticLogStreamProps) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (index >= logs.length) { setTimeout(() => { setEntries([]); setIndex(0); }, 2000); return; }
    const delay = index === 0 ? 500 : 800;
    const timer = setTimeout(() => {
      const log = logs[index];
      const logType = logTypes.find(t => t.type === log.type) || logTypes[0];
      setEntries(prev => [{ id: Date.now(), type: log.type, icon: logType.icon, color: logType.color, message: log.message, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }, ...prev.slice(0, 19)]);
      setIndex(i => i + 1);
    }, delay);
    return () => clearTimeout(timer);
  }, [index, logs]);

  return (
    <div className="relative w-full bg-[#0c0a09] flex flex-col items-center justify-center p-8 overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="relative z-10 flex flex-col items-center text-center mb-8">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 text-white font-[Syne]">{title}</h2>
        <p className="text-[#DCE9F5]/60 max-w-2xl">{subtitle}</p>
      </div>
      <div className="relative w-full max-w-4xl h-[400px] bg-black/50 backdrop-blur-md rounded-lg border border-[#0D1B2A] shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-12 bg-[#0D1B2A]/80 rounded-t-lg flex items-center px-4">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <p className="mx-auto text-[#DCE9F5]/40 text-sm font-mono">/var/log/arkhos/pipeline.log</p>
        </div>
        <div ref={containerRef} className="h-full pt-12 overflow-y-hidden font-mono text-sm text-[#DCE9F5]/70 p-4">
          <AnimatePresence initial={false}>
            {entries.map(entry => (
              <motion.div key={entry.id} layout
                initial={{ opacity: 0, x: -50, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                exit={{ opacity: 0, x: 50, transition: { duration: 0.3 } }}
                className="flex items-start gap-4 mb-2">
                <span className="text-[#DCE9F5]/30">{entry.timestamp}</span>
                <div className={cn("flex items-center gap-2 font-bold w-28", entry.color)}>
                  {entry.icon}<span>[{entry.type}]</span>
                </div>
                <span>{entry.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
