import { ComponentDoc, Avatar, Separator } from "../../components/ComponentDoc"

export function AvatarDoc() {
  return (
    <ComponentDoc
      name="Avatar"
      importPath="@skiddph/prui/core"
      description="User/entity thumbnail with automatic initials fallback (from alt) and image error fallback. Three sizes."
      when={["User identity in headers, tables, comment lists"]}
      demos={[
        {
          title: "Sizes and fallbacks",
          render: (
            <>
              <Avatar alt="Ada Lovelace" size="sm" />
              <Avatar alt="Grace Hopper" size="md" />
              <Avatar alt="Linus Torvalds" size="lg" />
              <Separator orientation="vertical" className="h-8" />
              <Avatar src="/broken.png" alt="Fallback Example" size="md" />
            </>
          ),
          code: `<Avatar alt="Ada Lovelace" />          // initials "AL"
<Avatar src={user.img} alt={user.name} />
<Avatar fallback="PRUI" alt="" />       // explicit fallback`,
        },
      ]}
      examples={[{ title: "In a table cell", code: `{ key: "assignee", render: (r) => <Avatar alt={r.assignee} src={r.avatar} /> }` }]}
      dos={["Always pass alt (drives initials)"]}
      donts={["Don't stretch non-square images: object-cover crops automatically"]}
    />
  )
}
