import * as React from "react"
import { Clock } from "lucide-react"
import { cn } from "./cn"
import { Portal, useOverlayStack, useEscapeKey } from "./overlay"
import { useAnchoredPosition } from "./anchor"
import { useFieldSlots, type FieldSlotProps } from "./form-field"
import { moveIndex } from "./list-nav"
import { usePruiI18n } from "../i18n"
import type { PropsMeta } from "./props-meta"

/**
 * TimePicker / TimeRangePicker: time selection without a date library.
 * Values are plain "HH:mm" strings (or "HH:mm:ss" with seconds). The
 * picker is a popover with column grids (hours / minutes / seconds) using
 * listbox semantics; arrows move within a column, Enter/Space pick,
 * Escape (topmost) closes, and outside clicks dismiss. TimePanel is the
 * inline grid pair (no popover) that DatePicker composes when
 * timepicker is on.
 */

export interface TimePickerProps extends FieldSlotProps {
  /** Trigger input id; generated when a label needs association. */
  id?: string
  /** "HH:mm" or "HH:mm:ss" when seconds is set. */
  value?: string
  defaultValue?: string
  onChange?: (time: string) => void
  /** Step between minute options, in minutes. Default 1. */
  minuteStep?: number
  /** Include a seconds column ("HH:mm:ss" values). */
  seconds?: boolean
  /** 12-hour grid with AM/PM (the default). false shows the 24-hour grid.
   * Values stay "HH:mm(:ss)" on the wire either way. */
  hour12?: boolean
  /** Earliest selectable time, inclusive. */
  min?: string
  /** Latest selectable time, inclusive. */
  max?: string
  disabled?: boolean
  placeholder?: string
  ariaLabel?: string
  className?: string
}

export type TimeRange = { from?: string; to?: string }

export interface TimeRangePickerProps extends FieldSlotProps {
  /** Trigger input id; generated when a label needs association. */
  id?: string
  value?: TimeRange
  defaultValue?: TimeRange
  onChange?: (range: TimeRange) => void
  minuteStep?: number
  seconds?: boolean
  /** 12-hour grid with AM/PM (the default). false shows the 24-hour grid.
   * Values stay "HH:mm(:ss)" on the wire either way. */
  hour12?: boolean
  min?: string
  max?: string
  disabled?: boolean
  placeholder?: string
  ariaLabel?: string
  className?: string
}

/* ---------------- helpers ---------------- */

const pad = (n: number) => String(n).padStart(2, "0")

function parseTime(v: string | undefined): { h: number; m: number; s: number } | null {
  if (!v || !/^\d{2}:\d{2}(:\d{2})?$/.test(v)) return null
  const [h, m, s] = v.split(":").map(Number)
  return { h: h ?? 0, m: m ?? 0, s: s ?? 0 }
}

function toTime(h: number, m: number, s = 0, withSeconds: boolean): string {
  return withSeconds ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(h)}:${pad(m)}`
}

/** 12-hour display number for an internal 0-23 hour ("0" -> 12). */
function hour12Of(h: number): number {
  const h12 = h % 12
  return h12 === 0 ? 12 : h12
}

function isPm(h: number): boolean {
  return h >= 12
}

/** Trigger display. Values stay "HH:mm(:ss)" on the wire; hour12 only
 * changes how they are shown ("7:30 PM"). */
function formatDisplay(time: string | undefined, hour12: boolean): string {
  if (!time) return ""
  if (!hour12) return time
  const t = parseTime(time)
  if (!t) return time
  const base = `${hour12Of(t.h)}:${pad(t.m)}${time.length > 5 ? `:${pad(t.s)}` : ""}`
  return `${base} ${isPm(t.h) ? "PM" : "AM"}`
}

function timeKey(v: string): number {
  const t = parseTime(v)
  return t ? t.h * 3600 + t.m * 60 + t.s : -1
}

function minutesList(step: number): number[] {
  const out: number[] = []
  for (let m = 0; m < 60; m += Math.max(1, step)) out.push(m)
  return out
}

/* ---------------- the shared inline panel ---------------- */

interface TimePanelProps {
  value?: string
  onSelect: (time: string) => void
  minuteStep?: number
  seconds?: boolean
  /** 12-hour grid with an AM/PM column (the default). */
  hour12?: boolean
  min?: string
  max?: string
  /** Hide the column headers (used by the range picker's side-by-side pair). */
  compact?: boolean
  className?: string
}

/**
 * TimePanel: the inline hour/minute(/second) grids. TimePicker renders it
 * in a popover; DatePicker composes it directly; it is exported for
 * custom compositions.
 */
export function TimePanel({ value, onSelect, minuteStep = 1, seconds = false, hour12 = true, min, max, compact, className }: TimePanelProps) {
  const { t } = usePruiI18n()
  const current = parseTime(value)
  const minKey = min ? timeKey(min) : -Infinity
  const maxKey = max ? timeKey(max) : Infinity
  // Internal hours are always 0-23; hour12 is a view. The period column
  // keeps the selected hour and flips AM/PM; an hour click keeps the
  // current period (AM when nothing is picked yet).
  const pm = current ? isPm(current.h) : false
  type Unit = "h" | "m" | "s" | "p"
  const columns: { label: string; items: number[]; selected: number | null; unit: Unit }[] = [
    {
      label: t.hours,
      items: hour12 ? Array.from({ length: 12 }, (_, i) => i + 1) : Array.from({ length: 24 }, (_, h) => h),
      selected: current ? (hour12 ? hour12Of(current.h) : current.h) : null,
      unit: "h",
    },
    { label: t.minutes, items: minutesList(minuteStep), selected: current?.m ?? null, unit: "m" },
  ]
  if (seconds) {
    columns.push({ label: t.seconds, items: Array.from({ length: 60 }, (_, s) => s), selected: current?.s ?? null, unit: "s" })
  }
  if (hour12) {
    columns.push({ label: `${t.am}/${t.pm}`, items: [0, 1], selected: current ? (pm ? 1 : 0) : null, unit: "p" })
  }

  const candidateHour = (unit: Unit, n: number): number => {
    if (unit === "h") return hour12 ? (n % 12) + (pm ? 12 : 0) : n
    if (unit === "p") return (hour12Of(current?.h ?? 0) % 12) + n * 12
    return current?.h ?? 0
  }

  const keyOf = (h: number, m: number, s: number) => h * 3600 + m * 60 + s

  const disabled = (unit: Unit, n: number) => {
    // A period stays selectable while ANY hour of that period is in range —
    // otherwise a range starting after noon would dead-end the AM/PM flip.
    if (unit === "p") {
      const m = current?.m ?? 0
      const s = current?.s ?? 0
      for (let h12 = 0; h12 < 12; h12++) {
        const key = keyOf(h12 + n * 12, m, s)
        if (key >= minKey && key <= maxKey) return false
      }
      return true
    }
    const h = unit === "s" ? (current?.h ?? 0) : candidateHour(unit, n)
    const m = unit === "m" ? n : (current?.m ?? 0)
    const s = unit === "s" ? n : (current?.s ?? 0)
    const key = keyOf(h, m, s)
    return key < minKey || key > maxKey
  }

  const pick = (unit: Unit, n: number) => {
    const m = unit === "m" ? n : (current?.m ?? 0)
    const s = unit === "s" ? n : (current?.s ?? 0)
    let h = unit === "s" ? (current?.h ?? 0) : candidateHour(unit, n)
    if (unit === "p" && (keyOf(h, m, s) < minKey || keyOf(h, m, s) > maxKey)) {
      // the kept hour is out of range in this period: commit the first
      // in-range hour of the period instead (e.g. 1:00 PM for min 13:00)
      for (let h12 = 1; h12 <= 12; h12++) {
        const candidate = (h12 % 12) + n * 12
        const key = keyOf(candidate, m, s)
        if (key >= minKey && key <= maxKey) {
          h = candidate
          break
        }
      }
    }
    onSelect(toTime(h, m, s, seconds))
  }

  const onKeyDown = (e: React.KeyboardEvent, colIndex: number) => {
    const col = columns[colIndex]!
    const els = Array.from(
      (e.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>("[role='option']:not([aria-disabled='true'])"),
    )
    const currentIdx = els.findIndex((el) => el.getAttribute("aria-selected") === "true")
    const activeIdx = els.indexOf(document.activeElement as HTMLButtonElement)
    const idx = activeIdx >= 0 ? activeIdx : currentIdx
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        els[moveIndex(idx, 1, els.length)]?.focus()
        break
      case "ArrowUp":
        e.preventDefault()
        els[moveIndex(idx, -1, els.length)]?.focus()
        break
      case "Home":
        e.preventDefault()
        els[0]?.focus()
        break
      case "End":
        e.preventDefault()
        els[els.length - 1]?.focus()
        break
      case "ArrowLeft":
        if (colIndex > 0) {
          e.preventDefault()
          const prev = (e.currentTarget as HTMLElement).previousElementSibling?.querySelectorAll<HTMLButtonElement>("[role='option']:not([aria-disabled='true'])")
          prev?.[Math.min(idx < 0 ? 0 : idx, prev.length - 1)]?.focus()
        }
        break
      case "ArrowRight":
        if (colIndex < columns.length - 1) {
          e.preventDefault()
          const next = (e.currentTarget as HTMLElement).nextElementSibling?.querySelectorAll<HTMLButtonElement>("[role='option']:not([aria-disabled='true'])")
          next?.[Math.min(idx < 0 ? 0 : idx, next.length - 1)]?.focus()
        }
        break
      case "Enter":
      case " ":
        // let the focused option button's native activation pick
        break
      default:
        void col
    }
  }

  return (
    <div className={cn("prui-time-panel flex gap-1", className)} role="group" aria-label={t.time}>
      {columns.map((col, i) => (
        <div
          key={col.unit}
          role="listbox"
          aria-label={col.label}
          tabIndex={-1}
          onKeyDown={(e) => onKeyDown(e, i)}
          className={cn("flex w-16 flex-col rounded-prui-sm outline-none", !compact && "bg-raise/40")}
        >
          {!compact ? (
            <div className="px-2 pb-1 pt-2 text-center text-2xs font-semibold uppercase tracking-wide text-dim">
              {col.label}
            </div>
          ) : null}
          <div className="flex max-h-56 flex-col overflow-y-auto p-1">
            {col.items.map((n) => {
              const isSel = col.selected === n
              const isDisabled = disabled(col.unit, n)
              return (
                <button
                  key={n}
                  type="button"
                  role="option"
                  aria-selected={isSel}
                  aria-disabled={isDisabled || undefined}
                  tabIndex={isSel ? 0 : -1}
                  data-testid={`time-${col.unit}`}
                  aria-label={col.unit === "p" ? (n === 1 ? t.pm : t.am) : undefined}
                  onClick={() => !isDisabled && pick(col.unit, n)}
                  className={cn(
                    "rounded-prui-sm py-1 text-center text-sm tabular-nums cursor-pointer outline-none",
                    "focus-visible:bg-raise",
                    isSel ? "bg-brand text-brand-fg font-medium" : "text-fg hover:bg-raise",
                    isDisabled && "opacity-40 pointer-events-none",
                  )}
                >
                  {col.unit === "p" ? (n === 1 ? t.pm : t.am) : pad(n)}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ---------------- popover trigger shell ---------------- */

function useTimePopover(anchorRef: React.RefObject<HTMLElement | null>, open: boolean, onClose: () => void) {
  const { setElement, isTop } = useOverlayStack(open)
  useEscapeKey(open, isTop, onClose)
  const { ref: floatingRef, position } = useAnchoredPosition({ active: open, anchorRef, side: "bottom", align: "start" })
  React.useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node
      if (anchorRef.current?.contains(target)) return
      if (!(target instanceof Element) || !target.closest("[data-prui-time-panel-wrap]")) onClose()
    }
    document.addEventListener("mousedown", onPointer)
    return () => document.removeEventListener("mousedown", onPointer)
  })
  return { setElement, floatingRef, position }
}

/* ---------------- TimePicker ---------------- */

export const TimePicker = React.forwardRef<HTMLInputElement, TimePickerProps>(function TimePicker(
  { value: valueProp, defaultValue, onChange, minuteStep, seconds, hour12 = true, min, max, disabled, placeholder, ariaLabel, className, label, helperText, id },
  ref,
) {
  const effectivePlaceholder = placeholder ?? (hour12 ? "hh:mm am/pm" : "HH:mm")
  const field = useFieldSlots({ id, label, helperText })
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? "")
  const [open, setOpen] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const isControlled = valueProp !== undefined
  const value = isControlled ? valueProp : uncontrolled
  const anchorRef = inputRef as React.RefObject<HTMLElement | null>

  const { setElement, floatingRef, position } = useTimePopover(anchorRef, open, () => {
    setOpen(false)
    inputRef.current?.focus()
  })

  const select = (time: string) => {
    if (!isControlled) setUncontrolled(time)
    onChange?.(time)
  }

  return field.wrap(
    <>
      <input
        id={field.id}
        ref={(node) => {
          inputRef.current = node
          if (typeof ref === "function") ref(node)
          else if (ref) ref.current = node
        }}
        type="text"
        readOnly
        role="combobox"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={ariaLabel}
        placeholder={effectivePlaceholder}
        disabled={disabled}
        value={formatDisplay(value, hour12)}
        onClick={() => setOpen(true)}
        onFocus={() => {
          if (!disabled && !open) setOpen(true)
        }}
        className={cn(
          "prui-time-picker h-9 w-full cursor-pointer rounded-prui border border-line",
          "bg-background px-3 pr-8 text-sm tabular-nums text-fg placeholder:text-dim",
          "outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-ring/30",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className,
        )}
      />
      {open ? (
        <Portal>
          <div
            ref={(node) => {
              floatingRef(node)
              setElement(node)
            }}
            role="dialog"
            aria-label={ariaLabel ?? "Choose time"}
            data-prui-time-panel-wrap
            className="fixed z-[calc(var(--prui-z-modal,10000)+1)] rounded-prui border border-line bg-surface p-2 shadow-prui-lg"
            style={{ top: position?.top ?? -9999, left: position?.left ?? -9999 }}
          >
            <TimePanel value={value} onSelect={select} minuteStep={minuteStep} seconds={seconds} hour12={hour12} min={min} max={max} />
          </div>
        </Portal>
      ) : null}
    </>,
  )
})
TimePicker.displayName = "TimePicker"

/* ---------------- TimeRangePicker ---------------- */

export const TimeRangePicker = React.forwardRef<HTMLInputElement, TimeRangePickerProps>(function TimeRangePicker(
  { value: valueProp, defaultValue, onChange, minuteStep, seconds, hour12 = true, min, max, disabled, placeholder, ariaLabel, className, label, helperText, id },
  ref,
) {
  const effectivePlaceholder = placeholder ?? (hour12 ? "hh:mm am/pm – hh:mm am/pm" : "HH:mm – HH:mm")
  const field = useFieldSlots({ id, label, helperText })
  const { t } = usePruiI18n()
  const [uncontrolled, setUncontrolled] = React.useState<TimeRange>(defaultValue ?? {})
  const [open, setOpen] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const isControlled = valueProp !== undefined
  const value = isControlled ? valueProp : uncontrolled
  const anchorRef = inputRef as React.RefObject<HTMLElement | null>

  const { setElement, floatingRef, position } = useTimePopover(anchorRef, open, () => {
    setOpen(false)
    inputRef.current?.focus()
  })

  const setRange = (range: TimeRange) => {
    if (!isControlled) setUncontrolled(range)
    onChange?.(range)
  }

  const pickSide = (side: "from" | "to", time: string) => {
    const from = side === "from" ? time : value.from
    const to = side === "to" ? time : value.to
    if (from && to && timeKey(to) < timeKey(from)) {
      // picking "to" before "from" (or an earlier end) swaps the pair
      setRange(side === "to" ? { from: time, to: undefined } : { from: to, to: from })
      return
    }
    setRange({ from, to })
  }

  const fmt = (v: string | undefined, empty: string) => (formatDisplay(v, hour12) || empty)
  const display = value.from ? `${fmt(value.from, "…")} – ${fmt(value.to, "…")}` : ""
  const fromMax = value.to ?? max
  const toMin = value.from ?? min

  return field.wrap(
    <>
      <input
        id={field.id}
        ref={(node) => {
          inputRef.current = node
          if (typeof ref === "function") ref(node)
          else if (ref) ref.current = node
        }}
        type="text"
        readOnly
        role="combobox"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={ariaLabel}
        placeholder={effectivePlaceholder}
        disabled={disabled}
        value={display}
        onClick={() => setOpen(true)}
        onFocus={() => {
          if (!disabled && !open) setOpen(true)
        }}
        className={cn(
          "prui-time-range-picker h-9 w-full cursor-pointer rounded-prui border border-line",
          "bg-background px-3 pr-8 text-sm tabular-nums text-fg placeholder:text-dim",
          "outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-ring/30",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className,
        )}
      />
      <Clock className="pointer-events-none -ml-7 h-4 w-4 text-dim" aria-hidden />
      {open ? (
        <Portal>
          <div
            ref={(node) => {
              floatingRef(node)
              setElement(node)
            }}
            role="dialog"
            aria-label={ariaLabel ?? "Choose time range"}
            data-prui-time-panel-wrap
            className="fixed z-[calc(var(--prui-z-modal,10000)+1)] rounded-prui border border-line bg-surface p-3 shadow-prui-lg"
            style={{ top: position?.top ?? -9999, left: position?.left ?? -9999 }}
          >
            <div className="flex flex-col gap-3">
              <div className="flex gap-4">
                <div>
                  <div className="mb-1 text-xs font-semibold text-dim">{t.from}</div>
                  <TimePanel compact value={value.from} onSelect={(time) => pickSide("from", time)} minuteStep={minuteStep} seconds={seconds} hour12={hour12} min={min} max={fromMax} />
                </div>
                <div>
                  <div className="mb-1 text-xs font-semibold text-dim">{t.to}</div>
                  <TimePanel compact value={value.to} onSelect={(time) => pickSide("to", time)} minuteStep={minuteStep} seconds={seconds} hour12={hour12} min={toMin} max={max} />
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-line pt-2 text-xs text-dim">
                <span data-testid="timerange-label">{display || t.time}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRange({})}
                    className="cursor-pointer rounded-prui-sm px-2 py-1 transition-colors hover:bg-raise"
                  >
                    {t.clear}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      inputRef.current?.focus()
                    }}
                    className="cursor-pointer rounded-prui-sm bg-brand/15 px-2 py-1 text-brand transition-colors hover:bg-brand/25"
                  >
                    {t.apply}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      ) : null}
    </>,
  )
})
TimeRangePicker.displayName = "TimeRangePicker"

/* ---------------- meta ---------------- */

export const timePickerPropsMeta: PropsMeta = {
  name: "TimePicker",
  props: [
    { name: "value", type: "string 'HH:mm' | 'HH:mm:ss'", default: "undefined", control: "text" },
    { name: "defaultValue", type: "string", default: "undefined", control: "text" },
    { name: "onChange", type: "(time: string) => void", default: null, control: "none" },
    { name: "minuteStep", type: "number (minutes)", default: "1", control: "number" },
    { name: "seconds", type: "boolean", default: "false", control: "boolean", description: "Adds a seconds column ('HH:mm:ss')." },
    { name: "hour12", type: "boolean", default: "true", control: "boolean", description: "12-hour grid with AM/PM. false shows the 24-hour grid. Values stay 'HH:mm(:ss)'." },
    { name: "min", type: "string 'HH:mm'", default: "undefined", control: "text" },
    { name: "max", type: "string 'HH:mm'", default: "undefined", control: "text" },
  ],
}

export const timeRangePickerPropsMeta: PropsMeta = {
  name: "TimeRangePicker",
  props: [
    { name: "value", type: "{ from?: string, to?: string }", default: "{}", control: "object" },
    { name: "defaultValue", type: "{ from?: string, to?: string }", default: "{}", control: "object" },
    { name: "onChange", type: "(range: TimeRange) => void", default: null, control: "none" },
    { name: "minuteStep", type: "number (minutes)", default: "1", control: "number" },
    { name: "seconds", type: "boolean", default: "false", control: "boolean" },
    { name: "hour12", type: "boolean", default: "true", control: "boolean", description: "12-hour grid with AM/PM. false shows the 24-hour grid. Values stay 'HH:mm(:ss)'." },
    { name: "min", type: "string 'HH:mm'", default: "undefined", control: "text" },
    { name: "max", type: "string 'HH:mm'", default: "undefined", control: "text" },
  ],
}
