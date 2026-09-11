import { Link } from "react-router-dom"
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from "prui/core"
import { LayoutGrid, Table2, Terminal } from "lucide-react"

const features = [
  {
    icon: LayoutGrid,
    title: "<App> super-component",
    desc: "Sidebar, header, command palette, theming, routing — one component, whole shell.",
  },
  {
    icon: Table2,
    title: "<Resource> CRUD screens",
    desc: "Toolbar, filters, table, cursor pagination, create/edit modal, delete confirm — from a column config.",
  },
  {
    icon: Terminal,
    title: "Typed, tree-shakeable layers",
    desc: "Import prui/core, prui/app, prui/pages, prui/data-table, prui/theme — pay for what you use.",
  },
]

export function LandingPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <section className="py-16 text-center">
        <Badge variant="brand">v0.1.0</Badge>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--prui-fg)] md:text-5xl">
          Build an admin app in minutes,<br />not days.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[var(--prui-dim)]">
          PRUI is the component system your four apps already share — unified into one package.
          Primitives for composition, super-components for whole application structures from props.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/getting-started">
            <Button variant="primary" size="lg">Get started</Button>
          </Link>
          <Link to="/components">
            <Button variant="default" size="lg">Browse components</Button>
          </Link>
        </div>
        <pre className="mx-auto mt-8 max-w-lg overflow-x-auto rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-surface)] p-4 text-left text-xs text-[var(--prui-fg)]">
{`import { App } from 'prui/app'
import { Resource } from 'prui/app'

<App brand={{ name: 'HRLabs' }} nav={nav} theme={{ default: 'control' }}>
  <Resource name="employees" columns={columns} list={api.list} />
</App>`}
        </pre>
      </section>

      <section className="grid gap-4 pb-16 md:grid-cols-3">
        {features.map((f) => (
          <Card key={f.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <f.icon className="h-4 w-4 text-[var(--prui-brand)]" aria-hidden />
                {f.title}
              </CardTitle>
              <CardDescription>{f.desc}</CardDescription>
            </CardHeader>
            <CardContent />
          </Card>
        ))}
      </section>
    </div>
  )
}
