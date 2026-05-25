"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
}

function Progress({ className, value = 0, ...props }: ProgressProps) {
  return (
    <div data-slot="progress" className={cn("flex w-full", className)} {...props}>
      <div className="relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          data-slot="progress-indicator"
          className="h-full bg-slate-900 dark:bg-[#bdf29f] transition-all"
          style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        />
      </div>
    </div>
  )
}

export { Progress }
