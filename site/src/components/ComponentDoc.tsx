import * as React from "react"
import { Link } from "react-router-dom"
import {
  Button,
  Input,
  Textarea,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Switch,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Avatar,
  Separator,
  Dropdown,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  ScrollArea,
  Modal,
  confirmModal,
} from "prui/core"
import { CodeView } from "./CodeView"
import { TocRail } from "./TocRail"
import { DataTable, DataTablePagination, DataTableToolbar, FacetedFilter, DateRangeFilter, NumberRangeFilter } from "prui/data-table"

/** In-depth per-component documentation page scaffold. */
export function ComponentDoc({
  name,
  importPath,
  description,
  when,
  anatomy,
  demos,
  api,
  examples,
  dos,
  donts,
}: {
  name: string
  importPath: string
  description: string
  when: string[]
  anatomy?: React.ReactNode
  demos: { title: string; desc?: string; render: React.ReactNode; code?: string }[]
  api?: React.ReactNode
  examples: { title: string; code: string; render?: React.ReactNode }[]
  dos: string[]
  donts: string[]
}) {
  const toc = [
    { id: "when-to-use", label: "When to use" },
    ...(anatomy ? [{ id: "anatomy", label: "Anatomy" }] : []),
    { id: "demos", label: "Demos" },
    ...(api ? [{ id: "api", label: "API" }] : []),
    { id: "examples", label: "Examples" },
    { id: "do-dont", label: "Do / Don't" },
  ]

  return (
    <div className="mx-auto flex w-full max-w-[1080px] justify-center gap-6 px-4 pb-20 pt-8 md:px-6">
      <div className="min-w-0 max-w-[780px] flex-1">
        <div className="mb-2 font-mono text-xs text-[var(--prui-dim)]">
          <Link to="/components" className="hover:text-[var(--prui-fg)]">components</Link> / {name.toLowerCase()}
        </div>
        <h1 className="mb-1.5 text-[27px] font-bold tracking-tight text-[var(--prui-fg)]">{name}</h1>
        <p className="mb-6 max-w-[60ch] text-[15px] text-[var(--prui-dim)]">{description}</p>

        <CodeBlock title="import" code={`import { ${name} } from '${importPath}'`} />

        <Section id="when-to-use" title="When to use">
          <ul className="list-disc pl-5">
            {when.map((w) => <li key={w}>{w}</li>)}
          </ul>
        </Section>

        {anatomy ? <Section id="anatomy" title="Anatomy">{anatomy}</Section> : null}

        <Section id="demos" title="Demos">
          {demos.map((d) => (
            <div key={d.title} className="mb-5">
              <div className="mb-1 text-sm font-semibold text-[var(--prui-fg)]">{d.title}</div>
              {d.desc ? <p className="mb-2 text-xs text-[var(--prui-dim)]">{d.desc}</p> : null}
              <div className="mb-2 flex min-h-16 flex-wrap items-center gap-3 rounded-[var(--prui-radius)] border border-dashed border-[var(--prui-line)] p-4">
                {d.render}
              </div>
              {d.code ? <CodeBlock code={d.code} /> : null}
            </div>
          ))}
        </Section>

        {api ? <Section id="api" title="API">{api}</Section> : null}

        <Section id="examples" title="Examples">
          {examples.map((e) => (
            <div key={e.title} className="mb-4">
              <div className="mb-1 text-sm font-semibold text-[var(--prui-fg)]">{e.title}</div>
              {e.render}
              <CodeBlock code={e.code} />
            </div>
          ))}
        </Section>

        <div id="do-dont" className="grid scroll-mt-20 gap-3 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm text-[var(--prui-ok)]">Do</CardTitle></CardHeader>
          <CardContent>
            <ul className="list-disc pl-4 text-xs text-[var(--prui-dim)]">{dos.map((d) => <li key={d}>{d}</li>)}</ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-[var(--prui-danger)]">Don't</CardTitle></CardHeader>
          <CardContent>
            <ul className="list-disc pl-4 text-xs text-[var(--prui-dim)]">{donts.map((d) => <li key={d}>{d}</li>)}</ul>
          </CardContent>
        </Card>
      </div>

        <p className="mt-8 text-center font-mono text-xs text-[var(--prui-dim)]">
          <Link to="/components" className="hover:text-[var(--prui-fg)]">← all components</Link>
        </p>
      </div>

      <TocRail items={toc} />
    </div>
  )
}

export function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-8 scroll-mt-20">
      <h2 className="mb-3 text-base font-semibold text-[var(--prui-fg)]">{title}</h2>
      <div className="text-sm text-[var(--prui-dim)]">{children}</div>
    </section>
  )
}

export function CodeBlock({ code, title }: { code: string; title?: string }) {
  return <CodeView code={code} title={title ?? "tsx"} className="mb-4 mt-2 overflow-hidden rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-surface)]" />
}

/* re-exports for doc pages */
export {
  Button, Input, Textarea, Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
  Switch, Tabs, TabsList, TabsTrigger, TabsContent, Badge, Card, CardHeader, CardTitle,
  CardDescription, CardContent, CardFooter, Avatar, Separator, Dropdown, Dialog, DialogContent,
  DialogHeader, DialogTitle, DialogDescription, DialogFooter, ScrollArea, Modal, confirmModal,
  DataTable, DataTablePagination, DataTableToolbar, FacetedFilter, DateRangeFilter, NumberRangeFilter,
}
