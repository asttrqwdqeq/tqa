"use client"

import * as React from "react"
import { cn } from "@/shared/lib/utils"

interface CommandProps {
  children: React.ReactNode
  className?: string
}

export function Command({ children, className }: CommandProps) {
  return (
    <div className={cn("flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground", className)}>
      {children}
    </div>
  )
}

interface CommandInputProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  className?: string
}

export function CommandInput({ placeholder, value, onChange, className }: CommandInputProps) {
  return (
    <div className="flex items-center border-b px-3">
      <input
        className={cn(
          "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  )
}

interface CommandListProps {
  children: React.ReactNode
  className?: string
}

export function CommandList({ children, className }: CommandListProps) {
  return (
    <div className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}>
      {children}
    </div>
  )
}

interface CommandEmptyProps {
  children: React.ReactNode
  className?: string
}

export function CommandEmpty({ children, className }: CommandEmptyProps) {
  return (
    <div className={cn("py-6 text-center text-sm", className)}>
      {children}
    </div>
  )
}

interface CommandGroupProps {
  children: React.ReactNode
  className?: string
}

export function CommandGroup({ children, className }: CommandGroupProps) {
  return (
    <div className={cn("overflow-hidden p-1 text-foreground", className)}>
      {children}
    </div>
  )
}

interface CommandItemProps {
  children: React.ReactNode
  onSelect?: () => void
  className?: string
  value?: string
}

export function CommandItem({ children, onSelect, className, value }: CommandItemProps) {
  return (
    <div
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground",
        className
      )}
      onClick={onSelect}
    >
      {children}
    </div>
  )
}
