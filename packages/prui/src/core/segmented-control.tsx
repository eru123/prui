import * as React from "react"
import { cn } from "./cn"
import { moveIndex, homeIndex, endIndex } from "./list-nav"
import type { PropsMeta } from "./props-meta"

/**
 * SegmentedControl: a compact mutually-exclusive selector — Tabs' small
 * sibling for immediate, in-place switches. The indicator glides between
 * segments (transform + width, runtime geometry), and the full radio
 * keyboard contract applies: arrows wrap, Home/End jump, only the active
 * segment is tab-reachable.
 */

export interface SegmentedOption<T extends string = string> {
  value: T
  label?: React.ReactNode
  icon?: React.ReactNode
  disabled?: boolean
}

export interface SegmentedControlProps<T extends string = string> {
  options: ReadonlyArray<SegmentedOption<T>>
  value?: T
  defaultValue?: T
  onChange?: (value: T) => void
  /** Accessible name for the group. */
  ariaLabel: string
  size?: "sm" | "md"
  /** Stretch to fill the parent. */
  fullWidth?: boolean
  className?: string
}

export function SegmentedControl<T extends string = string>({
  options,
  value: valueProp,
  defaultValue,
  onChange,
  ariaLabel,
  size = "md",
  fullWidth,
  className,
}: SegmentedControlProps<T>) {
  const isControlled = valueProp !== undefined
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const value = (isControlled ? valueProp : uncontrolled) ?? options.find((o) => !o.disabled)?.value
  const activeIndex = options.findIndex((o) => o.value === value)
  const refs = React.useRef<Array<HTMLButtonElement | null>>([])

  const select = (i: number) => {
    const opt = options[i]
    if (!opt || opt.disabled) return
    if (!isControlled) setUncontrolled(opt.value)
    onChange?.(opt.value)
    refs.current[i]?.focus()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    let next: number | null = null
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = moveIndex(activeIndex, 1, options.length, { enabled: (i) => !options[i]?.disabled })
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = moveIndex(activeIndex, -1, options.length, { enabled: (i) => !options[i]?.disabled })
    else if (e.key === "Home") next = homeIndex(options.length, (i) => !options[i]?.disabled)
    else if (e.key === "End") next = endIndex(options.length, (i) => !options[i]?.disabled)
    if (next != null) {
      e.preventDefault()
      select(next)
    }
  }

  const enabled = options.filter((o) => !o.disabled).length > 1
  const slotPct = 100 / options.length

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      data-value={value}
      className={cn(
        "prui-segmented-control relative inline-flex rounded-prui-full",
        "border border-line bg-raise p-0.5",
        fullWidth && "flex w-full",
        size === "sm" ? "text-xs" : "text-sm",
        className,
      )}
      onKeyDown={onKeyDown}
    >
      {activeIndex >= 0 ? (
        <span
          aria-hidden
          className={cn(
            "absolute bottom-0.5 top-0.5 rounded-prui-full",
            "bg-surface shadow-prui-md",
            enabled ? "transition-all duration-200 ease-prui" : "",
          )}
          style={{ width: `calc(${slotPct}% - 4px)`, left: `calc(${slotPct * activeIndex}% + 2px)` }}
        />
      ) : null}
      {options.map((opt, i) => {
        const active = i === activeIndex
        return (
          <button
            key={opt.value}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="button"
            role="radio"
            aria-checked={active}
            aria-disabled={opt.disabled || undefined}
            tabIndex={active || (activeIndex < 0 && i === 0) ? 0 : -1}
            disabled={opt.disabled}
            data-state={active ? "active" : "inactive"}
            onClick={() => select(i)}
            className={cn(
              "relative z-10 inline-flex flex-1 cursor-pointer select-none items-center justify-center gap-1.5",
              "rounded-prui-full font-medium outline-none",
              "transition-colors duration-150",
              size === "sm" ? "h-6 px-2.5" : "h-7 px-3.5",
              active ? "text-fg" : "text-dim hover:text-fg",
              "focus-visible:ring-2 focus-visible:ring-ring/70",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:text-dim",
            )}
          >
            {opt.icon}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export const segmentedControlPropsMeta: PropsMeta = {
  name: "SegmentedControl",
  props: [
    { name: "options", type: "{ value, label?, icon?, disabled? }[]", default: null, control: "none" },
    { name: "value", type: "string", default: "first enabled option", control: "text" },
    { name: "defaultValue", type: "string", default: "undefined", control: "text" },
    { name: "onChange", type: "(value: string) => void", default: null, control: "none" },
    { name: "ariaLabel", type: "string", default: null, control: "text" },
    { name: "size", type: "'sm' | 'md'", default: "'md'", control: "select", options: ["sm", "md"] },
    { name: "fullWidth", type: "boolean", default: "false", control: "boolean" },
  ],
}
