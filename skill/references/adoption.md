# Adoption ladder and import paths

PRUI is progressively adoptable: start with super-components, drop toward primitives only where config does not fit, and keep your own tailwind config. Import paths are preset per layer so bundlers tree-shake cleanly.

## Import paths

| Path | Contains |
|---|---|
| `prui/app` | `App`, `Resource`, `Form`, `StatRow`, `Settings` |
| `prui/pages` | pre-made page components (`LoginPage`, `RegisterPage`, ..., `AdminSetup`) |
| `prui/core` | primitives (`Button`, `Input`, `Select`, `Tabs`, ...) and `cn()` |
| `prui/data-table` | the DataTable family for direct composition |
| `prui/theme` | token CSS, named themes, `applyTheme()` |

Dependencies: `react`, `react-dom`, and `react-router-dom` arrive with the package (the App layer owns routing; `Routes`/`Route` are re-exported from `@skiddph/prui/app`). `lucide-react` is a peer dependency — install it in the app (`pnpm add lucide-react`).

## Tree-shaking

Every super-component is a thin orchestration over exported primitives, and the package is fully tree-shakeable: importing only `prui/core/button` ships no `App` or `Resource` code (guarded by a CI bundle check). Practical rules:

- Import from the specific layer path (`prui/app`, not a barrel that pulls everything).
- One layer never drags in another: `prui/core` does not pull routing; `prui/data-table` does not pull the shell.
- Your app keeps its own tailwind config; PRUI does not hijack it.

## The ladder

### Rung 1: super-components only

For new apps and prototypes. The whole UI is `<App>` + `<Resource>` + pre-made pages. Fastest path, least code, consistent by construction.

```tsx
import { App, Resource, StatRow } from '@skiddph/prui/app'
```

Use when: greenfield admin panel, dashboard, internal tool, or any "build me an app" request. This is the default; see [agents-workflow.md](agents-workflow.md) for the end-to-end path.

### Rung 2: mixed

Super-components for structure, primitives for the custom corners. Typical: `<App>` + `<Resource>` for standard screens, hand-composed `prui/core` + `prui/data-table` screens for the one weird page config cannot express, `<Resource form={...}>` slot for custom forms.

```tsx
import { App, Resource } from '@skiddph/prui/app'
import { Button, Card } from '@skiddph/prui/core'
import { DataTable } from '@skiddph/prui/data-table'
```

Use when: an existing React app adopts PRUI screen by screen, or a super-component almost fits and only one part needs hand-rolling.

### Rung 3: primitives only

No App layer at all: `<App>` replaced by your own shell, PRUI used as a component kit.

```tsx
import { Button, Input, Select, Tabs } from '@skiddph/prui/core'
import { cn } from '@skiddph/prui/core'
```

Use when: the app already has routing, layout, and theme infra and only wants consistent styled primitives. Note that with no `<App>`, you own routing, nav active-state, and the theme toggle yourself (`applyTheme` from `prui/theme` is still available).

## Choosing a rung

- New app or "prototype it now": rung 1, always.
- Existing app, incremental migration: enter at rung 2 where the next screen is CRUD-shaped; rung 3 for apps that will never adopt the shell.
- Downward movement is per-screen, not per-app: one screen can be a `<Resource>` while its neighbor is hand-composed from primitives.

## Migration note

When folding an existing hand-rolled screen into `<Resource>`, map the old column/filter code to the `columns` config (the icanhelp DataTable filter family maps one-to-one to `filter` type names: `select`, `daterange`, `number`, `price`, `time`). Delete the hand-written toolbar, filter, pagination, and modal code; the API functions are the only thing you keep.
