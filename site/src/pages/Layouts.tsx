import { Card, CardHeader, CardTitle, CardDescription, Button, Badge } from "prui/core"
import { StatRow, Settings } from "prui/app"
import { LoginPage } from "prui/pages"  // part of the lazy Layouts chunk
import { Link } from "react-router-dom"
import { Users, DollarSign, CalendarCheck } from "lucide-react"

function Demo({ id, title, desc, children }: { id: string; title: string; desc: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-10 scroll-mt-20">
      <h2 className="mb-1 text-base font-semibold text-[var(--prui-fg)]">{title}</h2>
      <p className="mb-4 max-w-[60ch] text-sm text-[var(--prui-dim)]">{desc}</p>
      <div className="overflow-hidden rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-surface)] p-4">{children}</div>
    </section>
  )
}

export function LayoutsPage() {
  return (
    <div className="mx-auto w-full max-w-[780px] px-4 pb-20 pt-8 md:px-6">
      <div className="mb-2 font-mono text-xs text-[var(--prui-dim)]">layouts / full-page demos</div>
      <h1 className="mb-1.5 text-[27px] font-bold tracking-tight text-[var(--prui-fg)]">Layouts</h1>
      <p className="mb-8 max-w-[60ch] text-[15px] text-[var(--prui-dim)]">
        The screens every admin app starts with, composed from PRUI parts.
      </p>

      <Demo id="dashboard" title="Dashboard" desc="StatRow KPI cards plus panel cards.">
        <StatRow
          className="mb-4"
          items={[
            { label: "Headcount", value: 42, delta: "+2", trend: "up", icon: Users },
            { label: "Payroll (k)", value: 512, icon: DollarSign },
            { label: "On leave", value: 5, icon: CalendarCheck },
          ]}
        />
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Latest changes across the workspace</CardDescription>
          </CardHeader>
        </Card>
      </Demo>

      <Demo id="listing" title="Listing" desc="Toolbar + DataTable + pagination. Full live version on the Resources page.">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--prui-dim)]">See the live demo</p>
          <Link to="/resources"><Button variant="default" size="sm">Open Resources demo</Button></Link>
        </div>
      </Demo>

      <Demo id="settings" title="Settings" desc="Two-column settings from a section list.">
        <Settings
          title="Workspace"
          sections={[
            {
              id: "general",
              title: "General",
              description: "Workspace basics",
              fields: [
                { label: "Workspace name", description: "Shown everywhere", control: <Badge variant="outline">HRLabs</Badge> },
                { label: "Default theme", description: "Applied to new users", control: <Badge variant="brand">control</Badge> },
              ],
            },
          ]}
        />
      </Demo>

      <Demo id="auth" title="Auth" desc="Pre-made LoginPage with per-field show/hide — fields={{ remember: true }} adds the checkbox.">
        <div className="overflow-hidden rounded-[var(--prui-radius)] border border-[var(--prui-line)]" style={{ maxHeight: 480 }}>
          <div style={{ zoom: 0.75 } as React.CSSProperties}>
            <LoginPage fields={{ remember: true }} brand={{ name: "HRLabs" }} />
          </div>
        </div>
      </Demo>
    </div>
  )
}
