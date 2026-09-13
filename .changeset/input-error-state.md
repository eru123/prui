---
"@skiddph/prui": patch
---

Input, InputGroup, and Textarea accept an error prop.

Validation state on the controls themselves: error renders the field border and focus ring in the danger token, pairing with FormField's error helper text. Found while building the localStorage example apps, which needed inline validation styling.
