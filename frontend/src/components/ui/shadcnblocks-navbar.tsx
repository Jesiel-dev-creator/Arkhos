"use client"

import * as React from "react"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet"

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Gallery", href: "/gallery" },
  {
    label: "Open Source",
    href: "https://github.com/Jesiel-dev-creator/Arkhos",
    external: true,
  },
] as const

function ArkhosLogo() {
  return (
    <a href="/" className="flex items-center gap-2">
      <span
        className="flex size-8 items-center justify-center rounded-lg bg-[#FF6B35] font-[Syne] text-sm font-extrabold text-white"
        aria-hidden="true"
      >
        A
      </span>
      <span className="font-[Syne] text-lg font-extrabold tracking-tight text-[#DCE9F5]">
        ArkhosAI
      </span>
    </a>
  )
}

function NavLink({
  href,
  external,
  children,
  className,
}: {
  href: string
  external?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <a
      href={href}
      className={className}
      {...(external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      {children}
    </a>
  )
}

export function ShadcnBlocksNavbar() {
  const [open, setOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#1C2E42]/50 bg-[#020408]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <ArkhosLogo />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.label}
              href={link.href}
              external={"external" in link ? link.external : undefined}
              className="rounded-lg px-3 py-2 font-['DM_Sans'] text-sm font-medium text-[#7B8FA3] transition-colors hover:text-[#DCE9F5]"
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-3 md:flex">
          <Button
            variant="outline"
            className="border-[#1C2E42] bg-transparent font-['DM_Sans'] text-[#DCE9F5] hover:bg-[#0D1B2A] hover:text-[#DCE9F5]"
          >
            Sign in
          </Button>
          <Button className="bg-[#FF6B35] font-['DM_Sans'] text-white hover:bg-[#FF6B35]/90">
            Start building free
          </Button>
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[#DCE9F5] hover:bg-[#0D1B2A]"
                />
              }
            >
              <Menu className="size-5" />
              <span className="sr-only">Open menu</span>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[300px] border-[#1C2E42] bg-[#020408]"
            >
              <SheetHeader className="border-b border-[#1C2E42] pb-4">
                <SheetTitle>
                  <ArkhosLogo />
                </SheetTitle>
              </SheetHeader>

              <nav className="flex flex-col gap-1 px-2 py-4">
                {navLinks.map((link) => (
                  <SheetClose
                    key={link.label}
                    render={
                      <NavLink
                        href={link.href}
                        external={
                          "external" in link ? link.external : undefined
                        }
                        className="rounded-lg px-3 py-2.5 font-['DM_Sans'] text-sm font-medium text-[#7B8FA3] transition-colors hover:bg-[#0D1B2A] hover:text-[#DCE9F5]"
                      />
                    }
                  >
                    {link.label}
                  </SheetClose>
                ))}
              </nav>

              <div className="mt-auto flex flex-col gap-3 border-t border-[#1C2E42] px-4 pt-4">
                <Button
                  variant="outline"
                  className="w-full border-[#1C2E42] bg-transparent font-['DM_Sans'] text-[#DCE9F5] hover:bg-[#0D1B2A] hover:text-[#DCE9F5]"
                >
                  Sign in
                </Button>
                <Button className="w-full bg-[#FF6B35] font-['DM_Sans'] text-white hover:bg-[#FF6B35]/90">
                  Start building free
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

export default ShadcnBlocksNavbar
