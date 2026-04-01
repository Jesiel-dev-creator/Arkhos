import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { codeToHtml } from "shiki";
import TreeView, { type TreeNode } from "@/components/ui/tree-view";

interface CodeDrawerProps {
  files: Record<string, string> | null;
  show: boolean;
  onClose: () => void;
}

/** Convert a flat file map to a TreeNode[] hierarchy. */
function filesToTree(files: Record<string, string>): TreeNode[] {
  const root: TreeNode[] = [];
  for (const path of Object.keys(files).sort()) {
    const parts = path.split("/");
    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      const isFile = i === parts.length - 1;
      let existing = current.find((n) => n.name === name);
      if (!existing) {
        existing = {
          name,
          type: isFile ? "file" : "folder",
          children: isFile ? undefined : [],
        };
        current.push(existing);
      }
      if (!isFile && existing.children) current = existing.children;
    }
  }
  return root;
}

/** Find the full file path that matches a clicked TreeNode by walking the tree. */
function findFilePath(
  node: TreeNode,
  files: Record<string, string>,
): string | null {
  const paths = Object.keys(files);
  // For a file node, find a path that ends with the node name
  if (node.type === "file") {
    return (
      paths.find(
        (p) => p.endsWith(`/${node.name}`) || p === node.name,
      ) ?? null
    );
  }
  return null;
}

/** Determine shiki language from file extension. */
function langFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    ts: "typescript",
    tsx: "tsx",
    js: "javascript",
    jsx: "jsx",
    css: "css",
    html: "html",
    json: "json",
    md: "markdown",
    py: "python",
    yaml: "yaml",
    yml: "yaml",
    toml: "toml",
    sh: "bash",
    bash: "bash",
  };
  return map[ext] ?? "text";
}

/** Pick the first .tsx or .ts file, falling back to the first file overall. */
function pickDefaultFile(files: Record<string, string>): string | null {
  const keys = Object.keys(files).sort();
  const tsxFile = keys.find((k) => k.endsWith(".tsx"));
  if (tsxFile) return tsxFile;
  const tsFile = keys.find((k) => k.endsWith(".ts"));
  if (tsFile) return tsFile;
  return keys[0] ?? null;
}

export default function CodeDrawer({ files, show, onClose }: CodeDrawerProps) {
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [highlightedHtml, setHighlightedHtml] = useState<string>("");

  const tree = useMemo(() => (files ? filesToTree(files) : []), [files]);

  // Auto-select first .tsx/.ts file when files change
  useEffect(() => {
    if (files) {
      setActiveFile(pickDefaultFile(files));
    } else {
      setActiveFile(null);
    }
  }, [files]);

  // Run shiki highlighting when active file changes
  useEffect(() => {
    if (!activeFile || !files || !files[activeFile]) {
      setHighlightedHtml("");
      return;
    }

    let cancelled = false;

    codeToHtml(files[activeFile], {
      lang: langFromPath(activeFile),
      theme: "github-dark",
    }).then((html) => {
      if (!cancelled) setHighlightedHtml(html);
    });

    return () => {
      cancelled = true;
    };
  }, [activeFile, files]);

  const handleNodeSelect = useCallback(
    (node: TreeNode) => {
      if (node.type !== "file" || !files) return;
      const path = findFilePath(node, files);
      if (path) setActiveFile(path);
    },
    [files],
  );

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 300 }}
          exit={{ height: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden border-t"
          style={{
            borderColor: "#1C2E42",
            backgroundColor: "#020408",
          }}
        >
          {/* Header bar */}
          <div
            className="flex items-center justify-between px-4 py-1.5 text-xs"
            style={{
              backgroundColor: "#0D1B2A",
              borderBottom: "1px solid #1C2E42",
            }}
          >
            <span
              className="font-mono truncate"
              style={{ color: "#7B8FA3" }}
            >
              {activeFile ?? "No file selected"}
            </span>
            <button
              onClick={onClose}
              className="p-0.5 rounded hover:bg-white/10 transition-colors"
              aria-label="Close code drawer"
            >
              <X className="w-4 h-4" style={{ color: "#7B8FA3" }} />
            </button>
          </div>

          {/* Split layout */}
          <div className="flex h-[calc(100%-28px)]">
            {/* Tree panel — 30% */}
            <div
              className="w-[30%] overflow-auto"
              style={{
                backgroundColor: "#0D1B2A",
                borderRight: "1px solid #1C2E42",
              }}
            >
              <TreeView
                data={tree}
                onSelect={handleNodeSelect}
              />
            </div>

            {/* Code panel — 70% */}
            <div
              className="w-[70%] overflow-auto text-sm"
              style={{ backgroundColor: "#020408" }}
            >
              {highlightedHtml ? (
                <div
                  className="p-4 [&_pre]:!bg-transparent [&_pre]:!m-0 [&_code]:text-xs [&_code]:font-mono"
                  dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                />
              ) : (
                <div
                  className="flex items-center justify-center h-full text-sm"
                  style={{ color: "#7B8FA3" }}
                >
                  Select a file to view its source
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
