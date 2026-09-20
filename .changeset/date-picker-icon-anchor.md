---
"@skiddph/prui": patch
---

Date picker trigger icon stays inside the input when a width class is passed.

DatePicker and DateRangePicker applied the caller's className to the input only, while the wrapper the trigger icon anchors to kept w-full. Filters passing a width (DateRangeFilter's h-8 w-64, DateFilter's h-8 w-36) therefore rendered the calendar icon at the wrapper's far edge — in a wide column, hundreds of pixels away from the input. The className now merges onto the wrapper too, so the icon's positioning context always matches the input's box.
