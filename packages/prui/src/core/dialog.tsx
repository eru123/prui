import * as React from "react"
import { X } from "lucide-react"
import { cn } from "./cn"
import { Portal, useOverlay } from "./overlay"
import { usePruiI18n } from "../i18n"
import type { PropsMeta } from "./props-meta"

/**
 * Dialog: the compound, declarative modal surface (<Dialog> + <DialogContent/
 * Header/Title/Description/Footer>). Built on the shared overlay
 * infrastructure: portaled, focus-trapped with focus restoration, topmost
 * Escape, scroll-locked, background aria-hidden/inert while open.
 */

export interface DialogProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Called to confirm a controlled close (X / backdrop / Escape). */
  onClose?: () => void
  children?: React.ReactNode
}

interface DialogCtx {
  open: boolean
  setOpen: (o: boolean) => void
  labelId: string
}

const Ctx = React.createContext<DialogCtx | null>(null)

function useDialog(): DialogCtx {
  const ctx = React.useContext(Ctx)
  if (!ctx) throw new Error("Dialog parts must be used inside <Dialog>")
  return ctx
}

export const Dialog = ({ open: openProp, defaultOpen = false, onOpenChange, children }: DialogProps) => {
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : uncontrolled
  const labelId = React.useId()

  const setOpen = (o: boolean) => {
    if (!isControlled) setUncontrolled(o)
    onOpenChange?.(o)
  }

  return <Ctx.Provider value={{ open, setOpen, labelId }}>{children}</Ctx.Provider>
}
Dialog.displayName = "Dialog"

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Accessibility label when no DialogTitle is rendered. */
  ariaLabel?: string
  hideClose?: boolean
  /** Initial focus target: first focusable (default), the dialog itself, a specific element, or none. */
  initialFocus?: React.RefObject<HTMLElement | null> | "first" | "container" | false
}

export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, ariaLabel, hideClose, initialFocus = "first", onClick, ...props }, ref) => {
    const { open, setOpen, labelId } = useDialog()
    const { t } = usePruiI18n()

    const { ref: overlayRef } = useOverlay({
      open,
      onEscape: () => setOpen(false),
      initialFocus,
    })

    if (!open) return null

    return (
      <Portal>
        <div ref={overlayRef}>
          <div
            className="prui-dialog-overlay fixed inset-0 z-[var(--prui-z-overlay)] flex items-center justify-center p-4 bg-scrim"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setOpen(false)
            }}
          >
            <div
              ref={ref}
              role="dialog"
              aria-modal="true"
              aria-label={ariaLabel}
              aria-labelledby={ariaLabel ? undefined : labelId}
              tabIndex={-1}
              className={cn(
                "prui-dialog-content relative z-[var(--prui-z-content)] w-full max-w-lg rounded-prui",
                "border border-line bg-surface shadow-prui-lg",
                "max-h-[85vh] overflow-auto outline-none",
                className,
              )}
              onClick={onClick}
              {...props}
            >
              {children}
              {hideClose ? null : (
                <button
                  type="button"
                  aria-label={t.close}
                  onClick={() => setOpen(false)}
                  className="absolute right-3 top-3 rounded-prui-sm p-1 text-dim hover:text-fg hover:bg-raise cursor-pointer"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              )}
            </div>
          </div>
        </div>
      </Portal>
    )
  },
)
DialogContent.displayName = "DialogContent"

export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("prui-dialog-header flex flex-col gap-1 p-4 pb-2", className)} {...props} />
)

export const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    const { labelId } = useDialog()
    return (
      <h2 ref={ref} id={labelId} className={cn("prui-dialog-title text-base font-semibold text-fg", className)} {...props} />
    )
  },
)
DialogTitle.displayName = "DialogTitle"

export interface DialogBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Remove the default vertical padding (keeps horizontal). */
  flush?: boolean
}

/** Padded content area for DialogContent: consistent x/y gutters. */
export const DialogBody = React.forwardRef<HTMLDivElement, DialogBodyProps>(
  ({ className, flush, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("prui-dialog-body px-4", flush ? "pt-0 pb-0" : "pt-1 pb-4", className)}
      {...props}
    />
  ),
)
DialogBody.displayName = "DialogBody"

export const DialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("prui-dialog-description text-sm text-dim", className)} {...props} />
  ),
)
DialogDescription.displayName = "DialogDescription"

export const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("prui-dialog-footer flex items-center justify-end gap-2 p-4 pt-2", className)} {...props} />
)

export const dialogPropsMeta: PropsMeta = {
  name: "Dialog",
  props: [
    { name: "open", type: "boolean", default: "undefined", control: "boolean" },
    { name: "defaultOpen", type: "boolean", default: "false", control: "boolean" },
    { name: "onOpenChange", type: "(open: boolean) => void", default: null, control: "none" },
    { name: "initialFocus", type: 'ref | "first" | "container" | false', default: '"first"', control: "none" },
  ],
}

export const dialogBodyPropsMeta: PropsMeta = {
  name: "DialogBody",
  props: [
    { name: "flush", type: "boolean", default: "false", control: "boolean", description: "Remove vertical padding." },
    { name: "className", type: "string", default: "undefined", control: "text" },
  ],
}
