# AC-3 / AC-11 agent-run record

Proposal acceptance criteria:

- **AC-3** — "an agent following only `prui-skill` builds a working two-resource admin app in one session; verified by a recorded agent run"
- **AC-11** — "`skill/` works when an agent loads it straight from the repo checkout; the agent-run test (AC-3) passes from a fresh clone without any installation step"

## Run protocol

1. `git clone eru123/prui` to a fresh temp directory; the agent loaded **only** `skill/SKILL.md` and the references it points to, straight from that checkout. No prui build, no installation step (AC-11).
2. Scaffolded `pnpm create vite ac3-admin --template react-ts` and followed `skill/references/agents-workflow.md` top to bottom: install `@skiddph/prui` from npm, theme import, `<App>` shell with nav/search/theme/`auth={{ sessionTimeout: 30 }}`, fixture `api.ts` in the documented `{ rows, cursor }` shape, two `<Resource>` screens (employees, leave-requests) and a `<StatRow>` dashboard.
3. Verified the result with `tsc -b && vite build`, served the build, and exercised it in a real browser: shell, sidebar group expansion, active-route highlight, command palette, theme switch to daylight with a brand-color override, both CRUD screens with faceted/date/number filters, sort, pagination and row actions.

Result: **working, styled two-resource admin app** — screenshots and the full log in the session record; this file is the durable summary.

## Findings the run surfaced (all fixed)

The run did its job: the first two attempts produced a broken app, and each failure traced to a real defect that unit tests did not cover.

| # | Symptom | Root cause | Fix |
|---|---|---|---|
| 1 | Type error on the skill's own example code | `Resource` mutators demanded `Promise<void>` returns and `values: Record<string, unknown>`, rejecting the natural `Partial<T>` consumer shape | Widened `create`/`update`/`remove`/`delete` to return `unknown` and take `(row, Partial<T>)` |
| 2 | `Cannot find module 'react-router-dom'` in consumer code | The skill had consumers import `Routes`/`Route` from react-router directly, which pnpm's strict isolation forbids when react-router is prui's dependency, not the app's | `@skiddph/prui/app` now re-exports `Routes`, `Route`, `Outlet`, `Link`, `NavLink`, `Navigate`; docs updated to never import react-router directly |
| 3 | Blank page at runtime: "Invalid hook call … more than one copy of React" | `react`/`react-dom` were regular **dependencies** of the package, so pnpm gave the library its own React copy inside the consumer's strict `node_modules` | `react`, `react-dom` (and `lucide-react`, per the proposal's scope note) are now **peerDependencies**; the proposal's "React 19, consumers bring the stack" assumption is honored |
| 4 | App renders and works but is completely unstyled | prui components are styled with tailwind utilities, but `@skiddph/prui/styles.css` shipped only tokens (3.6KB); a fresh consumer has no tailwind and the skill never mentioned it | The package build now compiles the utilities prui's own class strings use into `styles.css` (`dist/prui.css` 3.6KB → ~32KB); consumers need zero tailwind setup (AC-1) |
| 5 | Blank page under Vite 8 specifically | rolldown (Vite 8's bundler) loads two React copies unless the app dedupes | `agents-workflow.md` now includes the `resolve.dedupe: ['react', 'react-dom']` scaffold step |

## Regression guards added

- Docs-contract test extended: `@skiddph/prui/app` must re-export every route helper the skill references.
- The utilities compile runs in `pnpm --filter @skiddph/prui build`, so the published package always ships them; CI's bundle/landing guards still pass with the larger CSS.

Published as `@skiddph/prui@0.2.1` (peer/re-export/mutator fixes) and `0.2.2` (shipped utilities + skill dedupe guidance).
