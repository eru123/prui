import { Card, CardHeader, CardTitle, CardDescription, Badge } from "prui/core"

/**
 * AC-9: each shared component from the four source apps traces to a prui
 * export. Internal-only page (not in the public nav).
 */

const TRACE = [
  { src: "HRLabs/icanhelp/jianpms button.tsx", prui: "prui/core → Button", note: "icanhelp superset + HRLabs asChild; variants unified (primary/default/ghost/danger)" },
  { src: "all four — input/label/textarea", prui: "prui/core → Input, Textarea, Label", note: "identical files three times over" },
  { src: "jianpms packages/ui (radix wrappers)", prui: "prui/core → Select, Switch, Tabs, Dialog", note: "radix-free reimplementation with same composable part API" },
  { src: "icanhelp data-table*.tsx (8 files)", prui: "prui/data-table → DataTable, Toolbar, Faceted/DateRange/NumberRange filters, Pagination", note: "filters become column-config type names feeding <Resource>" },
  { src: "HRLabs DataTable.tsx", prui: "prui/data-table → DataTable", note: "sorting model unified with icanhelp cursor pagination" },
  { src: "HRLabs sidebar.tsx + layout.tsx, icanhelp sidebar.tsx", prui: "prui/app → App", note: "NavGroup pattern + branding config + body-scroll lock folded into one declarative config" },
  { src: "icanhelp header.tsx", prui: "prui/app → App (sticky header, theme toggle)", note: "" },
  { src: "t4xlabs theming layer", prui: "prui/theme → tokens, named themes, applyTheme()", note: "multi-theme mechanism generalized" },
  { src: "HRLabs OTPModal, SessionTimeout", prui: "prui/pages → OtpPage; session-timeout pending extraction", note: "OTP modal became a full page component" },
  { src: "icanhelp stat-card.tsx, SettingsSidebar.tsx", prui: "prui/app → StatRow, Settings", note: "" },
  { src: "icanhelp avatar/badge/card/separator/scroll-area", prui: "prui/core → Avatar, Badge, Card, Separator, ScrollArea", note: "byte-identical copies" },
  { src: "jianpms packages/ui package shape", prui: "packages/prui (exports map, workspace)", note: "proves the package shape" },
]

export function ProvenancePage() {
  return (
    <div className="mx-auto w-full max-w-[780px] px-4 pb-20 pt-8 md:px-6">
      <div className="mb-2 flex items-center gap-2 font-mono text-xs text-[var(--prui-dim)]">
        internal / provenance <Badge variant="warn">internal-only</Badge>
      </div>
      <h1 className="mb-1.5 text-[27px] font-bold tracking-tight text-[var(--prui-fg)]">Where it comes from</h1>
      <p className="mb-8 max-w-[60ch] text-[15px] text-[var(--prui-dim)]">
        Every shared component from the four source apps traces to a prui export (AC-9).
      </p>
      <div className="flex flex-col gap-3">
        {TRACE.map((t) => (
          <Card key={t.src}>
            <CardHeader>
              <CardTitle className="font-mono text-xs text-[var(--prui-dim)]">{t.src}</CardTitle>
              <CardDescription>
                → <span className="font-mono text-[var(--prui-brand)]">{t.prui}</span>
                {t.note ? <span className="block pt-1">{t.note}</span> : null}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
