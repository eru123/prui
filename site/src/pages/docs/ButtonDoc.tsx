import * as React from "react"
import { ComponentDoc, Button } from "../../components/ComponentDoc"

export function ButtonDoc() {
  const [loading, setLoading] = React.useState(false)
  return (
    <ComponentDoc
      name="Button"
      importPath="@skiddph/prui/core"
      description="The action trigger. Four variants cover the whole hierarchy: primary (one per view), default, ghost, and danger. Sizes sm/md/lg plus icon for square icon-only buttons."
      when={[
        "Triggering actions: save, submit, navigate, delete",
        "Primary variant: the single main action of a view: never two primaries side by side",
        "Ghost: toolbar and table-row actions where chrome would be noise",
        "Danger: destructive actions, always with a confirmation for irreversible ones",
      ]}
      anatomy={
        <p>
          <code className="rounded bg-[var(--prui-raise)] px-1">&lt;Button variant size loading disabled asChild&gt;</code>: a single
          element; no wrapper parts. <code>asChild</code> merges classes and behavior onto its child (links stay links).
        </p>
      }
      demos={[
        {
          title: "Variants",
          render: (
            <>
              <Button variant="primary">Save changes</Button>
              <Button variant="default">Cancel</Button>
              <Button variant="ghost">Dismiss</Button>
              <Button variant="danger">Delete</Button>
            </>
          ),
          code: `<Button variant="primary">Save changes</Button>
<Button variant="default">Cancel</Button>
<Button variant="ghost">Dismiss</Button>
<Button variant="danger">Delete</Button>`,
        },
        {
          title: "Sizes",
          render: (
            <>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button size="icon" aria-label="Add">+</Button>
            </>
          ),
          code: `<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="icon" aria-label="Add"><Plus /></Button>`,
        },
        {
          title: "Loading state",
          desc: "loading disables the button and shows a spinner; pair it with your async handler.",
          render: (
            <Button
              variant="primary"
              loading={loading}
              onClick={() => {
                setLoading(true)
                setTimeout(() => setLoading(false), 1500)
              }}
            >
              Save changes
            </Button>
          ),
          code: `const [loading, setLoading] = useState(false)

<Button variant="primary" loading={loading} onClick={save}>
  Save changes
</Button>`,
        },
        {
          title: "asChild: button styles on a link",
          render: (
            <Button asChild variant="default">
              <a href="https://prui.skiddph.com">Open docs</a>
            </Button>
          ),
          code: `<Button asChild variant="default">
  <a href="/docs">Open docs</a>
</Button>`,
        },
      ]}
      examples={[
        {
          title: "Form submit pair",
          code: `<div className="flex justify-end gap-2">
  <Button variant="ghost" onClick={onCancel}>Cancel</Button>
  <Button variant="primary" type="submit" loading={saving}>Save</Button>
</div>`,
        },
        {
          title: "Row actions (ghost + icon)",
          code: `<Button variant="ghost" size="icon" aria-label="Edit" onClick={() => edit(row)}>
  <Pencil className="h-3.5 w-3.5" />
</Button>`,
        },
      ]}
      dos={[
        "One primary button per view",
        "Always aria-label icon-only buttons",
        "Use loading instead of swapping the label text",
      ]}
      donts={[
        "Don't nest buttons (use asChild for links)",
        "Don't use danger without a confirm step for irreversible actions",
        "Don't use primary for cancel/dismiss",
      ]}
    />
  )
}
