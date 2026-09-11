import * as React from "react"
import { X } from "lucide-react"
import { cn } from "./cn"
import type { PropsMeta } from "./props-meta"

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
}

export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, ariaLabel, hideClose, onClick, ...props }, ref) => {
    const { open, setOpen, labelId } = useDialog()

    React.useEffect(() => {
      if (!open) return
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false)
      }
      document.addEventListener("keydown", onKey)
      const prevOverflow = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.removeEventListener("keydown", onKey)
        document.body.style.overflow = prevOverflow
      }
    }, [open, setOpen])

    if (!open) return null

    return (
      <div
        className="prui-dialog-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
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
          className={cn(
            "prui-dialog-content relative z-10 w-full max-w-lg rounded-[var(--prui-radius)]",
            "border border-[var(--prui-line)] bg-[var(--prui-surface)] shadow-xl",
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
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 rounded-[var(--prui-radius-1)] p-1 text-[var(--prui-dim)] hover:text-[var(--prui-fg)] hover:bg-[var(--prui-raise)] cursor-pointer"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
      </div>
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
      <h2 ref={ref} id={labelId} className={cn("prui-dialog-title text-base font-semibold text-[var(--prui-fg)]", className)} {...props} />
    )
  },
)
DialogTitle.displayName = "DialogTitle"

export const DialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("prui-dialog-description text-sm text-[var(--prui-dim)]", className)} {...props} />
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
  ],
}
