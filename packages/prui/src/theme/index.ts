import * as React from "react"

/**
 * PRUI theme system.
 * Tokens are CSS variables set by the named theme classes in this package.
 * applyTheme() sets the theme class plus data-mode on the target element.
 */

export const PRUI_THEMES = ["control", "workshop", "ember", "daylight"] as const

export type ThemeName = (typeof PRUI_THEMES)[number]

const THEME_CLASS_PREFIX = "prui-theme-"

const customThemes = new Map<string, ThemeTokens>()

/** Token names understood by defineTheme / applyThemeTokens. */
export const PRUI_TOKENS = [
  "background", "surface", "raise", "line", "fg", "dim",
  "brand", "brand-fg", "ok", "warn", "danger",
] as const

export type ThemeTokenName = (typeof PRUI_TOKENS)[number]

export interface ThemeTokens {
  background?: string
  surface?: string
  raise?: string
  line?: string
  fg?: string
  dim?: string
  brand?: string
  "brand-fg"?: string
  ok?: string
  warn?: string
  danger?: string
  /** Base corner radius, any CSS length. */
  radius?: string
  /** Secondary-text opacity, 0 to 1. */
  "dim-op"?: string | number
  /** Whether the custom theme reads as light or dark (default: dark). */
  mode?: "light" | "dark"
}



function tokenVar(name: string): string {
  return `--prui-${name}`
}

function tokensToCss(tokens: ThemeTokens): string {
  const lines: string[] = []
  for (const [k, v] of Object.entries(tokens)) {
    if (v === undefined) continue
    lines.push(`  ${tokenVar(k)}: ${v};`)
  }
  return lines.join("\n")
}

/**
 * Register a custom theme under a name. The theme becomes first-class:
 * applyTheme({ theme: name }), the persisted-theme reader, and listThemes()
 * all accept it. Call again with the same name to update it.
 */
export function defineTheme(name: string, tokens: ThemeTokens): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "custom"
  customThemes.set(slug, { ...tokens })

  if (typeof document !== "undefined") {
    let el = document.getElementById(`prui-custom-theme-${slug}`) as HTMLStyleElement | null
    if (!el) {
      el = document.createElement("style")
      el.id = `prui-custom-theme-${slug}`
      document.head.appendChild(el)
    }
    el.textContent = `.${THEME_CLASS_PREFIX}${slug} {
${tokensToCss(tokens)}
}`
  }
  return slug
}

/** All theme names: the four built-ins plus every theme from defineTheme. */
export function listThemes(): ThemeName[] {
  return [...PRUI_THEMES, ...customThemes.keys()] as ThemeName[]
}

/**
 * Overlay token values on top of the CURRENT theme without switching it.
 * Vars are written inline on the target (documentElement by default), so a
 * single call re-skins the running app. Pass a storageKey to persist the
 * overlay and re-apply it on the next page load; pass null to skip
 * persistence. Returns the list of vars written.
 */
export function applyThemeTokens(
  tokens: ThemeTokens,
  options: { target?: HTMLElement | null; storageKey?: string | null } = {},
): string[] {
  const el = options.target ?? (typeof document !== "undefined" ? document.documentElement : null)
  const written: string[] = []
  if (el) {
    for (const [k, v] of Object.entries(tokens)) {
      if (v === undefined) continue
      el.style.setProperty(tokenVar(k), String(v))
      written.push(tokenVar(k))
    }
    if (tokens.radius !== undefined) {
      el.style.setProperty("--prui-radius", String(tokens.radius))
      written.push("--prui-radius")
    }
    if (tokens["dim-op"] !== undefined) {
      el.style.setProperty("--prui-dim-op", String(tokens["dim-op"]))
      written.push("--prui-dim-op")
    }
  }
  const key = options.storageKey === undefined ? "prui:tokens" : options.storageKey
  if (key && typeof localStorage !== "undefined") {
    localStorage.setItem(key, JSON.stringify(tokens))
  }
  return written
}

/** Remove a token overlay written by applyThemeTokens and forget its persistence. */
export function clearAppliedTokens(options: { target?: HTMLElement | null; storageKey?: string | null } = {}): void {
  const el = options.target ?? (typeof document !== "undefined" ? document.documentElement : null)
  if (el) {
    for (const t of [...PRUI_TOKENS, "radius", "dim-op"]) {
      el.style.removeProperty(tokenVar(t))
    }
    el.style.removeProperty("--prui-radius")
    el.style.removeProperty("--prui-dim-op")
  }
  const key = options.storageKey === undefined ? "prui:tokens" : options.storageKey
  if (key && typeof localStorage !== "undefined") {
    localStorage.removeItem(key)
  }
}

/** Re-apply a persisted token overlay (call once at startup if you use it). */
export function restoreAppliedTokens(
  options: { target?: HTMLElement | null; storageKey?: string } = {},
): ThemeTokens | null {
  if (typeof localStorage === "undefined") return null
  const key = options.storageKey ?? "prui:tokens"
  const raw = localStorage.getItem(key)
  if (!raw) return null
  try {
    const tokens = JSON.parse(raw) as ThemeTokens
    applyThemeTokens(tokens, { target: options.target, storageKey: null })
    return tokens
  } catch {
    return null
  }
}

export type ThemeMode = "light" | "dark"

/**
 * A theme default may be a named theme or the shorthand 'dark' / 'light',
 * which resolve to the default dark theme (control) and the default light
 * theme (daylight).
 */
export type ThemeDefault = ThemeName | "dark" | "light"

export function resolveThemeName(name: ThemeDefault): ThemeName {
  if (name === "dark") return "control"
  if (name === "light") return "daylight"
  return name
}

const DARK_THEMES: readonly ThemeName[] = ["control", "workshop", "ember"]
const LIGHT_THEMES: readonly ThemeName[] = ["daylight"]

export function isDarkTheme(name: ThemeName): boolean {
  return DARK_THEMES.includes(name)
}

export function isLightTheme(name: ThemeName): boolean {
  return LIGHT_THEMES.includes(name)
}

export function themeMode(name: ThemeName): ThemeMode {
  const custom = customThemes.get(name as string)
  if (custom?.mode) return custom.mode
  return isDarkTheme(name) ? "dark" : "light"
}

export interface ApplyThemeOptions {
  /** Theme name (or 'dark'/'light' shorthand), defaults to control. */
  theme?: ThemeDefault
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
  const requested = options.theme ?? "control"
  const known =
    requested === "dark" ||
    requested === "light" ||
    (PRUI_THEMES as readonly string[]).includes(requested as string) ||
    customThemes.has(requested as string)
  if (!known) {
    // unknown theme name: fall back to the default rather than rendering unstyled
    return applyTheme({ ...options, theme: "control" })
  }
  const theme: ThemeName =
    requested === "dark" ? "control" : requested === "light" ? "daylight" : (requested as ThemeName)
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
    { name: "theme", type: "'control' | 'workshop' | 'ember' | 'daylight' | 'dark' | 'light'", default: "'control'", control: "select" },
    { name: "mode", type: "'light' | 'dark'", default: "theme natural mode", control: "select" },
    { name: "target", type: "HTMLElement", default: "document.documentElement", control: "none" },
    { name: "storageKey", type: "string | null", default: "'prui:theme'", control: "text" },
  ],
} as const

/* ------------------------------------------------------------------ */
/* Design token constants (JS mirror of the CSS custom properties)     */
/* ------------------------------------------------------------------ */

/**
 * Breakpoint thresholds in px — the JS mirror of the CSS breakpoints the
 * shell uses (48rem = 768px "md"; the mobile rail grid ends at 47.99rem).
 * Components that need to branch on viewport in JS read these instead of
 * hardcoding pixel values.
 */
export const PRUI_BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const

export type BreakpointName = keyof typeof PRUI_BREAKPOINTS

/** MatchMedia hook over PRUI_BREAKPOINTS (SSR-safe: false until mounted). */
export function useBreakpointAtLeast(name: BreakpointName): boolean {
  const [matches, setMatches] = React.useState(false)
  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return
    const mq = window.matchMedia(`(min-width: ${PRUI_BREAKPOINTS[name]}px)`)
    const onChange = () => setMatches(mq.matches)
    onChange()
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [name])
  return matches
}

/** The named semantic token groups PRUI ships in base.css. */
export const PRUI_DESIGN_TOKENS = {
  radius: ["--prui-radius-1", "--prui-radius-2", "--prui-radius-3", "--prui-radius-full"],
  zIndex: ["--prui-z-header", "--prui-z-drawer", "--prui-z-overlay", "--prui-z-flyout", "--prui-z-tooltip", "--prui-z-modal", "--prui-z-confirm", "--prui-z-toast", "--prui-z-content"],
  motion: ["--prui-duration-fast", "--prui-duration-base", "--prui-duration-slow", "--prui-ease-out", "--prui-ease-in-out", "--prui-ease-spring"],
  spacing: ["--prui-space-1", "--prui-space-2", "--prui-space-3", "--prui-space-4", "--prui-space-5", "--prui-space-6", "--prui-space-8", "--prui-space-10", "--prui-space-12"],
  typography: ["--prui-text-xs", "--prui-text-sm", "--prui-text-base", "--prui-text-lg", "--prui-text-xl", "--prui-text-2xl", "--prui-text-3xl"],
  weight: ["--prui-weight-normal", "--prui-weight-medium", "--prui-weight-semibold", "--prui-weight-bold"],
  elevation: ["--prui-shadow-sm", "--prui-shadow-md", "--prui-shadow-lg", "--prui-shadow-modal"],
  opacity: ["--prui-opacity-disabled", "--prui-opacity-muted", "--prui-opacity-overlay"],
} as const
