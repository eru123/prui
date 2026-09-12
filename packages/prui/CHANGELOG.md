# @skiddph/prui

## 0.6.0

### Minor Changes

- - corrected shell variants: C combines A and B with a sidebar header row, A/B/C collapse on desktop and mobile, D is the facebook-style centered sticky layout

## 0.5.0

### Minor Changes

- - shell layouts showcase with live previews on the app-layer page

## 0.4.2

### Patch Changes

- - theme switcher clears builder token overlays so switching themes applies again

## 0.4.1

### Patch Changes

- - auto-fit grid for theme builder token rows (3 columns desktop, no class collisions)

## 0.4.0

### Minor Changes

- - surface flexibility layer, custom theme APIs (defineTheme/applyThemeTokens), palette toggle icon, higher-order forms module with cross-scope FormButton, theme builder page, forms docs

## 0.3.0

### Minor Changes

- - ship compiled tailwind utilities in styles.css; record AC-3 agent run; document vite8 dedupe

## 0.2.1

### Patch Changes

- - react/react-dom/lucide as peer dependencies, re-export route helpers from prui/app, widen Resource mutator return types

## 0.2.0

### Minor Changes

- - eslint+prettier with CI gate, landing-budget guard (AC-6), docs-contract tests, readme
  - proposal-contract API — resource delete/cursor/options aliases, price/date/time filters, form array schema, settings typed fields, page string links/oauth
  - App auth prop with SessionTimeout flow, AuthShell, theme dark/light shorthand
  - cross-platform build — bundle-css copies theme css, node-based clean

## 0.1.1

### Patch Changes

- - declare engines.node >=18 for consumers
