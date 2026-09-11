import * as React from "react"
import { useSearchParams } from "react-router-dom"
import { Button, Input, Label, Switch, Select, Card, CardHeader, CardTitle, CardContent, Badge, Separator } from "prui/core"
import { PRUI_THEMES, type ThemeName } from "prui/theme"
import type { NavItem } from "prui/app"
import { CopyButton } from "../components/Playground"
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react"

/**
 * /designer — visual app builder (proposal AC-12/13).
 * Canvas: live <App> preview in an iframe (isolated tokens). Tools panel:
 * branding, nav editor, structure toggles, theme. State round-trips through
 * the URL; Generate produces the <App> invocation + token CSS.
 */

interface DesignerState {
  name: string
  mark: string
  theme: ThemeName
  sidebar: boolean
  palette: boolean
  nav: NavItem[]
}

const DEFAULT_STATE: DesignerState = {
  name: "HRLabs",
  mark: "",
  theme: "control",
  sidebar: true,
  palette: true,
  nav: [
    { label: "Dashboard", href: "/" },
    { label: "Employees", href: "/employees" },
    {
      label: "Leave",
      items: [
        { label: "Requests", href: "/leave/requests" },
        { label: "Balances", href: "/leave/balances" },
      ],
    },
  ],
}

function encode(state: DesignerState): string {
  return encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(state)))))
}

function decode(raw: string | null): DesignerState | null {
  if (!raw) return null
  try {
    return JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(raw))))) as DesignerState
  } catch {
    return null
  }
}

const PREVIEW_DOC = (state: DesignerState) => `<!doctype html>
<html>
<head>
<script src="https://unpkg.com/react@19/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/react-router-dom@7/dist/umd/react-router-dom.production.min.js"></script>
<style>
body{margin:0;background:#000;color:#f4f4f5;font-family:system-ui,sans-serif}
aside{width:220px;border-right:1px solid #2a2a2e;background:#0f0f10;position:fixed;inset:0 auto 0 0;padding:14px 10px;box-sizing:border-box}
header{position:fixed;top:0;right:0;left:220px;height:52px;border-bottom:1px solid #2a2a2e;background:#0f0f10;display:flex;align-items:center;justify-content:space-between;padding:0 16px;box-sizing:border-box}
main{margin:52px 0 0 220px;padding:20px;color:#9b9ba4;font-size:13px}
.navitem{display:block;padding:7px 10px;border-radius:6px;color:#9b9ba4;text-decoration:none;font-size:13px;margin-bottom:1px}
.navitem:hover{background:#1a1a1c;color:#f4f4f5}
.navgroup{padding:7px 10px;color:#f4f4f5;font-size:13px;font-weight:600}
.subitem{display:block;padding:5px 10px 5px 24px;color:#9b9ba4;text-decoration:none;font-size:12.5px;border-radius:6px}
.subitem:hover{background:#1a1a1c;color:#f4f4f5}
.brand{font-weight:700;color:#f4f4f5;margin:4px 6px 14px;font-size:15px}
mark{background:rgba(124,156,255,.15);color:#7c9cff;border-radius:4px;padding:2px 6px;font-family:monospace;font-size:11px}
</style>
</head>
<body>
<aside>
  <div class="brand">${state.name || "App"}</div>
  ${state.nav
    .map((n) =>
      n.items
        ? `<div class="navgroup">${n.label}</div>` + n.items.map((c) => `<a class="subitem" href="#">${c.label}</a>`).join("")
        : `<a class="navitem" href="#">${n.label}</a>`,
    )
    .join("")}
</aside>
<header>
  <span>${state.palette ? `<mark>/</mark> search` : ""}</span>
  <span style="color:#9b9ba4;font-size:12px">${state.theme}</span>
</header>
<main>Content outlet — routes render here.</main>
</body>
</html>`

function generateCode(state: DesignerState): string {
  const navLiteral = JSON.stringify(state.nav, null, 2).replace(/^/gm, "").replace(/\n/g, "\n  ")
  return `import { App } from '@skiddph/prui/app'
import '@skiddph/prui/styles.css'

<App
  brand={{ name: '${state.name}'${state.mark ? `, mark: '${state.mark}'` : ""} }}
  nav={${navLiteral.replace(/"([a-zA-Z_]+)":/g, "$1:")}}
  search={{ enabled: ${state.palette} }}
  theme={{ default: '${state.theme}', persist: true }}
>
  {/* your routes */}
</App>`
}

export function DesignerPage() {
  const [params, setParams] = useSearchParams()
  const initial = React.useMemo(() => decode(params.get("c")) ?? DEFAULT_STATE, [params])
  const [state, setState] = React.useState<DesignerState>(initial)

  // URL round-trip (AC-13): push state to the URL whenever it changes
  React.useEffect(() => {
    const next = encode(state)
    if (params.get("c") !== next) setParams({ c: next }, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  const set = <K extends keyof DesignerState>(key: K, value: DesignerState[K]) =>
    setState((s) => ({ ...s, [key]: value }))

  const code = generateCode(state)

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 pb-20 pt-6 md:px-6">
      <div className="mb-2 font-mono text-xs text-[var(--prui-dim)]">designer / visual app builder</div>
      <h1 className="mb-1 text-2xl font-bold tracking-tight text-[var(--prui-fg)]">Designer</h1>
      <p className="mb-6 max-w-[60ch] text-sm text-[var(--prui-dim)]">
        Configure visually, copy the code. State lives in the URL — share the link, reproduce the exact config.
      </p>

      <div className="flex flex-col gap-4 lg:flex-row">
        {/* canvas */}
        <div className="min-w-0 flex-1">
          <div className="overflow-hidden rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-surface)]">
            <div className="flex items-center justify-between border-b border-[var(--prui-line)] px-4 py-2 font-mono text-[11px] text-[var(--prui-dim)]">
              <span>canvas / live preview</span>
              <Badge variant="ok">live</Badge>
            </div>
            <iframe
              title="App preview"
              data-testid="designer-canvas"
              className="h-[480px] w-full border-0"
              srcDoc={PREVIEW_DOC(state)}
            />
          </div>

          {/* generate */}
          <div className="mt-4 overflow-hidden rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-surface)]">
            <div className="flex items-center justify-between border-b border-[var(--prui-line)] px-4 py-2 font-mono text-[11px] text-[var(--prui-dim)]">
              <span>generate / paste into my app</span>
              <CopyButton text={code} />
            </div>
            <pre className="max-h-80 overflow-auto px-4 py-3 font-mono text-xs leading-relaxed text-[var(--prui-fg)]">{code}</pre>
          </div>
        </div>

        {/* tools panel */}
        <div className="w-full shrink-0 lg:w-96">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Developer tools</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {/* branding */}
              <div className="flex flex-col gap-3">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--prui-dim)]">branding</div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">App name</Label>
                  <Input value={state.name} onChange={(e) => set("name", e.target.value)} className="h-8" aria-label="App name" />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Mark URL</Label>
                  <Input value={state.mark} onChange={(e) => set("mark", e.target.value)} placeholder="/logo.svg" className="h-8" aria-label="Mark URL" />
                </div>
              </div>

              <Separator />

              {/* structure */}
              <div className="flex flex-col gap-3">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--prui-dim)]">structure</div>
                <label className="flex items-center justify-between text-sm text-[var(--prui-fg)]">
                  Sidebar
                  <Switch checked={state.sidebar} onChange={(c) => set("sidebar", c)} aria-label="Sidebar" />
                </label>
                <label className="flex items-center justify-between text-sm text-[var(--prui-fg)]">
                  Command palette
                  <Switch checked={state.palette} onChange={(c) => set("palette", c)} aria-label="Command palette" />
                </label>
              </div>

              <Separator />

              {/* design */}
              <div className="flex flex-col gap-2">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--prui-dim)]">design</div>
                <Select
                  value={state.theme}
                  onChange={(v) => set("theme", v as ThemeName)}
                  options={PRUI_THEMES.map((t) => ({ label: t, value: t }))}
                />
              </div>

              <Separator />

              {/* navigation */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--prui-dim)]">navigation</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => set("nav", [...state.nav, { label: "New item", href: "/new" }])}
                    data-testid="designer-add-nav"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden /> Add
                  </Button>
                </div>
                {state.nav.map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <Input
                      value={item.label}
                      onChange={(e) => {
                        const nav = [...state.nav]
                        nav[i] = { ...item, label: e.target.value }
                        set("nav", nav)
                      }}
                      className="h-7 flex-1"
                      aria-label={`Nav item ${i + 1} label`}
                    />
                    <Input
                      value={item.href ?? ""}
                      onChange={(e) => {
                        const nav = [...state.nav]
                        nav[i] = { ...item, href: e.target.value }
                        set("nav", nav)
                      }}
                      placeholder="/path"
                      className="h-7 w-24"
                      aria-label={`Nav item ${i + 1} href`}
                    />
                    <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Move up"
                      disabled={i === 0}
                      onClick={() => {
                        const nav = [...state.nav]
                        ;[nav[i - 1], nav[i]] = [nav[i]!, nav[i - 1]!]
                        set("nav", nav)
                      }}>
                      <ChevronUp className="h-3.5 w-3.5" aria-hidden />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Move down"
                      disabled={i === state.nav.length - 1}
                      onClick={() => {
                        const nav = [...state.nav]
                        ;[nav[i + 1], nav[i]] = [nav[i]!, nav[i + 1]!]
                        set("nav", nav)
                      }}>
                      <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Remove item"
                      onClick={() => set("nav", state.nav.filter((_, j) => j !== i))}>
                      <Trash2 className="h-3.5 w-3.5 text-[var(--prui-danger)]" aria-hidden />
                    </Button>
                  </div>
                ))}
              </div>

              <Separator />

              {/* share */}
              <div className="flex flex-col gap-1.5">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--prui-dim)]">share link</div>
                <div className="flex items-center gap-2">
                  <Input readOnly value={typeof window !== "undefined" ? window.location.href : ""} className="h-7 font-mono text-[10px]" aria-label="Share link" />
                  <CopyButton text={typeof window !== "undefined" ? window.location.href : ""} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
