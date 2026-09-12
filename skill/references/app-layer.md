# App layer: super-components reference

All imports come from `@skiddph/prui/app` (route helpers `Routes`/`Route`/`Outlet`/`Link`/`NavLink`/`Navigate` are re-exported here too — never import react-router-dom directly):

```tsx
import { App, Resource, Form, StatRow, Settings } from '@skiddph/prui/app'
```

The App layer owns routing: `<App>` wires the router, binds nav items to routes, and highlights the active route. You supply the routes as children and nav as a config array; you never touch router setup yourself. `lucide-react` is a peer dependency, so import icons from `lucide-react` yourself.

Every super-component is a thin orchestration over exported primitives. No hidden magic, every part overridable via slots, all config typed.

## `<App>`

One component, the whole shell: responsive sidebar (collapsible groups, active-route highlight, mobile drawer with backdrop and scroll lock), sticky header (brand slot, centered search, theme toggle), command palette, theme persistence, session timeout handling, and the content outlet.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `brand` | `{ name: string; mark?: string }` | - | App name and optional logo path shown in sidebar and header |
| `nav` | `NavItem[]` | `[]` | Sidebar navigation tree |
| `search` | `{ enabled: boolean; hotkey?: string }` | - | Command palette config; hotkey is a single-key trigger such as `'/'` |
| `theme` | `{ default: 'light' \| 'dark'; persist?: boolean }` | - | Theme default and localStorage persistence |
| `auth` | `{ sessionTimeout?: number }` | - | Session timeout in minutes; renders the timeout flow |
| `header` | `ReactNode` | - | Extra content rendered in the header's right cluster |
| `sidebar` | `{ collapsible?: boolean; width?: number; defaultOpen?: boolean }` | - | Sidebar behavior and dimensions |
| `router` | `'react-router' \| 'memory'` | `'react-router'` | `memory` for embedded or demo use (works outside a URL context) |
| `pages` | `string` (e.g. `'auth'`) | - | Auto-route the pre-made page set; see [pages.md](pages.md) |
| children | `ReactNode` | - | The route tree (react-router `<Routes>`), rendered in the content outlet |

### NavItem

```ts
type NavItem = {
  label: string
  href?: string            // leaf item: route to link to
  icon?: LucideIcon        // lucide-react icon component
  items?: NavItem[]        // group: nested items, rendered collapsible
}
```

A leaf has `href`; a group has `items`. Do not set both.

### Example: the HRLabs two-resource shell

```tsx
import { App, Routes, Route } from '@skiddph/prui/app'
import { LayoutDashboard, Users, CalendarDays } from 'lucide-react'

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
  sidebar={{ collapsible: true, defaultOpen: true }}
>
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/employees" element={<EmployeesPage />} />
    <Route path="/leave/requests" element={<LeaveRequestsPage />} />
    <Route path="/leave/balances" element={<BalancesPage />} />
  </Routes>
</App>
```

Every `href` in `nav` must have a matching `<Route>`; the checklist in [verification.md](verification.md) checks nav config against generated routes.

## `<Resource>`

A complete CRUD screen from a schema: toolbar + faceted filters + DataTable + cursor pagination + create/edit modal + delete confirmation, wired to your API functions.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | required | Resource identifier; used in labels and modal titles |
| `columns` | `Column[]` | required | Column and filter definitions |
| `list` | `(query) => Promise<{ rows: T[]; cursor?: string }>` | required | Fetch a page; receives current query (filters, sort, cursor) |
| `create` | `(values) => void \| Promise<void>` | - | Enables the create action |
| `update` | `(row: T, values) => void \| Promise<void>` | - | Enables the edit action; receives the row |
| `remove` | `(row: T) => void \| Promise<void>` | - | Enables delete (confirm dialog is automatic); `delete` is an alias |
| `pageSize` | `number` | `20` | Rows per page |
| `form` | `ReactNode` | - | Optional custom form for create/edit; omit to auto-generate from columns |
| `actions` | `('create' \| 'edit' \| 'delete')[]` | all | Which row/toolbar actions to show |
| `state` | `Partial<{ page, pageSize, search, filters, sort, selection, expandedRows }>` | - | Controlled state (per-key); omit keys to leave them uncontrolled |
| `defaultState` | same shape | - | Initial values for uncontrolled keys |
| `onStateChange` | `(state) => void` | - | Fires with the complete state on any change |
| `onPageChange` | `(page: number) => void` | - | Granular page callback |
| `onFilterChange` | `(filters) => void` | - | Granular filters callback |
| `onSortChange` | `(sort) => void` | - | Granular sort callback |
| `onSearchChange` | `(search: string) => void` | - | Granular search callback |
| `selectable` | `boolean \| { multiple?: boolean }` | - | Adds a checkbox column; selection lands in state.selection |
| `renderExpandedRow` | `(row) => ReactNode` | - | Adds expandable row detail; open keys land in state.expandedRows |
| `searchDebounce` | `number` | `250` | ms before search refires list() |

### Column

```ts
type Column = {
  key: string                      // row field to display
  label: string                    // column heading
  sortable?: boolean               // click-to-sort
  filter?: 'select' | 'date' | 'daterange' | 'number' | 'price' | 'time'
  options?: (string | number)[]    // choices, required when filter is 'select'
}
```

Filter type names map to the prui DataTable filter family; `filter: 'select'` requires `options`.

### Example: employees

```tsx
import { Resource } from '@skiddph/prui/app'
import { api } from '../api'

const statuses = ['active', 'on-leave', 'offboarded']

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
```

### Example: leave requests (second resource)

```tsx
import { Resource } from '@skiddph/prui/app'
import { api } from '../api'

const leaveStatuses = ['pending', 'approved', 'rejected']

<Resource
  name="leave-requests"
  columns={[
    { key: 'employee', label: 'Employee', sortable: true },
    { key: 'type', label: 'Type', filter: 'select', options: ['annual', 'sick', 'unpaid'] },
    { key: 'status', label: 'Status', filter: 'select', options: leaveStatuses },
    { key: 'start', label: 'Start date', filter: 'daterange' },
    { key: 'days', label: 'Days', sortable: true, filter: 'number' },
  ]}
  list={api.listLeaveRequests}
  update={api.updateLeaveRequest}   // e.g. approve/reject
  actions={['edit']}
/>
```

Notes:

- Include `create`/`update`/`delete` only for the actions the resource actually supports, and mirror them in `actions`.
- `list` receives the current query and returns `{ rows, cursor }`; pass the cursor back on the next call to fetch the next page. Pagination UI is automatic.
- Pass `form={<EmployeeForm />}` to replace the auto-generated create/edit form with your own (for example a `<Form schema={...}>`, below).

## `<Form>`

A schema-driven form: zero-boilerplate fields, required-markers and inline validation display included. The schema may be a bare field array or `{ fields, submitLabel }`; `defaultValues` is an alias of `initialValues`.

### Props

| Prop | Type | Description |
|---|---|---|
| `schema` | `FieldSchema[] \| { fields, submitLabel?, columns? }` | Field definitions (below) |
| `onSubmit` | `(values) => Promise<void> \| void` | Called with validated values |
| `defaultValues` | `Partial<Record<string, unknown>>` | Initial values, for edit mode (alias of `initialValues`) |
| `onCancel` | `() => void` | Shows a cancel button when set |
| `error` | `string \| null` | Renders an error banner above the actions |

### FieldSchema

```ts
type FieldSchema = {
  name: string
  label: string
  type?: 'text' | 'email' | 'password' | 'number' | 'select' | 'date' | 'textarea' | 'boolean'
  options?: (string | number)[]   // for type 'select'; label/value pairs also accepted
  required?: boolean
  disabled?: boolean
  validate?: (value, values) => string | null
}
```

### Example: employee create/edit form

```tsx
import { Form } from '@skiddph/prui/app'
import { api } from '../api'

const employeeSchema = [
  { name: 'name', label: 'Full name', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'status', label: 'Status', type: 'select', options: ['active', 'on-leave', 'offboarded'] },
  { name: 'hired', label: 'Hired date', type: 'date' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
]

export function EmployeeForm({ employee, onDone }: { employee?: Employee; onDone: () => void }) {
  return (
    <Form
      schema={employeeSchema}
      defaultValues={employee}
      onSubmit={async (values) => {
        employee ? await api.updateEmployee(employee.id, values) : await api.createEmployee(values)
        onDone()
      }}
    />
  )
}
```

Use it standalone on a page, or hand it to `<Resource form={...}>`.

## `<StatRow>`

The KPI cards every dashboard starts with.

### Props

| Prop | Type | Description |
|---|---|---|
| `items` | `Stat[]` | Cards to render, left to right |

```ts
type Stat = {
  label: string
  value: string | number
  delta?: string        // e.g. '+12% vs last month'
  trend?: 'up' | 'down' | 'flat'
}
```

### Example

```tsx
import { StatRow } from '@skiddph/prui/app'

<StatRow
  items={[
    { label: 'Headcount', value: 142, delta: '+3 this month', trend: 'up' },
    { label: 'On leave today', value: 7, trend: 'flat' },
    { label: 'Pending requests', value: 12, delta: '-5 vs last week', trend: 'down' },
  ]}
/>
```

## `<Settings>`

A two-column settings page from a section list.

### Props

| Prop | Type | Description |
|---|---|---|
| `sections` | `SettingsSection[]` | Left nav entry plus its fields |

```ts
type SettingsSection = {
  id: string
  label?: string            // or title
  description?: string
  fields: {
    name: string
    label: string
    type?: 'text' | 'select' | 'switch' | 'number'
    options?: (string | number)[]   // for type 'select'
    value?: string | number | boolean
    onChange?: (value) => void      // omit + pass `control` for a custom node
    description?: string
  }[]
  content?: ReactNode       // fully custom section body
}
```

### Example

```tsx
import { Settings } from '@skiddph/prui/app'

<Settings
  sections={[
    {
      id: 'workspace',
      label: 'Workspace',
      fields: [
        { name: 'orgName', label: 'Organization name', type: 'text', value: 'HRLabs' },
        { name: 'timezone', label: 'Timezone', type: 'select', options: ['UTC', 'Asia/Manila', 'Europe/Berlin'] },
      ],
    },
    {
      id: 'leave-policy',
      label: 'Leave policy',
      fields: [
        { name: 'annualDays', label: 'Annual leave days', type: 'number', value: 20 },
        { name: 'autoApprove', label: 'Auto-approve under 3 days', type: 'switch', value: false },
      ],
    },
  ]}
/>
```

## Composition recipe

An admin app is `<App>` + a dashboard route (often just `<StatRow>` + content) + one `<Resource>` per entity. That is the entire surface you need:

```tsx
// pages/Dashboard.tsx
import { StatRow } from '@skiddph/prui/app'

export default function Dashboard() {
  return (
    <main>
      <StatRow items={[...]} />
      {/* recent-activity list, charts, etc. */}
    </main>
  )
}
```

Wire each page into the `<App>` children's `<Routes>`, one `<Route>` per nav `href`. Then run [verification.md](verification.md).
