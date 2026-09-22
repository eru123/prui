import * as React from "react"
import { cn } from "./cn"
import type { PropsMeta } from "./props-meta"

/**
 * Timeline: a vertical chronological list with markers, timestamps, and
 * optional icons/colors per item. Presentational (role="list" semantics);
 * content is fully caller-owned.
 */

export type TimelineVariant = "brand" | "success" | "warning" | "danger" | "neutral"

export interface TimelineItemData {
  title: React.ReactNode
  time?: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  variant?: TimelineVariant
}

export interface TimelineProps extends React.HTMLAttributes<HTMLOListElement> {
  items: TimelineItemData[]
  /** Marker alignment relative to the content column. Default left. */
  align?: "left" | "alternate" | "right"
}

const dotColors: Record<TimelineVariant, string> = {
  brand: "border-brand bg-brand/20 text-brand",
  success: "border-ok bg-ok/20 text-ok",
  warning: "border-warn bg-warn/20 text-warn",
  danger: "border-danger bg-danger/20 text-danger",
  neutral: "border-line bg-raise text-dim",
}

export const Timeline = React.forwardRef<HTMLOListElement, TimelineProps>(function Timeline(
  { items, align = "left", className, ...props },
  ref,
) {
  return (
    <ol ref={ref} role="list" className={cn("prui-timeline relative flex flex-col", className)} {...props}>
      {items.map((item, i) => {
        const variant = item.variant ?? "neutral"
        return (
          <li key={i} className="relative flex gap-3 pb-6 last:pb-0" data-variant={variant}>
            {/* rail */}
            <span
              aria-hidden
              className={cn(
                "absolute top-5 bottom-0 w-px bg-line",
                align === "right" ? "right-[11px]" : "left-[11px]",
                i === items.length - 1 && "hidden",
              )}
            />
            <span
              aria-hidden
              className={cn(
                "relative z-[var(--prui-z-content)] flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                dotColors[variant],
              )}
            >
              {item.icon ?? <span className="h-1.5 w-1.5 rounded-full bg-current" />}
            </span>
            <div className={cn("min-w-0 flex-1", align === "right" && "text-right")}>
              <div className={cn("flex flex-wrap items-baseline gap-x-2", align === "right" && "flex-row-reverse")}>
                <span className="text-sm font-medium text-fg">{item.title}</span>
                {item.time ? <span className="text-xs text-dim">{item.time}</span> : null}
              </div>
              {item.description ? <div className="mt-0.5 text-sm text-dim">{item.description}</div> : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
})
Timeline.displayName = "Timeline"

export const timelinePropsMeta: PropsMeta = {
  name: "Timeline",
  props: [
    { name: "items", type: "TimelineItemData[]", default: null, control: "object" },
    { name: "align", type: "'left' | 'alternate' | 'right'", default: "'left'", control: "select", options: ["left", "alternate", "right"] },
  ],
}
