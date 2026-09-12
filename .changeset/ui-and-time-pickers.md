---
"@skiddph/prui": minor
---

UI fixes, time pickers, and per-component docs.

- Select and Combobox listboxes portal to the body and anchor under their triggers (no more displacement/clipping by arbitrary ancestors); Combobox closes on outside clicks.
- DatePicker and DateRangePicker dismiss on outside clicks; the range picker's month navigation stays free after anchoring.
- New TimePicker and TimeRangePicker ("HH:mm" / "HH:mm:ss", minute steps, min/max bounds) plus the exported TimePanel for composition.
- DatePicker and DateRangePicker gain `timepicker` (default false) composing the time panel into "YYYY-MM-DD HH:mm" values; DateRangePicker gains `maxRange` ("3m", "90d", "12w", "1y", or day counts) which disables out-of-span days and clamps beyond-cap picks.
- Dialog gains DialogBody for consistent content padding.
- Docs: one page per component (22 new pages) with full accessibility, composition, customization, edge-case, and migration sections; Modal demos fixed.
