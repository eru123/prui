import * as React from "react"
import { ComponentDoc } from "../../components/ComponentDoc"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Button, Input, Label, dialogPropsMeta } from "prui/core"
import { PropsTable } from "../../components/Playground"

export function DialogDoc() {
  const [open, setOpen] = React.useState(false)
  const [formOpen, setFormOpen] = React.useState(false)
  return (
    <ComponentDoc
      name="Dialog"
      importPath="@skiddph/prui/core"
      description="A composable modal dialog built from parts (content, header, title, description, footer) with overlay, Escape-to-close and scroll lock."
      when={[
        "Focused tasks that need confirmation or short input",
        "Content that must interrupt the current flow",
        "For irreversible confirmations prefer confirmModal() from the same package",
      ]}
      demos={[
        {
          title: "Confirmation",
          render: (
            <>
              <Button onClick={() => setOpen(true)}>Open dialog</Button>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Confirm action</DialogTitle>
                    <DialogDescription>This action cannot be undone.</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button variant="primary" onClick={() => setOpen(false)}>Confirm</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          ),
          code: `<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="max-w-sm">
    <DialogHeader>
      <DialogTitle>Confirm action</DialogTitle>
      <DialogDescription>This action cannot be undone.</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      <Button variant="primary" onClick={() => setOpen(false)}>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`,
        },
        {
          title: "Short form",
          render: (
            <>
              <Button variant="default" onClick={() => setFormOpen(true)}>Invite teammate</Button>
              <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Invite teammate</DialogTitle>
                    <DialogDescription>They get an email invitation.</DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="invite-email">Email</Label>
                    <Input id="invite-email" type="email" placeholder="name@company.com" />
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Button>
                    <Button variant="primary" onClick={() => setFormOpen(false)}>Send invite</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          ),
          code: `<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="max-w-sm">
    <DialogHeader>
      <DialogTitle>Invite teammate</DialogTitle>
    </DialogHeader>
    <Label htmlFor="invite-email">Email</Label>
    <Input id="invite-email" type="email" />
    <DialogFooter>…</DialogFooter>
  </DialogContent>
</Dialog>`,
        },
      ]}
      api={<PropsTable meta={dialogPropsMeta} />}
      examples={[
        {
          title: "Controlled from any event",
          code: `const [open, setOpen] = useState(false)
<Dialog open={open} onOpenChange={setOpen}>…</Dialog>`,
        },
      ]}
      dos={["Keep dialogs short: move long tasks to a page", "Always provide a visible cancel path"]}
      donts={["Open dialogs on page load", "Nest dialogs inside dialogs"]}
    />
  )
}
