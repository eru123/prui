---
"@skiddph/prui": patch
---

Mobile shell header fix: stray rail chevron and wrapped theme toggle.

- The header's mobile-only "Collapse sidebar" chevron was a no-op on mobile (the sidebar is a drawer there and the drawer ignores rail state); worse, as an extra grid child it pushed the brand off-center and wrapped the theme toggle onto a second row below the header, overlapping content. Removed it: the mobile header is now a single row of hamburger, brand, and actions.
- Rail collapse stays available on desktop via the sidebar footer toggle; the mobile drawer keeps its own navigation.
