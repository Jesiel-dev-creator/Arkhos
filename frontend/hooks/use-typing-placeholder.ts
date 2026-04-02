"use client";

import { useEffect, useRef, useState } from "react";

const TYPING_SPEED = 35;
const DELETING_SPEED = 18;
const PAUSE_AFTER_TYPING = 2200;
const PAUSE_AFTER_DELETING = 300;

/**
 * Cycles through a list of strings with a typing/deleting animation.
 * Uses refs internally so the animation loop never re-mounts.
 */
export function useTypingPlaceholder(phrases: string[]): string {
  const [display, setDisplay] = useState("");
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef({
    phraseIdx: 0,
    charIdx: 0,
    deleting: false,
    lastTick: 0,
  });

  useEffect(() => {
    const s = stateRef.current;
    let running = true;

    function step(now: number) {
      if (!running) return;

      const elapsed = now - s.lastTick;
      const delay = s.deleting ? DELETING_SPEED : TYPING_SPEED;

      if (elapsed < delay) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }

      s.lastTick = now;
      const phrase = phrases[s.phraseIdx];

      if (!s.deleting) {
        if (s.charIdx < phrase.length) {
          s.charIdx++;
          setDisplay(phrase.slice(0, s.charIdx));
          rafRef.current = requestAnimationFrame(step);
        } else {
          // Pause then delete
          timerRef.current = setTimeout(() => {
            s.deleting = true;
            if (running) rafRef.current = requestAnimationFrame(step);
          }, PAUSE_AFTER_TYPING);
        }
      } else {
        if (s.charIdx > 0) {
          s.charIdx--;
          setDisplay(phrase.slice(0, s.charIdx));
          rafRef.current = requestAnimationFrame(step);
        } else {
          // Next phrase
          s.deleting = false;
          s.phraseIdx = (s.phraseIdx + 1) % phrases.length;
          timerRef.current = setTimeout(() => {
            if (running) rafRef.current = requestAnimationFrame(step);
          }, PAUSE_AFTER_DELETING);
        }
      }
    }

    // Start after a short delay
    timerRef.current = setTimeout(() => {
      s.lastTick = performance.now();
      rafRef.current = requestAnimationFrame(step);
    }, PAUSE_AFTER_DELETING);

    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phrases]);

  return display;
}
