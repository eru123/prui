import { ComponentDoc } from "../../components/ComponentDoc"
import { ScrollArea, scrollAreaPropsMeta, Badge } from "prui/core"
import { PropsTable } from "../../components/Playground"

const items = Array.from({ length: 12 }, (_, i) => `Notification ${i + 1}`)

export function ScrollAreaDoc() {
  return (
    <ComponentDoc
      name="ScrollArea"
      importPath="@skiddph/prui/core"
      description="A themed scroll container with thin token-colored scrollbars: the same treatment as the app sidebar rail."
      when={["Fixed-height feeds, lists and sidebars", "Anywhere native scrollbars would break the theme"]}
      demos={[
        {
          title: "Fixed-height feed",
          render: (
            <ScrollArea className="h-40 w-72 rounded-[var(--prui-radius)] border border-[var(--prui-line)] p-3">
              <ul className="flex flex-col gap-2">
                {items.map((item) => (
                  <li key={item} className="flex items-center justify-between text-sm text-[var(--prui-fg)]">
                    {item}
                    <Badge variant="default">new</Badge>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          ),
          code: `<ScrollArea className="h-40 w-72 rounded-[var(--prui-radius)] border p-3">
  <ul>{items.map((i) => <li key={i}>{i}</li>)}</ul>
</ScrollArea>`,
        },
      ]}
      api={<PropsTable meta={scrollAreaPropsMeta} />}
      examples={[{ title: "Inline in the App shell", code: `<div className="h-full overflow-y-auto scrollbar-thin">{nav}</div>` }]}
      dos={["Give it an explicit height", "Keep content keyboard-scrollable"]}
      donts={["Wrap the whole page: let the body scroll", "Nest scroll areas inside scroll areas"]}
    />
  )
}
