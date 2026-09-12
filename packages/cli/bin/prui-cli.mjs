#!/usr/bin/env node
/**
 * create-prui-app / prui-cli
 *
 * PRUI's developer-experience CLI. Node built-ins only (no runtime deps):
 *
 *   npm create prui-app@latest my-admin          scaffold a Vite + prui app
 *   npx prui-cli add toast                       print a component starter
 *   npx prui-cli generate theme brand.json       emit a defineTheme module
 *   npx prui-cli generate resource employees     emit a Resource page
 *   npx prui-cli generate page dashboard         emit a route page
 *   npx prui-cli generate layout A               emit a layoutType config
 *   npx prui-cli generate crud employees         app + resource + routes
 */
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs"
import { resolve, join } from "node:path"
import { execSync } from "node:child_process"
import process from "node:process"

const [, , command = "create", ...args] = process.argv

function fatal(msg) {
  console.error(`[prui-cli] ${msg}`)
  process.exit(1)
}

function pascal(s) {
  return s.replace(/(^|[-_])([a-z])/g, (_, __, c) => c.toUpperCase()).replace(/[^A-Za-z0-9]/g, "")
}

function title(s) {
  return s.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

/* ------------------------------------------------------------------ */
/* create: scaffold a Vite + React + prui app                          */
/* ------------------------------------------------------------------ */

const PKG = (name) =>
  JSON.stringify(
    {
      name,
      private: true,
      version: "0.0.0",
      type: "module",
      scripts: { dev: "vite", build: "vite build", preview: "vite preview" },
      dependencies: {
        "@skiddph/prui": "^0.7.0",
        react: "^19.0.0",
        "react-dom": "^19.0.0",
        "react-router-dom": "^7.6.0",
        "lucide-react": "^0.525.0",
      },
      devDependencies: { "@vitejs/plugin-react": "^4.5.0", vite: "^6.3.0" },
    },
    null,
    2,
  )

const INDEX_HTML = `<!doctype html>
<html>
  <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>__NAME__</title></head>
  <body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body>
</html>
`

const VITE_CONFIG = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({ plugins: [react()] })
`

const MAIN_TSX = `import { createRoot } from 'react-dom/client'
import '@skiddph/prui/styles.css'
import { App, Routes, Route } from '@skiddph/prui/app'
import Dashboard from './pages/Dashboard'

createRoot(document.getElementById('root')!).render(
  <App
    brand={{ name: '__NAME__' }}
    nav={[
      { label: 'Dashboard', href: '/' },
      // add resources here: { label: 'Employees', href: '/employees' },
    ]}
    search={{ enabled: true, hotkey: '/' }}
    theme={{ default: 'dark', persist: true }}
  >
    <Routes>
      <Route path="/" element={<Dashboard />} />
    </Routes>
  </App>,
)
`

const DASHBOARD_TSX = `export default function Dashboard() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <p className="text-sm text-[var(--prui-dim)]">
        Scaffolded by create-prui-app. Add resources with:
        <code className="ml-1 rounded bg-[var(--prui-raise)] px-1">npx prui-cli generate crud employees</code>
      </p>
    </div>
  )
}
`

function createApp(dirArg) {
  if (!dirArg) fatal("usage: npm create prui-app <directory>")
  const root = resolve(process.cwd(), dirArg)
  if (existsSync(root)) fatal(`directory ${dirArg} already exists`)
  const name = dirArg.split(/[/\\]/).pop().replace(/[^a-z0-9-]/gi, "-").toLowerCase()

  mkdirSync(join(root, "src/pages"), { recursive: true })
  writeFileSync(join(root, "package.json"), PKG(name))
  writeFileSync(join(root, "index.html"), INDEX_HTML.replaceAll("__NAME__", title(name)))
  writeFileSync(join(root, "vite.config.ts"), VITE_CONFIG)
  writeFileSync(join(root, "src/main.tsx"), MAIN_TSX.replaceAll("__NAME__", title(name)))
  writeFileSync(join(root, "src/pages/Dashboard.tsx"), DASHBOARD_TSX)
  writeFileSync(join(root, ".gitignore"), "node_modules\ndist\n")

  console.log(`[prui-cli] scaffolded ${dirArg}/`)
  const npm = process.platform === "win32" ? "npm.cmd" : "npm"
  try {
    execSync(`${npm} install`, { cwd: root, stdio: "inherit" })
    console.log(`[prui-cli] done. cd ${dirArg} && npm run dev`)
  } catch {
    console.log(`[prui-cli] skipped install (offline?). cd ${dirArg} && npm install && npm run dev`)
  }
}

/* ------------------------------------------------------------------ */
/* add <component>: print a runnable starter                            */
/* ------------------------------------------------------------------ */

const COMPONENT_STARTERS = {
  toast: `import { Toaster, toast } from '@skiddph/prui/core'

<Toaster />
<Button onClick={() => toast({ title: 'Saved', variant: 'success' })}>Save</Button>`,
  alert: `import { Alert } from '@skiddph/prui/core'

<Alert variant="warning" title="Approaching limit" onDismiss={() => setShow(false)}>
  8 of 10 seats used.
</Alert>`,
  tooltip: `import { Tooltip } from '@skiddph/prui/core'

<Tooltip content="Deletes permanently">
  <Button variant="danger">Delete</Button>
</Tooltip>`,
  popover: `import { Popover } from '@skiddph/prui/core'

<Popover ariaLabel="Filters" trigger={<Button>Filters</Button>}>
  <Checkbox label="Active only" defaultChecked />
</Popover>`,
  checkbox: `import { Checkbox } from '@skiddph/prui/core'

<Checkbox label="Email notifications" defaultChecked onChange={setEmails} />`,
  radio: `import { RadioGroup, Radio } from '@skiddph/prui/core'

<RadioGroup label="Plan" defaultValue="pro" onChange={setPlan}>
  <Radio value="free" label="Free" />
  <Radio value="pro" label="Pro" />
</RadioGroup>`,
  combobox: `import { Combobox } from '@skiddph/prui/core'

<Combobox
  aria-label="Assignee"
  options={users.map((u) => ({ label: u.name, value: u.id }))}
  value={assignee}
  onChange={setAssignee}
/>`,
  skeleton: `import { Skeleton } from '@skiddph/prui/core'

<Skeleton variant="text" lines={3} />`,
  spinner: `import { Spinner } from '@skiddph/prui/core'

<Spinner label="Loading results" />`,
  progress: `import { Progress } from '@skiddph/prui/core'

<Progress value={62} showValue aria-label="Upload" />`,
  accordion: `import { Accordion, AccordionItem } from '@skiddph/prui/core'

<Accordion defaultValue={['a']}>
  <AccordionItem value="a">Account<div>…</div></AccordionItem>
</Accordion>`,
  breadcrumb: `import { Breadcrumb, BreadcrumbItem } from '@skiddph/prui/core'

<Breadcrumb>
  <BreadcrumbItem href="/">Home</BreadcrumbItem>
  <BreadcrumbItem current>Orders</BreadcrumbItem>
</Breadcrumb>`,
  drawer: `import { Drawer } from '@skiddph/prui/core'

<Drawer open={open} onOpenChange={setOpen} ariaLabel="Details" side="right">
  <Detail row={row} />
</Drawer>`,
  sheet: `import { Sheet } from '@skiddph/prui/core'

<Sheet open={open} onOpenChange={setOpen} ariaLabel="Filters">
  <FilterForm />
</Sheet>`,
  "file-upload": `import { FileUpload } from '@skiddph/prui/core'

<FileUpload multiple accept=".pdf" maxSize={1024 * 1024} onFiles={setFiles} />`,
  "date-picker": `import { DatePicker } from '@skiddph/prui/core'

<DatePicker value={due} onChange={setDue} ariaLabel="Due date" />`,
  "date-range-picker": `import { DateRangePicker } from '@skiddph/prui/core'

<DateRangePicker value={range} onChange={setRange} ariaLabel="Report range" />`,
  "tree-view": `import { TreeView } from '@skiddph/prui/core'

<TreeView ariaLabel="Files" items={treeItems} onSelect={(id) => setSelected(id)} />`,
  timeline: `import { Timeline } from '@skiddph/prui/core'

<Timeline items={events.map((e) => ({ title: e.label, time: e.at }))} />`,
  calendar: `import { Calendar } from '@skiddph/prui/core'

<Calendar value={date} onSelect={setDate} aria-label="Pick a date" />`,
}

function addComponent(name) {
  const starter = COMPONENT_STARTERS[name]
  if (!starter) {
    fatal(
      `unknown component "${name}". available: ${Object.keys(COMPONENT_STARTERS).join(", ")}`,
    )
  }
  console.log(starter)
}

/* ------------------------------------------------------------------ */
/* generate <kind> <name>                                              */
/* ------------------------------------------------------------------ */

const resourcePage = (entity) => `import { Resource } from '@skiddph/prui/app'

export default function ${pascal(entity)}Page() {
  return (
    <Resource<${pascal(entity)}>
      name="${entity}"
      columns={[
        { key: 'name', label: 'Name', sortable: true },
        { key: 'status', label: 'Status', filter: 'select', filterOptions: [
          { label: 'Active', value: 'active' }, { label: 'Archived', value: 'archived' },
        ] },
        { key: 'createdAt', label: 'Created', filter: 'date' },
      ]}
      list={async (query) => {
        // wire to your API; return { rows, nextCursor }
        return { rows: [], nextCursor: null }
      }}
      create={async (values) => { /* POST /api/${entity} */ }}
      update={async (row, values) => { /* PATCH /api/${entity}/\${row.id} */ }}
      remove={async (row) => { /* DELETE /api/${entity}/\${row.id} */ }}
      selectable
    />
  )
}

interface ${pascal(entity)} {
  id: string
  name: string
  status: string
  createdAt: string
}
`

const plainPage = (name) => `export default function ${pascal(name)}() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-xl font-semibold">${title(name)}</h1>
      <p className="text-sm text-[var(--prui-dim)]">Build me out.</p>
    </div>
  )
}
`

const themeModule = (jsonArg) => {
  let tokens = { brand: "#2563eb", mode: "dark" }
  if (jsonArg) {
    try {
      tokens = JSON.parse(readFileSync(resolve(process.cwd(), jsonArg), "utf8"))
    } catch {
      fatal(`could not read/parse ${jsonArg}`)
    }
  }
  return `import { defineTheme, applyTheme } from '@skiddph/prui/theme'

// generated by: prui-cli generate theme${jsonArg ? ` ${jsonArg}` : ""}
const slug = defineTheme('${String(tokens.name ?? "custom")}', ${JSON.stringify(tokens, null, 2)})

applyTheme({ theme: slug })
`
}

const layoutSnippet = (type) => `// layoutType ${type}
<App
  layoutType="${type}"
${type === "C" ? "  sidebarHeader={<span>Workspace header row</span>}\n" : ""}${type === "D" ? "  sidebarFooter={<Button variant=\"primary\">New project</Button>}\n" : ""}  brand={{ name: 'My app' }}
  nav={nav}
>
  {children}
</App>
`

const crudApp = (entity) => MAIN_TSX.replace(
  "      // add resources here: { label: 'Employees', href: '/employees' },",
  `      { label: '${title(entity)}', href: '/${entity}' },`,
).replace(
  "      <Route path=\"/\" element={<Dashboard />} />",
  `      <Route path="/" element={<Dashboard />} />
      <Route path="/${entity}" element={<${pascal(entity)}Page />} />`,
).replace(
  "import Dashboard from './pages/Dashboard'",
  `import Dashboard from './pages/Dashboard'\nimport ${pascal(entity)}Page from './pages/${pascal(entity)}'`,
)

function generate(kind, name) {
  if (!name && kind !== "theme") fatal(`usage: prui-cli generate ${kind} <name>`)
  const srcPages = "src/pages"
  switch (kind) {
    case "resource":
      mkdirSync(srcPages, { recursive: true })
      writeFileSync(join(srcPages, `${pascal(name)}Page.tsx`), resourcePage(name))
      console.log(`[prui-cli] wrote ${srcPages}/${pascal(name)}Page.tsx (wire it into a <Route>)`)
      break
    case "page":
      mkdirSync(srcPages, { recursive: true })
      writeFileSync(join(srcPages, `${pascal(name)}.tsx`), plainPage(name))
      console.log(`[prui-cli] wrote ${srcPages}/${pascal(name)}.tsx`)
      break
    case "theme":
      // name is an optional path to a tokens json file
      writeFileSync("src/theme.ts", themeModule(name))
      console.log("[prui-cli] wrote src/theme.ts (import it in main.tsx)")
      break
    case "layout":
      if (!["A", "B", "C", "D"].includes(name)) fatal("layout must be one of A, B, C, D")
      console.log(layoutSnippet(name))
      break
    case "crud":
      mkdirSync(srcPages, { recursive: true })
      writeFileSync(join(srcPages, `${pascal(name)}Page.tsx`), resourcePage(name))
      writeFileSync("src/main.tsx", crudApp(name))
      console.log(`[prui-cli] wrote ${srcPages}/${pascal(name)}Page.tsx and rewired src/main.tsx`)
      break
    default:
      fatal(`unknown generator "${kind}". use resource | page | theme | layout | crud`)
  }
}

/* ------------------------------------------------------------------ */

switch (command) {
  case "create":
    createApp(args[0])
    break
  case "add":
    addComponent(args[0])
    break
  case "generate":
  case "g":
    generate(args[0], args[1])
    break
  case "help":
  case "--help":
  case "-h":
    console.log(`create-prui-app <dir>            scaffold a Vite + prui app
prui-cli add <component>          print a component starter
prui-cli generate resource <name> emit a Resource page
prui-cli generate page <name>     emit a plain route page
prui-cli generate theme [json]    emit a defineTheme module
prui-cli generate layout <A-D>    print a layoutType snippet
prui-cli generate crud <name>     resource page + routes`)
    break
  default:
    fatal(`unknown command "${command}". try: prui-cli help`)
}
