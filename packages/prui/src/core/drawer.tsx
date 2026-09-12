import * as React from "react"
import { X } from "lucide-react"
import { cn } from "./cn"
import { Portal, useOverlay, useMountTransition } from "./overlay"
import { usePruiI18n } from "../i18n"
import type { PropsMeta } from "./props-meta"

/**
 * Drawer: a side-anchored modal panel (left/right/top/bottom) built on the
 * shared overlay infrastructure: portaled, focus-trapped, scroll-locked,
 * background inert, topmost Escape, focus restoration, reduced motion.
 * Sheet is the same surface preset to bottom (mobile-first) with a drag
 * handle. Controlled and uncontrolled open.
 */

export type DrawerSide = "left" | "right" | "top" | "bottom"

export interface DrawerProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Anchor edge. Default right. */
  side?: DrawerSide
  /** Panel width for left/right (any CSS length). Default 400px. */
  size?: number | string
  children?: React.ReactNode
  /** Accessible label. */
  ariaLabel?: string
  /** Hide the close button. */
  hideClose?: boolean
  className?: string
  style?: React.CSSProperties
}

const sideClasses: Record<DrawerSide, string> = {
  left: "left-0 top-0 h-full prui-drawer-panel",
  right: "right-0 top-0 h-full prui-drawer-panel",
  top: "left-0 top-0 w-full prui-drawer-panel",
  bottom: "left-0 bottom-0 w-full prui-drawer-panel",
}

const enterTransform: Record<DrawerSide, string> = {
  left: "translateX(0)",
  right: "translateX(0)",
  top: "translateY(0)",
  bottom: "translateY(0)",
}

const exitTransform: Record<DrawerSide, string> = {
  left: "translateX(-100%)",
  right: "translateX(100%)",
  top: "translateY(-100%)",
  bottom: "translateY(100%)",
}

export const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(function Drawer(
  { open: openProp, defaultOpen = false, onOpenChange, side = "right", size, children, ariaLabel, hideClose, className, style },
  ref,
) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : uncontrolled
  const { mounted, shown } = useMountTransition(open)
  const { t } = usePruiI18n()

  const setOpen = (o: boolean) => {
    if (!isControlled) setUncontrolled(o)
    onOpenChange?.(o)
  }

  const { ref: overlayRef } = useOverlay({
    open,
    onEscape: () => setOpen(false),
  })

  if (!mounted) return null

  const panelStyle: React.CSSProperties = {
    transform: shown ? enterTransform[side] : exitTransform[side],
    transition: `transform var(--prui-duration-slow) var(--prui-ease-out)`,
    ...(side === "left" || side === "right" ? { width: typeof size === "number" ? `${size}px` : (size ?? "400px") } : { maxHeight: typeof size === "number" ? `${size}px` : (size ?? "80vh") }),
    ...style,
  }

  return (
    <Portal>
      <div ref={overlayRef}>
        <div
          className="prui-drawer-overlay fixed inset-0 z-[var(--prui-z-modal)]"
          style={{
            backgroundColor: "var(--prui-scrim)",
            opacity: shown ? 1 : 0,
            transition: `opacity var(--prui-duration-slow) var(--prui-ease-out)`,
          }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false)
          }}
        >
          <div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            data-state={shown ? "open" : "closed"}
            className={cn(
              "absolute flex flex-col overflow-y-auto border border-[var(--prui-line)] bg-[var(--prui-surface)]",
              "text-[var(--prui-fg)] shadow-[var(--prui-shadow-modal)] outline-none",
              sideClasses[side],
              className,
            )}
            style={panelStyle}
          >
            {side === "bottom" ? (
              <div aria-hidden className="mx-auto mt-2 mb-1 h-1 w-10 shrink-0 rounded-[var(--prui-radius-full)] bg-[var(--prui-line)]" />
            ) : null}
            {children}
            {!hideClose ? (
              <button
                type="button"
                aria-label={t.close}
                onClick={() => setOpen(false)}
                className="absolute right-3 top-3 rounded-[var(--prui-radius-1)] p-1 text-[var(--prui-dim)] transition-colors hover:bg-[var(--prui-raise)] hover:text-[var(--prui-fg)] cursor-pointer"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </Portal>
  )
})
Drawer.displayName = "Drawer"

/**
 * Sheet: the bottom-anchored Drawer preset (mobile-first detail surface).
 * Same overlay guarantees; size sets max height.
 */
export const Sheet = React.forwardRef<HTMLDivElement, Omit<DrawerProps, "side">>(function Sheet(props, ref) {
  return <Drawer ref={ref} side="bottom" {...props} />
})
Sheet.displayName = "Sheet"

export const drawerPropsMeta: PropsMeta = {
  name: "Drawer",
  props: [
    { name: "open", type: "boolean", default: "undefined", control: "boolean" },
    { name: "defaultOpen", type: "boolean", default: "false", control: "boolean" },
    { name: "onOpenChange", type: "(open: boolean) => void", default: null, control: "none" },
    { name: "side", type: "'left' | 'right' | 'top' | 'bottom'", default: "'right'", control: "select", options: ["left", "right", "top", "bottom"] },
    { name: "size", type: "number | string (CSS length)", default: "400px / 80vh", control: "text" },
    { name: "ariaLabel", type: "string", default: null, control: "text" },
    { name: "hideClose", type: "boolean", default: "false", control: "boolean" },
  ],
}

export const sheetPropsMeta: PropsMeta = {
  name: "Sheet",
  props: [
    { name: "open", type: "boolean", default: "undefined", control: "boolean" },
    { name: "onOpenChange", type: "(open: boolean) => void", default: null, control: "none" },
    { name: "size", type: "number | string (max height)", default: "80vh", control: "text" },
    { name: "ariaLabel", type: "string", default: null, control: "text" },
  ],
}
