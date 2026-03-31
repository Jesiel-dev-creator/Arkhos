"use client"

import * as React from "react"
import { useIsMobile } from "@/hooks/use-media-query"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Drawer } from "vaul"

import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/*  Modal (Root)                                                       */
/* ------------------------------------------------------------------ */

interface ModalProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function Modal({ children, open, onOpenChange }: ModalProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Drawer.Root open={open} onOpenChange={onOpenChange}>
        {children}
      </Drawer.Root>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/*  ModalTrigger                                                       */
/* ------------------------------------------------------------------ */

interface ModalTriggerProps {
  children: React.ReactNode
  className?: string
  asChild?: boolean
}

function ModalTrigger({ children, className, asChild }: ModalTriggerProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Drawer.Trigger className={className} asChild={asChild}>
        {children}
      </Drawer.Trigger>
    )
  }

  return <DialogTrigger className={className}>{children}</DialogTrigger>
}

/* ------------------------------------------------------------------ */
/*  ModalContent                                                       */
/* ------------------------------------------------------------------ */

interface ModalContentProps {
  children: React.ReactNode
  className?: string
}

function ModalContent({ children, className }: ModalContentProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Drawer.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 mt-24 flex max-h-[85vh] flex-col rounded-t-xl border-t border-[#1C2E42] bg-[#0D1B2A] p-4",
            className
          )}
        >
          <div className="mx-auto mb-4 h-1.5 w-12 shrink-0 rounded-full bg-[#1C2E42]" />
          {children}
        </Drawer.Content>
      </Drawer.Portal>
    )
  }

  return (
    <DialogContent
      className={cn(
        "border-[#1C2E42] bg-[#0D1B2A] text-[#DCE9F5]",
        className
      )}
    >
      {children}
    </DialogContent>
  )
}

/* ------------------------------------------------------------------ */
/*  ModalHeader                                                        */
/* ------------------------------------------------------------------ */

function ModalHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div
        className={cn("mb-2 flex flex-col gap-1.5", className)}
        {...props}
      />
    )
  }

  return <DialogHeader className={className} {...props} />
}

/* ------------------------------------------------------------------ */
/*  ModalTitle                                                         */
/* ------------------------------------------------------------------ */

interface ModalTitleProps {
  children: React.ReactNode
  className?: string
}

function ModalTitle({ children, className }: ModalTitleProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Drawer.Title
        className={cn(
          "font-[Syne] text-base font-extrabold text-[#DCE9F5]",
          className
        )}
      >
        {children}
      </Drawer.Title>
    )
  }

  return (
    <DialogTitle
      className={cn("font-[Syne] font-extrabold text-[#DCE9F5]", className)}
    >
      {children}
    </DialogTitle>
  )
}

/* ------------------------------------------------------------------ */
/*  ModalDescription                                                   */
/* ------------------------------------------------------------------ */

interface ModalDescriptionProps {
  children: React.ReactNode
  className?: string
}

function ModalDescription({ children, className }: ModalDescriptionProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Drawer.Description
        className={cn("text-sm text-[#7B8FA3]", className)}
      >
        {children}
      </Drawer.Description>
    )
  }

  return (
    <DialogDescription className={cn("text-[#7B8FA3]", className)}>
      {children}
    </DialogDescription>
  )
}

/* ------------------------------------------------------------------ */
/*  ModalBody                                                          */
/* ------------------------------------------------------------------ */

function ModalBody({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex-1 overflow-y-auto py-2", className)}
      {...props}
    />
  )
}

/* ------------------------------------------------------------------ */
/*  ModalFooter                                                        */
/* ------------------------------------------------------------------ */

function ModalFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div
        className={cn("mt-auto flex flex-col gap-2 pt-4", className)}
        {...props}
      />
    )
  }

  return <DialogFooter className={className} {...props} />
}

/* ------------------------------------------------------------------ */
/*  ModalClose                                                         */
/* ------------------------------------------------------------------ */

interface ModalCloseProps {
  children: React.ReactNode
  className?: string
  asChild?: boolean
}

function ModalClose({ children, className, asChild }: ModalCloseProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Drawer.Close className={className} asChild={asChild}>
        {children}
      </Drawer.Close>
    )
  }

  return <DialogClose className={className}>{children}</DialogClose>
}

/* ------------------------------------------------------------------ */
/*  Exports                                                            */
/* ------------------------------------------------------------------ */

export {
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  ModalClose,
}
