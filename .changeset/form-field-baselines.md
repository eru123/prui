---
"@skiddph/prui": minor
---

Baseline alignment for form controls and toolbars: the FormField slot system.

- New FormField (prui/core): the standard three-slot layout — label on top, control, helper text below. The label and helper rows reserve their height when empty, so bare and labeled fields in one row keep the same baselines. inline drops both rows for compact toolbars; error styles the helper as a validation message.
- Every form control (Input, Textarea, Select, TagInput, Combobox, DatePicker, DateRangePicker, TimePicker, TimeRangePicker) accepts label and helperText and wraps itself through FormField with automatic label/id association. Controls with neither render exactly as before — existing layouts are untouched. Wrap any custom control manually with FormField to reserve the slots for a bare field.
- New InputGroup: Input with fixed leading/trailing addons (currency, units, domains) on the same slots.
- DataTableToolbar rows align items-end gap-3, and every filter renders through FormField: one group label above the control (the faceted trigger is now a labelled, aria-named button under the label). Range filters (daterange, numberrange, price, time) place the group label above the pair with compact from/to and min/max sub-labels in the control row — a composite filter occupies the same three slots as a single field, so all toolbar controls anchor to one bottom line.
