---
"@skiddph/prui": minor
---

Input icons, textarea padding fix, and searchable/multiple Select.

- Input gains icon and trailingIcon slots; horizontal padding adjusts automatically and icon-less inputs render exactly as before.
- Textarea gets its missing horizontal padding (px-3) to match Input gutters.
- Select gains searchable (an in-listbox filter input — typing narrows options, Enter picks the first match, ArrowDown moves into the list) and multiple (items toggle without closing; value/onChange become string[]; the trigger shows the first label plus a +N count). Both compose with each other and with the options prop or compound items.
