import * as React from "react"
import { cn } from "./cn"
import type { PropsMeta } from "./props-meta"

/**
 * Progress: a linear progress indicator. role="progressbar" with the full
 * aria value triple; an indeterminate mode communicates activity without a
 * known percentage.
 */

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current value; omit for indeterminate. */
  value?: number
  /** Minimum (default 0). */
  min?: number
  /** Maximum (default 100). */
  max?: number
  /** Render the numeric percentage label. */
  showValue?: boolean
  /** Color variant. */
  variant?: "brand" | "success" | "warning" | "danger"
}

const variantBar: Record<NonNullable<ProgressProps["variant"]>, string> = {
  brand: "bg-[var(--prui-brand)]",
  success: "bg-[var(--prui-ok)]",
  warning: "bg-[var(--prui-warn)]",
  danger: "bg-[var(--prui-danger)]",
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, min = 0, max = 100, showValue = false, variant = "brand", ...props }, ref) => {
    const indeterminate = value === undefined
    const clamped = indeterminate ? undefined : Math.min(Math.max(value, min), max)
    const pct = clamped === undefined ? undefined : ((clamped - min) / (max - min)) * 100

    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div
          ref={ref}
          role="progressbar"
          aria-valuenow={indeterminate ? undefined : clamped}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-label={props["aria-label"] ?? "Progress"}
          data-state={indeterminate ? "indeterminate" : "determinate"}
          className="prui-progress h-2 w-full overflow-hidden rounded-[var(--prui-radius-full)] bg-[var(--prui-raise)]"
          {...props}
        >
          <div
            className={cn(
              "h-full rounded-[var(--prui-radius-full)] transition-[width] duration-[var(--prui-duration-base)] ease-[var(--prui-ease-out)]",
              variantBar[variant],
              indeterminate && "prui-progress-indeterminate w-1/3",
            )}
            style={indeterminate ? undefined : { width: `${pct}%` }}
          />
        </div>
        {showValue && pct !== undefined ? (
          <span className="text-xs tabular-nums text-[var(--prui-dim)]">{Math.round(pct)}%</span>
        ) : null}
      </div>
    )
  },
)
Progress.displayName = "Progress"

export const progressPropsMeta: PropsMeta = {
  name: "Progress",
  props: [
    { name: "value", type: "number", default: "undefined (indeterminate)", control: "number" },
    { name: "min", type: "number", default: "0", control: "number" },
    { name: "max", type: "number", default: "100", control: "number" },
    { name: "showValue", type: "boolean", default: "false", control: "boolean" },
    { name: "variant", type: "'brand' | 'success' | 'warning' | 'danger'", default: "'brand'", control: "select", options: ["brand", "success", "warning", "danger"] },
  ],
}
