import * as React from "react"
import { cn } from "./cn"
import type { PropsMeta } from "./props-meta"

/**
 * Slider: a pointer-drag value picker with magnetic detents — felt stops
 * the thumb snaps into when it gets close. Drag anywhere on the track
 * (pointer capture keeps the drag alive outside it); the full slider
 * keyboard contract applies (arrows, Home/End, PageUp/Down). Detents also
 * render as tick marks.
 */

export interface SliderProps {
  value?: number
  defaultValue?: number
  onChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  /** Magnetic snap points (in value units). The thumb pulls to the
   * nearest detent when within `detentWindow`% of the range. */
  detents?: number[]
  /** Detent pull window, in percent of the range. Default 6. */
  detentWindow?: number
  disabled?: boolean
  /** Accessible name (required — a slider without a name is mute). */
  ariaLabel: string
  /** Format aria-valuetext (e.g. "60 Hz"). */
  formatValue?: (value: number) => string
  className?: string
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const roundTo = (v: number, step: number) => Math.round(v / step) * step

export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(function Slider(
  {
    value: valueProp,
    defaultValue = 0,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    detents = [],
    detentWindow = 6,
    disabled,
    ariaLabel,
    formatValue,
    className,
  },
  ref,
) {
  const isControlled = valueProp !== undefined
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const value = isControlled ? valueProp : uncontrolled
  const trackRef = React.useRef<HTMLDivElement>(null)
  const cbs = React.useRef({ onChange })
  cbs.current = { onChange }

  const snap = React.useCallback(
    (raw: number) => {
      let v = roundTo(clamp(raw, min, max), step)
      const windowAbs = ((max - min) * detentWindow) / 100
      for (const d of detents) {
        if (Math.abs(v - d) <= windowAbs) {
          v = d
          break
        }
      }
      return clamp(v, min, max)
    },
    [min, max, step, detents, detentWindow],
  )

  const commit = (next: number) => {
    if (next === value) return
    if (!isControlled) setUncontrolled(next)
    cbs.current.onChange?.(next)
  }

  const valueFromPointer = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return value
    const pct = clamp((clientX - rect.left) / rect.width, 0, 1)
    return snap(min + pct * (max - min))
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return
    // jsdom synthetic pointer events carry no button; treat as primary
    if (e.button != null && e.button !== 0) return
    e.currentTarget.setPointerCapture?.(e.pointerId)
    commit(valueFromPointer(e.clientX))
  }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || !e.currentTarget.hasPointerCapture?.(e.pointerId)) return
    commit(valueFromPointer(e.clientX))
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return
    const large = Math.max(step, (max - min) / 10)
    const nearestDetent = () => {
      const sorted = [...detents].sort((a, b) => Math.abs(a - value) - Math.abs(b - value))
      return sorted[0]
    }
    let next: number | null = null
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = value + (e.shiftKey ? large : step)
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = value - (e.shiftKey ? large : step)
    else if (e.key === "PageUp") next = value + large
    else if (e.key === "PageDown") next = value - large
    else if (e.key === "Home") next = min
    else if (e.key === "End") next = max
    else if (e.key === "Enter" || e.key === " ") {
      const d = nearestDetent()
      if (d != null && d !== value) next = d
    }
    if (next != null) {
      e.preventDefault()
      commit(snap(next))
    }
  }

  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100
  const detentPct = (d: number) => max === min ? 0 : ((d - min) / (max - min)) * 100

  return (
    <div
      ref={ref}
      role="slider"
      aria-label={ariaLabel}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={formatValue ? formatValue(value) : undefined}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : 0}
      data-disabled={disabled || undefined}
      className={cn(
        "prui-slider relative flex h-5 w-full cursor-pointer touch-none select-none items-center",
        "outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "rounded-prui-full",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onKeyDown={onKeyDown}
    >
      <div ref={trackRef} aria-hidden className="relative h-1.5 w-full overflow-visible rounded-full bg-raise">
        {/* fill + ticks + thumb are runtime geometry */}
        <span className="absolute inset-y-0 left-0 rounded-full bg-brand" style={{ width: `${pct}%` }} />
        {detents.map((d) => (
          <span
            key={d}
            className={cn(
              "absolute top-1/2 h-2 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors",
              Math.abs(d - value) < step / 2 ? "bg-primary-fg" : "bg-dim/60",
            )}
            style={{ left: `${detentPct(d)}%` }}
          />
        ))}
        <span
          data-active={undefined}
          className={cn(
            "absolute top-1/2 -translate-x-1/2 -translate-y-1/2",
            "h-4 w-4 rounded-full border-2 border-brand bg-surface",
            "shadow-prui-md transition-transform duration-100",
          )}
          style={{ left: `${pct}%`, transform: `translate(-50%, -50%) scale(${disabled ? 0.85 : 1})` }}
        />
      </div>
    </div>
  )
})
Slider.displayName = "Slider"

export const sliderPropsMeta: PropsMeta = {
  name: "Slider",
  props: [
    { name: "value", type: "number", default: "undefined", control: "number" },
    { name: "defaultValue", type: "number", default: "0", control: "number" },
    { name: "onChange", type: "(value: number) => void", default: null, control: "none" },
    { name: "min", type: "number", default: "0", control: "number" },
    { name: "max", type: "number", default: "100", control: "number" },
    { name: "step", type: "number", default: "1", control: "number" },
    { name: "detents", type: "number[] (value units)", default: "[]", control: "none" },
    { name: "detentWindow", type: "number (% of range)", default: "6", control: "number" },
    { name: "disabled", type: "boolean", default: "false", control: "boolean" },
    { name: "ariaLabel", type: "string", default: null, control: "text" },
    { name: "formatValue", type: "(value: number) => string", default: null, control: "none" },
  ],
}
