"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { WebContainer } from "@webcontainer/api";

export interface WebContainerState {
  status: "idle" | "booting" | "ready" | "installing" | "running" | "error";
  url: string | null;
  error: string | null;
}

const INITIAL_STATE: WebContainerState = {
  status: "idle",
  url: null,
  error: null,
};

// WebContainer is a singleton per page — only one instance allowed
let instancePromise: Promise<WebContainer> | null = null;

function getOrBootInstance(): Promise<WebContainer> {
  if (!instancePromise) {
    instancePromise = WebContainer.boot();
  }
  return instancePromise;
}

/**
 * Hook to run generated files in a WebContainer for live preview.
 * Mount files, install deps, and start a dev server — returns an iframe-ready URL.
 */
export function useWebContainer() {
  const [state, setState] = useState<WebContainerState>({ ...INITIAL_STATE });
  const containerRef = useRef<WebContainer | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const safe = useCallback(
    (updater: (prev: WebContainerState) => WebContainerState) => {
      if (mountedRef.current) setState(updater);
    },
    [],
  );

  const boot = useCallback(async () => {
    if (containerRef.current) return containerRef.current;

    safe((prev) => ({ ...prev, status: "booting", error: null }));

    try {
      const instance = await getOrBootInstance();
      containerRef.current = instance;
      safe((prev) => ({ ...prev, status: "ready" }));
      return instance;
    } catch (err) {
      safe((prev) => ({
        ...prev,
        status: "error",
        error: err instanceof Error ? err.message : "Failed to boot WebContainer",
      }));
      return null;
    }
  }, [safe]);

  /**
   * Mount files into the WebContainer.
   * Accepts a flat Record<path, content> (as streamed from SSE file_chunk events).
   */
  const mountFiles = useCallback(
    async (files: Record<string, string>) => {
      const instance = containerRef.current ?? (await boot());
      if (!instance) return;

      // Convert flat paths to WebContainer's nested FileSystemTree
      const tree = buildFileTree(files);
      try {
        await instance.mount(tree);
      } catch (err) {
        safe((prev) => ({
          ...prev,
          status: "error",
          error: err instanceof Error ? err.message : "Failed to mount files",
        }));
      }
    },
    [boot],
  );

  /**
   * Install dependencies and start a dev server.
   * Returns the preview URL when the server starts listening.
   */
  const startDevServer = useCallback(async (): Promise<string | null> => {
    const instance = containerRef.current;
    if (!instance) return null;

    safe((prev) => ({ ...prev, status: "installing", error: null }));

    try {
      // Install
      const installProcess = await instance.spawn("npm", ["install"]);
      const installCode = await installProcess.exit;
      if (installCode !== 0) {
        safe((prev) => ({
          ...prev,
          status: "error",
          error: `npm install exited with code ${installCode}`,
        }));
        return null;
      }

      // Start dev server
      safe((prev) => ({ ...prev, status: "running" }));
      const devProcess = await instance.spawn("npm", ["run", "dev"]);

      // Pipe stderr/stdout for debugging (silent — no UI for logs yet)
      devProcess.output.pipeTo(
        new WritableStream({ write() {} }),
      );

      // Wait for the server to be ready
      const url = await new Promise<string>((resolve) => {
        instance.on("server-ready", (_port, serverUrl) => {
          resolve(serverUrl);
        });
      });

      safe((prev) => ({ ...prev, url }));
      return url;
    } catch (err) {
      safe((prev) => ({
        ...prev,
        status: "error",
        error: err instanceof Error ? err.message : "Dev server failed",
      }));
      return null;
    }
  }, [safe]);

  /**
   * Full workflow: mount files → install → start server.
   */
  const mountAndServe = useCallback(
    async (files: Record<string, string>): Promise<string | null> => {
      await mountFiles(files);
      return startDevServer();
    },
    [mountFiles, startDevServer],
  );

  return { state, boot, mountFiles, startDevServer, mountAndServe };
}

/* ── Helpers ── */

interface FileNode {
  file: { contents: string };
}

interface DirNode {
  directory: Record<string, FileNode | DirNode>;
}

type TreeNode = FileNode | DirNode;

/**
 * Converts flat { "src/App.tsx": "..." } to WebContainer's nested FileSystemTree.
 */
function buildFileTree(files: Record<string, string>): Record<string, TreeNode> {
  const root: Record<string, TreeNode> = {};

  for (const [rawPath, contents] of Object.entries(files)) {
    // Sanitize: strip leading ./ or /
    const cleaned = rawPath.replace(/^\.?\/+/, "");
    const segments = cleaned.split("/").filter(Boolean);

    // Only reject truly invalid paths: traversal (..) or OS-forbidden chars
    if (
      segments.length === 0 ||
      segments.some((s) => s === ".." || /[<>:"|?*]/.test(s))
    ) {
      continue;
    }

    let current = root;

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const isLast = i === segments.length - 1;

      if (isLast) {
        current[seg] = { file: { contents } };
      } else {
        if (!current[seg]) {
          current[seg] = { directory: {} };
        }
        const node = current[seg] as DirNode;
        current = node.directory;
      }
    }
  }

  return root;
}
