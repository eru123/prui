---
"@skiddph/prui": patch
---

Sidebar collapse toggle moved to the header, before the brand.

- On desktop the rail collapse « / » chevron now lives in the header bar immediately before the brand mark (GitLab-style) instead of a bordered row at the sidebar's bottom. Works across layouts A/B/C; D keeps no toggle.
- Mobile is unchanged: the toggle stays hidden below md, where the drawer hamburger owns navigation. The sidebar's old bottom border row is gone entirely.
