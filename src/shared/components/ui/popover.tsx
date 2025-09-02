"use client"

import * as React from "react"
import { cn } from "@/shared/lib/utils"

interface PopoverProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function Popover({ children, open, onOpenChange }: PopoverProps) {
  return (
    <div className="relative">
      {children}
    </div>
  )
}

interface PopoverTriggerProps {
  children: React.ReactNode
  asChild?: boolean
  className?: string
}

export function PopoverTrigger({ children, asChild, className }: PopoverTriggerProps) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

interface PopoverContentProps {
  children: React.ReactNode
  className?: string
  align?: "start" | "center" | "end"
}

export function PopoverContent({ children, className, align }: PopoverContentProps) {
  return (
    <div className={cn(
      "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}>
      {children}
    </div>
  )
}
