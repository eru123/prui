import * as React from "react"
import {
  Button,
  buttonPropsMeta,
  Input,
  inputPropsMeta,
  Switch,
  switchPropsMeta,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  tabsPropsMeta,
  Badge,
  badgePropsMeta,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  dialogPropsMeta,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardPropsMeta,
} from "prui/core"
import { StatRow, statRowPropsMeta } from "prui/app"
import { appPropsMeta, resourcePropsMeta } from "prui/app"
import { dataTablePropsMeta } from "prui/data-table"
import { Playground, MetaOnly } from "../components/Playground"
import { TocRail } from "../components/TocRail"

const COMPONENTS_TOC = [
  { id: "button", label: "Button" },
  { id: "input", label: "Input" },
  { id: "switch", label: "Switch" },
  { id: "tabs", label: "Tabs" },
  { id: "badge", label: "Badge" },
  { id: "card", label: "Card" },
  { id: "dialog", label: "Dialog" },
  { id: "app", label: "App" },
  { id: "resource", label: "Resource" },
  { id: "data-table", label: "DataTable" },
  { id: "statrow", label: "StatRow" },
]

export function ComponentsPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1080px] justify-center gap-6 px-4 pb-20 pt-8 md:px-6">
      <div className="min-w-0 max-w-[780px] flex-1">
      <div className="mb-2 font-mono text-xs text-[var(--prui-dim)]">components / catalog</div>
      <h1 className="mb-1.5 text-[27px] font-bold tracking-tight text-[var(--prui-fg)]">Components</h1>
      <p className="mb-8 max-w-[60ch] text-[15px] text-[var(--prui-dim)]">
        Both layers, live. Every demo has a control panel generated from the same propsMeta that renders the props
        table and the snippet: configure it, copy it. In-depth pages live under each component in the sidebar; the
        super-components are documented in the <a href="/app-layer" className="text-[var(--prui-brand)] underline hover:underline">app layer</a>{" "}
        and <a href="/pages-doc" className="text-[var(--prui-brand)] underline hover:underline">pre-made pages</a> catalogs.
      </p>

      <Playground title="Button" meta={buttonPropsMeta} render={(v) => (
        <Button variant={v.variant as never} size={v.size as never} loading={Boolean(v.loading)} disabled={Boolean(v.disabled)}>
          {String(v.children || "Save changes")}
        </Button>
      )} />

      <Playground title="Input" meta={inputPropsMeta} defaults={{ placeholder: "Search employees" }} render={(v) => (
        <Input type={v.type as never} placeholder={String(v.placeholder || "")} disabled={Boolean(v.disabled)} className="w-56" />
      )} />

      <Playground title="Switch" meta={switchPropsMeta} defaults={{ defaultChecked: true }} render={(v) => (
        <Switch checked={Boolean(v.defaultChecked)} onChange={() => {}} aria-label="Demo switch" />
      )} />

      <Playground title="Tabs" meta={tabsPropsMeta} render={() => (
        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
          </TabsList>
          <TabsContent value="details">Detail content</TabsContent>
          <TabsContent value="activity">Activity content</TabsContent>
        </Tabs>
      )} />

      <Playground title="Badge" meta={badgePropsMeta} render={(v) => (
        <Badge variant={v.variant as never}>{String(v.children || "active")}</Badge>
      )} />

      <Playground title="Card" meta={cardPropsMeta} render={() => (
        <Card className="w-72">
          <CardHeader>
            <CardTitle>Card title</CardTitle>
            <CardDescription>Supporting description text</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-[var(--prui-dim)]">Card body content.</CardContent>
          <CardFooter className="justify-end gap-2">
            <Button variant="ghost" size="sm">Cancel</Button>
            <Button variant="primary" size="sm">Save</Button>
          </CardFooter>
        </Card>
      )} />

      <DialogDemo />

      <section id="app" className="mb-8 scroll-mt-20">
        <h2 className="mb-3 font-mono text-sm font-semibold text-[var(--prui-brand)]">App</h2>
        <p className="mb-3 text-sm text-[var(--prui-dim)]">
          The shell around this very site is <code className="rounded bg-[var(--prui-raise)] px-1">&lt;App&gt;</code>: sidebar groups,
          command palette (<kbd className="rounded border border-[var(--prui-line)] px-1 text-xs">/</kbd>), theme toggle, mobile drawer.
          Try the search bar above.
        </p>
        <MetaOnly meta={appPropsMeta} />
      </section>

      <section id="resource" className="mb-8 scroll-mt-20">
        <h2 className="mb-3 font-mono text-sm font-semibold text-[var(--prui-brand)]">Resource</h2>
        <p className="mb-3 text-sm text-[var(--prui-dim)]">
          A complete CRUD screen from a column config: see it live on the <a href="/resources" className="text-[var(--prui-brand)] hover:underline">Resources demo page</a>.
        </p>
        <MetaOnly meta={resourcePropsMeta} />
      </section>

      <section id="data-table" className="mb-8 scroll-mt-20">
        <h2 className="mb-3 font-mono text-sm font-semibold text-[var(--prui-brand)]">DataTable</h2>
        <p className="mb-3 text-sm text-[var(--prui-dim)]">Column config, sorting, loading/empty states: feeds &lt;Resource&gt;.</p>
        <MetaOnly meta={dataTablePropsMeta} />
      </section>

      <Playground title="StatRow" meta={statRowPropsMeta} render={() => (
        <div className="w-full">
          <StatRow
            items={[
              { label: "Users", value: 1204, delta: "+12%", trend: "up" },
              { label: "Sessions", value: 8921, delta: "+3%", trend: "up" },
              { label: "Churn", value: "1.2%", delta: "-0.2%", trend: "down" },
            ]}
          />
        </div>
      )} />
      </div>

      <TocRail items={COMPONENTS_TOC} />
    </div>
  )
}

function DialogDemo() {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Playground
        title="Dialog"
        meta={dialogPropsMeta}
        defaults={{ open: false }}
        render={(v) => (
          <>
            <Button variant="default" onClick={() => setOpen(true)}>Open dialog</Button>
            <Dialog open={open || Boolean(v.open)} onOpenChange={setOpen}>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Confirm action</DialogTitle>
                  <DialogDescription>This action cannot be undone.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button variant="primary" onClick={() => setOpen(false)}>Confirm</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      />
    </>
  )
}
