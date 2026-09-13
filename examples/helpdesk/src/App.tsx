import * as React from "react"
import { App, Resource, type ResourceRow, type NavItem } from "@skiddph/prui/app"
import { toast, Toaster, Button, Badge } from "@skiddph/prui/core"
import { LifeBuoy, Inbox, Clock, CheckCircle2, AlertTriangle } from "lucide-react"
import { Routes, Route } from "react-router-dom"

const nav: NavItem[] = [
  { label: "Inbox", href: "/", icon: Inbox },
  { label: "SLA watch", href: "/sla", icon: Clock },
  { label: "Resolved", href: "/resolved", icon: CheckCircle2 },
]

interface Ticket extends ResourceRow {
  id: string
  subject: string
  customer: string
  priority: "low" | "normal" | "urgent"
  status: "open" | "pending" | "resolved"
  opened: string
}

let db: Ticket[] = [
  { id: "T-101", subject: "Cannot export payroll report", customer: "Acme Corp", priority: "urgent", status: "open", opened: "2026-09-12" },
  { id: "T-102", subject: "SSO login loop on Safari", customer: "Globex", priority: "normal", status: "open", opened: "2026-09-12" },
  { id: "T-103", subject: "Add second seat to workspace", customer: "Initech", priority: "low", status: "pending", opened: "2026-09-11" },
  { id: "T-104", subject: "Invoice PDF shows wrong VAT", customer: "Umbrella", priority: "urgent", status: "open", opened: "2026-09-11" },
  { id: "T-105", subject: "Bulk import fails on CSV > 10MB", customer: "Acme Corp", priority: "normal", status: "pending", opened: "2026-09-10" },
  { id: "T-106", subject: "Dark mode contrast on badges", customer: "Stark Ind.", priority: "low", status: "resolved", opened: "2026-09-09" },
]

const priorityOptions = [
  { label: "Urgent", value: "urgent", count: 2 },
  { label: "Normal", value: "normal", count: 2 },
  { label: "Low", value: "low", count: 2 },
]

const priorityColor = (p: Ticket["priority"]) =>
  p === "urgent" ? "var(--prui-danger)" : p === "normal" ? "var(--prui-fg)" : "var(--prui-dim)"

function SupportInbox() {
  const [, bump] = React.useState(0)
  return (
    <div className="page">
      <div className="page-head">
        <h1>Support inbox</h1>
        <p>Layout B in a real tool: full-width header, tickets as a resource, toasts for actions.</p>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            db = db.map((t) => (t.status === "pending" ? { ...t, status: "open" } : t))
            bump((n) => n + 1)
            toast({ title: "Queue nudged", description: "All pending tickets reopened.", variant: "success" })
          }}
        >
          Nudge pending
        </Button>
        <Button
          size="sm"
          onClick={() =>
            toast({
              title: "SLA report queued",
              description: "We will email you the weekly summary.",
              variant: "info",
            })
          }
        >
          Email me the SLA report
        </Button>
      </div>

      <Resource<Ticket>
        name="tickets"
        rowKey={(r) => r.id}
        columns={[
          { key: "id", label: "Ticket", sortable: true },
          { key: "subject", label: "Subject" },
          { key: "customer", label: "Customer", filter: "select", filterOptions: [...new Set(db.map((t) => t.customer))].map((c) => ({ label: c, value: c })) },
          {
            key: "priority",
            label: "Priority",
            filter: "select",
            filterOptions: priorityOptions,
            render: (r) => (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: priorityColor(r.priority) }}>
                {r.priority === "urgent" ? <AlertTriangle size={13} aria-hidden /> : null}
                {r.priority}
              </span>
            ),
          },
          {
            key: "status",
            label: "Status",
            render: (r) => (
              <Badge variant={r.status === "open" ? "warn" : r.status === "pending" ? "brand" : "ok"}>{r.status}</Badge>
            ),
          },
          { key: "opened", label: "Opened", filter: "daterange" },
        ]}
        list={async (q) => {
          await new Promise((r) => setTimeout(r, 120))
          let rows = [...db]
          if (q.search) {
            const s = q.search.toLowerCase()
            rows = rows.filter((t) => `${t.subject} ${t.customer} ${t.id}`.toLowerCase().includes(s))
          }
          for (const key of ["customer", "priority"] as const) {
            const vals = q.filters?.[key] as string[] | undefined
            if (vals?.length) rows = rows.filter((t) => vals.includes(String(t[key])))
          }
          const dr = q.filters?.["opened"] as { from?: string; to?: string } | undefined
          if (dr?.from) rows = rows.filter((t) => t.opened >= dr.from!)
          if (dr?.to) rows = rows.filter((t) => t.opened <= dr.to!)
          return { rows, nextCursor: null }
        }}
        update={async (row, values) => {
          const i = db.findIndex((t) => t.id === row.id)
          if (i >= 0) db[i] = { ...db[i]!, ...values, id: row.id } as Ticket
          if (values.status === "resolved") toast({ title: `${row.id} resolved`, variant: "success" })
        }}
        remove={async (row) => {
          db = db.filter((t) => t.id !== row.id)
          toast({ title: `${row.id} deleted`, description: "The customer was notified.", variant: "danger" })
        }}
      />

      <Toaster />
    </div>
  )
}

export default function AppShell() {
  return (
    <App
      layoutType="B"
      brand={{ name: "Helpdesk" }}
      nav={nav}
      search={{ enabled: true, hotkey: "/" }}
      theme={false}
    >
      <Routes>
        <Route path="/" element={<SupportInbox />} />
        <Route path="/sla" element={<SupportInbox />} />
        <Route path="/resolved" element={<SupportInbox />} />
      </Routes>
    </App>
  )
}
