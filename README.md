# prui

PRUI is a React component system with two layers, built from four production apps (HRLabs, jianpms, t4xlabs, icanhelp-tracker) that used to copy the same UI code by hand:

- **App layer** (`@skiddph/prui/app`) — config-driven super-components. `<App nav={...}>` renders the whole shell (sidebar, header, command palette, theme, mobile drawer, optional session-timeout flow). `<Resource>` renders a complete CRUD screen from a column config and your API functions. Plus `Form`, `StatRow`, `Settings`, `AuthShell`, `SessionTimeout` and the pre-made page set (login, register, OTP, 404, error, profile, settings, admin setup), auto-routable via `<App pages="auth">`.
- **Primitives layer** (`@skiddph/prui/core`, `@skiddph/prui/data-table`) — Button, Input, Select, Tabs, DataTable and friends for standard composition, plus the enterprise set: Toast, Alert, Tooltip, Popover, Checkbox, Radio, Combobox, Skeleton, Spinner, Progress, Accordion, Breadcrumb, Drawer, Sheet, FileUpload, Calendar, DatePicker, DateRangePicker, TreeView, Timeline. Every overlay sits on one shared infrastructure (focus trap, restore, nested stacking, topmost Escape, inert background, reduced motion) and every list is keyboard-complete (arrows, Home/End, typeahead).
- **Semantic tokens** — z-index, motion, typography, spacing, elevation, and opacity scales as CSS variables (`--prui-z-*`, `--prui-duration-*`, `--prui-shadow-*`, …) with light-mode-aware shadows and a JS mirror (`PRUI_BREAKPOINTS`, `PRUI_DESIGN_TOKENS`).
- **i18n & RTL** — every user-facing string comes from a dictionary (`PruiProvider` / `setPruiDictionary`); layout uses logical properties.
- **Theme system** (`@skiddph/prui/theme`) — CSS-variable tokens, four named themes (control, workshop, ember, daylight), runtime `applyTheme()`, overridable from one CSS file.

The docs site at [prui.skiddph.com](https://prui.skiddph.com) is built with prui itself and ships a live component catalog, layout examples, theming guide, an agent quickstart, and a visual **Designer** (`/designer`) that renders a real `<App>` preview and generates the config code.

`skill/` in this repo is an agent skill (SKILL.md + references) that teaches an agent the PRUI vocabulary — point your agent at the folder; no installation step. A docs-contract test keeps the skill's documented props in sync with the real component APIs.

## Install

```sh
pnpm add @skiddph/prui
```

```tsx
import '@skiddph/prui/styles.css'
import { App } from '@skiddph/prui/app'

<App
  brand={{ name: 'My App' }}
  nav={[{ label: 'Dashboard', href: '/' }]}
  search={{ enabled: true, hotkey: '/' }}
  theme={{ default: 'dark', persist: true }}
>
  {routes}
</App>
```

React 19, react-router-dom and lucide-react arrive as dependencies. All exports are tree-shakeable; `@skiddph/prui/core/button` ships no app-layer code (CI-enforced).

## Develop

```sh
pnpm install
pnpm -r typecheck   # both packages
pnpm -r test        # vitest: library (component + contract tests) and site (designer state)
pnpm -r build       # library dist + docs site dist
pnpm lint           # eslint (flat config)
pnpm format         # prettier
npx playwright test # real-browser smoke + axe + visual regression (site must be built)
node scripts/bundle-guard.mjs    # AC-7: core/button must not ship App/Resource
node scripts/landing-budget.mjs  # AC-6: landing JS under 100KB compressed
```

Local site dev server: `pnpm --filter prui-site dev`. The site imports prui from source (`site/vite.config.ts` aliases) so library changes show live.

## Repository layout

| Path | What |
|---|---|
| `packages/prui` | The library: `src/core`, `src/app`, `src/data-table`, `src/pages`, `src/forms`, `src/theme`, `src/i18n` |
| `packages/cli` | `create-prui-app` + generators (theme, resource, page, layout, CRUD) |
| `site` | Docs site (Vite + prui), deployed to prui.skiddph.com |
| `skill` | Agent skill (SKILL.md + references), versioned with the repo |
| `prototypes` | The approved design variants; p4 (direction D) is the build contract |
| `scripts` | Release automation + AC-6/AC-7 guards |
| `proposal.md` | The approved proposal with acceptance criteria |

## Versioning and release

Changesets with auto-versioning from conventional commits: pushes to `main` that change `packages/prui` get a semver bump (feat → minor, fix → patch, BREAKING CHANGE → major), a `prui@x.y.z` tag, and an npm publish of `@skiddph/prui` from CI.

## Deploy

```sh
pnpm --filter prui-site build
wrangler deploy
```

`wrangler.jsonc` serves `site/dist` as Workers static assets on the `prui.skiddph.com` custom domain (SPA fallback).

## License

Apache-2.0
