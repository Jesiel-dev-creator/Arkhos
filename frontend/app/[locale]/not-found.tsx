import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-center max-w-md">
        <p className="text-6xl font-[var(--font-display)] font-extrabold text-[var(--brand)]">404</p>
        <p className="text-sm text-[var(--text-secondary)]">
          This page doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium bg-[var(--brand)] text-white hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none transition-all duration-150"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </div>
    </div>
  );
}
