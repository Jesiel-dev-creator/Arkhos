"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const TYPING_SPEED = 45;
const DELETING_SPEED = 25;
const PAUSE_AFTER_TYPING = 2400;
const PAUSE_AFTER_DELETING = 400;

/**
 * Cycles through a list of strings with a typing/deleting animation.
 * Returns the current visible text to use as a placeholder.
 */
export function useTypingPlaceholder(phrases: string[]): string {
  const [text, setText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tick = useCallback(() => {
    const currentPhrase = phrases[phraseIndex];

    if (!isDeleting) {
      // Typing
      if (text.length < currentPhrase.length) {
        setText(currentPhrase.slice(0, text.length + 1));
        timerRef.current = setTimeout(tick, TYPING_SPEED);
      } else {
        // Pause then start deleting
        timerRef.current = setTimeout(() => {
          setIsDeleting(true);
        }, PAUSE_AFTER_TYPING);
      }
    } else {
      // Deleting
      if (text.length > 0) {
        setText(text.slice(0, -1));
        timerRef.current = setTimeout(tick, DELETING_SPEED);
      } else {
        // Move to next phrase
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
        timerRef.current = setTimeout(tick, PAUSE_AFTER_DELETING);
      }
    }
  }, [text, phraseIndex, isDeleting, phrases]);

  useEffect(() => {
    timerRef.current = setTimeout(tick, PAUSE_AFTER_DELETING);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [tick]);

  return text;
}
