import * as React from "react"
import { cn } from "@/lib/utils"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const baseClasses = "inline-flex items-center justify-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-all"
  
  const variantClasses = {
    default: "bg-slate-900 text-white dark:bg-white dark:text-slate-900",
    secondary: "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100",
    destructive: "bg-red-500/10 text-red-500",
    outline: "border border-slate-200 text-slate-900 dark:border-slate-700 dark:text-slate-100",
    ghost: "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
    link: "text-slate-900 underline-offset-4 hover:underline dark:text-slate-100",
  }

  return (
    <span className={cn(baseClasses, variantClasses[variant], className)} {...props} />
  )
}

export { Badge }
