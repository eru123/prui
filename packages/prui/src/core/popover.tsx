import * as React from "react"
import { cn } from "./cn"
import { Portal, useOverlayStack, useEscapeKey } from "./overlay"
import { useAnchoredPosition, type Placement, type AnchorSide, type AnchorAlign } from "./anchor"
import { usePruiI18n } from "../i18n"
import type { PropsMeta } from "./props-meta"

/**
 * Popover: a click-triggered anchored surface for rich content (filters,
 * pickers, little forms). Non-modal by default: Escape (topmost only) and
 * outside-pointer close it, focus starts inside the panel, and it returns
 * to the trigger on close. `modal` opts into the full trap + inert
 * background.
 */

export interface PopoverProps {
  /** The element that toggles the popover (cloned and wired up). */
  trigger?: React.ReactNode
  children?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /**
   * Preferred placement ("side-align", e.g. "bottom-end"); the engine
   * shifts/flips it to stay inside the visible boundary. Default
   * "bottom-end". Wins over the legacy side/align pair.
   */
  placement?: Placement
  /** Legacy pair composing a placement; `placement` wins when both are set. */
  side?: AnchorSide
  align?: AnchorAlign
  /** Focus-trap + inert background instead of a dismissible surface. */
  modal?: boolean
  /** Accessible label for the popover panel. */
  ariaLabel?: string
  /** Min panel width in px. Default 200. */
  minWidth?: number
  className?: string
}

export const Popover = React.forwardRef<HTMLDivElement, PopoverProps>(function Popover(
  {
    trigger,
    children,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    placement,
    side,
    align,
    modal = false,
    ariaLabel,
    minWidth = 200,
    className,
  },
  ref,
) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : uncontrolled
  const anchorRef = React.useRef<HTMLElement>(null)
  const panelRef = React.useRef<HTMLDivElement>(null)
  // panel element in STATE (not just a ref): the anchor hook's setState
  // inside the ref callback restarts the commit, so effects need the
  // post-commit re-render to see the attached node
  const [panelEl, setPanelEl] = React.useState<HTMLDivElement | null>(null)
  const { t } = usePruiI18n()

  const setOpen = (o: boolean) => {
    if (!isControlled) setUncontrolled(o)
    onOpenChange?.(o)
    if (!o) {
      const active = document.activeElement
      if (active && panelRef.current?.contains(active)) anchorRef.current?.focus()
    }
  }

  const { setElement, isTop } = useOverlayStack(open)
  useEscapeKey(open, isTop, () => setOpen(false))

  // bottom-end unless the caller expressed a preference; collision
  // resolution may still shift or flip it (see anchor.ts)
  const preferredPlacement: Placement =
    placement ?? (side !== undefined || align !== undefined ? `${side ?? "bottom"}-${align ?? "start"}` : "bottom-end")

  const { ref: floatingRef, position } = useAnchoredPosition({ active: open, anchorRef, placement: preferredPlacement })
  const actualPlacement = position?.placement ?? preferredPlacement

  // outside pointer closes non-modal popovers
  React.useEffect(() => {
    if (!open || modal) return
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node
      if (anchorRef.current?.contains(target)) return
      if (panelRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener("mousedown", onPointer)
    return () => document.removeEventListener("mousedown", onPointer)
  })

  // initial focus inside the panel (first focusable or the panel)
  React.useEffect(() => {
    if (!open) return
    const panel = panelEl
    if (!panel) return
    const focusables = panel.querySelectorAll<HTMLElement>(
      "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])",
    )
    const first = Array.from(focusables).find((el) => !el.hasAttribute("hidden"))
    ;(first ?? panel).focus()
  }, [open, panelEl])

  // trigger wiring via clone (avoids nested interactive elements)
  let triggerNode: React.ReactNode
  if (React.isValidElement(trigger)) {
    const child = trigger as React.ReactElement<Record<string, unknown>>
    triggerNode = React.cloneElement(child, {
      ref: (el: HTMLElement) => {
        anchorRef.current = el
        const original = child.props.ref as React.Ref<HTMLElement> | undefined
        if (typeof original === "function") (original as (v: HTMLElement | null) => void)(el)
        else if (original && typeof original === "object")
          (original as React.MutableRefObject<HTMLElement | null>).current = el
      },
      "aria-haspopup": "dialog",
      "aria-expanded": open,
      onClick: (e: React.MouseEvent) => {
        ;(child.props.onClick as ((ev: React.MouseEvent) => void) | undefined)?.(e)
        if (!e.defaultPrevented) setOpen(!open)
      },
    })
  } else {
    triggerNode = (
      <button
        type="button"
        ref={(el) => {
          anchorRef.current = el
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {trigger}
      </button>
    )
  }

  return (
    <>
      {triggerNode}
      {open ? (
        <Portal>
          <div
            ref={(node) => {
              panelRef.current = node
              setPanelEl(node)
              floatingRef(node)
              setElement(node)
              if (typeof ref === "function") ref(node)
              else if (ref) ref.current = node
            }}
            role="dialog"
            aria-label={ariaLabel ?? t.dismiss}
            tabIndex={-1}
            data-state={open ? "open" : "closed"}
            data-side={actualPlacement.split("-")[0]}
            data-align={actualPlacement.split("-")[1]}
            data-placement={actualPlacement}
            className={cn(
              "prui-popover fixed z-[var(--prui-z-overlay)] rounded-prui border border-line",
              "bg-surface p-4 text-sm text-fg shadow-prui-lg outline-none",
              className,
            )}
            style={{
              top: position?.top ?? -9999,
              left: position?.left ?? -9999,
              minWidth,
            }}
            onKeyDown={(e) => {
              if (!modal && e.key === "Tab") {
                // let focus leave; the popover closes with it
                setOpen(false)
              }
            }}
          >
            {children}
          </div>
        </Portal>
      ) : null}
    </>
  )
})
Popover.displayName = "Popover"

export const popoverPropsMeta: PropsMeta = {
  name: "Popover",
  props: [
    { name: "trigger", type: "ReactNode", default: null, control: "none" },
    { name: "open", type: "boolean", default: "undefined", control: "boolean" },
    { name: "defaultOpen", type: "boolean", default: "false", control: "boolean" },
    { name: "onOpenChange", type: "(open: boolean) => void", default: null, control: "none" },
    {
      name: "placement",
      type: "Placement",
      default: "'bottom-end'",
      control: "select",
      options: [
        "top-start",
        "top-center",
        "top-end",
        "bottom-start",
        "bottom-center",
        "bottom-end",
        "left-start",
        "left-center",
        "left-end",
        "right-start",
        "right-center",
        "right-end",
      ],
    },
    {
      name: "side",
      type: "'top' | 'bottom' | 'left' | 'right'",
      default: "undefined",
      control: "select",
      options: ["top", "bottom", "left", "right"],
    },
    {
      name: "align",
      type: "'start' | 'center' | 'end'",
      default: "undefined",
      control: "select",
      options: ["start", "center", "end"],
    },
    { name: "modal", type: "boolean", default: "false", control: "boolean" },
    { name: "ariaLabel", type: "string", default: "undefined", control: "text" },
  ],
}
