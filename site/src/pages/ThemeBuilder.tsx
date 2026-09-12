import * as React from "react"
import { useSearchParams } from "react-router-dom"
import { Button, Card, CardContent, Input, Label } from "prui/core"
import { applyThemeTokens, clearAppliedTokens, type ThemeTokens } from "prui/theme"
import { CodeView } from "../components/CodeView"

/**
 * /theme-builder: pick tokens with real controls, see them on real prui
 * parts inside the preview island (the site theme is untouched until you
 * press Try it), then copy the result as CSS or as a JS theme.
 */

interface BuilderTokens {
  brand: string
  brandFg: string
  background: string
  surface: string
  raise: string
  line: string
  fg: string
  dim: string
  ok: string
  warn: string
  danger: string
  radius: number
  dimOp: number
}

const DEFAULT_TOKENS: BuilderTokens = {
  brand: "#7c9cff",
  brandFg: "#0b0c10",
  background: "#050506",
  surface: "#0f0f10",
  raise: "#1a1a1c",
  line: "#2a2a2e",
  fg: "#f4f4f5",
  dim: "#9b9ba4",
  ok: "#3ddc97",
  warn: "#ffc15e",
  danger: "#f87171",
  radius: 8,
  dimOp: 0.62,
}

const PRESETS: { name: string; tokens: BuilderTokens }[] = [
  { name: "Control", tokens: { ...DEFAULT_TOKENS } },
  {
    name: "Daylight",
    tokens: {
      ...DEFAULT_TOKENS,
      brand: "#4f46e5",
      brandFg: "#ffffff",
      background: "#f6f6f8",
      surface: "#ffffff",
      raise: "#ececf0",
      line: "#d9d9e0",
      fg: "#18181b",
      dim: "#6b6b74",
      ok: "#059669",
      warn: "#b45309",
      danger: "#dc2626",
    },
  },
  {
    name: "Forest",
    tokens: {
      ...DEFAULT_TOKENS,
      brand: "#34d399",
      brandFg: "#06281b",
      background: "#071410",
      surface: "#0c2018",
      raise: "#143024",
      line: "#1f4634",
      fg: "#e7f6ee",
      dim: "#8fb8a4",
      ok: "#34d399",
      warn: "#fbbf24",
      danger: "#f87171",
    },
  },
  {
    name: "Rose",
    tokens: {
      ...DEFAULT_TOKENS,
      brand: "#fb7185",
      brandFg: "#2b0710",
      background: "#0d0508",
      surface: "#180a0f",
      raise: "#241017",
      line: "#3a1a24",
      fg: "#fdeef2",
      dim: "#c49aa8",
      ok: "#4ade80",
      warn: "#fbbf24",
      danger: "#f43f5e",
    },
  },
]

const toThemeTokens = (t: BuilderTokens): ThemeTokens => ({
  brand: t.brand,
  "brand-fg": t.brandFg,
  background: t.background,
  surface: t.surface,
  raise: t.raise,
  line: t.line,
  fg: t.fg,
  dim: t.dim,
  ok: t.ok,
  warn: t.warn,
  danger: t.danger,
  radius: `${t.radius}px`,
  "dim-op": t.dimOp,
})

const toCssVars = (t: BuilderTokens): string => {
  const rows = [
    ["--prui-brand", t.brand],
    ["--prui-brand-fg", t.brandFg],
    ["--prui-background", t.background],
    ["--prui-surface", t.surface],
    ["--prui-raise", t.raise],
    ["--prui-line", t.line],
    ["--prui-fg", t.fg],
    ["--prui-dim", t.dim],
    ["--prui-ok", t.ok],
    ["--prui-warn", t.warn],
    ["--prui-danger", t.danger],
    ["--prui-radius", `${t.radius}px`],
    ["--prui-dim-op", String(t.dimOp)],
  ]
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n")
  return `.prui-root {\n${rows}\n}`
}

const toJsSnippet = (t: BuilderTokens, name: string): string =>
  `import { applyTheme, defineTheme } from '@skiddph/prui/theme'

// register the theme once (idempotent)
defineTheme('${name}', ${JSON.stringify(toThemeTokens(t), null, 2)})

// apply it now, or wire it to your theme switcher
applyTheme({ theme: '${name}' })`

function encodeTokens(t: BuilderTokens): string {
  const json = JSON.stringify(t)
  const bytes = new TextEncoder().encode(json)
  let bin = ""
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function decodeTokens(raw: string | null): BuilderTokens {
  if (!raw) return { ...DEFAULT_TOKENS }
  try {
    const b64 = raw.replace(/-/g, "+").replace(/_/g, "/")
    const bin = atob(b64)
    const parsed = JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))) as Partial<BuilderTokens>
    const merged = { ...DEFAULT_TOKENS }
    for (const k of Object.keys(merged) as (keyof BuilderTokens)[]) {
      const v = parsed[k]
      if (typeof v === typeof merged[k] && v !== undefined) (merged[k] as unknown) = v
    }
    return merged
  } catch {
    return { ...DEFAULT_TOKENS }
  }
}

function ColorRow({ label, token, value, onChange }: { label: string; token: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2 py-1.5">
      <input
        type="color"
        value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000"}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`${token} color picker`}
        className="h-7 w-9 shrink-0 cursor-pointer rounded border border-[var(--prui-line)] bg-transparent"
      />
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[11px] text-[var(--prui-fg)]">{token}</div>
        <div className="text-[10px] text-[var(--prui-dim)]">{label}</div>
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`${token} value`}
        className="h-7 w-24 shrink-0 font-mono text-[11px]"
      />
    </div>
  )
}

export function ThemeBuilderPage() {
  const [params, setParams] = useSearchParams()
  const initial = React.useMemo(() => decodeTokens(params.get("t")), [params])
  const [tokens, setTokens] = React.useState<BuilderTokens>(initial)
  const [themeName, setThemeName] = React.useState("my-theme")
  const [tab, setTab] = React.useState<"builder" | "css" | "js">("builder")

  // realtime: every change applies to the whole site and persists across reloads
  React.useEffect(() => {
    applyThemeTokens(toThemeTokens(tokens))
  }, [tokens])

  React.useEffect(() => {
    const encoded = encodeTokens(tokens)
    if (params.get("t") !== encoded) setParams({ t: encoded }, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokens])

  const set = <K extends keyof BuilderTokens>(k: K, v: BuilderTokens[K]) => setTokens((s) => ({ ...s, [k]: v }))

  const reset = () => {
    clearAppliedTokens()
    setTokens({ ...DEFAULT_TOKENS })
    setParams({}, { replace: true })
  }
  const css = toCssVars(tokens)
  const js = toJsSnippet(tokens, themeName)

  const colorFields: { token: string; label: string; key: keyof BuilderTokens }[] = [
    { token: "--prui-brand", label: "Brand accent", key: "brand" },
    { token: "--prui-brand-fg", label: "Text on brand", key: "brandFg" },
    { token: "--prui-background", label: "Page background", key: "background" },
    { token: "--prui-surface", label: "Cards, sidebar", key: "surface" },
    { token: "--prui-raise", label: "Hover, wells", key: "raise" },
    { token: "--prui-line", label: "Borders", key: "line" },
    { token: "--prui-fg", label: "Primary text", key: "fg" },
    { token: "--prui-dim", label: "Secondary text", key: "dim" },
    { token: "--prui-ok", label: "Success", key: "ok" },
    { token: "--prui-warn", label: "Warning", key: "warn" },
    { token: "--prui-danger", label: "Danger", key: "danger" },
  ]

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 pb-20 pt-6 md:px-6">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="font-mono text-xs text-[var(--prui-dim)]">theming / theme builder</div>
        <div className="flex items-center gap-2">
          {tab !== "builder" ? (
            <Input
              value={themeName}
              onChange={(e) => setThemeName(e.target.value)}
              aria-label="Theme name"
              className="h-8 w-44 font-mono text-xs"
              placeholder="my-theme"
            />
          ) : null}
          <Button onClick={reset} data-testid="builder-reset">
            Reset
          </Button>
        </div>
      </div>
      <h1 className="mb-1 text-2xl font-bold tracking-tight text-[var(--prui-fg)]">Theme builder</h1>
      <p className="mb-5 max-w-[62ch] text-sm text-[var(--prui-dim)]">
        Every overridable token, one screen. Changes apply to this entire site as you make them and survive a reload.
        Reset removes the overlay and puts the current theme back.
      </p>

      <div className="mb-4 flex gap-1">
        <Button variant={tab === "builder" ? "default" : "ghost"} onClick={() => setTab("builder")}>Builder</Button>
        <Button variant={tab === "css" ? "default" : "ghost"} onClick={() => setTab("css")}>CSS</Button>
        <Button variant={tab === "js" ? "default" : "ghost"} onClick={() => setTab("js")}>JS</Button>
      </div>

      {tab === "builder" ? (
        <Card>
          <CardContent className="flex flex-col gap-5">
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-[var(--prui-dim)]">presets</div>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((p) => (
                  <Button key={p.name} size="sm" variant="default" onClick={() => setTokens({ ...p.tokens })}>
                    {p.name}
                  </Button>
                ))}
                <Button size="sm" variant="ghost" onClick={() => setTokens({ ...DEFAULT_TOKENS })}>Clear</Button>
              </div>
            </div>

            <div className="grid gap-x-6 gap-y-1" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
              {colorFields.map((f) => (
                <ColorRow key={f.token} token={f.token} label={f.label} value={tokens[f.key] as string} onChange={(v) => set(f.key, v as never)} />
              ))}
            </div>

            <div>
              <Label className="text-xs" htmlFor="builder-radius">Corner radius: {tokens.radius}px</Label>
              <input
                id="builder-radius"
                type="range"
                min={0}
                max={20}
                value={tokens.radius}
                onChange={(e) => set("radius", Number(e.target.value))}
                className="mt-1 w-full"
              />
            </div>

            <div>
              <Label className="text-xs" htmlFor="builder-dimop">
                Secondary text opacity: {(tokens.dimOp * 100).toFixed(0)}%
              </Label>
              <input
                id="builder-dimop"
                type="range"
                min={20}
                max={100}
                value={tokens.dimOp * 100}
                onChange={(e) => set("dimOp", Number(e.target.value) / 100)}
                className="mt-1 w-full"
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-3">
            <CodeView
              code={tab === "css" ? css : js}
              title={tab === "css" ? "theme.css" : "theme.ts"}
              language={tab === "css" ? "css" : "typescript"}
              height={420}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
