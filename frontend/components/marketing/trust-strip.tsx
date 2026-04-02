import { Shield, Cpu, GitBranch, Scale } from "lucide-react";
import { useTranslations } from "next-intl";

const ITEMS = [
  { key: "sovereign", icon: Shield },
  { key: "mistral", icon: Cpu },
  { key: "openSource", icon: GitBranch },
  { key: "mit", icon: Scale },
] as const;

export function TrustStrip() {
  const t = useTranslations("trust");

  return (
    <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
      {ITEMS.map(({ key, icon: Icon }) => (
        <div key={key} className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <Icon className="w-4 h-4 text-[var(--text-muted)]" />
          <span>{t(key)}</span>
        </div>
      ))}
    </div>
  );
}
