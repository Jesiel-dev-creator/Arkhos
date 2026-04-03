"use client";

import { useState, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  MoreHorizontal,
  Pencil,
  Download,
  Trash2,
  Loader2,
} from "lucide-react";
import { Link } from "@/i18n/navigation";

export interface Project {
  id: string;
  name: string;
  status: "generating" | "complete" | "failed";
  created_at: string;
  cost_eur: number | null;
  thumbnail_url: string | null;
}

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
}

const statusColors: Record<Project["status"], string> = {
  generating: "bg-[var(--brand)]/15 text-[var(--brand)]",
  complete: "bg-[var(--success)]/15 text-[var(--success)]",
  failed: "bg-[var(--error)]/15 text-[var(--error)]",
};

const statusLabels: Record<Project["status"], string> = {
  generating: "Generating",
  complete: "Complete",
  failed: "Failed",
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function ProjectCard({ project, onDelete, onRename }: ProjectCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(project.name);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  function commitRename() {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== project.name) {
      onRename(project.id, trimmed);
    } else {
      setEditName(project.name);
    }
    setEditing(false);
  }

  return (
    <div className="group relative rounded-2xl border border-[var(--border)] bg-[var(--deep)] overflow-hidden transition-colors hover:border-[var(--elevated)]">
      {/* Thumbnail */}
      <Link
        href={`/generate/${project.id}`}
        className="block aspect-[16/10] bg-[var(--surface)] relative overflow-hidden focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
      >
        {project.thumbnail_url ? (
          <img
            src={project.thumbnail_url}
            alt={project.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-xs text-[var(--text-muted)] font-[var(--font-body)]">
              No preview
            </span>
          </div>
        )}
        {project.status === "generating" && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--void)]/50">
            <Loader2 className="w-5 h-5 text-[var(--brand)] animate-spin" />
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            {editing ? (
              <input
                ref={inputRef}
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename();
                  if (e.key === "Escape") {
                    setEditName(project.name);
                    setEditing(false);
                  }
                }}
                className="w-full bg-transparent border-b border-[var(--brand)] text-sm font-medium text-[var(--text-primary)] font-[var(--font-body)] outline-none py-0.5"
              />
            ) : (
              <p className="text-sm font-medium text-[var(--text-primary)] font-[var(--font-body)] truncate">
                {project.name}
              </p>
            )}
          </div>

          {/* Menu trigger */}
          <div ref={menuRef} className="relative shrink-0">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
              aria-label="Project actions"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-40 rounded-xl border border-[var(--border)] bg-[var(--surface)] py-1 z-50">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setEditing(true);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--elevated)] transition-colors font-[var(--font-body)] focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Rename
                </button>
                <a
                  href={`${API_BASE}/api/download/${project.id}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--elevated)] transition-colors font-[var(--font-body)] focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </a>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(project.id);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--error)] hover:bg-[var(--elevated)] transition-colors font-[var(--font-body)] focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-2 mt-2">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${statusColors[project.status]}`}
          >
            {statusLabels[project.status]}
          </span>
          <span className="text-xs text-[var(--text-muted)] font-[var(--font-body)]">
            {formatDistanceToNow(new Date(project.created_at), {
              addSuffix: true,
            })}
          </span>
          {project.cost_eur !== null && (
            <span className="text-xs text-[var(--text-muted)] font-[var(--font-body)] ml-auto">
              {"\u20AC"}
              {project.cost_eur.toFixed(4)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
