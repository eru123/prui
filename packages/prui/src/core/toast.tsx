import * as React from "react"
import { createPortal } from "react-dom"
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react"
import { cn } from "./cn"
import { usePruiI18n } from "../i18n"
import { useReducedMotion } from "./overlay"
import type { PropsMeta } from "./props-meta"

/**
 * Toast: transient notifications.
 *
 * - <Toaster /> renders the portaled stack (mount once near the app root).
 * - toast() queues imperatively from anywhere and returns a dismiss handle:
 *   const t = toast({ title: "Saved", variant: "success" }); t.dismiss().
 *
 * Announcements go through an aria-live region; the stack never steals
 * focus. prefers-reduced-motion disables the slide/fade.
 */

export type ToastVariant = "neutral" | "info" | "success" | "warning" | "danger"

export interface ToastOptions {
  title: React.ReactNode
  description?: React.ReactNode
  variant?: ToastVariant
  /** Auto-dismiss delay in ms; 0 disables. Default 5000. */
  duration?: number
  onDismiss?: () => void
}

export interface ToastHandle {
  dismiss: () => void
}

interface ToastEntry extends ToastOptions {
  id: number
}

const toastStyles: Record<ToastVariant, { icon: typeof Info; accent: string }> = {
  neutral: { icon: Info, accent: "text-[var(--prui-brand)]" },
  info: { icon: Info, accent: "text-[var(--prui-brand)]" },
  success: { icon: CheckCircle2, accent: "text-[var(--prui-ok)]" },
  warning: { icon: AlertTriangle, accent: "text-[var(--prui-warn)]" },
  danger: { icon: XCircle, accent: "text-[var(--prui-danger)]" },
}

/* ---------------- store (works with or without the hook) ---------------- */

let nextId = 1
let entries: ToastEntry[] = []
const subscribers = new Set<(e: ToastEntry[]) => void>()

function publish(): void {
  for (const s of subscribers) s(entries)
}

function dismissToast(id: number): void {
  const entry = entries.find((e) => e.id === id)
  entries = entries.filter((e) => e.id !== id)
  if (entry) entry.onDismiss?.()
  publish()
}

/** Queue a toast; returns a handle to dismiss it early. */
export function toast(options: ToastOptions): ToastHandle {
  const id = nextId++
  entries = [...entries, { ...options, id }]
  publish()
  const duration = options.duration ?? 5000
  if (duration > 0 && typeof setTimeout === "function") {
    setTimeout(() => dismissToast(id), duration)
  }
  return { dismiss: () => dismissToast(id) }
}

/** Dismiss every toast. */
export function dismissAllToasts(): void {
  const prev = entries
  entries = []
  for (const e of prev) e.onDismiss?.()
  publish()
}

/* ---------------- Toaster component ---------------- */

function useToasts(): ToastEntry[] {
  const [list, setList] = React.useState<ToastEntry[]>(entries)
  React.useEffect(() => {
    const on = (e: ToastEntry[]) => setList([...e])
    subscribers.add(on)
    on(entries)
    return () => {
      subscribers.delete(on)
    }
  }, [])
  return list
}

export interface ToasterProps {
  /** Stack corner. Default bottom-right (bottom-start in RTL). */
  position?: "top-right" | "top-center" | "bottom-right" | "bottom-center" | "bottom-left"
  className?: string
}

export function Toaster({ position = "bottom-right", className }: ToasterProps = {}) {
  const list = useToasts()
  const { t } = usePruiI18n()
  const reduced = useReducedMotion()
  if (typeof document === "undefined") return null

  const posClass = {
    "top-right": "top-4 right-4",
    "top-center": "top-4 left-1/2 -translate-x-1/2",
    "bottom-right": "bottom-4 right-4",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
    "bottom-left": "bottom-4 left-4",
  }[position]

  return createPortal(
    <ol
      aria-live="polite"
      aria-label={t.notifications}
      className={cn("fixed z-[var(--prui-z-toast)] flex w-80 flex-col gap-2", posClass, className)}
    >
      {list.map((entry) => {
        const Icon = toastStyles[entry.variant ?? "neutral"].icon
        const accent = toastStyles[entry.variant ?? "neutral"].accent
        return (
          <li
            key={entry.id}
            data-testid="toast"
            data-variant={entry.variant ?? "neutral"}
            className={cn(
              "prui-toast flex items-start gap-3 rounded-[var(--prui-radius)] border border-[var(--prui-line)]",
              "bg-[var(--prui-surface)] p-4 text-sm shadow-[var(--prui-shadow-md)]",
              !reduced && "prui-anim-slide",
            )}
          >
            <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", accent)} aria-hidden />
            <div className="min-w-0 flex-1">
              <div className="font-medium text-[var(--prui-fg)]">{entry.title}</div>
              {entry.description ? <div className="mt-0.5 text-[var(--prui-dim)]">{entry.description}</div> : null}
            </div>
            <button
              type="button"
              aria-label={t.dismiss}
              onClick={() => dismissToast(entry.id)}
              className="-m-1 rounded-[var(--prui-radius-1)] p-1 cursor-pointer text-[var(--prui-dim)] transition-colors hover:text-[var(--prui-fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--prui-brand)]"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </li>
        )
      })}
    </ol>,
    document.body,
  )
}

export const toasterPropsMeta: PropsMeta = {
  name: "Toaster",
  props: [
    { name: "position", type: "'top-right' | 'top-center' | 'bottom-right' | 'bottom-center' | 'bottom-left'", default: "'bottom-right'", control: "select", options: ["top-right", "top-center", "bottom-right", "bottom-center", "bottom-left"] },
    { name: "className", type: "string", default: "undefined", control: "text" },
  ],
}

export const toastPropsMeta: PropsMeta = {
  name: "toast()",
  props: [
    { name: "title", type: "ReactNode", default: null, control: "text" },
    { name: "description", type: "ReactNode", default: null, control: "text" },
    { name: "variant", type: "'neutral' | 'info' | 'success' | 'warning' | 'danger'", default: "'neutral'", control: "select", options: ["neutral", "info", "success", "warning", "danger"] },
    { name: "duration", type: "number (ms)", default: "5000", control: "number" },
  ],
}
