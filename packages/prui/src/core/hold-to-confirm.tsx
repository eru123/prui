import * as React from "react"
import { cn } from "./cn"
import { useLongPress } from "./use-long-press"
import type { PropsMeta } from "./props-meta"

/**
 * HoldToConfirm: a button that only fires after a deliberate press-and-hold
 * (default 800ms) — the "moment to change your mind" pattern for
 * destructive actions. A fill grows across the button while holding;
 * releasing early cancels. Keyboard holds (Enter/Space) work identically.
 */

export interface HoldToConfirmProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "onPointerDown" | "onPointerUp" | "onKeyDown" | "onKeyUp"
  > {
  /** Fires once the hold completes. */
  onConfirm: () => void
  /** Required hold in ms. Default 800. */
  duration?: number
  /** Accessible instruction; announced to screen readers. Default
   * "Press and hold to confirm". */
  hint?: string
}

export const HoldToConfirm = React.forwardRef<HTMLButtonElement, HoldToConfirmProps>(function HoldToConfirm(
  { onConfirm, duration = 800, hint = "Press and hold to confirm", className, disabled, children, ...props },
  ref,
) {
  const { holding, progress, bind } = useLongPress({ duration, onComplete: onConfirm, disabled })

  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      data-holding={holding || undefined}
      aria-description={hint}
      className={cn(
        "prui-hold-confirm relative inline-flex cursor-pointer select-none items-center justify-center",
        "whitespace-nowrap overflow-hidden rounded-prui font-medium outline-none",
        "h-9 px-3.5 text-sm transition-colors duration-150 ease-prui",
        "border border-danger/40 bg-danger/10 text-danger",
        "hover:bg-danger/20 active:bg-danger/25",
        "focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...bind}
      {...props}
    >
      {/* progress fill: runtime geometry (width), skin from tokens */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 bg-danger/25"
        style={{ width: `${progress * 100}%` }}
      />
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </button>
  )
})
HoldToConfirm.displayName = "HoldToConfirm"

export const holdToConfirmPropsMeta: PropsMeta = {
  name: "HoldToConfirm",
  props: [
    { name: "onConfirm", type: "() => void", default: null, control: "none" },
    { name: "duration", type: "number (ms)", default: "800", control: "number" },
    { name: "hint", type: "string", default: "'Press and hold to confirm'", control: "text" },
    { name: "disabled", type: "boolean", default: "false", control: "boolean" },
    { name: "children", type: "ReactNode", default: null, control: "text" },
  ],
}
