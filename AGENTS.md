# AGENTS.md

Working agreement for coding agents (and humans) in this repo.

## The lint loop is not optional

After making any change, run:

```
pnpm lint
```

Fix **all** errors — and all warnings: the script runs with
`--max-warnings 0`, so a single warning is a red check. There are no
"acceptable" warnings to hide behind.

## Do not cheat the linter

The design-system rules exist because generated UI drifts into one-off
garbage without them. Every known bypass is itself an error:

- **Inline disables are banned** (`local/no-inline-disables`). An
  `/* eslint-disable */` comment fails lint whether or not it suppresses
  anything.
- **Stale disables fail** (`reportUnusedDisableDirectives: "error"`).
- **Do not edit `eslint.config.js` to weaken rules** as part of a feature.
  If a rule is genuinely wrong, make that the point of the change: say so
  in the commit message and PR description so it gets reviewed on its own.
  CI re-runs `pnpm lint` with the committed config — silent weakening
  shows up as a diff.
- **`unstyled` is reserved for library internals.** Consumers never pass
  it; if a component needs skinning, that is a variant or a token, not a
  stripped component.
- **Dynamic class strings** (`bg-${color}`) cannot be checked or themed.
  Use full literal class names or component props.
- **Inline styles are banned** except the narrow, documented allowances in
  `eslint.config.js` for runtime-measured values (iframe heights, dnd-kit
  transforms, data-driven swatches).

## How to style things correctly

- **Use prui components and their props.** `variant`, `size`, `surface`
  carry the design; `className` is for layout only (`mt-4`, `w-full`,
  `flex`, `gap-2`, …).
- **Colors come from tokens**: `text-[var(--prui-dim)]`,
  `bg-[var(--prui-raise)]`, or a component variant. Raw palette classes
  (`bg-pink-500`) break theming and fail lint.
- **The site scales through named tokens** defined in
  `site/src/index.css` (`@theme`): `text-micro`, `text-caption`,
  `text-lede`, `text-title`, `text-hero`, `max-w-site`, `max-w-content`,
  `max-w-read`, `min-h-hero`, … Arbitrary values (`p-[13px]`,
  `text-[27px]`) fail lint. Need a new step? Add a token to `@theme` —
  that is the design decision, made once.
- **Cards, Labels, Alerts, Inputs** accept typography adjustments via
  contracts (see `eslint.config.js`); controls like Button do not.
- **The library is not exempt.** `packages/prui/src` composes its own
  components through the same semantic registry (`src/theme/tokens.css`:
  `bg-brand`, `text-dim`, `rounded-prui`, …) and passes the same rules.
  The only allowances are the z-index token contract, runtime geometry
  (the anchoring engine), and `withSurface()`'s dynamic style spreads —
  each documented in the config.

## Where the rules live

`eslint.config.js` — the `shadcn/*` rules, per-component contracts, the
disable ban, and the anti-cheat notes. The error messages tell you the
correct fix; read them instead of guessing.

## Nothing releases on a red check

CI (`.github/workflows/ci.yml`) runs, on every push and PR:

1. `pnpm lint` — zero errors AND zero warnings (`--max-warnings 0`)
2. `pnpm -r typecheck`
3. `pnpm -r test`
4. `pnpm -r build` + bundle guard + landing budget
5. **e2e** — real-browser smoke + accessibility suites against the built
   site (`npx playwright test --grep-invert "visual regression"`; the
   visual suite has win32 baselines, so run and update it locally on
   Windows with `pnpm test:e2e --update-snapshots`)

The release chain is strictly downstream: `ci` + `e2e` → `changesets` →
`release`. If any check is red, versioning and npm publishing are skipped
entirely. Do not declare work done while any check is yellow or red —
watch the run to completion (`gh run watch`) and fix what fails.
