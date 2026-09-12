import * as React from "react"
import { ComponentDoc, MetaOnly, Accordion, AccordionItem, Breadcrumb, BreadcrumbItem, TreeView, Timeline } from "../../components/ComponentDoc"
import { accordionPropsMeta, breadcrumbPropsMeta, treeViewPropsMeta, timelinePropsMeta } from "prui/core"
import type { TreeViewItem } from "prui/core"

export function AccordionDoc() {
  return (
    <ComponentDoc
      name="Accordion"
      importPath="@skiddph/prui/core"
      description="Collapsible stacked sections. Headers are real buttons with full arrow-key navigation, panels are labelled regions, and single (like <details>) or multiple sections can stay open at once."
      when={[
        "Settings pages grouped by topic",
        "FAQs and long-form docs split into scannable chunks",
        "Sidebars and detail panes where space is at a premium"
      ]}
      anatomy={
        <p>
          <code className="rounded bg-[var(--prui-raise)] px-1">&lt;Accordion type value onChange&gt;</code> wraps{" "}
          <code className="rounded bg-[var(--prui-raise)] px-1">&lt;AccordionItem value disabled&gt;header… body…&lt;/AccordionItem&gt;</code>.
          The first child of an item is its header; the rest render inside the panel.
        </p>
      }
      demos={[
        {
          title: "Single-open (default)",
          render: (
            <Accordion defaultValue={["account"]} className="w-full">
              <AccordionItem value="account">
                Account
                <div className="flex flex-col gap-2">Change email, password, and notification preferences.</div>
              </AccordionItem>
              <AccordionItem value="billing">
                Billing
                <div>Invoices, payment methods, and plan changes.</div>
              </AccordionItem>
              <AccordionItem value="danger">
                Danger zone
                <div>Delete the workspace and everything in it.</div>
              </AccordionItem>
            </Accordion>
          ),
          code: `<Accordion defaultValue={['account']}>
  <AccordionItem value="account">
    Account
    <div>Change email, password, and preferences.</div>
  </AccordionItem>
  <AccordionItem value="billing">
    Billing
    <div>Invoices and payment methods.</div>
  </AccordionItem>
</Accordion>`,
        },
        {
          title: "Multiple open + controlled",
          render: (
            <Accordion type="multiple" className="w-full">
              <AccordionItem value="a">First<div>Both of these can stay open.</div></AccordionItem>
              <AccordionItem value="b">Second<div>…at the same time.</div></AccordionItem>
            </Accordion>
          ),
          code: `const [open, setOpen] = useState<string[]>(['a'])
<Accordion type="multiple" value={open} onOpenChange={setOpen}>
  <AccordionItem value="a">First<div>…</div></AccordionItem>
  <AccordionItem value="b">Second<div>…</div></AccordionItem>
</Accordion>`,
        },
      ]}
      api={<MetaOnly meta={accordionPropsMeta} />}
      examples={[
        {
          title: "URL-synced sections",
          code: `const [search, setSearch] = useSearchParams()
<Accordion
  type="multiple"
  value={search.getAll('section')}
  onOpenChange={sections => setSearch({ section: sections })}
>…</Accordion>`,
        },
      ]}
      dos={["Open the section the user is most likely to need by default", "Keep one screen of content per item"]}
      donts={["Don't nest accordions more than one level", "Don't hide required flow steps behind collapsed items"]}
      accessibility={
        <ul className="list-disc pl-5">
          <li>Headers: buttons with aria-expanded + aria-controls; panels are role=region labelled by their header.</li>
          <li>ArrowUp/Down move between headers; Home/End jump to the first/last.</li>
          <li>Collapsed panels are hidden (display:none) — never announced.</li>
        </ul>
      }
      composition={<p>Item bodies accept anything: forms, tables, nested content. Value keys are your strings — stable ids make controlled state predictable.</p>}
      customization={<p>Item chrome (border/radius/surface) uses tokens; chevron rotation animates and stops under reduced motion.</p>}
      edgeCases={[
        "type=single closes the previous section on open",
        "Duplicate item values make state ambiguous — keep them unique",
        "Disabled items render dimmed and unfocusable",
      ]}
      mistakes={["Putting the whole app inside an accordion", "Relying on default open state for critical info"]}
      performance={<p>Panels unmount visually via hidden; controlled value changes re-render headers cheaply.</p>}
      crossLinks={[
        { label: "Tabs — same content, parallel view", href: "/components/tabs" },
        { label: "TreeView — hierarchical data", href: "/components/tree-view" },
      ]}
    />
  )
}

export function BreadcrumbDoc() {
  return (
    <ComponentDoc
      name="Breadcrumb"
      importPath="@skiddph/prui/core"
      description="A nav landmark trail showing where the user is inside a hierarchy: ordered links, chevron separators, aria-current on the active page, and overflow collapsing for deep trails."
      when={[
        "Detail pages several levels deep (project → board → card)",
        "Admin sections with deep URLs",
        "Anywhere the user needs a way back up the hierarchy"
      ]}
      anatomy={
        <p>
          <code className="rounded bg-[var(--prui-raise)] px-1">&lt;Breadcrumb collapseAfter onExpand&gt;</code> wraps{" "}
          <code className="rounded bg-[var(--prui-raise)] px-1">&lt;BreadcrumbItem href current&gt;</code> items. The last item
          is usually <code>current</code>.
        </p>
      }
      demos={[
        {
          title: "Basic trail",
          render: (
            <Breadcrumb>
              <BreadcrumbItem href="/">Home</BreadcrumbItem>
              <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
              <BreadcrumbItem href="/projects/prui">PRUI</BreadcrumbItem>
              <BreadcrumbItem current>Components</BreadcrumbItem>
            </Breadcrumb>
          ),
          code: `<Breadcrumb>
  <BreadcrumbItem href="/">Home</BreadcrumbItem>
  <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
  <BreadcrumbItem href="/projects/prui">PRUI</BreadcrumbItem>
  <BreadcrumbItem current>Components</BreadcrumbItem>
</Breadcrumb>`,
        },
        {
          title: "Collapsed middle",
          desc: "collapseAfter keeps the first item, an ellipsis expander, and the last N items.",
          render: (
            <Breadcrumb collapseAfter={1}>
              <BreadcrumbItem href="/">Home</BreadcrumbItem>
              <BreadcrumbItem href="/a">Level 1</BreadcrumbItem>
              <BreadcrumbItem href="/b">Level 2</BreadcrumbItem>
              <BreadcrumbItem href="/c">Level 3</BreadcrumbItem>
              <BreadcrumbItem current>Level 4</BreadcrumbItem>
            </Breadcrumb>
          ),
          code: `<Breadcrumb collapseAfter={1} onExpand={expandAll}>
  <BreadcrumbItem href="/">Home</BreadcrumbItem>
  <BreadcrumbItem href="/a">Level 1</BreadcrumbItem>
  {/* … */}
  <BreadcrumbItem current>Level 4</BreadcrumbItem>
</Breadcrumb>`,
        },
      ]}
      api={<MetaOnly meta={breadcrumbPropsMeta} />}
      examples={[
        {
          title: "From a route trail",
          code: `const crumbs = useMatches().map(m => ({ label: m.handle?.title, href: m.pathname }))
<Breadcrumb>
  {crumbs.map((c, i) => (
    <BreadcrumbItem key={c.href} href={c.href} current={i === crumbs.length - 1}>
      {c.label}
    </BreadcrumbItem>
  ))}
</Breadcrumb>`,
        },
      ]}
      dos={["Keep the current page as plain text (current), not a link", "Cap visible levels with collapseAfter on deep products"]}
      donts={["Don't use for sibling navigation — that's Tabs or a nav group"]}
      accessibility={
        <ul className="list-disc pl-5">
          <li>nav landmark labelled “Breadcrumb”; ol/li structure for the trail.</li>
          <li>The current item carries aria-current=page.</li>
          <li>Separators are aria-hidden; the ellipsis expander is a labelled button.</li>
        </ul>
      }
      composition={<p>Items link through the app router (Link), so active state and SPA navigation come free.</p>}
      customization={<p>Text/separator colors are the dim/line tokens; size via className on the nav.</p>}
      edgeCases={[
        "One or two items render without separators/collapse",
        "href uses client-side routing; external links need your own anchor",
      ]}
      mistakes={["Linking the current page to itself"]}
      performance={<p>Pure list rendering; collapses are computed at render.</p>}
      crossLinks={[
        { label: "Tabs — sibling navigation", href: "/components/tabs" },
        { label: "App shell layouts", href: "/layouts" },
      ]}
    />
  )
}

const TREE: TreeViewItem[] = [
  {
    id: "src",
    label: "src",
    children: [
      { id: "src/core", label: "core", children: [{ id: "src/core/button.tsx", label: "button.tsx" }, { id: "src/core/select.tsx", label: "select.tsx" }] },
      { id: "src/app", label: "app", children: [{ id: "src/app/app.tsx", label: "app.tsx" }] },
    ],
  },
  { id: "tests", label: "tests", children: [{ id: "tests/a.test.tsx", label: "a.test.tsx" }] },
  { id: "package.json", label: "package.json" },
]

export function TreeViewDoc() {
  const [expanded, setExpanded] = React.useState<string[]>(["src"])
  const [selected, setSelected] = React.useState<string | undefined>("src/core")
  return (
    <ComponentDoc
      name="TreeView"
      importPath="@skiddph/prui/core"
      description="A hierarchical list for files, categories, and org structures — expand/collapse, single selection, aria-level/aria-expanded structure, and the complete tree keyboard pattern."
      when={[
        "File explorers and object stores",
        "Category/taxonomy editors",
        "Org charts and comment threads with replies"
      ]}
      anatomy={
        <p>
          <code className="rounded bg-[var(--prui-raise)] px-1">&lt;TreeView items expanded selected onSelect ariaLabel /&gt;</code> —
          a flat data tree of <code>&#123; id, label, children, disabled &#125;</code>; only expanded branches render.
        </p>
      }
      demos={[
        {
          title: "Project files",
          render: (
            <TreeView
              className="w-72"
              ariaLabel="Project files"
              items={TREE}
              expanded={expanded}
              onExpandedChange={setExpanded}
              selected={selected}
              onSelect={(id) => setSelected(id)}
            />
          ),
          code: `const [expanded, setExpanded] = useState(['src'])
const [selected, setSelected] = useState<string>()

<TreeView
  ariaLabel="Project files"
  items={tree}
  expanded={expanded}
  onExpandedChange={setExpanded}
  selected={selected}
  onSelect={setSelected}
/>`,
        },
      ]}
      api={<MetaOnly meta={treeViewPropsMeta} />}
      examples={[
        {
          title: "Keyboard map",
          code: `// ArrowRight: expand, or move to the first child
// ArrowLeft:  collapse, or move to the parent
// ArrowUp/Down: previous/next visible node
// Home/End: first/last visible node
// Enter/Space: select`,
        },
      ]}
      dos={["Give the tree an ariaLabel", "Control expanded/selected for URL or store sync"]}
      donts={["Don't render thousands of nodes fully expanded — control defaultExpanded", "Don't make every node a navigation; selection and expansion are different verbs"]}
      accessibility={
        <ul className="list-disc pl-5">
          <li>role=tree/treeitem with aria-level, aria-expanded, and aria-selected.</li>
          <li>The full tree key map (above) works with no wiring.</li>
          <li>Indentation is style-only; the level is announced programmatically.</li>
        </ul>
      }
      composition={<p>items.meta carries opaque data back through onSelect. Drop into Drawer for a file explorer panel.</p>}
      customization={<p>Row highlight/selection colors are brand tokens; indent step is 16px per level via inline style.</p>}
      edgeCases={[
        "Deep branches render only when every ancestor is expanded",
        "Clicking a parent both toggles and selects it (common file-explorer behavior)",
        "Disabled nodes are visible but skipped",
      ]}
      mistakes={["Mutating the items array in place — return a new tree from onExpanded flows"]}
      performance={<p>The visible list is flattened once per render; collapsed subtrees cost nothing.</p>}
      crossLinks={[
        { label: "Drawer — explorer panels", href: "/components/drawer" },
        { label: "Accordion — flat collapsibles", href: "/components/accordion" },
      ]}
    />
  )
}

export function TimelineDoc() {
  return (
    <ComponentDoc
      name="Timeline"
      importPath="@skiddph/prui/core"
      description="A vertical chronology with markers, timestamps, descriptions, and per-item color semantics — activity feeds, audit logs, and status histories in one component."
      when={[
        "Activity/audit feeds",
        "Order and deployment histories",
        "Onboarding or approval step logs"
      ]}
      anatomy={
        <p>
          <code className="rounded bg-[var(--prui-raise)] px-1">&lt;Timeline items align&gt;</code> where each item is{" "}
          <code>&#123; title, time?, description?, icon?, variant? &#125;</code>. Markers sit on a rail; the last item ends it.
        </p>
      }
      demos={[
        {
          title: "Deployment history",
          render: (
            <Timeline
              className="w-full max-w-md"
              items={[
                { title: "Deployed", time: "Tue 14:03", description: "Build 128 rolled to production", variant: "success" },
                { title: "Tests passed", time: "Tue 14:01", description: "412 passed, 0 failed" },
                { title: "Build queued", time: "Tue 13:58", variant: "brand" },
                { title: "Build failed", time: "Mon 09:12", description: "Type error in widgets.tsx", variant: "danger" },
              ]}
            />
          ),
          code: `<Timeline items={deployments.map(d => ({
  title: d.status,
  time: d.at,
  description: d.detail,
  variant: d.ok ? 'success' : 'danger',
}))} />`,
        },
      ]}
      api={<MetaOnly meta={timelinePropsMeta} />}
      examples={[
        {
          title: "Custom icons",
          code: `import { GitCommit } from 'lucide-react'

<Timeline items={commits.map(c => ({
  title: c.message,
  time: c.when,
  icon: <GitCommit className="h-3 w-3" />,
}))} />`,
        },
      ]}
      dos={["Order newest-first or oldest-first — just be consistent", "Use variant to encode outcome (success/danger), not decoration"]}
      donts={["Don't use for future/planned events needing interaction — build a stepper"]}
      accessibility={
        <ul className="list-disc pl-5">
          <li>role=list with list items; markers and rail are aria-hidden.</li>
          <li>Content is plain text — screen readers read it in DOM order.</li>
        </ul>
      }
      composition={<p>Drops into cards and drawer bodies; align=\"right\" mirrors for RTL-ish layouts.</p>}
      customization={<p>Marker colors map to brand/ok/warn/danger tokens; the rail is --prui-line.</p>}
      edgeCases={["A single item renders without a rail", "Long titles wrap; time stays beside the title"]}
      mistakes={["Cramming interactive buttons into descriptions without list semantics"]}
      performance={<p>Pure list render.</p>}
      crossLinks={[
        { label: "TreeView — hierarchies", href: "/components/tree-view" },
        { label: "Alert — status callouts", href: "/components/alert" },
      ]}
    />
  )
}
