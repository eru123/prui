import type { LayoutFile } from "./compose"

export interface LayoutDef {
  slug: string
  name: string
  blurb: string
  entry: string
  files: LayoutFile[]
}

const mainTsx = (routes: string) => `import { createRoot } from 'react-dom/client'
import { App, Routes, Route } from '@skiddph/prui/app'
import '@skiddph/prui/styles.css'
import './theme.css'
${routes}

createRoot(document.getElementById('root')!).render(
  <App
    brand={{ name: 'HRLabs', mark: '/logo.svg' }}
    nav={nav}
    search={{ enabled: true, hotkey: '/' }}
    theme={{ default: 'dark', persist: true }}
  >
    <Routes>
      <Route path="/" element={<Dashboard />} />
    </Routes>
  </App>,
)
`

const apiTs = `// <Resource> consumes these; it never generates them.
// Fixture data keeps the prototype honest until the API exists.

type Employee = { id: string; name: string; email: string; status: string; hired: string }

const employees: Employee[] = [
  { id: '1', name: 'Ada Lovelace', email: 'ada@hrlabs.dev', status: 'active', hired: '2024-01-15' },
  { id: '2', name: 'Grace Hopper', email: 'grace@hrlabs.dev', status: 'active', hired: '2023-03-01' },
  { id: '3', name: 'Linus Torvalds', email: 'linus@hrlabs.dev', status: 'on-leave', hired: '2022-11-20' },
]

export const api = {
  listEmployees: async (query: any) => {
    let rows = employees.map((r) => ({ ...r }))
    if (query.search) {
      rows = rows.filter((r) => r.name.toLowerCase().includes(query.search.toLowerCase()))
    }
    return { rows, cursor: null }
  },
  createEmployee: async (values: Record<string, unknown>) => {
    employees.push({ ...(values as object), id: String(employees.length + 1) } as Employee)
  },
  updateEmployee: async (row: Employee, values: Partial<Employee>) => {
    const found = employees.find((e) => e.id === row.id)
    if (found) Object.assign(found, values)
  },
  deleteEmployee: async (row: Employee) => {
    const i = employees.findIndex((e) => e.id === row.id)
    if (i >= 0) employees.splice(i, 1)
  },
}
`

const themeCss = `/* brand overrides - load after @skiddph/prui/styles.css */
.prui-root {
  --prui-brand: #16a34a;
  --prui-brand-fg: #ffffff;
  --prui-radius: 8px;
}
`

export const LAYOUTS: LayoutDef[] = [
  {
    slug: "dashboard",
    name: "Dashboard",
    blurb: "KPI row over a recent-activity table. The layout every internal tool starts with.",
    entry: "src/layouts/DashboardLayout.tsx",
    files: [
      { path: "src/main.tsx", code: mainTsx("import Dashboard from './pages/Dashboard'\nimport { nav } from './nav'") },
      { path: "src/nav.ts", code: `import { LayoutDashboard, Users, CalendarDays } from 'lucide-react'
import type { NavItem } from '@skiddph/prui/app'

export const nav: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Employees', href: '/employees', icon: Users },
  {
    label: 'Leave',
    icon: CalendarDays,
    items: [
      { label: 'Requests', href: '/leave/requests' },
      { label: 'Balances', href: '/leave/balances' },
    ],
  },
]
` },
      {
        path: "src/layouts/DashboardLayout.tsx",
        code: `import { StatRow } from '@skiddph/prui/app'
import { DataTable } from '@skiddph/prui/data-table'

const stats = [
  { label: 'Headcount', value: 142, delta: '+3 this month', trend: 'up' },
  { label: 'On leave today', value: 7, trend: 'flat' },
  { label: 'Open roles', value: 4, delta: '+1', trend: 'up' },
  { label: 'Pending requests', value: 12, delta: '-5 vs last week', trend: 'down' },
]

const recent = [
  { employee: 'Ada Lovelace', type: 'Annual', days: 5, status: 'Pending' },
  { employee: 'Grace Hopper', type: 'Sick', days: 2, status: 'Approved' },
  { employee: 'Linus Torvalds', type: 'Annual', days: 10, status: 'Approved' },
  { employee: 'Katherine Johnson', type: 'Unpaid', days: 3, status: 'Rejected' },
]

export default function DashboardLayout() {
  return (
    <main className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-[var(--prui-dim)]">Welcome back. Here is this week at a glance.</p>
      </div>
      <StatRow items={stats} />
      <section className="overflow-hidden rounded-[var(--prui-radius)] border border-[var(--prui-line)]">
        <div className="flex items-center justify-between border-b border-[var(--prui-line)] px-4 py-3">
          <h2 className="text-sm font-semibold">Recent leave requests</h2>
          <a className="text-sm text-[var(--prui-brand)] hover:underline" href="/leave/requests">View all</a>
        </div>
        <DataTable
          columns={[
            { key: 'employee', label: 'Employee' },
            { key: 'type', label: 'Type' },
            { key: 'days', label: 'Days', align: 'right' },
            { key: 'status', label: 'Status' },
          ]}
          rows={recent}
        />
      </section>
    </main>
  )
}
`,
      },
      { path: "src/api.ts", code: apiTs },
      { path: "src/theme.css", code: themeCss },
    ],
  },
  {
    slug: "listing",
    name: "Listing",
    blurb: "Search, faceted filters, and a sortable table with create/edit/delete. One <Resource>, no plumbing.",
    entry: "src/pages/EmployeesPage.tsx",
    files: [
      { path: "src/main.tsx", code: mainTsx("import EmployeesPage from './pages/EmployeesPage'\nimport { nav } from './nav'") },
      { path: "src/nav.ts", code: `import { LayoutDashboard, Users } from 'lucide-react'
import type { NavItem } from '@skiddph/prui/app'

export const nav: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Employees', href: '/employees', icon: Users },
]
` },
      {
        path: "src/pages/EmployeesPage.tsx",
        code: `import { Resource } from '@skiddph/prui/app'
import { api } from '../api'

const statuses = ['active', 'on-leave', 'offboarded']

export default function EmployeesPage() {
  return (
    <Resource
      name="employees"
      columns={[
        { key: 'name', label: 'Name', sortable: true },
        { key: 'email', label: 'Email' },
        { key: 'status', label: 'Status', filter: 'select', options: statuses },
        { key: 'hired', label: 'Hired', filter: 'daterange' },
      ]}
      list={api.listEmployees}
      create={api.createEmployee}
      update={api.updateEmployee}
      delete={api.deleteEmployee}
      actions={['create', 'edit', 'delete']}
    />
  )
}
`,
      },
      { path: "src/api.ts", code: apiTs },
      { path: "src/theme.css", code: themeCss },
    ],
  },
  {
    slug: "settings",
    name: "Settings",
    blurb: "Two-column settings page from a section list. Typed fields render their own controls.",
    entry: "src/pages/SettingsPage.tsx",
    files: [
      { path: "src/main.tsx", code: mainTsx("import SettingsPage from './pages/SettingsPage'\nimport { nav } from './nav'") },
      { path: "src/nav.ts", code: `import { LayoutDashboard, Settings } from 'lucide-react'
import type { NavItem } from '@skiddph/prui/app'

export const nav: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Settings', href: '/settings', icon: Settings },
]
` },
      {
        path: "src/pages/SettingsPage.tsx",
        code: `import { useState } from 'react'
import { Settings } from '@skiddph/prui/app'

export default function SettingsPage() {
  const [orgName, setOrgName] = useState('HRLabs')
  const [region, setRegion] = useState('APAC')
  const [autoApprove, setAutoApprove] = useState(true)

  return (
    <Settings
      title="Workspace settings"
      sections={[
        {
          id: 'workspace',
          label: 'Workspace',
          description: 'Name and region for this workspace.',
          fields: [
            { label: 'Organization name', name: 'orgName', type: 'text', value: orgName, onChange: setOrgName },
            { label: 'Region', name: 'region', type: 'select', options: ['EU', 'US', 'APAC'], value: region, onChange: setRegion },
          ],
        },
        {
          id: 'leave',
          label: 'Leave policy',
          description: 'Defaults applied to every new request.',
          fields: [
            { label: 'Auto-approve under 3 days', name: 'autoApprove', type: 'switch', value: autoApprove, onChange: setAutoApprove },
            { label: 'Annual leave days', name: 'annualDays', type: 'number', value: 20 },
          ],
        },
      ]}
    />
  )
}
`,
      },
      { path: "src/theme.css", code: themeCss },
    ],
  },
  {
    slug: "auth",
    name: "Auth",
    blurb: "Login screen with oauth buttons and the remember-me toggle, straight from the pre-made page set.",
    entry: "src/pages/LoginPage.tsx",
    files: [
      { path: "src/main.tsx", code: `import { createRoot } from 'react-dom/client'
import { MemoryRouter } from '@skiddph/prui/app'
import { LoginPage } from '@skiddph/prui/pages'
import '@skiddph/prui/styles.css'
import './theme.css'

createRoot(document.getElementById('root')!).render(
  <MemoryRouter initialEntries={['/']}>
    <LoginPage
      brand={{ name: 'HRLabs' }}
      fields={{ remember: true }}
      oauth={['google', 'github']}
      onSubmit={async (values) => {
        await api.login(values.email, values.password)
      }}
    />
  </MemoryRouter>,
)
` },
      {
        path: "src/pages/LoginPage.tsx",
        code: `// The page ships with the package. This wrapper is only here if you want
// to pre-set props for your product; most apps route it directly:
// <App pages="auth">
import { LoginPage } from '@skiddph/prui/pages'

export default LoginPage
`,
      },
      { path: "src/theme.css", code: themeCss },
    ],
  },
]
