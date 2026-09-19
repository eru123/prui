---
"@skiddph/prui": minor
---

Popover placement system: twelve side+alignment placements with collision-aware positioning.

`Popover` gains a `placement` prop (`"top-start"` … `"right-end"`, default `bottom-end`); the legacy `side`/`align` pair still composes into one. Placement is geometry, not fixed coordinates: the engine measures the trigger and the panel, resolves logical start/end against the writing direction (RTL flips horizontal start/end), and positions against the effective clipping boundary — the viewport intersected with every overflow-clipping ancestor of the trigger.

Collision resolution is evaluated, not cycled: the preferred placement is used verbatim when it fits; otherwise a small shift along the secondary axis wins over flipping (a bottom-end panel near the right edge stays below the trigger and slides left); the side flips before large alignment changes (bottom-end → top-end); when nothing fits completely the placement keeping the greatest visible area wins, constrained inside the boundary. The resolved placement is exposed as `data-placement` (plus `data-side`/`data-align`) for arrow styling.

Recomputation covers opens, scroll (any container, capture phase), window resize, and a frame-loop geometry diff that catches trigger moves and resizes, popover content size changes, and container dimension changes — with no re-render when the position hasn't moved.

`useAnchoredPosition` accepts `placement` (same default) and returns the resolved `placement`/`align` alongside `top`/`left`/`side`; `computePlacement`, `getClippingBoundary`, and `PLACEMENTS` are exported from `prui/core` for advanced composition. Tooltip, Dropdown, Select, Combobox, and the date/time pickers keep their existing side/align behavior on the new engine.
