import * as React from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link"
  size?: "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg"
}

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  const baseClasses = "inline-flex items-center justify-center rounded-lg border border-transparent font-medium transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50"
  
  const variantClasses = {
    default: "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100",
    outline: "border-slate-200 bg-white hover:bg-slate-100 dark:border-slate-700 dark:bg-transparent dark:hover:bg-slate-800",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
    ghost: "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800",
    destructive: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
    link: "text-slate-900 underline-offset-4 hover:underline dark:text-slate-100",
  }

  const sizeClasses = {
    default: "h-8 px-3 text-sm",
    xs: "h-6 px-2 text-xs",
    sm: "h-7 px-2.5 text-xs",
    lg: "h-9 px-3 text-sm",
    icon: "size-8",
    "icon-xs": "size-6",
    "icon-sm": "size-7",
    "icon-lg": "size-9",
  }

  return (
    <button
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    />
  )
}

export { Button }
