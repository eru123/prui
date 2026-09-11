import * as React from "react"
import {
  BrowserRouter,
  MemoryRouter,
  Link,
  NavLink,
  useLocation,
  useNavigate,
  Outlet,
} from "react-router-dom"
import { ChevronDown, Menu, Search, X } from "lucide-react"
import { cn } from "../core/cn"
import { Dropdown } from "../core/dropdown"
import { Button } from "../core/button"
import { applyTheme, readPersistedTheme, PRUI_THEMES } from "../theme"
import type { AppliedTheme, ThemeName } from "../theme"
import type { PropsMeta } from "../core/props-meta"
import { AutoPages } from "./auto-pages"
import type { PageSetName } from "./auto-pages"

/**
 * <App> is the whole shell: responsive sidebar with collapsible nav groups and
 * mobile drawer plus scroll lock, sticky header with brand and theme switch,
 * built-in command palette on the "/" hotkey, and router wiring (BrowserRouter
 * by default, memory mode for embedded use).
 */

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
  default?: ThemeName
  persist?: boolean
}

export interface SidebarConfig {
  /** Width in px, default 240. */
  width?: number
  defaultOpen?: boolean
}

export type RouterMode = "browser" | "memory"

export interface AppProps {
  brand?: BrandConfig
  nav?: NavItem[]
  search?: boolean | SearchConfig
  theme?: boolean | ThemeConfig
  sidebar?: SidebarConfig
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
  children?: React.ReactNode
}

/* ---------------- theme toggle ---------------- */

export function useThemeState(config?: boolean | ThemeConfig) {
  const enabled = config !== false
  const cfg: ThemeConfig = typeof config === "object" ? config : {}
  const persist = cfg.persist !== false

  const [state, setState] = React.useState<AppliedTheme>(() => {
    const persisted = persist ? readPersistedTheme() : null
    return persisted ?? { theme: cfg.default ?? "control", mode: "dark" }
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
          data-testid="theme-toggle"
          className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--prui-radius)] text-[var(--prui-dim)] hover:bg-[var(--prui-raise)] hover:text-[var(--prui-fg)] cursor-pointer"
        >
          <span className="text-xs font-semibold uppercase">{state.theme.slice(0, 2)}</span>
        </button>
      }
      items={PRUI_THEMES.map((t) => ({
        label: `${t}${t === state.theme ? " (active)" : ""}`,
        onSelect: () => setTheme({ theme: t, mode: t === "daylight" ? "light" : "dark" }),
      }))}
    />
  )
}

/* ---------------- sidebar ---------------- */

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(href + "/")
}

function NavGroup({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const { pathname } = useLocation()
  const active = (item.items ?? []).some((child) =>
    child.href ? isActivePath(pathname, child.href) : (child.items ?? []).some((gc) => gc.href && isActivePath(pathname, gc.href)),
  )
  const [open, setOpen] = React.useState(active)

  React.useEffect(() => {
    if (active) setOpen(true)
  }, [active])

  const Icon = item.icon
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
        {Icon ? <Icon className="h-4 w-4 shrink-0" aria-hidden /> : null}
        <span className="flex-1 text-left truncate">{item.label}</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", !open && "-rotate-90")} aria-hidden />
      </button>
      {open ? (
        <ul className="ml-4 mt-0.5 flex flex-col gap-0.5 border-l border-[var(--prui-line)] pl-2">
          {(item.items ?? []).map((child) => (
            <NavItemLink key={child.href ?? child.label} item={child} onNavigate={onNavigate} nested />
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

function NavItemLink({ item, onNavigate, nested }: { item: NavItem; onNavigate?: () => void; nested?: boolean }) {
  if (item.items && item.items.length > 0) return <NavGroup item={item} onNavigate={onNavigate} />
  if (item.heading || (!item.href && !item.items)) return <NavSubgroupLabel label={item.label} />
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
        {item.icon && !nested ? <item.icon className="h-4 w-4 shrink-0" aria-hidden /> : null}
        <span className="truncate">{item.label}</span>
      </NavLink>
    </li>
  )
}

export function SidebarNav({ nav, onNavigate }: { nav: NavItem[]; onNavigate?: () => void }) {
  return (
    <nav aria-label="Main" className="prui-app-nav">
      <ul className="flex flex-col gap-0.5">
        {nav.map((item) => (
          <NavItemLink key={item.href ?? item.label} item={item} onNavigate={onNavigate} />
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
      <span className="truncate font-semibold text-[var(--prui-fg)]">{brand.name}</span>
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
    sidebar: sidebarCfg = {},
    header,
    pages,
    pagesConfig,
    children,
  } = props

  const searchCfg: SearchConfig = typeof search === "object" ? search : { enabled: search !== false }
  const searchEnabled = searchCfg.enabled !== false
  const hotkey = searchCfg.hotkey ?? "/"

  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [paletteOpen, setPaletteOpen] = React.useState(false)
  const location = useLocation()
  const navigate = useNavigate()

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

  // close the drawer on route change
  React.useEffect(() => {
    setDrawerOpen(false)
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

  return (
    <div className="prui-app flex min-h-screen bg-[var(--prui-background)] text-[var(--prui-fg)]">
      {/* desktop sidebar */}
      <aside
        data-testid="sidebar"
        className="hidden md:flex md:flex-col shrink-0 border-r border-[var(--prui-line)] bg-[var(--prui-surface)]"
        style={{ width }}
      >
        <div className="flex h-14 items-center border-b border-[var(--prui-line)] px-3">
          <BrandMark brand={brand} />
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <SidebarNav nav={nav} />
        </div>
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
            className="absolute left-0 top-0 h-full w-64 border-r border-[var(--prui-line)] bg-[var(--prui-surface)] p-2"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
          >
            <div className="mb-2 flex h-10 items-center justify-between px-1">
              <BrandMark brand={brand} />
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setDrawerOpen(false)}
                className="rounded-[var(--prui-radius)] p-1 text-[var(--prui-dim)] hover:text-[var(--prui-fg)] cursor-pointer"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <SidebarNav nav={nav} onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          data-testid="app-header"
          className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-[var(--prui-line)] bg-[var(--prui-surface)] px-3"
        >
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
          <div className="md:hidden">
            <BrandMark brand={brand} />
          </div>
          {searchEnabled ? (
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              data-testid="search-trigger"
              className="mx-auto hidden h-8 w-full max-w-sm items-center gap-2 rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-background)] px-3 text-sm text-[var(--prui-dim)] hover:border-[var(--prui-dim)] cursor-pointer md:flex"
            >
              <Search className="h-4 w-4" aria-hidden />
              <span className="flex-1 text-left">{searchCfg.placeholder ?? "Search..."}</span>
              <kbd className="rounded-[var(--prui-radius-1)] border border-[var(--prui-line)] px-1.5 py-0.5 text-xs">{hotkey}</kbd>
            </button>
          ) : null}
          <div className="ml-auto flex items-center gap-2">
            {header}
            <ThemeToggle config={theme} />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          {pages ? (
            <AutoPages mode={pages} config={pagesConfig}>
              {children}
            </AutoPages>
          ) : (
            (children ?? <Outlet />)
          )}
        </main>
      </div>

      {searchEnabled ? (
        <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} entries={paletteEntries} placeholder={searchCfg.placeholder} onNavigate={navigate} />
      ) : null}
    </div>
  )
}

export function App(props: AppProps) {
  const { router = "browser", initialEntries } = props
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
    { name: "theme", type: "boolean | { default?, persist? }", default: "true", control: "boolean" },
    { name: "sidebar", type: "{ width?, defaultOpen? }", default: "{}", control: "object" },
    { name: "router", type: "'browser' | 'memory'", default: "'browser'", control: "select", options: ["browser", "memory"] },
    { name: "initialEntries", type: "string[]", default: "undefined", control: "object" },
    { name: "header", type: "ReactNode", default: null, control: "none" },
    { name: "children", type: "ReactNode", default: "Outlet", control: "none" },
  ],
}
