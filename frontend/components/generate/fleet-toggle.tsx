"use client";

import { cn } from "@/lib/utils";

type Profile = "budget" | "balanced" | "quality";

const PROFILES: { key: Profile; label: string; cost: string; time: string }[] = [
  { key: "budget", label: "Budget", cost: "~\u20AC0.004", time: "~12s" },
  { key: "balanced", label: "Balanced", cost: "~\u20AC0.02", time: "~20s" },
  { key: "quality", label: "Quality", cost: "~\u20AC0.08", time: "~35s" },
];

interface FleetToggleProps {
  value: Profile;
  onChange: (profile: Profile) => void;
}

export function FleetToggle({ value, onChange }: FleetToggleProps) {
  const active = PROFILES.find((p) => p.key === value);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-0.5 rounded-lg border border-[var(--border)] p-0.5 bg-[var(--deep)]">
        {PROFILES.map((p) => (
          <button
            key={p.key}
            onClick={() => onChange(p.key)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 cursor-pointer",
              value === p.key
                ? "bg-[var(--brand)] text-white"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      {active && (
        <span className="text-[10px] text-[var(--text-muted)] tabular-nums">
          {active.cost} &middot; {active.time}
        </span>
      )}
    </div>
  );
}
