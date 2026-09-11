import * as React from "react"
import { cn } from "./cn"
import type { PropsMeta } from "./props-meta"

export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  onChange?: (checked: boolean) => void
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked: checkedProp, defaultChecked = false, disabled, onChange, ...props }, ref) => {
    const [uncontrolled, setUncontrolled] = React.useState(defaultChecked)
    const isControlled = checkedProp !== undefined
    const checked = isControlled ? checkedProp : uncontrolled

    const toggle = () => {
      if (disabled) return
      const next = !checked
      if (!isControlled) setUncontrolled(next)
      onChange?.(next)
    }

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
        data-state={checked ? "checked" : "unchecked"}
        disabled={disabled}
        onClick={toggle}
        className={cn(
          "prui-switch inline-flex h-5 w-9 shrink-0 items-center rounded-[var(--prui-radius-full)] border border-transparent",
          "transition-colors duration-150 cursor-pointer outline-none",
          "focus-visible:ring-2 focus-visible:ring-[var(--prui-brand)] focus-visible:ring-offset-1",
          checked ? "bg-[var(--prui-brand)]" : "bg-[var(--prui-raise)] border-[var(--prui-line)]",
          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
        {...props}
      >
        <span
          className={cn(
            "pointer-events-none block h-4 w-4 rounded-[var(--prui-radius-full)] bg-white shadow transition-transform",
            checked ? "translate-x-4" : "translate-x-0.5",
          )}
        />
      </button>
    )
  },
)
Switch.displayName = "Switch"

export const switchPropsMeta: PropsMeta = {
  name: "Switch",
  props: [
    { name: "checked", type: "boolean", default: "undefined", control: "boolean" },
    { name: "defaultChecked", type: "boolean", default: "false", control: "boolean" },
    { name: "disabled", type: "boolean", default: "false", control: "boolean" },
    { name: "onChange", type: "(checked: boolean) => void", default: null, control: "none" },
  ],
}
