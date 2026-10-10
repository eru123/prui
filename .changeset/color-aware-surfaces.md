---
"@skiddph/prui": minor
---

Color-aware surfaces: fills now pair with readable text automatically.

- New `--prui-on-fill` theme token (text on success/warning/danger fills); was hardcoded white, which failed WCAG AA in the dark themes where status colors are light. All four themes ship a paired ink.
- `ember` and `workshop` brand fills now use a dark ink (`--prui-brand-fg`), matching `control` — white text on their light accents was below AA.
- `daylight` `ok`/`warn` move one step darker so white text clears AA on fills (also improves `text-ok`/`text-warn` on light backgrounds).
- Passing a solid `bg` surface prop without `fg` auto-picks a readable ink (`readableInk()`, exported) via WCAG relative luminance — hex, `rgb()`, `hsl()`, and basic named colors; `var()`/gradients keep the theme default unless you pass `fg` too.
- The real-browser axe suite now fails on `color-contrast` (AA) violations instead of letting them through.
