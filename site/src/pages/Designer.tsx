import * as React from "react"
import { useSearchParams } from "react-router-dom"
import { Button, Input, Label, Switch, Card, CardHeader, CardTitle, CardContent, Badge, Separator } from "prui/core"
import { PRUI_THEMES, type ThemeName } from "prui/theme"
import { CopyButton } from "../components/CopyButton"
import { CodeView } from "../components/CodeView"
import { Undo2, Redo2, Plus, Upload } from "lucide-react"
import { DesignerPreview } from "./designer/Preview"
/* lazy: keeps dnd-kit out of any static import graph regardless of chunker */
const NavEditor = React.lazy(() => import("./designer/NavEditor").then((m) => ({ default: m.NavEditor })))
import {
  DEFAULT_STATE,
  decodeState,
  encodeState,
  flattenNav,
  unflattenNav,
  generateAppCode,
  generateAgentPrompt,
  generateTokenCss,
  initHistory,
  pushHistory,
  redo as redoHistory,
  undo as undoHistory,
  type DesignerState,
  type History,
} from "./designer/state"

/**
 * /designer: visual app builder (proposal AC-12/13/14).
 * Canvas: the real <App> renders live in an iframe. Tools: branding, nav
 * editor (drag-to-reorder/nest + JSON), structure toggles, theme + token
 * overrides. Every change regenerates the <App> code; structural edits are
 * undoable; state round-trips through the URL and localStorage.
 */

export function DesignerPage() {
  const [params, setParams] = useSearchParams()
  const initial = React.useMemo(() => {
    const fromUrl = params.get("c")
    if (fromUrl) return decodeState(fromUrl)
    const saved = typeof localStorage !== "undefined" ? localStorage.getItem("prui:designer") : null
    return saved ? decodeState(saved) : DEFAULT_STATE
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const [state, setState] = React.useState<DesignerState>(initial)
  const [history, setHistory] = React.useState<History<DesignerState>>(() => initHistory(initial))
  const [monacoReady, setMonacoReady] = React.useState(false)

  // Monaco loads lazily on this page only; the landing never touches it (AC-6)
  React.useEffect(() => {
    let cancelled = false
    void import("@monaco-editor/react").then(() => {
      if (!cancelled) setMonacoReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const shareLink = React.useMemo(() => encodeState(state), [state])

  // URL round-trip (AC-13) + localStorage mirror
  React.useEffect(() => {
    if (params.get("c") !== shareLink) setParams({ c: shareLink }, { replace: true })
    try {
      localStorage.setItem("prui:designer", shareLink)
    } catch {
      /* storage unavailable */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shareLink])

  const set = <K extends keyof DesignerState>(key: K, value: DesignerState[K]) => setState((s) => ({ ...s, [key]: value }))

  // structural nav edits push undo history (AC-14)
  const setNav = (nav: DesignerState["nav"], structural: boolean) => {
    setState((s) => {
      const next = { ...s, nav }
      if (structural) setHistory((h) => pushHistory(h, next))
      return next
    })
  }

  const onUndo = () => {
    const result = undoHistory(history)
    setHistory(result.history)
    if (result.state) setState(result.state)
  }
  const onRedo = () => {
    const result = redoHistory(history)
    setHistory(result.history)
    if (result.state) setState(result.state)
  }

  // Ctrl+Z / Ctrl+Y (and cmd variants)
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return
      if (e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault()
        onUndo()
      } else if ((e.key.toLowerCase() === "z" && e.shiftKey) || e.key.toLowerCase() === "y") {
        e.preventDefault()
        onRedo()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history])

  const onMarkUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => set("mark", String(reader.result ?? ""))
    reader.readAsDataURL(file)
  }

  const code = generateAppCode(state)
  const tokenCss = generateTokenCss(state)
  const agentPrompt = generateAgentPrompt(state)
  const canUndo = history.index > 0
  const canRedo = history.index < history.stack.length - 1

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 pb-20 pt-6 md:px-6">
      <div className="mb-2 flex items-center justify-between font-mono text-xs text-[var(--prui-dim)]">
        <span>designer / visual app builder</span>
        <span className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Undo" disabled={!canUndo} onClick={onUndo} data-testid="designer-undo">
            <Undo2 className="h-3.5 w-3.5" aria-hidden />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Redo" disabled={!canRedo} onClick={onRedo} data-testid="designer-redo">
            <Redo2 className="h-3.5 w-3.5" aria-hidden />
          </Button>
        </span>
      </div>
      <h1 className="mb-1 text-2xl font-bold tracking-tight text-[var(--prui-fg)]">Designer</h1>
      <p className="mb-6 max-w-[60ch] text-sm text-[var(--prui-dim)]">
        The canvas renders the real <code className="rounded bg-[var(--prui-raise)] px-1">&lt;App&gt;</code> from the package.
        Configure it on the right, drag nav items to reorder or nest, and copy the generated code. State lives in the URL.
      </p>

      <div className="flex flex-col gap-4 lg:flex-row">
        {/* canvas + generate */}
        <div className="min-w-0 flex-1">
          <div className="overflow-hidden rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-surface)]">
            <div className="flex items-center justify-between border-b border-[var(--prui-line)] px-4 py-2 font-mono text-[11px] text-[var(--prui-dim)]">
              <span>canvas / live preview: the real &lt;App&gt;</span>
              <Badge variant="ok">live</Badge>
            </div>
            <DesignerPreview state={state} />
          </div>

          {/* generate */}
          <div className="mt-4 overflow-hidden rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-surface)]">
            <GenTabs appCode={code} agentPrompt={agentPrompt} tokenCss={tokenCss} monacoReady={monacoReady} />
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
                  <Label className="text-xs" htmlFor="designer-name">App name</Label>
                  <Input id="designer-name" value={state.name} onChange={(e) => set("name", e.target.value)} className="h-8" />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs" htmlFor="designer-mark">Mark URL</Label>
                  <div className="flex gap-1.5">
                    <Input id="designer-mark" value={state.mark.startsWith("data:") ? "(uploaded image)" : state.mark}
                      onChange={(e) => set("mark", e.target.value)}
                      onPaste={(e) => set("mark", e.clipboardData.getData("text"))}
                      placeholder="/logo.svg" className="h-8 flex-1" />
                    <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[var(--prui-radius)] border border-[var(--prui-line)] px-2.5 text-xs text-[var(--prui-dim)] hover:text-[var(--prui-fg)]">
                      <Upload className="h-3.5 w-3.5" aria-hidden /> upload
                      <input type="file" accept="image/*" className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (f) onMarkUpload(f)
                        }} />
                    </label>
                  </div>
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
                {state.sidebar ? (
                  <>
                    <label className="flex items-center justify-between text-xs text-[var(--prui-dim)]">
                      Collapsible (mobile drawer)
                      <Switch checked={state.sidebarCollapsible} onChange={(c) => set("sidebarCollapsible", c)} aria-label="Sidebar collapsible" />
                    </label>
                    <label className="flex items-center justify-between text-xs text-[var(--prui-dim)]">
                      Width
                      <input type="range" min={200} max={340} step={10} value={state.sidebarWidth}
                        onChange={(e) => set("sidebarWidth", Number(e.target.value))}
                        aria-label="Sidebar width" className="w-40" />
                    </label>
                  </>
                ) : null}
                <label className="flex items-center justify-between text-sm text-[var(--prui-fg)]">
                  Topbar
                  <Switch checked={state.topbar} onChange={(c) => set("topbar", c)} aria-label="Topbar" />
                </label>
                <label className="flex items-center justify-between text-sm text-[var(--prui-fg)]">
                  Command palette
                  <Switch checked={state.palette} onChange={(c) => set("palette", c)} aria-label="Command palette" />
                </label>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs" htmlFor="designer-pages">Pre-made pages</Label>
                  <select
                    id="designer-pages"
                    value={state.pages}
                    onChange={(e) => set("pages", e.target.value as DesignerState["pages"])}
                    className="h-8 rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-background)] px-2 text-sm text-[var(--prui-fg)]"
                  >
                    <option value="off">none</option>
                    <option value="auth">auth (login, register, otp…)</option>
                    <option value="utility">utility (404, profile…)</option>
                    <option value="auth+utility">auth + utility</option>
                  </select>
                </div>
              </div>

              <Separator />

              {/* design */}
              <div className="flex flex-col gap-2">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--prui-dim)]">design</div>
                <div className="flex flex-wrap gap-1.5">
                  {PRUI_THEMES.map((t) => (
                    <Button key={t} variant={state.theme === t ? "primary" : "default"} size="sm"
                      onClick={() => set("theme", t as ThemeName)} aria-pressed={state.theme === t}>
                      {t}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs" htmlFor="designer-brand">Brand color</Label>
                  <input id="designer-brand" type="color" value={state.tokens.brand || "#7c9cff"}
                    onChange={(e) => set("tokens", { ...state.tokens, brand: e.target.value })}
                    className="h-7 w-10 cursor-pointer rounded border border-[var(--prui-line)] bg-transparent" />
                  <Input value={state.tokens.brand} onChange={(e) => set("tokens", { ...state.tokens, brand: e.target.value })}
                    placeholder="#7c9cff" className="h-7 w-28 font-mono text-[11px]" aria-label="Brand color value" />
                  {state.tokens.brand ? (
                    <Button variant="ghost" size="sm" onClick={() => set("tokens", { ...state.tokens, brand: "" })}>reset</Button>
                  ) : null}
                </div>
                <label className="flex items-center justify-between text-xs text-[var(--prui-dim)]">
                  Radius
                  <input type="range" min={0} max={16} step={1} value={state.tokens.radius || "6"}
                    onChange={(e) => set("tokens", { ...state.tokens, radius: e.target.value })}
                    aria-label="Corner radius" className="w-40" />
                </label>
                <label className="flex items-center justify-between text-xs text-[var(--prui-dim)]">
                  Compact density
                  <Switch checked={state.tokens.density === "compact"}
                    onChange={(c) => set("tokens", { ...state.tokens, density: c ? "compact" : "comfortable" })}
                    aria-label="Compact density" />
                </label>
              </div>

              <Separator />

              {/* navigation */}
              <React.Suspense fallback={<div className="h-40 animate-pulse rounded-[var(--prui-radius)] bg-[var(--prui-raise)]" />}>
                <NavEditor
                  flat={flattenNav(state.nav)}
                  onChange={(flat) => setNav(unflattenNav(flat), true)}
                  monacoReady={monacoReady}
                />
              </React.Suspense>
              <Button variant="ghost" size="sm" className="self-start"
                onClick={() => setNav([...state.nav, { label: "New item", href: "/new" }], true)}
                data-testid="designer-add-nav">
                <Plus className="h-3.5 w-3.5" aria-hidden /> Add item
              </Button>

              <Separator />

              {/* share */}
              <div className="flex flex-col gap-1.5">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--prui-dim)]">share link</div>
                <div className="flex items-center gap-2">
                  <Input readOnly value={`${typeof window !== "undefined" ? window.location.origin + window.location.pathname : ""}?c=${shareLink.slice(0, 64)}…`}
                    className="h-7 flex-1 font-mono text-[10px]" aria-label="Share link" />
                  <CopyButton text={`${typeof window !== "undefined" ? window.location.origin + window.location.pathname : ""}?c=${shareLink}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function GenTabs({ appCode, agentPrompt, tokenCss, monacoReady }: { appCode: string; agentPrompt: string; tokenCss: string; monacoReady: boolean }) {
  const [tab, setTab] = React.useState<"app" | "agent">("app")
  return (
    <div>
      <div className="flex items-center justify-between border-b border-[var(--prui-line)] px-4 py-2 font-mono text-[11px] text-[var(--prui-dim)]">
        <div className="flex gap-1">
          <Button variant={tab === "app" ? "default" : "ghost"} size="sm" onClick={() => setTab("app")}>paste into my app</Button>
          <Button variant={tab === "agent" ? "default" : "ghost"} size="sm" onClick={() => setTab("agent")}>hand to my agent</Button>
        </div>
        <CopyButton text={tab === "app" ? `${appCode}\n\n/* theme overrides */\n${tokenCss}` : agentPrompt} />
      </div>
      <div className="p-3">
        {monacoReady ? (
          <CodeView code={tab === "app" ? appCode : agentPrompt} title={tab === "app" ? "app.tsx" : "agent prompt"} language={tab === "app" ? "typescript" : "markdown"} height={300} />
        ) : (
          <pre className="max-h-72 overflow-auto p-3 font-mono text-xs leading-relaxed text-[var(--prui-fg)]">{tab === "app" ? appCode : agentPrompt}</pre>
        )}
        {tab === "app" ? (
          <CodeView code={tokenCss} title="theme-overrides.css" language="css" height={110} className="mt-2 overflow-hidden rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-surface)]" />
        ) : null}
      </div>
    </div>
  )
}
