import { PRUI_THEMES, applyTheme } from "prui/theme"
import { Card, CardHeader, CardTitle, CardDescription, Badge } from "prui/core"
import { CodeView } from "../components/CodeView"
import { TocRail } from "../components/TocRail"

const THEMING_TOC = [
  { id: "tokens", label: "Token reference" },
  { id: "themes", label: "Named themes" },
  { id: "switching", label: "Runtime switching" },
  { id: "custom", label: "Custom themes" },
  { id: "builder", label: "Theme builder" },
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
        Components read CSS variables only. Override one file to re-skin everything, and switch live from the header.
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
          Import individually: <code className="rounded bg-[var(--prui-raise)] px-1">@skiddph/prui/theme/control.css</code>, or all at once via{" "}
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
          <Badge variant="ok">live</Badge> these buttons call applyTheme() right now. Check the header toggle state.
        </p>
      </section>

      <section id="custom" className="mb-10 scroll-mt-20">
        <h2 className="mb-3 text-base font-semibold text-[var(--prui-fg)]">Custom themes: three ways in</h2>
        <p className="mb-4 max-w-[60ch] text-sm text-[var(--prui-dim)]">
          Every component reads token variables, so a theme is just a set of values. Pick the way that fits how you
          work, or use all three together.
        </p>

        <h3 className="mb-2 mt-6 text-sm font-semibold text-[var(--prui-fg)]">1. Override CSS: a file of variables</h3>
        <p className="mb-3 max-w-[60ch] text-sm text-[var(--prui-dim)]">
          Write your values into a file and load it after ours. No JavaScript, works with static rendering, easy to
          hand to a designer.
        </p>
        <CodeView
          height={150}
          title="theme.css"
          language="css"
          code={`.prui-root {
  --prui-brand: #16a34a;
  --prui-background: #071410;
  --prui-surface: #0c2018;
  --prui-line: #1f4634;
}`}
        />
        <p className="mb-4 text-sm text-[var(--prui-dim)]">
          Per-component values work the same way, one level down: a Button with <code className="rounded bg-[var(--prui-raise)] px-1">bg="var(--my-brand)"</code> keeps its
          variants and only takes the color from you.
        </p>

        <h3 className="mb-2 mt-6 text-sm font-semibold text-[var(--prui-fg)]">2. defineTheme(): register a named theme at runtime</h3>
        <p className="mb-3 max-w-[60ch] text-sm text-[var(--prui-dim)]">
          Registered themes behave exactly like the built-ins: they appear in the header switcher, they persist, and
          applyTheme accepts them by name. Re-calling defineTheme updates the theme live.
        </p>
        <CodeView
          height={190}
          title="theme.ts"
          code={`import { applyTheme, defineTheme } from '@skiddph/prui/theme'

defineTheme('midnight', {
  background: '#050814',
  surface: '#0b1224',
  brand: '#60a5fa',
  line: '#1e2c4a',
  fg: '#e6edf7',
  mode: 'dark',
})

applyTheme({ theme: 'midnight' })`}
        />

        <h3 className="mb-2 mt-6 text-sm font-semibold text-[var(--prui-fg)]">3. applyThemeTokens(): overlay values at runtime</h3>
        <p className="mb-3 max-w-[60ch] text-sm text-[var(--prui-dim)]">
          Re-skins the running app without registering anything: useful for a user-chosen accent, a per-tenant palette
          fetched from an API, or a preview. clearAppliedTokens() reverts; a storage key persists the overlay across
          reloads.
        </p>
        <CodeView
          height={190}
          title="runtime.ts"
          code={`import { applyThemeTokens, clearAppliedTokens } from '@skiddph/prui/theme'

// apply a tenant palette over the current theme
applyThemeTokens({ brand: '#e11d48', radius: '4px' })

// persist it across reloads, and undo when the user switches tenant
applyThemeTokens(tenantTokens, { storageKey: 'tenant:theme' })
clearAppliedTokens()

// scope an overlay to one element instead of the whole page
applyThemeTokens({ brand: '#16a34a' }, { target: panelEl })`}
        />
        <p className="mt-3 max-w-[60ch] text-sm text-[var(--prui-dim)]">
          Or skip the code entirely: the{" "}
          <a href="/theme-builder" className="text-[var(--prui-brand)] hover:underline">theme builder</a> generates
          both outputs for you and lets you try the result on this site.
        </p>
      </section>

      <section id="builder" className="mb-10 scroll-mt-20">
        <h2 className="mb-3 text-base font-semibold text-[var(--prui-fg)]">Theme builder</h2>
        <p className="max-w-[60ch] text-sm text-[var(--prui-dim)]">
          Pick colors with real pickers, drag the radius, and the whole site re-skins in real time. Your tokens persist
          across reloads until you press Reset, and the generated CSS or JS is yours to keep.
        </p>
        <p className="mt-3">
          <a href="/theme-builder" className="text-sm text-[var(--prui-brand)] hover:underline">Open the theme builder →</a>
        </p>
      </section>
      </div>

      <TocRail items={THEMING_TOC} />
    </div>
  )
}
