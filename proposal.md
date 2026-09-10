# PRUI Proposal

## Understanding

PRUI (Progressive UI) is the component system that already exists in production four times over. HRLabs, jianpms, and icanhelp-tracker share the same hand-made layout (sidebar + header + centered content), the same shadcn-style primitives, the same CSS-variable theme tokens, and dozens of byte-identical component files. t4xlabs forked the same design and pushed it through a theming pass. Every fix made today has to be copied four times, and the copies drift (button.tsx already diverged between HRLabs and icanhelp over a single `asChild` prop).

The product has two halves:

1. **An npm package** (`@skiddph/prui`) holding the shared component system: primitives, the app shell (sidebar, header, layout), the DataTable family, theming via CSS variables, and progressive adoption utilities so each app can adopt it piecemeal. Updates flow to apps through normal semver dependency bumps.
2. **A documentation website** at prui.skiddph.com with the polish of a first-party UI product: landing page, layout examples, implementation guides, and a live component catalog.

The single job: one source of truth for the UI so an update in prui lands in every app with a version bump.

## What the four apps actually share (extraction audit)

| Layer | HRLabs | jianpms | icanhelp | t4xlabs | Disposition |
|---|---|---|---|---|---|
| Primitives (button, badge, card, input, label, select, switch, tabs, textarea, modal, dropdown, menu) | 14 | 14 | 36 | hand-rolled equivalents | Core; icanhelp copy is the most evolved (superset with asChild, dialog fixes) |
| App shell (sidebar, header, layout) | yes | per-app | yes | variant | Core as `AppShell` with config-driven nav (icanhelp's branding-config pattern generalized) |
| DataTable family | custom DataTable.tsx | per-app | 8 components (pagination, toolbar, faceted/number/price/date/time filters) | per-app | Core; icanhelp's set is the reference |
| Theme tokens | CSS vars (`--background`, `--primary`, hsl triplets) | same | same | theming layer | Core as `prui-theme` (light/dark/base + t4xlabs multi-theme pattern) |
| Auth/session UI (SessionTimeout, OTPModal) | yes | no | yes | no | Core (optional exports) |

jianpms already proves the package shape: its `packages/ui` workspace is the same idea one app wide.

## Scope

In:

- pnpm monorepo: `packages/prui` (component library), `packages/prui-theme` (token system), `site` (docs website)
- Component library: primitives, AppShell (sidebar/header/layout, config-driven nav), DataTable family, form utilities (react-hook-field wrappers from HRLabs/icanhelp `@hookform/resolvers` usage), StatCard, StatusBadge, PhoneInput, SensitiveInput, Copyable, DetailSection
- Theming: CSS-variable tokens, light/dark, multiple named themes (generalizing t4xlabs' theming), per-app token override file
- Progressive adoption: every component tree-shakeable, `cn()` utility, import map presets (`prui/core`, `prui/data-table`, `prui/shell`), no lock-in CSS reset, apps keep their own tailwind config
- Versioning: changesets, GitHub Packages registry (private), semver; apps bump like any dependency
- Docs site: landing, live component catalog (props, variants, code), layout examples (the four app shells as demos), theming guide, installation and adoption guide (per-app migration path)
- Storybook-free catalog: the site IS the catalog (docs site built with prui itself, dogfooding the system)
- CI: build, typecheck, tests (vitest + testing-library), visual smoke of the catalog pages, package publish workflow

Out (agreed now, the only exclusions):

- Migrating the four apps to prui (that is per-app work after prui ships; HRLabs is the proposed first adopter)
- Web components / framework bindings other than React
- Figma/design-tool integration
- Public npm registry publishing (private GitHub Packages; can flip public later)
- Icon library (keep lucide-react as peer dependency)

## Data model

The docs site is static ( Workers assets) with no database. The package has no data model. Component metadata for the catalog (props, variants) is generated at build time from source types into static JSON.

## API contract

None. The "API" is the npm package surface:

- `@skiddph/prui`: named exports per component, `cn`, preset import paths
- `@skiddph/prui/theme`: token CSS, theme definitions, `applyTheme()` helper
- Peer deps: react, react-dom, lucide-react, react-router-dom (AppShell only)

## Pages and flows (docs site)

- **Landing**: the job in one screen, live components in situ, installation snippet, the four apps as proof
- **Components**: catalog index + per-component pages (live demos, props table, variants, copy-paste code)
- **Layouts**: the app-shell patterns (dashboard, settings, listing with the DataTable) as full-page live demos
- **Theming**: token reference, theme switcher demo (t4xlabs pattern), override guide
- **Guides**: installation, progressive adoption, migrating an existing app (HRLabs as the worked example)

## Acceptance criteria

- AC-1: `pnpm add @skiddph/prui` from a fresh Vite React app resolves from GitHub Packages and renders Button, Card, Input, Select, Tabs without errors
- AC-2: every component listed in the catalog page has a live demo, props table, and copyable code snippet
- AC-3: AppShell renders a working sidebar (nested groups, collapse, active state), header, and content area driven by a nav config object, with light/dark and named-theme switching
- AC-4: DataTable demo covers pagination, toolbar, faceted filter, and column sorting with realistic seeded data
- AC-5: theme tokens in the demo app are overridable by a single CSS file (custom brand) without touching prui source
- AC-6: docs site loads under 100KB JS on the landing page (Lighthouse performance 90+), responsive at 390px and 1440px
- AC-7: package tree-shaking verified: an app importing only Button does not ship DataTable code (bundle-size CI check)
- AC-8: publishing flow: changeset -> version bump -> GitHub Packages release, all from CI on main
- AC-9: each of the four source apps' shared components is traceable to a prui component in the extraction table (docs page "Where it comes from")
- AC-10: landing, catalog, layouts, theming, guides pages all pass keyboard navigation and visible focus checks

## Test plan

- vitest + testing-library: every component renders, variants apply classes, controlled/uncontrolled inputs behave
- AppShell: nav config -> rendered tree, active-route highlighting, group collapse
- DataTable: pagination math, filter combination behavior
- Bundle-size regression test in CI (AC-7)
- Browser proof: catalog click-through, theme switcher, copy buttons, 390px/1440px screenshots

## Deployment target

Cloudflare Workers (static assets) via wrangler, custom domain `prui.skiddph.com`. Prototypes at `prui.skiddph.com/prototypes/` during review.

## Assumptions

- Private GitHub Packages under the eru123 org; apps already have or will get a read token in `.npmrc` (setup instructions delivered)
- React 19 + Vite 8 + pnpm workspace monorepo (the fleet default stack)
- icanhelp-tracker's component set is the canonical baseline; HRLabs/jianpms divergences fold in as props or variants, not forks
- t4xlabs' theming approach becomes the multi-theme mechanism rather than a special case
- The docs site is static; no accounts, no uploads, no D1
- First adopter migration (HRLabs) happens as a follow-up engagement after prui ships; not in this build

## Prototype variants

Three directions for the docs-site design, deployed at `https://prui.skiddph.com/prototypes/`:

- **A: The Workshop**. Dark, engineering-first. Component code as visual texture, monospace-forward, live props playgrounds front and center. The catalog IS the product.
- **B: The Gallery**. Editorial, light, museum-quiet. Components displayed like exhibits with generous whitespace, the Apple/Nord approach to a component library.
- **C: The Control Room**. The fleet's own house style: Instagram-dark nav rails, Telegram-like centered column for docs content, component demos in floating panels. It looks like the apps it serves.
