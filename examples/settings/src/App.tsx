import * as React from "react"
import { Routes, Route } from "react-router-dom"
import { App, type NavItem } from "@skiddph/prui/app"
import {
  Button, Input, InputGroup, Select, Switch, TagInput, Badge, Card, CardHeader, CardTitle, CardContent,
  Avatar, Separator, Timeline, Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter,
  confirmModal, toast, Toaster,
} from "@skiddph/prui/core"
import { Building2, Users, Bell, Shield, ScrollText, Copy, Trash2 } from "lucide-react"
import { Gate, UserMenuSlot } from "./auth"
import { useLocal, writeLocal } from "./store"

/* ------------------------------- model ------------------------------- */

interface Member {
  id: string
  name: string
  email: string
  role: "owner" | "admin" | "member"
}

interface ApiKey {
  id: string
  label: string
  prefix: string
  createdAt: string
  lastUsed?: string
}

interface AuditEntry {
  id: string
  at: string
  actor: string
  text: string
}

interface Settings {
  workspace: string
  region: string
  allowSignup: boolean
  budget: string
  billingEmail: string
  digest: "off" | "daily" | "weekly"
  notify: Record<string, boolean>
  twoFactor: boolean
}

const seedMembers = (): Member[] => [
  { id: "1", name: "Ada Lovelace", email: "ada@acme.io", role: "owner" },
  { id: "2", name: "Grace Hopper", email: "grace@acme.io", role: "admin" },
  { id: "3", name: "Linus Torvalds", email: "linus@acme.io", role: "member" },
]

const seedKeys = (): ApiKey[] => [
  { id: "k1", label: "CI deploys", prefix: "sk_live_7f2a", createdAt: "2026-08-02", lastUsed: "2026-09-12" },
  { id: "k2", label: "Zapier", prefix: "sk_live_b91c", createdAt: "2026-06-18" },
]

const seedSettings = (): Settings => ({
  workspace: "Acme production",
  region: "eu",
  allowSignup: false,
  budget: "1200",
  billingEmail: "finance@acme.io",
  digest: "weekly",
  notify: { invites: true, leave: true, sla: false, billing: true, security: true },
  twoFactor: true,
})

const seedAudit = (): AuditEntry[] => [
  { id: "a1", at: new Date(Date.now() - 86400000).toISOString(), actor: "Ada Lovelace", text: "Workspace created" },
  { id: "a2", at: new Date(Date.now() - 3600000).toISOString(), actor: "Grace Hopper", text: "API key \u201cCI deploys\u201d created" },
]

const KEYS = { members: "ws.members", keys: "ws.keys", audit: "ws.audit", settings: "ws.settings" }

const audit = (actor: string, text: string) =>
  writeLocal<AuditEntry[]>(KEYS.audit, (prev) => [{ id: String(Date.now()), at: new Date().toISOString(), actor, text }, ...prev].slice(0, 80), seedAudit)

const emailish = (v: string) => /.+@.+\..+/.test(v)

/* ------------------------------- general ------------------------------ */

function General() {
  const [settings, setSettings] = useLocal<Settings>(KEYS.settings, seedSettings)

  const patch = (part: Partial<Settings>, note?: string) => {
    setSettings((prev) => ({ ...prev, ...part }))
    if (note) {
      audit("you", note)
      toast({ title: "Saved", description: note, variant: "success" })
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <h1>General</h1>
        <p>Everything on this page writes straight to localStorage. A bad budget stays editable in the field.</p>
      </div>

      <Card className="max-w-md">
        <CardHeader><CardTitle className="text-sm">Workspace</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Input label="Workspace name" value={settings.workspace} onChange={(e) => patch({ workspace: e.target.value })} helperText="Shown to every member." />
          <Select
            label="Data region"
            value={settings.region}
            onChange={(v) => patch({ region: String(v) }, `Region set to ${v}`)}
            helperText="Data never leaves the region."
            options={[
              { label: "European Union (eu)", value: "eu" },
              { label: "United States (us)", value: "us" },
              { label: "Asia Pacific (apac)", value: "apac" },
            ]}
          />
          <div className="flex min-h-[1rem] items-center justify-between gap-4 text-sm">
            <span>Allow anyone with an acme.io email to join</span>
            <Switch
              checked={settings.allowSignup}
              onChange={(v) => patch({ allowSignup: v }, v ? "Domain signup enabled" : "Domain signup disabled")}
              aria-label="Allow domain signup"
            />
          </div>
          <InputGroup
            label="Monthly budget"
            leading="$"
            value={settings.budget}
            onChange={(e) => patch({ budget: e.target.value })}
            helperText={/^\d*$/.test(settings.budget) ? "We alert you at 80%." : "Numbers only."}
            error={!/^\d*$/.test(settings.budget)}
          />
          <Input
            label="Billing email"
            type="email"
            value={settings.billingEmail}
            onChange={(e) => patch({ billingEmail: e.target.value })}
            helperText={emailish(settings.billingEmail) ? "Invoices are sent here." : "That does not look like an email."}
            error={!emailish(settings.billingEmail)}
          />
        </CardContent>
      </Card>
    </div>
  )
}

/* ------------------------------- members ------------------------------ */

function Members() {
  const [members, setMembers] = useLocal<Member[]>(KEYS.members, seedMembers)
  const [invitees, setInvitees] = React.useState<string[]>([])
  const [removing, setRemoving] = React.useState<Member | null>(null)
  const valid = invitees.length > 0 && invitees.every(emailish)

  return (
    <div className="page">
      <div className="page-head">
        <h1>Members</h1>
        <p>Invite with the tag field — invalid emails stay editable instead of committing. Roles change inline; removals confirm.</p>
      </div>

      <Card className="max-w-lg">
        <CardHeader><CardTitle className="text-sm">Invite</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3">
          <TagInput
            label="Invite by email"
            value={invitees}
            onChange={setInvitees}
            placeholder="name@acme.io…"
            validate={emailish}
            helperText="Committed on comma. Invalid addresses stay in the field."
          />
          <div>
            <Button
              variant="primary"
              disabled={!valid}
              onClick={() => {
                setMembers((prev) => [
                  ...prev,
                  ...invitees.map((email, i) => ({
                    id: String(Date.now() + i),
                    name: email.split("@")[0]!.replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
                    email,
                    role: "member" as const,
                  })),
                ])
                invitees.forEach((e) => audit("you", `Invited ${e}`))
                toast({ title: `${invitees.length} invite(s) sent`, variant: "success" })
                setInvitees([])
              }}
            >
              Send invites
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">{members.length} members</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3">
          {members.map((m) => (
            <div key={m.id} className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar fallback={m.name} />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{m.name}</div>
                  <div className="truncate text-xs text-[var(--prui-dim)]">{m.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={m.role === "owner" ? "brand" : m.role === "admin" ? "ok" : undefined}>{m.role}</Badge>
                {m.role !== "owner" ? (
                  <>
                    <Select
                      aria-label={`Role for ${m.name}`}
                      value={m.role}
                      onChange={(v) => {
                        const role = v as Member["role"]
                        setMembers((prev) => prev.map((x) => (x.id === m.id ? { ...x, role } : x)))
                        audit("you", `${m.name} is now ${role}`)
                      }}
                      options={[
                        { label: "Admin", value: "admin" },
                        { label: "Member", value: "member" },
                      ]}
                    />
                    <Button size="sm" variant="ghost" aria-label={`Remove ${m.name}`} onClick={() => setRemoving(m)}>
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={!!removing} onOpenChange={(o) => (!o ? setRemoving(null) : undefined)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Remove {removing?.name}?</DialogTitle></DialogHeader>
          <DialogBody><p className="text-sm text-[var(--prui-dim)]">They lose access immediately; the audit trail keeps the record.</p></DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRemoving(null)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={() => {
                if (!removing) return
                setMembers((prev) => prev.filter((x) => x.id !== removing.id))
                audit("you", `Removed ${removing.name}`)
                setRemoving(null)
                toast({ title: `${removing.name} removed`, variant: "danger" })
              }}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ---------------------------- notifications ---------------------------- */

const NOTIFY_ROWS = [
  { key: "invites", label: "Member invites", hint: "When someone joins or is invited" },
  { key: "leave", label: "Leave requests", hint: "New requests and decisions" },
  { key: "sla", label: "SLA warnings", hint: "A ticket crosses 75% of its budget" },
  { key: "billing", label: "Billing", hint: "Invoices and budget alerts" },
  { key: "security", label: "Security", hint: "New API keys, sign-ins" },
] as const

function Notifications() {
  const [settings, setSettings] = useLocal<Settings>(KEYS.settings, seedSettings)

  return (
    <div className="page">
      <div className="page-head">
        <h1>Notifications</h1>
        <p>A per-event matrix with a digest selector. Every toggle persists and lands in the audit log.</p>
      </div>

      <Card className="max-w-lg">
        <CardHeader><CardTitle className="text-sm">Email notifications</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          {NOTIFY_ROWS.map((row) => (
            <div key={row.key} className="flex min-h-[1rem] items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-sm">{row.label}</div>
                <div className="text-xs text-[var(--prui-dim)]">{row.hint}</div>
              </div>
              <Switch
                checked={settings.notify[row.key] ?? false}
                onChange={(v) => {
                  setSettings((prev) => ({ ...prev, notify: { ...prev.notify, [row.key]: v } }))
                  audit("you", `${row.label} notifications ${v ? "on" : "off"}`)
                }}
                aria-label={row.label}
              />
            </div>
          ))}
          <Separator />
          <Select
            label="Digest"
            value={settings.digest}
            onChange={(v) => {
              setSettings((prev) => ({ ...prev, digest: v as Settings["digest"] }))
              audit("you", `Digest set to ${v}`)
            }}
            helperText="One email bundling everything you left on."
            options={[
              { label: "Off", value: "off" },
              { label: "Daily", value: "daily" },
              { label: "Weekly", value: "weekly" },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  )
}

/* ------------------------------ security ------------------------------ */

function Security() {
  const [keys, setKeys] = useLocal<ApiKey[]>(KEYS.keys, seedKeys)
  const [settings, setSettings] = useLocal<Settings>(KEYS.settings, seedSettings)
  const [label, setLabel] = React.useState("")
  const [freshKey, setFreshKey] = React.useState<string | null>(null)
  const [password, setPassword] = React.useState("")

  const createKey = () => {
    const secret = `sk_live_${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 14)}`
    const entry: ApiKey = { id: String(Date.now()), label: label.trim() || "Untitled key", prefix: secret.slice(0, 14), createdAt: new Date().toISOString().slice(0, 10) }
    setKeys((prev) => [...prev, entry])
    audit("you", `API key \u201c${entry.label}\u201d created`)
    setFreshKey(secret)
    setLabel("")
  }

  return (
    <div className="page">
      <div className="page-head">
        <h1>Security</h1>
        <p>API keys shown once at creation (copy toast), a password field with the eye toggle, 2FA, and a danger zone.</p>
      </div>

      <div className="two-col">
        <Card>
          <CardHeader><CardTitle className="text-sm">API keys</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-wrap items-end gap-2">
              <Input label="Key label" helperText=" " value={label} onChange={(e) => setLabel(e.target.value)} placeholder="CI deploys" />
              <Button variant="primary" onClick={createKey}>Create key</Button>
            </div>
            <Separator />
            {keys.map((k) => (
              <div key={k.id} className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{k.label}</div>
                  <div className="font-mono text-xs text-[var(--prui-dim)]">{k.prefix}•••• · created {k.createdAt}{k.lastUsed ? ` · last used ${k.lastUsed}` : " · never used"}</div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    const ok = await confirmModal({ title: `Revoke ${k.label}?`, message: "Anything using this key stops working immediately.", type: "danger" })
                    if (!ok) return
                    setKeys((prev) => prev.filter((x) => x.id !== k.id))
                    audit("you", `API key \u201c${k.label}\u201d revoked`)
                    toast({ title: `${k.label} revoked`, variant: "danger" })
                  }}
                >
                  Revoke
                </Button>
              </div>
            ))}
            {keys.length === 0 ? <p className="text-xs text-[var(--prui-dim)]">No keys. Create one to see the shown-once flow.</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Access</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex min-h-[1rem] items-center justify-between gap-4 text-sm">
              <span>Require two-factor authentication</span>
              <Switch
                checked={settings.twoFactor}
                onChange={(v) => {
                  setSettings((prev) => ({ ...prev, twoFactor: v }))
                  audit("you", `2FA ${v ? "required" : "optional"}`)
                }}
                aria-label="Require two-factor"
              />
            </div>
            <Separator />
            <Input
              type="password"
              label="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText={password.length >= 8 ? "Looks good." : "8+ characters."}
              error={password.length > 0 && password.length < 8}
            />
            <div>
              <Button
                size="sm"
                disabled={password.length < 8}
                onClick={() => {
                  audit("you", "Password changed")
                  toast({ title: "Password updated", variant: "success" })
                  setPassword("")
                }}
              >
                Update password
              </Button>
            </div>
            <Separator />
            <Button
              variant="danger"
              onClick={async () => {
                const ok = await confirmModal({ title: "Reset workspace data?", message: "Wipes every stored member, key, setting, and audit entry in this browser.", type: "danger" })
                if (!ok) return
                localStorage.clear()
                location.reload()
              }}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden /> Reset workspace data
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!freshKey} onOpenChange={(o) => (!o ? setFreshKey(null) : undefined)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Copy your key now</DialogTitle></DialogHeader>
          <DialogBody>
            <p className="mb-2 text-sm text-[var(--prui-dim)]">This is the only time the full key is shown — the store keeps just the prefix.</p>
            <pre className="overflow-x-auto rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-background)] p-3 font-mono text-xs">{freshKey}</pre>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="primary"
              onClick={() => {
                navigator.clipboard?.writeText(freshKey ?? "").catch(() => {})
                setFreshKey(null)
                toast({ title: "Key copied to clipboard", variant: "success" })
              }}
            >
              <Copy className="h-3.5 w-3.5" aria-hidden /> Copy and close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* -------------------------------- audit -------------------------------- */

function Audit() {
  const [entries] = useLocal<AuditEntry[]>(KEYS.audit, seedAudit)

  return (
    <div className="page">
      <div className="page-head">
        <h1>Audit log</h1>
        <p>Every action on the other pages appends here — reload the browser, it survives.</p>
      </div>
      <Card className="max-w-xl">
        <CardContent className="pt-5">
          <Timeline items={entries.map((e) => ({ title: e.text, time: `${e.actor} · ${new Date(e.at).toLocaleString()}` }))} />
        </CardContent>
      </Card>
    </div>
  )
}

/* ------------------------------- shell ------------------------------- */

const nav: NavItem[] = [
  { label: "General", href: "/", icon: Building2 },
  { label: "Members", href: "/members", icon: Users },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Security", href: "/security", icon: Shield },
  { label: "Audit", href: "/audit", icon: ScrollText },
]

function Shell() {
  return (
    <App header={<UserMenuSlot />}
      brand={{ name: "Acme / production" }} nav={nav} search={{ enabled: true, hotkey: "/" }} theme={false}>
      <Routes>
        <Route path="/" element={<General />} />
        <Route path="/members" element={<Members />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/security" element={<Security />} />
        <Route path="/audit" element={<Audit />} />
      </Routes>
      <Toaster />
    </App>
  )
}

export default function AppShell() {
  return (
    <Gate brand={{ name: "Acme / production" }}>
      <Shell />
    </Gate>
  )
}
