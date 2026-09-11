import * as React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../core/card"
import { cn } from "../core/cn"
import type { PropsMeta } from "../core/props-meta"

/**
 * Settings: a two-column settings page from a section list.
 * Left: section nav (in-page anchors). Right: section cards with fields.
 */

export interface SettingsField {
  label: string
  description?: string
  /** Controlled content: any node (input, switch, custom). */
  control?: React.ReactNode
}

export interface SettingsSection {
  id: string
  title: string
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
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {sections.map((s) => (
            <Card key={s.id} id={`settings-${s.id}`} data-testid="settings-section">
              <CardHeader>
                <CardTitle>{s.title}</CardTitle>
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
                        {f.control ? <div className="shrink-0">{f.control}</div> : null}
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
