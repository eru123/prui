import * as React from "react"

/**
 * Placement engine for portaled floating surfaces (Tooltip, Popover,
 * Dropdown, DatePicker, Combobox). A placement is "side-align" (for example
 * bottom-end): the side names the edge of the trigger the surface hugs, the
 * alignment positions it along that edge, with start/end resolved against
 * the writing direction.
 *
 * Positioning is collision-aware: the preferred placement is used verbatim
 * when it fits the visible boundary, otherwise the engine evaluates every
 * supported placement by actual geometry, preferring a small shift along the
 * secondary axis over flipping sides, and flipping the side over large
 * alignment changes. When nothing fits completely it keeps the placement
 * with the greatest visible area and constrains the rect into the boundary.
 * Final coordinates are always the result of this geometry pass, never
 * hardcoded per placement.
 */

export type AnchorSide = "top" | "bottom" | "left" | "right"
export type AnchorAlign = "start" | "center" | "end"
/** Side + alignment, e.g. "bottom-end". */
export type Placement = `${AnchorSide}-${AnchorAlign}`

export const PLACEMENTS: Placement[] = [
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
]

export const DEFAULT_PLACEMENT: Placement = "bottom-end"

/** Axis-aligned rectangle in viewport (client) coordinates. */
export interface Rect {
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
}

export interface AnchoredPosition {
  top: number
  left: number
  /** Side actually used after collision resolution. */
  side: AnchorSide
  /** Alignment actually used (the logical value, not its physical meaning). */
  align: AnchorAlign
  /** `side-align` actually used. */
  placement: Placement
}

export interface PositionOptions {
  /** Visible/clipping boundary in client coordinates. Defaults to the viewport. */
  boundary?: Rect
  /** Space between trigger and floating element along the main axis. Default 8. */
  gap?: number
  /** Inset kept between the floating element and the boundary edges. Default 8. */
  padding?: number
  /** Writing direction that resolves logical start/end. Default "ltr". */
  dir?: "ltr" | "rtl"
}

const GAP = 8
const BOUNDARY_PADDING = 8
/** Sub-pixel tolerance for fit checks so fractional rects don't flap. */
const EPS = 0.5

function rectFromDOM(r: Rect | DOMRect): Rect {
  return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height }
}

function viewportRect(): Rect | null {
  if (typeof window === "undefined") return null
  return {
    left: 0,
    top: 0,
    right: window.innerWidth,
    bottom: window.innerHeight,
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

function intersectRects(a: Rect, b: Rect): Rect | null {
  const left = Math.max(a.left, b.left)
  const top = Math.max(a.top, b.top)
  const right = Math.min(a.right, b.right)
  const bottom = Math.min(a.bottom, b.bottom)
  if (right <= left || bottom <= top) return null
  return { left, top, right, bottom, width: right - left, height: bottom - top }
}

/**
 * Physical alignment fraction along the cross axis: 0 aligns the start
 * edges (left/top), 1 the end edges (right/bottom). start/end are logical:
 * on the horizontal axis they flip under RTL; on the vertical axis start is
 * top and end is bottom for horizontal writing modes.
 */
function alignFraction(align: AnchorAlign, horizontal: boolean, dir: "ltr" | "rtl"): number {
  if (align === "center") return 0.5
  const flip = horizontal && dir === "rtl"
  if (align === "start") return flip ? 1 : 0
  return flip ? 0 : 1
}

/** Base rect for a placement: offset along the side, aligned along the cross axis. */
function placementRect(
  anchor: Rect,
  size: { width: number; height: number },
  side: AnchorSide,
  fraction: number,
  gap: number,
): Rect {
  const { width, height } = size
  let left = 0
  let top = 0
  if (side === "bottom") top = anchor.bottom + gap
  else if (side === "top") top = anchor.top - gap - height
  else if (side === "right") left = anchor.right + gap
  else left = anchor.left - gap - width

  if (side === "top" || side === "bottom") {
    left = anchor.left + (anchor.width - width) * fraction
  } else {
    top = anchor.top + (anchor.height - height) * fraction
  }
  return { left, top, right: left + width, bottom: top + height, width, height }
}

function fitsIn(r: Rect, bounds: Rect): boolean {
  return (
    r.left >= bounds.left - EPS &&
    r.right <= bounds.right + EPS &&
    r.top >= bounds.top - EPS &&
    r.bottom <= bounds.bottom + EPS
  )
}

/** Slide the rect along the secondary axis only, keeping the main-axis anchor. */
function shiftedInto(r: Rect, bounds: Rect, side: AnchorSide): Rect {
  if (side === "top" || side === "bottom") {
    const left = Math.min(Math.max(r.left, bounds.left), Math.max(bounds.left, bounds.right - r.width))
    return { ...r, left, right: left + r.width }
  }
  const top = Math.min(Math.max(r.top, bounds.top), Math.max(bounds.top, bounds.bottom - r.height))
  return { ...r, top, bottom: top + r.height }
}

/** Constrain along both axes; the nothing-fits last resort. */
function clampedInto(r: Rect, bounds: Rect): Rect {
  const maxLeft = Math.max(bounds.left, bounds.right - r.width)
  const maxTop = Math.max(bounds.top, bounds.bottom - r.height)
  const left = Math.min(Math.max(r.left, bounds.left), maxLeft)
  const top = Math.min(Math.max(r.top, bounds.top), maxTop)
  return { ...r, left, top, right: left + r.width, bottom: top + r.height }
}

function visibleArea(r: Rect, bounds: Rect): number {
  const w = Math.min(r.right, bounds.right) - Math.max(r.left, bounds.left)
  const h = Math.min(r.bottom, bounds.bottom) - Math.max(r.top, bounds.top)
  return Math.max(0, w) * Math.max(0, h)
}

const OPPOSITE: Record<AnchorSide, AnchorSide> = { top: "bottom", bottom: "top", left: "right", right: "left" }
const PERPENDICULAR: Record<AnchorSide, AnchorSide[]> = {
  top: ["right", "left"],
  bottom: ["right", "left"],
  left: ["bottom", "top"],
  right: ["bottom", "top"],
}

/**
 * Preference order for collision resolution: the preferred placement, then
 * its opposite side (a flip) and the perpendicular sides, keeping the
 * requested alignment before trying center and the other alignment. This is
 * a preference, not a fixed cycle: every candidate is still judged by its
 * actual geometry.
 */
function candidatePlacements(preferred: Placement): Placement[] {
  const [side, align] = preferred.split("-") as [AnchorSide, AnchorAlign]
  const sides: AnchorSide[] = [side, OPPOSITE[side], ...PERPENDICULAR[side]]
  const aligns: AnchorAlign[] =
    align === "center" ? ["center", "start", "end"] : [align, "center", align === "start" ? "end" : "start"]
  const out: Placement[] = []
  for (const s of sides) for (const a of aligns) out.push(`${s}-${a}`)
  return out
}

/** Resolve options into the boundary inset by the padding (the region the surface must fit inside). */
function resolveOptions(options: PositionOptions): { boundary: Rect; gap: number; dir: "ltr" | "rtl" } {
  const boundary = options.boundary ??
    viewportRect() ?? { left: 0, top: 0, right: 16384, bottom: 16384, width: 16384, height: 16384 }
  const padding = options.padding ?? BOUNDARY_PADDING
  // a boundary smaller than twice the padding would invert its inner rect
  const inset =
    boundary.width > padding * 2 && boundary.height > padding * 2
      ? padding
      : Math.min(padding, boundary.width / 2, boundary.height / 2)
  return {
    boundary: {
      left: boundary.left + inset,
      top: boundary.top + inset,
      right: boundary.right - inset,
      bottom: boundary.bottom - inset,
      width: boundary.width - inset * 2,
      height: boundary.height - inset * 2,
    },
    gap: options.gap ?? GAP,
    dir: options.dir ?? "ltr",
  }
}

/**
 * The placement engine: geometry for the preferred placement, then
 * shift-before-flip collision resolution over all twelve placements, then a
 * greatest-visible-area fallback. Pure: pass the boundary in (the hook uses
 * the effective clipping boundary of the anchor).
 */
export function computePlacement(
  anchor: Rect | DOMRect,
  floatingSize: { width: number; height: number },
  placement: Placement = DEFAULT_PLACEMENT,
  options: PositionOptions = {},
): AnchoredPosition {
  const anchorRect = rectFromDOM(anchor)
  const { boundary, gap, dir } = resolveOptions(options)
  const size = { width: Math.max(0, floatingSize.width), height: Math.max(0, floatingSize.height) }

  const evaluate = (candidate: Placement) => {
    const [side, align] = candidate.split("-") as [AnchorSide, AnchorAlign]
    const horizontal = side === "top" || side === "bottom"
    const base = placementRect(anchorRect, size, side, alignFraction(align, horizontal, dir), gap)
    return { side, align, base, shifted: shiftedInto(base, boundary, side) }
  }

  // 1) first candidate that fits wins: preferred verbatim, else preferred
  //    shifted (a small shift beats a flip), then flips in preference order
  for (const candidate of candidatePlacements(placement)) {
    const { side, align, base, shifted } = evaluate(candidate)
    if (fitsIn(base, boundary)) return { top: base.top, left: base.left, side, align, placement: `${side}-${align}` }
    if (fitsIn(shifted, boundary))
      return { top: shifted.top, left: shifted.left, side, align, placement: `${side}-${align}` }
  }

  // 2) nothing fits completely: keep the placement whose shifted rect shows
  //    the most area inside the boundary, preference order breaks ties
  const candidates = candidatePlacements(placement)
  let winner = evaluate(placement)
  let winnerArea = visibleArea(winner.shifted, boundary)
  for (const candidate of candidates) {
    const next = evaluate(candidate)
    const area = visibleArea(next.shifted, boundary)
    if (area > winnerArea) {
      winner = next
      winnerArea = area
    }
  }
  const rect = clampedInto(winner.shifted, boundary)
  return {
    top: rect.top,
    left: rect.left,
    side: winner.side,
    align: winner.align,
    placement: `${winner.side}-${winner.align}`,
  }
}

/** Legacy side+align entry point; equivalent to computePlacement(`${side}-${align}`). */
export function computePosition(
  anchor: Rect | DOMRect,
  floatingSize: { width: number; height: number },
  side: AnchorSide,
  align: AnchorAlign = "start",
  options: PositionOptions = {},
): AnchoredPosition {
  return computePlacement(anchor, floatingSize, `${side}-${align}`, options)
}

/**
 * The effective visible boundary for an anchor: the viewport intersected
 * with every clipping ancestor (overflow auto/scroll/hidden/clip) between
 * the anchor and the body. A fully clipped container empties the
 * intersection; the last sane region wins so the surface still places near
 * the trigger.
 */
export function getClippingBoundary(anchor: HTMLElement): Rect {
  const viewport = viewportRect() ?? { left: 0, top: 0, right: 16384, bottom: 16384, width: 16384, height: 16384 }
  let boundary = viewport
  if (typeof document === "undefined") return boundary
  let node: HTMLElement | null = anchor.parentElement
  while (node && node !== document.body) {
    const style = window.getComputedStyle(node)
    const clips = /(auto|scroll|hidden|clip)/.test(`${style.overflow} ${style.overflowX} ${style.overflowY}`)
    if (clips) {
      const next = intersectRects(boundary, rectFromDOM(node.getBoundingClientRect()))
      if (next) boundary = next
    }
    node = node.parentElement
  }
  return boundary
}

function readDirection(el: HTMLElement): "ltr" | "rtl" {
  if (typeof window === "undefined" || !el) return "ltr"
  return window.getComputedStyle(el).direction === "rtl" ? "rtl" : "ltr"
}

/** Cheap change signature: any input the engine reads, serialized. */
function triggerSignature(anchor: HTMLElement, el: HTMLElement): string {
  const r = anchor.getBoundingClientRect()
  return `${r.top};${r.left};${r.width};${r.height};${el.offsetWidth};${el.offsetHeight};${window.innerWidth};${window.innerHeight}`
}

function samePosition(a: AnchoredPosition, b: AnchoredPosition): boolean {
  return a.top === b.top && a.left === b.left && a.placement === b.placement
}

/**
 * Tracks a floating element's position against its anchor. Returns the ref
 * for the floating element and the current position (null before measure).
 * `placement` is the preferred placement (default bottom-end); legacy
 * side/align compose into one when given. Recomputes while active on
 * scroll, resize, and — via a frame-loop diff of the measured geometry —
 * trigger moves, trigger size changes, popover content size changes, and
 * container dimension changes.
 */
export function useAnchoredPosition({
  active,
  anchorRef,
  placement,
  side,
  align,
  offsetHeight,
  offsetWidth,
}: {
  active: boolean
  anchorRef: React.RefObject<HTMLElement | null>
  placement?: Placement
  side?: AnchorSide
  align?: AnchorAlign
  offsetHeight?: number
  offsetWidth?: number
}): {
  ref: (el: HTMLElement | null) => void
  position: AnchoredPosition | null
} {
  const preferred: Placement =
    placement ??
    (side !== undefined || align !== undefined ? `${side ?? "bottom"}-${align ?? "start"}` : DEFAULT_PLACEMENT)

  const [el, setEl] = React.useState<HTMLElement | null>(null)
  const [position, setPosition] = React.useState<AnchoredPosition | null>(null)
  const lastSignature = React.useRef("")

  const recompute = React.useCallback(() => {
    const anchor = anchorRef.current
    if (!anchor || !el || typeof window === "undefined") return
    const width = offsetWidth ?? el.offsetWidth ?? 160
    const height = offsetHeight ?? el.offsetHeight ?? 200
    const next = computePlacement(anchor.getBoundingClientRect(), { width, height }, preferred, {
      boundary: getClippingBoundary(anchor),
      dir: readDirection(anchor),
    })
    lastSignature.current = triggerSignature(anchor, el)
    setPosition((prev) => (prev && samePosition(prev, next) ? prev : next))
  }, [anchorRef, el, preferred, offsetHeight, offsetWidth])

  React.useEffect(() => {
    if (!active) {
      setPosition(null)
      lastSignature.current = ""
      return
    }
    if (typeof window === "undefined") return
    recompute()
    // capture phase: scrolls in any scrollable container, not just window
    window.addEventListener("scroll", recompute, true)
    window.addEventListener("resize", recompute)
    // frame-loop diff catches geometry changes no event reports: the
    // trigger moving (layout shifts, animations), the popover content
    // resizing, containers resizing. Reads only; recomputes on change.
    let raf = 0
    const tick = () => {
      const anchor = anchorRef.current
      if (anchor && el && triggerSignature(anchor, el) !== lastSignature.current) recompute()
      raf = window.requestAnimationFrame(tick)
    }
    raf = window.requestAnimationFrame(tick)
    return () => {
      window.removeEventListener("scroll", recompute, true)
      window.removeEventListener("resize", recompute)
      window.cancelAnimationFrame(raf)
    }
  }, [active, recompute, anchorRef, el])

  const ref = React.useCallback((node: HTMLElement | null) => {
    setEl(node)
  }, [])

  return { ref, position }
}
