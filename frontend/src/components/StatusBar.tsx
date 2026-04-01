import { formatCostEUR, formatDuration } from "@/lib/utils";

interface StatusBarProps {
  remainingToday: number;
  fileCount: number | null;
  lineCount: number | null;
  totalCostEur: number;
  totalDurationS: number;
  isComplete: boolean;
}

export default function StatusBar({
  remainingToday,
  fileCount,
  lineCount,
  totalCostEur,
  totalDurationS,
  isComplete,
}: StatusBarProps) {
  return (
    <div className="h-9 flex items-center justify-between px-6 bg-[#0D1B2A] border-t border-white/5 text-xs flex-shrink-0">
      <span className="text-[#7B8FA3]">
        {remainingToday} free generation{remainingToday !== 1 ? "s" : ""} remaining today
      </span>
      {isComplete && fileCount !== null && (
        <span className="font-mono text-[#DCE9F5]">
          {fileCount} files{lineCount !== null ? ` · ${lineCount} lines` : ""}
        </span>
      )}
      {isComplete && totalCostEur > 0 && (
        <span className="font-mono">
          <span className="text-[#FF6B35]">{formatCostEUR(totalCostEur)}</span>
          <span className="text-[#7B8FA3]"> · 5 agents · {formatDuration(totalDurationS)}</span>
        </span>
      )}
    </div>
  );
}
