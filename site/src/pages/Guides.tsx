import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from "prui/core"
import { CodeView } from "../components/CodeView"
import { TocRail } from "../components/TocRail"

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-10 scroll-mt-20">
      <h2 className="mb-3 text-base font-semibold text-[var(--prui-fg)]">{title}</h2>
      <div className="prui-prose text-sm text-[var(--prui-dim)]">{children}</div>
    </section>
  )
}

const GUIDE_TOC = [
  { id: "install", label: "Installation" },
  { id: "adoption", label: "Progressive adoption" },
  { id: "pages", label: "Pre-made pages" },
]

const AGENT_TOC = [{ id: "agents", label: "Agent quickstart" }]

function Code({ children }: { children: string }) {
  return (
    <CodeView
      code={children}
      title="tsx"
      className="relative mb-4 mt-2 overflow-hidden rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-surface)]"
    />
  )
}

export function GuidesPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1080px] justify-center gap-6 px-4 pb-20 pt-8 md:px-6">
      <div className="min-w-0 max-w-[780px] flex-1">
        <div className="mb-2 font-mono text-xs text-[var(--prui-dim)]">guides / installation</div>
        <h1 className="mb-1.5 text-[27px] font-bold tracking-tight text-[var(--prui-fg)]">Guides</h1>

      <Section id="install" title="Installation">
        <p>react, react-dom, and react-router-dom arrive with the package. lucide-react is a peer, so add both:</p>
        <Code>{`pnpm add @skiddph/prui lucide-react

# main.tsx: theme tokens + shell
import '@skiddph/prui/styles.css'
import { App } from '@skiddph/prui/app'

<App brand={{ name: 'My App' }} nav={nav} theme={{ default: 'control' }}>
  {routes}
</App>`}</Code>
      </Section>

      <Section id="adoption" title="Progressive adoption">
        <p>Three rungs, mix freely:</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { t: "Super-components", d: "<App> + <Resource>. Minutes to a working admin.", b: "fastest" },
            { t: "Mix", d: "<App> shell, your own screens with prui/core primitives.", b: "balanced" },
            { t: "Primitives only", d: "Button, DataTable, theme, your own layout.", b: "incremental" },
          ].map((x) => (
            <Card key={x.t}>
              <CardHeader>
                <CardTitle className="text-sm">{x.t}</CardTitle>
                <CardDescription>{x.d}</CardDescription>
              </CardHeader>
              <CardContent><Badge variant="brand">{x.b}</Badge></CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="pages" title="Pre-made pages">
        <p>Auto-route the full auth set with one prop:</p>
        <Code>{`<App
  pages="auth"
  pagesConfig={{ login: { fields: { remember: true } } }}
  nav={nav}
>`}</Code>
        <p>Routes /login, /register, /forgot-password, /reset-password, /otp, /logout. Each page takes
          <code> onSubmit</code>, <code>fields</code> (per-field show/hide), <code>links</code>, <code>oauth</code>, <code>brand</code>.</p>
      </Section>
      </div>

      <TocRail items={GUIDE_TOC} />
    </div>
  )
}

export function AgentsPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1080px] justify-center gap-6 px-4 pb-20 pt-8 md:px-6">
      <div className="min-w-0 max-w-[780px] flex-1">
        <div id="agents" className="mb-2 scroll-mt-20 font-mono text-xs text-[var(--prui-dim)]">guides / agents</div>
      <h1 className="mb-1.5 text-[27px] font-bold tracking-tight text-[var(--prui-fg)]">Agent quickstart</h1>
      <p className="mb-8 max-w-[60ch] text-[15px] text-[var(--prui-dim)]">
        The whole PRUI vocabulary, packed as a skill folder in this repo. An agent with it builds a working admin app
        without reading these docs.
      </p>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>skill/ in the repo</CardTitle>
          <CardDescription>Point your agent at the checkout. No installation step.</CardDescription>
        </CardHeader>
        <CardContent>
          <Code>{`# from the repo root
skill/
  SKILL.md          # when to use, the fast path
  references/       # props tables, recipes, theming, adoption ladder`}</Code>
          <p className="text-sm text-[var(--prui-dim)]">
            Works with Hermes, Claude Code, or any agent that reads skill folders. The fast path:{" "}
            <code className="rounded bg-[var(--prui-raise)] px-1">&lt;App nav=&#123;...&#125;&gt;</code> +{" "}
            <code className="rounded bg-[var(--prui-raise)] px-1">&lt;Resource columns=&#123;...&#125;&gt;</code> + a dashboard page. That is the entire surface.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>The minutes-to-app flow</CardTitle>
          <CardDescription>What an agent following the skill produces</CardDescription>
        </CardHeader>
        <CardContent>
          <Code>{`import { App, Resource, StatRow } from '@skiddph/prui/app'

<App brand={{ name: 'Ops' }} nav={nav} pages="auth">
  <Resource name="employees" columns={cols} list={api.list}
            create={api.create} update={api.update} remove={api.remove} />
</App>`}</Code>
        </CardContent>
      </Card>
      </div>

      <TocRail items={AGENT_TOC} />
    </div>
  )
}
