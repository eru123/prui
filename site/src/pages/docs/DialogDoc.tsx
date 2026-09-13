import * as React from "react"
import { ComponentDoc, MetaOnly, Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter, Input, Label, Alert, RadioGroup, Radio, Checkbox } from "../../components/ComponentDoc"
import { dialogPropsMeta, dialogBodyPropsMeta } from "prui/core"

/* ---------- demo components (each owns its dialog state) ---------- */

function BasicDemo() {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Discard draft?</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Discard draft?</DialogTitle>
            <DialogDescription>The changes you made will be lost. This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Keep editing</Button>
            <Button variant="danger" onClick={() => setOpen(false)}>Discard</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function FormDemo() {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Invite teammate</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite teammate</DialogTitle>
            <DialogDescription>They receive an email with a join link that expires in 7 days.</DialogDescription>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-email">Email</Label>
              <Input id="invite-email" type="email" placeholder="name@company.com" />
            </div>
            <RadioGroup label="Role" defaultValue="member">
              <Radio value="member" label="Member; can edit" />
              <Radio value="viewer" label="Viewer; read only" />
            </RadioGroup>
            <Checkbox label="Send a welcome email" defaultChecked />
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setOpen(false)}>Send invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function InitialFocusDemo() {
  const [open, setOpen] = React.useState(false)
  const bodyRef = React.useRef<HTMLDivElement>(null)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Focus the body region</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm" initialFocus={bodyRef}>
          <DialogHeader>
            <DialogTitle>Terms</DialogTitle>
            <DialogDescription>initialFocus="container" lands focus on the panel itself; nothing inside is focused.</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div ref={bodyRef} tabIndex={-1} className="text-sm text-[var(--prui-dim)] outline-none">
              By continuing you agree to the fair-use policy… (Tab from here reaches the first control.)
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="primary" onClick={() => setOpen(false)}>Agree</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function HideCloseDemo() {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>hideClose</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm" hideClose>
          <DialogHeader>
            <DialogTitle>Mandatory choice</DialogTitle>
            <DialogDescription>No X; pick one of the actions below (Escape still closes).</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Later</Button>
            <Button variant="primary" onClick={() => setOpen(false)}>Enable 2FA</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function NestedDemo() {
  const [outer, setOuter] = React.useState(false)
  const [inner, setInner] = React.useState(false)
  return (
    <>
      <Button onClick={() => setOuter(true)}>Nested dialogs</Button>
      <Dialog open={outer} onOpenChange={setOuter}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Publish build</DialogTitle>
            <DialogDescription>The inner confirm stacks on top; only it answers Escape.</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p className="text-sm text-[var(--prui-dim)]">Press Escape with the inner dialog open: the inner one closes, this one stays.</p>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOuter(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => setInner(true)}>Force publish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={inner} onOpenChange={setInner}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Really force it?</DialogTitle>
            <DialogDescription>Deploys over the running build.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setInner(false)}>No</Button>
            <Button variant="danger" onClick={() => { setInner(false); setOuter(false) }}>Force</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function ScrollDemo() {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Long content</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sync log</DialogTitle>
            <DialogDescription>The panel caps at 85vh and scrolls internally.</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="flex flex-col gap-2 text-sm text-[var(--prui-dim)]">
              {Array.from({ length: 14 }).map((_, i) => (
                <p key={i}>[{String(i + 1).padStart(2, "0")}:00] batch {i + 1} synced. 42 records, 0 errors.</p>
              ))}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="primary" onClick={() => setOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function AlertInDialogDemo() {
  const [open, setOpen] = React.useState(false)
  const [error, setError] = React.useState(false)
  return (
    <>
      <Button onClick={() => { setError(false); setOpen(true) }}>Validation feedback</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename workspace</DialogTitle>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-3">
            {error ? (
              <Alert variant="danger" title="Name taken">That workspace name is already in use.</Alert>
            ) : null}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rename-ws">Name</Label>
              <Input id="rename-ws" defaultValue="HRLabs" aria-invalid={error || undefined} />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setError((e) => !e)}>{error ? "Retry" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

/* ---------- the page ---------- */

export function DialogDoc() {
  return (
    <ComponentDoc
      name="Dialog"
      importPath="@skiddph/prui/core"
      description="The compound modal: declarative parts (Content, Header, Title, Description, Body, Footer) for quick, consistent dialogs. Portaled and focus-trapped with restoration, topmost-only Escape, scroll lock, and an inert background."
      when={[
        "Confirmations and short focused tasks with a title/description/actions shape",
        "Small forms where a full page is too much and inline is too little",
        "Detail reads (logs, terms, previews) with scrollable bodies",
        "Any modal where the standard header/body/footer rhythm fits",
      ]}
      anatomy={
        <div className="flex flex-col gap-2">
          <p>
            <code className="rounded bg-[var(--prui-raise)] px-1">&lt;Dialog open onOpenChange&gt;</code> holds state
            (controlled or uncontrolled); <code className="rounded bg-[var(--prui-raise)] px-1">&lt;DialogContent ariaLabel initialFocus hideClose&gt;</code>{" "}
            renders the panel and carries the overlay behavior; the rest are layout parts:
          </p>
          <ul className="list-disc pl-5">
            <li><strong>DialogHeader</strong>; top padding + column stack for Title/Description</li>
            <li><strong>DialogTitle</strong>; an h2 wired to aria-labelledby (names the dialog)</li>
            <li><strong>DialogDescription</strong>; the muted explainer line</li>
            <li><strong>DialogBody</strong>; consistent x/y gutters for content (flush drops vertical padding)</li>
            <li><strong>DialogFooter</strong>; bottom padding + right-aligned action row</li>
          </ul>
        </div>
      }
      demos={[
        {
          title: "Confirmation",
          desc: "the canonical shape: title, description, cancel + danger action.",
          render: <BasicDemo />,
          code: `<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="max-w-sm">
    <DialogHeader>
      <DialogTitle>Discard draft?</DialogTitle>
      <DialogDescription>The changes will be lost. This cannot be undone.</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="ghost" onClick={() => setOpen(false)}>Keep editing</Button>
      <Button variant="danger" onClick={() => setOpen(false)}>Discard</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`,
        },
        {
          title: "Form with DialogBody",
          desc: "DialogBody pads the content column; controls compose freely inside.",
          render: <FormDemo />,
          code: `<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>Invite teammate</DialogTitle>
      <DialogDescription>They receive an email with a join link.</DialogDescription>
    </DialogHeader>
    <DialogBody className="flex flex-col gap-3">
      <Label htmlFor="invite-email">Email</Label>
      <Input id="invite-email" type="email" />
      <RadioGroup label="Role" defaultValue="member">
        <Radio value="member" label="Member" />
        <Radio value="viewer" label="Viewer" />
      </RadioGroup>
    </DialogBody>
    <DialogFooter>
      <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      <Button variant="primary" onClick={() => setOpen(false)}>Send invite</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`,
        },
        {
          title: "Initial focus modes",
          desc: '"first" (default) focuses the first control; "container" focuses the panel; a ref focuses a specific element.',
          render: <InitialFocusDemo />,
          code: `<DialogContent initialFocus={bodyRef}>       // specific element
<DialogContent initialFocus="container">  // the panel itself
<DialogContent initialFocus="first">      // default
<DialogContent initialFocus={false}>      // leave focus alone`,
        },
        {
          title: "Nested dialogs",
          desc: "the overlay stack guarantees only the topmost dialog answers Escape.",
          render: <NestedDemo />,
          code: `// both dialogs share one parent; the inner one stacks above
<Dialog open={outer} onOpenChange={setOuter}>…opens the inner…</Dialog>
<Dialog open={inner} onOpenChange={setInner}>…</Dialog>`,
        },
        {
          title: "Inline validation feedback",
          desc: "an Alert inside DialogBody for server-side errors; the dialog stays open, focus is already inside.",
          render: <AlertInDialogDemo />,
          code: `{error && (
  <Alert variant="danger" title="Name taken">That name is already in use.</Alert>
)}`,
        },
        {
          title: "Long, scrollable content",
          render: <ScrollDemo />,
          code: `<DialogContent className="max-w-md">
  <DialogHeader>…</DialogHeader>
  <DialogBody>{logLines.map(…)}</DialogBody>
  <DialogFooter>…</DialogFooter>
</DialogContent>`,
        },
        {
          title: "Hiding the close button",
          render: <HideCloseDemo />,
          code: `<DialogContent hideClose>…</DialogContent>`,
        },
      ]}
      api={
        <div className="flex flex-col gap-4">
          <div>
            <div className="mb-1 text-sm font-semibold text-[var(--prui-fg)]">Dialog / DialogContent</div>
            <MetaOnly meta={dialogPropsMeta} />
          </div>
          <div>
            <div className="mb-1 text-sm font-semibold text-[var(--prui-fg)]">DialogBody</div>
            <MetaOnly meta={dialogBodyPropsMeta} />
          </div>
        </div>
      }
      examples={[
        {
          title: "Controlled from any event",
          code: `const [open, setOpen] = useState(false)

<Button onClick={() => setOpen(true)}>Invite</Button>
<Dialog open={open} onOpenChange={setOpen}>…</Dialog>`,
        },
        {
          title: "Uncontrolled with defaultOpen",
          code: `// no state needed when the dialog manages itself
<Dialog defaultOpen={false}>
  <DialogTrigger />   // wire your own trigger via onOpenChange state
</Dialog>

// in practice uncontrolled mode pairs with a small wrapper:
function MyDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false)
  return <>
    <Button onClick={() => setOpen(true)}>{trigger}</Button>
    <Dialog open={open} onOpenChange={setOpen}>…</Dialog>
  </>
}`,
        },
        {
          title: "onClose as a controlled-close guard",
          code: `<Dialog open={open} onOpenChange={(next) => {
  if (dirty && !next) return   // ignore close attempts while dirty
  setOpen(next)
}}>`,
        },
        {
          title: "Danger footer rhythm",
          code: `<DialogFooter>
  <Button variant="ghost" onClick={cancel}>Cancel</Button>
  <Button variant="danger" onClick={destroy}>Delete project</Button>
</DialogFooter>`,
        },
      ]}
      dos={[
        "Use DialogTitle + DialogDescription; they name and explain the dialog accessibly",
        "DialogBody for content gutters; DialogFooter for the action row",
        "One primary action per footer; ghost for cancel",
        "Return focus is automatic; don't fight it",
      ]}
      donts={[
        "Don't open dialogs on page load",
        "Don't render DialogContent outside its Dialog (context required)",
        "Don't build long wizards here; split pages or use a Drawer",
        "Don't add your own overlay/scroll-lock; it's built in",
      ]}
      accessibility={
        <ul className="list-disc pl-5">
          <li>role=dialog aria-modal; named by DialogTitle via aria-labelledby, or ariaLabel when there's no title.</li>
          <li>Focus traps inside the panel; initial focus is "first" by default and configurable per mode.</li>
          <li>Escape closes only the topmost open overlay; focus returns to the invoker.</li>
          <li>Background aria-hidden + inert; body scroll locked while open.</li>
          <li>Description is read alongside the title by screen readers; put the stakes there.</li>
        </ul>
      }
      composition={
        <p>
          The parts are layout primitives: compose any controls in DialogBody (forms, RadioGroups, Alerts,
          Textareas). Dialog nests in Dialog and stacks with Modal/Drawer through the shared overlay
          infrastructure. For sized panels, blocked closes, or imperative use, switch to Modal.
        </p>
      }
      customization={
        <p>
          Panel tokens are shared with Modal (surface, line, shadow-modal); the scrim is --prui-scrim. Width via
          className (max-w-*); DialogBody gutters are px-4; add className to tighten or flush to remove vertical
          padding.
        </p>
      }
      edgeCases={[
        "DialogContent without an id'd trigger restores focus to whatever was focused when it opened",
        "hideClose leaves Escape and the backdrop as close paths",
        "Controlled open without onOpenChange makes Escape and the backdrop no-ops",
        "Panels cap at 85vh and scroll internally; taller content never pushes the footer off-screen",
      ]}
      mistakes={[
        "Skipping DialogDescription on consequential actions (screen-reader users lose the stakes)",
        "Full-width inputs without a Label (or aria-label) inside the body",
        "Using onOpenChange only to log; it must actually set state in controlled mode",
      ]}
      performance={
        <p>Parts are thin layout wrappers; the panel renders only while open. No listeners beyond the shared overlay stack.</p>
      }
      migration={
        <p>
          Coming from Modal: map size → className max-w-*, Modal padding → DialogBody, and onClose →
          onOpenChange. Imperative flows (confirmModal) have no Dialog equivalent; keep those on Modal.
        </p>
      }
      crossLinks={[
        { label: "Modal; sized and imperative modals", href: "/components/modal" },
        { label: "Drawer / Sheet; side and bottom panels", href: "/components/drawer" },
        { label: "Alert; inline status inside dialogs", href: "/components/alert" },
        { label: "Input; controls for dialog forms", href: "/components/input" },
      ]}
    />
  )
}
