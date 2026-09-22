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
  neutral: { icon: Info, box: "bg-raise border-line text-fg" },
  info: { icon: Info, box: "bg-brand/10 border-brand/30 text-brand" },
  success: { icon: CheckCircle2, box: "bg-ok/10 border-ok/30 text-ok" },
  warning: { icon: AlertTriangle, box: "bg-warn/10 border-warn/30 text-warn" },
  danger: { icon: XCircle, box: "bg-danger/10 border-danger/30 text-danger" },
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
          "prui-alert flex items-start gap-3 rounded-prui border px-4 py-3 text-sm",
          reduced ? "" : "prui-anim-fade",
          alertStyles[variant].box,
          className,
        )}
        {...props}
      >
        {hideIcon ? null : <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />}
        <div className="min-w-0 flex-1">
          {title ? <div className="font-semibold">{title}</div> : null}
          {children ? <div className={cn("text-fg", title && "mt-0.5")}>{children}</div> : null}
        </div>
        {onDismiss ? (
          <button
            type="button"
            aria-label={t.dismiss}
            onClick={onDismiss}
            className="-m-1 rounded-prui-sm p-1 cursor-pointer opacity-70 transition-opacity hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
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
