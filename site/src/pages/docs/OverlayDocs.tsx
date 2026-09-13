import * as React from "react"
import { ComponentDoc, MetaOnly, Button, Drawer, Sheet, Checkbox } from "../../components/ComponentDoc"
import { drawerPropsMeta, sheetPropsMeta } from "prui/core"

export function DrawerDoc() {
  const [right, setRight] = React.useState(false)
  const [left, setLeft] = React.useState(false)
  return (
    <ComponentDoc
      name="Drawer"
      importPath="@skiddph/prui/core"
      description="A side-anchored modal panel for detail panes, filters, and task flows. Portaled, focus-trapped with focus restoration, scroll-locked, background inert, and topmost-only Escape; the full overlay contract."
      when={[
        "Row detail panes over a table (edit without losing context)",
        "Multi-field filters that affect a visible result set",
        "Task flows that benefit from a side stage (checklists, wizards)"
      ]}
      anatomy={
        <p>
          <code className="rounded bg-[var(--prui-raise)] px-1">&lt;Drawer open onOpenChange side size ariaLabel hideClose&gt;</code>:
          scrim + panel; <code>side</code> picks left/right/top/bottom, <code>size</code> sets width (sides) or max height
          (top/bottom).
        </p>
      }
      demos={[
        {
          title: "Right detail drawer",
          render: (
            <>
              <Button variant="primary" size="sm" onClick={() => setRight(true)}>Open drawer</Button>
              <Drawer open={right} onOpenChange={setRight} ariaLabel="Row details" side="right">
                <div className="p-6">
                  <h3 className="text-base font-semibold">Ada Lovelace</h3>
                  <p className="mt-1 text-sm text-[var(--prui-dim)]">Senior engineer · active · joined 2024</p>
                  <Button className="mt-4" onClick={() => setRight(false)}>Close</Button>
                </div>
              </Drawer>
            </>
          ),
          code: `<Drawer open={open} onOpenChange={setOpen} ariaLabel="Row details" side="right" size={480}>
  <RowDetail row={row} />
</Drawer>`,
        },
        {
          title: "Left nav-style drawer",
          render: (
            <>
              <Button size="sm" onClick={() => setLeft(true)}>Open left</Button>
              <Drawer open={left} onOpenChange={setLeft} ariaLabel="Layers" side="left" size={320}>
                <div className="p-6 text-sm text-[var(--prui-dim)]">Left drawers suit navigation and layer panels.</div>
              </Drawer>
            </>
          ),
          code: `<Drawer open={open} onOpenChange={setOpen} side="left" size={320} ariaLabel="Layers">
  <LayerPanel />
</Drawer>`,
        },
      ]}
      api={<MetaOnly meta={drawerPropsMeta} />}
      examples={[
        {
          title: "Table row detail",
          code: `<DataTable
  rows={rows}
  onRowClick={(row) => { setEditing(row); setDrawerOpen(true) }}
/>
<Drawer open={drawerOpen} onOpenChange={setDrawerOpen} ariaLabel="Row details">
  <EditRow row={editing} onSaved={refetch} />
</Drawer>`,
        },
      ]}
      dos={["Prefer a drawer over a dialog when the background list must stay visible", "Give the panel an ariaLabel naming its purpose"]
      }
      donts={["Don't stack a drawer over a dialog for the same task; pick one", "Don't put the primary close affordance only in the scrim"]}
      accessibility={
        <ul className="list-disc pl-5">
          <li>role=dialog aria-modal with an accessible name; Tab/Shift+Tab cycle inside.</li>
          <li>Initial focus lands on the first control; Escape (topmost) closes and restores focus to the invoker.</li>
          <li>Background is aria-hidden + inert; body scroll locks; slides stop under reduced motion.</li>
        </ul>
      }
      composition={<p>Compose anything inside; forms, tabs, TreeView explorers. size accepts px numbers or any CSS length string.</p>}
      customization={<p>Panel surface/shadow are tokens; the scrim is --prui-scrim. Side is directional by design (mirror manually for RTL).</p>}
      edgeCases={[
        "Nested drawers stack correctly; only the topmost answers Escape",
        "hideClose removes the X; provide your own visible close action then",
      ]}
      mistakes={["Controlled open without onOpenChange (Escape closes nothing)", "Scrollable page content taller than the panel without inner overflow"]}
      performance={<p>Mounts only while open (plus the exit animation window).</p>}
      crossLinks={[
        { label: "Sheet; the bottom preset", href: "/components/sheet" },
        { label: "Dialog; centered modals", href: "/components/dialog" },
      ]}
    />
  )
}

export function SheetDoc() {
  const [open, setOpen] = React.useState(false)
  const [filters, setFilters] = React.useState(true)
  return (
    <ComponentDoc
      name="Sheet"
      importPath="@skiddph/prui/core"
      description="The bottom-anchored Drawer preset: a mobile-first surface with a drag-handle affordance, the same modal guarantees (trap, restore, inert background, topmost Escape), and a max height sized by size."
      when={[
        "Mobile filter sheets over result lists",
        "Quick actions and confirmations on small screens",
        "Bottom-anchored detail popovers (map cards, player panels)"
      ]}
      anatomy={
        <p>
          <code className="rounded bg-[var(--prui-raise)] px-1">&lt;Sheet open onOpenChange ariaLabel size&gt;</code>; identical
          API to Drawer with side fixed to bottom; size caps the height (default 80vh).
        </p>
      }
      demos={[
        {
          title: "Filter sheet",
          render: (
            <>
              <Button size="sm" onClick={() => setOpen(true)}>Open sheet</Button>
              <Sheet open={open} onOpenChange={setOpen} ariaLabel="Filters">
                <div className="p-6">
                  <div className="mb-3 text-base font-semibold">Filters</div>
                  <div className="flex flex-col gap-2">
                    <Checkbox label="Active only" checked={filters} onChange={setFilters} />
                    <Checkbox label="Has salary" />
                  </div>
                  <Button variant="primary" className="mt-4 w-full" onClick={() => setOpen(false)}>Apply</Button>
                </div>
              </Sheet>
            </>
          ),
          code: `<Sheet open={open} onOpenChange={setOpen} ariaLabel="Filters">
  <Checkbox label="Active only" checked={active} onChange={setActive} />
  <Button variant="primary" className="mt-4 w-full" onClick={() => setOpen(false)}>
    Apply
  </Button>
</Sheet>`,
        },
      ]}
      api={<MetaOnly meta={sheetPropsMeta} />}
      examples={[
        {
          title: "Responsive sheet / drawer pair",
          code: `// one component, two presentations
<Media atLeast="md">
  <Drawer open side="right" ariaLabel="Filters"><FilterForm /></Drawer>
</Media>
<Media below="md">
  <Sheet open ariaLabel="Filters"><FilterForm /></Sheet>
</Media>`,
        },
      ]}
      dos={["Keep primary actions within thumb reach (bottom of the sheet)", "Cap content height via size and let the panel scroll internally"]}
      donts={["Don't use for desktop-first layouts. Drawer reads better there"]}
      accessibility={
        <ul className="list-disc pl-5">
          <li>Same contract as Drawer: dialog semantics, focus trap and restoration, inert background, topmost Escape.</li>
          <li>The drag handle is decorative (aria-hidden); closing is via Escape, the X, or your apply/close button.</li>
        </ul>
      }
      composition={<p>Anything you put in a Drawer works here; size as any CSS length (default 80vh).</p>}
      customization={<p>Token surface + scrim; the handle is --prui-line. Full-width by design.</p>}
      edgeCases={["Content shorter than the cap shrinks the sheet", "size applies as max-height on bottom sheets"]}
      mistakes={["Relying on the handle for drag-to-dismiss (not implemented; provide close affordances)"]}
      performance={<p>Identical to Drawer; mounts only while open.</p>}
      crossLinks={[
        { label: "Drawer; side panels", href: "/components/drawer" },
        { label: "Dialog; centered modals", href: "/components/dialog" },
      ]}
    />
  )
}
