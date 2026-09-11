import type { NavItem } from "prui/app"
import type { ThemeName } from "prui/theme"

/**
 * Designer state model: pure functions for URL codecs, nav normalization,
 * code generation, and undo/redo history. The React page composes these;
 * everything here is unit-tested (AC-12/13/14 logic).
 */

export interface DesignerTokens {
  /** Brand accent override, e.g. "#7c9cff". Empty = no override. */
  brand: string
  /** Base radius in px. Empty = theme default. */
  radius: string
  /** UI density scale ("comfortable" | "compact"). */
  density: "comfortable" | "compact"
}

export interface DesignerState {
  name: string
  mark: string
  theme: ThemeName
  sidebar: boolean
  sidebarWidth: number
  sidebarCollapsible: boolean
  topbar: boolean
  palette: boolean
  pages: "off" | "auth" | "utility" | "auth+utility"
  nav: NavItem[]
  tokens: DesignerTokens
}

export const DEFAULT_STATE: DesignerState = {
  name: "HRLabs",
  mark: "",
  theme: "control",
  sidebar: true,
  sidebarWidth: 240,
  sidebarCollapsible: true,
  topbar: true,
  palette: true,
  pages: "off",
  nav: [
    { label: "Dashboard", href: "/" },
    { label: "Employees", href: "/employees" },
    {
      label: "Leave",
      items: [
        { label: "Requests", href: "/leave/requests" },
        { label: "Balances", href: "/leave/balances" },
      ],
    },
  ],
  tokens: { brand: "", radius: "", density: "comfortable" },
}

/* ---------------- nav tree <-> flat depth model ---------------- */

/** Flat entry for drag-and-drop: depth 0 = top level, 1 = child of the preceding depth-0 item. */
export interface FlatNav {
  label: string
  href?: string
  depth: 0 | 1
}

export function flattenNav(nav: NavItem[]): FlatNav[] {
  const out: FlatNav[] = []
  for (const item of nav) {
    if (item.items?.length) {
      out.push({ label: item.label, depth: 0 })
      for (const child of item.items) out.push({ label: child.label, href: child.href, depth: 1 })
    } else {
      out.push({ label: item.label, href: item.href, depth: 0 })
    }
  }
  return out
}

/** Rebuild the NavItem tree; enforces every structural invariant. */
export function unflattenNav(flat: FlatNav[]): NavItem[] {
  const nav: NavItem[] = []
  for (const entry of flat) {
    if (entry.depth === 1) {
      const parent = nav.at(-1)
      // orphaned child (no preceding top-level item) becomes top level
      if (!parent) {
        nav.push({ label: entry.label, href: entry.href ?? "/..." })
        continue
      }
      parent.items = parent.items ?? []
      parent.items.push({ label: entry.label, href: entry.href ?? "/..." })
    } else {
      nav.push({ label: entry.label, href: entry.href ?? "/..." })
    }
  }
  // groups (top-level items with children) never navigate themselves
  for (const item of nav) {
    if (item.items?.length) delete item.href
  }
  return nav
}

/** Reject drops that would produce an invalid config (group inside group). */
export function canDrop(flat: FlatNav[], index: number, depth: 0 | 1): boolean {
  if (depth === 0) return true
  return index > 0 && flat[index - 1]?.depth === 0
}

/* ---------------- undo/redo history ---------------- */

export interface History<T> {
  stack: T[]
  index: number
}

export function initHistory(initial: DesignerState): History<DesignerState> {
  return { stack: [structuredClone(initial)], index: 0 }
}

export function pushHistory(history: History<DesignerState>, next: DesignerState): History<DesignerState> {
  const stack = history.stack.slice(0, history.index + 1)
  stack.push(structuredClone(next))
  return { stack: stack.slice(-50), index: Math.min(stack.length, 50) - 1 }
}

export function undo(history: History<DesignerState>): { history: History<DesignerState>; state: DesignerState | null } {
  if (history.index <= 0) return { history, state: null }
  const index = history.index - 1
  return { history: { ...history, index }, state: structuredClone(history.stack[index]!) }
}

export function redo(history: History<DesignerState>): { history: History<DesignerState>; state: DesignerState | null } {
  if (history.index >= history.stack.length - 1) return { history, state: null }
  const index = history.index + 1
  return { history: { ...history, index }, state: structuredClone(history.stack[index]!) }
}

/* ---------------- URL codec (AC-13) ---------------- */

export function encodeState(state: DesignerState): string {
  const json = JSON.stringify(state)
  const bytes = new TextEncoder().encode(json)
  let bin = ""
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

/** Decode a share link payload; unknown/invalid shapes fall back to defaults. */
export function decodeState(raw: string | null): DesignerState {
  if (!raw) return structuredClone(DEFAULT_STATE)
  try {
    const b64 = raw.replace(/-/g, "+").replace(/_/g, "/")
    const bin = atob(b64)
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as Partial<DesignerState>
    if (typeof parsed !== "object" || parsed === null || !Array.isArray(parsed.nav)) return structuredClone(DEFAULT_STATE)
    return sanitize(parsed)
  } catch {
    return structuredClone(DEFAULT_STATE)
  }
}

function str(v: unknown, fallback: string): string {
  return typeof v === "string" ? v : fallback
}

function sanitizeNav(items: unknown): NavItem[] {
  if (!Array.isArray(items)) return []
  const out: NavItem[] = []
  for (const item of items.slice(0, 100)) {
    if (typeof item !== "object" || item === null) continue
    const rec = item as Record<string, unknown>
    const entry: NavItem = { label: str(rec.label, "").slice(0, 80) }
    if (typeof rec.href === "string") entry.href = rec.href.slice(0, 200)
    if (Array.isArray(rec.items)) entry.items = sanitizeNav(rec.items).map((c) => ({ label: c.label, href: c.href }))
    if (entry.label) out.push(entry)
  }
  return out
}

/** Copy only known fields with sane types; anything else from the URL is dropped. */
function sanitize(parsed: Partial<DesignerState>): DesignerState {
  return {
    name: str(parsed.name, DEFAULT_STATE.name).slice(0, 60),
    mark: str(parsed.mark, "").slice(0, 200_000),
    theme: (["control", "workshop", "ember", "daylight"] as const).includes(parsed.theme as ThemeName)
      ? (parsed.theme as ThemeName)
      : DEFAULT_STATE.theme,
    sidebar: parsed.sidebar !== false,
    sidebarWidth: typeof parsed.sidebarWidth === "number" ? Math.min(400, Math.max(180, Math.round(parsed.sidebarWidth))) : 240,
    sidebarCollapsible: parsed.sidebarCollapsible !== false,
    topbar: parsed.topbar !== false,
    palette: parsed.palette !== false,
    pages: (["off", "auth", "utility", "auth+utility"] as const).includes(parsed.pages as DesignerState["pages"])
      ? (parsed.pages as DesignerState["pages"])
      : "off",
    nav: sanitizeNav(parsed.nav),
    tokens: {
      brand: str(parsed.tokens?.brand, "").slice(0, 32),
      radius: str(parsed.tokens?.radius, "").slice(0, 8),
      density: parsed.tokens?.density === "compact" ? "compact" : "comfortable",
    },
  }
}

/* ---------------- code generation (AC-12) ---------------- */

function navLiteral(nav: NavItem[], indent: string): string {
  const lines: string[] = []
  lines.push("[")
  for (const item of nav) {
    const icon = ""
    if (item.items?.length) {
      lines.push(`${indent}  { label: '${item.label}',${icon} items: [`)
      for (const child of item.items) {
        lines.push(`${indent}    { label: '${child.label}', href: '${child.href ?? "/..."}' },`)
      }
      lines.push(`${indent}  ] },`)
    } else {
      lines.push(`${indent}  { label: '${item.label}', href: '${item.href ?? "/..."}' },`)
    }
  }
  lines.push(`${indent}]`)
  return lines.join("\n")
}

export function generateAppCode(state: DesignerState): string {
  const pkg = "@skiddph/prui"
  const parts: string[] = []
  parts.push(`import { App } from '${pkg}/app'`)
  parts.push(`import '@skiddph/prui/styles.css'`)
  parts.push("")
  parts.push(`<App`)
  parts.push(`  brand={{ name: '${state.name}'${state.mark ? `, mark: '${state.mark}'` : ""} }}`)
  parts.push(`  nav={${navLiteral(state.nav, "  ")}}`)
  if (state.sidebar && (state.sidebarWidth !== 240 || !state.sidebarCollapsible)) {
    const opts = [
      state.sidebarWidth !== 240 ? `width: ${state.sidebarWidth}` : null,
      !state.sidebarCollapsible ? `collapsible: false` : null,
    ].filter(Boolean)
    parts.push(`  sidebar={{ ${opts.join(", ")} }}`)
  }
  if (state.palette) parts.push(`  search={{ enabled: true, hotkey: '/' }}`)
  else parts.push(`  search={false}`)
  parts.push(`  theme={{ default: '${state.theme}', persist: true }}`)
  if (state.pages !== "off") parts.push(`  pages='${state.pages}'`)
  parts.push(`>`)
  parts.push(`  {/* your routes */}`)
  parts.push(`</App>`)
  return parts.join("\n")
}

export function generateTokenCss(state: DesignerState): string {
  const rules: string[] = []
  if (state.tokens.brand) rules.push(`  --prui-brand: ${state.tokens.brand};`)
  if (state.tokens.radius) rules.push(`  --prui-radius-2: ${state.tokens.radius}px;`)
  if (state.tokens.density === "compact") rules.push(`  --prui-dim-op: 0.7;`)
  if (!rules.length) return "/* no overrides — the theme ships sensible defaults */"
  return [".prui-root {", ...rules, "}"].join("\n")
}

export function generateAgentPrompt(state: DesignerState): string {
  return [
    `Build a PRUI app with this exact configuration:`,
    ``,
    `- App name: ${state.name}`,
    `- Theme: ${state.theme}${state.tokens.brand ? `, brand color ${state.tokens.brand}` : ""}`,
    `- Sidebar: ${state.sidebar ? `${state.sidebarWidth}px, ${state.sidebarCollapsible ? "collapsible" : "fixed"}` : "disabled"}`,
    `- Command palette: ${state.palette ? "enabled on '/'" : "disabled"}`,
    `- Pre-made pages: ${state.pages}`,
    `- Navigation: ${JSON.stringify(state.nav)}`,
    ``,
    `Use the prui skill (skill/ in the prui repo): <App> + <Resource> configs,`,
    `then run the verification checklist from skill/references/verification.md.`,
  ].join("\n")
}
