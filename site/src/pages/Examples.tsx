import { Button, Badge } from "prui/core"
import { ExternalLink, Github, LayoutDashboard, LifeBuoy, Settings } from "lucide-react"

/**
 * Examples catalog. Each example is an independent React project under
 * examples/<name> that installs @skiddph/prui@latest from npm (never the
 * workspace copy), deployed to <name>-prui.skiddph.com. The screenshots are
 * captured from the live deployments into public/examples/.
 */

const REPO = "https://github.com/eru123/prui"

const EXAMPLES = [
  {
    name: "dashboard",
    title: "Northwind dashboard",
    layout: "A · full-height sidebar",
    icon: LayoutDashboard,
    blurb:
      "Layout A with StatRow cards and a full CRUD Resource over in-memory data: search, faceted status filter, salary range, hired date range, sort, pagination, create, edit, delete.",
  },
  {
    name: "helpdesk",
    title: "Support helpdesk",
    layout: "B · full-width header",
    icon: LifeBuoy,
    blurb:
      "Layout B in a real tool: a tickets resource with priority and customer facets, daterange on opened, toast confirmations on resolve and delete, and header actions firing toasts.",
  },
  {
    name: "settings",
    title: "Workspace settings",
    layout: "C · header + sidebar header",
    icon: Settings,
    blurb:
      "Layout C with the sidebar header row as a workspace switcher. Tabs over FormField-slotted fields: labeled inputs, select, switch, admin TagInput (chips show names, values keep Name <email>), and an InputGroup budget field.",
  },
] as const

export function ExamplesPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1080px] justify-center gap-6 px-4 pb-20 pt-8 md:px-6">
      <div className="min-w-0 max-w-[860px] flex-1">
        <div className="mb-2 font-mono text-xs text-[var(--prui-dim)]">appearance / examples</div>
        <h1 className="mb-1.5 text-[27px] font-bold tracking-tight text-[var(--prui-fg)]">Examples</h1>
        <p className="mb-8 max-w-[62ch] text-[15px] text-[var(--prui-dim)]">
          Independent React projects living in{" "}
          <code className="rounded bg-[var(--prui-raise)] px-1">examples/</code> at the repo root. Each installs{" "}
          <code className="rounded bg-[var(--prui-raise)] px-1">@skiddph/prui@latest</code> from npm — never the
          workspace copy — so they exercise exactly what you install. Every card links to its live deployment and to
          the source tree on GitHub.
        </p>

        <div className="grid gap-5 sm:grid-cols-2">
          {EXAMPLES.map((ex) => (
            <article key={ex.name} className="overflow-hidden rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-surface)]">
              <a href={`https://${ex.name}-prui.skiddph.com`} target="_blank" rel="noreferrer" className="block border-b border-[var(--prui-line)]">
                <img
                  src={`/examples/${ex.name}.png`}
                  alt={`${ex.title} example screenshot`}
                  width={1440}
                  height={900}
                  loading="lazy"
                  className="block w-full bg-[var(--prui-background)]"
                />
              </a>
              <div className="flex flex-col gap-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <ex.icon className="h-4 w-4 shrink-0 text-[var(--prui-brand)]" aria-hidden />
                    <span className="truncate font-semibold text-[var(--prui-fg)]">{ex.title}</span>
                  </div>
                  <Badge variant="brand">{ex.layout}</Badge>
                </div>
                <p className="text-xs leading-relaxed text-[var(--prui-dim)]">{ex.blurb}</p>
                <div className="mt-1 flex items-center gap-2">
                  <a href={`https://${ex.name}-prui.skiddph.com`} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="primary">
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden /> Demo
                    </Button>
                  </a>
                  <a href={`${REPO}/tree/main/examples/${ex.name}`} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="default">
                      <Github className="h-3.5 w-3.5" aria-hidden /> Code
                    </Button>
                  </a>
                  <span className="ml-auto font-mono text-[10px] text-[var(--prui-dim)]">
                    {ex.name}-prui.skiddph.com
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-8 text-sm text-[var(--prui-dim)]">
          To run one locally:{" "}
          <code className="rounded bg-[var(--prui-raise)] px-1 py-0.5 font-mono text-xs">
            cd examples/{EXAMPLES[0].name} &amp;&amp; npm install &amp;&amp; npm run dev
          </code>{" "}
          — every example is a plain Vite project with no workspace links.
        </p>
      </div>
    </div>
  )
}
