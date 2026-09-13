import * as React from "react"
import { ComponentDoc, MetaOnly, FormField, Input, InputGroup, Select, TagInput } from "../../components/ComponentDoc"
import { formFieldPropsMeta, inputGroupPropsMeta } from "prui/core"

export function FormFieldDoc() {
  const [price, setPrice] = React.useState("")
  return (
    <ComponentDoc
      name="FormField"
      importPath="@skiddph/prui/core"
      description="The standard three-slot field layout: label on top, the control, helper text below. The label and helper rows reserve their height even when empty, so bare and labeled fields in one row keep the same baselines — no more collapsing slots shifting vertical alignment."
      when={[
        "Forms mixing labeled and bare controls in one row",
        "Consistent hint/error space under every field",
        "Wrapping any control (Input, Select, pickers, your own) in the standard layout",
      ]}
      anatomy={
        <p>
          <code className="rounded bg-[var(--prui-raise)] px-1">&lt;FormField label helperText htmlFor inline&gt;&#123;control&#125;&lt;/FormField&gt;</code> —
          three stacked rows: label (min-h 1.25rem), control, helper (min-h 1rem). Every form control also accepts
          <code className="rounded bg-[var(--prui-raise)] px-1"> label</code> and
          <code className="rounded bg-[var(--prui-raise)] px-1"> helperText</code> directly and wraps itself; a control with neither renders bare, exactly as before.
        </p>
      }
      demos={[
        {
          title: "Slots stay reserved — mixed rows align",
          desc: "The middle field has no label and no helper, yet all three controls sit on the same top and bottom baselines: wrapped in FormField, its empty slot rows keep their height.",
          render: (
            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
              <Input label="First name" placeholder="Ada" helperText="As it appears on ID" />
              <FormField>
                <Input placeholder="Bare input" />
              </FormField>
              <Select label="Team" options={[{ label: "Core", value: "core" }, { label: "Design", value: "design" }]} helperText="Primary team" />
            </div>
          ),
          code: `<div className="grid grid-cols-3 gap-3 items-start">
  <Input label="First name" helperText="As on ID" />
  <FormField>                     {/* empty slots keep their height */}
    <Input />
  </FormField>
  <Select label="Team" options={teams} />
</div>`,
        },
        {
          title: "Manual wrapper for any control",
          render: (
            <div className="w-full max-w-sm">
              <FormField label="Keywords" helperText="Committed on comma, Enter, or paste">
                <TagInput placeholder="Add keyword…" />
              </FormField>
            </div>
          ),
          code: `<FormField label="Keywords" helperText="Committed on comma or Enter">
  <TagInput />
</FormField>`,
        },
        {
          title: "inline: slots collapse for compact rows",
          desc: "Toolbar-style rows drop the label and helper rows entirely; align the row with items-end so controls anchor to one bottom line.",
          render: (
            <div className="flex w-full max-w-md flex-wrap items-end gap-3">
              <FormField inline>
                <Input placeholder="Search…" className="h-8 w-40" />
              </FormField>
              <FormField inline>
                <Select options={[{ label: "All", value: "all" }]} className="h-8" />
              </FormField>
            </div>
          ),
          code: `<div className="flex items-end gap-3">
  <FormField inline><Input placeholder="Search…" /></FormField>
  <FormField inline><Select options={scopes} /></FormField>
</div>`,
        },
        {
          title: "InputGroup — fixed addons on the same slots",
          desc: "Currency symbols, units, and domains as non-interactive leading/trailing addons; label/helperText work exactly like Input's.",
          render: (
            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
              <InputGroup label="Price" leading="$" trailing=".00" placeholder="0" helperText="Per unit, USD" value={price} onChange={(e) => setPrice(e.target.value)} />
              <InputGroup label="Site" trailing=".skiddph.com" placeholder="docs" helperText="The subdomain only" />
            </div>
          ),
          code: `<InputGroup label="Price" leading="$" trailing=".00" />
<InputGroup label="Site" trailing=".skiddph.com" placeholder="docs" />`,
        },
      ]}
      api={
        <>
          <MetaOnly meta={formFieldPropsMeta} />
          <p className="mb-2 mt-6 font-mono text-xs text-[var(--prui-brand)]">InputGroup</p>
          <MetaOnly meta={inputGroupPropsMeta} />
        </>
      }
      examples={[
        {
          title: "Validation message slot",
          code: `<FormField helperText={errors.name ?? "Given name"} error={!!errors.name}>
  <Input />
</FormField>`,
        },
        {
          title: "Toolbar filters (DataTable) use it out of the box",
          code: `// range filters (daterange, numberrange, price, time) render one group
// label above the pair; the toolbar row aligns items-end
<DataTableToolbar filters={[
  { key: "team", label: "Team", type: "select", options: teams },
  { key: "hired", label: "Hired", type: "daterange" },
  { key: "salary", label: "Salary", type: "numberrange" },
]} />`,
        },
      ]}
      dos={[
        "Give every field in a row the same slot treatment — all labeled, or all inline",
        "Pass label/helperText on the control itself; reach for the wrapper only for custom controls",
        "Use items-end on rows mixing heights so controls anchor to one bottom line",
      ]}
      donts={[
        "Don't wrap a control that already got label/helperText props — the slots would nest",
        "Don't use inline in forms; it exists for compact toolbars",
      ]}
      accessibility={
        <ul className="list-disc pl-5">
          <li>The label is a real <code>&lt;label htmlFor&gt;</code>; controls generate an id for the association automatically.</li>
          <li>Reserved empty rows are visual only — no phantom text for screen readers.</li>
          <li>InputGroup addons are aria-hidden decoration; name the field with label.</li>
        </ul>
      }
      composition={<p>FormField is layout-only: it wraps any single control. The toolbar filters (select, date, daterange, number, price, time) render through it, so composite filters occupy the same three slots as single fields.</p>}
      customization={<p>Slot rows are min-height utilities (1.25rem / 1rem); override per instance with className, or restyle via the prui-form-field class.</p>}
      edgeCases={[
        "A control with neither label nor helperText renders bare — zero change to existing layouts",
        "htmlFor wins over the generated id; pass your own id to keep external references stable",
        "inline ignores label/helperText entirely",
      ]}
      mistakes={[
        "Mixing slotted and bare fields in a row without items-end — bottoms drift",
        "Putting helper text outside the field: it no longer participates in the reserved slot",
      ]}
      performance={<p>One wrapper div and two row divs; controls render bare unless slots are used.</p>}
      crossLinks={[
        { label: "Input — labels and helper text on the control", href: "/components/input" },
        { label: "DataTable — toolbar filters", href: "/components/data-table" },
      ]}
    />
  )
}
