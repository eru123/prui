---
"@skiddph/prui": minor
---

Sidebar animations.

- The mobile navigation drawer slides in from the left with its scrim fading in, and slides back out before unmounting (both --prui-duration-slow). prefers-reduced-motion skips both directions.
- Collapsing to the icon rail now eases the sidebar width over --prui-duration-base instead of snapping — on the desktop shell and the mobile persistent rail.
- New useMountTransition hook (prui/core) drives mount/exit animation lifecycles; Drawer and Sheet use it too, which also fixes their enter slide sometimes not playing: a single rAF can merge into the first paint under discrete-event flushes, so the hook waits a second frame to let the "from" transform paint first.
