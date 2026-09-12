import * as React from "react"
import { resolveSurface, withSurface, type SurfaceProps } from "./surface"
import { cn } from "./cn"
import type { PropsMeta } from "./props-meta"

const fieldBase =
  "prui-f-control prui-input w-full bg-[var(--prui-s-bg,var(--prui-background))] text-[var(--prui-s-fg,var(--prui-fg))] placeholder:text-[var(--prui-dim)] " +
  "border border-[var(--prui-line)] rounded-[var(--prui-s-radius,var(--prui-radius))] text-sm " +
  "outline-none transition-colors focus:border-[var(--prui-brand)] focus:ring-2 focus:ring-[var(--prui-brand)]/30 " +
  "disabled:opacity-50 disabled:cursor-not-allowed"

const inputSizeClasses = {
  sm: "h-8 px-2.5",
  md: "h-9 px-3",
  lg: "h-11 px-4 text-base",
} as const

export type InputSize = keyof typeof inputSizeClasses

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">, SurfaceProps {
  /** Control height step; the native numeric size attribute is not exposed. */
  size?: InputSize
  /** Visual variant: outlined (default) or filled. */
  variant?: "default" | "filled"
  /** Icon rendered inside the field's leading edge. */
  icon?: React.ReactNode
  /** Icon rendered inside the field's trailing edge. */
  trailingIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, style, type = "text", size = "md", variant = "default", icon, trailingIcon, bg, fg, radius, texture, textureColor, elevation, ...props }, ref) => {
    const surface = resolveSurface({ bg, fg, radius, texture, textureColor, elevation })
    const merged = withSurface(
      cn(
        fieldBase,
        inputSizeClasses[size],
        variant === "filled" && "bg-[var(--prui-s-bg,var(--prui-raise))] border-transparent",
        icon && "pl-9",
        trailingIcon && "pr-9",
        className,
      ),
      style,
      surface,
    )
    const input = <input ref={ref} type={type} className={merged.className} style={merged.style} {...props} />
    if (!icon && !trailingIcon) return input
    return (
      <span className="relative inline-flex w-full">
        {icon ? (
          <span aria-hidden className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center text-[var(--prui-dim)] [&>svg]:h-4 [&>svg]:w-4">
            {icon}
          </span>
        ) : null}
        {input}
        {trailingIcon ? (
          <span aria-hidden className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center text-[var(--prui-dim)] [&>svg]:h-4 [&>svg]:w-4">
            {trailingIcon}
          </span>
        ) : null}
      </span>
    )
  },
)
Input.displayName = "Input"

export const inputPropsMeta: PropsMeta = {
  name: "Input",
  props: [
    { name: "type", type: "string", default: "'text'", control: "select", options: ["text", "password", "email", "number", "search"] },
    { name: "size", type: "'sm' | 'md' | 'lg'", default: "'md'", control: "select", options: ["sm", "md", "lg"] },
    { name: "variant", type: "'default' | 'filled'", default: "'default'", control: "select", options: ["default", "filled"] },
    { name: "icon", type: "ReactNode", default: "undefined", control: "none", description: "Icon inside the leading edge (padding adjusts)." },
    { name: "trailingIcon", type: "ReactNode", default: "undefined", control: "none", description: "Icon inside the trailing edge." },
    { name: "value", type: "string", default: null, control: "text" },
    { name: "placeholder", type: "string", default: "undefined", control: "text" },
    { name: "disabled", type: "boolean", default: "false", control: "boolean" },
    { name: "onChange", type: "(e) => void", default: null, control: "none" },
  ],
}

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, style, ...props }, ref) => (
    <textarea
      ref={ref}
      style={style}
      className={cn(fieldBase, "h-auto min-h-20 resize-y px-3 py-2", className)}
      {...props}
    />
  ),
)
Textarea.displayName = "Textarea"

export const textareaPropsMeta: PropsMeta = {
  name: "Textarea",
  props: [
    { name: "value", type: "string", default: null, control: "textarea" },
    { name: "placeholder", type: "string", default: "undefined", control: "text" },
    { name: "rows", type: "number", default: "4", control: "number" },
    { name: "onChange", type: "(e) => void", default: null, control: "none" },
  ],
}
