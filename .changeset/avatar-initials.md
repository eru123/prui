---
"@skiddph/prui": patch
---

Avatar fallback parses to initials.

The fallback prop rendered verbatim, so callers passing full names ("Ada Lovelace") got the whole string wrapped and clipped inside the circle. Both the fallback and alt paths now parse the first letters of the first two words ("AL"), and the frame enforces single-line layout (whitespace-nowrap, leading-none, overflow hidden) so no input can wrap or overflow.
