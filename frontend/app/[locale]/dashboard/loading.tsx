import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="w-5 h-5 text-[var(--brand)] animate-spin" />
    </div>
  );
}
