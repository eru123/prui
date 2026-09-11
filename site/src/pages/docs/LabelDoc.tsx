import { ComponentDoc } from "../../components/ComponentDoc"
import { Label, Input, labelPropsMeta } from "prui/core"
import { PropsTable } from "../../components/Playground"

export function LabelDoc() {
  return (
    <ComponentDoc
      name="Label"
      importPath="@skiddph/prui/core"
      description="A form label wired to its control with htmlFor, so screen readers announce the field name and clicking focuses the control."
      when={["Every input, select, switch and textarea gets one", "Required-field markers"]}
      demos={[
        {
          title: "Paired with an input",
          render: (
            <div className="flex w-64 flex-col gap-1.5">
              <Label htmlFor="label-demo-email">Work email</Label>
              <Input id="label-demo-email" type="email" placeholder="name@company.com" />
            </div>
          ),
          code: `<Label htmlFor="email">Work email</Label>
<Input id="email" type="email" />`,
        },
        {
          title: "Required field",
          render: (
            <div className="flex w-64 flex-col gap-1.5">
              <Label htmlFor="label-demo-name">
                Full name<span className="ml-0.5 text-[var(--prui-danger)]">*</span>
              </Label>
              <Input id="label-demo-name" />
            </div>
          ),
          code: `<Label htmlFor="name">
  Full name<span className="text-[var(--prui-danger)]">*</span>
</Label>`,
        },
      ]}
      api={<PropsTable meta={labelPropsMeta} />}
      examples={[{ title: "Clicking focuses the control", code: `<Label htmlFor="search">Search</Label>\n<Input id="search" />` }]}
      dos={["Bind with htmlFor + matching id", "Mark required fields visibly"]}
      donts={["Use a plain span where a Label belongs", "Leave controls unlabeled"]}
    />
  )
}
