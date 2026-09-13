import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { resolveSurface, withSurface, type SurfaceProps } from "./surface"
import { cn } from "./cn"
import { usePruiI18n } from "../i18n"
import { useFieldSlots, type FieldSlotProps } from "./form-field"
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

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">, SurfaceProps, FieldSlotProps {
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
  ({ className, style, type = "text", size = "md", variant = "default", icon, trailingIcon, passwordToggle = true, label, helperText, id, bg, fg, radius, texture, textureColor, elevation, ...props }, ref) => {
    const { t } = usePruiI18n()
    const [revealed, setRevealed] = React.useState(false)
    const field = useFieldSlots({ id, label, helperText })
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
        id={field.id}
        type={showEye && revealed ? "text" : type}
        className={merged.className}
        style={merged.style}
        {...props}
      />
    )
    const body = !icon && !trailingIcon && !showEye ? input : (
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
    return field.wrap(body)
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
    { name: "label", type: "ReactNode", default: "undefined", control: "text", description: "Renders the field through FormField: label above, helper below, slots reserved when empty." },
    { name: "helperText", type: "ReactNode", default: "undefined", control: "text", description: "Hint/message under the control (FormField bottom slot)." },
    { name: "value", type: "string", default: null, control: "text" },
    { name: "placeholder", type: "string", default: "undefined", control: "text" },
    { name: "disabled", type: "boolean", default: "false", control: "boolean" },
    { name: "onChange", type: "(e) => void", default: null, control: "none" },
  ],
}

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & FieldSlotProps

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, style, label, helperText, id, ...props }, ref) => {
    const field = useFieldSlots({ id, label, helperText })
    return field.wrap(
      <textarea
        ref={ref}
        id={field.id}
        style={style}
        className={cn(fieldBase, "h-auto min-h-20 resize-y px-3 py-2", className)}
        {...props}
      />,
    )
  },
)
Textarea.displayName = "Textarea"

export const textareaPropsMeta: PropsMeta = {
  name: "Textarea",
  props: [
    { name: "value", type: "string", default: null, control: "textarea" },
    { name: "placeholder", type: "string", default: "undefined", control: "text" },
    { name: "rows", type: "number", default: "4", control: "number" },
    { name: "onChange", type: "(e) => void", default: null, control: "none" },
    { name: "label", type: "ReactNode", default: "undefined", control: "text", description: "Renders the field through FormField (slots reserved when empty)." },
    { name: "helperText", type: "ReactNode", default: "undefined", control: "text", description: "Hint/message under the control." },
  ],
}

export interface InputGroupProps extends Omit<InputProps, "icon" | "trailingIcon" | "children"> {
  /** Fixed text/icon addon at the leading edge (currency, unit, prefix). */
  leading?: React.ReactNode
  /** Fixed text/icon addon at the trailing edge (unit, suffix, domain). */
  trailing?: React.ReactNode
}

/**
 * InputGroup: an Input with fixed leading/trailing addons — currency
 * symbols, units, domains — on the FormField slot system (label/helperText
 * props work exactly like Input's).
 */
export const InputGroup = React.forwardRef<HTMLInputElement, InputGroupProps>(
  ({ leading, trailing, className, label, helperText, id, ...props }, ref) => {
    const field = useFieldSlots({ id, label, helperText })
    return field.wrap(
      <div className={cn("relative inline-flex w-full", className)}>
        {leading ? (
          <span aria-hidden className="pointer-events-none absolute left-3 top-1/2 z-[1] flex -translate-y-1/2 items-center text-sm text-[var(--prui-dim)]">
            {leading}
          </span>
        ) : null}
        <Input
          ref={ref}
          id={field.id}
          className={cn("w-full", leading && "pl-9", trailing && "pr-12")}
          {...props}
        />
        {trailing ? (
          <span aria-hidden className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center text-sm text-[var(--prui-dim)]">
            {trailing}
          </span>
        ) : null}
      </div>,
    )
  },
)
InputGroup.displayName = "InputGroup"

export const inputGroupPropsMeta: PropsMeta = {
  name: "InputGroup",
  props: [
    { name: "leading", type: "ReactNode", default: "undefined", control: "text", description: "Fixed addon inside the leading edge (e.g. '$')." },
    { name: "trailing", type: "ReactNode", default: "undefined", control: "text", description: "Fixed addon inside the trailing edge (e.g. '.00', 'kg')." },
    { name: "label", type: "ReactNode", default: "undefined", control: "text", description: "Renders the field through FormField (slots reserved when empty)." },
    { name: "helperText", type: "ReactNode", default: "undefined", control: "text", description: "Hint/message under the control." },
    { name: "value", type: "string", default: null, control: "text" },
    { name: "placeholder", type: "string", default: "undefined", control: "text" },
    { name: "onChange", type: "(e) => void", default: null, control: "none" },
  ],
}
