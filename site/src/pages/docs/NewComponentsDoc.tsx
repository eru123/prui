import * as React from "react"
import { Link } from "react-router-dom"
import {
  Alert,
  Progress,
  Skeleton,
  Spinner,
  Toaster,
  toast,
  toastPropsMeta,
  alertPropsMeta,
  progressPropsMeta,
  skeletonPropsMeta,
  spinnerPropsMeta,
  Tooltip,
  tooltipPropsMeta,
  Popover,
  popoverPropsMeta,
  Checkbox,
  checkboxPropsMeta,
  RadioGroup,
  Radio,
  radioGroupPropsMeta,
  Combobox,
  comboboxPropsMeta,
  FileUpload,
  fileUploadPropsMeta,
  Accordion,
  AccordionItem,
  accordionPropsMeta,
  Breadcrumb,
  BreadcrumbItem,
  breadcrumbPropsMeta,
  TreeView,
  treeViewPropsMeta,
  Timeline,
  timelinePropsMeta,
  Drawer,
  Sheet,
  drawerPropsMeta,
  sheetPropsMeta,
  Calendar,
  calendarPropsMeta,
  DatePicker,
  DateRangePicker,
  datePickerPropsMeta,
  dateRangePickerPropsMeta,
  Button,
} from "prui/core"
import { MetaOnly } from "../../components/Playground"
import { CodeView } from "../../components/CodeView"
import { TocRail } from "../../components/TocRail"

/** Shared scaffold for family pages (several related components per page). */
function FamilyDoc({
  family,
  intro,
  components,
}: {
  family: string
  intro: string
  components: {
    name: string
    tagline: string
    demo: React.ReactNode
    code: string
    a11y: string[]
    edges?: string[]
    meta?: ReturnType<typeof Object> | { props: readonly { name: string }[] }
  }[]
}) {
  const toc = components.map((c) => ({ id: c.name.toLowerCase().replace(/[^a-z]/g, ""), label: c.name }))
  return (
    <div className="mx-auto flex w-full max-w-[1080px] justify-center gap-6 px-4 pb-20 pt-8 md:px-6">
      <div className="min-w-0 max-w-[780px] flex-1">
        <div className="mb-2 font-mono text-xs text-[var(--prui-dim)]">
          <Link to="/components" className="hover:text-[var(--prui-fg)]">components</Link> / {family}
        </div>
        <h1 className="mb-1.5 text-[27px] font-bold tracking-tight text-[var(--prui-fg)] capitalize">{family}</h1>
        <p className="mb-8 max-w-[60ch] text-[15px] text-[var(--prui-dim)]">{intro}</p>
        {components.map((c) => (
          <section key={c.name} id={c.name.toLowerCase().replace(/[^a-z]/g, "")} className="mb-14 scroll-mt-20">
            <h2 className="mb-1 text-lg font-semibold text-[var(--prui-fg)]">{c.name}</h2>
            <p className="mb-3 max-w-[60ch] text-sm text-[var(--prui-dim)]">{c.tagline}</p>
            <div className="mb-3 flex min-h-16 flex-wrap items-center gap-3 rounded-[var(--prui-radius)] border border-dashed border-[var(--prui-line)] p-4">
              {c.demo}
            </div>
            <CodeView code={c.code} title="tsx" className="mb-4 mt-2 overflow-hidden rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-surface)]" />
            {"props" in (c.meta ?? {}) && c.meta ? (
              <>
                <h3 className="mb-0 text-sm font-semibold text-[var(--prui-fg)]">API</h3>
                <MetaOnly meta={c.meta as never} />
              </>
            ) : null}
            <h3 className="mb-1 mt-5 text-sm font-semibold text-[var(--prui-fg)]">Accessibility</h3>
            <ul className="list-disc pl-5 text-sm text-[var(--prui-dim)]">
              {c.a11y.map((a) => <li key={a}>{a}</li>)}
            </ul>
            {c.edges ? (
              <>
                <h3 className="mb-1 mt-5 text-sm font-semibold text-[var(--prui-fg)]">Edge cases</h3>
                <ul className="list-disc pl-5 text-sm text-[var(--prui-dim)]">
                  {c.edges.map((a) => <li key={a}>{a}</li>)}
                </ul>
              </>
            ) : null}
            <h3 className="mb-1 mt-5 text-sm font-semibold text-[var(--prui-fg)]">Performance</h3>
            <p className="text-sm text-[var(--prui-dim)]">
              Tree-shakeable per component (<code className="rounded bg-[var(--prui-raise)] px-1">prui/core/{c.name.toLowerCase().replace(/[^a-z]/g, "-")}</code> style entries); no runtime
              dependencies beyond react. All animations honor <code className="rounded bg-[var(--prui-raise)] px-1">prefers-reduced-motion</code> through the motion tokens.
            </p>
          </section>
        ))}
        <p className="mt-8 text-center font-mono text-xs text-[var(--prui-dim)]">
          <Link to="/components" className="hover:text-[var(--prui-fg)]">← all components</Link>
        </p>
      </div>
      <TocRail items={toc} />
    </div>
  )
}

/* ------------------------------------------------------------------ */

export function FeedbackDoc() {
  return (
    <FamilyDoc
      family="feedback"
      intro="Status communication: inline alerts, transient toasts, task progress, and loading placeholders. All announce through the right ARIA live semantics without stealing focus."
      components={[
        {
          name: "Alert",
          tagline: "An inline callout for persistent status feedback. danger/warning map to role=alert (assertive); the rest use role=status.",
          demo: (
            <>
              <Alert variant="success" title="Deployed" className="w-full">Build 128 is live in production.</Alert>
              <Alert variant="warning" title="Approaching limit" className="w-full">8 of 10 seats used.</Alert>
            </>
          ),
          code: `<Alert variant="success" title="Deployed">Build 128 is live.</Alert>
<Alert variant="danger" title="Failed" onDismiss={() => setShow(false)}>Upload rejected.</Alert>`,
          a11y: [
            "role=alert for danger/warning, role=status otherwise",
            "onDismiss renders a labelled dismiss button",
            "icons are aria-hidden; the text carries the message",
          ],
          edges: [
            "Alert is inline (part of layout); use toast() for transient overlays",
            "Long messages wrap; the icon stays top-aligned",
          ],
          meta: alertPropsMeta,
        },
        {
          name: "Toast",
          tagline: "Transient notifications via toast() + a mounted <Toaster/>. aria-live=polite announces without focus changes; auto-dismiss with a manual handle.",
          demo: (
            <>
              <Toaster />
              <Button variant="primary" onClick={() => toast({ title: "Saved", description: "Changes are live.", variant: "success" })}>
                Save (toast)
              </Button>
              <Button variant="default" onClick={() => toast({ title: "Upload failed", variant: "danger", duration: 0 })}>
                Failing action
              </Button>
            </>
          ),
          code: `import { Toaster, toast } from 'prui/core'

function App() {
  return <>
    <Toaster />  {/* mount once */}
    <Button onClick={async () => {
      await save()
      const t = toast({ title: 'Saved', variant: 'success' })
      // t.dismiss() hides it early
    }}>Save</Button>
  </>
}`,
          a11y: [
            "rendered into an aria-live=polite region",
            "each toast has a labelled dismiss button",
            "focus never moves to a toast",
          ],
          edges: [
            "duration: 0 keeps the toast until dismissed",
            "toasts stack in the z-toast layer above every other overlay",
          ],
          meta: toastPropsMeta,
        },
        {
          name: "Progress",
          tagline: "Linear progress with the full aria value triple, or an indeterminate mode while a total is unknown.",
          demo: (
            <div className="w-full">
              <Progress value={62} showValue aria-label="Upload" />
              <Progress aria-label="Processing" />
            </div>
          ),
          code: `<Progress value={62} showValue aria-label="Upload" />
<Progress aria-label="Processing" /> {/* indeterminate */}`,
          a11y: [
            "role=progressbar with aria-valuenow/min/max",
            "indeterminate mode omits aria-valuenow per spec",
            "always pass aria-label when no visible label exists",
          ],
          meta: progressPropsMeta,
        },
        {
          name: "Skeleton",
          tagline: "Shimmer placeholders for loading layouts. Decorative (aria-hidden); pair with Spinner or a status region for the announcement.",
          demo: <div className="w-64"><Skeleton variant="text" lines={3} /><Skeleton variant="circle" className="h-10 w-10" /></div>,
          code: `<Skeleton variant="text" lines={3} />
<Skeleton variant="rect" className="h-32 w-full" />`,
          a11y: ["aria-hidden — never announces itself", "compose inside a role=status container for loading states"],
          meta: skeletonPropsMeta,
        },
        {
          name: "Spinner",
          tagline: "Inline loading indicator with role=status and an accessible label.",
          demo: <Spinner label="Loading results" />,
          code: `<Spinner label="Loading results" size="sm" />`,
          a11y: ["role=status announces politely", "label defaults to the localized Loading... string"],
          meta: spinnerPropsMeta,
        },
      ]}
    />
  )
}

export function AnchoredDoc() {
  const [open, setOpen] = React.useState(false)
  return (
    <FamilyDoc
      family="anchored"
      intro="Floating surfaces anchored to a trigger: tooltips for clarification, popovers for rich interactions. Both portal to the body, reposition against the viewport, and only the topmost overlay answers Escape."
      components={[
        {
          name: "Tooltip",
          tagline: "Hover/focus label for controls. Shows after a delay, hides immediately, never receives focus itself.",
          demo: (
            <Tooltip content="Deletes the selected rows permanently">
              <Button variant="danger">Delete</Button>
            </Tooltip>
          ),
          code: `<Tooltip content="Deletes the selected rows permanently">
  <Button variant="danger">Delete</Button>
</Tooltip>`,
          a11y: [
            "appears on keyboard focus as well as hover",
            "role=tooltip; Escape (when topmost) hides it",
            "focus stays on the trigger at all times",
          ],
          edges: ["non-modal by design — do not put interactive content in a tooltip; use Popover"],
          meta: tooltipPropsMeta,
        },
        {
          name: "Popover",
          tagline: "Click-triggered panel for filters, pickers, and mini-forms. Initial focus moves inside; Escape or outside click closes and restores focus.",
          demo: (
            <Popover open={open} onOpenChange={setOpen} ariaLabel="Quick filter" trigger={<Button>Quick filter</Button>}>
              <div className="flex flex-col gap-2">
                <Checkbox label="Active only" defaultChecked />
                <Checkbox label="Has salary" />
                <Button size="sm" variant="primary" onClick={() => setOpen(false)}>Apply</Button>
              </div>
            </Popover>
          ),
          code: `<Popover ariaLabel="Quick filter" trigger={<Button>Quick filter</Button>}>
  <Checkbox label="Active only" defaultChecked />
  <Button size="sm" variant="primary">Apply</Button>
</Popover>`,
          a11y: [
            "trigger gets aria-haspopup=dialog + aria-expanded",
            "panel is role=dialog with an accessible name",
            "modal option opts into the full focus trap + inert background",
          ],
          edges: [
            "non-modal by default: Tab moves focus out and closes",
            "repositions on scroll/resize; flips sides against the viewport",
          ],
          meta: popoverPropsMeta,
        },
      ]}
    />
  )
}

export function InputsDoc() {
  const [combo, setCombo] = React.useState("")
  return (
    <FamilyDoc
      family="inputs"
      intro="Form controls beyond Input/Select: booleans (Checkbox, Radio), search-driven selection (Combobox), and file intake (FileUpload). Every control is keyboard-complete and controlled/uncontrolled."
      components={[
        {
          name: "Checkbox",
          tagline: "Button-based checkbox with Space toggling and an indeterminate (mixed) state.",
          demo: (
            <>
              <Checkbox label="Email notifications" defaultChecked />
              <Checkbox label="Select all" indeterminate />
              <Checkbox label="Disabled" disabled />
            </>
          ),
          code: `<Checkbox label="Email notifications" defaultChecked onChange={setEmails} />
<Checkbox indeterminate label="Some selected" />`,
          a11y: ["role=checkbox with aria-checked true/false/mixed", "native Space/Enter activation", "visible focus ring"],
          meta: checkboxPropsMeta,
        },
        {
          name: "RadioGroup",
          tagline: "Single-choice group with roving-tabIndex arrows (Up/Down/Left/Right), Home/End.",
          demo: (
            <RadioGroup label="Plan" defaultValue="pro">
              <Radio value="free" label="Free" />
              <Radio value="pro" label="Pro" />
              <Radio value="enterprise" label="Enterprise" />
            </RadioGroup>
          ),
          code: `<RadioGroup label="Plan" defaultValue="pro" onChange={setPlan}>
  <Radio value="free" label="Free" />
  <Radio value="pro" label="Pro" />
</RadioGroup>`,
          a11y: ["role=radiogroup + role=radio", "arrow keys move and select", "exactly one tab stop"],
          meta: radioGroupPropsMeta,
        },
        {
          name: "Combobox",
          tagline: "The editable Select: type to filter, arrows to move, Enter to pick. ARIA 1.2 combobox semantics with aria-activedescendant.",
          demo: <div className="w-64"><Combobox aria-label="Assignee" value={combo} onChange={setCombo} options={[
            { label: "Ada Lovelace", value: "ada" },
            { label: "Grace Hopper", value: "grace" },
            { label: "Linus Torvalds", value: "linus" },
          ]} /></div>,
          code: `<Combobox
  aria-label="Assignee"
  options={users.map(u => ({ label: u.name, value: u.id }))}
  value={assignee}
  onChange={setAssignee}
/>`,
          a11y: [
            "role=combobox + listbox + option with aria-activedescendant tracking",
            "Escape (topmost) closes and refocuses the input",
            "disabled options are skipped by arrow navigation",
          ],
          meta: comboboxPropsMeta,
        },
        {
          name: "FileUpload",
          tagline: "Accessible dropzone + hidden input + removable file list with size formatting and validation.",
          demo: <div className="w-full max-w-sm"><FileUpload maxSize={1024 * 1024} accept=".pdf,.png" /></div>,
          code: `<FileUpload
  multiple
  accept=".pdf,.png"
  maxSize={1024 * 1024}
  validate={(f) => f.name.endsWith('.exe') ? 'Executables not allowed' : null}
  onFiles={setFiles}
/>`,
          a11y: [
            "dropzone is a real button; keyboard users activate the native picker",
            "validation errors render in a role=alert region",
            "remove buttons are labelled with the file name",
          ],
          meta: fileUploadPropsMeta,
        },
      ]}
    />
  )
}

export function NavigationDoc() {
  const [expanded, setExpanded] = React.useState<string[]>(["src"])
  return (
    <FamilyDoc
      family="navigation"
      intro="Wayfinding components: Accordion for stacked sections, Breadcrumb for location, TreeView for hierarchies, Timeline for chronology."
      components={[
        {
          name: "Accordion",
          tagline: "Collapsible sections; single (like <details>) or multiple open; headers are buttons with full arrow navigation.",
          demo: (
            <Accordion defaultValue={["a"]} className="w-full">
              <AccordionItem value="a">Account<div>Change email, password, and preferences.</div></AccordionItem>
              <AccordionItem value="b">Billing<div>Invoices and payment methods.</div></AccordionItem>
            </Accordion>
          ),
          code: `<Accordion type="multiple" defaultValue={['a']}>
  <AccordionItem value="a">Account<div>…</div></AccordionItem>
  <AccordionItem value="b">Billing<div>…</div></AccordionItem>
</Accordion>`,
          a11y: ["aria-expanded + aria-controls wiring", "ArrowUp/Down/Home/End between headers", "panels are labelled regions"],
          meta: accordionPropsMeta,
        },
        {
          name: "Breadcrumb",
          tagline: "nav landmark trail with separators, aria-current for the active page, and overflow collapsing.",
          demo: (
            <Breadcrumb>
              <BreadcrumbItem href="/">Home</BreadcrumbItem>
              <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
              <BreadcrumbItem current>PRUI</BreadcrumbItem>
            </Breadcrumb>
          ),
          code: `<Breadcrumb collapseAfter={2}>
  <BreadcrumbItem href="/">Home</BreadcrumbItem>
  <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
  <BreadcrumbItem current>PRUI</BreadcrumbItem>
</Breadcrumb>`,
          a11y: ["nav + ol semantics", "aria-current=page on the last item"],
          meta: breadcrumbPropsMeta,
        },
        {
          name: "TreeView",
          tagline: "Hierarchical list with expand/collapse, selection, and the full tree keyboard pattern.",
          demo: (
            <TreeView
              className="w-64"
              ariaLabel="Project files"
              expanded={expanded}
              onExpandedChange={setExpanded}
              items={[
                { id: "src", label: "src", children: [{ id: "src/core", label: "core", children: [{ id: "b", label: "button.tsx" }] }] },
                { id: "pkg", label: "package.json" },
              ]}
            />
          ),
          code: `<TreeView
  ariaLabel="Project files"
  items={files}
  selected={selectedId}
  onSelect={(id, item) => setSelectedId(id)}
/>`,
          a11y: [
            "role=tree/treeitem with aria-level and aria-expanded",
            "ArrowRight expands / moves in, ArrowLeft collapses / moves to parent",
            "ArrowUp/Down + Home/End move between visible nodes",
          ],
          meta: treeViewPropsMeta,
        },
        {
          name: "Timeline",
          tagline: "Vertical chronology with colored markers, timestamps, and descriptions.",
          demo: (
            <Timeline
              className="w-full max-w-sm"
              items={[
                { title: "Created", time: "Mon 09:12", description: "Ada created the project", variant: "brand" },
                { title: "Approved", time: "Tue 14:03", variant: "success" },
              ]}
            />
          ),
          code: `<Timeline items={events.map(e => ({
  title: e.label, time: e.at, description: e.detail, variant: 'success',
}))} />`,
          a11y: ["role=list semantics; content is fully caller-owned"],
          meta: timelinePropsMeta,
        },
      ]}
    />
  )
}

export function OverlaysDoc() {
  const [drawer, setDrawer] = React.useState(false)
  const [sheet, setSheet] = React.useState(false)
  return (
    <FamilyDoc
      family="overlays"
      intro="Panel overlays: Drawer for side surfaces, Sheet for the mobile-first bottom sheet. Both are modals built on the shared overlay infrastructure — focus-trapped, scroll-locked, background inert, topmost Escape."
      components={[
        {
          name: "Drawer",
          tagline: "Side-anchored modal panel (left/right/top/bottom) for detail panes and multi-field filters.",
          demo: (
            <>
              <Drawer open={drawer} onOpenChange={setDrawer} ariaLabel="Row details" side="right">
                <div className="p-6">
                  <h3 className="mb-2 text-base font-semibold">Ada Lovelace</h3>
                  <p className="text-sm text-[var(--prui-dim)]">Senior engineer · active · joined 2024</p>
                  <Button className="mt-4" onClick={() => setDrawer(false)}>Close</Button>
                </div>
              </Drawer>
              <Button variant="primary" onClick={() => setDrawer(true)}>Open drawer</Button>
            </>
          ),
          code: `<Drawer open={open} onOpenChange={setOpen} ariaLabel="Row details" side="right" size={480}>
  <RowDetail row={row} />
</Drawer>`,
          a11y: [
            "role=dialog aria-modal with an accessible name",
            "Tab/Shift+Tab cycle inside; initial focus on the first control",
            "Escape (topmost only) closes and restores focus to the invoker",
          ],
          edges: ["nested drawers stack correctly (only topmost answers Escape)", "slides are disabled under prefers-reduced-motion"],
          meta: drawerPropsMeta,
        },
        {
          name: "Sheet",
          tagline: "The bottom-anchored Drawer preset with a drag handle — mobile-first detail and filter surfaces.",
          demo: (
            <>
              <Sheet open={sheet} onOpenChange={setSheet} ariaLabel="Filters">
                <div className="p-6">
                  <div className="mb-3 text-base font-semibold">Filters</div>
                  <Checkbox label="Active only" defaultChecked />
                  <Button variant="primary" className="mt-4 w-full" onClick={() => setSheet(false)}>Apply</Button>
                </div>
              </Sheet>
              <Button onClick={() => setSheet(true)}>Open sheet</Button>
            </>
          ),
          code: `<Sheet open={open} onOpenChange={setOpen} ariaLabel="Filters">
  <FilterForm />
</Sheet>`,
          a11y: ["same guarantees as Drawer", "drag handle is decorative (aria-hidden)"],
          meta: sheetPropsMeta,
        },
      ]}
    />
  )
}

export function DatesDoc() {
  const [date, setDate] = React.useState("2026-09-12")
  const [range, setRange] = React.useState<{ from?: string; to?: string }>({ from: "2026-09-01", to: "2026-09-08" })
  return (
    <FamilyDoc
      family="dates"
      intro="Date selection without a date library: values are plain YYYY-MM-DD strings (native-input compatible). Calendar is the keyboard-complete grid; the pickers wrap it in an anchored popover."
      components={[
        {
          name: "Calendar",
          tagline: "Month grid with day/week arrows, Home/End week jumps, PageUp/PageDown month nav, and aria-current today.",
          demo: <Calendar value={date} onSelect={setDate} aria-label="Pick a date" />,
          code: `<Calendar value={date} onSelect={setDate} min="2026-01-01" weekStartsOn={1} />`,
          a11y: [
            "role=grid/gridcell with aria-selected and aria-current=date",
            "arrows move by day/week; PageUp/PageDown change months",
            "min/max and per-day disabled dates are aria-disabled",
          ],
          meta: calendarPropsMeta,
        },
        {
          name: "DatePicker",
          tagline: "Text trigger + Calendar popover; typing a date in the input commits it too.",
          demo: <div className="w-44"><DatePicker value={date} onChange={setDate} ariaLabel="Due date" /></div>,
          code: `<DatePicker value={due} onChange={setDue} ariaLabel="Due date" min={todayKey} />`,
          a11y: ["combobox semantics on the trigger", "Escape closes and refocuses", "selection closes and announces in the input"],
          meta: datePickerPropsMeta,
        },
        {
          name: "DateRangePicker",
          tagline: "Start–end selection on one calendar: first click anchors, second click completes.",
          demo: <div className="w-64"><DateRangePicker value={range} onChange={setRange} ariaLabel="Date range" /></div>,
          code: `<DateRangePicker value={range} onChange={setRange} ariaLabel="Report range" />`,
          a11y: ["same combobox pattern", "clear/apply actions are labelled buttons"],
          edges: ["picking an earlier date while anchored restarts the range at that date"],
          meta: dateRangePickerPropsMeta,
        },
      ]}
    />
  )
}
