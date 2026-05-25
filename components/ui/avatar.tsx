import * as React from "react"
import { cn } from "@/lib/utils"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "default" | "sm" | "lg"
}

function Avatar({ className, size = "default", ...props }: AvatarProps) {
  const sizeClasses = {
    default: "size-8",
    sm: "size-6",
    lg: "size-10",
  }
  
  return (
    <div
      data-slot="avatar"
      data-size={size}
      className={cn("relative flex shrink-0 select-none", sizeClasses[size], className)}
      {...props}
    />
  )
}

function AvatarImage({ className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      data-slot="avatar-image"
      className={cn("aspect-square size-full rounded-full object-cover", className)}
      {...props}
    />
  )
}

function AvatarFallback({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="avatar-fallback"
      className={cn("flex size-full items-center justify-center rounded-full bg-slate-100 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-400", className)}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
