import * as React from "react"
import { ComponentDoc, Input, Textarea, Label } from "../../components/ComponentDoc"

export function InputDoc() {
  const [value, setValue] = React.useState("")
  return (
    <ComponentDoc
      name="Input"
      importPath="prui/core"
      description="Text entry for single-line and multi-line values. Native input/textarea under the hood — all native props pass through, so type=email/number/search, autoComplete, pattern all work."
      when={[
        "Single-line text, email, number, password, search entry",
        "Controlled (value + onChange) or uncontrolled (defaultValue)",
        "Textarea for long-form content; it grows and stays resizable",
      ]}
      demos={[
        {
          title: "Controlled with label",
          render: (
            <div className="w-72">
              <Label htmlFor="demo-email" className="mb-1.5">Email</Label>
              <Input id="demo-email" type="email" placeholder="you@example.com" value={value} onChange={(e) => setValue(e.target.value)} />
              <p className="mt-1 font-mono text-[10px] text-[var(--prui-dim)]">value: {value || "—"}</p>
            </div>
          ),
          code: `const [value, setValue] = useState("")

<Label htmlFor="email">Email</Label>
<Input id="email" type="email" value={value} onChange={(e) => setValue(e.target.value)} />`,
        },
        {
          title: "States",
          render: (
            <>
              <Input placeholder="Default" className="w-44" />
              <Input placeholder="Disabled" disabled className="w-44" />
              <Input placeholder="Readonly" readOnly className="w-44" />
            </>
          ),
          code: `<Input placeholder="Default" />
<Input placeholder="Disabled" disabled />
<Input placeholder="Readonly" readOnly />`,
        },
        {
          title: "Textarea",
          render: <Textarea rows={3} placeholder="Notes…" className="w-72" />,
          code: `<Textarea rows={3} placeholder="Notes…" />`,
        },
        {
          title: "Search with clear",
          desc: "type=search gets native clear affordance in most browsers.",
          render: <Input type="search" placeholder="Search employees" className="w-56" />,
          code: `<Input type="search" placeholder="Search employees" />`,
        },
      ]}
      examples={[
        {
          title: "Field with label + error wiring",
          code: `<div>
  <Label htmlFor="name">Name *</Label>
  <Input
    id="name"
    aria-invalid={!!error}
    aria-describedby={error ? "name-error" : undefined}
  />
  {error && <p id="name-error" role="alert">{error}</p>}
</div>`,
        },
      ]}
      dos={[
        "Always pair with a Label (htmlFor + id)",
        "Use aria-invalid + aria-describedby when validating",
        "Prefer native types (email, number) over manual validation",
      ]}
      donts={[
        "Don't build another Input for passwords — type=password works",
        "Don't put icons inside the field; lead with a prefix label or put the icon button beside",
      ]}
    />
  )
}
