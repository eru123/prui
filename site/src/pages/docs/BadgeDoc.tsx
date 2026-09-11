import { ComponentDoc, Badge } from "../../components/ComponentDoc"

export function BadgeDoc() {
  return (
    <ComponentDoc
      name="Badge"
      importPath="@skiddph/prui/core"
      description="Compact status labels and counts. Six variants: default, brand, ok, warn, danger, outline."
      when={[
        "Entity status: active/leave/onboarding",
        "Categorical tags, counts, version chips",
      ]}
      demos={[
        {
          title: "All variants",
          render: (
            <>
              <Badge>default</Badge>
              <Badge variant="brand">brand</Badge>
              <Badge variant="ok">ok</Badge>
              <Badge variant="warn">warn</Badge>
              <Badge variant="danger">danger</Badge>
              <Badge variant="outline">outline</Badge>
            </>
          ),
          code: `<Badge variant="ok">active</Badge>
<Badge variant="warn">beta</Badge>
<Badge variant="danger">failed</Badge>`,
        },
      ]}
      examples={[{ title: "Status column in a table", code: `{ key: "status", label: "Status", render: (r) => <Badge variant={r.on ? "ok" : "warn"}>{r.status}</Badge> }` }]}
      dos={["Map semantics to variants consistently: ok=healthy, warn=attention, danger=failing"]}
      donts={["Don't put long text in badges", "Don't use badges for actions — they're labels"]}
    />
  )
}
