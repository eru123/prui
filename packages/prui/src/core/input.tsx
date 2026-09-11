import * as React from "react"
import { cn } from "./cn"
import type { PropsMeta } from "./props-meta"

const fieldBase =
  "prui-input w-full bg-[var(--prui-background)] text-[var(--prui-fg)] placeholder:text-[var(--prui-dim)] " +
  "border border-[var(--prui-line)] rounded-[var(--prui-radius)] px-3 h-9 text-sm " +
  "outline-none transition-colors focus:border-[var(--prui-brand)] focus:ring-2 focus:ring-[var(--prui-brand)]/30 " +
  "disabled:opacity-50 disabled:cursor-not-allowed"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => (
    <input ref={ref} type={type} className={cn(fieldBase, className)} {...props} />
  ),
)
Input.displayName = "Input"

export const inputPropsMeta: PropsMeta = {
  name: "Input",
  props: [
    { name: "type", type: "string", default: "'text'", control: "select", options: ["text", "password", "email", "number", "search"] },
    { name: "value", type: "string", default: null, control: "text" },
    { name: "placeholder", type: "string", default: "undefined", control: "text" },
    { name: "disabled", type: "boolean", default: "false", control: "boolean" },
    { name: "onChange", type: "(e) => void", default: null, control: "none" },
  ],
}

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(fieldBase, "h-auto min-h-20 py-2 resize-y", className)}
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
