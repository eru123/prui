---
"@skiddph/prui": minor
---

Enterprise readiness pass: shared overlay infrastructure, keyboard-complete overlays, semantic tokens, controlled Resource state, 20 new components, i18n + RTL, and an axe/Playwright testing layer.

- **Accessibility**: every overlay (Modal, Dialog, Drawer, Sheet, CommandPalette, Popover, Tooltip, mobile drawer, confirmModal) is portaled, focus-trapped with focus restoration, and only the topmost overlay answers Escape; backgrounds are aria-hidden + inert. Menus/listboxes/tabs/calendar/tree gained arrows, Home/End, PageUp/PageDown and typeahead. `prefers-reduced-motion` disables shake/scale/fade/slide.
- **Tokens**: semantic z-index (`--prui-z-*`), motion durations/easings, typography scale, spacing, opacity, light-mode-aware shadows, and `PRUI_BREAKPOINTS`/`PRUI_DESIGN_TOKENS` JS mirrors.
- **Resource**: controlled/uncontrolled state (`state`/`defaultState`/`onStateChange`) with granular callbacks, row selection, expandable rows, debounced search, virtualization option.
- **New components**: Toast/Toaster, Alert, Tooltip, Popover, Checkbox, RadioGroup, Combobox, Skeleton, Spinner, Progress, Accordion, Breadcrumb, Drawer, Sheet, FileUpload, Calendar, DatePicker, DateRangePicker, TreeView, Timeline.
- **API**: Button/Badge adopt the shared variant vocabulary (secondary/neutral/success/warning added; old names alias). The registry-driven Form on `@skiddph/prui/forms` is deprecated in favor of the schema Form from `@skiddph/prui/app` (both keep working).
- **i18n/RTL**: dictionary + `PruiProvider`; logical properties in the shell.
- **Testing**: axe suite (vitest) and Playwright smoke/axe/visual specs; per-component a11y/keyboard/focus tests.
- **DX**: `prui-cli` (create-prui-app, add, generate theme/resource/page/layout/crud) and StackBlitz/CodeSandbox links on docs examples.
