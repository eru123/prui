import * as React from "react"

/**
 * Anchor positioning for portaled floating surfaces (Tooltip, Popover,
 * DatePicker, Combobox): position an absolutely-placed element relative to
 * a trigger's bounding rect, flipping/clamping to the viewport. Re-computes
 * on scroll and resize.
 */

export type AnchorSide = "top" | "bottom" | "left" | "right"
export type AnchorAlign = "start" | "center" | "end"

export interface AnchoredPosition {
  top: number
  left: number
  /** The side actually used after viewport flipping. */
  side: AnchorSide
}

const GAP = 8
const VIEWPORT_PADDING = 8

export function computePosition(
  anchor: DOMRect,
  floatingSize: { width: number; height: number },
  side: AnchorSide,
  align: AnchorAlign = "start",
): AnchoredPosition {
  const vw = window.innerWidth
  const vh = window.innerHeight
  let usedSide = side
  let top: number
  let left: number

  const alignMain = () => {
    if (align === "start") return 0
    if (align === "end") return 1
    return 0.5
  }
  const f = alignMain()

  if (side === "top" || side === "bottom") {
    if (side === "bottom" && anchor.bottom + GAP + floatingSize.height > vh - VIEWPORT_PADDING) usedSide = "top"
    if (side === "top" && anchor.top - GAP - floatingSize.height < VIEWPORT_PADDING) usedSide = "bottom"
    top = usedSide === "bottom" ? anchor.bottom + GAP : anchor.top - GAP - floatingSize.height
    left = anchor.left + (anchor.width - floatingSize.width) * f
  } else {
    if (side === "right" && anchor.right + GAP + floatingSize.width > vw - VIEWPORT_PADDING) usedSide = "left"
    if (side === "left" && anchor.left - GAP - floatingSize.width < VIEWPORT_PADDING) usedSide = "right"
    left = usedSide === "right" ? anchor.right + GAP : anchor.left - GAP - floatingSize.width
    top = anchor.top + (anchor.height - floatingSize.height) * f
  }

  // clamp into the viewport
  left = Math.max(VIEWPORT_PADDING, Math.min(left, vw - floatingSize.width - VIEWPORT_PADDING))
  top = Math.max(VIEWPORT_PADDING, Math.min(top, vh - floatingSize.height - VIEWPORT_PADDING))

  return { top, left, side: usedSide }
}

/**
 * Tracks a floating element's position against its anchor. Returns the ref
 * for the floating element and the current position (null before measure).
 * Recomputes on scroll/resize while active.
 */
export function useAnchoredPosition({
  active,
  anchorRef,
  side = "bottom",
  align = "start",
  offsetHeight,
  offsetWidth,
}: {
  active: boolean
  anchorRef: React.RefObject<HTMLElement | null>
  side?: AnchorSide
  align?: AnchorAlign
  offsetHeight?: number
  offsetWidth?: number
}): {
  ref: (el: HTMLElement | null) => void
  position: AnchoredPosition | null
} {
  const [el, setEl] = React.useState<HTMLElement | null>(null)
  const [position, setPosition] = React.useState<AnchoredPosition | null>(null)

  const recompute = React.useCallback(() => {
    const anchor = anchorRef.current
    if (!anchor || !el) return
    const width = offsetWidth ?? el.offsetWidth ?? 160
    const height = offsetHeight ?? el.offsetHeight ?? 200
    setPosition(computePosition(anchor.getBoundingClientRect(), { width, height }, side, align))
  }, [anchorRef, el, side, align, offsetHeight, offsetWidth])

  React.useEffect(() => {
    if (!active) {
      setPosition(null)
      return
    }
    recompute()
    if (typeof window === "undefined") return
    window.addEventListener("scroll", recompute, true)
    window.addEventListener("resize", recompute)
    return () => {
      window.removeEventListener("scroll", recompute, true)
      window.removeEventListener("resize", recompute)
    }
  }, [active, recompute])

  const ref = React.useCallback((node: HTMLElement | null) => {
    setEl(node)
  }, [])

  return { ref, position }
}
