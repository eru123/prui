---
"@skiddph/prui": minor
---

The shell body caps and centers on wide viewports.

- The content column inside the shell is now max-width 72rem (1152px), auto-centered — tables and forms stop stretching edge-to-edge on wide monitors.
- contentMaxWidth on <App> overrides the cap per app (numbers are px, any CSS length works, false removes it); the --prui-content-max custom property overrides it globally.
