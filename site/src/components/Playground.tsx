import * as React from "react"
import type { PropsMeta, PropMeta } from "prui/core"
import { Input, Switch, Select } from "prui/core"
import { CodeView } from "./CodeView"
import { applySnippet, parseSnippet } from "../lib/snippet"

/**
 * Playground engine: two-way. Controls are generated from the component's
 * propsMeta (single source, AC-4/AC-15) and regenerate the snippet; edits
 * in the snippet parse back into prop values, validated against the same
 * propsMeta, so the demo reflects the code and violations show as errors.
 */

export type PropValues = Record<string, unknown>

function Control({ meta, value, onChange }: { meta: PropMeta; value: unknown; onChange: (v: unknown) => void }) {
  switch (meta.control) {
    case "boolean":
      return (
        <label className="flex items-center gap-2 text-xs text-[var(--prui-dim)]">
          <Switch checked={Boolean(value)} onChange={onChange} aria-label={meta.name} />
          {meta.name}
        </label>
      )
    case "select":
      return (
        <div className="flex w-40 flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--prui-dim)]">{meta.name}</span>
          <Select
            value={String(value ?? "")}
            onChange={onChange}
            options={(meta.options ?? []).map((o) => ({ label: o, value: o }))}
          />
        </div>
      )
    case "number":
      return (
        <div className="flex w-28 flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--prui-dim)]">{meta.name}</span>
          <Input type="number" value={String(value ?? "")} onChange={(e) => onChange(Number(e.target.value))} className="h-7" />
        </div>
      )
    case "none":
    case "object":
    case "icon":
    case "multiselect":
    case "daterange":
    case "date":
    case "color":
      return null
    default:
      return (
        <div className="flex w-44 flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--prui-dim)]">{meta.name}</span>
          <Input
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            className="h-7"
            aria-label={meta.name}
          />
        </div>
      )
  }
}

function defaultFor(p: PropMeta): unknown {
  if (p.control === "boolean") return String(p.default) === "true"
  if (p.control === "number") return Number(p.default) || 0
  if (p.default === null || String(p.default) === "undefined") return ""
  return String(p.default).replace(/^['"]|['"]$/g, "")
}

/** Baseline values: defaults plus caller overrides, used as the parse target. */
function baseValues(meta: PropsMeta, overrides: Partial<PropValues> = {}): PropValues {
  const initial: PropValues = {}
  for (const p of meta.props) {
    initial[p.name] = overrides[p.name] ?? defaultFor(p)
  }
  return initial
}

function literalFor(v: unknown): string {
  if (typeof v === "string") return v
  if (typeof v === "boolean") return v ? "true" : "false"
  return String(v ?? "")
}

/** Rebuild the single-element snippet from current values. */
function buildSnippet(meta: PropsMeta, values: PropValues, overrides: Partial<PropValues> = {}): string {
  const attrs: string[] = []
  for (const p of meta.props) {
    if (p.name === "children") continue
    if (p.control === "none" || p.control === "object" || p.control === "icon") {
      if (p.name in overrides) continue
      continue
    }
    const def = defaultFor(p)
    const v = values[p.name]
    const isDefault = String(v) === String(def) && def !== null && String(def) !== "undefined"
    if (isDefault && !(p.name in overrides)) continue
    if (p.control === "boolean") {
      attrs.push(`${p.name}={${v ? "true" : "false"}}`)
    } else if (p.control === "number") {
      attrs.push(`${p.name}={${Number(v)}}`)
    } else if (p.control === "select") {
      attrs.push(`${p.name}="${literalFor(v)}"`)
    } else if (p.control === "multiselect") {
      attrs.push(`${p.name}={[${(Array.isArray(v) ? v : []).map((s) => `'${s}'`).join(", ")}]}`)
    } else {
      attrs.push(`${p.name}="${literalFor(v)}"`)
    }
  }
  const children = typeof values.children === "string" && values.children ? values.children : ""
  const inner = attrs.length ? " " + attrs.join(" ") : ""
  return children
    ? `<${meta.name}${inner}>${children}</${meta.name}>`
    : `<${meta.name}${inner} />`
}

export function usePlayground(meta: PropsMeta, overrides: Partial<PropValues> = {}) {
  const base = React.useMemo(() => baseValues(meta, overrides), [meta, overrides])
  const [values, setValues] = React.useState<PropValues>(base)
  const [codeText, setCodeText] = React.useState<string>(() => buildSnippet(meta, base, overrides))
  const [errors, setErrors] = React.useState<string[]>([])

  const canonical = React.useCallback(
    (v: PropValues) => buildSnippet(meta, v, overrides),
    [meta, overrides],
  )

  const controls = meta.props.filter(
    (p) => p.control !== "none" && !(p.name === "children" && overrides.children !== undefined),
  )

  const panel = (
    <div className="flex flex-wrap items-end gap-3">
      {controls.map((p) => (
        <Control
          key={p.name}
          meta={p}
          value={values[p.name]}
          onChange={(v) => {
            const next = { ...values, [p.name]: v }
            setValues(next)
            setCodeText(canonical(next))
            setErrors([])
          }}
        />
      ))}
    </div>
  )

  const onEdit = (raw: string) => {
    setCodeText(raw)
    const { parsed, error } = parseSnippet(raw)
    if (error || !parsed) {
      setErrors([error ?? "Could not parse the snippet."])
      return
    }
    const { values: merged, errors: errs } = applySnippet(meta, parsed, base)
    setValues(merged)
    setErrors(errs)
  }

  return { values, panel, onEdit, codeText, errors, canonical }
}

export function Playground({
  title,
  meta,
  render,
  defaults,
  code,
}: {
  title: string
  meta: PropsMeta
  render: (values: PropValues) => React.ReactNode
  defaults?: Partial<PropValues>
  /** Optional custom snippet builder; defaults to a single-element tag. */
  code?: (values: PropValues) => string
}) {
  const { values, panel, onEdit, codeText, errors, canonical } = usePlayground(meta, defaults)

  return (
    <section id={title.toLowerCase().replace(/\s+/g, "-")} className="mb-8 scroll-mt-20" data-testid="playground">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-mono text-sm font-semibold text-[var(--prui-brand)]">{title}</h3>
        <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--prui-dim)]">live playground</span>
      </div>
      <div className="rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-surface)]">
        <div className="flex items-center justify-between border-b border-[var(--prui-line)] px-4 py-2 font-mono text-[11px] text-[var(--prui-dim)]">
          <span>demo</span>
          <span>props from propsMeta</span>
        </div>
        <div className="flex min-h-24 flex-wrap items-center gap-3 p-5">{render(values)}</div>
        <div className="border-t border-[var(--prui-line)] px-4 py-3">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-[var(--prui-dim)]">controls</div>
          {panel}
        </div>
        <div className="border-t border-[var(--prui-line)] bg-[var(--prui-background)]">
          <CodeView
            code={codeText}
            canonical={code?.(values) ?? canonical(values)}
            onEdit={onEdit}
            title="snippet"
            language="typescript"
            className="overflow-hidden"
          />
        </div>
        {errors.length ? (
          <div className="border-t border-[var(--prui-line)] px-4 py-3" role="alert" data-testid="playground-errors">
            <ul className="flex list-disc flex-col gap-1 pl-4">
              {errors.map((e) => (
                <li key={e} className="text-xs text-[var(--prui-danger)]">{e}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="border-t border-[var(--prui-line)] px-4 py-2.5">
            <p className="text-[11px] text-[var(--prui-dim)]">
              The editor drives this demo. Props are checked against the spec table below as you type; reset puts the
              original snippet back.
            </p>
          </div>
        )}
      </div>
      <PropsTable meta={meta} />
    </section>
  )
}

export function MetaOnly({ meta }: { meta: PropsMeta }) {
  return (
    <div>
      <PropsTable meta={meta} />
    </div>
  )
}

export function PropsTable({ meta }: { meta: PropsMeta }) {
  return (
    <div className="mt-3 overflow-x-auto rounded-[var(--prui-radius)] border border-[var(--prui-line)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--prui-line)] bg-[var(--prui-raise)] text-left">
            <th className="px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-wide text-[var(--prui-dim)]">Prop</th>
            <th className="px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-wide text-[var(--prui-dim)]">Type</th>
            <th className="px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-wide text-[var(--prui-dim)]">Default</th>
          </tr>
        </thead>
        <tbody>
          {meta.props.map((p) => (
            <tr key={p.name} className="border-b border-[var(--prui-line)] last:border-0">
              <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-[var(--prui-brand)]">{p.name}</td>
              <td className="whitespace-nowrap px-3 py-2 font-mono text-[11px] text-[var(--prui-warn)]">{p.type}</td>
              <td className="px-3 py-2 font-mono text-xs text-[var(--prui-dim)]">{String(p.default)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
