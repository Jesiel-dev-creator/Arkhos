"use client"

import * as React from "react"
import { useState } from "react"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import { cn } from "@/lib/utils"

const resolvedTheme = "dark"

interface FileViewerProps {
  /** Map of file paths to file contents */
  files: Record<string, string>
  /** Currently active file path */
  activeFile?: string
  /** Called when user selects a file */
  onFileSelect?: (filePath: string) => void
  /** Additional className for the root container */
  className?: string
}

interface TreeNode {
  name: string
  path: string
  type: "file" | "folder"
  children?: TreeNode[]
}

function buildTree(paths: string[]): TreeNode[] {
  const root: TreeNode[] = []

  for (const filePath of paths) {
    const parts = filePath.split("/")
    let current = root

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const isFile = i === parts.length - 1
      const existingNode = current.find((n) => n.name === part)

      if (existingNode) {
        if (existingNode.children) {
          current = existingNode.children
        }
      } else {
        const newNode: TreeNode = {
          name: part,
          path: parts.slice(0, i + 1).join("/"),
          type: isFile ? "file" : "folder",
          children: isFile ? undefined : [],
        }
        current.push(newNode)
        if (newNode.children) {
          current = newNode.children
        }
      }
    }
  }

  return root
}

function getFileIcon(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase()
  switch (ext) {
    case "ts":
    case "tsx":
      return "TS"
    case "js":
    case "jsx":
      return "JS"
    case "css":
      return "CS"
    case "html":
      return "HT"
    case "json":
      return "JS"
    case "md":
      return "MD"
    case "py":
      return "PY"
    default:
      return "F"
  }
}

function TreeItem({
  node,
  depth,
  activeFile,
  onFileSelect,
}: {
  node: TreeNode
  depth: number
  activeFile?: string
  onFileSelect?: (path: string) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const isActive = node.path === activeFile

  if (node.type === "folder") {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center gap-1.5 py-1 px-2 text-left text-sm hover:bg-[#1C2E42]/50 transition-colors"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            className={cn(
              "shrink-0 text-[#7B8FA3] transition-transform",
              expanded && "rotate-90"
            )}
          >
            <path
              d="M5 3l4 4-4 4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            className="shrink-0 text-[#00D4EE]"
          >
            <path
              d="M1 3.5C1 2.67 1.67 2 2.5 2H5.5L7 3.5H11.5C12.33 3.5 13 4.17 13 5V10.5C13 11.33 12.33 12 11.5 12H2.5C1.67 12 1 11.33 1 10.5V3.5Z"
              fill="currentColor"
              opacity="0.2"
              stroke="currentColor"
              strokeWidth="0.8"
            />
          </svg>
          <span className="text-[#DCE9F5] truncate">{node.name}</span>
        </button>
        {expanded && node.children && (
          <div>
            {node.children.map((child) => (
              <TreeItem
                key={child.path}
                node={child}
                depth={depth + 1}
                activeFile={activeFile}
                onFileSelect={onFileSelect}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={() => onFileSelect?.(node.path)}
      className={cn(
        "flex w-full items-center gap-1.5 py-1 px-2 text-left text-sm transition-colors",
        isActive
          ? "bg-[#1C2E42] text-[#00D4EE]"
          : "text-[#DCE9F5] hover:bg-[#1C2E42]/50"
      )}
      style={{ paddingLeft: `${depth * 12 + 8}px` }}
    >
      <span className="shrink-0 w-5 text-[10px] font-bold text-[#FF6B35] font-mono">
        {getFileIcon(node.name)}
      </span>
      <span className="truncate">{node.name}</span>
    </button>
  )
}

/**
 * Code file viewer with collapsible file tree and syntax-highlighted code display.
 * Uses react-resizable-panels for the split view layout.
 */
export default function FileViewer({
  files,
  activeFile,
  onFileSelect,
  className,
}: FileViewerProps) {
  const filePaths = Object.keys(files)
  const tree = React.useMemo(() => buildTree(filePaths), [filePaths])
  const currentFile = activeFile || filePaths[0] || ""
  const content = files[currentFile] || ""
  const lines = content.split("\n")

  return (
    <div
      className={cn(
        "rounded-lg border border-[#1C2E42] bg-[#020408] overflow-hidden",
        className
      )}
      data-theme={resolvedTheme}
    >
      <PanelGroup direction="horizontal" className="h-full min-h-[400px]">
        {/* File tree panel */}
        <Panel defaultSize={25} minSize={15} maxSize={40}>
          <div className="h-full overflow-auto border-r border-[#1C2E42] bg-[#0D1B2A]">
            <div className="py-2 px-3 text-xs font-semibold text-[#7B8FA3] uppercase tracking-wider border-b border-[#1C2E42]">
              Explorer
            </div>
            <div className="py-1">
              {tree.map((node) => (
                <TreeItem
                  key={node.path}
                  node={node}
                  depth={0}
                  activeFile={currentFile}
                  onFileSelect={onFileSelect}
                />
              ))}
            </div>
          </div>
        </Panel>

        <PanelResizeHandle className="w-1 bg-[#1C2E42] hover:bg-[#00D4EE]/30 transition-colors" />

        {/* Code panel */}
        <Panel defaultSize={75} minSize={40}>
          <div className="h-full overflow-auto bg-[#020408]">
            {/* File tab */}
            <div className="flex items-center gap-2 py-1.5 px-3 text-xs border-b border-[#1C2E42] bg-[#0D1B2A]">
              <span className="text-[#FF6B35] font-mono font-bold text-[10px]">
                {getFileIcon(currentFile.split("/").pop() || "")}
              </span>
              <span className="text-[#DCE9F5]">
                {currentFile.split("/").pop()}
              </span>
            </div>
            {/* Code content */}
            <div className="p-4 overflow-x-auto">
              <pre className="font-mono text-sm leading-6" style={{ fontFamily: "'Space Mono', monospace" }}>
                <code>
                  {lines.map((line, i) => (
                    <div key={i} className="flex">
                      <span className="inline-block w-10 shrink-0 text-right pr-4 text-[#7B8FA3]/50 select-none">
                        {i + 1}
                      </span>
                      <span className="text-[#DCE9F5]">{line || " "}</span>
                    </div>
                  ))}
                </code>
              </pre>
            </div>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  )
}
