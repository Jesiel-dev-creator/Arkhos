"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuthContext } from "@/components/auth/auth-provider";
import { supabase } from "@/lib/supabase";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ProjectGrid } from "@/components/dashboard/project-grid";
import type { Project } from "@/components/dashboard/project-card";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const { user } = useAuthContext();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("projects")
      .select("id, name, status, created_at, cost_eur, thumbnail_url")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setProjects(data as Project[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  async function handleDelete(id: string) {
    await supabase.from("projects").delete().eq("id", id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleRename(id: string, name: string) {
    await supabase.from("projects").update({ name }).eq("id", id);
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name } : p))
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-[var(--brand)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-20">
      {/* Header */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)] font-[var(--font-body)]">
            {t("kicker")}
          </p>
          <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)] font-[var(--font-display)]">
            {t("title")}
          </h1>
        </div>
        {projects.length > 0 && (
          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-medium text-white hover:brightness-110 transition-all focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
          >
            <Plus className="w-4 h-4" />
            {t("newProject")}
          </Link>
        )}
      </div>

      {/* Content */}
      {projects.length === 0 ? (
        <EmptyState />
      ) : (
        <ProjectGrid
          projects={projects}
          onDelete={handleDelete}
          onRename={handleRename}
        />
      )}
    </div>
  );
}
