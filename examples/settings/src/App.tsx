import * as React from "react"
import { App, type NavItem } from "@skiddph/prui/app"
import {
  Button, Input, InputGroup, Select, Switch, TagInput, Tabs, TabsList, TabsTrigger, TabsContent,
  toast, Toaster, Separator,
} from "@skiddph/prui/core"
import { Building2, Users, Bell, Shield } from "lucide-react"
import { Routes, Route } from "react-router-dom"

const nav: NavItem[] = [
  { label: "Workspace", href: "/", icon: Building2 },
  { label: "Members", href: "/members", icon: Users },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Security", href: "/security", icon: Shield },
]

function Field({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 420 }}>{children}</div>
}

function WorkspaceSettings() {
  const [name, setName] = React.useState("Acme production")
  const [region, setRegion] = React.useState("eu")
  const [admins, setAdmins] = React.useState<string[]>(["Ada Lovelace <ada@acme.io>"])
  const [budget, setBudget] = React.useState("1200")
  const [allowSignup, setAllowSignup] = React.useState(false)

  return (
    <div className="page">
      <div className="page-head">
        <h1>Workspace</h1>
        <p>Settings over the FormField slot system: labeled inputs, switch, admin TagInput, and an InputGroup budget.</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="access">Access</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Field>
            <Input label="Workspace name" value={name} onChange={(e) => setName(e.target.value)} helperText="Shown to every member." />
            <Select
              label="Data region"
              value={region}
              onChange={(v) => setRegion(String(v))}
              options={[
                { label: "European Union (eu)", value: "eu" },
                { label: "United States (us)", value: "us" },
                { label: "Asia Pacific (apac)", value: "apac" },
              ]}
              helperText="Data never leaves the region."
            />
            <div className="prui-label" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              Allow anyone with an acme.io email to join
              <Switch checked={allowSignup} onChange={setAllowSignup} aria-label="Allow domain signup" />
            </div>
          </Field>
        </TabsContent>

        <TabsContent value="access">
          <Field>
            <TagInput
              label="Workspace admins"
              value={admins}
              onChange={setAdmins}
              placeholder="Name <email>…"
              labelFor={(t) => t.replace(/\s*<.*$/, "")}
              helperText="Chips show the name; values keep Name <email>."
            />
            <Input label="Audit log webhook" placeholder="https://" helperText="POSTed on every permission change." />
          </Field>
        </TabsContent>

        <TabsContent value="billing">
          <Field>
            <InputGroup
              label="Monthly budget"
              leading="$"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              helperText="We alert you at 80%."
            />
            <Separator />
            <Input label="Billing email" type="email" defaultValue="finance@acme.io" helperText="Invoices are sent here." />
          </Field>
        </TabsContent>
      </Tabs>

      <div style={{ display: "flex", gap: 8 }}>
        <Button
          variant="primary"
          onClick={() => toast({ title: "Settings saved", description: `${name} · region ${region}`, variant: "success" })}
        >
          Save changes
        </Button>
        <Button variant="ghost" onClick={() => toast({ title: "Reverted to last saved", variant: "neutral" })}>
          Discard
        </Button>
      </div>

      <Toaster />
    </div>
  )
}

export default function AppShell() {
  return (
    <App
      brand={{ name: "Acme / production" }}
      nav={nav}
      theme={false}
    >
      <Routes>
        <Route path="/" element={<WorkspaceSettings />} />
        <Route path="/members" element={<WorkspaceSettings />} />
        <Route path="/notifications" element={<WorkspaceSettings />} />
        <Route path="/security" element={<WorkspaceSettings />} />
      </Routes>
    </App>
  )
}
