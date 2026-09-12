import * as React from "react"
import { Link } from "react-router-dom"
import { CodeView } from "../../components/CodeView"
import { Alert, Badge } from "prui/core"

/** Prose guide page scaffold. */
function Guide({
  section,
  title,
  intro,
  children,
}: {
  section: string
  title: string
  intro: string
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto flex w-full max-w-[1080px] justify-center gap-6 px-4 pb-20 pt-8 md:px-6">
      <div className="min-w-0 max-w-[780px] flex-1 text-sm text-[var(--prui-dim)] [&_a]:text-[var(--prui-brand)] [&_a]:hover:underline [&_code]:rounded [&_code]:bg-[var(--prui-raise)] [&_code]:px-1 [&_h2]:mb-2 [&_h2]:mt-8 [&_h2]:scroll-mt-20 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-[var(--prui-fg)] [&_h3]:mb-1 [&_h3]:mt-5 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-[var(--prui-fg)] [&_li]:mb-1 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5">
        <div className="mb-2 font-mono text-xs text-[var(--prui-dim)]">{section}</div>
        <h1 className="mb-2 text-[27px] font-bold tracking-tight text-[var(--prui-fg)]">{title}</h1>
        <p className="mb-6 max-w-[60ch] text-[15px]">{intro}</p>
        {children}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */

export function TokensDoc() {
  return (
    <Guide
      section="guides / design tokens"
      title="Design tokens"
      intro="Every visual decision in PRUI resolves through a CSS custom property. Themes override the color set; the base layer adds the semantic scales below. Never hardcode a value a token already owns."
    >
      <h2 id="color">Color</h2>
      <p>
        Each theme defines <code>background surface raise line fg dim brand brand-fg ok warn danger</code> plus <code>radius</code> and <code>dim-op</code>. See <Link to="/theming">Theming</Link> for overrides and custom themes.
      </p>

      <h2 id="z-index">Z-index</h2>
      <p>An ordered overlay contract — never compare raw numbers again:</p>
      <CodeView title="css" className="mt-2 overflow-hidden rounded-[var(--prui-radius)] border border-[var(--prui-line)]" code={`--prui-z-header: 30;      /* sticky app header */
--prui-z-drawer: 40;      /* mobile navigation drawer */
--prui-z-overlay: 50;     /* dialogs, palettes, anchored menus */
--prui-z-flyout: 60;      /* collapsed-rail nav flyout */
--prui-z-tooltip: 70;     /* tooltips above overlays */
--prui-z-modal: 10000;    /* Modal + Sheet + Drawer */
--prui-z-confirm: 10010;  /* imperative confirmModal */
--prui-z-toast: 10100;    /* toasts always win */
--prui-z-content: 1;      /* content above its own backdrop */`} />

      <h2 id="motion">Motion</h2>
      <p>
        <code>duration-fast/base/slow</code> (150/200/300ms) and <code>ease-out/ease-in-out/ease-spring</code>. Components reference the tokens; the <code>prui-anim-fade/slide</code> presets and every inline transition honor <code>prefers-reduced-motion</code> (a media query zeroes animations and transitions with <code>!important</code>, and the <code>useReducedMotion()</code> hook lets components skip choreography that depends on transitionend).
      </p>

      <h2 id="typography">Typography</h2>
      <p>
        Paired size/line-height tokens: <code>text-2xs…3xl</code> with <code>-lh</code> partners, and weights <code>normal/medium/semibold/bold</code>. Tailwind's scale remains the utility layer; these tokens are the reference for custom CSS and generated content.
      </p>

      <h2 id="spacing-elevation">Spacing, elevation, opacity</h2>
      <p>
        <code>space-1…12</code> (4–48px), shadow steps <code>shadow-sm/md/lg/modal</code> (light-mode aware via <code>.prui-mode-light</code>), and <code>opacity-disabled/muted/overlay</code> plus the <code>scrim</code> backdrop color.
      </p>

      <h2 id="breakpoints">Breakpoints</h2>
      <p>
        The shell switches at <code>48rem</code> (768px). JS code reads <code>PRUI_BREAKPOINTS</code> and <code>useBreakpointAtLeast()</code> from <code>prui/theme</code> instead of hardcoded pixels; <code>PRUI_DESIGN_TOKENS</code> enumerates every group for tooling.
      </p>

      <h2 id="surface">Surface props</h2>
      <p>
        The opt-in flexibility layer stays the same: <code>bg fg radius texture textureColor elevation</code> on any primitive, resolved through <code>--prui-s-*</code> fallbacks so unset props degrade to the theme.
      </p>
    </Guide>
  )
}

export function AccessibilityDoc() {
  return (
    <Guide
      section="guides / accessibility"
      title="Accessibility"
      intro="PRUI's overlay infrastructure gives every floating surface the same guarantees. This page documents the contract so your own components can meet it too."
    >
      <h2 id="overlays">Overlay guarantees</h2>
      <ul>
        <li><strong>Focus trap</strong>: Tab/Shift+Tab cycle inside the overlay (useFocusTrap).</li>
        <li><strong>Initial focus</strong>: the first focusable, an explicit element, or the container — configurable per surface.</li>
        <li><strong>Focus restoration</strong>: focus returns to the invoker on close.</li>
        <li><strong>Nested dialogs</strong>: an overlay stack registers open surfaces; only the topmost answers Escape.</li>
        <li><strong>aria-hidden + inert</strong>: the background is hidden from assistive tech and made inert where browsers support it.</li>
        <li><strong>Scroll lock</strong>: counter-based, so stacked overlays cannot unlock each other.</li>
        <li><strong>Portals</strong>: overlays render at the body root — no ancestor overflow or transform can clip them.</li>
      </ul>

      <h2 id="keyboard">Keyboard maps</h2>
      <h3>Menus (Dropdown, rail flyout)</h3>
      <p>Enter/Space/ArrowDown open · ArrowUp/Down move · Home/End jump · type-ahead searches labels · Escape closes and refocuses the trigger · Tab closes.</p>
      <h3>Listboxes (Select, Combobox)</h3>
      <p>ArrowDown/Up move · Home/End jump · Enter/Space select · Escape closes and refocuses · printable chars type-ahead · Tab closes.</p>
      <h3>Tabs</h3>
      <p>ArrowLeft/Right move and activate · Home/End jump to the first/last tab.</p>
      <h3>Calendar grid</h3>
      <p>Arrows move by day/week · Home/End jump to week edges · PageUp/PageDown change months · Enter/Space select.</p>
      <h3>Tree</h3>
        <p>ArrowRight expands/moves in · ArrowLeft collapses/moves to parent · ArrowUp/Down + Home/End move between visible nodes.</p>

      <h2 id="forms">Forms</h2>
      <p>
        Both form implementations wire <code>aria-invalid</code> and <code>aria-describedby</code> to the error message, render errors in <code>role=alert</code>, and mark required fields with a visible indicator plus the programmatic label.
      </p>

      <h2 id="reduced-motion">Reduced motion</h2>
      <p>
        <code>prefers-reduced-motion: reduce</code> disables shake, scale, fade and slide globally (CSS) and skips animation-dependent unmount timing (JS). Test with your OS setting and expect instant transitions.
      </p>
    </Guide>
  )
}

export function SSRDoc() {
  return (
    <Guide
      section="guides / ssr"
      title="Server-side rendering"
      intro="PRUI is SSR-safe: every browser API is guarded, portals render nothing on the server pass, and the theme applies on hydration."
    >
      <h2 id="guarantees">Guarantees</h2>
      <ul>
        <li><code>typeof document/window</code> guards around every direct access (theme, portal mount, scroll lock).</li>
        <li><code>Portal</code> mounts to <code>document.body</code> in an effect — server output is empty, client hydration fills it.</li>
        <li><code>applyTheme()</code> no-ops without a document; call it in a client effect or your root component.</li>
        <li>The dictionary starts synchronously English; async locale loading swaps via <code>setPruiDictionary</code>.</li>
      </ul>
      <h2 id="recipe">Recipe</h2>
      <CodeView title="tsx" className="mt-2 overflow-hidden rounded-[var(--prui-radius)] border border-[var(--prui-line)]" code={`// app root (client)
import { App, restoreAppliedTokens } from '@skiddph/prui/app'

restoreAppliedTokens() // re-apply a persisted token overlay

<App theme={{ default: 'dark', persist: true }} nav={nav}>
  {routes}
</App>`} />
      <Alert variant="info" title="Streaming note" className="mt-4">
        Overlays that depend on measured geometry (tooltip/popover positions) compute after mount; SSR HTML renders them hidden until positioned.
      </Alert>
    </Guide>
  )
}

export function PerformanceDoc() {
  return (
    <Guide
      section="guides / performance"
      title="Performance"
      intro="Bundle discipline is CI-enforced and per-component re-render costs are bounded. This page is the checklist we hold PRUI itself to."
    >
      <h2 id="bundle">Bundle</h2>
      <ul>
        <li>Per-primitive entries: <code>prui/core/button</code> ships only button code (CI guard <code>scripts/bundle-guard.mjs</code>).</li>
        <li>Landing JS budget under 100KB compressed (<code>scripts/landing-budget.mjs</code>).</li>
        <li>No runtime dependencies beyond react, react-router-dom, lucide-react, clsx, tailwind-merge.</li>
        <li>Date components use plain strings — no date library.</li>
      </ul>
      <h2 id="rendering">Rendering</h2>
      <ul>
        <li>DataTable rows are memoized; stabilize <code>columns</code> (useMemo) for very large tables.</li>
        <li><code>virtualized</code> window-renders row sets over 50 rows.</li>
        <li>Resource debounces the search input (250ms default) before refiring <code>list()</code>.</li>
        <li>Toasts/overlays update through tiny subscriptions, not app state.</li>
      </ul>
      <h2 id="measuring">Measuring</h2>
      <p>Run <code>node scripts/bundle-guard.mjs</code> and <code>pnpm --filter @skiddph/prui build</code> to audit; every entry's size prints in the build log.</p>
    </Guide>
  )
}

export function I18nDoc() {
  return (
    <Guide
      section="guides / i18n"
      title="Internationalization"
      intro="Every user-facing string PRUI renders comes from a dictionary: override it per subtree with <PruiProvider> or globally with setPruiDictionary()."
    >
      <h2 id="dictionary">Dictionary</h2>
      <CodeView title="tsx" className="mt-2 overflow-hidden rounded-[var(--prui-radius)] border border-[var(--prui-line)]" code={`import { PruiProvider } from '@skiddph/prui/i18n'

<PruiProvider dictionary={{
  noResults: 'Keine Ergebnisse',
  rowsPerPage: 'Zeilen pro Seite',
  page: 'Seite',
  nextEntity: 'Neue {name}',
}}>
  <App>…</App>
</PruiProvider>`} />
      <p className="mt-3">
        Templates use <code>{"{name}"}</code>-style placeholders (<code>requiredField</code>, <code>newEntity</code>, …). Imperative APIs (<code>toast()</code>, <code>confirmModal()</code>) read the global dictionary, so the provider also sets it while mounted.
      </p>
      <h2 id="rtl">RTL</h2>
      <p>
        Set <code>dir="rtl"</code> on the html element. The shell and controls use logical properties (<code>padding-inline</code>, <code>margin-inline-start</code>), so spacing mirrors automatically. Anchored surfaces (Drawer sides, popover sides) stay directional by design — pass <code>side="left"</code> to mirror them.
      </p>
    </Guide>
  )
}

const MIGRATIONS: { version: string; date: string; items: string[]; breaking?: boolean }[] = [
  {
    version: "0.7.0",
    date: "2026-09",
    items: [
      "Collapsed-rail nav groups open a flyout menu instead of expanding inline.",
    ],
  },
]

export function ChangelogDoc() {
  const [changelog, setChangelog] = React.useState<string>("")
  React.useEffect(() => {
    fetch("https://raw.githubusercontent.com/eru123/prui/main/packages/prui/CHANGELOG.md")
      .then((r) => (r.ok ? r.text() : ""))
      .then(setChangelog)
      .catch(() => setChangelog(""))
  }, [])
  return (
    <Guide
      section="docs / changelog"
      title="Changelog"
      intro="Versions are cut with changesets from conventional commits; the library CHANGELOG renders here when reachable, with the current minor stream summarized below."
    >
      {changelog ? (
        <CodeView title="CHANGELOG.md" className="overflow-hidden rounded-[var(--prui-radius)] border border-[var(--prui-line)]" code={changelog.slice(0, 8000)} />
      ) : (
        <p>Fetching the changelog failed (offline?). See <code>packages/prui/CHANGELOG.md</code> in the repo.</p>
      )}
      <h2>Recent stream</h2>
      <ul>
        {MIGRATIONS.flatMap((m) => m.items.map((i) => <li key={m.version + i}><Badge variant="brand">{m.version}</Badge> {i}</li>))}
        <li><Badge variant="success">next</Badge> Overlay infrastructure, keyboard-complete menus/listboxes, semantic z-index + motion tokens, controlled Resource state, 20 new components, i18n dictionary, RTL pass.</li>
      </ul>
    </Guide>
  )
}

export function MigrationDoc() {
  return (
    <Guide
      section="docs / migration"
      title="Migration guide"
      intro="PRUI avoids breaking changes; when an API is superseded the old one keeps working with a deprecation track. These are the active migrations."
    >
      <h2 id="forms">Forms: registry Form → schema Form</h2>
      <p>
        The registry-driven <code>&lt;Form&gt;</code> from <code>@skiddph/prui/forms</code> is deprecated in favor of the schema-driven <code>&lt;Form&gt;</code> from <code>@skiddph/prui/app</code>. It still works and will not be removed before v2.
      </p>
      <CodeView title="tsx" className="mt-2 overflow-hidden rounded-[var(--prui-radius)] border border-[var(--prui-line)]" code={`// before (registry)
<Form id="user" schema={zodSchema} onSubmit={...}>
  <FormInput name="email" label="Email" required />
  <FormButton form="user" disableWhen="invalid">Save</FormButton>
</Form>

// after (schema-driven)
<Form
  schema={{ fields: [
    { name: 'email', label: 'Email', type: 'email', required: true },
  ], submitLabel: 'Save' }}
  onSubmit={async (values) => { await save(values) }}
/>`} />
      <h3>Moving FormButton</h3>
      <p>
        Render the submit button inside the form (as the schema form does), or keep using FormButton — it keeps working against the deprecated implementation. For modal footers, pass a custom <code>form</code> node to <code>&lt;Resource&gt;</code>.
      </p>

      <h2 id="variants">Button/Badge vocabulary</h2>
      <p>
        The shared vocabulary adds <code>secondary neutral success warning</code> (and Badge <code>info</code>). Old names (<code>default</code>, <code>ok</code>, <code>warn</code>, <code>brand</code>) are aliases and keep working; new code should use the standard names.
      </p>

      <h2 id="resource">Resource state</h2>
      <p>
        <code>Resource</code> now supports <code>state/defaultState/onStateChange</code> plus granular callbacks (<code>onPageChange onFilterChange onSortChange onSearchChange onSelectionChange</code>). The old flat props (<code>pageSize</code>) keep working. Migrate when you need URL-synced state.
      </p>
    </Guide>
  )
}

export function ArchitectureDoc() {
  return (
    <Guide
      section="guides / architecture"
      title="Architecture"
      intro="Two layers, one theme, generated metadata. The 2026 enterprise review confirmed the boundaries; this page is the map."
    >
      <h2 id="layers">Layers</h2>
      <ul>
        <li><strong>core</strong> (<code>prui/core/*</code>): primitives + shared infrastructure (overlay, list-nav, anchor). No app knowledge, no router. One file per component → per-primitive entries and tree-shaking.</li>
        <li><strong>data-table</strong>: DataTable + toolbar + filters. Depends only on core.</li>
        <li><strong>app</strong>: App shell, Resource, Form (canonical), pages plumbing. Owns routing.</li>
        <li><strong>pages</strong>: pre-made auth/utility screens.</li>
        <li><strong>theme</strong>: runtime theming, token constants, breakpoint hooks. CSS in <code>src/theme/*.css</code>.</li>
        <li><strong>i18n</strong>: dictionary + provider, consumed by every layer above core (and core feedback components).</li>
      </ul>
      <h2 id="infrastructure">Shared infrastructure</h2>
      <p>
        <code>core/overlay.tsx</code> (portal stack, focus trap, escape, scroll lock, inert), <code>core/list-nav.ts</code> (index math + typeahead), <code>core/anchor.ts</code> (viewport-aware positioning). Every floating surface builds on these — no duplicated focus logic anywhere.
      </p>
      <h2 id="contracts">Contracts under test</h2>
      <ul>
        <li>Docs-contract test: props documented in the agent skill must exist in the real propsMeta.</li>
        <li>Bundle guard: core/button must not import App/Resource.</li>
        <li>propsMeta on every component drives docs tables and playground controls.</li>
      </ul>
      <h2 id="state">State ownership</h2>
      <p>
        Controlled/uncontrolled per key everywhere (value/defaultValue + onChange). Overlays own focus/stack state internally; menus are non-modal by design; app surfaces (Resource) expose full state snapshots for URL syncing.
      </p>
    </Guide>
  )
}
