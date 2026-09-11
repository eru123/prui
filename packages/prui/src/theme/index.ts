/**
 * PRUI theme system.
 * Tokens are CSS variables set by the named theme classes in this package.
 * applyTheme() sets the theme class plus data-mode on the target element.
 */

export const PRUI_THEMES = ["control", "workshop", "ember", "daylight"] as const

export type ThemeName = (typeof PRUI_THEMES)[number]

export type ThemeMode = "light" | "dark"

const DARK_THEMES: readonly ThemeName[] = ["control", "workshop", "ember"]
const LIGHT_THEMES: readonly ThemeName[] = ["daylight"]

export function isDarkTheme(name: ThemeName): boolean {
  return DARK_THEMES.includes(name)
}

export function isLightTheme(name: ThemeName): boolean {
  return LIGHT_THEMES.includes(name)
}

export function themeMode(name: ThemeName): ThemeMode {
  return isDarkTheme(name) ? "dark" : "light"
}

export interface ApplyThemeOptions {
  /** Theme name, defaults to control. */
  theme?: ThemeName
  /** Force a mode; omit to use the theme's natural mode. */
  mode?: ThemeMode
  /** Element to class, defaults to document.documentElement. */
  target?: HTMLElement | null
  /** Persistence key; set null to disable persistence. Defaults to prui:theme. */
  storageKey?: string | null
}

export interface AppliedTheme {
  theme: ThemeName
  mode: ThemeMode
}

const THEME_CLASS_PREFIX = "prui-theme-"

function classesFor(theme: ThemeName, mode: ThemeMode): string[] {
  return [`${THEME_CLASS_PREFIX}${theme}`, `prui-root`, `prui-mode-${mode}`]
}

/** Remove any existing prui theme classes from the target. */
function clearThemeClasses(el: HTMLElement): void {
  const drop = [...el.classList].filter(
    (c) => c.startsWith(THEME_CLASS_PREFIX) || c === "prui-root" || (c.startsWith("prui-mode-")),
  )
  if (drop.length) el.classList.remove(...drop)
}

export function applyTheme(options: ApplyThemeOptions = {}): AppliedTheme {
  const theme = options.theme ?? "control"
  const mode = options.mode ?? themeMode(theme)
  const el =
    options.target ??
    (typeof document !== "undefined" ? document.documentElement : null)
  if (el) {
    clearThemeClasses(el)
    el.classList.add(...classesFor(theme, mode))
    el.dataset.pruiTheme = theme
    el.dataset.pruiMode = mode
    el.style.colorScheme = mode
  }
  const key = options.storageKey === undefined ? "prui:theme" : options.storageKey
  if (key && typeof localStorage !== "undefined") {
    localStorage.setItem(key, JSON.stringify({ theme, mode }))
  }
  return { theme, mode }
}

/** Read a persisted theme previously written by applyTheme. */
export function readPersistedTheme(
  storageKey = "prui:theme",
): AppliedTheme | null {
  if (typeof localStorage === "undefined") return null
  const raw = localStorage.getItem(storageKey)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as { theme?: unknown; mode?: unknown }
    const theme = PRUI_THEMES.find((t) => t === parsed.theme)
    if (!theme) return null
    const mode = parsed.mode === "light" || parsed.mode === "dark" ? parsed.mode : themeMode(theme)
    return { theme, mode }
  } catch {
    return null
  }
}

/** Cycle through dark themes and the light theme for a toggle button. */
export function nextTheme(current: ThemeName): ThemeName {
  const idx = PRUI_THEMES.indexOf(current)
  return PRUI_THEMES[(idx + 1) % PRUI_THEMES.length] ?? "control"
}

export const themeMeta = {
  name: "applyTheme",
  description: "Apply a named PRUI theme and persist the choice.",
  props: [
    { name: "theme", type: "'control' | 'workshop' | 'ember' | 'daylight'", default: "'control'", control: "select" },
    { name: "mode", type: "'light' | 'dark'", default: "theme natural mode", control: "select" },
    { name: "target", type: "HTMLElement", default: "document.documentElement", control: "none" },
    { name: "storageKey", type: "string | null", default: "'prui:theme'", control: "text" },
  ],
} as const
