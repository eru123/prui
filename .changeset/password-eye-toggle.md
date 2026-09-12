---
"@skiddph/prui": minor
---

Password eye toggle on Input.

- Input with type="password" now renders a show/hide eye button in the trailing slot by default: aria-labelled (showPassword/hidePassword dictionary keys, so it localizes) and aria-pressed, disabled with the field, and mousedown is prevented so toggling never steals the caret from the input.
- passwordToggle={false} keeps a plain masked field; passing a custom trailingIcon takes over the slot and suppresses the eye. Leading icon and sizes compose as usual.
- The pre-made pages (register, reset-password, profile settings) get the toggle automatically.
