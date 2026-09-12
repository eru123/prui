import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "./cn"
import { usePruiI18n } from "../i18n"
import type { PropsMeta } from "./props-meta"

/**
 * Spinner: an inline loading indicator with an accessible label. Announces
 * through role="status" so screen readers hear loading state without
 * stealing focus.
 */

export type SpinnerSize = "xs" | "sm" | "md" | "lg"

const spinnerSizes: Record<SpinnerSize, string> = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
}

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Accessible label announced to screen readers. */
  label?: string
  size?: SpinnerSize
}

export const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(
  ({ className, label, size = "md", ...props }, ref) => {
    const { t } = usePruiI18n()
    return (
      <span
        ref={ref}
        role="status"
        aria-label={label ?? t.loading}
        className={cn("prui-spinner inline-flex items-center justify-center text-[var(--prui-dim)]", className)}
        {...props}
      >
        <Loader2 className={cn("animate-spin", spinnerSizes[size])} aria-hidden />
        {label ? <span className="sr-only">{label}</span> : null}
      </span>
    )
  },
)
Spinner.displayName = "Spinner"

export const spinnerPropsMeta: PropsMeta = {
  name: "Spinner",
  props: [
    { name: "label", type: "string", default: "'Loading...'", control: "text", description: "Accessible label." },
    { name: "size", type: "'xs' | 'sm' | 'md' | 'lg'", default: "'md'", control: "select", options: ["xs", "sm", "md", "lg"] },
  ],
}
