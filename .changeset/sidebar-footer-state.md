---
"@skiddph/prui": patch
---

sidebarFooter render form: adapt the sidebar footer to the rail state.

sidebarFooter accepts a function of { collapsed } alongside a node — ({ collapsed }) => collapsed ? avatarOnly : fullRow — so pinned footer content (typically a user menu) can shrink for the 64px rail. The collapsed footer keeps centering its content.
