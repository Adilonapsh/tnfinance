import * as React from "react"
import { cn } from "@/lib/utils"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "h-8 w-full rounded-lg border border-slate-200 bg-transparent px-2.5 py-1 text-sm transition-colors outline-none placeholder:text-slate-400 focus:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100",
        className
      )}
      {...props}
    />
  )
}

export { Input }
