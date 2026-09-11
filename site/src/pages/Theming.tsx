import { PRUI_THEMES, applyTheme } from "prui/theme"
import { Card, CardHeader, CardTitle, CardDescription, Badge } from "prui/core"
import { CodeView } from "../components/CodeView"
import { TocRail } from "../components/TocRail"

const THEMING_TOC = [
  { id: "tokens", label: "Token reference" },
  { id: "themes", label: "Named themes" },
  { id: "switching", label: "Runtime switching" },
]

const TOKENS = [
  { name: "--prui-background", value: "page background", color: "#000000" },
  { name: "--prui-surface", value: "cards, sidebar", color: "#0f0f10" },
  { name: "--prui-raise", value: "hover, wells", color: "#1a1a1c" },
  { name: "--prui-line", value: "borders", color: "#2a2a2e" },
  { name: "--prui-fg", value: "primary text", color: "#f4f4f5" },
  { name: "--prui-dim", value: "secondary text", color: "#9b9ba4" },
  { name: "--prui-brand", value: "accent", color: "#7c9cff" },
  { name: "--prui-ok", value: "success", color: "#3ddc97" },
  { name: "--prui-warn", value: "warning", color: "#ffc15e" },
  { name: "--prui-danger", value: "destructive", color: "#f87171" },
]

const THEME_DESC: Record<string, string> = {
  control: "Direction D default. Pure black, periwinkle accent.",
  workshop: "Dark warm neutral, amber accent.",
  ember: "Deep red-black, ember accent.",
  daylight: "Light theme, indigo accent.",
}

export function ThemingPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1080px] justify-center gap-6 px-4 pb-20 pt-8 md:px-6">
      <div className="min-w-0 max-w-[780px] flex-1">
        <div className="mb-2 font-mono text-xs text-[var(--prui-dim)]">theming / tokens</div>
      <h1 className="mb-1.5 text-[27px] font-bold tracking-tight text-[var(--prui-fg)]">Theming</h1>
      <p className="mb-8 max-w-[60ch] text-[15px] text-[var(--prui-dim)]">
        Components reference CSS variables only — override one file, re-skin everything. Switch live from the header.
      </p>

      <section id="tokens" className="mb-10 scroll-mt-20">
        <h2 className="mb-3 text-base font-semibold text-[var(--prui-fg)]">Token reference</h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-2.5">
          {TOKENS.map((t) => (
            <div key={t.name} className="flex items-center gap-2.5 rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-surface)] p-3">
              <span className="h-6 w-6 shrink-0 rounded-[7px] border border-[var(--prui-line)]" style={{ background: t.color }} />
              <div className="min-w-0">
                <div className="font-mono text-xs font-semibold text-[var(--prui-fg)]">{t.name}</div>
                <div className="font-mono text-[11px] text-[var(--prui-dim)]">{t.value}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-[var(--prui-dim)]">
          Plus the radius scale: <code className="rounded bg-[var(--prui-raise)] px-1">--prui-radius</code> (base),
          <code className="mx-1 rounded bg-[var(--prui-raise)] px-1">-1..-3</code>, and
          <code className="mx-1 rounded bg-[var(--prui-raise)] px-1">-full</code>.
        </p>
      </section>

      <section id="themes" className="mb-10 scroll-mt-20">
        <h2 className="mb-3 text-base font-semibold text-[var(--prui-fg)]">Named themes</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {PRUI_THEMES.map((t) => (
            <Card key={t}>
              <CardHeader>
                <CardTitle className="font-mono text-sm">{t}</CardTitle>
                <CardDescription>{THEME_DESC[t]}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
        <p className="mt-3 text-sm text-[var(--prui-dim)]">
          Import individually: <code className="rounded bg-[var(--prui-raise)] px-1">@skiddph/prui/theme/control.css</code> — or all at once via{" "}
          <code className="rounded bg-[var(--prui-raise)] px-1">@skiddph/prui/styles.css</code>.
        </p>
      </section>

      <section id="switching" className="scroll-mt-20">
        <h2 className="mb-3 text-base font-semibold text-[var(--prui-fg)]">Runtime switching</h2>
        <CodeView
          code={`import { applyTheme } from '@skiddph/prui/theme'

applyTheme({ theme: 'workshop' })      // sets classes + persists
applyTheme({ theme: 'daylight' })      // light mode`}
          title="theme.ts"
          className="mb-4 overflow-hidden rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-surface)]"
        />
        <div className="flex flex-wrap gap-2">
          {PRUI_THEMES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => applyTheme({ theme: t })}
              className="cursor-pointer rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-raise)] px-3 py-1.5 text-sm text-[var(--prui-fg)] hover:border-[var(--prui-brand)]"
            >
              Apply <span className="font-mono text-xs text-[var(--prui-brand)]">{t}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 flex items-center gap-2 text-sm text-[var(--prui-dim)]">
          <Badge variant="ok">live</Badge> these buttons call applyTheme() right now — check the header toggle state.
        </p>
      </section>
      </div>

      <TocRail items={THEMING_TOC} />
    </div>
  )
}
