---
"@skiddph/prui": patch
---

Layout C matches its intended design: brand and toggle in the topbar, opt-in workspace row.

- The full-width topbar carries the collapse chevron and the brand (like A and B): « [logo] Name. The sidebar header row is a workspace strip for sidebarHeader content only (e.g. a workspace switcher) — no toggle, no duplicated brand.
- Without sidebarHeader there is no second row at all (previously it defaulted to the brand, duplicating the topbar's).
- Collapsing to the rail hides the workspace strip entirely; the nav rail starts right under the topbar.
