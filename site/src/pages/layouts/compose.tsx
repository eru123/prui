import { useState } from "react"
import { App, Resource, Settings, StatRow, type NavItem } from "prui/app"
import { LayoutDashboard, Users, CalendarDays, Settings as SettingsIcon } from "lucide-react"
import { DataTable } from "prui/data-table"
import { LoginPage } from "prui/pages"
import { IframePortal } from "../../components/IframePortal"

export interface LayoutFile {
  path: string
  code: string
}

const nav: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Employees", href: "/employees", icon: Users },
  { label: "Leave", href: "/leave", icon: CalendarDays },
  { label: "Settings", href: "/settings", icon: SettingsIcon },
]

type Row = { id: string; employee: string; type: string; days: number; status: string }

const leaveRows: Row[] = [
  { id: "1", employee: "Ada Lovelace", type: "Annual", days: 5, status: "Pending" },
  { id: "2", employee: "Grace Hopper", type: "Sick", days: 2, status: "Approved" },
  { id: "3", employee: "Linus Torvalds", type: "Annual", days: 10, status: "Approved" },
  { id: "4", employee: "Katherine Johnson", type: "Unpaid", days: 3, status: "Rejected" },
  { id: "5", employee: "Margaret Hamilton", type: "Annual", days: 6, status: "Pending" },
]

const employeeRows = [
  { id: "1", name: "Ada Lovelace", email: "ada@hrlabs.dev", status: "active", hired: "2024-01-15" },
  { id: "2", name: "Grace Hopper", email: "grace@hrlabs.dev", status: "active", hired: "2023-03-01" },
  { id: "3", name: "Linus Torvalds", email: "linus@hrlabs.dev", status: "on-leave", hired: "2022-11-20" },
  { id: "4", name: "Margaret Hamilton", email: "mh@hrlabs.dev", status: "offboarded", hired: "2021-06-14" },
  { id: "5", name: "Katherine Johnson", email: "kj@hrlabs.dev", status: "active", hired: "2024-08-05" },
]

function Frame({ children }: { children: React.ReactNode; doc?: (d: Document) => void }) {
  return (
    <IframePortal title="Layout demo" height={Math.max(560, (typeof window !== "undefined" ? window.innerHeight : 800) - 170)}>
      {(d) => {
        d.documentElement.classList.add("prui-root", "prui-theme-control", "prui-mode-dark")
        d.body.style.margin = "0"
        d.body.style.background = "var(--prui-background)"
        // The bodies own their router: each <App router="memory"> brings one.
        return children
      }}
    </IframePortal>
  )
}

function DashboardBody() {
  return (
    <App
      router="memory"
      brand={{ name: "HRLabs", mark: undefined }}
      nav={nav}
      search={{ enabled: true, hotkey: "/" }}
      theme={false}
      sidebar={{ width: 220 }}
    >
      <main className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-xl font-semibold text-[var(--prui-fg)]">Dashboard</h1>
          <p className="text-sm text-[var(--prui-dim)]">Welcome back. Here is this week at a glance.</p>
        </div>
        <StatRow
          items={[
            { label: "Headcount", value: 142, delta: "+3 this month", trend: "up" },
            { label: "On leave today", value: 7, trend: "flat" },
            { label: "Open roles", value: 4, delta: "+1", trend: "up" },
            { label: "Pending requests", value: 12, delta: "-5 vs last week", trend: "down" },
          ]}
        />
        <section className="overflow-hidden rounded-[var(--prui-radius)] border border-[var(--prui-line)]">
          <div className="flex items-center justify-between border-b border-[var(--prui-line)] px-4 py-3">
            <h2 className="text-sm font-semibold text-[var(--prui-fg)]">Recent leave requests</h2>
            <span className="text-sm text-[var(--prui-brand)]">View all</span>
          </div>
          <DataTable
            columns={[
              { key: "employee", label: "Employee" },
              { key: "type", label: "Type" },
              { key: "days", label: "Days", align: "right" },
              { key: "status", label: "Status" },
            ]}
            rows={leaveRows}
          />
        </section>
      </main>
    </App>
  )
}

function ListingBody() {
  return (
    <App
      router="memory"
      brand={{ name: "HRLabs", mark: undefined }}
      nav={nav}
      search={{ enabled: true, hotkey: "/" }}
      theme={false}
      sidebar={{ width: 220 }}
    >
      <Resource
        name="employees"
        columns={[
          { key: "name", label: "Name", sortable: true },
          { key: "email", label: "Email" },
          { key: "status", label: "Status", filter: "select", options: ["active", "on-leave", "offboarded"] },
          { key: "hired", label: "Hired", filter: "daterange" },
        ]}
        list={async (q) => {
          let rows = employeeRows.map((r) => ({ ...r }))
          if (q.search) rows = rows.filter((r) => r.name.toLowerCase().includes(q.search!.toLowerCase()))
          const status = q.filters?.["status"] as string[] | undefined
          if (status && status.length) rows = rows.filter((r) => status.includes(r.status))
          return { rows, cursor: null }
        }}
        create={async () => {}}
        update={async () => {}}
        delete={async () => {}}
      />
    </App>
  )
}

function SettingsBody() {
  const [orgName, setOrgName] = useState<string | number | boolean>("HRLabs")
  const [region, setRegion] = useState<string | number | boolean>("APAC")
  const [autoApprove, setAutoApprove] = useState(true)
  return (
    <App
      router="memory"
      brand={{ name: "HRLabs", mark: undefined }}
      nav={nav}
      search={{ enabled: true, hotkey: "/" }}
      theme={false}
      sidebar={{ width: 220 }}
    >
      <div className="p-6">
        <Settings
          title="Workspace settings"
          sections={[
            {
              id: "workspace",
              label: "Workspace",
              description: "Name and region for this workspace.",
              fields: [
                { label: "Organization name", name: "orgName", type: "text", value: orgName, onChange: setOrgName },
                { label: "Region", name: "region", type: "select", options: ["EU", "US", "APAC"], value: region, onChange: setRegion },
              ],
            },
            {
              id: "leave",
              label: "Leave policy",
              description: "Defaults applied to every new request.",
              fields: [
                { label: "Auto-approve under 3 days", name: "autoApprove", type: "switch", value: autoApprove, onChange: (v) => setAutoApprove(Boolean(v)) },
                { label: "Annual leave days", name: "annualDays", type: "number", value: 20 },
              ],
            },
          ]}
        />
      </div>
    </App>
  )
}

function AuthBody() {
  return (
    <LoginPage
      brand={{ name: "HRLabs" }}
      fields={{ remember: true }}
      oauth={[
        { id: "google", label: "Google" },
        { id: "github", label: "GitHub" },
      ]}
      onSubmit={async () => {}}
    />
  )
}

export function LayoutComposition({ slug }: { slug: string }) {
  switch (slug) {
    case "dashboard":
      return <Frame><DashboardBody /></Frame>
    case "listing":
      return <Frame><ListingBody /></Frame>
    case "settings":
      return <Frame><SettingsBody /></Frame>
    case "auth":
      return <Frame><AuthBody /></Frame>
    default:
      return <p className="p-8 text-sm text-[var(--prui-dim)]">Unknown layout.</p>
  }
}
