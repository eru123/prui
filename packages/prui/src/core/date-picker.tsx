import * as React from "react"
import { CalendarDays } from "lucide-react"
import { cn } from "./cn"
import { Portal, useOverlayStack, useEscapeKey } from "./overlay"
import { useAnchoredPosition } from "./anchor"
import { Calendar } from "./calendar"
import { usePruiI18n } from "../i18n"
import type { PropsMeta } from "./props-meta"

/**
 * DatePicker / DateRangePicker: a text trigger opening a Calendar popover.
 * Values stay plain "YYYY-MM-DD" strings (native input-compatible, no date
 * library). The trigger is keyboard-operable (Enter/Space/ArrowDown opens,
 * Escape topmost closes and refocuses); typing a date in the input is also
 * accepted. The range picker anchors on the start date and shows a
 * start–end chip row.
 */

export interface DatePickerProps {
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
}

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker(
  { value: valueProp, defaultValue, onChange, min, max, placeholder = "YYYY-MM-DD", disabled, className, ariaLabel },
  ref,
) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? "")
  const isControlled = valueProp !== undefined
  const value = isControlled ? valueProp : uncontrolled
  const [open, setOpen] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [draft, setDraft] = React.useState("")

  const { setElement, isTop } = useOverlayStack(open)
  useEscapeKey(open, isTop, () => {
    setOpen(false)
    inputRef.current?.focus()
  })

  const { ref: floatingRef, position } = useAnchoredPosition({ active: open, anchorRef: inputRef, side: "bottom", align: "start", offsetHeight: 360 })

  const commit = (date: string) => {
    if (!isControlled) setUncontrolled(date)
    onChange?.(date)
    setOpen(false)
    inputRef.current?.focus()
  }

  return (
    <>
      <input
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
        placeholder={placeholder}
        disabled={disabled}
        value={draft !== "" ? draft : value}
        onFocus={() => {
          if (!disabled && !open) setOpen(true)
        }}
        onClick={() => setOpen(true)}
        onChange={(e) => {
          const raw = e.target.value
          setDraft(raw)
          if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
            setDraft("")
            commit(raw)
          }
        }}
        className={cn(
          "prui-date-picker flex h-9 w-full cursor-pointer items-center gap-2 border border-[var(--prui-line)]",
          "bg-[var(--prui-background)] rounded-[var(--prui-radius)] px-3 text-sm text-[var(--prui-fg)] placeholder:text-[var(--prui-dim)]",
          "outline-none transition-colors focus:border-[var(--prui-brand)] focus:ring-2 focus:ring-[var(--prui-brand)]/30",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className,
        )}
      />
      <CalendarDays className="pointer-events-none -ml-7 h-4 w-4 text-[var(--prui-dim)]" aria-hidden />
      {open ? (
        <Portal>
          <div
            ref={(node) => {
              floatingRef(node)
              setElement(node)
            }}
            role="dialog"
            aria-label="Choose date"
            className="fixed z-[var(--prui-z-overlay)]"
            style={{ top: position?.top ?? -9999, left: position?.left ?? -9999 }}
          >
            <Calendar value={value} onSelect={commit} min={min} max={max} className="shadow-[var(--prui-shadow-lg)]" />
          </div>
        </Portal>
      ) : null}
    </>
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

export interface DateRangePickerProps {
  value?: DateRange
  defaultValue?: DateRange
  onChange?: (range: DateRange) => void
  min?: string
  max?: string
  placeholder?: string
  disabled?: boolean
  className?: string
  ariaLabel?: string
}

export const DateRangePicker = React.forwardRef<HTMLInputElement, DateRangePickerProps>(function DateRangePicker(
  { value: valueProp, defaultValue, onChange, min, max, placeholder = "YYYY-MM-DD – YYYY-MM-DD", disabled, className, ariaLabel },
  ref,
) {
  const { t } = usePruiI18n()
  const [uncontrolled, setUncontrolled] = React.useState<DateRange>(defaultValue ?? {})
  const isControlled = valueProp !== undefined
  const value = isControlled ? valueProp : uncontrolled
  const [open, setOpen] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const { setElement, isTop } = useOverlayStack(open)
  useEscapeKey(open, isTop, () => {
    setOpen(false)
    inputRef.current?.focus()
  })

  const { ref: floatingRef, position } = useAnchoredPosition({ active: open, anchorRef: inputRef, side: "bottom", align: "start", offsetHeight: 360 })

  const handleSelect = (key: string) => {
    const { from, to } = value
    let next: DateRange
    if (!from || (from && to)) {
      next = { from: key }
    } else if (key < from) {
      next = { from: key }
    } else {
      next = { from, to: key }
      onChange?.(next)
      if (!isControlled) setUncontrolled(next)
      setOpen(false)
      inputRef.current?.focus()
      return
    }
    if (!isControlled) setUncontrolled(next)
    onChange?.(next)
  }

  const display = value.from ? (value.to ? `${value.from} – ${value.to}` : `${value.from} – …`) : ""

  return (
    <>
      <input
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
        placeholder={placeholder}
        disabled={disabled}
        value={display}
        onClick={() => setOpen(true)}
        onFocus={() => {
          if (!disabled && !open) setOpen(true)
        }}
        className={cn(
          "prui-date-range-picker flex h-9 w-full cursor-pointer items-center border border-[var(--prui-line)]",
          "bg-[var(--prui-background)] rounded-[var(--prui-radius)] px-3 text-sm text-[var(--prui-fg)] placeholder:text-[var(--prui-dim)]",
          "outline-none transition-colors focus:border-[var(--prui-brand)] focus:ring-2 focus:ring-[var(--prui-brand)]/30",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className,
        )}
      />
      <CalendarDays className="pointer-events-none -ml-7 h-4 w-4 text-[var(--prui-dim)]" aria-hidden />
      {open ? (
        <Portal>
          <div
            ref={(node) => {
              floatingRef(node)
              setElement(node)
            }}
            role="dialog"
            aria-label="Choose date range"
            className="fixed z-[var(--prui-z-overlay)]"
            style={{ top: position?.top ?? -9999, left: position?.left ?? -9999 }}
          >
            <div className="shadow-[var(--prui-shadow-lg)]">
              <Calendar
                value={value.to ?? value.from}
                month={value.from ? `${value.from.slice(0, 7)}` : undefined}
                onSelect={handleSelect}
                min={min}
                max={max}
                showToday={false}
                className="border-0 shadow-none"
                /* range highlight through a wrapper class + data attrs */
                {...({
                  "data-range-from": value.from ?? "",
                  "data-range-to": value.to ?? "",
                } as Record<string, string>)}
              />
              <div className="flex items-center justify-between gap-2 border-t border-[var(--prui-line)] px-3 py-2 text-xs text-[var(--prui-dim)]">
                <span data-testid="range-label">{display || t.today}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!isControlled) setUncontrolled({})
                      onChange?.({})
                    }}
                    className="cursor-pointer rounded-[var(--prui-radius-1)] px-2 py-1 transition-colors hover:bg-[var(--prui-raise)]"
                  >
                    {t.clear}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      inputRef.current?.focus()
                    }}
                    className="cursor-pointer rounded-[var(--prui-radius-1)] bg-[var(--prui-brand)]/15 px-2 py-1 text-[var(--prui-brand)] transition-colors hover:bg-[var(--prui-brand)]/25"
                  >
                    {t.apply}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      ) : null}
    </>
  )
})
DateRangePicker.displayName = "DateRangePicker"

export const datePickerPropsMeta: PropsMeta = {
  name: "DatePicker",
  props: [
    { name: "value", type: "string 'YYYY-MM-DD'", default: "undefined", control: "date" },
    { name: "defaultValue", type: "string 'YYYY-MM-DD'", default: "undefined", control: "date" },
    { name: "onChange", type: "(date: string) => void", default: null, control: "none" },
    { name: "min", type: "string 'YYYY-MM-DD'", default: "undefined", control: "date" },
    { name: "max", type: "string 'YYYY-MM-DD'", default: "undefined", control: "date" },
  ],
}

export const dateRangePickerPropsMeta: PropsMeta = {
  name: "DateRangePicker",
  props: [
    { name: "value", type: "{ from?: string, to?: string }", default: "{}", control: "daterange" },
    { name: "defaultValue", type: "{ from?: string, to?: string }", default: "{}", control: "daterange" },
    { name: "onChange", type: "(range: DateRange) => void", default: null, control: "none" },
    { name: "min", type: "string 'YYYY-MM-DD'", default: "undefined", control: "date" },
    { name: "max", type: "string 'YYYY-MM-DD'", default: "undefined", control: "date" },
  ],
}
