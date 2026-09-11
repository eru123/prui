import * as React from "react"
import { ComponentDoc, Dropdown, Button } from "../../components/ComponentDoc"

export function DropdownDoc() {
  return (
    <ComponentDoc
      name="Dropdown"
      importPath="prui/core"
      description="Lightweight action menu anchored to a trigger. Item list mode or custom children; closes on outside click and Escape."
      when={[
        "Row/card overflow actions (Edit, Duplicate, Delete…)",
        "Small option menus where a full Select is overkill",
      ]}
      demos={[
        {
          title: "Item list mode",
          render: (
            <Dropdown
              trigger={<Button variant="default" size="sm">Actions</Button>}
              items={[
                { label: "Edit", onSelect: () => {} },
                { label: "Duplicate", onSelect: () => {} },
                { label: "Delete", danger: true, separatorBefore: true, onSelect: () => {} },
              ]}
            />
          ),
          code: `<Dropdown
  trigger={<Button size="sm">Actions</Button>}
  items={[
    { label: "Edit", onSelect: edit },
    { label: "Delete", danger: true, separatorBefore: true, onSelect: del },
  ]}
/>`,
        },
      ]}
      examples={[{ title: "Align end (in headers)", code: `<Dropdown align="end" trigger={…} items={…} />` }]}
      dos={["Keep item labels verbs", "Group destructive items last behind a separator"]}
      donts={["Don't nest dropdowns", "Don't put more than ~8 items — use a dialog"]}
    />
  )
}
