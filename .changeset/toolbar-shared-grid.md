---
"@skiddph/prui": patch
---

Toolbar: search, filters, and actions share one aligned, responsive field grid.

- The search input renders as a labeled FormField like every filter, and the actions cluster sits in a field with a reserved (empty) label row — so labels share one row, controls share one baseline, and the action buttons land on the controls' line instead of floating above the filters. Wrapped lines keep the same grid.
- Responsive: helper rows never render in toolbars; below 48rem the label rows collapse and the members stack as full-width compact controls (search, filter triggers, range pairs, actions) with no horizontal overflow. Actions pin right on md+ and flow inline on phones.
