import * as React from "react"
import { Routes, Route } from "react-router-dom"
import { App, Resource, StatRow, type ResourceRow, type NavItem } from "@skiddph/prui/app"
import {
  Button, Badge, Card, CardContent, Avatar, Separator, Textarea, Select, Input,
  Progress, Timeline, Drawer, Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter,
  confirmModal, toast, Toaster, Breadcrumb, BreadcrumbItem,
} from "@skiddph/prui/core"
import { Inbox, Clock, CheckCircle2, Building2, AlertTriangle, UserCircle } from "lucide-react"
import { Gate, SidebarUserMenu, ProfilePage } from "./auth"
import { useLocal, readLocal, writeLocal } from "./store"

/* ------------------------------- model ------------------------------- */

type Priority = "low" | "normal" | "urgent"
type Status = "open" | "pending" | "resolved"

interface Ticket extends ResourceRow {
  id: string
  subject: string
  customer: string
  priority: Priority
  status: Status
  opened: string
  assignee: string
  slaHours: number
  notes: { at: string; author: string; text: string }[]
}

interface Customer {
  id: string
  name: string
  plan: "free" | "pro" | "enterprise"
  contact: string
}

const seedTickets = (): Ticket[] => [
  { id: "T-101", subject: "Cannot export payroll report", customer: "Acme Corp", priority: "urgent", status: "open", opened: "2026-09-12", assignee: "Ada", slaHours: 4, notes: [{ at: "2026-09-12T09:00:00Z", author: "Grace", text: "Affects week-old exports only." }] },
  { id: "T-102", subject: "SSO login loop on Safari", customer: "Globex", priority: "normal", status: "open", opened: "2026-09-12", assignee: "", slaHours: 24, notes: [] },
  { id: "T-103", subject: "Add second seat to workspace", customer: "Initech", priority: "low", status: "pending", opened: "2026-09-11", assignee: "Linus", slaHours: 72, notes: [] },
  { id: "T-104", subject: "Invoice PDF shows wrong VAT", customer: "Umbrella", priority: "urgent", status: "open", opened: "2026-09-11", assignee: "", slaHours: 4, notes: [] },
  { id: "T-105", subject: "Bulk import fails on CSV over 10MB", customer: "Acme Corp", priority: "normal", status: "pending", opened: "2026-09-10", assignee: "Ada", slaHours: 24, notes: [] },
  { id: "T-106", subject: "Dark mode contrast on badges", customer: "Stark Ind.", priority: "low", status: "resolved", opened: "2026-09-09", assignee: "Grace", slaHours: 72, notes: [] },
  { id: "T-107", subject: "Webhook retries too aggressively", customer: "Globex", priority: "normal", status: "resolved", opened: "2026-09-08", assignee: "Linus", slaHours: 24, notes: [] },
]

const seedCustomers = (): Customer[] => [
  { id: "C1", name: "Acme Corp", plan: "enterprise", contact: "ops@acme.io" },
  { id: "C2", name: "Globex", plan: "pro", contact: "it@globex.io" },
  { id: "C3", name: "Initech", plan: "free", contact: "admin@initech.io" },
  { id: "C4", name: "Umbrella", plan: "pro", contact: "help@umbrella.io" },
  { id: "C5", name: "Stark Ind.", plan: "enterprise", contact: "team@stark.io" },
]

const KEYS = { tickets: "hd.tickets", customers: "hd.customers" }

const priorityOptions = [
  { label: "Urgent", value: "urgent" },
  { label: "Normal", value: "normal" },
  { label: "Low", value: "low" },
]
const statusOptions = [
  { label: "Open", value: "open" },
  { label: "Pending", value: "pending" },
  { label: "Resolved", value: "resolved" },
]
const assignees = ["Ada", "Grace", "Linus"]

const ticketsOf = () => readLocal<Ticket[]>(KEYS.tickets, seedTickets)
const customersOf = () => readLocal<Customer[]>(KEYS.customers, seedCustomers)

const priorityBadge = (p: Priority) =>
  p === "urgent" ? <Badge variant="danger">{p}</Badge> : p === "normal" ? <Badge>{p}</Badge> : <Badge variant="brand">{p}</Badge>

type Patch = (id: string, values: Partial<Ticket>, message?: string) => void

/* ------------------------------- inbox ------------------------------- */

function SupportInbox({ resolvedView = false }: { resolvedView?: boolean }) {
  const [, setTickets] = useLocal<Ticket[]>(KEYS.tickets, seedTickets)

  const patch: Patch = (id, values, message) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...values } : t)))
    if (message) toast({ title: message, variant: "success" })
  }

  const view = () => ticketsOf().filter((t) => (resolvedView ? t.status === "resolved" : true))

  return (
    <div className="page">
      <div className="page-head">
        <h1>{resolvedView ? "Resolved archive" : "Support inbox"}</h1>
        <p>
          {resolvedView
            ? "Everything resolved, with a confirmed bulk clear."
            : "Search, customer and priority facets, opened date range, sort. Expand a row to work the ticket inline."}
        </p>
      </div>

      {!resolvedView ? (
        <StatRow
          items={[
            { label: "Open", value: ticketsOf().filter((t) => t.status === "open").length, icon: Inbox, trend: "flat" },
            { label: "Urgent", value: ticketsOf().filter((t) => t.priority === "urgent" && t.status !== "resolved").length, icon: AlertTriangle, trend: "down" },
            { label: "Pending", value: ticketsOf().filter((t) => t.status === "pending").length, icon: Clock, trend: "flat" },
            { label: "Resolved", value: ticketsOf().filter((t) => t.status === "resolved").length, icon: CheckCircle2, trend: "up" },
          ]}
        />
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="danger"
            disabled={view().length === 0}
            onClick={async () => {
              const ok = await confirmModal({ title: "Clear resolved?", message: `Removes ${view().length} resolved tickets from the store.`, type: "danger" })
              if (!ok) return
              setTickets((prev) => prev.filter((t) => t.status !== "resolved"))
              toast({ title: "Archive cleared", variant: "neutral" })
            }}
          >
            Clear resolved
          </Button>
        </div>
      )}

      <Resource<Ticket>
        name={resolvedView ? "resolved" : "tickets"}
        rowKey={(r) => r.id}
        pageSize={10}
        columns={[
          { key: "id", label: "Ticket", sortable: true },
          { key: "subject", label: "Subject" },
          {
            key: "customer",
            label: "Customer",
            filter: "select",
            options: customersOf().map((c) => ({ label: c.name, value: c.name })),
          },
          { key: "priority", label: "Priority", filter: "select", options: priorityOptions, render: (r) => priorityBadge(r.priority) },
          {
            key: "status",
            label: "Status",
            render: (r) => <Badge variant={r.status === "open" ? "warn" : r.status === "pending" ? "brand" : "ok"}>{r.status}</Badge>,
          },
          { key: "opened", label: "Opened", sortable: true, filter: "daterange" },
        ]}
        actions={resolvedView ? [] : ["create"]}
        renderExpandedRow={(r) => <TicketPanel ticketId={r.id} onPatch={patch} />}
        list={async (q) => {
          await new Promise((r) => setTimeout(r, 100))
          let rows = [...view()]
          if (q.search) {
            const s = q.search.toLowerCase()
            rows = rows.filter((t) => `${t.subject} ${t.customer} ${t.id} ${t.assignee}`.toLowerCase().includes(s))
          }
          for (const key of ["customer", "priority"] as const) {
            const vals = q.filters?.[key] as string[] | undefined
            if (vals?.length) rows = rows.filter((t) => vals.includes(String(t[key])))
          }
          const dr = q.filters?.["opened"] as { from?: string; to?: string } | undefined
          if (dr?.from) rows = rows.filter((t) => t.opened >= dr.from!)
          if (dr?.to) rows = rows.filter((t) => t.opened <= dr.to!)
          if (q.sort) {
            const dir = q.sort.direction === "asc" ? 1 : -1
            rows.sort((a, b) => {
              const av = a[q.sort!.key]!
              const bv = b[q.sort!.key]!
              return (av > bv ? 1 : av < bv ? -1 : 0) * dir
            })
          }
          const size = q.pageSize ?? 10
          const start = q.cursor ? Number(q.cursor) : 0
          const page = rows.slice(start, start + size)
          return { rows: page, nextCursor: start + size < rows.length ? String(start + size) : null }
        }}
        create={async (values) => {
          const customers = customersOf()
          setTickets((prev) => [
            {
              id: `T-${100 + prev.length + 1}`,
              subject: String(values.subject ?? "New ticket"),
              customer: String(values.customer ?? customers[0]?.name ?? "Acme Corp"),
              priority: (values.priority as Priority) ?? "normal",
              status: "open",
              opened: new Date().toISOString().slice(0, 10),
              assignee: "",
              slaHours: 24,
              notes: [],
            },
            ...prev,
          ])
          toast({ title: "Ticket created", variant: "success" })
        }}
      />
    </div>
  )
}

/* --------------------------- ticket widgets --------------------------- */

function TicketPanel({ ticketId, onPatch }: { ticketId: string; onPatch: Patch }) {
  const [tickets] = useLocal<Ticket[]>(KEYS.tickets, seedTickets)
  const [note, setNote] = React.useState("")
  const ticket = tickets.find((t) => t.id === ticketId)
  if (!ticket) return null
  return (
    <div className="flex flex-col gap-3 p-1 md:flex-row md:items-end md:flex-wrap">
      <Select label="Assignee" helperText=" " value={ticket.assignee} onChange={(v) => onPatch(ticket.id, { assignee: String(v) }, `${ticket.id} assigned`)} options={assignees.map((a) => ({ label: a, value: a }))} />
      <Select label="Priority" helperText=" " value={ticket.priority} onChange={(v) => onPatch(ticket.id, { priority: v as Priority }, `${ticket.id} priority ${v}`)} options={priorityOptions} />
      <Select label="Status" helperText=" " value={ticket.status} onChange={(v) => onPatch(ticket.id, { status: v as Status }, `${ticket.id} ${v}`)} options={statusOptions} />
      <div className="flex min-w-56 flex-col gap-1">
        <span className="prui-label text-sm font-medium">Add note</span>
        <Textarea
          aria-label="Note"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Internal note — Enter saves"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && note.trim()) {
              e.preventDefault()
              onPatch(ticket.id, { notes: [...ticket.notes, { at: new Date().toISOString(), author: "you", text: note.trim() }] }, "Note added")
              setNote("")
            }
          }}
        />
      </div>
    </div>
  )
}

/* -------------------------------- SLA -------------------------------- */

function Sla() {
  const [tickets] = useLocal<Ticket[]>(KEYS.tickets, seedTickets)
  const live = tickets.filter((t) => t.status !== "resolved")

  return (
    <div className="page">
      <div className="page-head">
        <h1>SLA watch</h1>
        <p>Urgent first. Each budget bar is a Progress over a synthetic SLA clock derived from the opened date.</p>
      </div>

      <div className="flex flex-col gap-3">
        {live.length === 0 ? <p className="text-sm text-[var(--prui-dim)]">Nothing in flight.</p> : null}
        {[...live]
          .sort((a, b) => (a.priority === "urgent" ? -1 : b.priority === "urgent" ? 1 : 0))
          .map((t) => {
            const days = Math.max(0, (Date.now() - new Date(t.opened).getTime()) / 86400000)
            const budget = Math.min(100, Math.round((days / (t.slaHours / 24)) * 100))
            return (
              <Card key={t.id}>
                <CardContent className="flex flex-col gap-2 pt-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{t.id} · {t.subject}</div>
                      <div className="text-xs text-[var(--prui-dim)]">{t.customer} · opened {t.opened}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {priorityBadge(t.priority)}
                      <Badge variant={budget > 75 ? "danger" : budget > 40 ? "warn" : "ok"}>{budget}% of SLA</Badge>
                    </div>
                  </div>
                  <Progress value={budget} variant={budget > 75 ? "danger" : "brand"} aria-label={`SLA budget ${t.id}`} />
                </CardContent>
              </Card>
            )
          })}
      </div>
    </div>
  )
}

/* ----------------------------- customers ----------------------------- */

function Customers() {
  const [customers, setCustomers] = useLocal<Customer[]>(KEYS.customers, seedCustomers)
  const [tickets] = useLocal<Ticket[]>(KEYS.tickets, seedTickets)
  const [draft, setDraft] = React.useState({ name: "", contact: "", plan: "free" as Customer["plan"] })

  return (
    <div className="page">
      <div className="page-head">
        <h1>Customers</h1>
        <p>Cards with live ticket counts; a new customer is instantly filterable in the inbox.</p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Input label="Name" helperText=" " value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
        <Input label="Contact" helperText=" " value={draft.contact} onChange={(e) => setDraft((d) => ({ ...d, contact: e.target.value }))} />
        <Select
          label="Plan"
          helperText=" "
          value={draft.plan}
          onChange={(v) => setDraft((d) => ({ ...d, plan: v as Customer["plan"] }))}
          options={[
            { label: "Free", value: "free" },
            { label: "Pro", value: "pro" },
            { label: "Enterprise", value: "enterprise" },
          ]}
        />
        <Button
          variant="primary"
          disabled={!draft.name.trim()}
          onClick={() => {
            setCustomers((prev) => [...prev, { id: `C${Date.now()}`, ...draft }])
            toast({ title: `${draft.name} added`, variant: "success" })
            setDraft({ name: "", contact: "", plan: "free" })
          }}
        >
          Add customer
        </Button>
      </div>

      <Separator />

      <div className="grid gap-3 sm:grid-cols-2">
        {customers.map((c) => {
          const openCount = tickets.filter((t) => t.customer === c.name && t.status !== "resolved").length
          return (
            <Card key={c.id}>
              <CardContent className="flex items-center justify-between gap-3 pt-4">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar fallback={c.name} />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{c.name}</div>
                    <div className="truncate text-xs text-[var(--prui-dim)]">{c.contact}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={c.plan === "enterprise" ? "brand" : c.plan === "pro" ? "ok" : undefined}>{c.plan}</Badge>
                  <span className="text-xs text-[var(--prui-dim)]">{openCount} open</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------- shell ------------------------------- */

const nav: NavItem[] = [
  { label: "Inbox", href: "/", icon: Inbox },
  { label: "SLA watch", href: "/sla", icon: Clock },
  { label: "Resolved", href: "/resolved", icon: CheckCircle2 },
  { label: "Customers", href: "/customers", icon: Building2 },
  { label: "Profile", href: "/profile", icon: UserCircle },
]

function Shell() {
  return (
    <App layoutType="B" brand={{ name: "Helpdesk" }} nav={nav} search={{ enabled: true, hotkey: "/" }} theme={false}
      sidebarFooter={({ collapsed }) => <SidebarUserMenu collapsed={collapsed} />}
    >
      <Routes>
        <Route path="/" element={<SupportInbox />} />
        <Route path="/sla" element={<Sla />} />
        <Route path="/resolved" element={<SupportInbox resolvedView />} />
        <Route path="/customers" element={<Customers />} />
              <Route path="/profile" element={<ProfilePage />} />
      </Routes>
      <Toaster />
    </App>
  )
}

export default function AppShell() {
  return (
    <Gate brand={{ name: "Helpdesk" }}>
      <Shell />
    </Gate>
  )
}
