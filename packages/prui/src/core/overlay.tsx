import * as React from "react"
import { createPortal } from "react-dom"

/**
 * Shared overlay infrastructure.
 *
 * Every floating surface in PRUI (Modal, Dialog, Drawer, Sheet, Command
 * Palette, Dropdown, Tooltip, Popover, Toast, confirmModal) builds on the
 * primitives in this file instead of duplicating focus/escape/scroll logic:
 *
 * - <Portal> renders into document.body (or a custom container).
 * - useReducedMotion() mirrors prefers-reduced-motion.
 * - useOverlayStack() registers the overlay so only the TOPMOST one answers
 *   Escape, and nested dialogs stack correctly.
 * - useFocusTrap() cycles Tab/Shift+Tab inside the overlay, moves initial
 *   focus in, and restores focus to the invoker on close.
 * - useScrollLock() is counter-based so nested overlays cannot unlock each
 *   other's body lock.
 * - useInertBackground() hides the rest of the page from assistive tech
 *   (aria-hidden + the native inert attribute where supported).
 * - useOverlay() composes all of the above for modal surfaces.
 */

/* ------------------------------------------------------------------ */
/* Portal                                                              */
/* ------------------------------------------------------------------ */

export function Portal({
  children,
  container,
}: {
  children: React.ReactNode
  container?: HTMLElement | null
}) {
  const [mount, setMount] = React.useState<HTMLElement | null>(null)
  React.useEffect(() => {
    setMount(container ?? (typeof document !== "undefined" ? document.body : null))
  }, [container])
  if (mount == null) return null
  return createPortal(children, mount)
}

/* ------------------------------------------------------------------ */
/* Reduced motion                                                      */
/* ------------------------------------------------------------------ */

/** True when the user asked the OS for reduced motion. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  })
  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])
  return reduced
}

/**
 * Mount/unmount lifecycle for enter/exit animations. Mounts immediately when
 * `open` turns true; flips `shown` a frame later so the enter state (the
 * "from" transform) paints first — a single rAF can merge into that first
 * paint under discrete-event flushes and skip the animation entirely, so this
 * waits two frames. On close, `shown` drops at once and unmounting waits
 * `exitMs` for the exit animation. Reduced motion skips both directions.
 */
export function useMountTransition(open: boolean, exitMs = 300): { mounted: boolean; shown: boolean } {
  const reduced = useReducedMotion()
  const [mounted, setMounted] = React.useState(open)
  const [shown, setShown] = React.useState(false)
  React.useEffect(() => {
    if (open) {
      setMounted(true)
      if (reduced) {
        setShown(true)
        return
      }
      let inner = 0
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setShown(true))
      })
      return () => {
        cancelAnimationFrame(outer)
        cancelAnimationFrame(inner)
      }
    }
    setShown(false)
    if (reduced) {
      setMounted(false)
      return
    }
    const id = setTimeout(() => setMounted(false), exitMs)
    return () => clearTimeout(id)
  }, [open, reduced, exitMs])
  return { mounted, shown }
}

/* ------------------------------------------------------------------ */
/* Focusable queries                                                   */
/* ------------------------------------------------------------------ */

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  "object",
  "embed",
  "[tabindex]:not([tabindex='-1'])",
  "[contenteditable]:not([contenteditable='false'])",
].join(",")

/** All focusable elements inside root, in DOM order. */
export function getFocusable(root: HTMLElement | null): HTMLElement[] {
  if (!root) return []
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.closest("[inert], [aria-hidden='true']") && !el.hasAttribute("hidden"),
  )
}

/* ------------------------------------------------------------------ */
/* Overlay stack: nesting + topmost-escape                             */
/* ------------------------------------------------------------------ */

interface StackEntry {
  id: symbol
  element: HTMLElement | null
}

const overlayStack: StackEntry[] = []

/** Register an overlay; returns its stack id. */
export function pushOverlay(element: HTMLElement | null): symbol {
  const id = Symbol("prui-overlay")
  overlayStack.push({ id, element })
  return id
}

/** Unregister an overlay by id. */
export function removeOverlay(id: symbol): void {
  const idx = overlayStack.findIndex((e) => e.id === id)
  if (idx >= 0) overlayStack.splice(idx, 1)
}

/** True when `id` is the topmost registered overlay. */
export function isTopOverlay(id: symbol): boolean {
  const top = overlayStack[overlayStack.length - 1]
  return top != null && top.id === id
}

/** Number of currently open overlays (for nesting decisions). */
export function overlayCount(): number {
  return overlayStack.length
}

/**
 * Registers/unregisters an overlay in the stack while `active`.
 * Registration happens in effect order (= mount order = nesting order), so
 * the last-registered open overlay is the topmost. Returns
 * [setElement, isTop] — setElement keeps the stack entry's DOM node current
 * for inert-background exemption.
 */
export function useOverlayStack(active: boolean): {
  setElement: (el: HTMLElement | null) => void
  isTop: () => boolean
} {
  const idRef = React.useRef<symbol | null>(null)
  const entryRef = React.useRef<StackEntry | null>(null)
  const [mounted, force] = React.useReducer((c: number) => c + 1, 0)
  void mounted

  React.useEffect(() => {
    if (!active) return
    const id = pushOverlay(null)
    idRef.current = id
    entryRef.current = overlayStack[overlayStack.length - 1] ?? null
    force()
    return () => {
      removeOverlay(id)
      if (idRef.current === id) {
        idRef.current = null
        entryRef.current = null
      }
    }
  }, [active])

  const setElement = React.useCallback((el: HTMLElement | null) => {
    if (entryRef.current) entryRef.current.element = el
  }, [])

  const isTop = React.useCallback(() => (idRef.current != null ? isTopOverlay(idRef.current) : false), [])

  return { setElement, isTop }
}

/* ------------------------------------------------------------------ */
/* Escape key (topmost only)                                           */
/* ------------------------------------------------------------------ */

/**
 * Calls onEscape for Escape keydowns while active AND topmost in the overlay
 * stack. Returning false from onEscape marks the key handled-but-blocked
 * (e.g. the Modal shake) and stops the event from leaking to lower overlays.
 */
export function useEscapeKey(active: boolean, isTop: () => boolean, onEscape: () => boolean | void): void {
  const handlerRef = React.useRef(onEscape)
  handlerRef.current = onEscape
  React.useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      if (!isTop()) return
      const blocked = handlerRef.current() === false
      if (blocked) e.stopPropagation()
    }
    document.addEventListener("keydown", onKey, true)
    return () => document.removeEventListener("keydown", onKey, true)
  }, [active, isTop])
}

/* ------------------------------------------------------------------ */
/* Scroll lock (counter-based, nest-safe)                              */
/* ------------------------------------------------------------------ */

let scrollLockCount = 0
let prevBodyOverflow = ""
let prevBodyPaddingRight = ""

function lockBodyScroll(): void {
  if (typeof document === "undefined") return
  scrollLockCount++
  if (scrollLockCount > 1) return
  prevBodyOverflow = document.body.style.overflow
  prevBodyPaddingRight = document.body.style.paddingRight
  document.body.style.overflow = "hidden"
  document.body.classList.add("modal-open")
}

function unlockBodyScroll(): void {
  if (typeof document === "undefined") return
  scrollLockCount = Math.max(0, scrollLockCount - 1)
  if (scrollLockCount > 0) return
  document.body.style.overflow = prevBodyOverflow
  document.body.style.paddingRight = prevBodyPaddingRight
  document.body.classList.remove("modal-open")
}

/** Locks body scroll while active. Nest-safe: the last overlay to unlock wins. */
export function useScrollLock(active: boolean): void {
  React.useEffect(() => {
    if (!active) return
    lockBodyScroll()
    return unlockBodyScroll
  }, [active])
}

/* ------------------------------------------------------------------ */
/* Inert background                                                    */
/* ------------------------------------------------------------------ */

const INERT_SUPPORTED = typeof HTMLElement !== "undefined" && "inert" in HTMLElement.prototype

function inertOthers(portalEl: HTMLElement, exempt: ReadonlySet<HTMLElement>): () => void {
  const doc = portalEl.ownerDocument
  const affected: { el: HTMLElement; ariaHidden: string | null }[] = []
  for (const child of Array.from(doc.body.childNodes)) {
    if (!(child instanceof HTMLElement)) continue
    const tag = child.tagName
    if (tag === "SCRIPT" || tag === "STYLE" || tag === "LINK" || tag === "NOSCRIPT" || tag === "META" || tag === "TITLE" || tag === "TEMPLATE") continue
    if (child === portalEl || child.contains(portalEl) || portalEl.contains(child)) continue
    if (exempt.has(child)) continue
    if (child.getAttribute("aria-hidden") === "true") continue
    affected.push({ el: child, ariaHidden: child.getAttribute("aria-hidden") })
    child.setAttribute("aria-hidden", "true")
    if (INERT_SUPPORTED) child.setAttribute("inert", "")
  }
  return () => {
    for (const { el, ariaHidden } of affected) {
      if (ariaHidden === null) el.removeAttribute("aria-hidden")
      else el.setAttribute("aria-hidden", ariaHidden)
      if (INERT_SUPPORTED) el.removeAttribute("inert")
    }
  }
}

/**
 * Hides everything outside the overlay element from assistive technology
 * while active. Elements registered as open overlay portals (this overlay
 * and any nested ones) stay reachable. SSR-safe no-op.
 */
export function useInertBackground(active: boolean, element: HTMLElement | null): void {
  React.useEffect(() => {
    if (!active || !element || typeof document === "undefined") return
    const exempt = new Set<HTMLElement>()
    for (const entry of overlayStack) {
      if (entry.element) exempt.add(entry.element)
    }
    return inertOthers(element, exempt)
  }, [active, element])
}

/* ------------------------------------------------------------------ */
/* Focus trap + initial focus + restore                                */
/* ------------------------------------------------------------------ */

export interface FocusTrapOptions {
  active: boolean
  /** Container to trap inside. */
  container: HTMLElement | null
  /** Focus target on activation: a ref, "first" focusable, or the container. */
  initialFocus?: React.RefObject<HTMLElement | null> | "first" | "container" | false
  /** Return focus to the pre-open active element on deactivate. */
  restoreFocus?: boolean
}

export function useFocusTrap({ active, container, initialFocus = "first", restoreFocus = true }: FocusTrapOptions): void {
  const restoreRef = React.useRef<HTMLElement | null>(null)

  // activation: capture the invoker, move focus in
  React.useEffect(() => {
    if (!active) return
    restoreRef.current = (document.activeElement as HTMLElement) ?? null

    const target: HTMLElement | null =
      initialFocus === false
        ? null
        : initialFocus === "container"
          ? container
          : initialFocus === "first"
            ? (getFocusable(container)[0] ?? container)
            : (initialFocus.current ?? null)

    const el = target ?? container
    if (el && el.isConnected && !el.contains(document.activeElement)) {
      if (!el.hasAttribute("tabindex") && el.tagName !== "INPUT" && el.tagName !== "BUTTON" && el.tagName !== "TEXTAREA" && el.tagName !== "SELECT" && el.tagName !== "A" && !el.isContentEditable) {
        // container needs a tabindex to be focusable
        el.setAttribute("tabindex", "-1")
      }
      el.focus()
    }
  }, [active, container, initialFocus])

  // deactivation: restore focus to the invoker
  React.useEffect(() => {
    if (active) return
    const to = restoreRef.current
    if (!to || !restoreFocus) return
    restoreRef.current = null
    if (to.isConnected) to.focus()
  }, [active, restoreFocus])

  React.useEffect(
    () => () => {
      const to = restoreRef.current
      if (to && restoreFocus && to.isConnected) to.focus()
    },
    [restoreFocus],
  )

  // Tab / Shift+Tab cycling
  React.useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return
      const focusables = getFocusable(container)
      if (focusables.length === 0) {
        // trap at the container itself
        if (container && !container.contains(document.activeElement)) {
          e.preventDefault()
          container.focus()
        }
        return
      }
      const first = focusables[0]!
      const last = focusables[focusables.length - 1]!
      const current = document.activeElement as HTMLElement | null
      if (!current || !container?.contains(current)) {
        e.preventDefault()
        first.focus()
        return
      }
      if (e.shiftKey && current === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && current === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener("keydown", onKey, true)
    return () => document.removeEventListener("keydown", onKey, true)
  }, [active, container])
}

/* ------------------------------------------------------------------ */
/* Composite modal overlay hook                                        */
/* ------------------------------------------------------------------ */

export interface UseOverlayOptions {
  open: boolean
  /** Escape behavior; return false to block (e.g. shake). Default closes via onEscape. */
  onEscape?: () => boolean | void
  /** Modal: trap focus, lock scroll, inert the background. Default true. */
  modal?: boolean
  initialFocus?: React.RefObject<HTMLElement | null> | "first" | "container" | false
  restoreFocus?: boolean
}

/**
 * The composite hook for modal overlays: stack registration, topmost-only
 * Escape, scroll locking, background inertness, focus trapping, initial
 * focus and focus restoration. Returns props to spread on the portaled
 * wrapper element.
 */
export function useOverlay({
  open,
  onEscape,
  modal = true,
  initialFocus = "first",
  restoreFocus = true,
}: UseOverlayOptions): {
  ref: (el: HTMLElement | null) => void
  element: HTMLElement | null
  top: () => boolean
} {
  const [element, setElement] = React.useState<HTMLElement | null>(null)
  const { setElement: setStackElement, isTop } = useOverlayStack(open)
  useEscapeKey(open, isTop, () => onEscape?.())
  useScrollLock(open && modal)
  useInertBackground(open && modal && element != null, element)
  useFocusTrap({ active: open && modal, container: element, initialFocus, restoreFocus })

  const ref = React.useCallback(
    (el: HTMLElement | null) => {
      setElement(el)
      setStackElement(el)
    },
    [setStackElement],
  )

  return { ref, element, top: isTop }
}

/* ------------------------------------------------------------------ */
/* Props meta                                                          */
/* ------------------------------------------------------------------ */

import type { PropsMeta } from "./props-meta"

export const overlayPropsMeta: PropsMeta = {
  name: "useOverlay",
  props: [
    { name: "open", type: "boolean", default: null, control: "boolean" },
    { name: "onEscape", type: "() => boolean | void", default: null, control: "none", description: "Return false to block close (Modal shakes)." },
    { name: "modal", type: "boolean", default: "true", control: "boolean", description: "Trap focus, lock scroll, inert the background." },
    { name: "initialFocus", type: 'ref | "first" | "container" | false', default: '"first"', control: "none" },
    { name: "restoreFocus", type: "boolean", default: "true", control: "boolean" },
  ],
}
