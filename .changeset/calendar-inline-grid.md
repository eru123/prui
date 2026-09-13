---
"@skiddph/prui": patch
---

Calendar rows carry their seven-column grid inline.

The weekday header and date rows relied on the grid-cols-7 utility; with a stale or partially loaded stylesheet the rows collapsed to a single stacked column. The template now also lives in an inline style, so the calendar keeps its 7-column layout regardless of which utilities resolve.
