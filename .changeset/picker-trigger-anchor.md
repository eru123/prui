---
"@skiddph/prui": patch
---

DatePicker/DateRangePicker trigger icon and popover anchoring fixed.

- The calendar icon used a negative margin in inline flow, so at full width (schema forms, modals) it wrapped onto its own line below the input. The trigger is now a relative flex row with the icon absolutely positioned inside the field's right padding, vertically centered.
- The popover anchor math assumed a 380px panel height (280 for time pickers): the flip test fired with room to spare, detaching calendars far above their trigger inside modals. The anchor now measures the real popover size, so it opens directly under the field and only flips when it genuinely does not fit, landing adjacent with the standard gap.
