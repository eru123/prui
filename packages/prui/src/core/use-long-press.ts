import * as React from "react"

/**
 * useLongPress: the press-and-hold engine behind HoldToConfirm (and any
 * "hold to act" interaction). Pointer and keyboard both drive it; progress
 * is rAF-driven so consumers can render a fill without re-inventing the
 * timing. Releasing early cancels; reaching the duration completes once.
 */

export interface UseLongPressOptions {
  /** Hold duration in ms. Default 800. */
  duration?: number
  /** Fires exactly once when the hold reaches full duration. */
  onComplete?: () => void
  /** Fires when a hold is released or canceled before completing. */
  onCancel?: (progress: number) => void
  /** Disable the interaction entirely. */
  disabled?: boolean
}

export interface LongPressResult {
  /** True while a qualifying press is being held. */
  holding: boolean
  /** Elapsed fraction 0..1, updated per animation frame. */
  progress: number
  /** Spread onto the interactive element. */
  bind: {
    onPointerDown: React.PointerEventHandler
    onPointerUp: React.PointerEventHandler
    onPointerLeave: React.PointerEventHandler
    onKeyDown: React.KeyboardEventHandler
    onKeyUp: React.KeyboardEventHandler
    onBlur: React.FocusEventHandler
  }
}

export function useLongPress(options: UseLongPressOptions = {}): LongPressResult {
  const { duration = 800, onComplete, onCancel, disabled = false } = options
  const [holding, setHolding] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const raf = React.useRef<number | null>(null)
  const startedAt = React.useRef(0)
  const completed = React.useRef(false)
  // latest callbacks without re-binding the handlers
  const cbs = React.useRef({ onComplete, onCancel, duration })
  cbs.current = { onComplete, onCancel, duration }

  const clearRaf = () => {
    if (raf.current != null) cancelAnimationFrame(raf.current)
    raf.current = null
  }

  const begin = React.useCallback(() => {
    if (disabled || raf.current != null) return
    completed.current = false
    startedAt.current = performance.now()
    setHolding(true)
    const tick = () => {
      const { duration: d, onComplete: complete } = cbs.current
      const elapsed = performance.now() - startedAt.current
      const p = Math.min(1, elapsed / d)
      setProgress(p)
      if (p >= 1 && !completed.current) {
        completed.current = true
        clearRaf()
        setHolding(false)
        complete?.()
        return
      }
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
  }, [disabled])

  const end = React.useCallback(
    (fireCancel: boolean) => {
      if (raf.current == null && !holding) return
      clearRaf()
      setHolding(false)
      if (fireCancel && !completed.current) {
        const { onCancel: cancel } = cbs.current
        cancel?.(progress)
      }
      setProgress(0)
    },
    [holding, progress],
  )

  React.useEffect(() => clearRaf, [])

  return React.useMemo<LongPressResult>(
    () => ({
      holding,
      progress,
      bind: {
        onPointerDown: (e) => {
          // jsdom synthetic pointer events carry no button; treat as primary
          if (e.button != null && e.button !== 0) return
          begin()
        },
        onPointerUp: () => end(true),
        onPointerLeave: () => end(true),
        onKeyDown: (e) => {
          if ((e.key === "Enter" || e.key === " ") && !e.repeat) begin()
        },
        onKeyUp: (e) => {
          if (e.key === "Enter" || e.key === " ") end(true)
        },
        onBlur: () => end(false),
      },
    }),
    [begin, end, holding, progress],
  )
}
