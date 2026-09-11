import { ComponentDoc, Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ComponentDoc"

export function TabsDoc() {
  return (
    <ComponentDoc
      name="Tabs"
      importPath="@skiddph/prui/core"
      description="Alternate between peer views within the same context. Controlled (value/onChange) or uncontrolled (defaultValue)."
      when={[
        "Detail/Activity/Files style peer views under one entity",
        "Narrowing a table between two or three fixed slices",
      ]}
      demos={[
        {
          title: "Basic",
          render: (
            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
              </TabsList>
              <TabsContent value="details">Detail content</TabsContent>
              <TabsContent value="activity">Activity content</TabsContent>
              <TabsContent value="files">Files content</TabsContent>
            </Tabs>
          ),
          code: `<Tabs defaultValue="details">
  <TabsList>
    <TabsTrigger value="details">Details</TabsTrigger>
    <TabsTrigger value="activity">Activity</TabsTrigger>
  </TabsList>
  <TabsContent value="details">…</TabsContent>
  <TabsContent value="activity">…</TabsContent>
</Tabs>`,
        },
      ]}
      examples={[{ title: "Controlled", code: `<Tabs value={tab} onChange={setTab}>…</Tabs>` }]}
      dos={["2-5 tabs; more → use a select or nav", "Tab labels short nouns, no sentences"]}
      donts={["Don't use for wizard steps (ordered) — tabs are peers", "Don't lazy-load heavy tab content without a loading state"]}
    />
  )
}
