import * as React from "react"
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react"
import { cn } from "./cn"
import { usePruiI18n } from "../i18n"
import { useReducedMotion } from "./overlay"
import type { PropsMeta } from "./props-meta"

/**
 * Alert: an inline callout for status feedback. role maps automatically
 * (alert for danger/warning, status otherwise) so screen readers announce
 * with the right urgency. Optional dismiss button.
 */

export type AlertVariant = "neutral" | "info" | "success" | "warning" | "danger"

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  variant?: AlertVariant
  /** Bold first line. */
  title?: React.ReactNode
  children?: React.ReactNode
  /** Show a dismiss button; onDismiss controls visibility. */
  onDismiss?: () => void
  /** Hide the leading icon. */
  hideIcon?: boolean
}

const alertStyles: Record<AlertVariant, { icon: typeof Info; box: string }> = {
  neutral: { icon: Info, box: "bg-[var(--prui-raise)] border-[var(--prui-line)] text-[var(--prui-fg)]" },
  info: { icon: Info, box: "bg-[var(--prui-brand)]/10 border-[var(--prui-brand)]/30 text-[var(--prui-brand)]" },
  success: { icon: CheckCircle2, box: "bg-[var(--prui-ok)]/10 border-[var(--prui-ok)]/30 text-[var(--prui-ok)]" },
  warning: { icon: AlertTriangle, box: "bg-[var(--prui-warn)]/10 border-[var(--prui-warn)]/30 text-[var(--prui-warn)]" },
  danger: { icon: XCircle, box: "bg-[var(--prui-danger)]/10 border-[var(--prui-danger)]/30 text-[var(--prui-danger)]" },
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "neutral", title, children, onDismiss, hideIcon, ...props }, ref) => {
    const { t } = usePruiI18n()
    const reduced = useReducedMotion()
    const Icon = alertStyles[variant].icon
    const urgent = variant === "danger" || variant === "warning"
    return (
      <div
        ref={ref}
        role={urgent ? "alert" : "status"}
        data-variant={variant}
        className={cn(
          "prui-alert flex items-start gap-3 rounded-[var(--prui-radius)] border px-4 py-3 text-sm",
          reduced ? "" : "prui-anim-fade",
          alertStyles[variant].box,
          className,
        )}
        {...props}
      >
        {hideIcon ? null : <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />}
        <div className="min-w-0 flex-1">
          {title ? <div className="font-semibold">{title}</div> : null}
          {children ? <div className={cn("text-[var(--prui-fg)]", title && "mt-0.5")}>{children}</div> : null}
        </div>
        {onDismiss ? (
          <button
            type="button"
            aria-label={t.dismiss}
            onClick={onDismiss}
            className="-m-1 rounded-[var(--prui-radius-1)] p-1 cursor-pointer opacity-70 transition-opacity hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--prui-brand)]"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
      </div>
    )
  },
)
Alert.displayName = "Alert"

export const alertPropsMeta: PropsMeta = {
  name: "Alert",
  props: [
    { name: "variant", type: "'neutral' | 'info' | 'success' | 'warning' | 'danger'", default: "'neutral'", control: "select", options: ["neutral", "info", "success", "warning", "danger"] },
    { name: "title", type: "ReactNode", default: null, control: "text" },
    { name: "onDismiss", type: "() => void", default: null, control: "none" },
    { name: "hideIcon", type: "boolean", default: "false", control: "boolean" },
  ],
}
