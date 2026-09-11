import * as React from "react"
import { ComponentDoc, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ComponentDoc"

export function SelectDoc() {
  const [role, setRole] = React.useState("")
  return (
    <ComponentDoc
      name="Select"
      importPath="@skiddph/prui/core"
      description="Single-select from options. Two modes: simple (options prop) and composable (Trigger/Value/Content/Item parts for custom content). Controlled via value/onChange or uncontrolled via defaultValue."
      when={[
        "Choosing one value from a known set (3-20 options)",
        "Forms — name prop renders a hidden input for native submit",
        "Use composable parts when items need avatars, badges, or grouping",
      ]}
      demos={[
        {
          title: "Simple mode (options prop)",
          render: (
            <div className="w-56">
              <Select
                value={role}
                onChange={setRole}
                placeholder="Pick a role"
                options={[
                  { label: "Admin", value: "admin" },
                  { label: "Manager", value: "manager" },
                  { label: "Member", value: "member" },
                ]}
              />
              <p className="mt-1 font-mono text-[10px] text-[var(--prui-dim)]">value: {role || "—"}</p>
            </div>
          ),
          code: `<Select
  value={role}
  onChange={setRole}
  options={[
    { label: "Admin", value: "admin" },
    { label: "Member", value: "member" },
  ]}
/>`,
        },
        {
          title: "Composable parts",
          render: (
            <div className="w-56">
              <Select value={role} onChange={setRole}>
                <SelectTrigger aria-label="Role"><SelectValue placeholder="Pick…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ),
          code: `import { Select } from '@skiddph/prui/core'

<Select value={v} onChange={setV}>
  <SelectTrigger aria-label="Role">
    <SelectValue placeholder="Pick…" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="admin">Admin</SelectItem>
  </SelectContent>
</Select>`,
        },
      ]}
      examples={[
        { title: "In a Form schema", code: `{ name: "role", label: "Role", type: "select", options: [...] }` },
      ]}
      dos={["Keyboard: open with Enter/Space, navigate arrows, select with Enter", "Always set placeholder when uncontrolled"]}
      donts={["Don't use for 2 options — use Switch or radio", "Don't ship an empty options list without an empty state"]}
    />
  )
}
