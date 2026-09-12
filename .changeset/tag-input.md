---
"@skiddph/prui": minor
---

TagInput: comma-separated entry as removable chips.

- Text commits on a separator character (default comma, configurable via separators), Enter, a multi-value paste, or blur; Backspace on an empty field removes the last tag. Controlled with string[] value/onChange like the multiple Select, with the same sizes, variants, and surface props as Input.
- The chip and the value are separate, programmable concerns: labelFor maps a value to its chip display (show only the name for "Name <email>") while onChange keeps emitting the original strings; renderTag takes over the chip entirely with a remove() api; parseInput rebuilds tag values from raw text (e.g. "Name, email" pairs committed as "Name <email>").
- validate rejects candidates and leaves them editable in the field; duplicates discard silently (allowDuplicates to keep them); maxTags caps the count with overflow staying editable. Chip remove buttons announce the full original value through the new removeTag dictionary key ("Remove {label}").
