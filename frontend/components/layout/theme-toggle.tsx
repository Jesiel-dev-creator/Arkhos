"use client";

import { Sun, Moon } from "lucide-react";
import { useSyncExternalStore } from "react";
import { useTheme } from "@/components/providers";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!mounted) return <div className="w-9 h-9" />;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex items-center justify-center w-9 h-9 rounded-md
                 bg-[var(--surface)] hover:bg-[var(--elevated)]
                 border border-[var(--border)]
                 transition-colors duration-150 cursor-pointer"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-[var(--text-secondary)]" />
      ) : (
        <Moon className="w-4 h-4 text-[var(--text-secondary)]" />
      )}
    </button>
  );
}
