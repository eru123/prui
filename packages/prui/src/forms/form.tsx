import * as React from "react"
import type { ReactNode } from "react"
import { Button } from "../core/button"
import { Input, Textarea } from "../core/input"
import { Label } from "../core/label"
import { Select } from "../core/select"
import { Switch } from "../core/switch"
import { cn } from "../core/cn"
import type { PropsMeta } from "../core/props-meta"
import { getFormApi, registerForm } from "./registry"
import type { FormApi, FormFieldRule, FormMessage, FormGroupColumns, FormSnapshot, SafeParseSchema } from "./types"
import { getPruiDictionary } from "../i18n"

const dict = () => getPruiDictionary()
const fill = (template: string, vars: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""))

/**
 * Higher-order forms.
 *
 * **Deprecated:** this registry-driven `<Form>` (with FormInput /
 * FormButton) is superseded by the schema-driven `<Form>` from
 * `@skiddph/prui/app`, which is the canonical implementation. This module
 * stays fully functional for backwards compatibility; see the migration
 * guide in the docs (Forms page → Migration notes).
 *
 * - <Form id="user"> owns state and validation. Optional zod-shaped schema.
 * - <FormGroup> groups inputs on one line with responsive column config.
 * - <FormInput> renders any control from a single `type` prop, with label,
 *   required marker, and a bottom message (validation error wins, then the
 *   caller's info/warning/success message).
 * - <FormButton form="user"> drives the form from OUTSIDE its scope: modal
 *   footers, toolbars, anywhere. It can disable itself while the form is
 *   invalid or pristine.
 */

let deprecationWarned = false

function warnDeprecation(): void {
  if (deprecationWarned || typeof process !== "undefined" && process.env?.NODE_ENV === "test") return
  deprecationWarned = true
  console.warn(
    "[prui] The registry-driven <Form> from '@skiddph/prui/forms' is deprecated. " +
      "Migrate to the schema-driven <Form> from '@skiddph/prui/app' — see the Forms page " +
      "migration notes. This implementation keeps working and will not be removed before v2.",
  )
}

/* ---------------- form context ---------------- */

interface FormContextValue {
  id: string
  getValue(name: string): unknown
  setValue(name: string, value: unknown): void
  registerField(name: string, rule: FormFieldRule): void
  unregisterField(name: string): void
  errorFor(name: string): string | undefined
  markTouched(name: string): void
  formError: string | null
}

const FormContext = React.createContext<FormContextValue | null>(null)

function useFormContext(): FormContextValue {
  const ctx = React.useContext(FormContext)
  if (!ctx) throw new Error("Form components must be rendered inside <Form>.")
  return ctx
}

function isEmptyValue(v: unknown): boolean {
  return v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0)
}

function validateValue(value: unknown, rule: FormFieldRule, values: Record<string, unknown>): string | null {
  const t = dict()
  if (rule.required && isEmptyValue(value)) return fill(t.requiredField, { label: rule.label })
  if (isEmptyValue(value)) return null
  if (rule.minLength !== undefined && String(value).length < rule.minLength) {
    return fill(t.minLength, { label: rule.label, min: rule.minLength })
  }
  if (rule.maxLength !== undefined && String(value).length > rule.maxLength) {
    return fill(t.maxLength, { label: rule.label, max: rule.maxLength })
  }
  if (rule.min !== undefined && typeof value === "number" && value < rule.min) {
    return fill(t.minNumber, { label: rule.label, min: rule.min })
  }
  if (rule.max !== undefined && typeof value === "number" && value > rule.max) {
    return fill(t.maxNumber, { label: rule.label, max: rule.max })
  }
  if (rule.pattern && !rule.pattern.test(String(value))) {
    return rule.patternMessage ?? fill(t.invalidFormat, { label: rule.label })
  }
  return rule.validate?.(value, values) ?? null
}

/* ---------------- PruiForm ---------------- */

export interface FormProps {
  /** Registry id referenced by <FormButton form={...}>. */
  id: string
  children?: ReactNode
  /** Optional zod-shaped schema. Any object with safeParse works. */
  schema?: SafeParseSchema
  initialValues?: Record<string, unknown>
  onSubmit?: (values: Record<string, unknown>) => void | Promise<void>
  onReset?: () => void
  /** Validate as the user types; off means validate on blur and submit. */
  validateOnChange?: boolean
  className?: string
}

/**
 * Registry-driven form (deprecated).
 *
 * @deprecated Superseded by the schema-driven Form from `@skiddph/prui/app`.
 * This implementation keeps working (FormButton, the form registry, and
 * cross-scope control all remain); it will not be removed before v2.
 * See the docs Forms page for migration notes.
 */
export function Form({ id, children, schema, initialValues = {}, onSubmit, onReset, validateOnChange = true, className }: FormProps) {
  React.useEffect(() => {
    warnDeprecation()
  }, [])
  const [values, setValues] = React.useState<Record<string, unknown>>({ ...initialValues })
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [formError, setFormError] = React.useState<string | null>(null)
  const fieldsRef = React.useRef(new Map<string, FormFieldRule>())
  const listenersRef = React.useRef(new Set<(snap: FormSnapshot) => void>())
  const initialValuesRef = React.useRef({ ...initialValues })

  const computeSnapshot = (): FormSnapshot => {
    let valid = true
    for (const [name, rule] of fieldsRef.current) {
      if (validateValue(values[name], rule, values) !== null) {
        valid = false
        break
      }
    }
    if (valid && schema) {
      const result = schema.safeParse(values)
      if (!result.success) valid = false
    }
    const isDirty =
      Object.keys(values).some((k) => values[k] !== initialValuesRef.current[k]) ||
      Object.keys(initialValuesRef.current).length !== Object.keys(values).length
    return { isValid: valid, isDirty, errorCount: Object.keys(errors).length, values: { ...values } }
  }

  const validateAll = (vals: Record<string, unknown>): Record<string, string> => {
    const next: Record<string, string> = {}
    for (const [name, rule] of fieldsRef.current) {
      const err = validateValue(vals[name], rule, vals)
      if (err) next[name] = err
    }
    if (schema) {
      const result = schema.safeParse(vals)
      if (!result.success) {
        for (const issue of result.error?.issues ?? []) {
          const key = String(issue.path[0] ?? "")
          if (key && !next[key]) next[key] = issue.message
          else if (!key) next["__form__"] = issue.message
        }
      }
    }
    return next
  }

  const submit = async (): Promise<boolean> => {
    const errs = validateAll(values)
    setErrors(errs)
    if (Object.keys(errs).length > 0) {
      setFormError(null)
      return false
    }
    setFormError(null)
    try {
      await onSubmit?.({ ...values })
      return true
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err))
      return false
    }
  }

  const reset = () => {
    setValues({ ...initialValuesRef.current })
    setErrors({})
    setFormError(null)
    onReset?.()
  }

  const clear = () => {
    setValues({})
    setErrors({})
    setFormError(null)
  }

  const setField = (name: string, value: unknown) => setValues((v) => ({ ...v, [name]: value }))

  const notify = () => {
    const snap = computeSnapshot()
    for (const l of listenersRef.current) l(snap)
  }

  // re-register on every render so external buttons always reach fresh state
  const api: FormApi = React.useMemo(
    () => ({
      id,
      submit: async () => submit(),
      reset,
      clear,
      setField,
      getValue: (name) => values[name],
      getState: () => computeSnapshot(),
      subscribe: (l) => {
        listenersRef.current.add(l)
        return () => listenersRef.current.delete(l)
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the api closes over the latest render state
    [id, values, errors, schema, onSubmit, onReset],
  )

  React.useEffect(() => registerForm(api), [api])
  React.useEffect(() => {
    notify()
  })

  const ctx: FormContextValue = {
    id,
    getValue: (name) => values[name],
    setValue: (name, value) => {
      setValues((v) => ({ ...v, [name]: value }))
      if (validateOnChange) {
        const rule = fieldsRef.current.get(name)
        if (rule) {
          const err = validateValue(value, rule, { ...values, [name]: value })
          setErrors((e) => {
            if (err) return { ...e, [name]: err }
            if (!(name in e)) return e
            const next = { ...e }
            delete next[name]
            return next
          })
        }
      }
      setFormError(null)
    },
    registerField: (name, rule) => fieldsRef.current.set(name, rule),
    unregisterField: (name) => fieldsRef.current.delete(name),
    errorFor: (name) => errors[name],
    markTouched: (name) => {
      const rule = fieldsRef.current.get(name)
      if (rule && validateOnChange) {
        const err = validateValue(values[name], rule, values)
        setErrors((e) => {
          if (err) return { ...e, [name]: err }
          if (!(name in e)) return e
          const next = { ...e }
          delete next[name]
          return next
        })
      }
    },
    formError,
  }

  return (
    <FormContext.Provider value={ctx}>
      <form
        id={id}
        className={cn("prui-form flex flex-col gap-4", className)}
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          void submit()
        }}
        onReset={(e) => {
          e.preventDefault()
          reset()
        }}
      >
        {children}
      </form>
    </FormContext.Provider>
  )
}

/* ---------------- FormGroup ---------------- */

export interface FormGroupProps {
  label?: string
  description?: string
  /** Columns per breakpoint; every entry is 1 to 4. */
  columns?: number | FormGroupColumns
  gap?: "sm" | "md" | "lg"
  children?: ReactNode
  className?: string
}

// full literal classes so the tailwind scanner picks them up in consumers
const baseCols = { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" } as const
const smCols = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-4" } as const
const mdCols = { 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4" } as const
const lgCols = { 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4" } as const

export function FormGroup({ label, description, columns = 1, gap = "md", children, className }: FormGroupProps) {
  const cols: FormGroupColumns = typeof columns === "number" ? { base: columns as 1 | 2 | 3 | 4 } : columns
  const base = cols.base ?? 1
  const grid = [
    "grid",
    baseCols[base],
    cols.sm && cols.sm > 1 ? smCols[cols.sm as 2 | 3 | 4] : null,
    cols.md && cols.md > 1 ? mdCols[cols.md as 2 | 3 | 4] : null,
    cols.lg && cols.lg > 1 ? lgCols[cols.lg as 2 | 3 | 4] : null,
  ].filter(Boolean) as string[]
  const gapClass = gap === "sm" ? "gap-x-2 gap-y-3" : gap === "lg" ? "gap-x-6 gap-y-4" : "gap-x-4 gap-y-3"

  return (
    <div
      role="group"
      className={cn("prui-form-group rounded-prui border border-line bg-surface p-4", className)}
    >
      {label ? <div className="text-sm font-semibold text-fg">{label}</div> : null}
      {description ? <div className="mb-1 text-xs text-dim">{description}</div> : null}
      <div className={cn(...grid, gapClass)}>
        {children}
      </div>
    </div>
  )
}

/* ---------------- FormInput ---------------- */

export interface FormInputProps {
  name: string
  label?: string
  type?: "text" | "email" | "password" | "number" | "tel" | "url" | "search" | "date" | "time" | "datetime-local" | "textarea" | "select" | "switch" | "checkbox"
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
  autoFocus?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  step?: number
  pattern?: RegExp
  patternMessage?: string
  /** Select/switch/checkbox options. */
  options?: { label: string; value: string; disabled?: boolean }[]
  rows?: number
  /** Static helper line under the control. */
  help?: ReactNode
  /** Caller message under the control; validation errors take precedence. */
  message?: FormMessage
  validate?: (value: unknown, values: Record<string, unknown>) => string | null
  onChange?: (value: unknown) => void
  className?: string
}

export function FormInput({
  name,
  label = name,
  type = "text",
  placeholder,
  required,
  disabled,
  readOnly,
  autoFocus,
  minLength,
  maxLength,
  min,
  max,
  step,
  pattern,
  patternMessage,
  options,
  rows = 3,
  help,
  message,
  validate,
  onChange,
  className,
}: FormInputProps) {
  const ctx = useFormContext()
  React.useEffect(() => {
    ctx.registerField(name, { label, required, validate, minLength, maxLength, min, max, pattern, patternMessage })
    return () => ctx.unregisterField(name)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- a field registers once per name; re-running on every config prop would churn registrations
  }, [name])

  const value = ctx.getValue(name)
  const error = ctx.errorFor(name)

  const set = (v: unknown) => {
    ctx.setValue(name, v)
    onChange?.(v)
  }

  const id = `prui-field-${ctx.id}-${name}`
  const messageId = `${id}-msg`
  const bottom = error ?? message?.message ?? help
  const bottomType: "error" | "info" | "warning" | "success" | "help" = error
    ? "error"
    : message
      ? message.type ?? "info"
      : "help"
  const bottomClass = {
    error: "text-danger",
    warning: "text-warn",
    info: "text-dim",
    success: "text-ok",
    help: "text-dim",
  }[bottomType]

  const control = (() => {
    if (type === "textarea") {
      return (
        <Textarea
          id={id}
          rows={rows}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          autoFocus={autoFocus}
          minLength={minLength}
          maxLength={maxLength}
          className={cn("w-full", className)}
          value={String(value ?? "")}
          onChange={(e) => set(e.target.value)}
          onBlur={() => ctx.markTouched(name)}
          aria-invalid={error ? true : undefined}
          aria-describedby={bottom ? messageId : undefined}
        />
      )
    }
    if (type === "select") {
      return (
        <Select
          id={id}
          className={cn("w-full", className)}
          options={(options ?? []).map((o) => ({ label: o.label, value: o.value, disabled: o.disabled }))}
          placeholder={placeholder}
          disabled={disabled}
          value={String(value ?? "")}
          onChange={(v) => set(v)}
          aria-label={label}
        />
      )
    }
    if (type === "switch" || type === "checkbox") {
      return (
        <Switch
          id={id}
          checked={Boolean(value)}
          disabled={disabled}
          onChange={(c) => set(c)}
          aria-label={label}
        />
      )
    }
    return (
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        autoFocus={autoFocus}
        minLength={minLength}
        maxLength={maxLength}
        min={min}
        max={max}
        step={step}
        pattern={pattern?.source}
        className={cn("w-full", className)}
        value={String(value ?? "")}
        onChange={(e) => set(type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)}
        onBlur={() => ctx.markTouched(name)}
        aria-invalid={error ? true : undefined}
        aria-describedby={bottom ? messageId : undefined}
      />
    )
  })()

  return (
    <div className={cn("prui-form-input flex flex-col gap-1.5", className)} data-testid={`form-input-${name}`}>
      {label ? (
        <Label htmlFor={id}>
          {label}
          {required ? <span className="ml-0.5 text-danger">*</span> : null}
        </Label>
      ) : null}
      {control}
      {bottom ? (
        <p id={messageId} className={cn("text-xs", bottomClass)} role={error ? "alert" : undefined}>
          {bottom}
        </p>
      ) : null}
    </div>
  )
}

/* ---------------- FormButton (works outside the form scope) ---------------- */

export interface FormButtonProps {
  /** The id of the <Form> this button drives. */
  form: string
  action?: "submit" | "reset" | "clear"
  /** Disable rule: while the referenced form is invalid or untouched. */
  disableWhen?: "invalid" | "pristine" | "never"
  variant?: "primary" | "default" | "ghost" | "danger" | "outline" | "soft" | "link"
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  children?: ReactNode
  onClick?: () => void
  className?: string
}

function useFormSnapshot(id: string): FormSnapshot | null {
  const [snap, setSnap] = React.useState<FormSnapshot | null>(() => getFormApi(id)?.getState() ?? null)
  React.useEffect(() => {
    const api = getFormApi(id)
    if (!api) {
      setSnap(null)
      return
    }
    setSnap(api.getState())
    return api.subscribe((s) => setSnap(s))
  }, [id])
  return snap
}

export function FormButton({ form, action = "submit", disableWhen = "never", variant, size, disabled, children, onClick, className }: FormButtonProps) {
  const snap = useFormSnapshot(form)

  const autoDisabled =
    disabled ||
    (disableWhen === "invalid" && snap ? !snap.isValid : false) ||
    (disableWhen === "pristine" && snap ? !snap.isDirty : false)

  return (
    <Button
      type="button"
      variant={(variant ?? "default") as never}
      size={size}
      disabled={autoDisabled}
      className={className}
      data-testid={`form-button-${form}-${action}`}
      onClick={() => {
        const target = getFormApi(form)
        if (!target) {
          console.warn(`[prui] FormButton: no <Form id="${form}"> is mounted.`)
          return
        }
        if (action === "submit") void target.submit()
        else if (action === "reset") target.reset()
        else if (action === "clear") target.clear()
        onClick?.()
      }}
    >
      {children}
    </Button>
  )
}

/* ---------------- meta ---------------- */

export const formPropsMeta: PropsMeta = {
  name: "Form",
  props: [
    { name: "id", type: "string", default: null, control: "text" },
    { name: "schema", type: "SafeParseSchema (zod-compatible)", default: "undefined", control: "none" },
    { name: "initialValues", type: "Record<string, unknown>", default: "{}", control: "object" },
    { name: "onSubmit", type: "(values) => void | Promise<void>", default: null, control: "none" },
    { name: "validateOnChange", type: "boolean", default: "true", control: "boolean" },
  ],
}

export const formGroupPropsMeta: PropsMeta = {
  name: "FormGroup",
  props: [
    { name: "label", type: "string", default: null, control: "text" },
    { name: "description", type: "string", default: null, control: "text" },
    { name: "columns", type: "number | { base?, sm?, md?, lg? }", default: "1", control: "number" },
    { name: "gap", type: "'sm' | 'md' | 'lg'", default: "'md'", control: "select", options: ["sm", "md", "lg"] },
  ],
}

export const formInputPropsMeta: PropsMeta = {
  name: "FormInput",
  props: [
    { name: "name", type: "string", default: null, control: "text" },
    { name: "label", type: "string", default: "name", control: "text" },
    { name: "type", type: "text | email | password | number | tel | url | search | date | time | datetime-local | textarea | select | switch | checkbox", default: "'text'", control: "select", options: ["text", "email", "password", "number", "date", "textarea", "select", "switch"] },
    { name: "required", type: "boolean", default: "false", control: "boolean" },
    { name: "help", type: "ReactNode", default: null, control: "text" },
    { name: "message", type: "{ message, type: 'info' | 'warning' | 'success' }", default: null, control: "object" },
    { name: "options", type: "{ label, value }[]", default: "select/switch only", control: "object" },
    { name: "validate", type: "(value, values) => string | null", default: null, control: "none" },
  ],
}

export const formButtonPropsMeta: PropsMeta = {
  name: "FormButton",
  props: [
    { name: "form", type: "string (id of the target <Form>)", default: null, control: "text" },
    { name: "action", type: "'submit' | 'reset' | 'clear'", default: "'submit'", control: "select", options: ["submit", "reset", "clear"] },
    { name: "disableWhen", type: "'invalid' | 'pristine' | 'never'", default: "'never'", control: "select", options: ["invalid", "pristine", "never"] },
    { name: "variant", type: "ButtonVariant", default: "'default'", control: "select", options: ["primary", "default", "ghost", "danger", "outline", "soft", "link"] },
  ],
}
