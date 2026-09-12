import * as React from "react"
import { ComponentDoc, confirmModal, Button } from "../../components/ComponentDoc"

export function ModalDoc() {
  const [, setBasic] = React.useState(false)
  const [, setBlocked] = React.useState(false)
  const [, setNoPad] = React.useState(false)
  const [confirmResult, setConfirmResult] = React.useState<boolean | null>(null)

  return (
    <ComponentDoc
      name="Modal"
      importPath="@skiddph/prui/core"
      description="The production modal from icanhelp-tracker, ported to PRUI tokens: size scale (xs-xl), open/close animation, shake feedback when a close is blocked, overlay blur, body scroll lock, and an imperative confirmModal() that returns a Promise."
      when={[
        "Dialogs that need the full size scale and controlled padding",
        "Flows where overlay-click must NOT close (closeOnOverlayClick={false} shakes instead)",
        "Confirmations anywhere in the codebase without wiring state: await confirmModal(...)",
      ]}
      anatomy={
        <p>
          <code className="rounded bg-[var(--prui-raise)] px-1">&lt;Modal open onClose size noPadding&gt;</code> renders overlay +
          content; Escape and the X call <code>onClose</code> unless <code>disableDefaultClose</code>.
        </p>
      }
      demos={[
        {
          title: "Sizes",
          render: (
            <>
              <Button size="sm" onClick={() => setBasic(true)}>sm</Button>
              <Button size="sm" onClick={() => setNoPad(true)}>noPadding</Button>
            </>
          ),
          code: `<Modal open={open} onClose={close} size="sm">
  <h2>Title</h2>
</Modal>`,
        },
        {
          title: "Blocked close = shake",
          desc: "clicking the overlay with closeOnOverlayClick=false shakes the modal instead of closing",
          render: <Button size="sm" onClick={() => setBlocked(true)}>Try to close me</Button>,
          code: `<Modal open={open} onClose={close} closeOnOverlayClick={false}>
  <p>Click the overlay: the modal shakes, it does not close.</p>
</Modal>`,
        },
        {
          title: "confirmModal(): imperative",
          desc: confirmResult === null ? "resolves a Promise<boolean>; no state wiring needed" : `last result: ${String(confirmResult)}`,
          render: (
            <Button
              variant="danger"
              size="sm"
              onClick={async () => setConfirmResult(await confirmModal({
                title: "Delete employee?",
                message: "This action cannot be undone.",
                confirmText: "Delete",
                type: "danger",
              }))}
            >
              confirmModal()
            </Button>
          ),
          code: `import { confirmModal } from '@skiddph/prui/core'

const ok = await confirmModal({
  title: 'Delete employee?',
  message: 'This action cannot be undone.',
  confirmText: 'Delete',
  type: 'danger',
})
if (ok) await api.remove(row)`,
        },
      ]}
      examples={[
        {
          title: "Full form dialog",
          code: `<Modal open={open} onClose={close} size="sm" noPadding>
  <div className="px-8 pt-8 pb-2"><h2>Edit employee</h2></div>
  <div className="px-8 pb-8"><Form schema={schema} onSubmit={save} /></div>
</Modal>`,
        },
      ]}
      dos={[
        "noPadding + your own section padding for form dialogs",
        "await confirmModal() for destructive confirmations",
        "Escape always works unless disableDefaultClose: keep it that way",
      ]}
      donts={[
        "Don't stack modals; redesign the flow",
        "Don't manage body scroll yourself: the modal locks it",
        "Don't put critical info only inside a blocked-close modal",
      ]}
    />
  )
}
