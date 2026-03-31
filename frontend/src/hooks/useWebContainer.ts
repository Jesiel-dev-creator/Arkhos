/**
 * WebContainer hook — eager boot with skeleton + build error detection.
 *
 * Architecture:
 *   Page load → boot → mount skeleton → npm install → Vite → ready
 *   Generation → writeFile per chunk → HMR → sections appear live
 *   Build error → buildError state → auto-fix flow
 */

import { WebContainer } from "@webcontainer/api";
import { useState, useCallback } from "react";

export type WebContainerStatus =
  | "idle"
  | "booting"
  | "installing"
  | "starting"
  | "ready"
  | "error";

/* Module-level singleton — survives React StrictMode double-mount */
let _booted = false;
let _wcInstance: WebContainer | null = null;
let _status: WebContainerStatus = "idle";
let _previewUrl: string | null = null;

export function useWebContainer() {
  const [status, setStatus] = useState<WebContainerStatus>(_status);
  const [previewUrl, setPreviewUrl] = useState<string | null>(_previewUrl);
  const [error, setError] = useState<string | null>(null);
  const [buildError, setBuildError] = useState<string | null>(null);

  /* Sync module state → React state on re-mount */
  const syncStatus = useCallback((s: WebContainerStatus) => {
    _status = s;
    setStatus(s);
  }, []);
  const syncUrl = useCallback((u: string | null) => {
    _previewUrl = u;
    setPreviewUrl(u);
  }, []);

  const bootEagerly = useCallback(async () => {
    /* If already booted (StrictMode re-mount), just sync state */
    if (_booted) {
      setStatus(_status);
      setPreviewUrl(_previewUrl);
      return;
    }
    _booted = true;
    syncStatus("booting");
    setError(null);

    try {
      _wcInstance = await WebContainer.boot();
      await _wcInstance.mount(SKELETON_PROJECT);

      syncStatus("installing");
      const install = await _wcInstance.spawn("npm", ["install"]);
      const installCode = await install.exit;
      if (installCode !== 0) throw new Error("npm install failed");

      syncStatus("starting");
      const dev = await _wcInstance.spawn("npm", ["run", "dev"]);

      // Watch Vite output for build errors
      dev.output.pipeTo(
        new WritableStream({
          write(data) {
            if (
              data.includes("[vite:import-analysis]") ||
              data.includes("Failed to resolve import") ||
              data.includes("Cannot find module") ||
              data.includes("SyntaxError")
            ) {
              setBuildError(data.trim().slice(0, 300));
            }
            if (data.includes("page reload") || data.includes("hmr update")) {
              setBuildError(null);
            }
          },
        })
      );

      _wcInstance.on("server-ready", (_: number, url: string) => {
        syncUrl(url);
        syncStatus("ready");
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "WebContainer error";
      console.error("WC boot:", msg);
      setError(msg);
      syncStatus("error");
    }
  }, []);

  const writeFile = useCallback(async (path: string, content: unknown) => {
    if (!_wcInstance) return;
    // Ensure content is always a string (SSE may deliver objects)
    const str = typeof content === "string" ? content : JSON.stringify(content, null, 2);
    const dir = path.split("/").slice(0, -1).join("/");
    if (dir) {
      try {
        await _wcInstance.fs.mkdir(dir, { recursive: true });
      } catch {
        /* dir exists */
      }
    }
    await _wcInstance.fs.writeFile(path, str);
  }, []);

  const clearBuildError = useCallback(() => setBuildError(null), []);

  return {
    status,
    previewUrl,
    error,
    buildError,
    bootEagerly,
    writeFile,
    clearBuildError,
  };
}

/* ═══ Exact pinned versions — MUST match Builder prompt ═══ */

const PKG = JSON.stringify(
  {
    name: "arkhos-site",
    version: "0.0.1",
    scripts: { dev: "vite --host" },
    dependencies: {
      react: "18.3.1",
      "react-dom": "18.3.1",
      "framer-motion": "11.2.10",
      "lucide-react": "0.400.0",
      clsx: "2.1.1",
      "tailwind-merge": "2.4.0",
      "class-variance-authority": "0.7.0",
      "@radix-ui/react-slot": "1.1.0",
      "@radix-ui/react-dialog": "1.1.1",
      "@radix-ui/react-separator": "1.1.0",
      "@radix-ui/react-avatar": "1.1.0",
      "@radix-ui/react-accordion": "1.2.0",
    },
    devDependencies: {
      vite: "5.4.11",
      "@vitejs/plugin-react": "4.3.4",
      tailwindcss: "3.4.17",
      postcss: "8.4.49",
      autoprefixer: "10.4.20",
      typescript: "5.5.4",
      "@types/react": "18.3.12",
      "@types/react-dom": "18.3.1",
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

/* ═══ Pre-baked shadcn/ui components ═══ */

const UI_UTILS = `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }`;

const UI_BUTTON = `import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
const buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",{variants:{variant:{default:"bg-primary text-primary-foreground shadow hover:bg-primary/90",destructive:"bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",outline:"border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",secondary:"bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",ghost:"hover:bg-accent hover:text-accent-foreground",link:"text-primary underline-offset-4 hover:underline"},size:{default:"h-9 px-4 py-2",sm:"h-8 rounded-md px-3 text-xs",lg:"h-10 rounded-md px-8",icon:"h-9 w-9"}},defaultVariants:{variant:"default",size:"default"}})
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>,VariantProps<typeof buttonVariants>{asChild?:boolean}
const Button=React.forwardRef<HTMLButtonElement,ButtonProps>(({className,variant,size,asChild=false,...props},ref)=>{const Comp=asChild?Slot:"button";return<Comp className={cn(buttonVariants({variant,size,className}))} ref={ref} {...props}/>})
Button.displayName="Button"
export{Button,buttonVariants}`;

const UI_CARD = `import * as React from "react"
import { cn } from "@/lib/utils"
const Card=React.forwardRef<HTMLDivElement,React.HTMLAttributes<HTMLDivElement>>(({className,...props},ref)=><div ref={ref} className={cn("rounded-xl border bg-card text-card-foreground shadow",className)} {...props}/>);Card.displayName="Card"
const CardHeader=React.forwardRef<HTMLDivElement,React.HTMLAttributes<HTMLDivElement>>(({className,...props},ref)=><div ref={ref} className={cn("flex flex-col space-y-1.5 p-6",className)} {...props}/>);CardHeader.displayName="CardHeader"
const CardTitle=React.forwardRef<HTMLDivElement,React.HTMLAttributes<HTMLDivElement>>(({className,...props},ref)=><div ref={ref} className={cn("font-semibold leading-none tracking-tight",className)} {...props}/>);CardTitle.displayName="CardTitle"
const CardDescription=React.forwardRef<HTMLDivElement,React.HTMLAttributes<HTMLDivElement>>(({className,...props},ref)=><div ref={ref} className={cn("text-sm text-muted-foreground",className)} {...props}/>);CardDescription.displayName="CardDescription"
const CardContent=React.forwardRef<HTMLDivElement,React.HTMLAttributes<HTMLDivElement>>(({className,...props},ref)=><div ref={ref} className={cn("p-6 pt-0",className)} {...props}/>);CardContent.displayName="CardContent"
const CardFooter=React.forwardRef<HTMLDivElement,React.HTMLAttributes<HTMLDivElement>>(({className,...props},ref)=><div ref={ref} className={cn("flex items-center p-6 pt-0",className)} {...props}/>);CardFooter.displayName="CardFooter"
export{Card,CardHeader,CardFooter,CardTitle,CardDescription,CardContent}`;

const UI_BADGE = `import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
const badgeVariants=cva("inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",{variants:{variant:{default:"border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",secondary:"border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",destructive:"border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",outline:"text-foreground"}},defaultVariants:{variant:"default"}})
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>,VariantProps<typeof badgeVariants>{}
function Badge({className,variant,...props}:BadgeProps){return<div className={cn(badgeVariants({variant}),className)} {...props}/>}
export{Badge,badgeVariants}`;

const UI_INPUT = `import * as React from "react"
import { cn } from "@/lib/utils"
const Input=React.forwardRef<HTMLInputElement,React.InputHTMLAttributes<HTMLInputElement>>(({className,type,...props},ref)=><input type={type} className={cn("flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",className)} ref={ref} {...props}/>)
Input.displayName="Input"
export{Input}`;

const UI_TEXTAREA = `import * as React from "react"
import { cn } from "@/lib/utils"
const Textarea=React.forwardRef<HTMLTextAreaElement,React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({className,...props},ref)=><textarea className={cn("flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",className)} ref={ref} {...props}/>)
Textarea.displayName="Textarea"
export{Textarea}`;

const UI_SEPARATOR = `import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"
import { cn } from "@/lib/utils"
const Separator=React.forwardRef<React.ElementRef<typeof SeparatorPrimitive.Root>,React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>>(({className,orientation="horizontal",decorative=true,...props},ref)=><SeparatorPrimitive.Root ref={ref} decorative={decorative} orientation={orientation} className={cn("shrink-0 bg-border",orientation==="horizontal"?"h-[1px] w-full":"h-full w-[1px]",className)} {...props}/>)
Separator.displayName=SeparatorPrimitive.Root.displayName
export{Separator}`;

const UI_AVATAR = `import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cn } from "@/lib/utils"
const Avatar=React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Root>,React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>>(({className,...props},ref)=><AvatarPrimitive.Root ref={ref} className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",className)} {...props}/>);Avatar.displayName=AvatarPrimitive.Root.displayName
const AvatarImage=React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Image>,React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>>(({className,...props},ref)=><AvatarPrimitive.Image ref={ref} className={cn("aspect-square h-full w-full",className)} {...props}/>);AvatarImage.displayName=AvatarPrimitive.Image.displayName
const AvatarFallback=React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Fallback>,React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>>(({className,...props},ref)=><AvatarPrimitive.Fallback ref={ref} className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted",className)} {...props}/>);AvatarFallback.displayName=AvatarPrimitive.Fallback.displayName
export{Avatar,AvatarImage,AvatarFallback}`;

const UI_SHEET = `import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
const Sheet=SheetPrimitive.Root;const SheetTrigger=SheetPrimitive.Trigger;const SheetClose=SheetPrimitive.Close;const SheetPortal=SheetPrimitive.Portal
const SheetOverlay=React.forwardRef<React.ElementRef<typeof SheetPrimitive.Overlay>,React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>>(({className,...props},ref)=><SheetPrimitive.Overlay className={cn("fixed inset-0 z-50 bg-black/80",className)} {...props} ref={ref}/>);SheetOverlay.displayName=SheetPrimitive.Overlay.displayName
const SheetContent=React.forwardRef<React.ElementRef<typeof SheetPrimitive.Content>,React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>&{side?:"top"|"bottom"|"left"|"right"}>(({side="right",className,children,...props},ref)=><SheetPortal><SheetOverlay/><SheetPrimitive.Content ref={ref} className={cn("fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out",side==="right"&&"inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",side==="left"&&"inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",side==="top"&&"inset-x-0 top-0 border-b",side==="bottom"&&"inset-x-0 bottom-0 border-t",className)} {...props}>{children}<SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"><X className="h-4 w-4"/><span className="sr-only">Close</span></SheetPrimitive.Close></SheetPrimitive.Content></SheetPortal>);SheetContent.displayName=SheetPrimitive.Content.displayName
function SheetHeader({className,...props}:React.HTMLAttributes<HTMLDivElement>){return<div className={cn("flex flex-col space-y-2 text-center sm:text-left",className)} {...props}/>}
function SheetFooter({className,...props}:React.HTMLAttributes<HTMLDivElement>){return<div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",className)} {...props}/>}
const SheetTitle=React.forwardRef<React.ElementRef<typeof SheetPrimitive.Title>,React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>>(({className,...props},ref)=><SheetPrimitive.Title ref={ref} className={cn("text-lg font-semibold text-foreground",className)} {...props}/>);SheetTitle.displayName=SheetPrimitive.Title.displayName
const SheetDescription=React.forwardRef<React.ElementRef<typeof SheetPrimitive.Description>,React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>>(({className,...props},ref)=><SheetPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground",className)} {...props}/>);SheetDescription.displayName=SheetPrimitive.Description.displayName
export{Sheet,SheetPortal,SheetOverlay,SheetTrigger,SheetClose,SheetContent,SheetHeader,SheetFooter,SheetTitle,SheetDescription}`;

const UI_ACCORDION = `import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
const Accordion=AccordionPrimitive.Root
const AccordionItem=React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Item>,React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>>(({className,...props},ref)=><AccordionPrimitive.Item ref={ref} className={cn("border-b",className)} {...props}/>);AccordionItem.displayName="AccordionItem"
const AccordionTrigger=React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Trigger>,React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>>(({className,children,...props},ref)=><AccordionPrimitive.Header className="flex"><AccordionPrimitive.Trigger ref={ref} className={cn("flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",className)} {...props}>{children}<ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200"/></AccordionPrimitive.Trigger></AccordionPrimitive.Header>);AccordionTrigger.displayName=AccordionPrimitive.Trigger.displayName
const AccordionContent=React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Content>,React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>>(({className,children,...props},ref)=><AccordionPrimitive.Content ref={ref} className="overflow-hidden text-sm" {...props}><div className={cn("pb-4 pt-0",className)}>{children}</div></AccordionPrimitive.Content>);AccordionContent.displayName=AccordionPrimitive.Content.displayName
export{Accordion,AccordionItem,AccordionTrigger,AccordionContent}`;

/* ═══ Skeleton project tree ═══ */

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
      lib: { directory: { "utils.ts": { file: { contents: UI_UTILS } } } },
      components: {
        directory: {
          ui: {
            directory: {
              "button.tsx": { file: { contents: UI_BUTTON } },
              "card.tsx": { file: { contents: UI_CARD } },
              "badge.tsx": { file: { contents: UI_BADGE } },
              "input.tsx": { file: { contents: UI_INPUT } },
              "textarea.tsx": { file: { contents: UI_TEXTAREA } },
              "separator.tsx": { file: { contents: UI_SEPARATOR } },
              "avatar.tsx": { file: { contents: UI_AVATAR } },
              "sheet.tsx": { file: { contents: UI_SHEET } },
              "accordion.tsx": { file: { contents: UI_ACCORDION } },
            },
          },
        },
      },
      sections: { directory: {} },
    },
  },
};
