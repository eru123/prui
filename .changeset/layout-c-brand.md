---
"@skiddph/prui": patch
---

Layout C: the sidebar header owns the brand; collapse no longer squeezes it.

- The brand no longer renders twice in layout C. The sidebar header row is the brand's home on desktop (that row is C's signature); the top bar carries it only below md, where the sidehead is hidden. Layouts A and B are unchanged.
- Collapsing to the icon rail hid nav labels but the sidebar header is a sibling of the sidebar, not inside it, so its brand name stayed and squeezed into the 64px rail. The sidehead label now hides on collapse like the nav labels; the top bar's toggle stays put (the full-width topbar never shrinks).
