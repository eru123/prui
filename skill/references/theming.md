# Theming: tokens, named themes, and brand customization

Import theme utilities from `prui/theme`:

```tsx
import { applyTheme, themes } from 'prui/theme'
import 'prui/theme/tokens.css'
```

`prui/theme` ships the token CSS, the named themes, and `applyTheme()`.

## How tokens work

Every PRUI component reads from CSS variables (custom properties) on `:root`. A token is an HSL triplet without the `hsl()` wrapper, for example `--background: 0 0% 100%`. Overriding a token is plain CSS; you never edit prui source.

## Token override file template

Create `src/theme.css`, import it once in `main.tsx`, and override only the tokens you care about:

```css
/* src/theme.css - brand overrides. Load AFTER prui token css. */
:root {
  /* Brand: HRLabs green */
  --primary: 160 84% 30%;
  --primary-foreground: 0 0% 100%;

  /* Shape */
  --radius: 0.5rem;

  /* Surfaces (light) */
  --background: 0 0% 98%;
  --card: 0 0% 100%;
}

.dark {
  /* Surfaces (dark) */
  --background: 160 20% 7%;
  --card: 160 18% 10%;
}
```

```tsx
// src/main.tsx
import 'prui/theme/tokens.css'
import './theme.css'   // after, so overrides win the cascade
```

One CSS file, no prui source edits: that is the whole override mechanism.

## Core token list

| Token | Controls |
|---|---|
| `--background` | App background |
| `--foreground` | Default text |
| `--card` / `--card-foreground` | Card and panel surfaces |
| `--primary` / `--primary-foreground` | Primary buttons, active nav, focus accents |
| `--secondary` / `--muted` | Secondary surfaces |
| `--accent` | Hover and highlight fills |
| `--destructive` | Destructive actions, delete confirmation |
| `--border` / `--input` | Borders and input outlines |
| `--ring` | Focus rings |
| `--radius` | Corner radius across all components |

Each has a `-foreground` companion where a surface needs its own text color. Light values live on `:root`; dark values on the `.dark` class (PRUI toggles `.dark` on `<html>` when switching).

## Named themes

PRUI ships a set of named themes (the multi-theme mechanism generalized from t4xlabs). Each named theme is a token map:

```ts
import { themes } from 'prui/theme'

Object.keys(themes)   // available named themes
```

## `applyTheme()`

Apply a named theme or a custom token map at runtime:

```tsx
import { applyTheme, themes } from 'prui/theme'

applyTheme(themes.ocean)                        // named theme
applyTheme({ primary: '160 84% 30%' })          // partial token overrides merged onto current
applyTheme({ mode: 'dark', primary: '220 90% 60%' })
```

Switching light/dark via the `<App>` header toggle calls this internally; `theme={{ persist: true }}` on `<App>` saves the choice to localStorage and restores it on load.

## Brand customization recipe

To brand an app end to end:

1. Pick the brand hue and saturation; set `--primary` and a contrasting `--primary-foreground` in `src/theme.css`.
2. Derive dark surfaces from the same hue (low saturation, 5-10% lightness) rather than reusing gray.
3. Set `--radius` once (0.5rem is the PRUI default feel; 0.25rem reads tighter, 0.75rem softer).
4. Pass `brand={{ name, mark }}` to `<App>` for the name and logo.
5. Check both modes: header toggle or `applyTheme({ mode: 'dark' })`.

## Rules

- Override in your own CSS file, never by editing prui source or copying prui CSS into your app.
- Keep the HSL-triplet format (`H S% L%`, no `hsl()` wrapper); components compose the variables.
- Apps keep their own tailwind config; PRUI tokens coexist with it (see [adoption.md](adoption.md)).
