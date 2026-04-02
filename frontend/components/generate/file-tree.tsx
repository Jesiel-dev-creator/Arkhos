"use client";

import { useMemo, useState } from "react";
import { ChevronRight, File, Folder, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileTreeProps {
  files: string[];
  activeFile: string | null;
  onSelect: (path: string) => void;
}

interface TreeNode {
  name: string;
  path: string;
  children: TreeNode[];
  isFile: boolean;
}

function buildTree(paths: string[]): TreeNode[] {
  const root: TreeNode = { name: "", path: "", children: [], isFile: false };

  for (const p of paths) {
    const parts = p.split("/").filter(Boolean);
    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      const fullPath = parts.slice(0, i + 1).join("/");
      const isFile = i === parts.length - 1;
      let child = current.children.find((c) => c.name === name);
      if (!child) {
        child = { name, path: fullPath, children: [], isFile };
        current.children.push(child);
      }
      current = child;
    }
  }

  function sortTree(nodes: TreeNode[]): TreeNode[] {
    return nodes
      .sort((a, b) => {
        if (a.isFile !== b.isFile) return a.isFile ? 1 : -1;
        return a.name.localeCompare(b.name);
      })
      .map((n) => ({ ...n, children: sortTree(n.children) }));
  }

  return sortTree(root.children);
}

function TreeItem({
  node,
  depth,
  activeFile,
  onSelect,
  expanded,
  onToggle,
}: {
  node: TreeNode;
  depth: number;
  activeFile: string | null;
  onSelect: (path: string) => void;
  expanded: Set<string>;
  onToggle: (path: string) => void;
}) {
  const isOpen = expanded.has(node.path);
  const isActive = node.path === activeFile;

  if (node.isFile) {
    return (
      <button
        type="button"
        onClick={() => onSelect(node.path)}
        aria-current={isActive ? "true" : undefined}
        className={cn(
          "w-full flex items-center gap-1.5 py-1 pr-2 text-xs rounded transition-colors duration-100 cursor-pointer",
          "focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none",
          isActive
            ? "bg-[var(--surface)] text-[var(--text-primary)]"
            : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface)]/50",
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        <File className="w-3 h-3 shrink-0" />
        <span className="truncate font-[var(--font-code)]">{node.name}</span>
      </button>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => onToggle(node.path)}
        className={cn(
          "w-full flex items-center gap-1.5 py-1 pr-2 text-xs text-[var(--text-muted)] rounded transition-colors duration-100 cursor-pointer",
          "hover:text-[var(--text-secondary)] focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none",
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        <ChevronRight
          className={cn(
            "w-3 h-3 shrink-0 transition-transform duration-150",
            isOpen && "rotate-90",
          )}
        />
        <Folder className="w-3 h-3 shrink-0" />
        <span className="truncate font-medium">{node.name}</span>
      </button>
      {isOpen &&
        node.children.map((child) => (
          <TreeItem
            key={child.path}
            node={child}
            depth={depth + 1}
            activeFile={activeFile}
            onSelect={onSelect}
            expanded={expanded}
            onToggle={onToggle}
          />
        ))}
    </div>
  );
}

export function FileTree({ files, activeFile, onSelect }: FileTreeProps) {
  const [search, setSearch] = useState("");

  const filteredFiles = useMemo(() => {
    if (!search.trim()) return files;
    const query = search.trim().toLowerCase();
    return files.filter((f) => f.toLowerCase().includes(query));
  }, [files, search]);

  const tree = useMemo(() => buildTree(filteredFiles), [filteredFiles]);

  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const dirs = new Set<string>();
    for (const f of files) {
      const parts = f.split("/").filter(Boolean);
      for (let i = 1; i < parts.length; i++) {
        dirs.add(parts.slice(0, i).join("/"));
      }
    }
    return dirs;
  });

  const onToggle = (path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  return (
    <nav aria-label="File tree" className="p-2 space-y-0.5">
      <div className="relative mb-2">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-muted)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search files..."
          className="w-full pl-6 pr-2 py-1 text-xs rounded-md border border-[var(--border)] bg-[var(--void)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:outline-none"
        />
      </div>
      {tree.map((node) => (
        <TreeItem
          key={node.path}
          node={node}
          depth={0}
          activeFile={activeFile}
          onSelect={onSelect}
          expanded={expanded}
          onToggle={onToggle}
        />
      ))}
    </nav>
  );
}
