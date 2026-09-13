---
"@skiddph/prui": patch
---

Dropdown menu renders in a body portal, anchored under its trigger.

The menu was absolutely positioned inside the trigger's wrapper, so inside overflow containers (the scrollable sidebar footer, table toolbars) it clipped and grew the container, shifting siblings instead of floating. It now portals to document.body with anchored positioning (viewport flip and clamp, measured size) above the modal layer; clicks inside the portaled menu count as inside the dropdown, and the focus-on-open effect re-runs when the portal attaches.
