import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "prui/core"

export function GettingStartedPage() {
  return (
    <div className="mx-auto max-w-3xl prui-prose text-sm text-[var(--prui-dim)]">
      <h1 className="mb-6 text-2xl font-bold text-[var(--prui-fg)]">Getting started</h1>

      <h2>1. Install</h2>
      <p>PRUI ships react-router-dom, lucide-react, and React 19 as dependencies — one install, no peer wiring:</p>
      <pre className="mb-4 overflow-x-auto rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-surface)] p-3 text-xs text-[var(--prui-fg)]">pnpm add prui</pre>

      <h2>2. Import the theme</h2>
      <p>Import the token stylesheet once (it carries all four named themes):</p>
      <pre className="mb-4 overflow-x-auto rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-surface)] p-3 text-xs text-[var(--prui-fg)]">import "prui/styles.css"</pre>

      <h2>3. Render the App shell</h2>
      <p>One component renders sidebar, header, command palette, theming, and routing:</p>
      <pre className="mb-4 overflow-x-auto rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-surface)] p-3 text-xs text-[var(--prui-fg)]">{`import { App } from 'prui/app'
import { Users, LayoutDashboard, Calendar } from 'lucide-react'

<App
  brand={{ name: 'My App' }}
  nav={[
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Employees', href: '/employees', icon: Users },
    { label: 'Leave', icon: Calendar, items: [
      { label: 'Requests', href: '/leave/requests' },
    ]},
  ]}
  search={{ enabled: true, hotkey: '/' }}
  theme={{ default: 'control', persist: true }}
>
  {routes}
</App>`}</pre>

      <h2>4. Add a Resource screen</h2>
      <p>A complete CRUD listing — toolbar, filters, sorting, cursor pagination, modals — driven only by props and your API functions:</p>
      <pre className="mb-4 overflow-x-auto rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-surface)] p-3 text-xs text-[var(--prui-fg)]">{`import { Resource } from 'prui/app'

<Resource
  name="employees"
  columns={[
    { key: 'name', label: 'Name', sortable: true },
    { key: 'status', label: 'Status', filter: 'select', filterOptions: [...] },
    { key: 'hired', label: 'Hired', filter: 'daterange' },
  ]}
  list={(q) => api.listEmployees(q)}
  create={(v) => api.createEmployee(v)}
  update={(row, v) => api.updateEmployee(row.id, v)}
  remove={(row) => api.deleteEmployee(row.id)}
/>`}</pre>

      <h2>Adoption ladder</h2>
      <ul className="mb-4">
        <li><code>prui/core</code> — primitives only (Button, Input, DataTable, ...), for standard composition</li>
        <li><code>prui/app</code> — super-components (<code>&lt;App&gt;</code>, <code>&lt;Resource&gt;</code>, <code>&lt;Form&gt;</code>, <code>&lt;StatRow&gt;</code>, <code>&lt;Settings&gt;</code>)</li>
        <li><code>prui/pages</code> — pre-made login/register/OTP/404/... pages with per-field show/hide</li>
        <li><code>prui/data-table</code> — the DataTable family for direct composition</li>
        <li><code>prui/theme</code> — tokens, named themes, applyTheme()</li>
      </ul>

      <p>Mix freely: every layer is tree-shakeable and typed.</p>
    </div>
  )
}

export function ThemingPage() {
  const themes = [
    { name: "control", desc: "Dark operations room, cool blue accent. Default." },
    { name: "workshop", desc: "Dark warm neutral, amber accent." },
    { name: "ember", desc: "Deep red-black, ember accent." },
    { name: "daylight", desc: "Light theme, indigo accent." },
  ]
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-2xl font-bold text-[var(--prui-fg)]">Theming</h1>
      <p className="mb-6 text-sm text-[var(--prui-dim)]">
        Components reference CSS variables only — override one file, re-skin everything. Switch themes live with the toggle in this site's header.
      </p>
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        {themes.map((t) => (
          <Card key={t.name}>
            <CardHeader>
              <CardTitle className="font-mono text-sm">{t.name}</CardTitle>
              <CardDescription>{t.desc}</CardDescription>
            </CardHeader>
            <CardContent />
          </Card>
        ))}
      </div>
      <h2 className="mb-2 text-base font-semibold text-[var(--prui-fg)]">Tokens</h2>
      <pre className="overflow-x-auto rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-surface)] p-3 text-xs text-[var(--prui-fg)]">{`--prui-background  --prui-surface  --prui-raise  --prui-line
--prui-fg  --prui-dim  --prui-brand  --prui-brand-fg
--prui-ok  --prui-warn  --prui-danger
--prui-radius  --prui-radius-1..3  --prui-radius-full`}</pre>
      <p className="mt-4 text-sm text-[var(--prui-dim)]">
        Programmatic: <code className="rounded bg-[var(--prui-raise)] px-1">applyTheme({"{"} theme: 'workshop' {"}"})</code> persists the choice; <code className="rounded bg-[var(--prui-raise)] px-1">prui/theme/*.css</code> files can be imported individually.
      </p>
    </div>
  )
}
