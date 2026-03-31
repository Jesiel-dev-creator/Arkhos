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
      /* Radix UI primitives (used by shadcn/ui) */
      "@radix-ui/react-slot": "1.1.0",
      "@radix-ui/react-dialog": "1.1.1",
      "@radix-ui/react-separator": "1.1.0",
      "@radix-ui/react-avatar": "1.1.0",
      "@radix-ui/react-accordion": "1.2.0",
      "@radix-ui/react-navigation-menu": "1.2.0",
      "@radix-ui/react-tabs": "1.1.0",
      "@radix-ui/react-select": "2.1.1",
      "@radix-ui/react-dropdown-menu": "2.1.1",
      "@radix-ui/react-tooltip": "1.1.2",
      "@radix-ui/react-switch": "1.1.0",
      "@radix-ui/react-toggle": "1.1.0",
      "@radix-ui/react-toggle-group": "1.1.0",
      /* Forms + validation */
      "react-hook-form": "7.52.1",
      "@hookform/resolvers": "3.9.0",
      zod: "3.23.8",
      /* Carousel */
      "embla-carousel-react": "8.1.7",
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
  server: { host: true, hmr: { overlay: false } },
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

const UI_TABS = `import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"
const Tabs=TabsPrimitive.Root
const TabsList=React.forwardRef<React.ElementRef<typeof TabsPrimitive.List>,React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>>(({className,...props},ref)=><TabsPrimitive.List ref={ref} className={cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",className)} {...props}/>);TabsList.displayName=TabsPrimitive.List.displayName
const TabsTrigger=React.forwardRef<React.ElementRef<typeof TabsPrimitive.Trigger>,React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>>(({className,...props},ref)=><TabsPrimitive.Trigger ref={ref} className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",className)} {...props}/>);TabsTrigger.displayName=TabsPrimitive.Trigger.displayName
const TabsContent=React.forwardRef<React.ElementRef<typeof TabsPrimitive.Content>,React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>>(({className,...props},ref)=><TabsPrimitive.Content ref={ref} className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",className)} {...props}/>);TabsContent.displayName=TabsPrimitive.Content.displayName
export{Tabs,TabsList,TabsTrigger,TabsContent}`;

const UI_SELECT = `import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check,ChevronDown,ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
const Select=SelectPrimitive.Root;const SelectGroup=SelectPrimitive.Group;const SelectValue=SelectPrimitive.Value
const SelectTrigger=React.forwardRef<React.ElementRef<typeof SelectPrimitive.Trigger>,React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>>(({className,children,...props},ref)=><SelectPrimitive.Trigger ref={ref} className={cn("flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",className)} {...props}>{children}<SelectPrimitive.Icon asChild><ChevronDown className="h-4 w-4 opacity-50"/></SelectPrimitive.Icon></SelectPrimitive.Trigger>);SelectTrigger.displayName=SelectPrimitive.Trigger.displayName
const SelectContent=React.forwardRef<React.ElementRef<typeof SelectPrimitive.Content>,React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>>(({className,children,position="popper",...props},ref)=><SelectPrimitive.Portal><SelectPrimitive.Content ref={ref} className={cn("relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",position==="popper"&&"translate-y-1",className)} position={position} {...props}><SelectPrimitive.Viewport className={cn("p-1",position==="popper"&&"h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]")}>{children}</SelectPrimitive.Viewport></SelectPrimitive.Content></SelectPrimitive.Portal>);SelectContent.displayName=SelectPrimitive.Content.displayName
const SelectItem=React.forwardRef<React.ElementRef<typeof SelectPrimitive.Item>,React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>>(({className,children,...props},ref)=><SelectPrimitive.Item ref={ref} className={cn("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",className)} {...props}><span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center"><SelectPrimitive.ItemIndicator><Check className="h-4 w-4"/></SelectPrimitive.ItemIndicator></span><SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText></SelectPrimitive.Item>);SelectItem.displayName=SelectPrimitive.Item.displayName
export{Select,SelectGroup,SelectValue,SelectTrigger,SelectContent,SelectItem}`;

const UI_TOOLTIP = `import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils"
const TooltipProvider=TooltipPrimitive.Provider;const Tooltip=TooltipPrimitive.Root;const TooltipTrigger=TooltipPrimitive.Trigger
const TooltipContent=React.forwardRef<React.ElementRef<typeof TooltipPrimitive.Content>,React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>>(({className,sideOffset=4,...props},ref)=><TooltipPrimitive.Content ref={ref} sideOffset={sideOffset} className={cn("z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95",className)} {...props}/>);TooltipContent.displayName=TooltipPrimitive.Content.displayName
export{Tooltip,TooltipTrigger,TooltipContent,TooltipProvider}`;

const UI_DROPDOWN = `import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Check,ChevronRight,Circle } from "lucide-react"
import { cn } from "@/lib/utils"
const DropdownMenu=DropdownMenuPrimitive.Root;const DropdownMenuTrigger=DropdownMenuPrimitive.Trigger;const DropdownMenuGroup=DropdownMenuPrimitive.Group;const DropdownMenuSub=DropdownMenuPrimitive.Sub
const DropdownMenuContent=React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.Content>,React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>>(({className,sideOffset=4,...props},ref)=><DropdownMenuPrimitive.Portal><DropdownMenuPrimitive.Content ref={ref} sideOffset={sideOffset} className={cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",className)} {...props}/></DropdownMenuPrimitive.Portal>);DropdownMenuContent.displayName=DropdownMenuPrimitive.Content.displayName
const DropdownMenuItem=React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.Item>,React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>&{inset?:boolean}>(({className,inset,...props},ref)=><DropdownMenuPrimitive.Item ref={ref} className={cn("relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",inset&&"pl-8",className)} {...props}/>);DropdownMenuItem.displayName=DropdownMenuPrimitive.Item.displayName
const DropdownMenuSeparator=React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.Separator>,React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>>(({className,...props},ref)=><DropdownMenuPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-muted",className)} {...props}/>);DropdownMenuSeparator.displayName=DropdownMenuPrimitive.Separator.displayName
export{DropdownMenu,DropdownMenuTrigger,DropdownMenuContent,DropdownMenuItem,DropdownMenuSeparator,DropdownMenuGroup,DropdownMenuSub}`;

const UI_CAROUSEL = `import * as React from "react"
import useEmblaCarousel,{type UseEmblaCarouselType} from "embla-carousel-react"
import { ArrowLeft,ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
type CarouselApi=UseEmblaCarouselType[1]
type CarouselProps={opts?:any;plugins?:any[];orientation?:"horizontal"|"vertical";setApi?:(api:CarouselApi)=>void}
type CarouselContextProps=CarouselProps&{carouselRef:ReturnType<typeof useEmblaCarousel>[0];api:ReturnType<typeof useEmblaCarousel>[1];scrollPrev:()=>void;scrollNext:()=>void;canScrollPrev:boolean;canScrollNext:boolean}
const CarouselContext=React.createContext<CarouselContextProps|null>(null)
function useCarousel(){const c=React.useContext(CarouselContext);if(!c)throw new Error("useCarousel must be used within <Carousel>");return c}
const Carousel=React.forwardRef<HTMLDivElement,React.HTMLAttributes<HTMLDivElement>&CarouselProps>(({orientation="horizontal",opts,setApi,plugins,className,children,...props},ref)=>{const[carouselRef,api]=useEmblaCarousel({...opts,axis:orientation==="horizontal"?"x":"y"},plugins);const[canScrollPrev,setCanScrollPrev]=React.useState(false);const[canScrollNext,setCanScrollNext]=React.useState(false);const onSelect=React.useCallback((api:CarouselApi)=>{if(!api)return;setCanScrollPrev(api.canScrollPrev());setCanScrollNext(api.canScrollNext())},[]);React.useEffect(()=>{if(!api||!setApi)return;setApi(api)},[api,setApi]);React.useEffect(()=>{if(!api)return;onSelect(api);api.on("reInit",onSelect);api.on("select",onSelect);return()=>{api?.off("select",onSelect)}},[api,onSelect]);return<CarouselContext.Provider value={{carouselRef,api,opts,orientation,scrollPrev:()=>api?.scrollPrev(),scrollNext:()=>api?.scrollNext(),canScrollPrev,canScrollNext}}><div ref={ref} className={cn("relative",className)} role="region" aria-roledescription="carousel" {...props}>{children}</div></CarouselContext.Provider>});Carousel.displayName="Carousel"
const CarouselContent=React.forwardRef<HTMLDivElement,React.HTMLAttributes<HTMLDivElement>>(({className,...props},ref)=>{const{carouselRef,orientation}=useCarousel();return<div ref={carouselRef} className="overflow-hidden"><div ref={ref} className={cn("flex",orientation==="horizontal"?"-ml-4":"flex-col -mt-4",className)} {...props}/></div>});CarouselContent.displayName="CarouselContent"
const CarouselItem=React.forwardRef<HTMLDivElement,React.HTMLAttributes<HTMLDivElement>>(({className,...props},ref)=>{const{orientation}=useCarousel();return<div ref={ref} role="group" aria-roledescription="slide" className={cn("min-w-0 shrink-0 grow-0 basis-full",orientation==="horizontal"?"pl-4":"pt-4",className)} {...props}/>});CarouselItem.displayName="CarouselItem"
const CarouselPrevious=React.forwardRef<HTMLButtonElement,React.ComponentProps<typeof Button>>(({className,variant="outline",size="icon",...props},ref)=>{const{scrollPrev,canScrollPrev}=useCarousel();return<Button ref={ref} variant={variant} size={size} className={cn("absolute h-8 w-8 rounded-full -left-12 top-1/2 -translate-y-1/2",className)} disabled={!canScrollPrev} onClick={scrollPrev} {...props}><ArrowLeft className="h-4 w-4"/><span className="sr-only">Previous</span></Button>});CarouselPrevious.displayName="CarouselPrevious"
const CarouselNext=React.forwardRef<HTMLButtonElement,React.ComponentProps<typeof Button>>(({className,variant="outline",size="icon",...props},ref)=>{const{scrollNext,canScrollNext}=useCarousel();return<Button ref={ref} variant={variant} size={size} className={cn("absolute h-8 w-8 rounded-full -right-12 top-1/2 -translate-y-1/2",className)} disabled={!canScrollNext} onClick={scrollNext} {...props}><ArrowRight className="h-4 w-4"/><span className="sr-only">Next</span></Button>});CarouselNext.displayName="CarouselNext"
export{type CarouselApi,Carousel,CarouselContent,CarouselItem,CarouselPrevious,CarouselNext}`;

const UI_FORM = `import * as React from "react"
import type * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import { Controller,FormProvider,useFormContext,type ControllerProps,type FieldPath,type FieldValues } from "react-hook-form"
import { cn } from "@/lib/utils"
const Form=FormProvider
type FormFieldContextValue<TFieldValues extends FieldValues=FieldValues,TName extends FieldPath<TFieldValues>=FieldPath<TFieldValues>>={name:TName}
const FormFieldContext=React.createContext<FormFieldContextValue>({} as FormFieldContextValue)
const FormField=<TFieldValues extends FieldValues=FieldValues,TName extends FieldPath<TFieldValues>=FieldPath<TFieldValues>>({...props}:ControllerProps<TFieldValues,TName>)=><FormFieldContext.Provider value={{name:props.name}}><Controller {...props}/></FormFieldContext.Provider>
const useFormField=()=>{const fieldContext=React.useContext(FormFieldContext);const{getFieldState,formState}=useFormContext();const fieldState=getFieldState(fieldContext.name,formState);return{...fieldContext,...fieldState}}
type FormItemContextValue={id:string}
const FormItemContext=React.createContext<FormItemContextValue>({} as FormItemContextValue)
const FormItem=React.forwardRef<HTMLDivElement,React.HTMLAttributes<HTMLDivElement>>(({className,...props},ref)=>{const id=React.useId();return<FormItemContext.Provider value={{id}}><div ref={ref} className={cn("space-y-2",className)} {...props}/></FormItemContext.Provider>});FormItem.displayName="FormItem"
const FormLabel=React.forwardRef<HTMLLabelElement,React.LabelHTMLAttributes<HTMLLabelElement>>(({className,...props},ref)=>{const{error}=useFormField();return<label ref={ref} className={cn(error&&"text-destructive",className)} {...props}/>});FormLabel.displayName="FormLabel"
const FormControl=React.forwardRef<React.ElementRef<typeof Slot>,React.ComponentPropsWithoutRef<typeof Slot>>(({...props},ref)=>{const{error}=useFormField();return<Slot ref={ref} aria-invalid={!!error} {...props}/>});FormControl.displayName="FormControl"
const FormMessage=React.forwardRef<HTMLParagraphElement,React.HTMLAttributes<HTMLParagraphElement>>(({className,children,...props},ref)=>{const{error}=useFormField();const body=error?String(error?.message):children;if(!body)return null;return<p ref={ref} className={cn("text-[0.8rem] font-medium text-destructive",className)} {...props}>{body}</p>});FormMessage.displayName="FormMessage"
export{useFormField,Form,FormItem,FormLabel,FormControl,FormMessage,FormField}`;

const UI_DIALOG = `import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
const Dialog=DialogPrimitive.Root;const DialogTrigger=DialogPrimitive.Trigger;const DialogPortal=DialogPrimitive.Portal;const DialogClose=DialogPrimitive.Close
const DialogOverlay=React.forwardRef<React.ElementRef<typeof DialogPrimitive.Overlay>,React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>>(({className,...props},ref)=><DialogPrimitive.Overlay ref={ref} className={cn("fixed inset-0 z-50 bg-black/80",className)} {...props}/>);DialogOverlay.displayName=DialogPrimitive.Overlay.displayName
const DialogContent=React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>,React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>>(({className,children,...props},ref)=><DialogPortal><DialogOverlay/><DialogPrimitive.Content ref={ref} className={cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg",className)} {...props}>{children}<DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"><X className="h-4 w-4"/></DialogPrimitive.Close></DialogPrimitive.Content></DialogPortal>);DialogContent.displayName=DialogPrimitive.Content.displayName
const DialogHeader=({className,...props}:React.HTMLAttributes<HTMLDivElement>)=><div className={cn("flex flex-col space-y-1.5 text-center sm:text-left",className)} {...props}/>;DialogHeader.displayName="DialogHeader"
const DialogTitle=React.forwardRef<React.ElementRef<typeof DialogPrimitive.Title>,React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>>(({className,...props},ref)=><DialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight",className)} {...props}/>);DialogTitle.displayName=DialogPrimitive.Title.displayName
export{Dialog,DialogPortal,DialogOverlay,DialogTrigger,DialogClose,DialogContent,DialogHeader,DialogTitle}`;

const UI_TOGGLE_GROUP = `import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"
import { cn } from "@/lib/utils"
const ToggleGroup=React.forwardRef<React.ElementRef<typeof ToggleGroupPrimitive.Root>,React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>>(({className,...props},ref)=><ToggleGroupPrimitive.Root ref={ref} className={cn("inline-flex items-center justify-center gap-1 rounded-lg bg-muted p-1",className)} {...props}/>);ToggleGroup.displayName=ToggleGroupPrimitive.Root.displayName
const ToggleGroupItem=React.forwardRef<React.ElementRef<typeof ToggleGroupPrimitive.Item>,React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>>(({className,...props},ref)=><ToggleGroupPrimitive.Item ref={ref} className={cn("inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow",className)} {...props}/>);ToggleGroupItem.displayName=ToggleGroupPrimitive.Item.displayName
export{ToggleGroup,ToggleGroupItem}`;

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
              "tabs.tsx": { file: { contents: UI_TABS } },
              "select.tsx": { file: { contents: UI_SELECT } },
              "tooltip.tsx": { file: { contents: UI_TOOLTIP } },
              "dropdown-menu.tsx": { file: { contents: UI_DROPDOWN } },
              "carousel.tsx": { file: { contents: UI_CAROUSEL } },
              "form.tsx": { file: { contents: UI_FORM } },
              "dialog.tsx": { file: { contents: UI_DIALOG } },
              "toggle-group.tsx": { file: { contents: UI_TOGGLE_GROUP } },
            },
          },
        },
      },
      sections: { directory: {} },
    },
  },
};
