import { ComponentDoc } from "../../components/ComponentDoc"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Avatar, Badge } from "prui/core"
import { cardPropsMeta } from "prui/core"
import { PropsTable } from "../../components/Playground"

export function CardDoc() {
  return (
    <ComponentDoc
      name="Card"
      importPath="@skiddph/prui/core"
      description="A surfaced container with header, title, description, content and footer parts — the base of every dashboard widget and settings section."
      when={[
        "Grouping related content on a surface above the page background",
        "Dashboard KPI tiles and preview panels",
        "Composing higher-level components (StatRow and Settings use it)",
      ]}
      demos={[
        {
          title: "Full anatomy",
          render: (
            <Card className="w-80">
              <CardHeader>
                <CardTitle>Card title</CardTitle>
                <CardDescription>Supporting description text</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-[var(--prui-dim)]">Card body content.</CardContent>
              <CardFooter className="justify-end gap-2">
                <Button variant="ghost" size="sm">Cancel</Button>
                <Button variant="primary" size="sm">Save</Button>
              </CardFooter>
            </Card>
          ),
          code: `<Card>
  <CardHeader>
    <CardTitle>Card title</CardTitle>
    <CardDescription>Supporting description text</CardDescription>
  </CardHeader>
  <CardContent>Card body content.</CardContent>
  <CardFooter className="justify-end gap-2">
    <Button variant="ghost" size="sm">Cancel</Button>
    <Button variant="primary" size="sm">Save</Button>
  </CardFooter>
</Card>`,
        },
        {
          title: "With avatar and badge",
          render: (
            <Card className="w-80">
              <CardHeader className="flex-row items-center gap-3">
                <Avatar fallback="Ada Lovelace" />
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-sm">Ada Lovelace</CardTitle>
                  <CardDescription>Engineering</CardDescription>
                </div>
                <Badge variant="ok">active</Badge>
              </CardHeader>
              <CardContent className="text-sm text-[var(--prui-dim)]">Last active 2 hours ago.</CardContent>
            </Card>
          ),
          code: `<Card>
  <CardHeader className="flex-row items-center gap-3">
    <Avatar fallback="Ada Lovelace" />
    <div className="min-w-0 flex-1">
      <CardTitle className="text-sm">Ada Lovelace</CardTitle>
    </div>
    <Badge variant="ok">active</Badge>
  </CardHeader>
  <CardContent>Last active 2 hours ago.</CardContent>
</Card>`,
        },
      ]}
      api={<PropsTable meta={cardPropsMeta} />}
      examples={[
        {
          title: "As a clickable link card",
          code: `<Card asChild>
  <a href="/reports" className="block p-4 hover:border-[var(--prui-dim)]">
    <CardTitle>Monthly report</CardTitle>
  </a>
</Card>`,
        },
      ]}
      dos={["Compose from the exported parts instead of padding the root", "Keep one topic per card"]}
      donts={["Nest cards inside cards", "Use a Card for pure layout columns — use flex/grid"]}
    />
  )
}

