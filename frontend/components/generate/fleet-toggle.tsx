"use client";

import { cn } from "@/lib/utils";

type Profile = "budget" | "balanced" | "quality";

const PROFILES: { key: Profile; label: string; cost: string; time: string; models: string }[] = [
  { key: "budget", label: "Budget", cost: "~\u20AC0.004", time: "~25s", models: "ministral-7b + devstral-small" },
  { key: "balanced", label: "Balanced", cost: "~\u20AC0.006", time: "~40s", models: "mistral-small + devstral-small" },
  { key: "quality", label: "Quality", cost: "~\u20AC0.020", time: "~90s", models: "devstral-2 + magistral-small" },
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
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-[var(--text-muted)] tabular-nums">
            {active.cost} &middot; {active.time}
          </span>
          <span className="text-[9px] font-[var(--font-code)] text-[var(--text-muted)]/60">
            {active.models}
          </span>
        </div>
      )}
    </div>
  );
}
