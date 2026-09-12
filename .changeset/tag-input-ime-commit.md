---
"@skiddph/prui": patch
---

TagInput: separator commits also fire from the input value.

Keydown never happens for IME and virtual keyboards (phones, autofill, some layouts) — the separator arrived through the input event and the tag did not render until Enter or blur. The field now commits whenever the value itself contains a separator, so the chip appears the moment the operator is typed on any keyboard. This also makes multi-character separators (e.g. " and ") work. Keydown-prevented commits never reach the value, so the two paths cannot double-fire.
