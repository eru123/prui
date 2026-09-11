# PRUI Proposal (v2, enhanced)

## Understanding

PRUI is the component system that already exists in production four times over. HRLabs, jianpms, and icanhelp-tracker share the same hand-made layout (sidebar + header + centered content), the same shadcn-style primitives, the same CSS-variable theme tokens, and dozens of byte-identical component files. t4xlabs forked the same design and pushed it through a theming pass. Every fix made today gets copied four times, and the copies drift (button.tsx already diverged between HRLabs and icanhelp over a single `asChild` prop).

PRUI v2 ships three things:

1. **`prui` npm package** with two layers of abstraction:
   - **Primitives layer**: Button, Input, Select, Tabs, DataTable, and friends. For teams that want standard composition.
   - **App layer (the big step)**: a small set of declarative, config-driven super-components that build whole application structures from props. `<App>` with a `nav` list renders sidebar, header, routes, and theme. `<Resource index users={...}/>` renders a complete CRUD listing with filters, table, pagination, and form modal. This is the layer that lets an AI agent (or a developer in a hurry) assemble a working admin app in minutes instead of days.
2. **`prui-skill`**: an agent skill (SKILL.md, installable to Hermes, Claude Code, or any agent that reads skill folders) that teaches an agent the PRUI vocabulary: when to reach for `<App>`, how to write nav/resource configs, theming, and the progressive adoption path. An agent with this skill can scaffold a PRUI app end to end without reading the full docs.
3. **Documentation website** at prui.skiddph.com: landing, live component catalog, layout examples, and the agent-workflow guide.

The single job: one source of truth for UI, and a high enough abstraction that "build me an app" is a config, not a project.

## What the four apps actually share (extraction audit)

| Layer | HRLabs | jianpms | icanhelp | t4xlabs | Disposition |
|---|---|---|---|---|---|
| Primitives (button, badge, card, input, label, select, switch, tabs, textarea, modal, dropdown, menu) | 14 | 14 | 36 | hand-rolled equivalents | Primitives layer; icanhelp copy is the canonical superset |
| App shell (sidebar, header, layout) | yes, hardcoded nav array in sidebar.tsx | per-app | yes, nav + branding config | variant | **Becomes `<App nav={...}>`**; icanhelp's branding-config and HRLabs' NavGroup pattern generalize into one declarative config |
| DataTable family | custom DataTable.tsx | per-app | 8 components (pagination, toolbar, faceted/number/price/date/time filters) | per-app | Primitives layer + feeds `<Resource>` |
| Theme tokens | CSS vars (`--background`, `--primary`, hsl triplets) | same | same | theming layer | `prui/theme`, t4xlabs multi-theme generalized |
| Auth/session UI (SessionTimeout, OTPModal) | yes | no | yes | no | Optional exports |

jianpms' `packages/ui` workspace already proves the package shape. HRLabs' layout.tsx (responsive sidebar state, outlet pattern) and icanhelp's sidebar.tsx (NavGroup/NavItem types, active-path detection, body-scroll lock) are literally the same component written twice; v2 folds both into `<App>`.

## The App layer: super-components

Design rule: every super-component is a thin, tree-shakeable orchestration over exported primitives. No hidden magic, every part overridable via slots, all config typed.

### `<App>`: one component, the whole shell

```tsx
import { App } from 'prui/app'

<App
  brand={{ name: 'HRLabs', mark: '/logo.svg' }}
  nav={[
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Employees', href: '/employees', icon: Users },
    {
      label: 'Leave', icon: Calendar,
      items: [
        { label: 'Requests', href: '/leave/requests' },
        { label: 'Balances', href: '/leave/balances' },
      ],
    },
  ]}
  search={{ enabled: true, hotkey: '/' }}   // command palette, built in
  theme={{ default: 'dark', persist: true }}
  auth={{ sessionTimeout: 30 }}
>
  {routes}
</App>
```

What that one component renders today across three apps, hand-written each time: responsive sidebar (collapsible groups, active-route highlight, mobile drawer with backdrop and scroll lock), sticky header (brand slot, centered search, theme toggle), command palette, theme persistence, session timeout handling, and the content outlet. App props: `nav`, `brand`, `search`, `theme`, `auth`, `header` (slot), `sidebar` (collapsible width, defaultOpen), `router` (react-router or memory for embedded use).

### `<Resource>`: a CRUD screen from a schema

```tsx
<Resource
  name="employees"
  columns={[
    { key: 'name', label: 'Name', sortable: true },
    { key: 'status', label: 'Status', filter: 'select', options: statuses },
    { key: 'hired', label: 'Hired', filter: 'daterange' },
  ]}
  list={api.listEmployees}       // (query) => Promise<{rows, cursor}>
  form={<EmployeeForm />}         // optional custom form
  actions={['create', 'edit', 'delete']}
/>
```

Renders toolbar + faceted filters + DataTable + cursor pagination + create/edit modal + delete confirmation, wired to your API functions. The icanhelp DataTable family (8 filter components) becomes filter type names in a column config. This is the piece that makes "an app in minutes" literal: an agent defines resources and columns, and gets consistent, working screens.

### Also in the App layer

- `<Form schema={...} onSubmit>`: react-hook-form wrapper, zero-boilerplate fields from a schema, validation display included
- `<StatRow items={[...]}>`: the KPI cards every dashboard starts with
- `<Settings sections={[...]}>`: two-column settings page from a section list
- `<AuthShell>`: login/OTP/session-timeout screens (from HRLabs' SessionTimeout/OTPModal)

An agent building an admin app composes `<App>` + a few `<Resource>`s + a dashboard page. That is the entire surface it needs.

## The `prui-skill` agent skill

Shipped in the repo at `skill/` and installable to `~/.hermes/skills/`, `~/.claude/skills/`, or `~/.agents/skills/`. Structure per the shared-skills convention (SKILL.md entry + references):

- **When to use**: user asks to build/prototype an app, admin panel, dashboard, or internal tool with React
- **The fast path**: `<App>` + `<Resource>` recipes with copy-paste configs (the minutes-to-app flow)
- **Reference tables**: every super-component's props, every primitive's variants
- **Theming**: token override file template, named themes
- **Adoption ladder**: super-components only, mix, or primitives only
- **Verification**: what to check before declaring an app done (responsive drawer, keyboard nav, empty/error states)

The skill means an agent never has to browse the docs to be productive; the docs site remains the human-facing reference and the live catalog.

## Scope

In:

- pnpm monorepo: `packages/prui` (library), `site` (docs), `skill/` (agent skill)
- Library: primitives layer, App layer (`App`, `Resource`, `Form`, `StatRow`, `Settings`, `AuthShell`), theme system, `cn()`
- Progressive adoption: preset import paths (`prui/app`, `prui/data-table`, `prui/core`), tree-shakeable, apps keep their own tailwind config
- Versioning: changesets, private GitHub Packages registry, semver
- `prui-skill` agent skill as above
- Docs site: landing (chosen direction D), live component catalog (both layers), layout examples, theming guide, agent quickstart, installation/adoption guides
- CI: build, typecheck, tests (vitest + testing-library), bundle-size guard (super-components tree-shake), package publish workflow
- Site built with prui itself (dogfooding)

Out (agreed now, the only exclusions):

- Migrating the four apps to prui (per-app follow-up work; HRLabs proposed as first adopter)
- Framework bindings other than React
- Figma/design-tool integration
- Public npm publishing (private registry; can flip later)
- Backend/API generation (prui consumes your API functions, never generates them)
- Icon library (lucide-react stays a peer dependency)

## Data model

The docs site is static (Workers assets), no database. The package has no data model; `<Resource>` consumes caller-provided `list`/`create`/`update`/`delete` functions.

## API contract

The npm package surface:

- `prui/core`: primitives, `cn`
- `prui/app`: `App`, `Resource`, `Form`, `StatRow`, `Settings`, `AuthShell`
- `prui/data-table`: the DataTable family for direct composition
- `prui/theme`: token CSS, named themes, `applyTheme()`
- Peer deps: react, react-dom, lucide-react, react-router-dom (`App` routing only)

## Pages and flows (docs site)

- **Landing**: the chosen direction D design, live component showcase, install snippet
- **Components**: catalog for both layers (primitives and super-components), live demos, props tables, copyable code
- **Layouts**: full-page demos (dashboard, listing, settings, auth)
- **Theming**: token reference, named themes, override guide
- **Agents**: the quickstart an agent follows; link to install the skill
- **Guides**: installation, progressive adoption, migrating an existing app

## Acceptance criteria

- AC-1: `pnpm add prui` in a fresh Vite React app; `<App nav={...}>` renders a working shell (sidebar groups, mobile drawer, theme switch) with no other setup
- AC-2: a `<Resource>` with 5 columns and 2 filter types renders a complete listing (toolbar, filters, pagination, sort, create/edit modal, delete confirm) driven only by props and API functions
- AC-3: an agent following only `prui-skill` builds a working two-resource admin app in one session; verified by a recorded agent run
- AC-4: every catalog component (both layers) has a live demo, props table, copyable snippet
- AC-5: theme tokens overridable by one CSS file, no prui source edits; light/dark + named themes switch at runtime
- AC-6: docs site landing under 100KB JS, Lighthouse 90+, responsive 390px/1440px
- AC-7: importing only `prui/core/button` ships no `App` or `Resource` code (CI bundle check)
- AC-8: changeset -> version bump -> GitHub Packages release from CI on main
- AC-9: each shared component from the four source apps traces to a prui export (docs page "Where it comes from", internal-only link)
- AC-10: all pages pass keyboard navigation and visible focus checks
- AC-11: `prui-skill` installs to `~/.hermes/skills/` and `~/.claude/skills/` and passes the agent-run test in AC-3 from each host

## Test plan

- vitest + testing-library: primitives render/variant/controlled tests; super-components render correct structure from config (nav -> sidebar tree, columns -> filter bar)
- `<App>`: nav config to rendered tree, active-route highlight, drawer open/close/lock, palette hotkey
- `<Resource>`: pagination math, filter combinations, optimistic states, error states
- Bundle-size regression (AC-7)
- Browser proof: docs site flows, theme switching, 390px/1440px screenshots
- Agent proof: scripted run with only the skill loaded (AC-3)

## Deployment target

Cloudflare Workers (static assets) via wrangler, `prui.skiddph.com`. Review prototypes currently live at `/prototypes/` (direction D chosen as the base).

## Assumptions

- Private GitHub Packages registry, unscoped `prui` name (registry config documented; public npm name is taken, staying private until an explicit decision)
- React 19 + Vite 8 + pnpm workspace monorepo
- icanhelp-tracker's component set is the canonical baseline; HRLabs/jianpms divergences fold in as props or variants
- t4xlabs' theming becomes the multi-theme mechanism
- `<App>` integrates react-router (the pattern all four apps use); a router-less mode ships for embedded/demo use
- Docs site is static; no accounts, no uploads, no D1
- Direction D (Control Room + Workshop) is the approved site design, with the landing revisions already applied
- First-adopter migration (HRLabs) is follow-up work after prui ships

## Prototype status

Direction D approved with revisions: centered desktop search with command palette, mobile drawer, TOC rail, live component showcase, `prui` naming. Prototypes live at `prui.skiddph.com/prototypes/`; review deployment to be torn down at build start per the product pipeline.
