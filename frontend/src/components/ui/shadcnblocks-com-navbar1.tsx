"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

interface NavItem {
  label: string
  href: string
  children?: { label: string; href: string; description?: string }[]
}

interface CtaButton {
  label: string
  href: string
  variant?: "default" | "outline" | "ghost"
}

interface Navbar1Props {
  /** Logo element or string */
  logo: React.ReactNode
  /** Navigation items (supports one level of dropdown children) */
  navItems: NavItem[]
  /** CTA buttons on the right side */
  ctaButtons?: CtaButton[]
  /** Additional className */
  className?: string
}

/**
 * Full navigation menu with desktop nav links and mobile Sheet drawer.
 * Desktop: Logo left, nav links center, CTA buttons right.
 * Mobile: hamburger icon triggers a Sheet sliding from the right.
 */
export default function Navbar1({
  logo,
  navItems,
  ctaButtons = [],
  className,
}: Navbar1Props) {
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null)

  return (
    <nav
      className={cn(
        "flex items-center justify-between px-6 py-3 max-w-7xl mx-auto w-full",
        className
      )}
    >
      {/* Logo */}
      <div className="shrink-0">
        {typeof logo === "string" ? (
          <span
            className="text-xl font-extrabold text-[#DCE9F5]"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {logo}
          </span>
        ) : (
          logo
        )}
      </div>

      {/* Desktop nav links */}
      <div className="hidden md:flex items-center gap-1">
        {navItems.map((item) => (
          <div
            key={item.label}
            className="relative"
            onMouseEnter={() =>
              item.children && setOpenDropdown(item.label)
            }
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <a
              href={item.href}
              className={cn(
                "px-3 py-2 text-sm font-medium transition-colors rounded-md",
                "text-[#7B8FA3] hover:text-[#DCE9F5] hover:bg-[#1C2E42]/40"
              )}
            >
              {item.label}
              {item.children && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  className="inline-block ml-1"
                >
                  <path
                    d="M3 5l3 3 3-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </a>
            {/* Dropdown */}
            {item.children && openDropdown === item.label && (
              <div className="absolute top-full left-0 mt-1 w-64 rounded-lg border border-[#1C2E42] bg-[#0D1B2A] shadow-xl py-2 z-50">
                {item.children.map((child) => (
                  <a
                    key={child.label}
                    href={child.href}
                    className="block px-4 py-2.5 text-sm text-[#DCE9F5] hover:bg-[#1C2E42]/60 transition-colors"
                  >
                    <span className="font-medium">{child.label}</span>
                    {child.description && (
                      <span className="block text-xs text-[#7B8FA3] mt-0.5">
                        {child.description}
                      </span>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop CTA buttons */}
      <div className="hidden md:flex items-center gap-2">
        {ctaButtons.map((btn) => (
          <a key={btn.label} href={btn.href}>
            <Button
              variant={btn.variant || "default"}
              className={cn(
                btn.variant === "outline" || btn.variant === "ghost"
                  ? "border-[#1C2E42] text-[#DCE9F5] hover:bg-[#1C2E42]/50"
                  : "bg-[#FF6B35] text-white hover:bg-[#FF6B35]/90"
              )}
            >
              {btn.label}
            </Button>
          </a>
        ))}
      </div>

      {/* Mobile hamburger + Sheet */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger
            className="p-2 text-[#DCE9F5] hover:bg-[#1C2E42]/40 rounded-md transition-colors"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </SheetTrigger>
          <SheetContent side="right" className="bg-[#0D1B2A] border-[#1C2E42] w-80">
            <div className="flex flex-col gap-1 pt-8">
              {navItems.map((item) => (
                <div key={item.label}>
                  <a
                    href={item.href}
                    className="block px-4 py-3 text-sm font-medium text-[#DCE9F5] hover:bg-[#1C2E42]/60 rounded-md transition-colors"
                  >
                    {item.label}
                  </a>
                  {item.children && (
                    <div className="pl-4">
                      {item.children.map((child) => (
                        <a
                          key={child.label}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-[#7B8FA3] hover:text-[#DCE9F5] transition-colors"
                        >
                          {child.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {/* Mobile CTA buttons */}
              <div className="flex flex-col gap-2 mt-4 px-4">
                {ctaButtons.map((btn) => (
                  <a key={btn.label} href={btn.href}>
                    <Button
                      variant={btn.variant || "default"}
                      className={cn(
                        "w-full",
                        btn.variant === "outline" || btn.variant === "ghost"
                          ? "border-[#1C2E42] text-[#DCE9F5]"
                          : "bg-[#FF6B35] text-white hover:bg-[#FF6B35]/90"
                      )}
                    >
                      {btn.label}
                    </Button>
                  </a>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
