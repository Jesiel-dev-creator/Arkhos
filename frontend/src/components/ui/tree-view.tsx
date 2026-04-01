"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Folder, File, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TreeNode {
  name: string;
  type: "file" | "folder";
  children?: TreeNode[];
}

interface TreeViewProps {
  data: TreeNode[];
  className?: string;
  onSelect?: (node: TreeNode) => void;
}

interface TreeItemProps {
  node: TreeNode;
  depth: number;
  onSelect?: (node: TreeNode) => void;
}

function TreeItem({ node, depth, onSelect }: TreeItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = useCallback(() => {
    if (node.type === "folder") {
      setIsOpen((prev) => !prev);
    }
    onSelect?.(node);
  }, [node, onSelect]);

  const isFolder = node.type === "folder";

  return (
    <div>
      <button
        onClick={handleToggle}
        className={cn(
          "flex items-center gap-1.5 w-full py-1 px-2 rounded-md text-sm",
          "hover:bg-neutral-800/50 transition-colors text-left",
          "text-neutral-300 hover:text-white"
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {isFolder && (
          <motion.span
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.15 }}
            className="flex-shrink-0"
          >
            <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
          </motion.span>
        )}
        {!isFolder && <span className="w-3.5" />}
        <span className="flex-shrink-0">
          {isFolder ? (
            isOpen ? (
              <FolderOpen className="w-4 h-4 text-amber-400" />
            ) : (
              <Folder className="w-4 h-4 text-amber-400" />
            )
          ) : (
            <File className="w-4 h-4 text-neutral-400" />
          )}
        </span>
        <span className="truncate">{node.name}</span>
      </button>

      <AnimatePresence initial={false}>
        {isFolder && isOpen && node.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {node.children.map((child, index) => (
              <TreeItem
                key={`${child.name}-${index}`}
                node={child}
                depth={depth + 1}
                onSelect={onSelect}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TreeView({ data, className, onSelect }: TreeViewProps) {
  return (
    <div className={cn("py-2", className)}>
      {data.map((node, index) => (
        <TreeItem key={`${node.name}-${index}`} node={node} depth={0} onSelect={onSelect} />
      ))}
    </div>
  );
}
