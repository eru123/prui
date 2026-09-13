import { LayoutDashboard, Users, CalendarDays, TrendingUp } from "lucide-react"
import { App, Form, Settings, appPropsMeta, resourcePropsMeta, formPropsMeta, settingsPropsMeta, authShellPropsMeta, sessionTimeoutPropsMeta, type NavItem } from "prui/app"
import type { PropsMeta } from "prui/core"
import { MetaOnly, PropsTable } from "../../components/Playground"
import { CodeView } from "../../components/CodeView"
import { TocRail } from "../../components/TocRail"
import { IframePortal } from "../../components/IframePortal"

/** App-layer catalog: App, Resource, Form, Settings + auth exports. */

const DEMO_NAV: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Employees", href: "/employees", icon: Users },
  {
    label: "Leave",
    icon: CalendarDays,
    items: [
      { label: "Requests", href: "/leave/requests" },
      { label: "Balances", href: "/leave/balances" },
    ],
  },
]

const SHELL_NAV: NavItem[] = [
  { label: "Home", href: "/", icon: LayoutDashboard },
  { label: "Team", href: "/team", icon: Users },
  { label: "Reports", href: "/reports", icon: CalendarDays },
]

const VARIANTS: { v: "A" | "B"; name: string; blurb: string }[] = [
  { v: "A", name: "A · full-height sidebar", blurb: "Sidebar spans the full height; the header sits in the content column. Collapses to an icon rail." },
  { v: "B", name: "B · full-width header", blurb: "Header across the top with the sidebar below it. Collapses to an icon rail." },
]

const APP_TOC = [
  { id: "app-shell", label: "App" },
  { id: "shell-layouts", label: "Shell layouts" },
  { id: "resource", label: "Resource" },
  { id: "form", label: "Form" },
  { id: "settings-comp", label: "Settings" },
  { id: "auth-exports", label: "Auth exports" },
]

export function AppLayerDoc() {
  return (
    <div className="mx-auto flex w-full max-w-[1080px] justify-center gap-6 px-4 pb-20 pt-8 md:px-6">
      <div className="min-w-0 max-w-[820px] flex-1">
        <div className="mb-2 font-mono text-xs text-[var(--prui-dim)]">components / app layer</div>
        <h1 className="mb-1.5 text-[27px] font-bold tracking-tight text-[var(--prui-fg)]">App layer</h1>
        <p className="mb-8 max-w-[60ch] text-[15px] text-[var(--prui-dim)]">
          Config-driven super-components: the whole admin surface from props. Import from{" "}
          <code className="rounded bg-[var(--prui-raise)] px-1">@skiddph/prui/app</code>.
        </p>

        {/* App */}
        <section id="app-shell" className="mb-10 scroll-mt-20">
          <h2 className="mb-3 font-mono text-sm font-semibold text-[var(--prui-brand)]">App</h2>
          <p className="mb-3 text-sm text-[var(--prui-dim)]">
            One component renders the shell: sidebar, header, command palette, theme, mobile drawer. This live demo
            runs the real <code className="rounded bg-[var(--prui-raise)] px-1">&lt;App&gt;</code> in an isolated frame.
            This site's own chrome is the same component.
          </p>
          <div className="overflow-hidden rounded-[var(--prui-radius)] border border-[var(--prui-line)]">
            <IframePortal title="App demo" testId="app-demo" height={420}>
              {(doc) => {
                doc.documentElement.classList.add("prui-root", "prui-theme-control", "prui-mode-dark")
                const body = doc.body
                body.style.margin = "0"
                body.style.background = "var(--prui-background)"
                return (
                  <App
                    router="memory"
                    brand={{ name: "HRLabs" }}
                    nav={DEMO_NAV}
                    search={{ enabled: true, hotkey: "/" }}
                    theme={false}
                    sidebar={{ width: 220 }}
                  >
                    <DemoHome />
                  </App>
                )
              }}
            </IframePortal>
          </div>
          <div className="mt-3">
            <CodeView
              code={`import { App } from '@skiddph/prui/app'

<App
  brand={{ name: 'HRLabs', mark: '/logo.svg' }}
  nav={[
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Employees', href: '/employees', icon: Users },
    { label: 'Leave', icon: CalendarDays, items: [
      { label: 'Requests', href: '/leave/requests' },
    ] },
  ]}
  search={{ enabled: true, hotkey: '/' }}
  theme={{ default: 'dark', persist: true }}
  auth={{ sessionTimeout: 30 }}
>
  {routes}
</App>`}
              title="app.tsx"
              height={280}
            />
          </div>
          <MetaOnly meta={appPropsMeta} />
        </section>

        {/* Shell layouts */}
        <section id="shell-layouts" className="mb-10 scroll-mt-20">
          <h2 className="mb-3 font-mono text-sm font-semibold text-[var(--prui-brand)]">Shell layouts</h2>
          <p className="mb-4 max-w-[62ch] text-sm text-[var(--prui-dim)]">
            One prop, four desktop arrangements, driven by CSS grid areas. Mobile always uses the drawer.
          </p>
          <div className="flex flex-col gap-8">
            {VARIANTS.map((v) => (
              <div key={v.v}>
                <div className="mb-2 flex items-baseline justify-between">
                  <div className="font-mono text-xs text-[var(--prui-fg)]">{v.name}</div>
                  <div className="font-mono text-[10px] text-[var(--prui-dim)]">layoutType='{v.v}'</div>
                </div>
                <div className="overflow-hidden rounded-[var(--prui-radius)] border border-[var(--prui-line)]">
                  <IframePortal title={`Shell ${v.v}`} height={360}>
                    {(doc) => {
                      doc.documentElement.classList.add("prui-root", "prui-theme-control", "prui-mode-dark")
                      const body = doc.body
                      body.style.margin = "0"
                      body.style.background = "var(--prui-background)"
                      // <App router="memory"> brings its own MemoryRouter
                      return (
                        <App
                          router="memory"
                          layoutType={v.v}
                          brand={{ name: "Acme" }}
                          nav={SHELL_NAV}
                          search={{ enabled: true, hotkey: "/" }}
                          theme={false}
                          sidebar={{ width: 190 }}

                        >
                          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {[0, 1, 2].map((i) => (
                              <div key={i} style={{ height: 56, borderRadius: "var(--prui-radius)", border: "1px solid var(--prui-line)", background: "var(--prui-surface)" }} />
                            ))}
                          </div>
                        </App>
                      )
                    }}
                  </IframePortal>
                </div>
                <p className="mt-2 text-xs text-[var(--prui-dim)]">{v.blurb}</p>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <CodeView
              code={`import { App } from '@skiddph/prui/app'

// A (default): sidebar full height, header in the content column
<App layoutType="A" nav={nav}>{routes}</App>

// B: full-width header, sidebar below it
<App layoutType="B" nav={nav}>{routes}</App>

// both collapse to an icon rail via the header toggle, on desktop and
// mobile (the header button switches the phone to rail mode).`}
              title="layoutType.tsx"
              height={240}
            />
          </div>
        </section>

        {/* Resource */}
        <section id="resource" className="mb-10 scroll-mt-20">
          <h2 className="mb-3 font-mono text-sm font-semibold text-[var(--prui-brand)]">Resource</h2>
          <p className="mb-3 text-sm text-[var(--prui-dim)]">
            A complete CRUD screen from a column config and your API functions. See it live on the{" "}
            <a className="text-[var(--prui-brand)] hover:underline" href="/resources">Resources demo page</a>.
          </p>
          <MetaOnly meta={resourcePropsMeta} />
        </section>

        {/* Form */}
        <section id="form" className="mb-10 scroll-mt-20">
          <h2 className="mb-3 font-mono text-sm font-semibold text-[var(--prui-brand)]">Form</h2>
          <p className="mb-3 text-sm text-[var(--prui-dim)]">Fields from a schema; the schema may be a bare array or <code className="rounded bg-[var(--prui-raise)] px-1">{"{ fields }"}</code>. Validation display included.</p>
          <div className="rounded-[var(--prui-radius)] border border-dashed border-[var(--prui-line)] p-5">
            <div className="w-full max-w-md">
              <Form
                schema={{
                  submitLabel: "Create employee",
                  fields: [
                    { name: "name", label: "Name", required: true },
                    { name: "email", label: "Email", type: "email", required: true },
                    { name: "status", label: "Status", type: "select", options: ["active", "on-leave"] },
                    { name: "hired", label: "Hired", type: "date" },
                    { name: "notes", label: "Notes", type: "textarea" },
                  ],
                }}
                onCancel={() => {}}
                onSubmit={async () => {}}
              />
            </div>
          </div>
          <div className="mt-3">
            <CodeView
              code={`import { Form } from '@skiddph/prui/app'

<Form
  schema={[
    { name: 'name', label: 'Name', required: true },
    { name: 'status', label: 'Status', type: 'select',
      options: ['active', 'on-leave'] },
  ]}
  onSubmit={async (values) => save(values)}
/>`}
              title="form.tsx"
              height={180}
            />
          </div>
          <MetaOnly meta={formPropsMeta} />
        </section>

        {/* Settings */}
        <section id="settings-comp" className="mb-10 scroll-mt-20">
          <h2 className="mb-3 font-mono text-sm font-semibold text-[var(--prui-brand)]">Settings</h2>
          <p className="mb-3 text-sm text-[var(--prui-dim)]">Two-column settings page from a section list. Fields take a type + value, or any control node.</p>
          <div className="rounded-[var(--prui-radius)] border border-dashed border-[var(--prui-line)] p-5">
            <Settings
              title="Workspace"
              sections={[
                {
                  id: "org",
                  label: "Organization",
                  fields: [
                    { label: "Organization name", name: "orgName", type: "text", value: "HRLabs" },
                    { label: "Region", name: "region", type: "select", options: ["EU", "APAC", "US"], value: "APAC" },
                    { label: "Auto-approve leave", name: "autoApprove", type: "switch", value: true },
                  ],
                },
              ]}
            />
          </div>
          <MetaOnly meta={settingsPropsMeta} />
        </section>

        {/* Auth exports */}
        <section id="auth-exports" className="mb-10 scroll-mt-20">
          <h2 className="mb-3 font-mono text-sm font-semibold text-[var(--prui-brand)]">Auth exports</h2>
          <p className="mb-4 text-sm text-[var(--prui-dim)]">
            From HRLabs' session flow: <code className="rounded bg-[var(--prui-raise)] px-1">&lt;AuthShell&gt;</code> is the
            centered card layout for login/OTP screens; <code className="rounded bg-[var(--prui-raise)] px-1">&lt;SessionTimeout&gt;</code>{" "}
            tracks idle time and shows a countdown warning; or wire both through{" "}
            <code className="rounded bg-[var(--prui-raise)] px-1">{"<App auth={{ sessionTimeout: 30 }}>"}</code>.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-[var(--prui-dim)]">AuthShell</div>
              <PropsTable meta={authShellPropsMeta as PropsMeta} />
            </div>
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-[var(--prui-dim)]">SessionTimeout</div>
              <PropsTable meta={sessionTimeoutPropsMeta as PropsMeta} />
            </div>
          </div>
        </section>
      </div>

      <TocRail items={APP_TOC} />
    </div>
  )
}

function DemoHome() {
  return (
    <div style={{ padding: 20 }}>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Headcount", value: 142, delta: "+3", icon: Users },
          { label: "On leave", value: 7, delta: "-2", icon: CalendarDays },
          { label: "Open roles", value: 4, delta: "+1", icon: TrendingUp },
        ].map((s) => (
          <div key={s.label} className="rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-surface)] p-4">
            <div className="flex items-center gap-1.5 text-xs text-[var(--prui-dim)]">
              <s.icon className="h-3.5 w-3.5" aria-hidden /> {s.label}
            </div>
            <div className="pt-1 text-2xl font-semibold text-[var(--prui-fg)]">{s.value}</div>
            <div className="text-xs" style={{ color: s.delta.startsWith("+") ? "var(--prui-ok)" : "var(--prui-danger)" }}>{s.delta}</div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-[var(--prui-dim)]">Press <kbd className="rounded border border-[var(--prui-line)] px-1">/</kbd> for the command palette.</p>
    </div>
  )
}
