import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format EUR cost with appropriate precision.
 * €0.0035 → "€0.0035"
 * €0.00 → "€0.00"
 */
export function formatCostEUR(cost: number): string {
  if (cost < 0.01) {
    return `€${cost.toFixed(4)}`;
  }
  return `€${cost.toFixed(2)}`;
}

/**
 * Format duration in seconds.
 * 1.2 → "1.2s"
 * 49.0 → "49s"
 */
export function formatDuration(seconds: number): string {
  if (seconds < 10) {
    return `${seconds.toFixed(1)}s`;
  }
  return `${Math.round(seconds)}s`;
}
