import { ComponentDoc } from "../../components/ComponentDoc"
import { Separator, separatorPropsMeta } from "prui/core"
import { PropsTable } from "../../components/Playground"

export function SeparatorDoc() {
  return (
    <ComponentDoc
      name="Separator"
      importPath="@skiddph/prui/core"
      description="A thin divider between content groups, horizontal by default with a vertical variant."
      when={["Splitting tool panels and settings groups", "Between stacked sections in a card or panel"]}
      demos={[
        {
          title: "Horizontal",
          render: (
            <div className="w-72">
              <p className="text-sm text-[var(--prui-fg)]">Account</p>
              <Separator className="my-3" />
              <p className="text-sm text-[var(--prui-dim)]">Sessions and security</p>
            </div>
          ),
          code: `<p>Account</p>
<Separator className="my-3" />
<p>Sessions and security</p>`,
        },
        {
          title: "Vertical",
          render: (
            <div className="flex h-8 items-center gap-3">
              <span className="text-sm">Edit</span>
              <Separator orientation="vertical" />
              <span className="text-sm">Share</span>
              <Separator orientation="vertical" />
              <span className="text-sm">Delete</span>
            </div>
          ),
          code: `<div className="flex h-8 items-center gap-3">
  <span>Edit</span>
  <Separator orientation="vertical" />
  <span>Share</span>
</div>`,
        },
      ]}
      api={<PropsTable meta={separatorPropsMeta} />}
      examples={[{ title: "In a settings stack", code: `<SettingsField … />\n<Separator />\n<SettingsField … />` }]}
      dos={["Prefer whitespace over extra separators", "Use vertical inside rows"]}
      donts={["Stack multiple separators", "Use separators as visual filler"]}
    />
  )
}
