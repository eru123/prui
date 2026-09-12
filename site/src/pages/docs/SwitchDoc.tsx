import * as React from "react"
import { ComponentDoc, Switch } from "../../components/ComponentDoc"

export function SwitchDoc() {
  const [on, setOn] = React.useState(true)
  return (
    <ComponentDoc
      name="Switch"
      importPath="@skiddph/prui/core"
      description="Binary toggle with immediate effect: no submit required. role=switch with full keyboard support; controlled or uncontrolled."
      when={[
        "Settings and preferences that apply instantly",
        "Feature flags, enable/disable states",
      ]}
      demos={[
        {
          title: "Controlled",
          render: (
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={on} onChange={setOn} aria-label="Email notifications" />
              Email notifications {on ? "on" : "off"}
            </label>
          ),
          code: `const [on, setOn] = useState(true)
<Switch checked={on} onChange={setOn} aria-label="Notifications" />`,
        },
        {
          title: "Disabled",
          render: <Switch disabled checked aria-label="Locked" />,
          code: `<Switch disabled checked aria-label="Locked" />`,
        },
      ]}
      examples={[{ title: "In Settings toggles", code: `<SettingsPage toggles={[{ id: "notif", label: "Notifications", onChange: save }]} />` }]}
      dos={["Label every switch (aria-label or visible text)", "Apply the effect immediately on change"]}
      donts={["Don't use for things needing confirmation: use a checkbox or dialog", "Don't hide the current state; show the value beside it"]}
    />
  )
}
