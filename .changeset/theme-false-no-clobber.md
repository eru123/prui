---
"@skiddph/prui": patch
---

theme={false} no longer resets the applied theme.

The theme state hook always applied the default (control/dark) on mount, even when the switcher was disabled, clobbering a theme the consumer had applied themselves — e.g. an app calling applyTheme({ theme: "daylight" }) for a fixed light look. With theme={false} the shell now leaves theming entirely to the consumer.
