import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Button, Input, Textarea, Label, Switch, Tabs, TabsList, TabsTrigger, TabsContent, Separator, Avatar, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "prui/core"
import { useState } from "react"
import { buttonPropsMeta, inputPropsMeta, switchPropsMeta, tabsPropsMeta, badgePropsMeta, dialogPropsMeta, selectPropsMeta } from "prui/core"
import type { PropsMeta } from "prui/core"

function MetaTable({ meta }: { meta: PropsMeta }) {
  return (
    <div className="overflow-x-auto rounded-[var(--prui-radius)] border border-[var(--prui-line)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--prui-line)] bg-[var(--prui-raise)] text-left">
            <th className="px-3 py-2 text-xs font-medium uppercase text-[var(--prui-dim)]">Prop</th>
            <th className="px-3 py-2 text-xs font-medium uppercase text-[var(--prui-dim)]">Type</th>
            <th className="px-3 py-2 text-xs font-medium uppercase text-[var(--prui-dim)]">Default</th>
          </tr>
        </thead>
        <tbody>
          {meta.props.map((p) => (
            <tr key={p.name} className="border-b border-[var(--prui-line)] last:border-0">
              <td className="px-3 py-2 font-mono text-xs text-[var(--prui-brand)]">{p.name}</td>
              <td className="px-3 py-2 font-mono text-xs text-[var(--prui-dim)]">{p.type}</td>
              <td className="px-3 py-2 font-mono text-xs text-[var(--prui-dim)]">{String(p.default)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Demo({ title, meta, children }: { title: string; meta?: PropsMeta; children: React.ReactNode }) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-[var(--prui-radius)] border border-dashed border-[var(--prui-line)] p-4">
          {children}
        </div>
        {meta ? <MetaTable meta={meta} /> : null}
      </CardContent>
    </Card>
  )
}

export function ComponentsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectVal, setSelectVal] = useState("")

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-2xl font-bold text-[var(--prui-fg)]">Components</h1>
      <p className="mb-8 text-sm text-[var(--prui-dim)]">
        Live demos with props tables generated from each component's propsMeta declaration.
      </p>

      <Demo title="Button" meta={buttonPropsMeta}>
        <Button variant="primary">Primary</Button>
        <Button variant="default">Default</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
        <Button loading>Loading</Button>
      </Demo>

      <Demo title="Input & Textarea" meta={inputPropsMeta}>
        <div className="w-64">
          <Label className="mb-1.5">Email</Label>
          <Input placeholder="you@example.com" />
        </div>
        <div className="w-64">
          <Label className="mb-1.5">Bio</Label>
          <Textarea rows={2} placeholder="A few words" />
        </div>
      </Demo>

      <Demo title="Select" meta={selectPropsMeta}>
        <div className="w-48">
          <Select value={selectVal} onChange={setSelectVal} options={[{ label: "Active", value: "active" }, { label: "On leave", value: "leave" }]} />
        </div>
      </Demo>

      <Demo title="Switch" meta={switchPropsMeta}>
        <Switch aria-label="Demo switch" />
        <Switch checked aria-label="On switch" />
        <Switch disabled aria-label="Disabled switch" />
      </Demo>

      <Demo title="Tabs" meta={tabsPropsMeta}>
        <Tabs defaultValue="one">
          <TabsList>
            <TabsTrigger value="one">Overview</TabsTrigger>
            <TabsTrigger value="two">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="one">Overview content</TabsContent>
          <TabsContent value="two">Settings content</TabsContent>
        </Tabs>
      </Demo>

      <Demo title="Badge" meta={badgePropsMeta}>
        <Badge>default</Badge>
        <Badge variant="brand">brand</Badge>
        <Badge variant="ok">ok</Badge>
        <Badge variant="warn">warn</Badge>
        <Badge variant="danger">danger</Badge>
        <Badge variant="outline">outline</Badge>
      </Demo>

      <Demo title="Dialog" meta={dialogPropsMeta}>
        <Button onClick={() => setDialogOpen(true)}>Open dialog</Button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Confirm action</DialogTitle>
              <DialogDescription>This action cannot be undone.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => setDialogOpen(false)}>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Demo>

      <Demo title="Avatar & Separator">
        <Avatar alt="Ada Lovelace" />
        <Separator orientation="vertical" className="h-8" />
        <span className="text-sm text-[var(--prui-dim)]">Ada Lovelace</span>
      </Demo>
    </div>
  )
}
