import * as React from "react"
import { Check, Minus } from "lucide-react"
import { cn } from "./cn"
import type { PropsMeta } from "./props-meta"

/**
 * Checkbox: a button-based checkbox with an accessible checked state,
 * native Space/Enter toggling, an indeterminate visual state, and an
 * optional label rendered as a real <label> pair.
 */

export interface CheckboxProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "value"> {
  checked?: boolean
  defaultChecked?: boolean
  /** Neither checked nor unchecked (e.g. "some rows selected"). */
  indeterminate?: boolean
  disabled?: boolean
  onChange?: (checked: boolean, e: React.MouseEvent<HTMLButtonElement>) => void
  /** Label rendered beside the box; click toggles. */
  label?: React.ReactNode
}

export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(function Checkbox(
  { className, checked: checkedProp, defaultChecked = false, indeterminate = false, disabled, onChange, label, ...props },
  ref,
) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultChecked)
  const isControlled = checkedProp !== undefined
  const checked = isControlled ? checkedProp : uncontrolled

  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return
    const next = indeterminate ? true : !checked
    if (!isControlled) setUncontrolled(next)
    onChange?.(next, e)
  }

  const box = (
    <button
      ref={ref}
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      aria-disabled={disabled}
      data-state={checked ? "checked" : "unchecked"}
      disabled={disabled}
      onClick={toggle}
      className={cn(
        "prui-checkbox inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-prui-sm border",
        "transition-colors duration-150 cursor-pointer outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        checked || indeterminate
          ? "border-transparent bg-brand text-brand-fg"
          : "border-line bg-background",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
      {...props}
    >
      {indeterminate && !checked ? (
        <Minus className="h-3 w-3" aria-hidden />
      ) : checked ? (
        <Check className="h-3 w-3" aria-hidden />
      ) : null}
    </button>
  )

  if (label === undefined) return box
  return (
    <span className="inline-flex items-center gap-2">
      {box}
      <span className={cn("text-sm select-none", disabled ? "text-dim" : "text-fg", "cursor-pointer")} onClick={(e) => { e.preventDefault(); toggle(e as unknown as React.MouseEvent<HTMLButtonElement>) }}>
        {label}
      </span>
    </span>
  )
})
Checkbox.displayName = "Checkbox"

export const checkboxPropsMeta: PropsMeta = {
  name: "Checkbox",
  props: [
    { name: "checked", type: "boolean", default: "undefined", control: "boolean" },
    { name: "defaultChecked", type: "boolean", default: "false", control: "boolean" },
    { name: "indeterminate", type: "boolean", default: "false", control: "boolean" },
    { name: "disabled", type: "boolean", default: "false", control: "boolean" },
    { name: "onChange", type: "(checked, event) => void", default: null, control: "none" },
    { name: "label", type: "ReactNode", default: null, control: "text" },
  ],
}
