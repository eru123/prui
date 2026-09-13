import * as React from "react"
import { Routes, Route, useNavigate, useParams } from "react-router-dom"
import {
  App, Resource, StatRow, type ResourceRow, type NavItem,
} from "@skiddph/prui/app"
import {
  Button, Badge, Card, CardHeader, CardTitle, CardContent, Avatar, Separator, TagInput, Textarea,
  Progress, Timeline, Drawer, Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter,
  toast, Toaster, Input, Select, Modal, DateRangePicker,
} from "@skiddph/prui/core"
import { Users, DollarSign, CalendarCheck, Percent, LayoutDashboard, Table2, CalendarDays, Settings as SettingsIcon, Trash2, UserCircle } from "lucide-react"
import { Gate, SidebarUserMenu, ProfilePage } from "./auth"
import { useLocal, readLocal, writeLocal, resetLocal } from "./store"

/* ------------------------------- model ------------------------------- */

type Status = "active" | "leave" | "onboarding"

interface Employee extends ResourceRow {
  id: string
  name: string
  email: string
  status: Status
  salary: number
  hired: string
  skills: string[]
  notes: string
}

interface LeaveRequest extends ResourceRow {
  id: string
  employeeId: string
  type: "Annual" | "Sick" | "Unpaid"
  from: string
  to: string
  status: "pending" | "approved" | "rejected"
}

interface LogEntry {
  id: string
  at: string
  text: string
}

const seedEmployees = (): Employee[] => [
  { id: "1", name: "Ada Lovelace", email: "ada@northwind.io", status: "active", salary: 132, hired: "2021-06-10", skills: ["analytics", "python"], notes: "Runs the reporting guild." },
  { id: "2", name: "Grace Hopper", email: "grace@northwind.io", status: "leave", salary: 148, hired: "2020-02-03", skills: ["compilers", "mentoring"], notes: "" },
  { id: "3", name: "Linus Torvalds", email: "linus@northwind.io", status: "active", salary: 120, hired: "2022-09-15", skills: ["kernel", "review"], notes: "Prefers async reviews." },
  { id: "4", name: "Margaret Hamilton", email: "mh@northwind.io", status: "active", salary: 155, hired: "2019-11-01", skills: ["apollo", "safety"], notes: "" },
  { id: "5", name: "Barbara Liskov", email: "barbara@northwind.io", status: "onboarding", salary: 118, hired: "2026-08-20", skills: ["types"], notes: "Buddy: Ada." },
  { id: "6", name: "Alan Kay", email: "alan@northwind.io", status: "leave", salary: 140, hired: "2021-03-22", skills: ["dynabook"], notes: "" },
  { id: "7", name: "Radia Perlman", email: "radia@northwind.io", status: "active", salary: 151, hired: "2020-10-05", skills: ["networking"], notes: "" },
  { id: "8", name: "Donald Knuth", email: "don@northwind.io", status: "active", salary: 162, hired: "2018-05-17", skills: ["tectonics", "tex"], notes: "Writes checks for bug reports." },
  { id: "9", name: "Katherine Johnson", email: "kj@northwind.io", status: "active", salary: 149, hired: "2019-01-14", skills: ["trajectories"], notes: "" },
  { id: "10", name: "Edsger Dijkstra", email: "edsger@northwind.io", status: "active", salary: 138, hired: "2022-01-05", skills: ["graphs", "discipline"], notes: "" },
  { id: "11", name: "Anita Borg", email: "anita@northwind.io", status: "onboarding", salary: 105, hired: "2026-09-01", skills: [], notes: "" },
  { id: "12", name: "Radia Perlman Jr", email: "radiaj@northwind.io", status: "active", salary: 145, hired: "2021-11-30", skills: ["systems", "community"], notes: "" },
]

const seedLeave = (): LeaveRequest[] => [
  { id: "L1", employeeId: "2", type: "Annual", from: "2026-09-20", to: "2026-10-04", status: "pending" },
  { id: "L2", employeeId: "6", type: "Sick", from: "2026-09-10", to: "2026-09-12", status: "approved" },
  { id: "L3", employeeId: "9", type: "Annual", from: "2026-10-10", to: "2026-10-20", status: "pending" },
  { id: "L4", employeeId: "5", type: "Unpaid", from: "2026-11-01", to: "2026-11-05", status: "rejected" },
]

const seedLog = (): LogEntry[] => [
  { id: "seed", at: new Date().toISOString(), text: "Workspace created from seed data" },
]

const KEYS = { employees: "nw.employees", leave: "nw.leave", log: "nw.log" }

const logEvent = (text: string) => {
  writeLocal<LogEntry[]>(KEYS.log, (prev) => [{ id: String(Date.now()), at: new Date().toISOString(), text }, ...prev].slice(0, 60), seedLog)
}

const nameOf = (id: string) => readLocal<Employee[]>(KEYS.employees, seedEmployees).find((e) => e.id === id)?.name ?? "Unknown"

/* ------------------------------ overview ------------------------------ */

function Overview() {
  const [employees] = useLocal<Employee[]>(KEYS.employees, seedEmployees)
  const [leave] = useLocal<LeaveRequest[]>(KEYS.leave, seedLeave)
  const [log] = useLocal<LogEntry[]>(KEYS.log, seedLog)

  return (
    <div className="page">
      <div className="page-head">
        <h1>Overview</h1>
        <p>Live numbers from the local store — edit anything and watch them move. No server: it is all localStorage.</p>
      </div>

      <StatRow
        items={[
          { label: "Headcount", value: employees.length, delta: `${employees.filter((e) => e.status === "onboarding").length} onboarding`, trend: "up", icon: Users },
          { label: "Payroll (k)", value: employees.reduce((s, e) => s + e.salary, 0), icon: DollarSign },
          { label: "On leave", value: employees.filter((e) => e.status === "leave").length, icon: CalendarCheck },
          { label: "Avg salary (k)", value: employees.length ? Math.round(employees.reduce((s, e) => s + e.salary, 0) / employees.length) : 0, delta: "+3.2%", trend: "up", icon: Percent },
        ]}
      />

      <div className="two-col">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pending leave</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {leave.filter((l) => l.status === "pending").length === 0 ? (
              <p className="text-xs text-[var(--prui-dim)]">Nothing waiting. File something on the Leave page.</p>
            ) : null}
            {leave
              .filter((l) => l.status === "pending")
              .map((l) => (
                <div key={l.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm text-[var(--prui-fg)]">{nameOf(l.employeeId)} · {l.type}</div>
                    <div className="text-xs text-[var(--prui-dim)]">{l.from} → {l.to}</div>
                  </div>
                  <Badge variant="warn">pending</Badge>
                </div>
              ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Timeline items={log.slice(0, 6).map((e) => ({ title: e.text, time: new Date(e.at).toLocaleString() }))} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Composition</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-2.5">
          {(["active", "leave", "onboarding"] as const).map((s) => {
            const group = employees.filter((e) => e.status === s)
            const pct = employees.length ? Math.round((group.length / employees.length) * 100) : 0
            return (
              <div key={s}>
                <div className="mb-1 flex justify-between text-xs text-[var(--prui-dim)]">
                  <span>{s}</span>
                  <span>{group.length} · {pct}%</span>
                </div>
                <Progress value={pct} aria-label={`${s} share`} />
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}

/* ----------------------------- employees ----------------------------- */

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "On leave", value: "leave" },
  { label: "Onboarding", value: "onboarding" },
]

function Employees() {
  const [, setEmployees] = useLocal<Employee[]>(KEYS.employees, seedEmployees)
  const employees = () => readLocal<Employee[]>(KEYS.employees, seedEmployees)

  return (
    <div className="page">
      <div className="page-head">
        <h1>Employees</h1>
        <p>Full CRUD over localStorage: search, status facet, salary range, hired date range, sort, 8/page. Expand a row for skills and notes.</p>
      </div>

      <Resource<Employee>
        name="employees"
        rowKey={(r) => r.id}
        pageSize={8}
        columns={[
          {
            key: "name",
            label: "Name",
            sortable: true,
            render: (r) => (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Avatar size="sm" fallback={r.name} />
                {r.name}
              </span>
            ),
          },
          { key: "email", label: "Email" },
          {
            key: "status",
            label: "Status",
            filter: "select",
            options: statusOptions,
            render: (r) => <Badge variant={r.status === "active" ? "ok" : r.status === "leave" ? "warn" : "brand"}>{r.status}</Badge>,
          },
          { key: "salary", label: "Salary (k)", sortable: true, align: "right", filter: "numberrange" },
          { key: "hired", label: "Hired", sortable: true, filter: "daterange" },
        ]}
        renderExpandedRow={(r) => (
          <div className="flex flex-col gap-2 p-1">
            <TagInput
              label="Skills"
              defaultValue={r.skills}
              helperText="Committed on comma — stored on the employee"
              onChange={(skills) => {
                setEmployees((prev) => prev.map((e) => (e.id === r.id ? { ...e, skills } : e)))
                logEvent(`Updated skills for ${r.name}`)
                toast({ title: "Skills saved", variant: "success" })
              }}
            />
            <Textarea
              label="Notes"
              defaultValue={r.notes}
              rows={2}
              helperText="Free-form, persisted on blur"
              onBlur={(e) => setEmployees((prev) => prev.map((x) => (x.id === r.id ? { ...x, notes: e.target.value } : x)))}
            />
          </div>
        )}
        list={async (q) => {
          await new Promise((r) => setTimeout(r, 120))
          let rows = [...employees()]
          if (q.search) {
            const s = q.search.toLowerCase()
            rows = rows.filter((r) => `${r.name} ${r.email}`.toLowerCase().includes(s))
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
          const size = q.pageSize ?? 8
          const start = q.cursor ? Number(q.cursor) : 0
          const page = rows.slice(start, start + size)
          return { rows: page, nextCursor: start + size < rows.length ? String(start + size) : null }
        }}
        create={async (values) => {
          const employee: Employee = {
            id: String(Date.now()),
            name: String(values.name ?? "New hire"),
            email: String(values.email ?? ""),
            status: (values.status as Status) ?? "onboarding",
            salary: Number(values.salary ?? 110),
            hired: String(values.hired ?? new Date().toISOString().slice(0, 10)),
            skills: [],
            notes: "",
          }
          setEmployees((prev) => [...prev, employee])
          logEvent(`Hired ${employee.name}`)
          toast({ title: `${employee.name} added`, variant: "success" })
        }}
        update={async (row, values) => {
          setEmployees((prev) => prev.map((e) => (e.id === row.id ? { ...e, ...values, id: row.id } : e)))
          logEvent(`Edited ${row.name}`)
        }}
        remove={async (row) => {
          setEmployees((prev) => prev.filter((e) => e.id !== row.id))
          logEvent(`Removed ${row.name}`)
          toast({ title: `${row.name} removed`, variant: "danger" })
        }}
      />
    </div>
  )
}

/* ------------------------------- leave ------------------------------- */

type Draft = { employeeId: string; type: LeaveRequest["type"]; from: string; to: string }

function Leave() {
  const [leave, setLeave] = useLocal<LeaveRequest[]>(KEYS.leave, seedLeave)
  const [employees] = useLocal<Employee[]>(KEYS.employees, seedEmployees)
  const [draft, setDraft] = React.useState<Draft>({ employeeId: "", type: "Annual", from: "", to: "" })

  const patch = (part: Partial<Draft>) => setDraft((d) => ({ ...d, ...part }))

  const decide = (id: string, status: "approved" | "rejected") => {
    const req = leave.find((l) => l.id === id)
    setLeave((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)))
    logEvent(`${status === "approved" ? "Approved" : "Rejected"} leave for ${req ? nameOf(req.employeeId) : "someone"}`)
    toast({ title: `Request ${status}`, variant: status === "approved" ? "success" : "neutral" })
  }

  return (
    <div className="page">
      <div className="page-head">
        <h1>Leave requests</h1>
        <p>Approve or reject; everything persists. New requests land in the store immediately.</p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Select
          label="Employee"
          helperText=" "
          value={draft.employeeId}
          onChange={(v) => patch({ employeeId: String(v) })}
          options={employees.map((e) => ({ label: e.name, value: e.id }))}
        />
        <Select label="Type" helperText=" " value={draft.type} onChange={(v) => patch({ type: v as LeaveRequest["type"] })} options={[{ label: "Annual", value: "Annual" }, { label: "Sick", value: "Sick" }, { label: "Unpaid", value: "Unpaid" }]} />
        <DateRangePicker
          label="Dates"
          helperText=" "
          className="h-9 w-64"
          ariaLabel="Leave dates"
          value={{ from: draft.from || undefined, to: draft.to || undefined }}
          onChange={(range) => patch({ from: range.from ?? "", to: range.to ?? "" })}
        />
        <Button
          variant="primary"
          disabled={!draft.employeeId || !draft.from || !draft.to}
          onClick={() => {
            setLeave((prev) => [...prev, { id: `L${Date.now()}`, ...draft, status: "pending" }])
            logEvent(`Filed ${draft.type} leave for ${nameOf(draft.employeeId)}`)
            toast({ title: "Request filed", variant: "success" })
            setDraft({ employeeId: "", type: "Annual", from: "", to: "" })
          }}
        >
          File request
        </Button>
      </div>

      <Separator />

      <div className="flex flex-col gap-3">
        {leave.length === 0 ? <p className="text-sm text-[var(--prui-dim)]">No requests.</p> : null}
        {[...leave].reverse().map((l) => (
          <Card key={l.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-4">
              <div className="min-w-0">
                <div className="text-sm font-medium text-[var(--prui-fg)]">{nameOf(l.employeeId)} · {l.type}</div>
                <div className="text-xs text-[var(--prui-dim)]">{l.from} → {l.to}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={l.status === "approved" ? "ok" : l.status === "rejected" ? "danger" : "warn"}>{l.status}</Badge>
                {l.status === "pending" ? (
                  <>
                    <Button size="sm" variant="primary" onClick={() => decide(l.id, "approved")}>Approve</Button>
                    <Button size="sm" variant="danger" onClick={() => decide(l.id, "rejected")}>Reject</Button>
                  </>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => setLeave((prev) => prev.filter((x) => x.id !== l.id))}>Clear</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------ reports ------------------------------ */

function Reports() {
  const [employees] = useLocal<Employee[]>(KEYS.employees, seedEmployees)
  const [open, setOpen] = React.useState(false)
  const bands = [100, 120, 140, 160]
  const csv = ["id,name,status,salary", ...employees.map((e) => `${e.id},${e.name},${e.status},${e.salary}`)].join("\n")

  return (
    <div className="page">
      <div className="page-head">
        <h1>Reports</h1>
        <p>Aggregates over the store, plus an export modal and a reset zone.</p>
      </div>

      <div className="two-col">
        <Card>
          <CardHeader><CardTitle className="text-sm">Salary bands</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-3">
            {bands.map((b, i) => {
              const next = bands[i + 1] ?? Infinity
              const group = employees.filter((e) => e.salary >= b && e.salary < next)
              const pct = employees.length ? Math.round((group.length / employees.length) * 100) : 0
              return (
                <div key={b}>
                  <div className="mb-1 flex justify-between text-xs text-[var(--prui-dim)]">
                    <span>{b}k{next !== Infinity ? ` – ${next}k` : "+"}</span>
                    <span>{group.length}</span>
                  </div>
                  <Progress value={pct} variant={i % 2 ? "brand" : "success"} aria-label={`Band ${b}`} />
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Operations</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button variant="primary" onClick={() => setOpen(true)}>Export headcount CSV</Button>
            <p className="text-xs text-[var(--prui-dim)]">A noPadding Modal with a generated, copyable blob.</p>
          </CardContent>
        </Card>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} ariaLabel="Export" size="md" noPadding>
        <div className="p-4">
          <h2 className="mb-1 text-lg font-semibold">Export preview</h2>
          <p className="mb-3 text-sm text-[var(--prui-dim)]">{employees.length} employees, generated from the store.</p>
          <pre className="max-h-56 overflow-auto rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-background)] p-3 font-mono text-xs">{csv}</pre>
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Close</Button>
            <Button
              variant="primary"
              onClick={() => {
                navigator.clipboard?.writeText(csv).catch(() => {})
                toast({ title: "CSV copied to clipboard", variant: "success" })
              }}
            >
              Copy CSV
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

/* --------------------------- record screen --------------------------- */

function Record() {
  const [employees, setEmployees] = useLocal<Employee[]>(KEYS.employees, seedEmployees)
  const [confirming, setConfirming] = React.useState(false)
  const navigate = useNavigate()
  const { id } = useParams()
  const employee = employees.find((e) => e.id === id)

  if (!employee) {
    return (
      <div className="page">
        <div className="page-head">
          <h1>Record</h1>
          <p>Pick someone (or open /record/1 … /12 directly).</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {employees.map((e) => (
            <Button key={e.id} size="sm" variant="ghost" onClick={() => navigate(`/record/${e.id}`)}>{e.name}</Button>
          ))}
        </div>
      </div>
    )
  }

  const patch = (values: Partial<Employee>) => {
    setEmployees((prev) => prev.map((e) => (e.id === employee.id ? { ...e, ...values } : e)))
    logEvent(`Edited ${employee.name}`)
    toast({ title: "Saved", variant: "success" })
  }

  return (
    <div className="page">
      <div className="page-head">
        <h1>{employee.name}</h1>
        <p>A record screen: Avatar, inline fields, a Drawer for notes, a confirmed delete.</p>
      </div>

      <div className="two-col">
        <Card>
          <CardContent className="flex items-center gap-4 pt-5">
            <Avatar size="lg" fallback={employee.name} />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-[var(--prui-fg)]">{employee.email}</div>
              <div className="text-xs text-[var(--prui-dim)]">Hired {employee.hired} · {employee.salary}k</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-3 pt-5">
            <Input label="Name" defaultValue={employee.name} helperText="Saves on blur" onBlur={(e) => patch({ name: e.target.value })} />
            <Select label="Status" helperText=" " value={employee.status} onChange={(v) => patch({ status: v as Status })} options={statusOptions} />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => navigate("/record")}>← All employees</Button>
        <NotesDrawer employee={employee} onSave={(notes) => patch({ notes })} />
        <Button variant="danger" onClick={() => setConfirming(true)}>
          <Trash2 className="h-3.5 w-3.5" aria-hidden /> Delete
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            resetLocal()
            toast({ title: "Store reset", description: "Seeds restored on next load.", variant: "neutral" })
            navigate("/")
          }}
        >
          Reset all data
        </Button>
      </div>

      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {employee.name}?</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-sm text-[var(--prui-dim)]">This writes straight to localStorage — no undo, no server holding a copy.</p>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirming(false)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={() => {
                setEmployees((prev) => prev.filter((e) => e.id !== employee.id))
                logEvent(`Deleted ${employee.name}`)
                setConfirming(false)
                navigate("/record")
                toast({ title: `${employee.name} deleted`, variant: "danger" })
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function NotesDrawer({ employee, onSave }: { employee: Employee; onSave: (notes: string) => void }) {
  const [open, setOpen] = React.useState(false)
  const [notes, setNotes] = React.useState(employee.notes)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Notes (Drawer)</Button>
      <Drawer open={open} onOpenChange={setOpen} side="right" size="420px" ariaLabel={`${employee.name} notes`}>
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Notes · {employee.name}</h2>
          <Textarea label="Notes" rows={8} value={notes} onChange={(e) => setNotes(e.target.value)} helperText="Escape closes; Save writes to the store." />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                onSave(notes)
                setOpen(false)
                toast({ title: "Notes saved", variant: "success" })
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </Drawer>
    </>
  )
}

/* ------------------------------- shell ------------------------------- */

const nav: NavItem[] = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Employees", href: "/employees", icon: Users },
  { label: "Leave", href: "/leave", icon: CalendarDays },
  { label: "Reports", href: "/reports", icon: Table2 },
  { label: "Record", href: "/record", icon: SettingsIcon },
  { label: "Profile", href: "/profile", icon: UserCircle },
]

function Shell() {
  return (
    <App brand={{ name: "Northwind" }} nav={nav} search={{ enabled: true, hotkey: "/" }} theme={false} sidebar={{ width: 230 }}
      sidebarFooter={({ collapsed }) => <SidebarUserMenu collapsed={collapsed} />}
    >
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/leave" element={<Leave />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/record" element={<Record />} />
        <Route path="/record/:id" element={<Record />} />
              <Route path="/profile" element={<ProfilePage />} />
      </Routes>
      <Toaster />
    </App>
  )
}

export default function AppShell() {
  return (
    <Gate brand={{ name: "Northwind" }}>
      <Shell />
    </Gate>
  )
}
