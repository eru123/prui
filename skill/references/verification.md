# Verification: the done-checklist

Run every item before declaring a PRUI app done. Each item is checkable in a browser in under a minute. If any item fails, fix it before reporting completion; do not report "done modulo theming".

## 1. Responsive drawer works

- At a mobile viewport (390px), the sidebar is hidden and a menu button opens the drawer.
- The drawer has a backdrop; clicking the backdrop closes it.
- While the drawer is open, the body does not scroll (scroll lock).
- At desktop width, the sidebar is inline; `sidebar={{ collapsible: false }}` hides the mobile menu button entirely.

## 2. Keyboard navigation works

- Every interactive element (nav items, buttons, inputs, table actions, pagination) is reachable with Tab alone, in a sensible order.
- The command palette opens on its hotkey (`search={{ hotkey: '/' }}`) and closes on Escape.
- Modals (create/edit, delete confirm) trap focus while open and return it on close.

## 3. Focus is visible

- Tabbing shows a visible focus ring on every focusable element, in both light and dark mode.
- No element relies on `outline: none` without a replacement `focus-visible` ring.

## 4. Empty, error, and loading states are present

For each `<Resource>`:

- **Loading**: first page fetch shows a loading state (skeleton or spinner), not a blank table.
- **Empty**: a query returning zero rows shows an empty state with guidance, not a bare table.
- **Error**: a rejected `list` promise shows an error state with a retry, not a crash or silence.
- Filters that match nothing land in the empty state, and clearing filters recovers.

## 5. Theme persists

- Toggle light/dark from the header; the choice survives a page reload (`theme={{ persist: true }}`).
- The restored mode matches what was selected (no flash of wrong theme on load).
- Token overrides (`src/theme.css`) apply in both modes.

## 6. Generated routes match nav config

- Every `href` in the `nav` config renders a page (no dead links, no blank outlet).
- Active-route highlight follows navigation exactly (leaf items and items inside groups).
- If `pages="auth"` (or a `pages` config) is set, each generated auth route renders its page, and utility pages (404, error) respond on bad paths.
- Conversely, no `<Route>` exists without a way to reach it, unless intentionally hidden.

## 7. Page-level checks (when pre-made pages are used)

- Every `fields` toggle shows/hides the right input (`true` shows, `false` hides).
- Every `links` target resolves to a real route; `false` hides the link.
- `oauth` buttons appear only when the prop is set.
- Submitting a form with invalid input shows validation messages; a rejecting `onSubmit` surfaces the error.

## 8. Cross-viewport sanity

- 390px and 1440px: no horizontal scroll, header and content fit, tables degrade gracefully (check the widest `<Resource>`).

## Passing bar

All sections pass, or every failure is explicitly reported with a reason. The end-to-end scaffold procedure ([agents-workflow.md](agents-workflow.md)) ends with this checklist; treat it as part of the build, not an optional extra.
