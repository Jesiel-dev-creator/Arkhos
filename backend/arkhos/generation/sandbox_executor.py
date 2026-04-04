# arkhos/generation/sandbox_executor.py
"""Sandbox executor for ArkhosAI — Lovable-style live preview with streaming files.

Architecture:
  1. scaffold_project() — creates React+Vite base, runs pnpm install, starts dev server
  2. write_file() — streams individual files as Builder generates them (Vite HMR hot-reloads)
  3. No more "wait for all files then install" — preview is live from the start
"""

from __future__ import annotations

import logging
import shlex
import time

from arkhos.config import get_settings
from arkhos.sandbox import SandboxClient

logger = logging.getLogger(__name__)

WORKSPACE_ROOT = "/workspace"
PREVIEW_PORT_MIN = 3010
PREVIEW_PORT_MAX = 3060

# Minimal React + Vite scaffold — enough to boot a dev server
# Generated component files get dropped into src/ and Vite HMR picks them up
SCAFFOLD_FILES: dict[str, str] = {
    "package.json": """{
  "name": "arkhos-generated",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "lucide-react": "^0.511.0",
    "framer-motion": "^12.12.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.3.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.5.2",
    "vite": "^6.3.5",
    "@types/react": "^19.1.4",
    "@types/react-dom": "^19.1.5",
    "typescript": "^5.8.3",
    "@tailwindcss/postcss": "^4.1.8",
    "postcss": "^8.5.4",
    "tailwindcss": "^4.1.8"
  }
}""",
    "index.html": """<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ArkhosAI Preview</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>""",
    "vite.config.ts": "",  # overridden with dynamic port in scaffold_project()
    "src/main.tsx": """import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)""",
    "tsconfig.json": """{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"]
}""",
    "postcss.config.js": """export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}""",
    "src/lib/utils.ts": """import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
""",
    "src/index.css": """@import "tailwindcss";
""",
}


class SandboxExecutor:
    """Lovable-style live preview executor.

    Instead of waiting for all files, this:
    1. Scaffolds the project (React+Vite+Tailwind)
    2. Runs pnpm install + starts dev server FIRST
    3. Files stream in one-by-one via write_file() — Vite HMR hot-reloads each one

    The user sees the preview building up live, file by file.
    """

    def __init__(
        self,
        sandbox_url: str | None = None,
        preview_url: str | None = None,
    ) -> None:
        settings = get_settings()
        self.sandbox = SandboxClient(base_url=sandbox_url or settings.sandbox_url)
        self.preview_url = preview_url or settings.sandbox_preview_url
        self.workspace: str | None = None
        self._server_running = False

    async def scaffold_project(
        self, project_name: str = "arkhos-app", port: int = 3010
    ) -> dict[str, str | int | float | bool]:
        """Phase 1: Create scaffold, install deps, start dev server.

        Call this BEFORE the Builder starts. Returns immediately with preview URL.
        Files can then be streamed in via write_file().
        
        Args:
            project_name: Name of the project (e.g., gen-1234567890)
            port: Dynamic port allocated for this generation (3010-3060 range)
        """
        self.workspace = f"{WORKSPACE_ROOT}/{shlex.quote(project_name)}"
        t0 = time.monotonic()
        
        # Build preview URL with the allocated port
        preview_url_with_port = f"http://localhost:{port}"

        try:
            if not await self.sandbox.health_check():
                return {"success": False, "error": "Sandbox not reachable", "stage": "connection"}

            # Clean old projects (keep 1 most recent)
            await self.sandbox.execute(
                "cd /workspace && ls -dt gen-* 2>/dev/null | tail -n +2 | "
                "xargs rm -rf 2>/dev/null || true"
            )
            # Note: pkill removed as it's not available in the sandbox container
            # Vite processes will be managed by the port allocation system

            # Create fresh workspace
            await self.sandbox.execute(f"rm -rf {shlex.quote(self.workspace)}")
            await self.sandbox.execute(f"mkdir -p {shlex.quote(self.workspace)}/src/sections")

            # Generate Vite config with dynamic port + @ alias
            dynamic_vite_config = f"""import {{ defineConfig }} from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({{
  plugins: [react()],
  resolve: {{
    alias: {{
      '@': path.resolve(__dirname, './src'),
    }},
  }},
  server: {{
    host: '0.0.0.0',
    port: {port},
    watch: {{
      usePolling: true,
      interval: 100,
    }},
    hmr: {{
      port: {port},
    }},
  }},
}})"""

            # Write scaffold files
            for filepath, content in SCAFFOLD_FILES.items():
                # Use dynamic Vite config instead of static one
                if filepath == "vite.config.ts":
                    content = dynamic_vite_config
                full_path = f"{self.workspace}/{filepath}"
                result = await self.sandbox.write_file(path=full_path, content=content)
                if not result.success:
                    logger.error("Scaffold write failed: %s — %s", filepath, result.error)
                    msg = f"Scaffold failed: {filepath}"
                    return {
                        "success": False,
                        "error": msg,
                        "stage": "scaffold",
                    }

            scaffold_elapsed = round(time.monotonic() - t0, 2)
            logger.info("Sandbox: scaffold written (%.2fs)", scaffold_elapsed)

            # Install dependencies
            install_result = await self.sandbox.execute("pnpm install", cwd=self.workspace)
            if not install_result.success:
                logger.error("pnpm install failed: %s", install_result.stderr[:300])
                return {
                    "success": False,
                    "error": f"pnpm install failed: {install_result.stderr[:300]}",
                    "stage": "install",
                }

            install_elapsed = round(time.monotonic() - t0, 2)
            logger.info("Sandbox: pnpm install OK (%.2fs)", install_elapsed)

            # Start Vite dev server
            await self.sandbox.execute(
                "nohup pnpm dev > /tmp/dev-server.log 2>&1 &",
                cwd=self.workspace,
                timeout=10,
            )
            self._server_running = True

            elapsed = round(time.monotonic() - t0, 2)
            logger.info(
                "Sandbox: dev server started on port %d, total %.2fs — preview at %s",
                port, elapsed, preview_url_with_port
            )

            return {
                "success": True,
                "preview_url": preview_url_with_port,
                "port": port,
                "stage": "running",
                "duration_s": elapsed,
            }

        except Exception as e:
            logger.error("Scaffold failed: %s", e)
            return {"success": False, "error": str(e), "stage": "unknown"}

    async def write_file(self, path: str, content: str) -> bool:
        """Stream a single file to the sandbox. Vite HMR picks it up automatically.

        Call this for each file_chunk as the Builder generates it.
        Returns True if the write succeeded.
        """
        if not self.workspace:
            logger.warning("write_file called before scaffold_project")
            return False

        full_path = f"{self.workspace}/{path}"
        result = await self.sandbox.write_file(path=full_path, content=content)

        if result.success:
            logger.debug("Sandbox: wrote %s (%d chars)", path, len(content))
        else:
            logger.warning("Sandbox: failed to write %s — %s", path, result.error)

        return result.success

    async def execute_generated_project(
        self,
        project_files: dict[str, str],
        project_name: str = "arkhos-generated-app",
        port: int = 3010,
    ) -> dict[str, str | int | float | bool | None]:
        """Batch mode: write all files at once after build completes.

        For live streaming, use scaffold_project() + write_file() instead.
        The port should be allocated by PortManager to avoid collisions.
        """
        result = await self.scaffold_project(project_name, port=port)
        if not result.get("success"):
            return result  # type: ignore[return-value]

        t0 = time.monotonic()
        for filepath, content in project_files.items():
            await self.write_file(filepath, content)

        elapsed = round(time.monotonic() - t0, 2)
        logger.info("Sandbox: %d files written (%.2fs)", len(project_files), elapsed)

        scaffold_duration = result.get("duration_s", 0)
        if not isinstance(scaffold_duration, (int, float)):
            scaffold_duration = 0
        total_duration: float = float(scaffold_duration) + elapsed

        return {
            "success": True,
            "preview_url": result.get("preview_url"),
            "port": port,
            "stage": "running",
            "duration_s": total_duration,
        }

    async def close(self) -> None:
        await self.sandbox.close()

    async def __aenter__(self) -> SandboxExecutor:
        return self

    async def __aexit__(
        self, exc_type: type[BaseException] | None,
        exc_val: BaseException | None,
        exc_tb: object
    ) -> None:
        await self.close()
