import * as React from "react"
import { Link, useParams } from "react-router-dom"
import { Button, Badge } from "prui/core"
import { CodeView, languageForFile } from "../../components/CodeView"
import { LayoutComposition } from "./compose"
import { LAYOUTS } from "./layouts-data"

/**
 * /layouts: catalog. Each card carries a real screenshot of the running
 * layout plus two ways in: a full-view demo, and the code in a read-only
 * file-tree editor.
 */

export function LayoutsCatalogPage() {
  return (
    <div className="mx-auto w-full max-w-[1080px] px-4 pb-20 pt-8 md:px-6">
      <div className="mb-2 font-mono text-xs text-[var(--prui-dim)]">layouts / catalog</div>
      <h1 className="mb-1.5 text-[27px] font-bold tracking-tight text-[var(--prui-fg)]">Layouts</h1>
      <p className="mb-8 max-w-[60ch] text-[15px] text-[var(--prui-dim)]">
        Full pages assembled from prui parts. Open one to see it running, or read its code file by file.
      </p>

      <div className="grid gap-5 md:grid-cols-2">
        {LAYOUTS.map((l) => (
          <article key={l.slug} className="overflow-hidden rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-surface)]" data-testid={`layout-card-${l.slug}`}>
            <Link to={`/layouts/${l.slug}`} className="block border-b border-[var(--prui-line)]" aria-label={`Open the ${l.name} layout demo`}>
              <img
                src={`/layouts/${l.slug}.png`}
                alt={`${l.name} layout screenshot`}
                className="h-44 w-full object-cover object-top"
                loading="lazy"
              />
            </Link>
            <div className="flex flex-col gap-3 p-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-[var(--prui-fg)]">{l.name}</h2>
                <Badge variant="default">{l.files.length} files</Badge>
              </div>
              <p className="text-sm text-[var(--prui-dim)]">{l.blurb}</p>
              <div className="flex gap-2">
                <Button size="sm">
                  <Link to={`/layouts/${l.slug}`}>Demo</Link>
                </Button>
                <Button variant="default" size="sm">
                  <Link to={`/layouts/${l.slug}/code`}>Code</Link>
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export function LayoutDemoPage() {
  const { slug } = useParams()
  const def = LAYOUTS.find((l) => l.slug === slug)
  if (!def) {
    return (
      <div className="mx-auto w-full max-w-[780px] px-4 pb-20 pt-8">
        <p className="text-sm text-[var(--prui-dim)]">That layout does not exist. Back to the <Link className="text-[var(--prui-brand)] hover:underline" to="/layouts">catalog</Link>.</p>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-4 px-4 pb-6 pt-4 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Link to="/layouts" className="font-mono text-xs text-[var(--prui-dim)] hover:text-[var(--prui-fg)]">layouts</Link>
          <span className="font-mono text-xs text-[var(--prui-line)]">/</span>
          <span className="font-mono text-xs text-[var(--prui-fg)]">{def.name.toLowerCase()}</span>
        </div>
        <Button variant="default" size="sm">
          <Link to={`/layouts/${def.slug}/code`}>View code</Link>
        </Button>
      </div>
      <div className="overflow-hidden rounded-[var(--prui-radius)] border border-[var(--prui-line)]">
        <LayoutComposition slug={def.slug} />
      </div>
    </div>
  )
}

export function LayoutCodePage() {
  const { slug } = useParams()
  const def = LAYOUTS.find((l) => l.slug === slug)
  const [active, setActive] = React.useState(def?.entry ?? def?.files[0]?.path ?? "")
  if (!def) {
    return (
      <div className="mx-auto w-full max-w-[780px] px-4 pb-20 pt-8">
        <p className="text-sm text-[var(--prui-dim)]">That layout does not exist. Back to the <Link className="text-[var(--prui-brand)] hover:underline" to="/layouts">catalog</Link>.</p>
      </div>
    )
  }
  const activeFile = def.files.find((f) => f.path === active) ?? def.files[0]!

  // group files into folders for the tree
  const folders = new Map<string, string[]>()
  for (const f of def.files) {
    const i = f.path.lastIndexOf("/")
    const dir = i === -1 ? "." : f.path.slice(0, i)
    if (!folders.has(dir)) folders.set(dir, [])
    folders.get(dir)!.push(f.path)
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-6 pt-4 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Link to="/layouts" className="font-mono text-xs text-[var(--prui-dim)] hover:text-[var(--prui-fg)]">layouts</Link>
          <span className="font-mono text-xs text-[var(--prui-line)]">/</span>
          <span className="font-mono text-xs text-[var(--prui-fg)]">{def.name.toLowerCase()} / code</span>
        </div>
        <Button variant="default" size="sm">
          <Link to={`/layouts/${def.slug}`}>Open demo</Link>
        </Button>
      </div>

      <div className="flex min-h-[70vh] overflow-hidden rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-surface)]">
        <nav aria-label="Files" className="w-60 shrink-0 overflow-y-auto border-r border-[var(--prui-line)] p-2">
          <div className="px-2 pb-2 pt-1 font-mono text-[10px] uppercase tracking-widest text-[var(--prui-dim)]">
            {def.name.toLowerCase()}-app
          </div>
          {[...folders.entries()].map(([dir, files]) => (
            <div key={dir} className="mb-1">
              <div className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-[var(--prui-dim)]">
                <span aria-hidden>▸</span> {dir === "." ? "root" : dir}
              </div>
              <ul>
                {files.map((path) => (
                  <li key={path}>
                    <button
                      type="button"
                      onClick={() => setActive(path)}
                      aria-current={active === path ? "true" : undefined}
                      className={
                        "block w-full cursor-pointer truncate rounded px-2 py-1 pl-6 text-left font-mono text-xs " +
                        (active === path
                          ? "bg-[var(--prui-brand)]/15 text-[var(--prui-brand)]"
                          : "text-[var(--prui-dim)] hover:bg-[var(--prui-raise)] hover:text-[var(--prui-fg)]")
                      }
                    >
                      {path.slice(path.lastIndexOf("/") + 1)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="min-w-0 flex-1">
          <CodeView
            code={activeFile.code}
            title={activeFile.path}
            language={languageForFile(activeFile.path)}
            readOnly
            height="auto"
            className="h-full overflow-hidden rounded-none border-0"
          />
        </div>
      </div>
    </div>
  )
}
