---
"@skiddph/prui": minor
---

The shell keeps layouts A and B only; C and D are removed.

- layoutType is now "A" | "B". The C sidebar header row (and its sidebarHeader prop) and the D centered sticky layout are gone, along with their grid CSS — the two remaining layouts are the ones every consumer actually used, and both collapse to the icon rail on desktop and mobile.
- Breaking: consumers passing layoutType="C"/"D" or sidebarHeader must move to A or B. The collapse toggle and brand live in the topbar for both.
