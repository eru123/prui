import * as React from "react"
import { createRoot } from "react-dom/client"
import { X } from "lucide-react"
import { cn } from "./cn"
import type { PropsMeta } from "./props-meta"

/**
 * Modal, ported from icanhelp-tracker's production modal (the invented one):
 * size scale xs/sm/md/lg/xl, open/close animations, shake-on-blocked-close,
 * overlay blur, body scroll lock, noPadding/padding control, closeOnOverlayClick
 * false = shake feedback, and an imperative confirmModal() that renders a
 * typed confirmation dialog imperatively and resolves a Promise<boolean>.
 * Restyled onto PRUI tokens instead of hardcoded hex.
 */

export type ModalSize = "xs" | "sm" | "md" | "lg" | "xl"

export interface ModalProps {
  open: boolean
  onClose: () => void
  children?: React.ReactNode
  /** Block overlay/esc close (still shows the X unless hideClose). */
  disableDefaultClose?: boolean
  /** When false, an overlay click shakes instead of closing. Default true. */
  closeOnOverlayClick?: boolean
  size?: ModalSize
  xs?: boolean
  sm?: boolean
  md?: boolean
  lg?: boolean
  xl?: boolean
  /** Custom max-width CSS value. */
  maxWidth?: string
  /** Custom padding, e.g. "24px 32px". */
  padding?: string
  noPadding?: boolean
  showCloseButton?: boolean
  /** Accessible label. */
  ariaLabel?: string
  className?: string
}

const sizeWidths: Record<ModalSize, { width: string; minWidth: string }> = {
  xs: { width: "320px", minWidth: "280px" },
  sm: { width: "448px", minWidth: "320px" },
  md: { width: "640px", minWidth: "384px" },
  lg: { width: "896px", minWidth: "512px" },
  xl: { width: "1152px", minWidth: "640px" },
}

const defaultPadding: Record<ModalSize, string> = {
  xs: "24px 32px",
  sm: "24px 32px",
  md: "32px 40px",
  lg: "32px 40px",
  xl: "40px 48px",
}

export function Modal({
  open,
  onClose,
  children,
  disableDefaultClose = false,
  closeOnOverlayClick = true,
  size,
  xs,
  sm,
  md,
  lg,
  xl,
  maxWidth,
  padding,
  noPadding = false,
  showCloseButton = true,
  ariaLabel,
  className,
}: ModalProps) {
  const resolvedSize: ModalSize = size ?? (xs ? "xs" : sm ? "sm" : lg ? "lg" : xl ? "xl" : md ? "md" : "md")
  const [isVisible, setIsVisible] = React.useState(open)
  const [animating, setAnimating] = React.useState(false)
  const [isShaking, setIsShaking] = React.useState(false)
  const contentRef = React.useRef<HTMLDivElement>(null)

  // open/close with animation, body scroll lock (icanhelp behavior)
  React.useEffect(() => {
    if (open) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setAnimating(true)
        document.body.classList.add("modal-open")
      }, 10)
      return () => clearTimeout(timer)
    }
    setAnimating(false)
    document.body.classList.remove("modal-open")
  }, [open])

  React.useEffect(() => () => document.body.classList.remove("modal-open"), [])

  // Escape closes (unless blocked); blocked = shake
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (disableDefaultClose) {
          setIsShaking(true)
          setTimeout(() => setIsShaking(false), 500)
        } else {
          onClose()
        }
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, disableDefaultClose, onClose])

  if (!isVisible && !animating) return null

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return
    if (disableDefaultClose || !closeOnOverlayClick) {
      // shake feedback: modal cannot be dismissed this way
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 500)
      return
    }
    onClose()
  }

  const dims = sizeWidths[resolvedSize]
  const pad = noPadding ? "0" : padding ?? defaultPadding[resolvedSize]

  return (
    <div
      className="prui-modal-overlay fixed inset-0 z-[10000] flex justify-center overflow-y-auto p-4"
      style={{
        alignItems: "flex-start",
        paddingTop: "10vh",
        backgroundColor: "rgba(0, 0, 0, 0.55)",
        backdropFilter: "blur(4px)",
        opacity: animating ? 1 : 0,
        transition: "opacity 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)",
      }}
      onClick={handleOverlayClick}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleOverlayClick(e as unknown as React.MouseEvent<HTMLDivElement>)
      }}
    >
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className={cn(
          "prui-modal-content relative h-fit m-auto w-full",
          isShaking && "prui-modal-shake",
          className,
        )}
        style={{
          width: dims.width,
          minWidth: dims.minWidth,
          maxWidth: maxWidth ?? dims.width,
          padding: pad,
          backgroundColor: "var(--prui-surface)",
          border: "1px solid var(--prui-line)",
          borderRadius: "var(--prui-radius-3)",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
          color: "var(--prui-fg)",
          transform: animating ? "scale(1) translateY(0)" : "scale(0.95) translateY(8px)",
          opacity: animating ? 1 : 0,
          transition: "transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)",
        }}
        onTransitionEnd={() => {
          if (!open) setIsVisible(false)
        }}
      >
        {showCloseButton && !disableDefaultClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute right-4 top-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-[var(--prui-radius)] text-[var(--prui-dim)] transition-all hover:bg-[var(--prui-raise)] hover:text-[var(--prui-fg)]"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
        {children}
      </div>
    </div>
  )
}

Modal.displayName = "Modal"

/* ------------------------------------------------------------------ */
/* confirmModal(): imperative promise-based confirmation (icanhelp API) */
/* ------------------------------------------------------------------ */

export type ConfirmModalType = "success" | "warning" | "danger" | "error" | "info"

export interface ConfirmModalOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: ConfirmModalType
  size?: ModalSize
}

const confirmColors: Record<ConfirmModalType | "default", string> = {
  success: "var(--prui-ok)",
  warning: "var(--prui-warn)",
  danger: "var(--prui-danger)",
  error: "var(--prui-danger)",
  info: "var(--prui-brand)",
  default: "var(--prui-brand)",
}

const ConfirmIcon: React.FC<{ type?: ConfirmModalType }> = ({ type }) => {
  const color = confirmColors[type ?? "default"]
  switch (type) {
    case "success":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color }}>
          <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        </svg>
      )
    case "warning":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color }}>
          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.694-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case "danger":
    case "error":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color }}>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <path d="M15 9l-6 6m0-6l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case "info":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color }}>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
          <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    default:
      return null
  }
}

/**
 * confirmModal({ title, message, type }) => Promise<boolean>
 * Renders the confirmation modal imperatively; resolves true on confirm,
 * false on cancel/Escape/overlay-shake close. Focus-trapped like the original.
 */
export function confirmModal(options: ConfirmModalOptions): Promise<boolean> {
  const { title, message, confirmText = "Confirm", cancelText = "Cancel", type, size = "sm" } = options
  const accent = confirmColors[type ?? "default"]

  return new Promise((resolve) => {
    const container = document.createElement("div")
    document.body.appendChild(container)
    const root = createRoot(container)

    const cleanup = () => {
      setTimeout(() => {
        root.unmount()
        container.remove()
      }, 320)
    }

    const ConfirmComponent = () => {
      const [show, setShow] = React.useState(false)
      const [animating, setAnimating] = React.useState(false)
      const [isPending, setIsPending] = React.useState(false)
      const cancelRef = React.useRef<HTMLButtonElement>(null)
      const confirmRef = React.useRef<HTMLButtonElement>(null)

      React.useEffect(() => {
        const t = setTimeout(() => {
          setShow(true)
          setAnimating(true)
          document.body.classList.add("modal-open")
        }, 10)
        return () => clearTimeout(t)
      }, [])

      const finish = (result: boolean) => {
        setIsPending(true)
        setAnimating(false)
        document.body.classList.remove("modal-open")
        setTimeout(() => {
          cleanup()
          resolve(result)
        }, 300)
      }

      // focus trap: confirm default, Tab cycles confirm/cancel, Escape cancels.
      React.useEffect(() => {
        if (!show || isPending) return
        confirmRef.current?.focus()
        const onKey = (e: KeyboardEvent) => {
          if (isPending) return
          if (e.key === "Escape") {
            e.preventDefault()
            finish(false)
            return
          }
          if (e.key !== "Tab") return
          const focusables = [cancelRef.current, confirmRef.current].filter((b): b is HTMLButtonElement => Boolean(b))
          if (!focusables.length) return
          const first = focusables[0]!
          const last = focusables[focusables.length - 1]!
          const active = document.activeElement as HTMLElement | null
          if (!active || !focusables.some((b) => b === (active as unknown))) {
            e.preventDefault()
            first.focus()
          } else if (e.shiftKey && active === first) {
            e.preventDefault()
            last.focus()
          } else if (!e.shiftKey && active === last) {
            e.preventDefault()
            first.focus()
          }
        }
        document.addEventListener("keydown", onKey)
        return () => document.removeEventListener("keydown", onKey)
      }, [show, isPending])

      if (!show) return null
      const dims = sizeWidths[size]
      return (
        <div
          className="prui-modal-overlay fixed inset-0 z-[10001] flex justify-center overflow-y-auto p-4"
          style={{
            alignItems: "flex-start",
            paddingTop: "12vh",
            backgroundColor: "rgba(0, 0, 0, 0.55)",
            backdropFilter: "blur(4px)",
            opacity: animating ? 1 : 0,
            transition: "opacity 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)",
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-label={title}
            className="prui-modal-content relative m-auto w-full"
            style={{
              width: dims.width,
              minWidth: dims.minWidth,
              backgroundColor: "var(--prui-surface)",
              border: "1px solid var(--prui-line)",
              borderRadius: "var(--prui-radius-3)",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.4), 0 10px 10px -5px rgba(0,0,0,0.2)",
              color: "var(--prui-fg)",
              transform: animating ? "scale(1) translateY(0)" : "scale(0.95) translateY(8px)",
              opacity: animating ? 1 : 0,
              transition: "transform 0.3s cubic-bezier(0.25,0.1,0.25,1), opacity 0.3s cubic-bezier(0.25,0.1,0.25,1)",
            }}
          >
            <div className="flex items-start gap-3 p-4 pb-2">
              <ConfirmIcon type={type} />
              <div className="min-w-0">
                <h2 className="m-0 text-lg font-semibold leading-normal" style={{ color: "var(--prui-fg)" }}>{title}</h2>
                <p className="mt-2 text-sm leading-normal" style={{ color: "var(--prui-dim)" }}>{message}</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-4 pb-4">
              <button
                type="button"
                ref={cancelRef}
                disabled={isPending}
                onClick={() => finish(false)}
                className="cursor-pointer rounded-[var(--prui-radius)] border px-4 py-2 text-sm font-medium transition-all disabled:opacity-60"
                style={{ background: "transparent", borderColor: "var(--prui-line)", color: "var(--prui-fg)" }}
              >
                {cancelText}
              </button>
              <button
                type="button"
                ref={confirmRef}
                disabled={isPending}
                onClick={() => finish(true)}
                className="cursor-pointer rounded-[var(--prui-radius)] border border-transparent px-4 py-2 text-sm font-medium text-white transition-all disabled:opacity-60"
                style={{ backgroundColor: accent }}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      )
    }

    root.render(<ConfirmComponent />)
  })


}

/* ---------------- meta ---------------- */

export const modalPropsMeta: PropsMeta = {
  name: "Modal",
  props: [
    { name: "open", type: "boolean", default: null, control: "boolean" },
    { name: "onClose", type: "() => void", default: null, control: "none" },
    { name: "size", type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", control: "select", options: ["xs", "sm", "md", "lg", "xl"] },
    { name: "closeOnOverlayClick", type: "boolean", default: "true", control: "boolean" },
    { name: "disableDefaultClose", type: "boolean", default: "false", control: "boolean" },
    { name: "noPadding", type: "boolean", default: "false", control: "boolean" },
    { name: "showCloseButton", type: "boolean", default: "true", control: "boolean" },
    { name: "padding", type: "string (CSS)", default: "per-size", control: "text" },
    { name: "maxWidth", type: "string (CSS)", default: "per-size", control: "text" },
  ],
}

export const confirmModalPropsMeta: PropsMeta = {
  name: "confirmModal",
  props: [
    { name: "title", type: "string", default: null, control: "text" },
    { name: "message", type: "string", default: null, control: "textarea" },
    { name: "confirmText", type: "string", default: "'Confirm'", control: "text" },
    { name: "cancelText", type: "string", default: "'Cancel'", control: "text" },
    { name: "type", type: "'success' | 'warning' | 'danger' | 'error' | 'info'", default: "undefined", control: "select", options: ["success", "warning", "danger", "error", "info"] },
  ],
}
