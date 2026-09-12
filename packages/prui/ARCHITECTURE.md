# PRUI Architecture Review (2026 enterprise pass)

Scope: every exported surface of `@skiddph/prui` (core, data-table, app,
forms, pages, theme, i18n), the docs site, and the supporting scripts.
Goal: confirm the layering that made PRUI fast to build on still holds at
library scale, and record the refactors that were justified — and the ones
deliberately NOT done.

## Verdict

The two-layer architecture (config-driven app layer + composable
primitives) is preserved and now rests on three pieces of shared
infrastructure instead of per-component re-implementations:

| Module | Owns | Used by |
|---|---|---|
| `core/overlay.tsx` | portal stack, focus trap/restore, topmost-only Escape, scroll lock, inert background, `useOverlay` composite | Modal, Dialog, Drawer, Sheet, CommandPalette, mobile drawer, Popover, Tooltip, DatePicker, confirmModal |
| `core/list-nav.ts` | index math (arrows/Home/End, disabled-skipping) + typeahead | Dropdown, Select, Combobox, CommandPalette, rail flyout, RadioGroup, TreeView |
| `core/anchor.ts` | viewport-aware anchored positioning | Tooltip, Popover, DatePicker, DateRangePicker, Combobox |

## Layer contracts (unchanged, now enforced by usage)

- **core** never imports from app/data-table/pages. Bundle-guard keeps
  `core/button` free of App/Resource code.
- **data-table** depends only on core.
- **app** owns routing; consumers never import react-router directly.
- **theme** is dependency-free; `PRUI_BREAKPOINTS` / `PRUI_DESIGN_TOKENS`
  are the JS mirror of the CSS custom properties.
- **i18n** is a leaf consumed by every layer; dictionaries never import
  components.

## Refactors done (each clearly improves maintainability)

1. **Overlay logic deduplicated** — five ad-hoc focus/escape/scroll
   implementations collapsed into `core/overlay.tsx`. This is the single
   highest-leverage change: every overlay now shares nesting, focus, and
   reduced-motion behavior.
2. **Portaled overlays** — Modal/Dialog/CommandPalette/drawer moved from
   inline fixed positioning to body portals, unblocking stacking and the
   inert background.
3. **propsMeta on every component** (including the 20 new ones) keeps the
   docs tables, playground controls, and the agent skill in sync by test.
4. **DataTable row memoization + windowing** extracted the row renderer;
   selection/expansion became declarative props instead of caller-side
   patterns.
5. **Strings centralized** in the i18n dictionary (template interpolation
   for composables like `newEntity: "New {name}"`).

## Refactors considered and rejected (avoiding churn)

- **Merging Modal and Dialog**: they serve different ergonomics
  (imperative/sized vs compound/declarative); both now share the same
  infrastructure, so the duplication that justified a merge is gone.
- **Moving Select under Combobox**: Select's closed/open trigger model is
  simpler than Combobox's filtering model; a shared base would couple their
  public props for little code savings.
- **CSS-in-JS or vanilla-extract migration**: the tailwind-utility +
  CSS-variable token system already delivers runtime theming with zero
  runtime CSS cost; a migration would churn every component file.
- **Renaming `default` → `secondary` on Button**: kept both (alias) — a
  hard rename would break every consumer for zero behavior change.

## State ownership model

- Controlled/uncontrolled per key everywhere (`value`/`defaultValue` +
  `onChange`), including Resource's `state`/`defaultState`/`onStateChange`
  (per-key controlled subsets).
- Overlays own focus/stack state internally; menus are non-modal by design.
- Toasts update through a module-level subscription store, not app state.

## Package boundaries

`@skiddph/prui` remains the single runtime package with subpath exports
(tree-shakeable per primitive). `prui-cli` (this repo, `packages/cli`) is a
separate zero-dependency package: scaffolding code must never be importable
from the library. The docs site and prototypes are not published.

## Public export audit (post-pass)

- core: 30 components + infrastructure hooks, all with propsMeta and
  per-file build entries.
- app: App/AppShell/SidebarNav/CommandPalette/Resource/Form/StatRow/
  Settings/SessionTimeout/AuthShell/AutoPages.
- data-table: DataTable, toolbar, 6 filter types, cursor pagination.
- theme: applyTheme family + PRUI_BREAKPOINTS + useBreakpointAtLeast +
  PRUI_DESIGN_TOKENS.
- i18n: PruiProvider/usePruiI18n/setPruiDictionary/dictionary types.
- Deprecations tracked: registry Form (`@skiddph/prui/forms`) — functional,
  IDE-flagged, migration guide shipped; removal not before v2.

## Folder organization (unchanged by design)

```
src/core        primitives + shared infra, one file per component
src/data-table  table family
src/app         config-driven super-components
src/pages       pre-made screens
src/forms       deprecated registry form (compatibility)
src/theme       runtime theming + token constants
src/i18n        dictionary + provider
src/theme/*.css tokens + shell layout CSS (bundled to dist/prui.css)
```

One file per component keeps vite entries mechanical and reviews small;
the pass confirmed this still reads well at 30+ components.
