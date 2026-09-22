import * as React from "react"
import { ComponentDoc } from "../../components/ComponentDoc"
import { Textarea, textareaPropsMeta, Label } from "prui/core"
import { PropsTable } from "../../components/Playground"

export function TextareaDoc() {
  const [value, setValue] = React.useState("")
  return (
    <ComponentDoc
      name="Textarea"
      importPath="@skiddph/prui/core"
      description="A multi-line text field styled on the same tokens as Input: resize enabled, theme-aware."
      when={["Notes, descriptions, messages: anything over one line", "Schema-driven forms via <Form> (type: 'textarea')"]}
      demos={[
        {
          title: "Basic",
          render: (
            <div className="flex w-80 flex-col gap-1.5">
              <Label htmlFor="ta-demo-notes">Notes</Label>
              <Textarea id="ta-demo-notes" placeholder="Add a note…" rows={3} />
            </div>
          ),
          code: `<Label htmlFor="notes">Notes</Label>
<Textarea id="notes" placeholder="Add a note…" rows={3} />`,
        },
        {
          title: "Controlled with character count",
          render: (
            <div className="flex w-80 flex-col gap-1.5">
              <Textarea
                aria-label="Message"
                value={value}
                maxLength={140}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Type a message (max 140)"
                rows={3}
              />
              <span className="text-right font-mono text-micro text-[var(--prui-dim)]">{value.length}/140</span>
            </div>
          ),
          code: `const [value, setValue] = useState("")
<Textarea value={value} maxLength={140}
  onChange={(e) => setValue(e.target.value)} />
<span>{value.length}/140</span>`,
        },
      ]}
      api={<PropsTable meta={textareaPropsMeta} />}
      examples={[{ title: "Disabled state", code: `<Textarea disabled placeholder="Read only" />` }]}
      dos={["Pair with a Label", "Set sensible rows for expected content"]}
      donts={["Use for single-line values: use Input", "Rely on resize in fixed layouts: set rows"]}
    />
  )
}
