# @skiddph/prui

## 0.10.0

### Minor Changes

- 5c4a205: Input icons, textarea padding fix, and searchable/multiple Select.

  - Input gains icon and trailingIcon slots; horizontal padding adjusts automatically and icon-less inputs render exactly as before.
  - Textarea gets its missing horizontal padding (px-3) to match Input gutters.
  - Select gains searchable (an in-listbox filter input — typing narrows options, Enter picks the first match, ArrowDown moves into the list) and multiple (items toggle without closing; value/onChange become string[]; the trigger shows the first label plus a +N count). Both compose with each other and with the options prop or compound items.

## 0.9.1

### Patch Changes

- - clear shake and toast timers on teardown

## 0.9.0

### Minor Changes

- fd05e49: UI fixes, time pickers, and per-component docs.

  - Select and Combobox listboxes portal to the body and anchor under their triggers (no more displacement/clipping by arbitrary ancestors); Combobox closes on outside clicks.
  - DatePicker and DateRangePicker dismiss on outside clicks; the range picker's month navigation stays free after anchoring.
  - New TimePicker and TimeRangePicker ("HH:mm" / "HH:mm:ss", minute steps, min/max bounds) plus the exported TimePanel for composition.
  - DatePicker and DateRangePicker gain `timepicker` (default false) composing the time panel into "YYYY-MM-DD HH:mm" values; DateRangePicker gains `maxRange` ("3m", "90d", "12w", "1y", or day counts) which disables out-of-span days and clamps beyond-cap picks.
  - Dialog gains DialogBody for consistent content padding.
  - Docs: one page per component (22 new pages) with full accessibility, composition, customization, edge-case, and migration sections; Modal demos fixed.

## 0.8.0

### Minor Changes

- 30ce122: Enterprise readiness pass: shared overlay infrastructure, keyboard-complete overlays, semantic tokens, controlled Resource state, 20 new components, i18n + RTL, and an axe/Playwright testing layer.

  - **Accessibility**: every overlay (Modal, Dialog, Drawer, Sheet, CommandPalette, Popover, Tooltip, mobile drawer, confirmModal) is portaled, focus-trapped with focus restoration, and only the topmost overlay answers Escape; backgrounds are aria-hidden + inert. Menus/listboxes/tabs/calendar/tree gained arrows, Home/End, PageUp/PageDown and typeahead. `prefers-reduced-motion` disables shake/scale/fade/slide.
  - **Tokens**: semantic z-index (`--prui-z-*`), motion durations/easings, typography scale, spacing, opacity, light-mode-aware shadows, and `PRUI_BREAKPOINTS`/`PRUI_DESIGN_TOKENS` JS mirrors.
  - **Resource**: controlled/uncontrolled state (`state`/`defaultState`/`onStateChange`) with granular callbacks, row selection, expandable rows, debounced search, virtualization option.
  - **New components**: Toast/Toaster, Alert, Tooltip, Popover, Checkbox, RadioGroup, Combobox, Skeleton, Spinner, Progress, Accordion, Breadcrumb, Drawer, Sheet, FileUpload, Calendar, DatePicker, DateRangePicker, TreeView, Timeline.
  - **API**: Button/Badge adopt the shared variant vocabulary (secondary/neutral/success/warning added; old names alias). The registry-driven Form on `@skiddph/prui/forms` is deprecated in favor of the schema Form from `@skiddph/prui/app` (both keep working).
  - **i18n/RTL**: dictionary + `PruiProvider`; logical properties in the shell.
  - **Testing**: axe suite (vitest) and Playwright smoke/axe/visual specs; per-component a11y/keyboard/focus tests.
  - **DX**: `prui-cli` (create-prui-app, add, generate theme/resource/page/layout/crud).

## 0.7.0

### Minor Changes

- - collapsed-rail nav groups open a flyout menu instead of expanding inline

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
