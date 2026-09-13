import { App, Resource, StatRow, type ResourceRow, type NavItem } from "@skiddph/prui/app"
import { Users, DollarSign, CalendarCheck, Percent, LayoutDashboard, Table2, Settings } from "lucide-react"
import { Routes, Route } from "react-router-dom"

const nav: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Employees", href: "/employees", icon: Users },
  { label: "Reports", href: "/reports", icon: Table2 },
  { label: "Settings", href: "/settings", icon: Settings },
]

interface Employee extends ResourceRow {
  id: string
  name: string
  status: "active" | "leave" | "onboarding"
  salary: number
  hired: string
}

// seeded in-memory "database"; the Resource list() applies search, filters,
// sort and pagination over it just like it would over your API
const db: Employee[] = [
  { id: "1", name: "Ada Lovelace", status: "active", salary: 132, hired: "2021-06-10" },
  { id: "2", name: "Grace Hopper", status: "leave", salary: 148, hired: "2020-02-03" },
  { id: "3", name: "Linus Torvalds", status: "active", salary: 120, hired: "2022-09-15" },
  { id: "4", name: "Margaret Hamilton", status: "active", salary: 155, hired: "2019-11-01" },
  { id: "5", name: "Barbara Liskov", status: "onboarding", salary: 118, hired: "2026-08-20" },
  { id: "6", name: "Alan Kay", status: "leave", salary: 140, hired: "2021-03-22" },
  { id: "7", name: "Radia Perlman", status: "active", salary: 151, hired: "2020-10-05" },
  { id: "8", name: "Donald Knuth", status: "active", salary: 162, hired: "2018-05-17" },
]

const statusOptions = [
  { label: "Active", value: "active", count: 5 },
  { label: "On leave", value: "leave", count: 2 },
  { label: "Onboarding", value: "onboarding", count: 1 },
]

function Dashboard() {
  return (
    <div className="page">
      <div className="page-head">
        <h1>Dashboard</h1>
        <p>This week at a glance. Everything below is prui: shell, stats, and a full CRUD resource.</p>
      </div>

      <StatRow
        items={[
          { label: "Headcount", value: db.length, delta: "+1 this month", trend: "up", icon: Users },
          { label: "Payroll (k)", value: db.reduce((s, e) => s + e.salary, 0), icon: DollarSign },
          { label: "On leave", value: db.filter((e) => e.status === "leave").length, icon: CalendarCheck },
          { label: "Avg salary (k)", value: Math.round(db.reduce((s, e) => s + e.salary, 0) / db.length), delta: "+3.2%", trend: "up", icon: Percent },
        ]}
      />

      <Resource<Employee>
        name="employees"
        rowKey={(r) => r.id}
        columns={[
          { key: "name", label: "Name", sortable: true },
          {
            key: "status",
            label: "Status",
            filter: "select",
            filterOptions: statusOptions,
            render: (r) => (
              <span style={{ color: r.status === "active" ? "var(--prui-ok)" : r.status === "leave" ? "var(--prui-warn)" : "var(--prui-dim)" }}>
                {r.status}
              </span>
            ),
          },
          { key: "salary", label: "Salary (k)", sortable: true, align: "right", filter: "numberrange" },
          { key: "hired", label: "Hired", filter: "daterange" },
        ]}
        list={async (q) => {
          await new Promise((r) => setTimeout(r, 150))
          let rows = [...db]
          if (q.search) {
            const s = q.search.toLowerCase()
            rows = rows.filter((r) => r.name.toLowerCase().includes(s))
          }
          const status = q.filters?.["status"] as string[] | undefined
          if (status?.length) rows = rows.filter((r) => status.includes(r.status))
          const range = q.filters?.["salary"] as { min?: number; max?: number } | undefined
          if (range?.min !== undefined) rows = rows.filter((r) => r.salary >= range.min!)
          if (range?.max !== undefined) rows = rows.filter((r) => r.salary <= range.max!)
          const dr = q.filters?.["hired"] as { from?: string; to?: string } | undefined
          if (dr?.from) rows = rows.filter((r) => r.hired >= dr.from!)
          if (dr?.to) rows = rows.filter((r) => r.hired <= dr.to!)
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
          db.push({
            id: String(Date.now()),
            name: String(values.name ?? "New hire"),
            status: "onboarding",
            salary: Number(values.salary ?? 110),
            hired: new Date().toISOString().slice(0, 10),
          })
        }}
        update={async (row, values) => {
          const i = db.findIndex((e) => e.id === row.id)
          if (i >= 0) db[i] = { ...db[i]!, ...values, id: row.id } as Employee
        }}
        remove={async (row) => {
          const i = db.findIndex((e) => e.id === row.id)
          if (i >= 0) db.splice(i, 1)
        }}
      />
    </div>
  )
}

export default function AppShell() {
  return (
    <App
      brand={{ name: "Northwind" }}
      nav={nav}
      search={{ enabled: true, hotkey: "/" }}
      theme={false}
      sidebar={{ width: 230 }}
    >
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/employees" element={<Dashboard />} />
        <Route path="/reports" element={<Dashboard />} />
        <Route path="/settings" element={<Dashboard />} />
      </Routes>
    </App>
  )
}
