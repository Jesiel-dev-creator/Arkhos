/**
 * WebContainer hook — eager boot with skeleton project.
 *
 * Architecture:
 *   Page load → boot WC → mount skeleton → npm install → Vite start → ready
 *   Generation → each file written via writeFile() → HMR updates preview live
 *
 * Only ONE WebContainer instance per page. Boot once, reuse forever.
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
  const wcRef = useRef<WebContainer | null>(null);
  const bootedRef = useRef(false);

  /** Call ONCE on page mount — boots WC and starts Vite before any generation. */
  const bootEagerly = useCallback(async () => {
    if (bootedRef.current) return;
    bootedRef.current = true;
    setStatus("booting");
    setError(null);

    try {
      wcRef.current = await WebContainer.boot();
      await wcRef.current.mount(SKELETON_PROJECT);

      setStatus("installing");
      const install = await wcRef.current.spawn("npm", ["install"]);
      const installCode = await install.exit;
      if (installCode !== 0) throw new Error("npm install failed");

      setStatus("starting");
      await wcRef.current.spawn("npm", ["run", "dev"]);
      wcRef.current.on("server-ready", (_: number, url: string) => {
        setPreviewUrl(url);
        setStatus("ready");
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "WebContainer error";
      console.error("WC boot:", msg);
      setError(msg);
      setStatus("error");
    }
  }, []);

  /** Write a single file into the running WebContainer. Triggers Vite HMR. */
  const writeFile = useCallback(async (path: string, content: string) => {
    if (!wcRef.current) return;
    const dir = path.split("/").slice(0, -1).join("/");
    if (dir) {
      try {
        await wcRef.current.fs.mkdir(dir, { recursive: true });
      } catch {
        /* dir already exists */
      }
    }
    await wcRef.current.fs.writeFile(path, content);
  }, []);

  return { status, previewUrl, error, bootEagerly, writeFile };
}

/* ═══ Skeleton project — enough for Vite to boot ═══ */

const PKG = JSON.stringify(
  {
    name: "arkhos-site",
    version: "0.0.1",
    scripts: { dev: "vite --host" },
    dependencies: {
      react: "^18.3.1",
      "react-dom": "^18.3.1",
      "framer-motion": "^11.0.0",
      "lucide-react": "^0.400.0",
      clsx: "^2.1.1",
      "tailwind-merge": "^2.4.0",
      "class-variance-authority": "^0.7.0",
      "@radix-ui/react-slot": "^1.1.0",
      "@radix-ui/react-dialog": "^1.1.0",
      "@radix-ui/react-separator": "^1.1.0",
      "@radix-ui/react-avatar": "^1.1.0",
      "@radix-ui/react-accordion": "^1.2.0",
    },
    devDependencies: {
      vite: "^5.4.0",
      "@vitejs/plugin-react": "^4.3.1",
      tailwindcss: "^3.4.0",
      postcss: "^8.4.0",
      autoprefixer: "^10.4.0",
      typescript: "^5.5.0",
      "@types/react": "^18.3.0",
      "@types/react-dom": "^18.3.0",
    },
  },
  null,
  2
);

const VITE_CFG = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  server: { host: true },
  resolve: { alias: { '@': '/src' } },
})`;

const TW_CFG = `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
}`;

const POSTCSS = `export default {
  plugins: { tailwindcss: {}, autoprefixer: {} },
}`;

const INDEX_HTML = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>ArkhosAI Preview</title></head>
<body><div id="root"></div>
<script type="module" src="/src/main.tsx"></script></body></html>`;

const MAIN_TSX = `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
ReactDOM.createRoot(document.getElementById('root')!).render(<App />)`;

const APP_TSX = `export default function App() {
  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center',
      justifyContent:'center', background:'#020408', color:'#7B8FA3',
      fontFamily:'monospace', fontSize:'14px'
    }}>
      Generating your site...
    </div>
  )
}`;

const INDEX_CSS = `@tailwind base;
@tailwind components;
@tailwind utilities;`;

const TSCONFIG = JSON.stringify(
  {
    compilerOptions: {
      target: "ES2020",
      module: "ESNext",
      moduleResolution: "bundler",
      jsx: "react-jsx",
      strict: true,
      skipLibCheck: true,
      noEmit: true,
      baseUrl: ".",
      paths: { "@/*": ["./src/*"] },
    },
    include: ["src"],
  },
  null,
  2
);

const SKELETON_PROJECT: Record<string, unknown> = {
  "package.json": { file: { contents: PKG } },
  "vite.config.ts": { file: { contents: VITE_CFG } },
  "tailwind.config.ts": { file: { contents: TW_CFG } },
  "postcss.config.js": { file: { contents: POSTCSS } },
  "tsconfig.json": { file: { contents: TSCONFIG } },
  "index.html": { file: { contents: INDEX_HTML } },
  src: {
    directory: {
      "main.tsx": { file: { contents: MAIN_TSX } },
      "App.tsx": { file: { contents: APP_TSX } },
      "index.css": { file: { contents: INDEX_CSS } },
      lib: { directory: {} },
      components: { directory: { ui: { directory: {} } } },
      sections: { directory: {} },
    },
  },
};
