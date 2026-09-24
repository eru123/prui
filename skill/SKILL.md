---
name: prui
description: Build React admin panels, dashboards, internal tools, and prototypes fast with PRUI config-driven super-components. Use when the user asks to build or prototype a React app, admin panel, dashboard, CRUD screen, or internal tool. Covers App shell + Resource CRUD configs, pre-made auth pages, theming, and verification, without reading the docs site.
---

# PRUI: apps as config, not projects

PRUI is a React component system with two layers:

- **App layer** (`prui/app`): config-driven super-components. `<App nav={...}>` renders the whole shell (sidebar, header, routes, theme). `<Resource columns={...}>` renders a complete CRUD screen. This layer builds a working admin app in minutes.
- **Primitives layer** (`prui/core`, `prui/data-table`): Button, Input, Select, Tabs, DataTable (headers align with their column; DataTablePagination takes optional totalPages/totalRows), and friends, for standard composition when you need full control. The catalog now also ships Toast (toast()/Toaster), Alert, Tooltip, Popover, Dropdown (DropdownItem takes a leading icon for row-action menus), Checkbox, Radio, Combobox, Skeleton, Spinner, Progress, Accordion, Breadcrumb, Drawer, Sheet, FileUpload, Calendar, DatePicker (timepicker option), DateRangePicker (maxRange caps), TimePicker (12-hour with AM/PM by default; hour12={false} for the 24-hour grid — values stay "HH:mm"), TimeRangePicker, TreeView, and Timeline — all keyboard-complete, themable, and controlled/uncontrolled. Modal takes title/description for an in-flow header (the close button reserves the corner instead of overlaying content) and dismissible={false} to shake off reflex Esc/overlay dismissal.

Routing is owned by `<App>`: it wires the router, binds nav to routes, and detects active state. You never wire react-router manually (react-router-dom arrives as a dependency of prui).

## When to use this skill

- User asks to build or prototype a React app, admin panel, dashboard, or internal tool
- User wants CRUD screens (list, filter, sort, paginate, create, edit, delete) without writing table/filter/modal plumbing
- User wants consistent theming (light/dark, named themes, brand tokens) across an app
- User asks to add auth pages (login, register, OTP, forgot/reset) or utility pages (404, error, profile, settings) to an app

If the request is a single custom component (not an app structure), use `prui/core` primitives directly and skip the App layer.

## The fast path: two files to a working app

A two-resource admin app is `<App>` + a dashboard route + one `<Resource>` per entity. All copy-paste configs below are internally consistent with [references/app-layer.md](references/app-layer.md).

**src/main.tsx**

```tsx
import { createRoot } from 'react-dom/client'
import { App, Routes, Route } from '@skiddph/prui/app'
import { LayoutDashboard, Users, CalendarDays } from 'lucide-react'
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

Install lucide-react alongside the package (it is a peer dependency):

```bash
pnpm add lucide-react
```

**src/pages/EmployeesPage.tsx**

```tsx
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

That is the whole surface for most apps. Full props for `App`, `Resource`, `Form`, `StatRow`, and `Settings` are in [references/app-layer.md](references/app-layer.md).

## Reference map

Read only what the task needs:

| Task | Read |
|---|---|
| Shell config, CRUD screens, forms, KPI rows, settings page | [references/app-layer.md](references/app-layer.md) |
| Login/register/OTP/404/error/profile pages, auto-routing with `pages="auth"` | [references/pages.md](references/pages.md) |
| Brand colors, light/dark, named themes, token overrides | [references/theming.md](references/theming.md) |
| Fitting PRUI into an existing app, import paths, tree-shaking | [references/adoption.md](references/adoption.md) |
| Done-checklist before declaring the app finished | [references/verification.md](references/verification.md) |
| End-to-end scaffold from an empty directory (start here for new apps) | [references/agents-workflow.md](references/agents-workflow.md) |

## Ground rules

1. For a new app, follow [references/agents-workflow.md](references/agents-workflow.md) top to bottom; it is the complete path from empty directory to verified app.
2. Reach for the App layer first (`prui/app`); drop to primitives (`prui/core`, `prui/data-table`) only where config does not fit. See [references/adoption.md](references/adoption.md).
3. Never hand-write sidebar, header, table toolbar, filter, pagination, or theme-toggle components; PRUI already ships them, configured by props.
4. `<Resource>` consumes your API functions; it never generates an API. You always write the `list`/`create`/`update`/`delete` functions yourself.
5. Before declaring done, run the checklist in [references/verification.md](references/verification.md).
6. Style through props, not restyling: `variant`/`size`/`surface` carry the design, `className` is for layout only (`mt-4`, `w-full`, `flex`, `gap-2`), and colors come from tokens (`text-[var(--prui-dim)]`) or variants — never raw palette classes (`bg-pink-500`), arbitrary one-offs (`p-[13px]`), or inline styles. The prui repo enforces this with `@shadcn/lint` (see its AGENTS.md); if your project installs it (`@shadcn/lint` + the `shadcn/*` rules with `componentImports: ["^@skiddph/prui(/|$)"]`), run `npm run lint` after changes and fix every error — the messages name the correct prop or token to use.
