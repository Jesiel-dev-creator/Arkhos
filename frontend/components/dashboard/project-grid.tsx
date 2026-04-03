"use client";

import { Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ProjectCard, type Project } from "./project-card";

interface ProjectGridProps {
  projects: Project[];
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
}

export function ProjectGrid({ projects, onDelete, onRename }: ProjectGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onDelete={onDelete}
          onRename={onRename}
        />
      ))}

      {/* New project card */}
      <Link
        href="/dashboard/new"
        className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--border)] bg-transparent aspect-[16/10] hover:border-[var(--brand)]/40 hover:bg-[var(--deep)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
      >
        <div className="w-10 h-10 rounded-full border border-[var(--border)] group-hover:border-[var(--brand)]/40 flex items-center justify-center transition-colors">
          <Plus className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--brand)] transition-colors" />
        </div>
        <span className="mt-3 text-sm text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] font-[var(--font-body)] transition-colors">
          New project
        </span>
      </Link>
    </div>
  );
}
