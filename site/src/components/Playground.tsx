import * as React from "react"
import type { PropsMeta, PropMeta } from "prui/core"
import { Input, Switch, Select } from "prui/core"

/**
 * Playground engine: controls are generated from the component's propsMeta
 * (single source, AC-4/AC-15), the demo re-renders live, and the snippet
 * below stays in sync with the current prop values.
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

export function usePlayground(meta: PropsMeta, overrides: Partial<PropValues> = {}) {
  const [values, setValues] = React.useState<PropValues>(() => {
    const initial: PropValues = {}
    for (const p of meta.props) {
      initial[p.name] = overrides[p.name] ?? defaultFor(p)
    }
    return initial
  })

  const controls = meta.props.filter(
    (p) => p.control !== "none" && !(p.name === "children" && overrides.children !== undefined),
  )

  const panel = (
    <div className="flex flex-wrap items-end gap-3">
      {controls.map((p) => (
        <Control
          key={p.name}
          meta={p}
          value={p.name in overrides && p.control === "none" ? undefined : values[p.name]}
          onChange={(v) => setValues((s) => ({ ...s, [p.name]: v }))}
        />
      ))}
    </div>
  )

  const snippetProps = Object.entries(values)
    .filter(([k, v]) => {
      const m = meta.props.find((p) => p.name === k)
      if (!m) return false
      if (m.control === "none" && !(k in overrides)) return false
      const def = m.default
      return !(String(v) === String(def ?? "") && def !== null && String(def) !== "undefined")
    })
    .map(([k, v]) => {
      if (typeof v === "string") return `${k}="${v}"`
      if (typeof v === "boolean") return v ? k : `${k}={false}`
      return `${k}={${JSON.stringify(v)}}`
    })

  return { values, panel, snippetProps, setValues }
}

function defaultFor(p: PropMeta): unknown {
  if (p.control === "boolean") return String(p.default) === "true"
  if (p.control === "number") return Number(p.default) || 0
  if (p.default === null || String(p.default) === "undefined") return ""
  return String(p.default).replace(/^['"]|['"]$/g, "")
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
  code?: (values: PropValues) => string
}) {
  const { values, panel, snippetProps } = usePlayground(meta, defaults)
  const componentName = meta.name
  const snippet =
    code?.(values) ??
    `<${componentName}${snippetProps.length ? " " + snippetProps.join(" ") : ""}>${String(values.children ?? "")}</${componentName}>`

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
          <div className="flex items-center justify-between px-4 pt-2 font-mono text-[10px] uppercase tracking-widest text-[var(--prui-dim)]">
            <span>snippet</span>
            <CopyButton text={snippet} />
          </div>
          <pre className="overflow-x-auto px-4 pb-3 pt-1 font-mono text-xs leading-relaxed text-[var(--prui-fg)]">{snippet}</pre>
        </div>
      </div>
      <PropsTable meta={meta} />
    </section>
  )
}

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setCopied(true)
          setTimeout(() => setCopied(false), 1200)
        } catch {
          /* clipboard unavailable */
        }
      }}
      className="cursor-pointer rounded-[var(--prui-radius-1)] border border-[var(--prui-line)] px-2 py-0.5 font-mono text-[10px] text-[var(--prui-dim)] hover:text-[var(--prui-fg)]"
    >
      {copied ? "copied" : "copy"}
    </button>
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
