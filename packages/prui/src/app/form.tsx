import * as React from "react"
import { Button } from "../core/button"
import { Input, Textarea } from "../core/input"
import { Label } from "../core/label"
import { DatePicker } from "../core/date-picker"
import { Select } from "../core/select"
import { Switch } from "../core/switch"
import { cn } from "../core/cn"
import type { PropsMeta } from "../core/props-meta"
import { usePruiI18n } from "../i18n"

/**
 * Schema-driven Form: fields from a schema, validation display included.
 * Each field: name, label, type, placeholder, required, options, defaultValue.
 * The schema may be a bare field array or an object `{ fields, submitLabel }`;
 * `defaultValues` is an alias of `initialValues`.
 */

export type FormFieldType =
  | "text"
  | "password"
  | "email"
  | "number"
  | "date"
  | "textarea"
  | "select"
  | "boolean"

export interface FormFieldSchema {
  name: string
  label: string
  type?: FormFieldType
  placeholder?: string
  required?: boolean
  /** select options: label/value pairs; plain strings and numbers are accepted. */
  options?: (string | number | { label: string; value: string })[]
  defaultValue?: string | number | boolean
  disabled?: boolean
  /** Optional inline validation: return an error message or null. */
  validate?: (value: unknown, values: Record<string, unknown>) => string | null
  className?: string
  colSpan?: 1 | 2
}

export interface FormSchema {
  fields: FormFieldSchema[]
  submitLabel?: string
  /** Render fields in a 2-col grid on md+ when true. */
  columns?: 1 | 2
}

/** A schema is either the fields array itself or the full object. */
export type FormSchemaInput = FormFieldSchema[] | FormSchema

function normalizeSchema(schema: FormSchemaInput): FormSchema {
  return Array.isArray(schema) ? { fields: schema } : schema
}

function normalizeOptions(opts: FormFieldSchema["options"]): { label: string; value: string }[] | undefined {
  if (!opts) return undefined
  return opts.map((o) => (typeof o === "string" || typeof o === "number" ? { label: String(o), value: String(o) } : o))
}

export interface FormProps {
  schema: FormSchemaInput
  initialValues?: Record<string, unknown>
  /** Alias of initialValues. */
  defaultValues?: Record<string, unknown>
  onSubmit?: (values: Record<string, unknown>) => void | Promise<void>
  onCancel?: () => void
  cancelLabel?: string
  /** Force the submitting state (e.g. caller owns the async lifecycle). */
  submitting?: boolean
  error?: string | null
  className?: string
}

function defaultsFor(schema: FormSchema, initialValues?: Record<string, unknown>): Record<string, unknown> {
  const values: Record<string, unknown> = {}
  for (const f of schema.fields) {
    if (initialValues && f.name in initialValues) values[f.name] = initialValues[f.name]
    else if (f.defaultValue !== undefined) values[f.name] = f.defaultValue
    else if (f.type === "boolean") values[f.name] = false
    else values[f.name] = ""
  }
  return values
}

export function Form({
  schema: schemaInput,
  initialValues,
  defaultValues,
  onSubmit,
  onCancel,
  cancelLabel,
  submitting = false,
  error,
  className,
}: FormProps) {
  const { t } = usePruiI18n()
  const schema = React.useMemo(() => normalizeSchema(schemaInput), [schemaInput])
  const mergedInitials = initialValues ?? defaultValues
  const [values, setValues] = React.useState<Record<string, unknown>>(() => defaultsFor(schema, mergedInitials))
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [internalError, setInternalError] = React.useState<string | null>(null)
  const [busy, setBusy] = React.useState(false)

  React.useEffect(() => {
    setValues(defaultsFor(schema, mergedInitials))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(schema), JSON.stringify(mergedInitials ?? {})])

  const setField = (name: string, value: unknown) => {
    setValues((v) => ({ ...v, [name]: value }))
    setErrors((e) => {
      if (!e[name]) return e
      const next = { ...e }
      delete next[name]
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const nextErrors: Record<string, string> = {}
    for (const f of schema.fields) {
      if (f.required) {
        const v = values[f.name]
        const empty = v === "" || v == null || (Array.isArray(v) && v.length === 0)
        if (empty) nextErrors[f.name] = t.requiredField.replace("{label}", f.label)
      }
      const custom = f.validate?.(values[f.name], values)
      if (custom) nextErrors[f.name] = custom
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    setInternalError(null)
    try {
      const result = onSubmit?.({ ...values })
      if (result && typeof (result as Promise<void>).then === "function") {
        setBusy(true)
        await result
      }
    } catch (err) {
      setInternalError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  const loading = submitting || busy

  return (
    <form onSubmit={handleSubmit} className={cn("prui-form flex flex-col gap-4", className)} noValidate>
      <div className={cn("grid gap-4", schema.columns === 2 && "md:grid-cols-2")}>
        {schema.fields.map((f) => {
          const err = errors[f.name]
          const common = {
            id: `prui-form-${f.name}`,
            "aria-invalid": err ? true : undefined,
            "aria-describedby": err ? `prui-form-${f.name}-error` : undefined,
          }
          return (
            <div key={f.name} className={cn("flex flex-col gap-1.5", f.colSpan === 2 && "md:col-span-2", f.className)}>
              <Label htmlFor={common.id}>
                {f.label}
                {f.required ? <span className="ml-0.5 text-danger">*</span> : null}
              </Label>
              {f.type === "textarea" ? (
                <Textarea
                  {...common}
                  placeholder={f.placeholder}
                  disabled={f.disabled || loading}
                  value={String(values[f.name] ?? "")}
                  onChange={(e) => setField(f.name, e.target.value)}
                />
              ) : f.type === "select" ? (
                <Select
                  {...common}
                  options={normalizeOptions(f.options)}
                  placeholder={f.placeholder}
                  disabled={f.disabled || loading}
                  value={String(values[f.name] ?? "")}
                  onChange={(v) => setField(f.name, v)}
                />
              ) : f.type === "date" ? (
                <DatePicker
                  {...common}
                  ariaLabel={f.label}
                  placeholder={f.placeholder}
                  disabled={f.disabled || loading}
                  value={String(values[f.name] ?? "")}
                  onChange={(date) => setField(f.name, date ?? "")}
                />
              ) : f.type === "boolean" ? (
                <Switch
                  {...common}
                  disabled={f.disabled || loading}
                  checked={Boolean(values[f.name])}
                  onChange={(c) => setField(f.name, c)}
                />
              ) : (
                <Input
                  {...common}
                  type={f.type ?? "text"}
                  placeholder={f.placeholder}
                  disabled={f.disabled || loading}
                  value={String(values[f.name] ?? "")}
                  onChange={(e) => setField(f.name, f.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)}
                />
              )}
              {err ? (
                <p id={`prui-form-${f.name}-error`} role="alert" className="text-xs text-danger">
                  {err}
                </p>
              ) : null}
            </div>
          )
        })}
      </div>
      {error ?? internalError ? (
        <p role="alert" data-testid="form-error" className="rounded-prui border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error ?? internalError}
        </p>
      ) : null}
      <div className="flex items-center justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
            {cancelLabel ?? t.cancel}
          </Button>
        ) : null}
        <Button type="submit" variant="primary" loading={loading}>
          {schema.submitLabel ?? "Submit"}
        </Button>
      </div>
    </form>
  )
}

export const formPropsMeta: PropsMeta = {
  name: "Form",
  props: [
    { name: "schema", type: "FormSchema", default: null, control: "object" },
    { name: "initialValues", type: "Record<string, unknown>", default: "{}", control: "object" },
    { name: "onSubmit", type: "(values) => void | Promise<void>", default: null, control: "none" },
    { name: "onCancel", type: "() => void", default: null, control: "none" },
    { name: "submitting", type: "boolean", default: "false", control: "boolean" },
    { name: "error", type: "string | null", default: "null", control: "text" },
  ],
}
