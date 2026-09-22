# AGENTS.md

Working agreement for coding agents (and humans) in this repo.

## The lint loop is not optional

After making any change, run:

```
pnpm lint
```

Fix **all** errors before considering the work done. Warnings in
`packages/prui/src` are pre-existing and not yours to expand.

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

## Where the rules live

`eslint.config.js` — the `shadcn/*` rules, per-component contracts, the
disable ban, and the anti-cheat notes. The error messages tell you the
correct fix; read them instead of guessing.

CI (`.github/workflows/ci.yml`) runs lint, typecheck, tests, build, and
the bundle/landing budgets on every push. Nothing merges red.
