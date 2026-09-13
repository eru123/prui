import { useState, lazy, Suspense } from "react"
import { Link } from "react-router-dom"
import { Button, Badge } from "prui/core"
// The install terminal's copy affordance streams in its own chunk: it keeps
// the landing bundle at the AC-6 budget. The fallback keeps the row height.
const LazyCopyButton = lazy(() => import("../components/CopyButton").then((m) => ({ default: m.CopyButton })))

// The feedback demo (alert, progress, spinner, toast) streams in its own
// chunk: it carries six lucide icons that would otherwise bloat the landing
// bundle (AC-6). The placeholder matches the box shape, so no layout shift.
const LandingFeedback = lazy(() => import("./LandingFeedback").then((m) => ({ default: m.LandingFeedback })))
const LandingShowcase = lazy(() => import("./LandingShowcase").then((m) => ({ default: m.LandingShowcase })))

export function LandingPage() {
  const [saved, setSaved] = useState(false)

  return (
    <div className="mx-auto w-full max-w-[860px] px-4 pb-20 pt-10 md:px-6">
      <h1 className="text-[clamp(28px,3.6vw,40px)] font-bold leading-[1.15] tracking-tight text-[var(--prui-fg)]">
        Ship your interface once. <span className="text-[var(--prui-brand)]">Update it everywhere.</span>
      </h1>
      <p className="mt-4 max-w-[54ch] text-base text-[var(--prui-dim)]">
        PRUI is a React component system you install as a dependency: app shells, data tables, forms, and theming,
        versioned and maintained in one place. Stop copying button fixes between projects. Bump a version, get the
        improvements.
      </p>
      <div className="mt-7 mb-10 flex flex-wrap gap-2.5">
        <Link to="/guides"><Button variant="primary">Get started</Button></Link>
        <Link to="/components"><Button variant="default">Browse components</Button></Link>
        <a href="#install"><Button variant="default">pnpm add @skiddph/prui</Button></a>
      </div>

      {/* live showcase grid */}
      <div className="mb-6 grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-3">
        <div className="rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-surface)] p-4">
          <div className="mb-3 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[var(--prui-dim)]">buttons</div>
          <div className="flex min-h-9 flex-wrap items-center gap-2.5">
            <Button variant="primary" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 1200) }}>
              {saved ? "Saved" : "Save changes"}
            </Button>
            <Button variant="ghost">Cancel</Button>
            <Button variant="danger">Delete</Button>
          </div>
        </div>
        <Suspense
          fallback={
            <>
              <div className="rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-surface)] p-4" aria-hidden>
                <div className="mb-3 h-3 w-14 animate-pulse rounded bg-[var(--prui-raise)]" />
                <div className="h-8 w-44 animate-pulse rounded-[var(--prui-radius)] bg-[var(--prui-raise)]" />
              </div>
              <div className="rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-surface)] p-4" aria-hidden>
                <div className="mb-3 h-3 w-16 animate-pulse rounded bg-[var(--prui-raise)]" />
                <div className="h-14 w-56 animate-pulse rounded-[var(--prui-radius)] bg-[var(--prui-raise)]" />
              </div>
            </>
          }
        >
          <LandingShowcase />
        </Suspense>
        <div className="rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-surface)] p-4">
          <div className="mb-3 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[var(--prui-dim)]">feedback</div>
          <Suspense
            fallback={
              <div className="flex min-h-[136px] flex-col justify-center gap-2.5" aria-hidden>
                <div className="h-9 animate-pulse rounded-[var(--prui-radius)] bg-[var(--prui-raise)]" />
                <div className="h-1.5 animate-pulse rounded-full bg-[var(--prui-raise)]" />
                <div className="h-7 w-40 animate-pulse rounded-[var(--prui-radius)] bg-[var(--prui-raise)]" />
              </div>
            }
          >
            <LandingFeedback />
          </Suspense>
        </div>
      </div>

      {/* live data table panel */}
      <div className="mb-6 overflow-hidden rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-surface)]">
        <div className="flex items-center justify-between border-b border-[var(--prui-line)] px-4 py-3 font-mono text-[11px] text-[var(--prui-dim)]">
          <span>data-table / live demo</span>
          <span>seeded data</span>
        </div>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left">
              {["Component", "Origin", "Status", "Version"].map((h) => (
                <th key={h} className="border-b border-[var(--prui-line)] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--prui-dim)]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["App", "Sidebar, header, content", "stable", "0.1.0"],
              ["Resource", "Filters, pagination, toolbar", "stable", "0.1.0"],
              ["Theme system", "Tokens, light and dark", "new", "0.1.0"],
            ].map(([c, o, s, v]) => (
              <tr key={c} className="border-b border-[var(--prui-line)] last:border-0 hover:bg-[var(--prui-raise)]">
                <td className="px-4 py-2.5 text-[var(--prui-fg)]">{c}</td>
                <td className="px-4 py-2.5 text-[var(--prui-dim)]">{o}</td>
                <td className="px-4 py-2.5"><Badge variant={s === "stable" ? "ok" : s === "new" ? "brand" : "warn"}>{s}</Badge></td>
                <td className="px-4 py-2.5 font-mono text-xs text-[var(--prui-dim)]">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* install terminal */}
      <div id="install" className="overflow-hidden rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-surface)]">
        <div className="flex items-center justify-between border-b border-[var(--prui-line)] px-4 py-3 font-mono text-[11px] text-[var(--prui-dim)]">
          <span>install</span>
          <span>one dependency</span>
        </div>
        <div className="p-4">
          <div className="overflow-hidden rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-background)]">
            <div className="flex items-center gap-1.5 border-b border-[var(--prui-line)] bg-[var(--prui-surface)] px-3 py-2">
              <i className="h-2.5 w-2.5 rounded-full bg-[var(--prui-line)]" /><i className="h-2.5 w-2.5 rounded-full bg-[var(--prui-line)]" /><i className="h-2.5 w-2.5 rounded-full bg-[var(--prui-line)]" />
              <span className="ml-2 font-mono text-[10.5px] text-[var(--prui-dim)]">terminal</span>
              <span className="ml-auto">
                <Suspense fallback={<span className="px-2 py-0.5 font-mono text-[10px] text-[var(--prui-dim)]">copy</span>}>
                  <LazyCopyButton text={"pnpm add @skiddph/prui\n\nimport '@skiddph/prui/styles.css'\nimport { App } from '@skiddph/prui/app'"} />
                </Suspense>
              </span>
            </div>
            <pre className="overflow-x-auto px-4 py-4 font-mono text-[12.5px] leading-7 text-[var(--prui-fg)]">
{`# install
pnpm add @skiddph/prui

# wire the shell and theme
import '@skiddph/prui/styles.css'
import { App } from '@skiddph/prui/app'`}
            </pre>
          </div>
          <p className="mt-3.5 text-[13px] text-[var(--prui-dim)]">
            Three lines and your app has the shell, the theme, and every primitive.{" "}
            <Link to="/guides" className="text-[var(--prui-brand)] hover:underline">Full installation guide</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
