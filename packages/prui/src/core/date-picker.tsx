import * as React from "react"
import { CalendarDays, Clock } from "lucide-react"
import { cn } from "./cn"
import { useFieldSlots, type FieldSlotProps } from "./form-field"
import { Portal, useOverlayStack, useEscapeKey } from "./overlay"
import { useAnchoredPosition } from "./anchor"
import { Calendar, fromDateKey } from "./calendar"
import { TimePanel } from "./time-picker"
import { usePruiI18n } from "../i18n"
import type { PropsMeta } from "./props-meta"

/**
 * DatePicker / DateRangePicker: a text trigger opening a Calendar popover.
 * Values stay plain strings — "YYYY-MM-DD" by default, or
 * "YYYY-MM-DD HH:mm(:ss)" with timepicker on — so they remain
 * native-input compatible with no date library. The trigger is
 * keyboard-operable (Enter/ArrowDown opens, Escape topmost closes and
 * refocuses, typing a full value commits); clicking outside dismisses.
 * The range picker anchors on the start date, supports a maxRange cap
 * ("90d", "12w", "3m", "1y", or a plain number of days), and restarts
 * when the picked end precedes the start.
 */

export interface DatePickerProps extends FieldSlotProps {
  /** Trigger input id; generated when a label needs association. */
  id?: string
  value?: string
  defaultValue?: string
  onChange?: (date: string) => void
  min?: string
  max?: string
  placeholder?: string
  disabled?: boolean
  className?: string
  /** Accessible label for the trigger input. */
  ariaLabel?: string
  /** Include a time panel; values become "YYYY-MM-DD HH:mm(:ss)". Default false. */
  timepicker?: boolean
  /** Seconds column for the time panel (requires timepicker). */
  seconds?: boolean
  /** Minute step for the time panel (requires timepicker). */
  minuteStep?: number
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const DATETIME_RE = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/

function splitValue(v: string | undefined, withTime: boolean): { date: string; time: string } {
  if (!v) return { date: "", time: withTime ? "00:00" : "" }
  const [date, time] = v.split(" ")
  return { date: date ?? "", time: withTime ? (time ?? "00:00") : (time ?? "") }
}

/* ---------------- shared popover shell: escape + outside click ---------------- */

function usePickerPopover(anchorRef: React.RefObject<HTMLElement | null>, open: boolean, onClose: () => void) {
  const { setElement, isTop } = useOverlayStack(open)
  useEscapeKey(open, isTop, onClose)
  const { ref: floatingRef, position } = useAnchoredPosition({ active: open, anchorRef, side: "bottom", align: "start" })
  React.useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node
      if (anchorRef.current?.contains(target)) return
      if (!(target instanceof Element) || !target.closest("[data-prui-picker-panel]")) onClose()
    }
    document.addEventListener("mousedown", onPointer)
    return () => document.removeEventListener("mousedown", onPointer)
  })
  return { setElement, floatingRef, position }
}

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker(
  {
    value: valueProp,
    defaultValue,
    onChange,
    min,
    max,
    placeholder,
    disabled,
    className,
    ariaLabel,
    label,
    helperText,
    id,
    timepicker = false,
    seconds = false,
    minuteStep,
  },
  ref,
) {
  const field = useFieldSlots({ id, label, helperText })
  const effectivePlaceholder = placeholder ?? (timepicker ? "YYYY-MM-DD HH:mm" : "YYYY-MM-DD")
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? "")
  const isControlled = valueProp !== undefined
  const value = isControlled ? valueProp : uncontrolled
  const [open, setOpen] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [draft, setDraft] = React.useState("")
  const { date, time } = splitValue(value, timepicker)
  const anchorRef = inputRef as React.RefObject<HTMLElement | null>

  const { setElement, floatingRef, position } = usePickerPopover(anchorRef, open, () => {
    setOpen(false)
    inputRef.current?.focus()
  })

  const commit = (next: string) => {
    if (!isControlled) setUncontrolled(next)
    onChange?.(next)
    if (!timepicker) {
      // with time enabled the panel stays open so the time can be refined
      setOpen(false)
      inputRef.current?.focus()
    }
  }

  const pickDate = (d: string) => {
    if (timepicker) commit(`${d} ${time || "00:00"}`)
    else commit(d)
  }

  const pickTime = (tm: string) => {
    if (!date) return // pick a date first
    commit(`${date} ${tm}`)
  }

  return field.wrap(
    // className reaches the wrapper as well as the input: the trigger icon
    // anchors to the wrapper, so a caller width like w-64 must shrink both
    // or the icon detaches to the wrapper's far edge
    <div className={cn("relative flex w-full items-center", className)}>
      <input
        ref={(node) => {
          inputRef.current = node
          if (typeof ref === "function") ref(node)
          else if (ref) ref.current = node
        }}
        id={field.id}
        type="text"
        readOnly
        role="combobox"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={ariaLabel}
        placeholder={effectivePlaceholder}
        disabled={disabled}
        value={draft !== "" ? draft : value}
        onClick={() => setOpen(true)}
        onFocus={() => {
          if (!disabled && !open) setOpen(true)
        }}
        onChange={(e) => {
          const raw = e.target.value
          setDraft(raw)
          if (timepicker ? DATETIME_RE.test(raw) : DATE_RE.test(raw)) {
            setDraft("")
            commit(raw)
          }
        }}
        className={cn(
          "prui-date-picker h-9 w-full cursor-pointer rounded-prui border border-line",
          "bg-background px-3 pr-8 text-sm text-fg placeholder:text-dim",
          "outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-ring/30",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className,
        )}
      />
      {timepicker ? (
        <Clock className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" aria-hidden />
      ) : (
        <CalendarDays className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" aria-hidden />
      )}
      {open ? (
        <Portal>
          <div
            ref={(node) => {
              floatingRef(node)
              setElement(node)
            }}
            role="dialog"
            aria-label={ariaLabel ?? "Choose date"}
            data-prui-picker-panel
            className="fixed z-[calc(var(--prui-z-modal,10000)+1)] rounded-prui border border-line bg-surface p-1 shadow-prui-lg"
            style={{ top: position?.top ?? -9999, left: position?.left ?? -9999 }}
          >
            <div className={cn("flex gap-2", timepicker && "p-1")}>
              <Calendar
                value={date || undefined}
                onSelect={pickDate}
                min={min ? min.slice(0, 10) : undefined}
                max={max ? max.slice(0, 10) : undefined}
                showToday={false}
                className="border-0 shadow-none"
              />
              {timepicker ? (
                <div className="flex flex-col gap-1 border-l border-line pl-2">
                  <TimePanel value={time} onSelect={pickTime} seconds={seconds} minuteStep={minuteStep} />
                </div>
              ) : null}
            </div>
          </div>
        </Portal>
      ) : null}
    </div>,
  )
})
DatePicker.displayName = "DatePicker"

/* ------------------------------------------------------------------ */
/* DateRangePicker                                                     */
/* ------------------------------------------------------------------ */

export interface DateRange {
  from?: string
  to?: string
}

/**
 * maxRange caps the span between from and to. Accept a plain number of
 * days, or a string with a unit: "90d" days, "12w" weeks, "3m" months
 * (calendar-aware), "1y" years.
 */
export type MaxRange = number | `${number}d` | `${number}w` | `${number}m` | `${number}y` | (string & {})

export interface DateRangePickerProps extends FieldSlotProps {
  /** Trigger input id; generated when a label needs association. */
  id?: string
  value?: DateRange
  defaultValue?: DateRange
  onChange?: (range: DateRange) => void
  min?: string
  max?: string
  /** Cap the selectable span, e.g. 90, "90d", "12w", "3m", "1y". */
  maxRange?: MaxRange
  placeholder?: string
  disabled?: boolean
  className?: string
  ariaLabel?: string
  /** Include time panels; values become "YYYY-MM-DD HH:mm(:ss)". Default false. */
  timepicker?: boolean
  seconds?: boolean
  minuteStep?: number
}

function addRange(from: Date, spec: MaxRange): Date {
  const m = typeof spec === "string" ? /^(\d+)([dwmy])$/i.exec(spec.trim()) : null
  const n = m ? Number(m[1]) : Number(spec)
  const unit = m ? m[2]!.toLowerCase() : "d"
  const to = new Date(from)
  if (unit === "d") to.setDate(to.getDate() + n)
  else if (unit === "w") to.setDate(to.getDate() + n * 7)
  else if (unit === "m") to.setMonth(to.getMonth() + n)
  else to.setFullYear(to.getFullYear() + n)
  return to
}

function rangeEnd(from: string, spec: MaxRange): string {
  const d = addRange(fromDateKey(from), spec)
  const y = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${mo}-${day}`
}

function dayOnly(v: string | undefined): string | undefined {
  return v ? v.slice(0, 10) : undefined
}

export const DateRangePicker = React.forwardRef<HTMLInputElement, DateRangePickerProps>(function DateRangePicker(
  {
    value: valueProp,
    defaultValue,
    onChange,
    min,
    max,
    maxRange,
    placeholder,
    disabled,
    className,
    ariaLabel,
    label,
    helperText,
    id,
    timepicker = false,
    seconds = false,
    minuteStep,
  },
  ref,
) {
  const field = useFieldSlots({ id, label, helperText })
  const { t } = usePruiI18n()
  const effectivePlaceholder = placeholder ?? (timepicker ? "YYYY-MM-DD HH:mm – YYYY-MM-DD HH:mm" : "YYYY-MM-DD – YYYY-MM-DD")
  const [uncontrolled, setUncontrolled] = React.useState<DateRange>(defaultValue ?? {})
  const isControlled = valueProp !== undefined
  const value = isControlled ? valueProp : uncontrolled
  const [open, setOpen] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const anchorRef = inputRef as React.RefObject<HTMLElement | null>
  // explicit month-in-view: pinning to from's month on open/anchor, then
  // free navigation so the to-date can be months away
  const [viewMonth, setViewMonth] = React.useState<string | undefined>(undefined)

  const { setElement, floatingRef, position } = usePickerPopover(anchorRef, open, () => {
    setOpen(false)
    inputRef.current?.focus()
  })

  React.useEffect(() => {
    if (!open) return
    setViewMonth(value.from ? value.from.slice(0, 7) : undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-pin only when the panel opens or the anchor resets
  }, [open, value.from === undefined])

  const from = value.from ? splitValue(value.from, timepicker) : undefined
  const to = value.to ? splitValue(value.to, timepicker) : undefined
  const anchorFrom = from?.date ?? ""

  // with from anchored and to unset, dates beyond from+maxRange disable
  const capDisabled = React.useCallback(
    (key: string) => {
      if (!maxRange || !anchorFrom || to?.date) return false
      return key > rangeEnd(anchorFrom, maxRange)
    },
    [maxRange, anchorFrom, to?.date],
  )

  const setRange = (range: DateRange) => {
    if (!isControlled) setUncontrolled(range)
    onChange?.(range)
  }

  const pickDate = (key: string) => {
    if (!from || (from.date && to?.date)) {
      // starting a new range
      setRange({ from: timepicker ? `${key} 00:00` : key })
      return
    }
    if (key < from.date) {
      // an earlier end restarts the range at that date
      setRange({ from: timepicker ? `${key} 00:00` : key })
      return
    }
    if (maxRange && key > rangeEnd(from.date, maxRange)) {
      // clamp to the cap instead of rejecting the click
      const end = rangeEnd(from.date, maxRange)
      setRange({ from: value.from, to: timepicker ? `${end} ${(to?.time ?? "23:59")}` : end })
      return
    }
    setRange({ from: value.from, to: timepicker ? `${key} ${(to?.time ?? "23:59")}` : key })
    if (!timepicker) {
      setOpen(false)
      inputRef.current?.focus()
    }
  }

  const pickTime = (side: "from" | "to", tm: string) => {
    const base = side === "from" ? from : to
    if (!base?.date) return
    setRange({ ...value, [side]: `${base.date} ${tm}` } as DateRange)
  }

  const display = from ? (to ? `${value.from} – ${value.to}` : `${value.from} – …`) : ""

  return field.wrap(
    // className reaches the wrapper as well as the input: the trigger icon
    // anchors to the wrapper, so a caller width like w-64 must shrink both
    // or the icon detaches to the wrapper's far edge
    <div className={cn("relative flex w-full items-center", className)}>
      <input
        ref={(node) => {
          inputRef.current = node
          if (typeof ref === "function") ref(node)
          else if (ref) ref.current = node
        }}
        id={field.id}
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
          "prui-date-range-picker h-9 w-full cursor-pointer rounded-prui border border-line",
          "bg-background px-3 pr-8 text-sm text-fg placeholder:text-dim",
          "outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-ring/30",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className,
        )}
      />
      {timepicker ? (
        <Clock className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" aria-hidden />
      ) : (
        <CalendarDays className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" aria-hidden />
      )}
      {open ? (
        <Portal>
          <div
            ref={(node) => {
              floatingRef(node)
              setElement(node)
            }}
            role="dialog"
            aria-label={ariaLabel ?? "Choose date range"}
            data-prui-picker-panel
            className="fixed z-[calc(var(--prui-z-modal,10000)+1)] rounded-prui border border-line bg-surface shadow-prui-lg"
            style={{ top: position?.top ?? -9999, left: position?.left ?? -9999 }}
          >
            <div className={cn("flex gap-2 p-1", timepicker && "p-2")}>
              <div>
                <div className="px-1 pb-1 pt-1 text-2xs font-semibold uppercase tracking-wide text-dim">{t.from}</div>
                <Calendar
                  value={from?.date}
                  month={viewMonth}
                  onMonthChange={setViewMonth}
                  onSelect={pickDate}
                  min={min ? dayOnly(min) : undefined}
                  max={max ? dayOnly(max) : maxRange && anchorFrom && !to?.date ? rangeEnd(anchorFrom, maxRange) : undefined}
                  disabled={capDisabled}
                  showToday={false}
                  className="border-0 shadow-none"
                />
              </div>
              <div className="flex flex-col gap-1 border-l border-line pl-2">
                {timepicker ? (
                  <div>
                    <div className="mb-1 px-1 text-2xs font-semibold uppercase tracking-wide text-dim">{t.time}</div>
                    <div className="flex gap-2">
                      <div>
                        <div className="mb-1 px-1 text-2xs font-semibold uppercase tracking-wide text-dim">{t.from}</div>
                        <TimePanel compact value={from?.time} onSelect={(tm) => pickTime("from", tm)} seconds={seconds} minuteStep={minuteStep} />
                      </div>
                      <div>
                        <div className="mb-1 px-1 text-2xs font-semibold uppercase tracking-wide text-dim">{t.to}</div>
                        <TimePanel compact value={to?.time} onSelect={(tm) => pickTime("to", tm)} seconds={seconds} minuteStep={minuteStep} />
                      </div>
                    </div>
                  </div>
                ) : null}
                <div className="mt-auto flex items-center justify-between gap-2 border-t border-line px-1 pb-1 pt-2 text-xs text-dim">
                  <span data-testid="range-label">{display || t.today}</span>
                  <div className="flex gap-1">
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
          </div>
        </Portal>
      ) : null}
    </div>,
  )
})
DateRangePicker.displayName = "DateRangePicker"

export const datePickerPropsMeta: PropsMeta = {
  name: "DatePicker",
  props: [
    { name: "value", type: "string 'YYYY-MM-DD' | 'YYYY-MM-DD HH:mm'", default: "undefined", control: "date" },
    { name: "defaultValue", type: "string", default: "undefined", control: "date" },
    { name: "onChange", type: "(date: string) => void", default: null, control: "none" },
    { name: "min", type: "string", default: "undefined", control: "date" },
    { name: "max", type: "string", default: "undefined", control: "date" },
    { name: "timepicker", type: "boolean", default: "false", control: "boolean", description: "Adds a time panel; values become 'YYYY-MM-DD HH:mm(:ss)'." },
    { name: "seconds", type: "boolean", default: "false", control: "boolean", description: "Seconds column (needs timepicker)." },
    { name: "minuteStep", type: "number", default: "1", control: "number", description: "Minute step (needs timepicker)." },
  ],
}

export const dateRangePickerPropsMeta: PropsMeta = {
  name: "DateRangePicker",
  props: [
    { name: "value", type: "{ from?: string, to?: string }", default: "{}", control: "daterange" },
    { name: "defaultValue", type: "{ from?: string, to?: string }", default: "{}", control: "daterange" },
    { name: "onChange", type: "(range: DateRange) => void", default: null, control: "none" },
    { name: "min", type: "string", default: "undefined", control: "date" },
    { name: "max", type: "string", default: "undefined", control: "date" },
    { name: "maxRange", type: "number | '90d' | '12w' | '3m' | '1y'", default: "undefined", control: "text", description: "Caps the selectable span; days beyond from+maxRange are disabled." },
    { name: "timepicker", type: "boolean", default: "false", control: "boolean" },
    { name: "seconds", type: "boolean", default: "false", control: "boolean" },
    { name: "minuteStep", type: "number", default: "1", control: "number" },
  ],
}
