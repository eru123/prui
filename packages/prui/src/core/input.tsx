import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { resolveSurface, withSurface, type SurfaceProps } from "./surface"
import { cn } from "./cn"
import { usePruiI18n } from "../i18n"
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
  /** Icon rendered inside the field's trailing edge. A custom trailingIcon
   * takes over the slot and suppresses the password eye toggle. */
  trailingIcon?: React.ReactNode
  /** With type="password", render an eye show/hide toggle in the trailing
   * slot (the default). Set false to keep a plain masked field. */
  passwordToggle?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, style, type = "text", size = "md", variant = "default", icon, trailingIcon, passwordToggle = true, bg, fg, radius, texture, textureColor, elevation, ...props }, ref) => {
    const { t } = usePruiI18n()
    const [revealed, setRevealed] = React.useState(false)
    const showEye = type === "password" && passwordToggle !== false && !trailingIcon
    const surface = resolveSurface({ bg, fg, radius, texture, textureColor, elevation })
    const merged = withSurface(
      cn(
        fieldBase,
        inputSizeClasses[size],
        variant === "filled" && "bg-[var(--prui-s-bg,var(--prui-raise))] border-transparent",
        icon && "pl-9",
        (trailingIcon || showEye) && "pr-9",
        className,
      ),
      style,
      surface,
    )
    const input = (
      <input
        ref={ref}
        type={showEye && revealed ? "text" : type}
        className={merged.className}
        style={merged.style}
        {...props}
      />
    )
    if (!icon && !trailingIcon && !showEye) return input
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
        ) : showEye ? (
          <button
            type="button"
            aria-label={revealed ? t.hidePassword : t.showPassword}
            aria-pressed={revealed}
            disabled={props.disabled}
            // keep the caret in the field: focus never leaves the input
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setRevealed((r) => !r)}
            className="absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-[var(--prui-radius-1)] text-[var(--prui-dim)] hover:bg-[var(--prui-raise)] hover:text-[var(--prui-fg)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {revealed ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
          </button>
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
    { name: "trailingIcon", type: "ReactNode", default: "undefined", control: "none", description: "Icon inside the trailing edge; takes over the slot from the password eye." },
    { name: "passwordToggle", type: "boolean", default: "true", control: "boolean", description: "type=password renders an eye show/hide toggle unless a trailingIcon owns the slot." },
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
