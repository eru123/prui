import * as React from "react"
import { Input, Badge, Tabs, TabsList, TabsTrigger, TabsContent, Switch } from "prui/core"

/**
 * The inputs and controls showcase boxes stream in their own chunk: Input
 * (with the FormField slot system), Tabs, Switch, and Badge are a few KB the
 * landing budget (AC-6) cannot carry upfront. The landing renders same-shaped
 * pulse placeholders while this loads.
 */
export function LandingShowcase() {
  const [sw, setSw] = React.useState(true)
  return (
    <>
      <div className="rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-surface)] p-4">
        <div className="mb-3 text-micro font-semibold uppercase tracking-widest text-[var(--prui-dim)]">inputs</div>
        <div className="flex min-h-9 flex-wrap items-center gap-2.5">
          <Input placeholder="Search employees" className="h-8 w-44" />
          <Badge variant="brand">stable</Badge>
          <Badge variant="ok">new</Badge>
        </div>
      </div>
      <div className="rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-surface)] p-4">
        <div className="mb-3 text-micro font-semibold uppercase tracking-widest text-[var(--prui-dim)]">controls</div>
        <div className="flex min-h-9 flex-wrap items-center gap-3">
          <Tabs defaultValue="details">
            <TabsList className="h-8">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <div className="mt-2 flex flex-col gap-1 text-xs text-[var(--prui-dim)]">
                <span>Ada Lovelace · Senior engineer</span>
                <span>Joined 2024 · active</span>
              </div>
            </TabsContent>
            <TabsContent value="activity">
              <div className="mt-2 text-xs text-[var(--prui-dim)]">Recent activity appears here.</div>
            </TabsContent>
          </Tabs>
          <Switch checked={sw} onChange={setSw} aria-label="Demo switch" />
        </div>
      </div>
    </>
  )
}
