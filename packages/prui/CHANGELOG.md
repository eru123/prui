# @skiddph/prui

## 0.13.2

### Patch Changes

- 8a063d8: Sidebar collapse toggle moved to the header, before the brand.

  - On desktop the rail collapse « / » chevron now lives in the header bar immediately before the brand mark (GitLab-style) instead of a bordered row at the sidebar's bottom. Works across layouts A/B/C; D keeps no toggle.
  - Mobile is unchanged: the toggle stays hidden below md, where the drawer hamburger owns navigation. The sidebar's old bottom border row is gone entirely.

## 0.13.1

### Patch Changes

- 135a3f1: TagInput: separator commits also fire from the input value.

  Keydown never happens for IME and virtual keyboards (phones, autofill, some layouts) — the separator arrived through the input event and the tag did not render until Enter or blur. The field now commits whenever the value itself contains a separator, so the chip appears the moment the operator is typed on any keyboard. This also makes multi-character separators (e.g. " and ") work. Keydown-prevented commits never reach the value, so the two paths cannot double-fire.

## 0.13.0

### Minor Changes

- d6b9f8a: TagInput: comma-separated entry as removable chips.

  - Text commits on a separator character (default comma, configurable via separators), Enter, a multi-value paste, or blur; Backspace on an empty field removes the last tag. Controlled with string[] value/onChange like the multiple Select, with the same sizes, variants, and surface props as Input.
  - The chip and the value are separate, programmable concerns: labelFor maps a value to its chip display (show only the name for "Name <email>") while onChange keeps emitting the original strings; renderTag takes over the chip entirely with a remove() api; parseInput rebuilds tag values from raw text (e.g. "Name, email" pairs committed as "Name <email>").
  - validate rejects candidates and leaves them editable in the field; duplicates discard silently (allowDuplicates to keep them); maxTags caps the count with overflow staying editable. Chip remove buttons announce the full original value through the new removeTag dictionary key ("Remove {label}").

## 0.12.0

### Minor Changes

- a928a1b: Password eye toggle on Input.

  - Input with type="password" now renders a show/hide eye button in the trailing slot by default: aria-labelled (showPassword/hidePassword dictionary keys, so it localizes) and aria-pressed, disabled with the field, and mousedown is prevented so toggling never steals the caret from the input.
  - passwordToggle={false} keeps a plain masked field; passing a custom trailingIcon takes over the slot and suppresses the eye. Leading icon and sizes compose as usual.
  - The pre-made pages (register, reset-password, profile settings) get the toggle automatically.

## 0.11.0

### Minor Changes

- 3adf19c: Sidebar animations.

  - The mobile navigation drawer slides in from the left with its scrim fading in, and slides back out before unmounting (both --prui-duration-slow). prefers-reduced-motion skips both directions.
  - Collapsing to the icon rail now eases the sidebar width over --prui-duration-base instead of snapping — on the desktop shell and the mobile persistent rail.
  - New useMountTransition hook (prui/core) drives mount/exit animation lifecycles; Drawer and Sheet use it too, which also fixes their enter slide sometimes not playing: a single rAF can merge into the first paint under discrete-event flushes, so the hook waits a second frame to let the "from" transform paint first.

## 0.10.2

### Patch Changes

- ed60228: Brand in the mobile drawer header.

  - The mobile navigation drawer's header showed the close button alone; when a brand is configured it now renders beside it (brand left, close right). Tapping the brand still follows its href and closes the drawer.
  - With no brand configured the drawer header keeps the close button aligned right, unchanged.

## 0.10.1

### Patch Changes

- 935a46e: Mobile shell header fix: stray rail chevron and wrapped theme toggle.

  - The header's mobile-only "Collapse sidebar" chevron was a no-op on mobile (the sidebar is a drawer there and the drawer ignores rail state); worse, as an extra grid child it pushed the brand off-center and wrapped the theme toggle onto a second row below the header, overlapping content. Removed it: the mobile header is now a single row of hamburger, brand, and actions.
  - Rail collapse stays available on desktop via the sidebar footer toggle; the mobile drawer keeps its own navigation.

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
