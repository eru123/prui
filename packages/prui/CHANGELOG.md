# @skiddph/prui

## 0.17.0

### Minor Changes

- 9f8d69c: Popover placement system: twelve side+alignment placements with collision-aware positioning.

  `Popover` gains a `placement` prop (`"top-start"` … `"right-end"`, default `bottom-end`); the legacy `side`/`align` pair still composes into one. Placement is geometry, not fixed coordinates: the engine measures the trigger and the panel, resolves logical start/end against the writing direction (RTL flips horizontal start/end), and positions against the effective clipping boundary — the viewport intersected with every overflow-clipping ancestor of the trigger.

  Collision resolution is evaluated, not cycled: the preferred placement is used verbatim when it fits; otherwise a small shift along the secondary axis wins over flipping (a bottom-end panel near the right edge stays below the trigger and slides left); the side flips before large alignment changes (bottom-end → top-end); when nothing fits completely the placement keeping the greatest visible area wins, constrained inside the boundary. The resolved placement is exposed as `data-placement` (plus `data-side`/`data-align`) for arrow styling.

  Recomputation covers opens, scroll (any container, capture phase), window resize, and a frame-loop geometry diff that catches trigger moves and resizes, popover content size changes, and container dimension changes — with no re-render when the position hasn't moved.

  `useAnchoredPosition` accepts `placement` (same default) and returns the resolved `placement`/`align` alongside `top`/`left`/`side`; `computePlacement`, `getClippingBoundary`, and `PLACEMENTS` are exported from `prui/core` for advanced composition. Tooltip, Dropdown, Select, Combobox, and the date/time pickers keep their existing side/align behavior on the new engine.

## 0.16.8

### Patch Changes

- c46e636: Dropdown menu renders in a body portal, anchored under its trigger.

  The menu was absolutely positioned inside the trigger's wrapper, so inside overflow containers (the scrollable sidebar footer, table toolbars) it clipped and grew the container, shifting siblings instead of floating. It now portals to document.body with anchored positioning (viewport flip and clamp, measured size) above the modal layer; clicks inside the portaled menu count as inside the dropdown, and the focus-on-open effect re-runs when the portal attaches.

## 0.16.7

### Patch Changes

- 0e55efb: Avatar fallback parses to initials.

  The fallback prop rendered verbatim, so callers passing full names ("Ada Lovelace") got the whole string wrapped and clipped inside the circle. Both the fallback and alt paths now parse the first letters of the first two words ("AL"), and the frame enforces single-line layout (whitespace-nowrap, leading-none, overflow hidden) so no input can wrap or overflow.

## 0.16.6

### Patch Changes

- 524c79f: DatePicker/DateRangePicker trigger icon and popover anchoring fixed.

  - The calendar icon used a negative margin in inline flow, so at full width (schema forms, modals) it wrapped onto its own line below the input. The trigger is now a relative flex row with the icon absolutely positioned inside the field's right padding, vertically centered.
  - The popover anchor math assumed a 380px panel height (280 for time pickers): the flip test fired with room to spare, detaching calendars far above their trigger inside modals. The anchor now measures the real popover size, so it opens directly under the field and only flips when it genuinely does not fit, landing adjacent with the standard gap.

## 0.16.5

### Patch Changes

- 528beef: Calendar rows carry their seven-column grid inline.

  The weekday header and date rows relied on the grid-cols-7 utility; with a stale or partially loaded stylesheet the rows collapsed to a single stacked column. The template now also lives in an inline style, so the calendar keeps its 7-column layout regardless of which utilities resolve.

## 0.16.4

### Patch Changes

- 465a4d5: Date/time picker popovers open above modals.

  The calendar and time popovers rendered at the overlay layer (z 50), under the modal overlay (z 10000) — a DatePicker inside a Resource create/edit modal opened its calendar unclickably behind the scrim. Popovers now render just above the modal layer (toasts and confirms still stack above them).

## 0.16.3

### Patch Changes

- 8971104: Schema forms render date fields with the in-house DatePicker.

  The app-layer Form (and therefore every Resource create/edit modal with a date field, derived or explicit schema) renders DatePicker instead of a native date input — the same anchored calendar the toolbars use. Values stay "YYYY-MM-DD" strings.

## 0.16.2

### Patch Changes

- da75129: Toolbar date filters use the in-house pickers.

  The toolbar's date filter renders the DatePicker and the daterange filter renders the DateRangePicker — one "from – to" trigger opening the anchored calendar — instead of two native date inputs. Values and the Clear button are unchanged.

## 0.16.1

### Patch Changes

- a6279b6: sidebarFooter render form: adapt the sidebar footer to the rail state.

  sidebarFooter accepts a function of { collapsed } alongside a node — ({ collapsed }) => collapsed ? avatarOnly : fullRow — so pinned footer content (typically a user menu) can shrink for the 64px rail. The collapsed footer keeps centering its content.

## 0.16.0

### Minor Changes

- ec93163: The shell body caps and centers on wide viewports.

  - The content column inside the shell is now max-width 72rem (1152px), auto-centered — tables and forms stop stretching edge-to-edge on wide monitors.
  - contentMaxWidth on <App> overrides the cap per app (numbers are px, any CSS length works, false removes it); the --prui-content-max custom property overrides it globally.

## 0.15.3

### Patch Changes

- 0798ef4: Toolbar: search, filters, and actions share one aligned, responsive field grid.

  - The search input renders as a labeled FormField like every filter, and the actions cluster sits in a field with a reserved (empty) label row — so labels share one row, controls share one baseline, and the action buttons land on the controls' line instead of floating above the filters. Wrapped lines keep the same grid.
  - Responsive: helper rows never render in toolbars; below 48rem the label rows collapse and the members stack as full-width compact controls (search, filter triggers, range pairs, actions) with no horizontal overflow. Actions pin right on md+ and flow inline on phones.

## 0.15.2

### Patch Changes

- b38a7d9: Input, InputGroup, and Textarea accept an error prop.

  Validation state on the controls themselves: error renders the field border and focus ring in the danger token, pairing with FormField's error helper text. Found while building the localStorage example apps, which needed inline validation styling.

## 0.15.1

### Patch Changes

- 3b34f0c: theme={false} no longer resets the applied theme.

  The theme state hook always applied the default (control/dark) on mount, even when the switcher was disabled, clobbering a theme the consumer had applied themselves — e.g. an app calling applyTheme({ theme: "daylight" }) for a fixed light look. With theme={false} the shell now leaves theming entirely to the consumer.

## 0.15.0

### Minor Changes

- 820d4cb: The shell keeps layouts A and B only; C and D are removed.

  - layoutType is now "A" | "B". The C sidebar header row (and its sidebarHeader prop) and the D centered sticky layout are gone, along with their grid CSS — the two remaining layouts are the ones every consumer actually used, and both collapse to the icon rail on desktop and mobile.
  - Breaking: consumers passing layoutType="C"/"D" or sidebarHeader must move to A or B. The collapse toggle and brand live in the topbar for both.

## 0.14.0

### Minor Changes

- fd0123c: Baseline alignment for form controls and toolbars: the FormField slot system.

  - New FormField (prui/core): the standard three-slot layout — label on top, control, helper text below. The label and helper rows reserve their height when empty, so bare and labeled fields in one row keep the same baselines. inline drops both rows for compact toolbars; error styles the helper as a validation message.
  - Every form control (Input, Textarea, Select, TagInput, Combobox, DatePicker, DateRangePicker, TimePicker, TimeRangePicker) accepts label and helperText and wraps itself through FormField with automatic label/id association. Controls with neither render exactly as before — existing layouts are untouched. Wrap any custom control manually with FormField to reserve the slots for a bare field.
  - New InputGroup: Input with fixed leading/trailing addons (currency, units, domains) on the same slots.
  - DataTableToolbar rows align items-end gap-3, and every filter renders through FormField: one group label above the control (the faceted trigger is now a labelled, aria-named button under the label). Range filters (daterange, numberrange, price, time) place the group label above the pair with compact from/to and min/max sub-labels in the control row — a composite filter occupies the same three slots as a single field, so all toolbar controls anchor to one bottom line.

## 0.13.7

### Patch Changes

- 5261263: Shell header keeps px-4 at every width; the desktop-only px-6 step is dropped.

## 0.13.6

### Patch Changes

- 2fccf8b: Collapsed rail: leaf nav links center their icons too.

  The rail's justify-content:center rule only matched group toggle buttons; leaf items render as router links (<a>), so their icons sat 6px left of the rail's center axis. The rule now covers both, with padding-inline reset — collapsed rail icons and mono initials all center, and the expanded sidebar keeps its left-aligned rows.

## 0.13.5

### Patch Changes

- 239053d: Layout C matches its intended design: brand and toggle in the topbar, opt-in workspace row.

  - The full-width topbar carries the collapse chevron and the brand (like A and B): « [logo] Name. The sidebar header row is a workspace strip for sidebarHeader content only (e.g. a workspace switcher) — no toggle, no duplicated brand.
  - Without sidebarHeader there is no second row at all (previously it defaulted to the brand, duplicating the topbar's).
  - Collapsing to the rail hides the workspace strip entirely; the nav rail starts right under the topbar.

## 0.13.4

### Patch Changes

- 8110620: Layout C: the collapse toggle lives in the sidebar header row.

  - For C the « / » chevron renders in the sidebar header row immediately before the brand/custom sidebarHeader — the row sits in the sidebar column, right where the toggle operates — instead of floating at the top bar's far left above it. A/B keep the toggle in the header before the brand; the top bar of C now starts clean (centered search, no chevron, no brand on desktop).
  - Collapsed, the sidebar header shows only the centered expand chevron; the brand/custom content hides with the rest of the rail labels.

## 0.13.3

### Patch Changes

- ca500d1: Layout C: the sidebar header owns the brand; collapse no longer squeezes it.

  - The brand no longer renders twice in layout C. The sidebar header row is the brand's home on desktop (that row is C's signature); the top bar carries it only below md, where the sidehead is hidden. Layouts A and B are unchanged.
  - Collapsing to the icon rail hid nav labels but the sidebar header is a sibling of the sidebar, not inside it, so its brand name stayed and squeezed into the 64px rail. The sidehead label now hides on collapse like the nav labels; the top bar's toggle stays put (the full-width topbar never shrinks).

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
