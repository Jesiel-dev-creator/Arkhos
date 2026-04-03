"use client";

import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

interface BreadcrumbsProps {
  generationId?: string;
}

export function Breadcrumbs({ generationId }: BreadcrumbsProps) {
  const t = useTranslations("nav");

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
      <Link href="/" className="hover:text-[var(--text-secondary)] transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none rounded">
        {t("home")}
      </Link>
      <ChevronRight className="w-3 h-3" />
      <Link href="/" className="hover:text-[var(--text-secondary)] transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none rounded">
        {t("generate")}
      </Link>
      {generationId && (
        <>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[var(--text-secondary)] font-[var(--font-code)] truncate max-w-[100px]">
            {generationId}
          </span>
        </>
      )}
    </nav>
  );
}
