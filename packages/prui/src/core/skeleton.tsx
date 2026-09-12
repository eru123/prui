import * as React from "react"
import { cn } from "./cn"
import type { PropsMeta } from "./props-meta"

/**
 * Skeleton: a placeholder shimmer for loading layouts. Purely decorative
 * (aria-hidden); pair with a live region or <Spinner> for the accessible
 * loading announcement.
 */

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement>, SurfacePropsLike {
  /** Shape preset. */
  variant?: "text" | "rect" | "circle"
  /** Text variant line height in rem units (e.g. 1 for a text line). */
  lines?: number
}

interface SurfacePropsLike {
  /** Any CSS background value overriding the shimmer base. */
  bg?: string
}

const variantClasses = {
  text: "rounded-[var(--prui-radius-1)] h-4",
  rect: "rounded-[var(--prui-radius)]",
  circle: "rounded-[var(--prui-radius-full)] aspect-square",
} as const

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "text", lines = 1, bg, style, ...props }, ref) => {
    if (variant === "text" && lines > 1) {
      return (
        <div className={cn("prui-skeleton-group flex flex-col gap-2", className)} role="presentation">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              ref={i === 0 ? ref : undefined}
              aria-hidden
              className={cn("prui-skeleton prui-anim-fade", variantClasses.text, i === lines - 1 && "w-2/3")}
              style={{ backgroundColor: bg ?? undefined, ...style }}
            />
          ))}
        </div>
      )
    }
    return (
      <div
        ref={ref}
        aria-hidden
        className={cn("prui-skeleton prui-anim-fade", variantClasses[variant], className)}
        style={{ backgroundColor: bg ?? undefined, ...style }}
        {...props}
      />
    )
  },
)
Skeleton.displayName = "Skeleton"

export const skeletonPropsMeta: PropsMeta = {
  name: "Skeleton",
  props: [
    { name: "variant", type: "'text' | 'rect' | 'circle'", default: "'text'", control: "select", options: ["text", "rect", "circle"] },
    { name: "lines", type: "number (text variant)", default: "1", control: "number" },
    { name: "bg", type: "string (CSS background)", default: "shimmer token", control: "text" },
  ],
}
