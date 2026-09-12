---
"@skiddph/prui": patch
---

Layout C: the collapse toggle lives in the sidebar header row.

- For C the « / » chevron renders in the sidebar header row immediately before the brand/custom sidebarHeader — the row sits in the sidebar column, right where the toggle operates — instead of floating at the top bar's far left above it. A/B keep the toggle in the header before the brand; the top bar of C now starts clean (centered search, no chevron, no brand on desktop).
- Collapsed, the sidebar header shows only the centered expand chevron; the brand/custom content hides with the rest of the rail labels.
