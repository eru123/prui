import * as React from "react"
import { ComponentDoc, MetaOnly, Button, Modal, confirmModal, toast, Toaster, Input, Label } from "../../components/ComponentDoc"
import { modalPropsMeta, confirmModalPropsMeta } from "prui/core"
import { Form } from "prui/app"

/* ---------- demo components (each owns its modal state) ---------- */

function SizesDemo() {
  const [size, setSize] = React.useState<null | "xs" | "sm" | "md" | "lg" | "xl">(null)
  const widths: Record<string, string> = {
    xs: "320px", sm: "448px", md: "640px", lg: "896px", xl: "1152px",
  }
  return (
    <>
      {(["xs", "sm", "md", "lg", "xl"] as const).map((s) => (
        <Button key={s} size="sm" onClick={() => setSize(s)}>{s}</Button>
      ))}
      <Modal open={size !== null} onClose={() => setSize(null)} size={size ?? "md"} ariaLabel={`${size} modal`}>
        <h2 className="text-lg font-semibold">Size {size}</h2>
        <p className="mt-1 text-sm text-[var(--prui-dim)]">
          Content width {size ? widths[size] : ""}. Pick another size button after closing; or resize with <code>maxWidth</code> / <code>padding</code>.
        </p>
      </Modal>
    </>
  )
}

function PaddingDemo() {
  const [which, setWhich] = React.useState<null | "default" | "custom" | "none">(null)
  return (
    <>
      <Button size="sm" onClick={() => setWhich("default")}>default</Button>
      <Button size="sm" onClick={() => setWhich("custom")}>padding="12px 20px"</Button>
      <Button size="sm" onClick={() => setWhich("none")}>noPadding</Button>
      <Modal open={which !== null} onClose={() => setWhich(null)} size="sm" ariaLabel="Padding demo"
        padding={which === "custom" ? "12px 20px" : undefined}
        noPadding={which === "none"}>
        {which === "none" ? (
          <div className="p-6">
            <h2 className="text-lg font-semibold">noPadding</h2>
            <p className="mt-1 text-sm text-[var(--prui-dim)]">The frame is unstyled: pad each section yourself (headers, body, footer).</p>
          </div>
        ) : which === "custom" ? (
          <>
            <h2 className="text-lg font-semibold">Custom padding</h2>
            <p className="mt-1 text-sm text-[var(--prui-dim)]">padding="12px 20px"; any CSS shorthand works.</p>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold">Default padding</h2>
            <p className="mt-1 text-sm text-[var(--prui-dim)]">Per-size defaults (sm: 24px 32px).</p>
          </>
        )}
      </Modal>
    </>
  )
}

function BlockedDemo() {
  const [open, setOpen] = React.useState(false)
  const [escapeBlocked, setEscapeBlocked] = React.useState(false)
  return (
    <>
      <Button size="sm" onClick={() => { setEscapeBlocked(false); setOpen(true) }}>closeOnOverlayClick=false</Button>
      <Button size="sm" onClick={() => { setEscapeBlocked(true); setOpen(true) }}>disableDefaultClose</Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        closeOnOverlayClick={escapeBlocked ? true : false}
        disableDefaultClose={escapeBlocked}
        size="sm"
        ariaLabel="Blocked modal"
      >
        <h2 className="text-lg font-semibold">{escapeBlocked ? "All close paths blocked" : "Overlay click blocked"}</h2>
        <p className="mt-1 text-sm text-[var(--prui-dim)]">
          {escapeBlocked
            ? "No X button, Escape and overlay clicks shake. Close only via the action below."
            : "Click the overlay or press Escape: the modal shakes, it does not close."}
        </p>
        <div className="mt-4 flex justify-end">
          <Button variant="primary" size="sm" onClick={() => setOpen(false)}>Continue</Button>
        </div>
      </Modal>
    </>
  )
}

function AsyncDemo() {
  const [open, setOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const save = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 1200))
    setSaving(false)
    setOpen(false)
    toast({ title: "Workspace renamed", variant: "success" })
  }
  return (
    <>
      <Toaster />
      <Button size="sm" onClick={() => setOpen(true)}>Rename workspace</Button>
      <Modal open={open} onClose={() => setOpen(false)} size="sm" ariaLabel="Rename workspace">
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Rename workspace</h2>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ws-name">Name</Label>
            <Input id="ws-name" defaultValue="HRLabs" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" loading={saving} onClick={() => void save()}>Save</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

function FormDemo() {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>Edit employee</Button>
      <Modal open={open} onClose={() => setOpen(false)} size="sm" noPadding ariaLabel="Edit employee">
        <div className="px-8 pb-2 pt-8">
          <h2 className="text-lg font-semibold">Edit employee</h2>
        </div>
        <div className="px-8 pb-8">
          <Form
            schema={{
              fields: [
                { name: "name", label: "Name", required: true },
                { name: "email", label: "Email", type: "email" },
              ],
              submitLabel: "Save",
            }}
            initialValues={{ name: "Ada Lovelace", email: "ada@skiddph.com" }}
            onCancel={() => setOpen(false)}
            onSubmit={async () => {
              await new Promise((r) => setTimeout(r, 600))
              setOpen(false)
              toast({ title: "Employee saved", variant: "success" })
            }}
          />
        </div>
      </Modal>
    </>
  )
}

function ScrollDemo() {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>Release notes</Button>
      <Modal open={open} onClose={() => setOpen(false)} size="md" ariaLabel="Release notes">
        <h2 className="text-lg font-semibold">Release notes</h2>
        <div className="mt-2 flex flex-col gap-2 text-sm text-[var(--prui-dim)]">
          {Array.from({ length: 12 }).map((_, i) => (
            <p key={i}>
              <strong className="text-[var(--prui-fg)]">0.{12 - i}.0</strong>; item {i + 1} of the changelog. The
              modal body scrolls independently; the overlay also scrolls when the modal is taller than the viewport.
            </p>
          ))}
        </div>
      </Modal>
    </>
  )
}

function ConfirmTypesDemo() {
  const [last, setLast] = React.useState<string | null>(null)
  const run = async (type: "danger" | "warning" | "success" | "info") => {
    const ok = await confirmModal({
      title: {
        danger: "Delete employee?",
        warning: "Revoke access?",
        success: "Publish build?",
        info: "Sync now?",
      }[type],
      message: {
        danger: "This action cannot be undone.",
        warning: "They will lose access immediately.",
        success: "The build goes live for all workspaces.",
        info: "Workspaces sync one last time before maintenance.",
      }[type],
      confirmText: { danger: "Delete", warning: "Revoke", success: "Publish", info: "Sync" }[type],
      type,
    })
    setLast(`${type}: ${ok}`)
  }
  return (
    <>
      <Button variant="danger" size="sm" onClick={() => void run("danger")}>danger</Button>
      <Button size="sm" onClick={() => void run("warning")}>warning</Button>
      <Button size="sm" onClick={() => void run("success")}>success</Button>
      <Button variant="ghost" size="sm" onClick={() => void run("info")}>info</Button>
      {last ? <span className="text-xs text-[var(--prui-dim)]">resolved → {last}</span> : null}
    </>
  )
}

function HideCloseDemo() {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>showCloseButton=false</Button>
      <Modal open={open} onClose={() => setOpen(false)} showCloseButton={false} size="xs" ariaLabel="No close button">
        <p className="text-sm">No X; provide your own close affordance (Escape still works).</p>
        <div className="mt-3 flex justify-end">
          <Button size="sm" onClick={() => setOpen(false)}>Done</Button>
        </div>
      </Modal>
    </>
  )
}

/* ---------- the page ---------- */

export function ModalDoc() {
  return (
    <ComponentDoc
      name="Modal"
      importPath="@skiddph/prui/core"
      description="The production modal: a sized, animated modal surface with the full overlay contract; focus trap with restoration, topmost-only Escape, scroll lock, and an inert background; plus blocked-close shake feedback and an imperative confirmModal() that resolves a Promise."
      when={[
        "Content that needs the size scale (xs–xl) or custom width/padding control",
        "Flows where an overlay click must NOT dismiss (shake feedback instead)",
        "Hard blockers: wizard steps where closing means losing work (disableDefaultClose)",
        "Destructive confirmations fired from anywhere: await confirmModal(...)",
        "Form dialogs with the app-layer Form (the Resource create/edit flow uses exactly this)",
      ]}
      anatomy={
        <div className="flex flex-col gap-2">
          <p>
            <code className="rounded bg-[var(--prui-raise)] px-1">&lt;Modal open onClose size padding noPadding maxWidth closeOnOverlayClick disableDefaultClose showCloseButton initialFocus ariaLabel&gt;</code>:
            one element renders the overlay + panel; children are yours.
          </p>
          <p>
            Size shortcuts (<code>xs sm md lg xl</code> props) and the <code>size</code> prop are the same control:
            sm 448 · md 640 · lg 896 · xl 1152 · xs 320px. The X, Escape, and overlay click all route through{" "}
            <code>onClose</code> unless blocked.
          </p>
        </div>
      }
      demos={[
        {
          title: "The size scale",
          desc: "xs through xl, all with per-size default padding.",
          render: <SizesDemo />,
          code: `<Modal open={open} onClose={close} size="lg">
  <h2>Quarterly report</h2>
</Modal>

// shortcut props are equivalent
<Modal open={open} onClose={close} lg>…</Modal>`,
        },
        {
          title: "Padding control",
          desc: "per-size defaults, any CSS shorthand via padding, or noPadding for full control.",
          render: <PaddingDemo />,
          code: `<Modal open={open} onClose={close} size="sm">
  …                                  {/* default 24px 32px */}
</Modal>
<Modal open={open} onClose={close} padding="12px 20px">…</Modal>
<Modal open={open} onClose={close} noPadding>
  <div className="px-8 pt-8 pb-2"><h2>Edit employee</h2></div>
  <div className="px-8 pb-8"><Form schema={schema} /></div>
</Modal>`,
        },
        {
          title: "Blocking close (shake feedback)",
          desc: "closeOnOverlayClick=false shakes on overlay clicks; disableDefaultClose also blocks Escape and hides the X.",
          render: <BlockedDemo />,
          code: `<Modal open={open} onClose={close} closeOnOverlayClick={false}>
  <p>Overlay clicks shake instead of closing.</p>
</Modal>

<Modal open={open} onClose={close} disableDefaultClose>
  {/* no X button; Escape shakes; close only via your action */}
  <Button onClick={forceContinue}>Continue</Button>
</Modal>`,
        },
        {
          title: "Async save with loading + toast",
          desc: "the modal owns the async lifecycle; the button shows loading, a toast confirms the result.",
          render: <AsyncDemo />,
          code: `const [saving, setSaving] = useState(false)
const save = async () => {
  setSaving(true)
  await api.rename(workspace.id, name)
  setSaving(false)
  setOpen(false)
  toast({ title: 'Workspace renamed', variant: 'success' })
}

<Button variant="primary" size="sm" loading={saving} onClick={save}>Save</Button>`,
        },
        {
          title: "Form dialog (noPadding + sections)",
          desc: "the Resource pattern: header and body as separately padded sections with the schema Form.",
          render: <FormDemo />,
          code: `<Modal open={open} onClose={close} size="sm" noPadding ariaLabel="Edit employee">
  <div className="px-8 pb-2 pt-8"><h2 className="text-lg font-semibold">Edit employee</h2></div>
  <div className="px-8 pb-8">
    <Form schema={schema} initialValues={row} onCancel={close} onSubmit={save} />
  </div>
</Modal>`,
        },
        {
          title: "Long content scrolls",
          desc: "the panel scrolls internally; the overlay scrolls when the panel is taller than the viewport.",
          render: <ScrollDemo />,
          code: `<Modal open={open} onClose={close} size="md" ariaLabel="Release notes">
  <h2>Release notes</h2>
  {notes.map(n => <p key={n.version}>{n.text}</p>)}
</Modal>`,
        },
        {
          title: "confirmModal(): imperative, all types",
          desc: "renders a typed confirmation from anywhere and resolves Promise<boolean>; focus starts on the confirm action and returns to the invoker.",
          render: <ConfirmTypesDemo />,
          code: `import { confirmModal } from '@skiddph/prui/core'

const ok = await confirmModal({
  title: 'Delete employee?',
  message: 'This action cannot be undone.',
  confirmText: 'Delete',
  type: 'danger',   // danger | warning | success | info | error
})
if (ok) await api.remove(row)`,
        },
        {
          title: "Hiding the close button",
          render: <HideCloseDemo />,
          code: `<Modal open={open} onClose={close} showCloseButton={false} size="xs">
  <Button onClick={close}>Done</Button>
</Modal>`,
        },
      ]}
      api={
        <div className="flex flex-col gap-4">
          <div>
            <div className="mb-1 text-sm font-semibold text-[var(--prui-fg)]">Modal</div>
            <MetaOnly meta={modalPropsMeta} />
          </div>
          <div>
            <div className="mb-1 text-sm font-semibold text-[var(--prui-fg)]">confirmModal(options)</div>
            <MetaOnly meta={confirmModalPropsMeta} />
          </div>
        </div>
      }
      examples={[
        {
          title: "Row action opening a modal",
          code: `const [editing, setEditing] = useState<Employee | null>(null)

<Button variant="ghost" size="icon" aria-label="Edit" onClick={() => setEditing(row)}>
  <Pencil className="h-3.5 w-3.5" />
</Button>

<Modal open={!!editing} onClose={() => setEditing(null)} size="sm" noPadding ariaLabel="Edit employee">
  {editing && <EditForm row={editing} onSaved={() => setEditing(null)} />}
</Modal>`,
        },
        {
          title: "Initial focus on a specific control",
          code: `const nameRef = useRef<HTMLInputElement>(null)

<Modal open={open} onClose={close} initialFocus={nameRef} size="sm">
  <Input ref={nameRef} … />
</Modal>

// other modes: "first" (default) | "container" | false`,
        },
        {
          title: "Custom width",
          code: `<Modal open={open} onClose={close} maxWidth="720px">…</Modal>`,
        },
      ]}
      dos={[
        "noPadding + sectioned content for form dialogs (the Resource pattern)",
        "Await confirmModal() for destructive confirmations; no state wiring",
        "Keep Escape working; block closes only for real data-loss cases",
        "loading on the primary action during async saves",
      ]}
      donts={[
        "Don't manage body scroll yourself; the modal locks it",
        "Don't put the only path forward inside a blocked-close modal",
        "Don't stack modals for the same task; one modal, one flow (nesting works, but split flows read better)",
        "Don't use a modal for content the user will reference while working; that's a Drawer",
      ]}
      accessibility={
        <ul className="list-disc pl-5">
          <li>role=dialog aria-modal=true, named by ariaLabel.</li>
          <li>Tab/Shift+Tab cycle inside the panel; initial focus lands on the first control ("first"), a specific element (ref), or the dialog itself ("container").</li>
          <li>Escape closes only when this modal is the topmost overlay, then focus returns to the invoker.</li>
          <li>The background is aria-hidden + inert while open; body scroll locks (counter-based, nest-safe).</li>
          <li>Blocked closes (disableDefaultClose) shake; and the shake is disabled under prefers-reduced-motion.</li>
        </ul>
      }
      composition={
        <p>
          Modal is content-agnostic: forms (app-layer Form), tables, steppers, images. It composes with toast()
          for post-save confirmation and pairs with Resource, which drives its create/edit modals exactly as shown
          above. For side-anchored panes use Drawer; for centered compound layout use Dialog.
        </p>
      }
      customization={
        <p>
          Panel surface, border, radius, and shadow come from tokens (--prui-surface, --prui-line,
          --prui-shadow-modal); the scrim is --prui-scrim with a blur. className/style land on the panel:
          width via maxWidth, gutters via padding/noPadding.
        </p>
      }
      edgeCases={[
        "closeOnOverlayClick=false + disableDefaultClose=false: overlay shakes, Escape still closes",
        "disableDefaultClose hides the X button too (there is nothing for it to do)",
        "noPadding with raw children gives a full-bleed panel; pad everything yourself",
        "confirmModal resolves false on Escape, cancel, and overlay dismiss alike",
        "Nested modals stack correctly; only the topmost answers Escape",
      ]}
      mistakes={[
        "Passing onClose that does nothing while open is stuck true (the X and Escape become no-ops)",
        "Swapping the modal's children for a loading spinner (losing form state) instead of using loading buttons",
        "Using maxWidth smaller than the size's minWidth (minWidth wins; lower it deliberately)",
      ]}
      performance={
        <p>
          Renders only while open (plus the exit-animation window). Overlay/listener work happens in the shared
          overlay infrastructure; one Modal costs one portaled subtree.
        </p>
      }
      migration={
        <p>
          Modal vs Dialog: Modal for sized/imperative/blocked-close flows (and confirmModal), Dialog for
          compound, declarative layout (Header/Title/Description/Body/Footer). Both share the same overlay
          guarantees; pick by ergonomics, not capability.
        </p>
      }
      crossLinks={[
        { label: "Dialog; the compound alternative", href: "/components/dialog" },
        { label: "Drawer / Sheet; side and bottom panels", href: "/components/drawer" },
        { label: "Toast; post-save confirmation", href: "/components/toast" },
        { label: "Form; the schema form used inside", href: "/forms" },
      ]}
    />
  )
}
