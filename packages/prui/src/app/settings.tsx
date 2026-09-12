import * as React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../core/card"
import { Input } from "../core/input"
import { Select } from "../core/select"
import { Switch } from "../core/switch"
import { cn } from "../core/cn"
import type { PropsMeta } from "../core/props-meta"

/**
 * Settings: a two-column settings page from a section list.
 * Left: section nav (in-page anchors). Right: section cards with fields.
 * Fields are either fully typed (`name` + `type` + `value`/`onChange`, which
 * render the matching primitive) or a free `control` node.
 */

export type SettingsFieldType = "text" | "number" | "select" | "switch"

export interface SettingsField {
  label: string
  description?: string
  /** Field key; required when type is set. */
  name?: string
  type?: SettingsFieldType
  /** Choices for type select: strings/numbers or label/value pairs. */
  options?: (string | number | { label: string; value: string })[]
  /** Current value for typed fields. */
  value?: string | number | boolean
  /** Change handler for typed fields. */
  onChange?: (value: string | number | boolean) => void
  /** Controlled content: any node (input, switch, custom). Overrides type. */
  control?: React.ReactNode
}

export interface SettingsSection {
  id: string
  title?: string
  /** Alias of title. */
  label?: string
  description?: string
  fields?: SettingsField[]
  /** Fully custom section body. */
  content?: React.ReactNode
}

export interface SettingsProps {
  title?: string
  sections: SettingsSection[]
  className?: string
}

function normalizeSelectOptions(opts: SettingsField["options"]): { label: string; value: string }[] | undefined {
  if (!opts) return undefined
  return opts.map((o) => (typeof o === "string" || typeof o === "number" ? { label: String(o), value: String(o) } : o))
}

function TypedField({ field }: { field: SettingsField }) {
  const { name, type, value, onChange } = field
  if (!type || !name) return null
  const id = `prui-settings-${name}`
  if (type === "switch") {
    return (
      <label className="flex items-center gap-2" htmlFor={id}>
        <Switch
          id={id}
          checked={Boolean(value)}
          onChange={(c) => onChange?.(c)}
          aria-label={field.label}
        />
      </label>
    )
  }
  if (type === "select") {
    return (
      <Select
        id={id}
        className="w-56"
        options={normalizeSelectOptions(field.options) ?? []}
        value={String(value ?? "")}
        onChange={(v) => onChange?.(Array.isArray(v) ? v.join(",") : v)}
        aria-label={field.label}
      />
    )
  }
  return (
    <Input
      id={id}
      type={type === "number" ? "number" : "text"}
      className="h-8 w-56"
      value={String(value ?? "")}
      onChange={(e) => onChange?.(type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)}
      aria-label={field.label}
    />
  )
}

export function Settings({ title = "Settings", sections, className }: SettingsProps) {
  return (
    <div className={cn("prui-settings mx-auto flex w-full max-w-4xl flex-col gap-6", className)}>
      <h1 className="text-xl font-semibold text-[var(--prui-fg)]">{title}</h1>
      <div className="flex flex-col gap-6 md:flex-row">
        <nav aria-label="Settings sections" className="md:w-56 md:shrink-0">
          <ul className="flex flex-row flex-wrap gap-1 md:flex-col">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#settings-${s.id}`}
                  className="block rounded-[var(--prui-radius)] px-2.5 py-1.5 text-sm text-[var(--prui-dim)] hover:bg-[var(--prui-raise)] hover:text-[var(--prui-fg)]"
                >
                  {s.title ?? s.label ?? s.id}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {sections.map((s) => (
            <Card key={s.id} id={`settings-${s.id}`} data-testid="settings-section">
              <CardHeader>
                <CardTitle>{s.title ?? s.label ?? s.id}</CardTitle>
                {s.description ? <CardDescription>{s.description}</CardDescription> : null}
              </CardHeader>
              <CardContent>
                {s.content ?? (
                  <dl className="flex flex-col divide-y divide-[var(--prui-line)]">
                    {(s.fields ?? []).map((f, i) => (
                      <div key={`${f.label}-${i}`} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <dt className="text-sm font-medium text-[var(--prui-fg)]">{f.label}</dt>
                          {f.description ? <dd className="text-xs text-[var(--prui-dim)]">{f.description}</dd> : null}
                        </div>
                        <div className="shrink-0">
                          {f.control ?? <TypedField field={f} />}
                        </div>
                      </div>
                    ))}
                  </dl>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export const settingsPropsMeta: PropsMeta = {
  name: "Settings",
  props: [
    { name: "title", type: "string", default: "'Settings'", control: "text" },
    { name: "sections", type: "SettingsSection[]", default: null, control: "object" },
  ],
}
