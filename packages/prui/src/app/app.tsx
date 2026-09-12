import * as React from "react"
import { createPortal } from "react-dom"
import {
  BrowserRouter,
  MemoryRouter,
  Link,
  NavLink,
  useLocation,
  useNavigate,
  Outlet,
} from "react-router-dom"
import { ChevronDown, ChevronsLeft, ChevronsRight, Menu, Palette, Search, X } from "lucide-react"
import { cn } from "../core/cn"
import { Dropdown } from "../core/dropdown"
import { Button } from "../core/button"
import { applyTheme, clearAppliedTokens, readPersistedTheme, resolveThemeName, themeMode, listThemes } from "../theme"
import type { AppliedTheme, ThemeDefault } from "../theme"
import type { PropsMeta } from "../core/props-meta"
import { AutoPages } from "./auto-pages"
import type { PageSetName } from "./auto-pages"

/**
 * <App> is the whole shell: responsive sidebar with collapsible nav groups and
 * mobile drawer plus scroll lock, sticky header with brand and theme switch,
 * built-in command palette on the "/" hotkey, optional session-timeout flow,
 * and router wiring (BrowserRouter by default, memory mode for embedded use).
 */

/* SessionTimeout is opt-in auth flow; keep it out of the shell's static graph */
const SessionTimeout = React.lazy(() =>
  import("./session-timeout").then((m) => ({ default: m.SessionTimeout })),
)

export type NavIconType = React.ComponentType<{ className?: string }>

export interface NavItem {
  label: string
  href?: string
  icon?: NavIconType
  /** Nest under a group heading. Items with children become groups. */
  items?: NavItem[]
  /** Group headings render as passive labels when href is absent and this is set. */
  heading?: boolean
}

export interface BrandConfig {
  name: string
  /** Image URL for the mark. */
  mark?: string
  /** Home link, defaults to "/". */
  href?: string
}

export interface SearchConfig {
  enabled?: boolean
  hotkey?: string
  placeholder?: string
}

export interface ThemeConfig {
  /** Named theme or the 'dark' / 'light' shorthand. Default 'control'. */
  default?: ThemeDefault
  persist?: boolean
}

export interface SidebarConfig {
  /** Width in px, default 240. */
  width?: number
  /** Whether the mobile hamburger/drawer is available. Default true. */
  collapsible?: boolean
  /** Whether the mobile drawer starts open. Default false. */
  defaultOpen?: boolean
}

/** Session-timeout flow config (HRLabs extraction). */
export interface AuthConfig {
  /** Idle minutes before logout. Default 15. */
  sessionTimeout?: number
  /** Idle minutes before the countdown warning. Default 2. */
  warningTime?: number
  /** Called on expiry or early logout; default navigates to loginPath. */
  onTimeout?: () => void
  loginPath?: string
}

export type RouterMode = "browser" | "memory" | "react-router"

export interface AppProps {
  brand?: BrandConfig
  nav?: NavItem[]
  search?: boolean | SearchConfig
  theme?: boolean | ThemeConfig
  sidebar?: SidebarConfig
  /** Session-timeout flow; omit or false to disable. */
  auth?: boolean | AuthConfig
  router?: RouterMode
  /** Extra header content. */
  header?: React.ReactNode
  /** Router initial entries for memory mode. */
  initialEntries?: string[]
  /**
   * Auto-route the pre-made page set. "auth" wires /login, /register,
   * /forgot-password, /reset-password, /otp, /logout; "utility" adds
   * /404, /error, /profile, /settings, /admin-setup. Page props come
   * from `pagesConfig`.
   */
  pages?: "auth" | "utility" | "auth+utility"
  /** Props passed to the auto-routed pre-made pages (per page name). */
  pagesConfig?: Partial<Record<PageSetName, Record<string, unknown>>>
  /** A pathname (e.g. "/") on which every nav group starts expanded. */
  expandAllOn?: string
  /**
   * Shell arrangement (A/B/C also work collapsed on mobile via the rail):
   *  - "A" full-height sidebar, header inside the content column (default)
   *  - "B" full-width header, sidebar below it
   *  - "C" full-width header PLUS a sidebar header row (topbar height,
   *    sidebar width), nav below that; the combination of A and B
   *  - "D" facebook style: full-width topbar, centered sticky embedded
   *    sidebar beside stacked cards (page scroll, sidebar not fixed left)
   * A, B and C are collapsible to an icon rail (desktop and mobile).
   */
  layoutType?: "A" | "B" | "C" | "D"
  /** Content of the layout-C sidebar header; defaults to the brand. */
  sidebarHeader?: React.ReactNode
  /** Prominent action slot pinned to the sidebar bottom (e.g. layout D). */
  sidebarFooter?: React.ReactNode
  children?: React.ReactNode
}

/* ---------------- theme toggle ---------------- */

export function useThemeState(config?: boolean | ThemeConfig) {
  const enabled = config !== false
  const cfg: ThemeConfig = typeof config === "object" ? config : {}
  const persist = cfg.persist !== false
  const defaultTheme = resolveThemeName(cfg.default ?? "control")
  const defaultMode = themeMode(defaultTheme)

  const [state, setState] = React.useState<AppliedTheme>(() => {
    const persisted = persist ? readPersistedTheme() : null
    return persisted ?? { theme: defaultTheme, mode: defaultMode }
  })

  const setTheme = React.useCallback(
    (next: AppliedTheme) => {
      setState(next)
      applyTheme({ theme: next.theme, mode: next.mode, storageKey: persist ? "prui:theme" : null })
    },
    [persist],
  )

  React.useEffect(() => {
    applyTheme({ theme: state.theme, mode: state.mode, storageKey: persist ? "prui:theme" : null })
  }, [state, persist])

  return { enabled, state, setTheme }
}

function ThemeToggle({ config }: { config?: boolean | ThemeConfig }) {
  const { enabled, state, setTheme } = useThemeState(config)
  if (!enabled) return null
  return (
    <Dropdown
      align="end"
      trigger={
        <button
          type="button"
          aria-label="Switch theme"
          title={`Theme: ${state.theme}`}
          data-testid="theme-toggle"
          className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--prui-radius)] text-[var(--prui-dim)] hover:bg-[var(--prui-raise)] hover:text-[var(--prui-fg)] cursor-pointer"
        >
          <Palette className="h-4 w-4" aria-hidden />
        </button>
      }
      items={listThemes().map((t) => ({
        label: `${t}${t === state.theme ? " (active)" : ""}`,
        onSelect: () => {
          // a token overlay (theme builder) would override the new theme's
          // colors: switching themes is an explicit revert of that overlay
          clearAppliedTokens()
          setTheme({ theme: t, mode: t === "daylight" ? "light" : "dark" })
        },
      }))}
    />
  )
}

/* ---------------- sidebar ---------------- */

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(href + "/")
}

function NavGroup({ item, onNavigate, expandAllOn, collapsed }: { item: NavItem; onNavigate?: () => void; expandAllOn?: string; collapsed?: boolean }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const active = (item.items ?? []).some((child) =>
    child.href ? isActivePath(pathname, child.href) : (child.items ?? []).some((gc) => gc.href && isActivePath(pathname, gc.href)),
  )
  const [open, setOpen] = React.useState(active || (expandAllOn !== undefined && pathname === expandAllOn))

  React.useEffect(() => {
    if (active) setOpen(true)
  }, [active])

  const Icon = item.icon

  // Collapsed rail: the whole group is ONE rail item; clicking it opens a
  // flyout menu (portaled to the body so the rail's overflow cannot clip it)
  // instead of expanding nested rows inside a 64px column.
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [menuPos, setMenuPos] = React.useState<{ top: number; left: number } | null>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [menuOpen])

  if (collapsed) {
    const flyout: { label?: string; href?: string; heading?: string }[] = []
    for (const child of item.items ?? []) {
      if (child.items?.length) {
        if (child.items.some((gc) => gc.href)) flyout.push({ heading: child.label })
        for (const gc of child.items) if (gc.href) flyout.push({ label: gc.label, href: gc.href })
      } else if (child.href) {
        flyout.push({ label: child.label, href: child.href })
      }
    }

    const openMenu = () => {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (rect) {
        const est = Math.min(flyout.length * 32 + 40, 320)
        setMenuPos({
          left: rect.right + 8,
          top: Math.max(8, Math.min(rect.top, window.innerHeight - est - 8)),
        })
      }
      setMenuOpen((o) => !o)
    }

    return (
      <li data-testid="nav-group">
        <button
          ref={triggerRef}
          type="button"
          title={item.label}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={openMenu}
          data-testid="rail-group-trigger"
          className={cn(
            "flex w-full items-center justify-center rounded-[var(--prui-radius)] px-2.5 py-1.5 text-sm cursor-pointer",
            active || menuOpen ? "text-[var(--prui-brand)]" : "text-[var(--prui-dim)] hover:text-[var(--prui-fg)]",
          )}
        >
          {Icon ? (
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
          ) : (
            <span className="prui-nav-mono text-[10px] font-semibold">{item.label.slice(0, 2).toUpperCase()}</span>
          )}
        </button>
        {menuOpen && menuPos
          ? createPortal(
              <>
                <div className="fixed inset-0 z-[60]" onClick={() => setMenuOpen(false)} data-testid="rail-flyout-backdrop" />
                <div
                  role="menu"
                  aria-label={item.label}
                  data-testid="rail-flyout"
                  className="fixed z-[61] flex w-56 max-h-80 flex-col overflow-y-auto rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-surface)] py-1.5 shadow-xl"
                  style={{ top: menuPos.top, left: menuPos.left }}
                >
                  <div className="px-3 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--prui-dim)]">{item.label}</div>
                  {flyout.map((fi, i) =>
                    fi.heading ? (
                      <div key={`h-${i}`} className="px-3 pb-0.5 pt-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--prui-dim)]">
                        {fi.heading}
                      </div>
                    ) : (
                      <button
                        key={fi.href}
                        type="button"
                        role="menuitem"
                        data-testid="rail-flyout-item"
                        className={cn(
                          "flex cursor-pointer items-center rounded-[calc(var(--prui-radius)-1px)] px-3 py-1.5 text-left text-sm",
                          fi.href && isActivePath(pathname, fi.href)
                            ? "bg-[var(--prui-brand)]/15 text-[var(--prui-brand)]"
                            : "text-[var(--prui-fg)] hover:bg-[var(--prui-raise)]",
                        )}
                        onClick={() => {
                          setMenuOpen(false)
                          onNavigate?.()
                          if (fi.href) navigate(fi.href)
                        }}
                      >
                        {fi.label}
                      </button>
                    ),
                  )}
                </div>
              </>,
              document.body,
            )
          : null}
      </li>
    )
  }

  return (
    <li data-testid="nav-group">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center gap-2 rounded-[var(--prui-radius)] px-2.5 py-1.5 text-sm cursor-pointer",
          active ? "text-[var(--prui-fg)]" : "text-[var(--prui-dim)] hover:text-[var(--prui-fg)]",
        )}
      >
        {Icon ? <Icon className="h-4 w-4 shrink-0" aria-hidden /> : <span className={cn("prui-nav-mono text-[10px] font-semibold")}>{item.label.slice(0, 2).toUpperCase()}</span>}
        <span className={cn("flex-1 text-left truncate", "prui-nav-label")}>{item.label}</span>
        <ChevronDown className={cn("prui-nav-chevron h-4 w-4 transition-transform", !open && "-rotate-90")} aria-hidden />
      </button>
      {open ? (
        <ul className="ml-4 mt-0.5 flex flex-col gap-0.5 border-l border-[var(--prui-line)] pl-2">
          {(item.items ?? []).map((child) => (
            <NavItemLink key={child.href ?? child.label} item={child} onNavigate={onNavigate} nested expandAllOn={expandAllOn} collapsed={collapsed} />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

function NavSubgroupLabel({ label }: { label: string }) {
  return (
    <li className="px-2.5 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--prui-dim)]" data-testid="nav-subgroup">
      {label}
    </li>
  )
}

function NavItemLink({ item, onNavigate, nested, expandAllOn, collapsed }: { item: NavItem; onNavigate?: () => void; nested?: boolean; expandAllOn?: string; collapsed?: boolean }) {
  if (item.items && item.items.length > 0) return <NavGroup item={item} onNavigate={onNavigate} expandAllOn={expandAllOn} collapsed={collapsed} />
  if (item.heading || (!item.href && !item.items)) return collapsed ? null : <NavSubgroupLabel label={item.label} />
  if (!item.href) return null
  return (
    <li>
      <NavLink
        to={item.href}
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-2 rounded-[var(--prui-radius)] px-2.5 py-1.5 text-sm",
            nested && "pl-2.5",
            isActive
              ? "bg-[var(--prui-brand)]/15 text-[var(--prui-brand)] font-medium"
              : "text-[var(--prui-dim)] hover:text-[var(--prui-fg)] hover:bg-[var(--prui-raise)]",
          )
        }
      >
        {item.icon && !nested ? (
          <item.icon className="h-4 w-4 shrink-0" aria-hidden />
        ) : collapsed ? (
          <span className={cn("prui-nav-mono text-[10px] font-semibold")}>{item.label.slice(0, 2).toUpperCase()}</span>
        ) : null}
        <span className={cn("truncate", collapsed && nested && "prui-nav-label", "prui-nav-label")}>{item.label}</span>
      </NavLink>
    </li>
  )
}

export function SidebarNav({ nav, onNavigate, expandAllOn, collapsed }: { nav: NavItem[]; onNavigate?: () => void; expandAllOn?: string; collapsed?: boolean }) {
  return (
    <nav aria-label="Main" className="prui-app-nav">
      <ul className="flex flex-col gap-0.5">
        {nav.map((item) => (
          <NavItemLink key={item.href ?? item.label} item={item} onNavigate={onNavigate} expandAllOn={expandAllOn} collapsed={collapsed} />
        ))}
      </ul>
    </nav>
  )
}

function BrandMark({ brand }: { brand?: BrandConfig }) {
  if (!brand) return null
  const content = (
    <>
      {brand.mark ? <img src={brand.mark} alt="" className="h-6 w-6 rounded-[var(--prui-radius-1)] object-cover" /> : null}
      <span className="prui-nav-label truncate font-semibold text-[var(--prui-fg)]">{brand.name}</span>
    </>
  )
  const classes = "flex items-center gap-2 px-1 py-1 min-w-0"
  return brand.href === null ? (
    <div className={classes}>{content}</div>
  ) : (
    <Link to={brand.href ?? "/"} className={classes} aria-label={brand.name}>
      {content}
    </Link>
  )
}

/* ---------------- command palette ---------------- */

export interface PaletteEntry {
  label: string
  href?: string
  onSelect?: () => void
  group?: string
}

export function CommandPalette({
  open,
  onOpenChange,
  entries,
  placeholder = "Type a command or search...",
  onNavigate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  entries: PaletteEntry[]
  placeholder?: string
  onNavigate?: (href: string) => void
}) {
  const [query, setQuery] = React.useState("")
  const [active, setActive] = React.useState(0)

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return entries
    return entries.filter((e) => e.label.toLowerCase().includes(q))
  }, [entries, query])

  React.useEffect(() => setActive(0), [query])

  if (!open) return null

  const go = (entry: PaletteEntry) => {
    onOpenChange(false)
    if (entry.onSelect) entry.onSelect()
    else if (entry.href) onNavigate?.(entry.href)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24"
      style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onOpenChange(false)
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        data-testid="command-palette"
        className="w-full max-w-md rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-surface)] shadow-xl"
      >
        <input
          autoFocus
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-label="Command palette search"
          aria-activedescendant={filtered[active] ? `palette-option-${active}` : undefined}
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") onOpenChange(false)
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setActive((a) => Math.min(a + 1, filtered.length - 1))
            }
            if (e.key === "ArrowUp") {
              e.preventDefault()
              setActive((a) => Math.max(a - 1, 0))
            }
            if (e.key === "Enter") {
              const entry = filtered[active]
              if (entry) {
                onOpenChange(false)
                if (entry.onSelect) entry.onSelect()
                else if (entry.href) onNavigate?.(entry.href)
              }
            }
          }}
          className="w-full bg-transparent px-4 py-3 text-sm text-[var(--prui-fg)] placeholder:text-[var(--prui-dim)] outline-none border-b border-[var(--prui-line)] rounded-t-[var(--prui-radius)]"
        />
        <ul role="listbox" className="max-h-64 overflow-auto p-1">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-[var(--prui-dim)]">No matches.</li>
          ) : (
            filtered.map((entry, i) => (
              <li
                key={`${entry.label}-${i}`}
                id={`palette-option-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(entry)}
                className={cn(
                  "cursor-pointer rounded-[calc(var(--prui-radius)-1px)] px-3 py-2 text-sm text-[var(--prui-fg)]",
                  i === active && "bg-[var(--prui-raise)]",
                )}
              >
                {entry.group ? <span className="mr-2 text-xs text-[var(--prui-dim)]">{entry.group}</span> : null}
                {entry.label}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}

/* ---------------- shell ---------------- */

export function AppShell(props: AppProps) {
  const {
    brand,
    nav = [],
    search = true,
    theme = true,
    auth = false,
    sidebar: sidebarCfg = {},
    header,
    pages,
    pagesConfig,
    expandAllOn,
    layoutType = "A",
    sidebarHeader,
    sidebarFooter,
    children,
  } = props

  const searchCfg: SearchConfig = typeof search === "object" ? search : { enabled: search !== false }
  const searchEnabled = searchCfg.enabled !== false
  const hotkey = searchCfg.hotkey ?? "/"

  const collapsible = sidebarCfg.collapsible !== false
  const [drawerOpen, setDrawerOpen] = React.useState(sidebarCfg.defaultOpen === true)
  const [railExpanded, setRailExpanded] = React.useState(true)
  const [paletteOpen, setPaletteOpen] = React.useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // memo keeps the handleTimeout useCallback deps stable across renders
  const authCfg = React.useMemo<AuthConfig | null>(
    () => (auth === false ? null : auth === true ? {} : auth),
    [auth],
  )
  const handleTimeout = React.useCallback(() => {
    if (authCfg?.onTimeout) authCfg.onTimeout()
    else navigate(authCfg?.loginPath ?? "/login")
  }, [authCfg, navigate])

  const paletteEntries: PaletteEntry[] = React.useMemo(() => {
    const entries: PaletteEntry[] = []
    for (const item of nav) {
      if (item.items) {
        for (const child of item.items) {
          if (child.href) entries.push({ label: `${item.label} / ${child.label}`, href: child.href, group: item.label })
        }
      } else if (item.href) {
        entries.push({ label: item.label, href: item.href })
      }
    }
    return entries
  }, [nav])

  // "/" hotkey opens the palette when not typing in a field
  React.useEffect(() => {
    if (!searchEnabled) return
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const typing =
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      if (e.key === hotkey && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        setPaletteOpen(true)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [hotkey, searchEnabled])

  // close the drawer on route change (not on mount — defaultOpen must survive)
  const prevPath = React.useRef(location.pathname)
  React.useEffect(() => {
    if (prevPath.current !== location.pathname) {
      prevPath.current = location.pathname
      setDrawerOpen(false)
    }
  }, [location.pathname])

  // scroll lock while the drawer is open
  React.useEffect(() => {
    if (!drawerOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [drawerOpen])

  const width = sidebarCfg.width ?? 240

  const railCollapsed = !railExpanded && layoutType !== "D"

  return (
    <div
      className="prui-app prui-shell min-h-dvh bg-[var(--prui-background)] text-[var(--prui-fg)]"
      data-layout={layoutType}
      data-collapsed={railCollapsed ? "true" : undefined}
      style={{ "--prui-shell-sidebar": railCollapsed ? "var(--prui-rail-width, 64px)" : `${width}px` } as React.CSSProperties}
    >
      {/* desktop sidebar: grid area (mobile uses the drawer below) */}
      <aside data-testid="sidebar" className="prui-shell-sidebar hidden md:flex md:flex-col md:min-h-0">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-2 pt-4 scrollbar-thin">
          <SidebarNav nav={nav} expandAllOn={expandAllOn} collapsed={railCollapsed} />
        </div>
        {sidebarFooter ? (
          <div
            className={cn("border-t border-[var(--prui-line)] p-2", railCollapsed && "flex justify-center px-1")}
            data-testid="sidebar-footer"
          >
            {sidebarFooter}
          </div>
        ) : null}
        {layoutType !== "D" ? (
          <div className="border-t border-[var(--prui-line)] p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center"
              aria-label={railCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              data-testid="sidebar-toggle"
              onClick={() => setRailExpanded((r) => !r)}
            >
              {railCollapsed ? <ChevronsRight className="h-4 w-4" aria-hidden /> : <ChevronsLeft className="h-4 w-4" aria-hidden />}
            </Button>
          </div>
        ) : null}
      </aside>

      {/* mobile drawer */}
      {drawerOpen ? (
        <div className="md:hidden fixed inset-0 z-40" data-testid="mobile-drawer">
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
            onClick={() => setDrawerOpen(false)}
            data-testid="drawer-backdrop"
          />
          <aside
            className="absolute left-0 top-0 h-full w-64 overflow-y-auto border-r border-[var(--prui-line)] bg-[var(--prui-surface)] p-2"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
          >
            <div className="mb-2 flex h-10 items-center justify-end px-1">
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setDrawerOpen(false)}
                className="rounded-[var(--prui-radius)] p-1 text-[var(--prui-dim)] hover:text-[var(--prui-fg)] cursor-pointer"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <SidebarNav nav={nav} onNavigate={() => setDrawerOpen(false)} expandAllOn={expandAllOn} collapsed={false} />
          </aside>
        </div>
      ) : null}

      {layoutType === "C" ? (
        <div
          data-testid="sidebar-header"
          className="prui-shell-sidehead hidden h-14 items-center gap-2 border-b border-[var(--prui-line)] bg-[var(--prui-surface)] px-4 md:flex"
        >
          {sidebarHeader ?? <BrandMark brand={brand} />}
        </div>
      ) : null}
      <header
        data-testid="app-header"
        className="prui-shell-header sticky top-0 z-30 grid h-14 grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-[var(--prui-line)] bg-[var(--prui-surface)] px-4 md:px-6"
      >
        {collapsible ? (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open navigation"
            className="md:hidden"
            onClick={() => setDrawerOpen(true)}
            data-testid="drawer-toggle"
          >
            <Menu className="h-4 w-4" aria-hidden />
          </Button>
        ) : null}
        {collapsible && layoutType !== "D" ? (
          <Button
            variant="ghost"
            size="icon"
            aria-label={railCollapsed ? "Show sidebar rail" : "Hide sidebar rail"}
            className="md:hidden"
            onClick={() => setRailExpanded((r) => !r)}
            data-testid="rail-toggle-mobile"
          >
            {railCollapsed ? <ChevronsRight className="h-4 w-4" aria-hidden /> : <ChevronsLeft className="h-4 w-4" aria-hidden />}
          </Button>
        ) : null}
        <div className="min-w-0 justify-self-start">
          <BrandMark brand={brand} />
        </div>
        {searchEnabled ? (
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            data-testid="search-trigger"
            className="hidden h-8 w-[min(420px,34vw)] items-center gap-2 rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-background)] px-3.5 text-sm text-[var(--prui-dim)] hover:border-[var(--prui-dim)] cursor-pointer md:flex"
          >
            <Search className="h-4 w-4" aria-hidden />
            <span className="flex-1 text-left">{searchCfg.placeholder ?? "Search..."}</span>
            <kbd className="ml-auto rounded-[var(--prui-radius-1)] border border-[var(--prui-line)] bg-[var(--prui-raise)] px-1.5 py-0.5 text-xs">{hotkey}</kbd>
          </button>
        ) : null}
        <div className="flex items-center gap-2 justify-self-end">
          {header}
          <ThemeToggle config={theme} />
        </div>
      </header>
      <main data-testid="app-content" className="prui-shell-content min-h-0 flex-1 p-4 md:p-6">
        {pages ? (
          <AutoPages mode={pages} config={pagesConfig}>
            {children}
          </AutoPages>
        ) : (
          (children ?? <Outlet />)
        )}
      </main>

      {authCfg ? (
        <React.Suspense fallback={null}>
          <SessionTimeout
            timeout={authCfg.sessionTimeout}
            warningTime={authCfg.warningTime}
            onTimeout={handleTimeout}
          />
        </React.Suspense>
      ) : null}

      {searchEnabled ? (
        <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} entries={paletteEntries} placeholder={searchCfg.placeholder} onNavigate={navigate} />
      ) : null}
    </div>
  )
}

export function App(props: AppProps) {
  const { router = "browser", initialEntries } = props
  // "react-router" is an accepted alias of "browser"
  const Router = router === "memory" ? MemoryRouter : BrowserRouter
  return (
    <Router initialEntries={initialEntries}>
      <AppShell {...props} />
    </Router>
  )
}

export const appPropsMeta: PropsMeta = {
  name: "App",
  props: [
    { name: "brand", type: "{ name, mark?, href? }", default: "undefined", control: "object" },
    { name: "nav", type: "NavItem[]", default: "[]", control: "object" },
    { name: "search", type: "boolean | { enabled?, hotkey?, placeholder? }", default: "true", control: "boolean" },
    { name: "theme", type: "boolean | { default?: ThemeName | 'dark' | 'light', persist? }", default: "true", control: "boolean" },
    { name: "auth", type: "boolean | { sessionTimeout?, warningTime?, onTimeout?, loginPath? }", default: "false", control: "boolean" },
    { name: "sidebar", type: "{ width?, collapsible?, defaultOpen? }", default: "{}", control: "object" },
    { name: "router", type: "'browser' | 'memory'", default: "'browser'", control: "select", options: ["browser", "memory", "react-router"] },
    { name: "initialEntries", type: "string[]", default: "undefined", control: "object" },
    { name: "pages", type: "'auth' | 'utility' | 'auth+utility'", default: "undefined", control: "select", options: ["auth", "utility", "auth+utility"] },
    { name: "expandAllOn", type: "string (pathname)", default: "undefined", control: "text" },
    { name: "layoutType", type: "'A' | 'B' | 'C' | 'D'", default: "'A'", control: "select", options: ["A", "B", "C", "D"] },
    { name: "sidebarHeader", type: "ReactNode (layout C sidebar header)", default: "brand", control: "none" },
    { name: "sidebarFooter", type: "ReactNode", default: null, control: "none" },
    { name: "header", type: "ReactNode", default: null, control: "none" },
    { name: "children", type: "ReactNode", default: "Outlet", control: "none" },
  ],
}
