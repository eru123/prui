import * as React from "react"
import { cn } from "./cn"
import type { PropsMeta } from "./props-meta"

/**
 * FormField: the standard three-slot field layout — label on top, the
 * control, helper/message below. The label and helper rows reserve their
 * height even when empty, so a bare field in a row of labeled fields keeps
 * the same baselines instead of collapsing its slots. inline drops both
 * slot rows entirely for compact toolbars and inline rows.
 */

export interface FormFieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Top slot content; the row keeps its height when omitted. */
  label?: React.ReactNode
  /** Bottom slot (hint, error, counter); the row keeps its height when omitted. */
  helperText?: React.ReactNode
  /** Associates the label with the control's id. */
  htmlFor?: string
  /** Helper text renders in danger color (validation message). */
  error?: boolean
  /** Compact mode: the label and helper slot rows are not rendered. */
  inline?: boolean
  children: React.ReactNode
}

export function FormField({ label, helperText, htmlFor, error, inline, children, className, ...rest }: FormFieldProps) {
  if (inline) {
    return (
      <div className={cn("prui-form-field prui-form-field-inline", className)} {...rest}>
        {children}
      </div>
    )
  }
  return (
    <div className={cn("prui-form-field flex flex-col gap-1", className)} {...rest}>
      <div className="flex min-h-5 items-center">
        {label ? (
          // the prui-label class carries the Label component's base styling
          // without importing it: Input (which embeds this) stays lean
          <label htmlFor={htmlFor} className="prui-label text-sm font-medium text-fg">
            {label}
          </label>
        ) : null}
      </div>
      <div className="flex w-full flex-col">{children}</div>
      <div
        className={cn(
          "flex min-h-4 items-start gap-1 text-xs leading-4",
          error ? "text-danger" : "text-dim",
        )}
      >
        {helperText ?? null}
      </div>
    </div>
  )
}

/** The slot props every form control accepts (Input, Select, pickers, …). */
export interface FieldSlotProps {
  /** Field label; renders through FormField's reserved top slot. */
  label?: React.ReactNode
  /** Helper/message text; renders through FormField's reserved bottom slot. */
  helperText?: React.ReactNode
}

/**
 * Slot wiring for one control: an id for label association (the caller's or
 * a generated one, only when slots are actually used) plus a wrap() that
 * renders the control bare when neither slot is set — existing layouts are
 * untouched — and through FormField when either is.
 */
export function useFieldSlots<P extends { id?: string } & FieldSlotProps>(props: P): {
  id: string | undefined
  wrap: (control: React.ReactElement) => React.ReactElement
} {
  const auto = React.useId()
  const needsSlots = props.label !== undefined || props.helperText !== undefined
  const id = props.id ?? (needsSlots ? auto : undefined)
  const wrap = (control: React.ReactElement) =>
    needsSlots ? (
      <FormField label={props.label} helperText={props.helperText} htmlFor={id}>
        {control}
      </FormField>
    ) : (
      control
    )
  return { id, wrap }
}

export const formFieldPropsMeta: PropsMeta = {
  name: "FormField",
  props: [
    { name: "label", type: "ReactNode", default: "undefined", control: "text", description: "Top slot; the row reserves its height when empty." },
    { name: "helperText", type: "ReactNode", default: "undefined", control: "text", description: "Bottom hint/message slot; reserves its height when empty." },
    { name: "htmlFor", type: "string", default: "undefined", control: "text" },
    { name: "error", type: "boolean", default: "false", control: "boolean", description: "Render the helper text in danger color." },
    { name: "inline", type: "boolean", default: "false", control: "boolean", description: "Hide the label and helper rows (compact toolbars)." },
    { name: "children", type: "ReactNode", default: null, control: "none", description: "The control." },
  ],
}
