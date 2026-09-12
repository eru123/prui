import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "./cn"
import { usePruiI18n } from "../i18n"
import type { PropsMeta } from "./props-meta"

/**
 * Calendar: a month grid picker with full keyboard support on the grid
 * (arrows move by day/week, Home/End jump to week edges, PageUp/PageDown
 * change months, Enter/Space pick) and accessible table semantics
 * (role=grid/gridcell/row, aria-selected, aria-current for today).
 * Dates are plain "YYYY-MM-DD" strings — no date library.
 */

export interface CalendarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect" | "value" | "defaultValue"> {
  /** Selected day, "YYYY-MM-DD". */
  value?: string
  defaultValue?: string
  onSelect?: (date: string) => void
  /** The month in view, "YYYY-MM"; omit to follow the selection/today. */
  month?: string
  onMonthChange?: (month: string) => void
  min?: string
  max?: string
  disabled?: (date: string) => boolean
  /** Show the Today shortcut button. Default true. */
  showToday?: boolean
  /** First day of week. Default 0 (Sunday). */
  weekStartsOn?: 0 | 1
}

const DAY_MS = 86_400_000
const WEEKDAYS_SUN = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
const WEEKDAYS_MON = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]

export function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number)
  return new Date(y!, (m ?? 1) - 1, d ?? 1)
}

function startOfMonthGrid(monthKey: string, weekStartsOn: 0 | 1): Date {
  const [y, m] = monthKey.split("-").map(Number)
  const first = new Date(y!, (m ?? 1) - 1, 1)
  const shift = (first.getDay() - weekStartsOn + 7) % 7
  return new Date(first.getTime() - shift * DAY_MS)
}

function monthKeyOf(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

function clampDate(date: Date, min?: string, max?: string): Date {
  let d = date
  if (min && d < fromDateKey(min)) d = fromDateKey(min)
  if (max && d > fromDateKey(max)) d = fromDateKey(max)
  return d
}

export const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(function Calendar(
  { value: valueProp, defaultValue, onSelect, month: monthProp, onMonthChange, min, max, disabled, showToday = true, weekStartsOn = 0, className, onKeyDown, ...props },
  ref,
) {
  const { t } = usePruiI18n()
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? "")
  const [pendingFocus, setPendingFocus] = React.useState<string | null>(null)
  const isControlled = valueProp !== undefined
  const value = isControlled ? valueProp : uncontrolled
  const todayKey = toDateKey(new Date())

  // initial month only: read the props once (mount state)
  const initialMonthRef = React.useRef<string | null>(null)
  if (initialMonthRef.current === null) {
    initialMonthRef.current = monthProp ?? (value ? monthKeyOf(fromDateKey(value)) : monthKeyOf(new Date()))
  }
  const [internalMonth, setInternalMonth] = React.useState(initialMonthRef.current)
  const month = monthProp ?? internalMonth

  const setMonth = (m: string) => {
    setInternalMonth(m)
    onMonthChange?.(m)
  }

  const select = (key: string) => {
    if (!isControlled) setUncontrolled(key)
    onSelect?.(key)
  }

  const gridStart = React.useMemo(() => startOfMonthGrid(month, weekStartsOn), [month, weekStartsOn])
  const weekdays = weekStartsOn === 1 ? WEEKDAYS_MON : WEEKDAYS_SUN
  const monthLabel = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(
    new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1, 1),
  )

  const shiftMonth = (delta: number) => {
    const d = new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1 + delta, 1)
    setMonth(monthKeyOf(d))
  }

  const isDisabled = (key: string) => {
    if (min && key < min) return true
    if (max && key > max) return true
    return disabled?.(key) ?? false
  }

  const moveFocus = (fromKey: string, days: number) => {
    const next = clampDate(new Date(fromDateKey(fromKey).getTime() + days * DAY_MS), min, max)
    const nextKey = toDateKey(next)
    setMonth(monthKeyOf(next))
    setPendingFocus(nextKey)
  }

  // focus the pending day once its button is committed to the DOM
  React.useEffect(() => {
    if (!pendingFocus) return
    const el = document.querySelector<HTMLElement>(`[data-prui-calendar-day="${pendingFocus}"]`)
    if (el) {
      el.focus()
      setPendingFocus(null)
    }
  }, [pendingFocus, month])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e)
    if (e.defaultPrevented) return
    const focusedKey = (document.activeElement as HTMLElement | null)?.dataset?.pruiCalendarDay
    if (!focusedKey) return
    const d = fromDateKey(focusedKey)
    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault()
        moveFocus(focusedKey, -1)
        break
      case "ArrowRight":
        e.preventDefault()
        moveFocus(focusedKey, 1)
        break
      case "ArrowUp":
        e.preventDefault()
        moveFocus(focusedKey, -7)
        break
      case "ArrowDown":
        e.preventDefault()
        moveFocus(focusedKey, 7)
        break
      case "Home": {
        e.preventDefault()
        const shift = (d.getDay() - weekStartsOn + 7) % 7
        moveFocus(focusedKey, -shift)
        break
      }
      case "End": {
        e.preventDefault()
        const shift = (weekStartsOn + 6 - d.getDay() + 7) % 7
        moveFocus(focusedKey, shift)
        break
      }
      case "PageUp":
        e.preventDefault()
        shiftMonth(-1)
        break
      case "PageDown":
        e.preventDefault()
        shiftMonth(1)
        break
      case "Enter":
      case " ":
        e.preventDefault()
        if (!isDisabled(focusedKey)) select(focusedKey)
        break
    }
  }

  const cells: (string | null)[] = []
  for (let i = 0; i < 42; i++) {
    const key = toDateKey(new Date(gridStart.getTime() + i * DAY_MS))
    cells.push(monthKeyOf(fromDateKey(key)) === month ? key : null)
  }

  return (
    <div ref={ref} className={cn("prui-calendar inline-flex flex-col gap-2 rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-surface)] p-3", className)} onKeyDown={handleKeyDown} {...props}>
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => shiftMonth(-1)}
          className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-[var(--prui-radius-1)] text-[var(--prui-dim)] transition-colors hover:bg-[var(--prui-raise)] hover:text-[var(--prui-fg)]"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>
        <span aria-live="polite" className="text-sm font-medium text-[var(--prui-fg)]">
          {monthLabel}
        </span>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => shiftMonth(1)}
          className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-[var(--prui-radius-1)] text-[var(--prui-dim)] transition-colors hover:bg-[var(--prui-raise)] hover:text-[var(--prui-fg)]"
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <div role="grid" aria-label={monthLabel} className="flex flex-col gap-1">
        <div role="row" className="grid grid-cols-7 text-center text-xs font-medium text-[var(--prui-dim)]">
          {weekdays.map((wd) => (
            <span key={wd} role="columnheader" className="px-1 py-0.5">
              {wd}
            </span>
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, week) => (
          <div key={week} role="row" className="grid grid-cols-7 gap-0.5">
            {cells.slice(week * 7, week * 7 + 7).map((key, i) => {
              if (key === null) return <span key={i} role="gridcell" />
              const selected = key === value
              const isToday = key === todayKey
              const dayDisabled = isDisabled(key)
              return (
                <button
                  key={key}
                  type="button"
                  role="gridcell"
                  aria-selected={selected}
                  aria-disabled={dayDisabled || undefined}
                  aria-current={isToday ? "date" : undefined}
                  data-prui-calendar-day={key}
                  tabIndex={selected || (!value && key === todayKey) || (!value && week === 0 && i === 0 && cells[0] === key) ? 0 : -1}
                  onClick={() => select(key)}
                  className={cn(
                    "flex h-8 w-8 cursor-pointer items-center justify-center rounded-[var(--prui-radius-1)] text-sm outline-none",
                    "focus-visible:ring-2 focus-visible:ring-[var(--prui-brand)]",
                    selected ? "bg-[var(--prui-brand)] text-[var(--prui-brand-fg,#fff)] font-medium" : "text-[var(--prui-fg)] hover:bg-[var(--prui-raise)]",
                    isToday && !selected && "border border-[var(--prui-brand)]/50",
                    dayDisabled && "opacity-40 pointer-events-none",
                  )}
                >
                  {Number(key.slice(8, 10))}
                </button>
              )
            })}
          </div>
        ))}
      </div>
      {showToday ? (
        <button
          type="button"
          onClick={() => {
            setMonth(monthKeyOf(new Date()))
            select(todayKey)
          }}
          className="cursor-pointer self-center rounded-[var(--prui-radius-1)] px-2 py-1 text-xs text-[var(--prui-brand)] transition-colors hover:bg-[var(--prui-brand)]/10"
        >
          {t.today}
        </button>
      ) : null}
    </div>
  )
})
Calendar.displayName = "Calendar"

export const calendarPropsMeta: PropsMeta = {
  name: "Calendar",
  props: [
    { name: "value", type: "string 'YYYY-MM-DD'", default: "undefined", control: "date" },
    { name: "defaultValue", type: "string 'YYYY-MM-DD'", default: "undefined", control: "date" },
    { name: "onSelect", type: "(date: string) => void", default: null, control: "none" },
    { name: "month", type: "string 'YYYY-MM'", default: "selection or today", control: "text" },
    { name: "onMonthChange", type: "(month: string) => void", default: null, control: "none" },
    { name: "min", type: "string 'YYYY-MM-DD'", default: "undefined", control: "date" },
    { name: "max", type: "string 'YYYY-MM-DD'", default: "undefined", control: "date" },
    { name: "weekStartsOn", type: "0 | 1", default: "0", control: "select", options: ["0", "1"] },
    { name: "showToday", type: "boolean", default: "true", control: "boolean" },
  ],
}
