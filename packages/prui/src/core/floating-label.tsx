import * as React from "react"
import { cn } from "./cn"
import type { PropsMeta } from "./props-meta"

/**
 * FloatingLabel: an input whose label starts as placeholder-like text in
 * the field and floats up to the border on focus or when filled — pure
 * CSS via peer-focus + data-filled, no JS animation. Clicking anywhere in
 * the field focuses the input (the label wraps both).
 */

export interface FloatingLabelProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** The floating label text (also the accessible name). */
  label: string
  size?: "sm" | "md"
}

export const FloatingLabel = React.forwardRef<HTMLInputElement, FloatingLabelProps>(function FloatingLabel(
  { label, size = "md", className, id: idProp, value: valueProp, defaultValue, onChange, ...props },
  ref,
) {
  const autoId = React.useId()
  const id = idProp ?? autoId
  const isControlled = valueProp !== undefined
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const value = isControlled ? valueProp : uncontrolled
  const filled = String(value ?? "").length > 0

  return (
    <label
      htmlFor={id}
      data-size={size}
      data-filled={filled || undefined}
      className={cn("prui-floating-label relative block", className)}
    >
      <input
        id={id}
        ref={ref}
        placeholder=" "
        value={valueProp}
        defaultValue={isControlled ? undefined : uncontrolled}
        onChange={(e) => {
          if (!isControlled) setUncontrolled(e.target.value)
          onChange?.(e)
        }}
        className={cn(
          "prui-f-control w-full border border-line bg-field text-fg caret-brand",
          "rounded-prui outline-none transition-colors duration-150",
          "hover:border-dim focus:border-brand focus-visible:ring-2 focus-visible:ring-ring/70",
          "disabled:cursor-not-allowed disabled:opacity-50",
          size === "sm" ? "pb-1 pt-4 text-xs" : "pb-1.5 pt-4 text-sm",
        )}
        {...props}
      />
      {/* the float itself is CSS (base.css): focus-within or data-filled */}
      <span className={cn("prui-float-label", size === "sm" ? "text-xs" : "text-sm")}>{label}</span>
    </label>
  )
})
FloatingLabel.displayName = "FloatingLabel"

export const floatingLabelPropsMeta: PropsMeta = {
  name: "FloatingLabel",
  props: [
    { name: "label", type: "string", default: null, control: "text" },
    { name: "size", type: "'sm' | 'md'", default: "'md'", control: "select", options: ["sm", "md"] },
  ],
}
