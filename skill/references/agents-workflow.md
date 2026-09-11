# Agent workflow: scaffold a PRUI app end to end

This is the complete path from an empty directory to a verified two-resource admin app. It assumes ONLY this skill (no docs site access). Follow it top to bottom.

## 0. When to use

The user wants a new React app: admin panel, dashboard, internal tool, or prototype. PRUI gives you the shell, CRUD screens, pages, and theming as config. You write only the API functions and page compositions.

## 1. Scaffold with Vite

```bash
pnpm create vite my-admin --template react-ts
cd my-admin
pnpm install
```

## 2. Install prui

```bash
pnpm add @skiddph/prui
```

`react-router-dom` and `lucide-react` arrive with it (dependencies of the package; the App layer owns routing, so there is no router wiring for you).

## 3. Import theme tokens

Import the theme tokens and add brand overrides (optional):

```tsx
// src/main.tsx, before anything renders
import '@skiddph/prui/styles.css'
import './theme.css' // your overrides, see references/theming.md
```

## 4. Wire main.tsx: the `<App>` shell

```tsx
// src/main.tsx
import { createRoot } from 'react-dom/client'
import { App } from '@skiddph/prui/app'
import { Routes, Route } from 'react-router-dom'
import { LayoutDashboard, Users, CalendarDays } from 'lucide-react'
import '@skiddph/prui/styles.css'
import './theme.css'
import Dashboard from './pages/Dashboard'
import EmployeesPage from './pages/EmployeesPage'
import LeaveRequestsPage from './pages/LeaveRequestsPage'

createRoot(document.getElementById('root')!).render(
  <App
    brand={{ name: 'HRLabs', mark: '/logo.svg' }}
    nav={[
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
    ]}
    search={{ enabled: true, hotkey: '/' }}
    theme={{ default: 'dark', persist: true }}
    auth={{ sessionTimeout: 30 }}
  >
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/employees" element={<EmployeesPage />} />
      <Route path="/leave/requests" element={<LeaveRequestsPage />} />
      <Route path="/leave/balances" element={<div>Balances</div>} />
    </Routes>
  </App>,
)
```

`<App>` renders sidebar, header, routes, and theme persistence. One `href`, one `<Route>`; keep them in lockstep.

## 5. Write the API layer

`<Resource>` consumes your API functions; it never generates them. Minimal shape for the two resources:

```ts
// src/api.ts
type Employee = { id: string; name: string; email: string; status: string; hired: string }
type LeaveRequest = { id: string; employee: string; type: string; status: string; start: string; days: number }

export const api = {
  // (query) => Promise<{ rows, cursor }>  - pass query.cursor back for the next page
  listEmployees: async (query: any) => {
    const res = await fetch('/api/employees?' + new URLSearchParams(query))
    return res.json() as Promise<{ rows: Employee[]; cursor?: string }>
  },
  createEmployee: async (values: Record<string, unknown>) => {
    const res = await fetch('/api/employees', { method: 'POST', body: JSON.stringify(values) })
    return res.json()
  },
  // Resource calls update(row, values) and remove(row); use row.id for the URL
  updateEmployee: async (row: Employee, values: Partial<Employee>) => {
    const res = await fetch(`/api/employees/${row.id}`, { method: 'PATCH', body: JSON.stringify(values) })
    return res.json()
  },
  deleteEmployee: async (row: Employee) => {
    await fetch(`/api/employees/${row.id}`, { method: 'DELETE' })
  },

  listLeaveRequests: async (query: any) => {
    const res = await fetch('/api/leave-requests?' + new URLSearchParams(query))
    return res.json() as Promise<{ rows: LeaveRequest[]; cursor?: string }>
  },
  updateLeaveRequest: async (row: LeaveRequest, values: Partial<LeaveRequest>) => {
    const res = await fetch(`/api/leave-requests/${row.id}`, { method: 'PATCH', body: JSON.stringify(values) })
    return res.json()
  },
}
```

For a prototype with no backend yet, return fixture data from the same function shapes (resolve promises with `{ rows: [...] }`); swap the internals later without touching any page.

## 6. Resource screens

```tsx
// src/pages/EmployeesPage.tsx
import { Resource } from '@skiddph/prui/app'
import { api } from '../api'

const statuses = ['active', 'on-leave', 'offboarded']

export default function EmployeesPage() {
  return (
    <Resource
      name="employees"
      columns={[
        { key: 'name', label: 'Name', sortable: true },
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
```

```tsx
// src/pages/LeaveRequestsPage.tsx
import { Resource } from '@skiddph/prui/app'
import { api } from '../api'

export default function LeaveRequestsPage() {
  return (
    <Resource
      name="leave-requests"
      columns={[
        { key: 'employee', label: 'Employee', sortable: true },
        { key: 'type', label: 'Type', filter: 'select', options: ['annual', 'sick', 'unpaid'] },
        { key: 'status', label: 'Status', filter: 'select', options: ['pending', 'approved', 'rejected'] },
        { key: 'start', label: 'Start date', filter: 'daterange' },
        { key: 'days', label: 'Days', sortable: true, filter: 'number' },
      ]}
      list={api.listLeaveRequests}
      update={api.updateLeaveRequest}
      actions={['edit']}
    />
  )
}
```

Each `<Resource>` renders toolbar, filters, table, cursor pagination, create/edit modal, and delete confirm. Full props: [app-layer.md](app-layer.md).

## 7. Dashboard page

```tsx
// src/pages/Dashboard.tsx
import { StatRow } from '@skiddph/prui/app'

export default function Dashboard() {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <StatRow
        items={[
          { label: 'Headcount', value: 142, delta: '+3 this month', trend: 'up' },
          { label: 'On leave today', value: 7, trend: 'flat' },
          { label: 'Pending requests', value: 12, delta: '-5 vs last week', trend: 'down' },
        ]}
      />
    </main>
  )
}
```

## 8. (Optional) auth pages

Either add `<LoginPage ... />` routes by hand or let `<App>` auto-route them:

```tsx
<App
  pages={{
    auth: {
      login: {
        fields: { username: true, remember: false },
        links: { register: '/register', forgot: '/forgot-password' },
        oauth: ['google', 'github'],
      },
    },
  }}
  ...
>
```

Full page set and prop shapes: [pages.md](pages.md).

## 9. Run it

```bash
pnpm dev
```

## 10. Verify

Run the full checklist in [verification.md](verification.md). The short version: responsive drawer, keyboard nav, visible focus, empty/error/loading states per resource, theme persistence, generated routes match nav config, 390px/1440px sanity. Fix failures before reporting done.

## Failure modes to watch for

- Nav `href` without a matching `<Route>`: blank outlet; keep them in lockstep.
- `filter: 'select'` without `options`: invalid config; always include options.
- Custom fonts or tailwind conflicts: PRUI keeps its own tokens; scope your font CSS, do not fight `--radius` globally unless intended.
