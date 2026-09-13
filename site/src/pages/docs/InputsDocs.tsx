import * as React from "react"
import { ComponentDoc, MetaOnly, Checkbox, RadioGroup, Radio, Combobox, FileUpload } from "../../components/ComponentDoc"
import { checkboxPropsMeta, radioGroupPropsMeta, comboboxPropsMeta, fileUploadPropsMeta } from "prui/core"

export function CheckboxDoc() {
  const [all, setAll] = React.useState(false)
  const [emails, setEmails] = React.useState(true)
  return (
    <ComponentDoc
      name="Checkbox"
      importPath="@skiddph/prui/core"
      description="A button-based checkbox with native Space/Enter toggling, a real mixed (indeterminate) state for parent-of-selection scenarios, and an optional clickable label."
      when={[
        "Multi-select lists and filter facets",
        "'Select all' headers over a DataTable",
        "Single consent toggles that read better as a box than a switch"
      ]}
      anatomy={
        <p>
          <code className="rounded bg-[var(--prui-raise)] px-1">&lt;Checkbox checked indeterminate disabled label onChange /&gt;</code>:
          one button with role=checkbox; the label, when given, clicks through to the box.
        </p>
      }
      demos={[
        {
          title: "States",
          render: (
            <div className="flex flex-col gap-2">
              <Checkbox label="Email notifications" checked={emails} onChange={setEmails} />
              <Checkbox label="Select all" indeterminate={!all && emails} checked={all} onChange={setAll} />
              <Checkbox label="Disabled" disabled />
              <Checkbox label="Controlled off" checked={false} onChange={() => {}} />
            </div>
          ),
          code: `<Checkbox label="Email notifications" checked={emails} onChange={setEmails} />
<Checkbox label="Select all" indeterminate={someSelected} checked={all} onChange={setAll} />`,
        },
      ]}
      api={<MetaOnly meta={checkboxPropsMeta} />}
      examples={[
        {
          title: "Indeterminate parent over rows",
          code: `const n = selected.length
<Checkbox
  label={'Select all (' + n + '/' + rows.length + ')'}
  checked={n === rows.length}
  indeterminate={n > 0 && n < rows.length}
  onChange={toggleAll}
/>`,
        },
      ]}
      dos={[
        "Use indeterminate when only some children are selected",
        "Controlled + onChange is the norm; uncontrolled works for pure forms",
      ]}
      donts={[
        "Don't use a checkbox for an immediate-action toggle. Switch fits that",
        "Don't style over the box; keep the checked state visible",
      ]}
      accessibility={
        <ul className="list-disc pl-5">
          <li>role=checkbox with aria-checked true / false / mixed.</li>
          <li>Space and Enter toggle natively (it is a real button).</li>
          <li>Visible focus ring; the mixed state is announced, not just drawn.</li>
        </ul>
      }
      composition={<p>Pairs with DataTable's select-all header, FacetedFilter rows, and Popover panels. label accepts nodes for rich rows.</p>}
      customization={<p>Checked colors come from --prui-brand; size is 16px square with token radius; restyle via className on the box.</p>}
      edgeCases={[
        "Clicking an indeterminate box checks it (mixed → true)",
        "aria-checked=mixed requires the indeterminate prop, not a third value prop",
      ]}
      mistakes={[
        "Passing checked without onChange (permanently frozen box)",
        "Emulating mixed with CSS only; screen readers never hear it",
      ]}
      performance={<p>One button element; no listeners.</p>}
      crossLinks={[
        { label: "RadioGroup; single choice", href: "/components/radio" },
        { label: "Switch; instant toggles", href: "/components/switch" },
      ]}
    />
  )
}

export function RadioDoc() {
  const [plan, setPlan] = React.useState("pro")
  return (
    <ComponentDoc
      name="RadioGroup"
      importPath="@skiddph/prui/core"
      description="A single-choice control with the full roving-tabIndex keyboard pattern: arrows move and select, Home/End jump, and exactly one tab stop exists for the whole group."
      when={[
        "Plan/tier choices with 2–5 visible options",
        "Type selectors where every option should be visible",
        "Settings where one value excludes the others"
      ]}
      anatomy={
        <p>
          <code className="rounded bg-[var(--prui-raise)] px-1">&lt;RadioGroup value onChange label orientation&gt;</code> wraps
          any number of <code className="rounded bg-[var(--prui-raise)] px-1">&lt;Radio value label /&gt;</code>. The group owns
          the value; radios register themselves.
        </p>
      }
      demos={[
        {
          title: "Vertical plan picker",
          render: (
            <RadioGroup label="Plan" value={plan} onChange={setPlan}>
              <Radio value="free" label="Free. 1 workspace" />
              <Radio value="pro" label="Pro; unlimited workspaces" />
              <Radio value="enterprise" label="Enterprise. SSO + audit" />
            </RadioGroup>
          ),
          code: `<RadioGroup label="Plan" value={plan} onChange={setPlan}>
  <Radio value="free" label="Free" />
  <Radio value="pro" label="Pro" />
  <Radio value="enterprise" label="Enterprise" />
</RadioGroup>`,
        },
        {
          title: "Horizontal",
          render: (
            <RadioGroup label="Visibility" defaultValue="team" orientation="horizontal">
              <Radio value="private" label="Private" />
              <Radio value="team" label="Team" />
              <Radio value="public" label="Public" />
            </RadioGroup>
          ),
          code: `<RadioGroup label="Visibility" orientation="horizontal" defaultValue="team">
  <Radio value="private" label="Private" />
  <Radio value="team" label="Team" />
  <Radio value="public" label="Public" />
</RadioGroup>`,
        },
      ]}
      api={<MetaOnly meta={radioGroupPropsMeta} />}
      examples={[
        {
          title: "Arrow-key quick pick",
          code: `// focus any radio, then ArrowDown/ArrowUp selects the neighbor,
// Home/End jump to the first/last option; no extra wiring needed`,
        },
      ]}
      dos={["Give the group a label; it names the field for assistive tech", "Keep options under ~7; use Select beyond that"]}
      donts={["Don't use radios for multi-select. Checkbox", "Don't preselect a destructive option"]}
      accessibility={
        <ul className="list-disc pl-5">
          <li>role=radiogroup with an accessible name; each option role=radio with aria-checked.</li>
          <li>Arrow keys move and select; Home/End jump; one tab stop for the group.</li>
          <li>When nothing is selected the first radio is the tab stop.</li>
        </ul>
      }
      composition={<p>Compose inside forms, Popover panels, and cards. label accepts nodes (badges for prices, etc.).</p>}
      customization={<p>Checked ring/dot uses --prui-brand; vertical/horizontal via orientation; gap via className.</p>}
      edgeCases={[
        "Selecting is automatic on arrow move (standard radio behavior)",
        "Disabled radios are skipped by arrows and untabbable",
      ]}
      mistakes={["Nesting interactive content inside a Radio label"]}
      performance={<p>The registry is local state in the group; options re-render on selection as expected.</p>}
      crossLinks={[
        { label: "Checkbox; multi choice", href: "/components/checkbox" },
        { label: "Select; long lists", href: "/components/select" },
      ]}
    />
  )
}

export function ComboboxDoc() {
  const [assignee, setAssignee] = React.useState("")
  return (
    <ComponentDoc
      name="Combobox"
      importPath="@skiddph/prui/core"
      description="The editable Select: type to filter, arrows to walk matches, Enter to pick. Full ARIA 1.2 combobox semantics with aria-activedescendant, a portaled listbox anchored under the input, and controlled or uncontrolled values."
      when={[
        "Selectable lists too long for radios (users, tags, cities)",
        "Choices the user may know by name; typing beats scrolling",
        "Anywhere a Select fits but search would speed it up"
      ]}
      anatomy={
        <p>
          <code className="rounded bg-[var(--prui-raise)] px-1">&lt;Combobox options value onChange filter /&gt;</code>; an input
          with role=combobox plus a portaled role=listbox of options; the list re-anchors on scroll and closes on
          Escape/outside click/Tab.
        </p>
      }
      demos={[
        {
          title: "Assignee picker",
          render: (
            <div className="w-64">
              <Combobox
                aria-label="Assignee"
                placeholder="Type a name…"
                value={assignee}
                onChange={setAssignee}
                options={[
                  { label: "Ada Lovelace", value: "ada" },
                  { label: "Grace Hopper", value: "grace" },
                  { label: "Linus Torvalds", value: "linus" },
                  { label: "Margaret Hamilton", value: "margaret" },
                ]}
              />
            </div>
          ),
          code: `<Combobox
  aria-label="Assignee"
  placeholder="Type a name…"
  value={assignee}
  onChange={setAssignee}
  options={users.map(u => ({ label: u.name, value: u.id }))}
/>`,
        },
        {
          title: "Custom filter + no-match copy",
          render: (
            <div className="w-64">
              <Combobox
                aria-label="Search by email"
                noMatchText="No teammate matches that email."
                filter={(opt, q) => opt.label.toLowerCase().includes(q) || opt.value.includes(q)}
                options={[
                  { label: "Ada", value: "ada@skiddph.com" },
                  { label: "Grace", value: "grace@skiddph.com" },
                ]}
              />
            </div>
          ),
          code: `<Combobox
  aria-label="Search by email"
  noMatchText="No teammate matches."
  // match on the label OR the value; your predicate, your rules
  filter={(opt, q) => opt.label.includes(q) || opt.value.includes(q)}
  options={teammates}
/>`,
        },
      ]}
      api={<MetaOnly meta={comboboxPropsMeta} />}
      examples={[
        {
          title: "Async options (debounce outside)",
          code: `const [q, setQ] = useState('')
const options = useDebouncedSearch(q, 300)

<Combobox
  aria-label="Repository"
  value={repo}
  onChange={setRepo}
  options={options}
  filter={() => true}   // server already filtered
/>`,
        },
      ]}
      dos={[
        "Always pass aria-label (or a visible label via htmlFor)",
        "Keep labels unique-ish; typeahead matches on label text",
        "Return true from filter when the server already filtered",
      ]}
      donts={[
        "Don't use as a free-text input; it commits option values only",
        "Don't ship thousands of options without a custom async filter",
      ]}
      accessibility={
        <ul className="list-disc pl-5">
          <li>role=combobox + aria-expanded/controls + aria-autocomplete=list with aria-activedescendant tracking.</li>
          <li>ArrowUp/Down move (disabled options skipped), Home/End jump, Enter picks, Escape closes and refocuses, Tab closes.</li>
          <li>The listbox portals to the body; no ancestor can clip it.</li>
        </ul>
      }
      composition={<p>Drops into forms and toolbars at h-9. Pair with a server search by owning the query yourself and passing prefetched options.</p>}
      customization={<p>Trigger styles are the input token set; list panel tokens match Select. filter is a pure predicate over (option, query).</p>}
      edgeCases={[
        "Focus opens the list; Escape then refocuses the input for a fresh start",
        "The query resets after a pick; the trigger shows the selected label",
        "Disabled options render but are skipped by navigation and Enter",
      ]}
      mistakes={[
        "Forgetting aria-label; comboboxes must be named",
        "Passing new arrays each render without useMemo for big lists",
      ]}
      performance={<p>Filtering is memoized on options+query; the panel exists only while open.</p>}
      crossLinks={[
        { label: "Select; closed-list choice", href: "/components/select" },
        { label: "DatePicker; date choice", href: "/components/date-picker" },
      ]}
    />
  )
}

export function FileUploadDoc() {
  return (
    <ComponentDoc
      name="FileUpload"
      importPath="@skiddph/prui/core"
      description="An accessible dropzone: a real button wrapping a visually-hidden file input (native keyboard + screen reader path), drag-over highlighting, per-file size/validator checks with a role=alert error list, and a removable file list."
      when={[
        "Document and image intake in forms",
        "CSV/import flows with validation before upload",
        "Anywhere drag-and-drop is expected but must not be the only path"
      ]}
      anatomy={
        <p>
          <code className="rounded bg-[var(--prui-raise)] px-1">&lt;FileUpload accept multiple maxSize validate onFiles files hideList /&gt;</code>:
          dropzone button + hidden input + (optional) file list with remove buttons.
        </p>
      }
      demos={[
        {
          title: "Single PDF up to 1MB",
          render: (
            <div className="w-full max-w-sm">
              <FileUpload accept=".pdf" multiple={false} maxSize={1024 * 1024} />
            </div>
          ),
          code: `<FileUpload accept=".pdf" multiple={false} maxSize={1024 * 1024} onFiles={setFiles} />`,
        },
        {
          title: "Validated multi-upload",
          desc: "validators return the error string; rejected files stay out of the list and surface in a role=alert region.",
          render: (
            <div className="w-full max-w-sm">
              <FileUpload
                multiple
                maxSize={5 * 1024 * 1024}
                validate={(f) => (f.name.endsWith(".exe") ? "Executables are not allowed." : null)}
              />
            </div>
          ),
          code: `<FileUpload
  multiple
  maxSize={5 * 1024 * 1024}
  validate={(f) => f.name.endsWith('.exe') ? 'Executables not allowed.' : null}
  onFiles={uploadAll}
/>`,
        },
      ]}
      api={<MetaOnly meta={fileUploadPropsMeta} />}
      examples={[
        {
          title: "Controlled list (render your own)",
          code: `const [files, setFiles] = useState<File[]>([])
<FileUpload files={files} onFiles={setFiles} hideList />
<ul>{files.map(f => <li key={f.name}>{f.name}</li>)}</ul>`,
        },
      ]}
      dos={[
        "State your limits in the hint copy (size/type) before the error does",
        "Use hideList when you upload immediately and show progress elsewhere",
      ]}
      donts={[
        "Don't rely on drag alone; keyboard users need the button",
        "Don't validate only on the server if the client can catch it earlier",
      ]}
      accessibility={
        <ul className="list-disc pl-5">
          <li>The dropzone is a real button; Enter/Space opens the native picker.</li>
          <li>Validation errors render in a role=alert region described by the trigger.</li>
          <li>Remove buttons are labelled “Remove file: name”.</li>
          <li>The hidden input is aria-hidden; the button is the accessible surface.</li>
        </ul>
      }
      composition={<p>onFiles hands you the full next list (adds and removes); trivially wired to fetch/upsert logic or Progress bars.</p>}
      customization={<p>hint replaces the dropzone copy; dragging/data-dragging attributes and token colors allow full restyling via className.</p>}
      edgeCases={[
        "multiple=false keeps only the latest file",
        "The input resets after selection so picking the same file twice still fires onFiles",
        "Rejected files never enter the list",
      ]}
      mistakes={[
        "Assuming onFiles receives only the new files (it is the full list)",
        "No maxSize and no validator (unbounded uploads)",
      ]}
      performance={<p>File objects are held by reference; no content is read.</p>}
      crossLinks={[
        { label: "Progress; upload progress", href: "/components/progress" },
        { label: "Form; schema forms", href: "/forms" },
      ]}
    />
  )
}
