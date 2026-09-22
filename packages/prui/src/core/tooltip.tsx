import * as React from "react"
import { cn } from "./cn"
import { Portal, useOverlayStack, useEscapeKey, useReducedMotion } from "./overlay"
import { useAnchoredPosition, type AnchorSide, type AnchorAlign } from "./anchor"
import type { PropsMeta } from "./props-meta"

/**
 * Tooltip: a hover/focus-triggered label for controls. Non-modal (no trap,
 * no scroll lock): Escape (topmost overlay only) hides it, focus stays on
 * the trigger, and it repositions/flips against the viewport. Shows after
 * a short delay, hides immediately; reduced motion skips the fade.
 */

export interface TooltipProps {
  /** Tooltip content (plain text recommended). */
  content: React.ReactNode
  children?: React.ReactNode
  /** Preferred side of the trigger. Default top. */
  side?: AnchorSide
  align?: AnchorAlign
  /** Show delay in ms. Default 300. */
  delay?: number
  /** Accessible label for the trigger wrapper when the child is not labeled. */
  className?: string
}

export const Tooltip = React.forwardRef<HTMLSpanElement, TooltipProps>(function Tooltip(
  { content, children, side = "top", align = "center", delay = 300, className },
  ref,
) {
  void ref
  const [open, setOpen] = React.useState(false)
  const anchorRef = React.useRef<HTMLSpanElement>(null)
  const timer = React.useRef<number | null>(null)
  const reduced = useReducedMotion()

  const { setElement, isTop } = useOverlayStack(open)
  useEscapeKey(open, isTop, () => setOpen(false))

  const { ref: floatingRef, position } = useAnchoredPosition({ active: open, anchorRef, side, align, offsetHeight: 32 })

  const show = () => {
    if (timer.current != null) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setOpen(true), delay)
  }
  const hide = () => {
    if (timer.current != null) window.clearTimeout(timer.current)
    setOpen(false)
  }
  React.useEffect(
    () => () => {
      if (timer.current != null) window.clearTimeout(timer.current)
    },
    [],
  )

  // trigger: clone a provided element or wrap plain content in a span
  let triggerNode: React.ReactNode
  if (React.isValidElement(children)) {
    const child = children as React.ReactElement<Record<string, unknown>>
    triggerNode = React.cloneElement(child, {
      ref: (el: HTMLElement) => {
        anchorRef.current = el as HTMLSpanElement
        const original = child.props.ref as React.Ref<HTMLElement> | undefined
        if (typeof original === "function") (original as (v: HTMLElement | null) => void)(el)
        else if (original && typeof original === "object") (original as React.MutableRefObject<HTMLElement | null>).current = el
      },
      onFocus: (e: React.FocusEvent) => {
        ;(child.props.onFocus as ((ev: React.FocusEvent) => void) | undefined)?.(e)
        show()
      },
      onBlur: (e: React.FocusEvent) => {
        ;(child.props.onBlur as ((ev: React.FocusEvent) => void) | undefined)?.(e)
        hide()
      },
      onMouseEnter: (e: React.MouseEvent) => {
        ;(child.props.onMouseEnter as ((ev: React.MouseEvent) => void) | undefined)?.(e)
        show()
      },
      onMouseLeave: (e: React.MouseEvent) => {
        ;(child.props.onMouseLeave as ((ev: React.MouseEvent) => void) | undefined)?.(e)
        hide()
      },
    })
  } else {
    triggerNode = (
      <span
        ref={anchorRef}
        tabIndex={0}
        className={cn("inline-flex", className)}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </span>
    )
  }

  return (
    <>
      {triggerNode}
      {open ? (
        <Portal>
          <div
            ref={(node) => {
              floatingRef(node)
              setElement(node?.parentElement ?? null)
            }}
            role="tooltip"
            data-state="open"
            data-side={position?.side ?? side}
            className={cn(
              "prui-tooltip fixed z-[var(--prui-z-tooltip)] max-w-60 rounded-prui-sm",
              "border border-line bg-surface px-2 py-1 text-xs text-fg",
              "shadow-prui-md pointer-events-none",
              !reduced && "prui-anim-fade",
            )}
            style={
              position
                ? { top: position.top, left: position.left }
                : { top: -9999, left: -9999 }
            }
          >
            {content}
          </div>
        </Portal>
      ) : null}
    </>
  )
})
Tooltip.displayName = "Tooltip"

export const tooltipPropsMeta: PropsMeta = {
  name: "Tooltip",
  props: [
    { name: "content", type: "ReactNode", default: null, control: "text" },
    { name: "side", type: "'top' | 'bottom' | 'left' | 'right'", default: "'top'", control: "select", options: ["top", "bottom", "left", "right"] },
    { name: "align", type: "'start' | 'center' | 'end'", default: "'center'", control: "select", options: ["start", "center", "end"] },
    { name: "delay", type: "number (ms)", default: "300", control: "number" },
  ],
}
