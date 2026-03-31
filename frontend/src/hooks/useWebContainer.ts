/**
 * WebContainer hook — boots a browser-side Node.js environment,
 * mounts generated React project files, runs pnpm install + pnpm dev,
 * and returns the preview URL for the iframe.
 *
 * IMPORTANT: Only ONE WebContainer instance per page.
 * Boot once, reuse for all generations and iterations.
 */

import { WebContainer } from "@webcontainer/api";
import { useState, useRef, useCallback } from "react";

export type WebContainerStatus =
  | "idle"
  | "booting"
  | "installing"
  | "starting"
  | "ready"
  | "error";

export function useWebContainer() {
  const [status, setStatus] = useState<WebContainerStatus>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<WebContainer | null>(null);
  const serverProcessRef = useRef<{ kill: () => void } | null>(null);

  const mountProject = useCallback(
    async (files: Record<string, string>) => {
      setError(null);
      setPreviewUrl(null);

      try {
        // Boot (singleton)
        if (!containerRef.current) {
          setStatus("booting");
          containerRef.current = await WebContainer.boot();
        }
        const wc = containerRef.current;

        // Kill any running dev server from previous generation
        if (serverProcessRef.current) {
          serverProcessRef.current.kill();
          serverProcessRef.current = null;
        }

        // Convert flat file dict to WebContainer FileSystemTree
        const tree = flatFilesToTree(files);
        await wc.mount(tree);

        // Install dependencies
        setStatus("installing");
        const install = await wc.spawn("npm", ["install"]);
        const installCode = await install.exit;
        if (installCode !== 0) {
          throw new Error(`npm install failed (exit code ${installCode})`);
        }

        // Start Vite dev server
        setStatus("starting");
        const dev = await wc.spawn("npm", ["run", "dev"]);
        serverProcessRef.current = dev;

        // Wait for server-ready
        wc.on("server-ready", (_port: number, url: string) => {
          setPreviewUrl(url);
          setStatus("ready");
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "WebContainer error";
        setError(msg);
        setStatus("error");
      }
    },
    []
  );

  const updateFile = useCallback(
    async (path: string, content: string) => {
      if (!containerRef.current) return;
      await containerRef.current.fs.writeFile(path, content);
      // Vite HMR picks this up automatically
    },
    []
  );

  const teardown = useCallback(() => {
    if (serverProcessRef.current) {
      serverProcessRef.current.kill();
      serverProcessRef.current = null;
    }
    containerRef.current?.teardown();
    containerRef.current = null;
    setStatus("idle");
    setPreviewUrl(null);
    setError(null);
  }, []);

  return { status, previewUrl, error, mountProject, updateFile, teardown };
}

/**
 * Convert {"src/App.tsx": "...", "package.json": "..."}
 * to WebContainer FileSystemTree format.
 */
function flatFilesToTree(
  files: Record<string, string>
): Record<string, unknown> {
  const tree: Record<string, unknown> = {};

  for (const [filePath, content] of Object.entries(files)) {
    const parts = filePath.split("/");
    let current = tree;

    for (let i = 0; i < parts.length - 1; i++) {
      const dir = parts[i];
      if (!current[dir]) {
        current[dir] = { directory: {} };
      }
      current = (current[dir] as { directory: Record<string, unknown> })
        .directory;
    }

    const fileName = parts[parts.length - 1];
    current[fileName] = { file: { contents: content } };
  }

  return tree;
}
