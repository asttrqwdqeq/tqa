"use client"

import * as React from "react"
import { cn } from "@/shared/lib/utils"

interface FormProps {
  children: React.ReactNode
  onSubmit?: (e: React.FormEvent) => void
  className?: string
}

export function Form({ children, onSubmit, className }: FormProps) {
  return (
    <form onSubmit={onSubmit} className={cn("space-y-4", className)}>
      {children}
    </form>
  )
}

interface FormFieldProps {
  children: React.ReactNode
  className?: string
}

export function FormField({ children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {children}
    </div>
  )
}

interface FormItemProps {
  children: React.ReactNode
  className?: string
}

export function FormItem({ children, className }: FormItemProps) {
  return (
    <div className={cn("space-y-1", className)}>
      {children}
    </div>
  )
}

interface FormLabelProps {
  children: React.ReactNode
  className?: string
  htmlFor?: string
}

export function FormLabel({ children, className, htmlFor }: FormLabelProps) {
  return (
    <label 
      htmlFor={htmlFor}
      className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
    >
      {children}
    </label>
  )
}

interface FormControlProps {
  children: React.ReactNode
  className?: string
}

export function FormControl({ children, className }: FormControlProps) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

interface FormMessageProps {
  children?: React.ReactNode
  className?: string
}

export function FormMessage({ children, className }: FormMessageProps) {
  if (!children) return null
  
  return (
    <p className={cn("text-sm text-red-600", className)}>
      {children}
    </p>
  )
}
