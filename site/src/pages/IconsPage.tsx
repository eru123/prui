import * as React from "react"
import { Input } from "prui/core"

/**
 * /icons — the lucide icon catalog. lucide-react ships with the package, so
 * every icon here is one import away. Click a tile to copy its import line.
 */

const kebab = (name: string) =>
  name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/([A-Z])([A-Z][a-z])/g, "$1-$2").toLowerCase()

export function IconsPage() {
  const [ready, setReady] = React.useState(() => !!globalThis.__lucideIcons)
  const [query, setQuery] = React.useState("")
  const all = React.useMemo(
    () =>
      (ready ? globalThis.__lucideIcons : undefined) ?? {}
    , [ready])

  const catalog = React.useMemo(
    () =>
      Object.entries(all)
        .filter(([name]) => !name.endsWith("Icon") && !name.startsWith("Lucide") && name !== "default")
        .map(([name, component]) => ({
          name,
          component: component as React.ComponentType<{ className?: string }>,
          kebab: kebab(name),
        })),
    [all],
  )
  const [copied, setCopied] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    // deep path: the root module would drag the whole catalog into the
    // static graph; this file only loads inside the lazy icons page
    // @ts-ignore -- deep module ships without its own declaration file
    void import("lucide-react/dist/esm/icons/index.js").then((mod) => {
      if (cancelled) return
      // the deep module exports each icon by name (plus a default)
      globalThis.__lucideIcons = mod as unknown as Record<string, React.ComponentType<{ className?: string }>>
      setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return catalog
    return catalog.filter((i) => i.kebab.includes(q) || i.name.toLowerCase().includes(q))
  }, [query, catalog])

  const copy = async (name: string) => {
    try {
      await navigator.clipboard.writeText(`import { ${name} } from 'lucide-react'`)
      setCopied(name)
      setTimeout(() => setCopied((c) => (c === name ? null : c)), 1200)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1080px] px-4 pb-20 pt-8 md:px-6">
      <div className="mb-2 font-mono text-xs text-[var(--prui-dim)]">appearance / icons</div>
      <h1 className="mb-1.5 text-[27px] font-bold tracking-tight text-[var(--prui-fg)]">Icons</h1>
      <p className="mb-5 max-w-[62ch] text-[15px] text-[var(--prui-dim)]">
        Every lucide-react icon, ready to import. Click a tile to copy its import line.
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search icons..."
          aria-label="Search icons"
          className="h-9 w-64"
        />
        <span className="font-mono text-xs text-[var(--prui-dim)]" data-testid="icon-count">
          {filtered.length}{ready ? ` / ${catalog.length}` : ""}
        </span>
        {copied ? (
          <span className="font-mono text-xs text-[var(--prui-ok)]" role="status">
            copied {copied}
          </span>
        ) : null}
      </div>

      {!ready ? (
        <p className="text-sm text-[var(--prui-dim)]">Loading the icon catalog…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-[var(--prui-dim)]">No icons match "{query}".</p>
      ) : (
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(104px, 1fr))" }}
          data-testid="icon-grid"
        >
          {filtered.map(({ name, component: Icon, kebab: k }) => (
            <button
              key={name}
              type="button"
              onClick={() => copy(name)}
              title={`import { ${name} } from 'lucide-react'`}
              className="group flex cursor-pointer flex-col items-center gap-1.5 rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-surface)] px-2 py-3 hover:border-[var(--prui-brand)]"
            >
              <Icon className="h-5 w-5 text-[var(--prui-fg)] group-hover:text-[var(--prui-brand)]" />
              <span className="w-full truncate text-center font-mono text-[10px] text-[var(--prui-dim)] group-hover:text-[var(--prui-fg)]">
                {k}
              </span>
              {copied === name ? (
                <span className="font-mono text-[9px] text-[var(--prui-ok)]">copied</span>
              ) : null}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
