---
"@skiddph/prui": patch
---

Schema forms render date fields with the in-house DatePicker.

The app-layer Form (and therefore every Resource create/edit modal with a date field, derived or explicit schema) renders DatePicker instead of a native date input — the same anchored calendar the toolbars use. Values stay "YYYY-MM-DD" strings.
