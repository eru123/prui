# Theming: tokens, named themes, and brand customization

Import theme utilities from `@skiddph/prui/theme`:

```tsx
import { applyTheme, PRUI_THEMES } from '@skiddph/prui/theme'
import '@skiddph/prui/styles.css'
```

`@skiddph/prui/styles.css` ships all tokens and every named theme in one file. Individual themes are also available as `@skiddph/prui/theme/control.css`, `workshop.css`, `ember.css`, `daylight.css`.

## How tokens work

Every PRUI component reads CSS variables (custom properties) set by a theme class on the root element (`prui-root prui-theme-control prui-mode-dark`). Overriding a token is plain CSS; you never edit prui source. Components only ever reference the variables, so a single override file re-skins everything.

## Token override file template

Create `src/theme.css`, import it once after `styles.css`, and override only the tokens you care about:

```css
/* src/theme.css - brand overrides. Load AFTER @skiddph/prui/styles.css. */
.prui-root {
  /* Brand accent (primary buttons, active nav, focus rings) */
  --prui-brand: #16a34a;
  --prui-brand-fg: #ffffff;

  /* Shape: base radius and its scale */
  --prui-radius: 8px;
  --prui-radius-1: 4px;
  --prui-radius-2: 8px;
  --prui-radius-3: 12px;

  /* Surfaces */
  --prui-background: #fafafa;
  --prui-surface: #ffffff;
  --prui-raise: #f1f1f2;
  --prui-line: #dcdcde;

  /* Text */
  --prui-fg: #18181b;
  --prui-dim: #6b6b74;
}
```

```tsx
// src/main.tsx
import '@skiddph/prui/styles.css'
import './theme.css' // after, so overrides win the cascade
```

One CSS file, no prui source edits: that is the whole override mechanism (AC-5).

## Core token list

| Token | Controls |
|---|---|
| `--prui-background` | App background |
| `--prui-surface` | Cards, sidebar, header |
| `--prui-raise` | Hover fills, wells |
| `--prui-line` | Borders and dividers |
| `--prui-fg` | Primary text |
| `--prui-dim` | Secondary text |
| `--prui-brand` / `--prui-brand-fg` | Primary buttons, active nav, focus accents |
| `--prui-ok` | Success states |
| `--prui-warn` | Warning states |
| `--prui-danger` | Destructive actions, delete confirmation |
| `--prui-radius` (+ `-1`, `-2`, `-3`, `-full`) | Corner radius scale |

Named themes re-declare these variables under their theme class; overrides under `.prui-root` (or any scope) win by cascade order.

## Named themes

PRUI ships four named themes — the multi-theme mechanism generalized from t4xlabs:

| Theme | Look |
|---|---|
| `control` | Pure black, periwinkle accent (default, dark) |
| `workshop` | Dark warm neutral, amber accent |
| `ember` | Deep red-black, ember accent |
| `daylight` | Light theme, indigo accent |

```ts
import { PRUI_THEMES } from '@skiddph/prui/theme'

PRUI_THEMES // ['control', 'workshop', 'ember', 'daylight']
```

## `applyTheme()`

Apply a named theme at runtime; it sets the theme classes on the target element and persists the choice:

```ts
applyTheme({ theme: 'workshop' })              // sets classes + persists to localStorage
applyTheme({ theme: 'daylight' })              // the light theme
applyTheme({ theme: 'dark', persist: false })  // 'dark'/'light' shorthand, no persistence
applyTheme({ theme: 'ember', target: myElement, storageKey: null }) // scoped, no persistence
```

`<App theme={{ default: 'ember', persist: true }}>` does all of this for you and renders the header theme switch; `readPersistedTheme()` restores the choice without a flash on load.

## Brand customization recipe

1. Set `--prui-brand` and a contrasting `--prui-brand-fg` in `src/theme.css`.
2. Derive dark surfaces from the same hue rather than reusing gray.
3. Set `--prui-radius` once (6px is the PRUI default feel; 3px reads tighter, 10px softer).
4. Pass `brand={{ name, mark }}` to `<App>` for the name and logo.
5. Check both modes: header toggle or `applyTheme({ theme: 'daylight' })`.

## Rules

- Override in your own CSS file, never by editing prui source or copying prui CSS into your app.
- Components reference raw color values, so overrides are plain CSS colors.
- Apps keep their own tailwind config; PRUI tokens coexist with it (see [adoption.md](adoption.md)).
