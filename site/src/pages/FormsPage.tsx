import * as React from "react"
import { Modal } from "prui/core"
import { Form, FormGroup, FormInput, FormButton, type SafeParseSchema } from "prui/forms"
import { CodeView } from "../components/CodeView"
import { MetaOnly } from "../components/Playground"
import { formPropsMeta, formGroupPropsMeta, formInputPropsMeta, formButtonPropsMeta } from "prui/forms"

/**
 * /forms; the higher-order form set: single-type inputs with full attrs,
 * responsive groups, zod-optional validation, and buttons that drive a
 * form from outside its scope (the modal footer case).
 */

const emailSchema: SafeParseSchema = {
  safeParse(data) {
    const v = data as { email?: string; name?: string }
    const issues: { path: string[]; message: string }[] = []
    if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) {
      issues.push({ path: ["email"], message: "Enter a valid email address." })
    }
    if ((v.name ?? "").length > 0 && v.name!.trim().split(" ").length < 2) {
      issues.push({ path: ["name"], message: "Use first and last name." })
    }
    return issues.length ? { success: false, error: { issues } } : { success: true, data }
  },
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-sm text-[var(--prui-dim)]">{children}</p>
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-12 scroll-mt-20">
      <h2 className="mb-3 text-base font-semibold text-[var(--prui-fg)]">{title}</h2>
      {children}
    </section>
  )
}

export function FormsPage() {
  const [modalOpen, setModalOpen] = React.useState(false)
  const [savedName, setSavedName] = React.useState<string | null>(null)

  return (
    <div className="mx-auto w-full max-w-content px-4 pb-20 pt-8 md:px-6">
      <div className="mb-2 font-mono text-xs text-[var(--prui-dim)]">forms</div>
      <h1 className="mb-1.5 text-title font-bold tracking-tight text-[var(--prui-fg)]">Forms</h1>
      <p className="mb-8 max-w-read text-lede text-[var(--prui-dim)]">
        Higher-order form components from <code className="rounded bg-[var(--prui-raise)] px-1">@skiddph/prui/forms</code>:
        one input component for every type, groups with responsive columns, validation with an optional zod-shaped
        schema, and buttons that can live outside the form they control.
      </p>

      <Section id="forms-basics" title="FormInput: every control, one component">
        <Hint>
          Set type and you get the right control with label, required marker, and a bottom message. Validation errors
          always win the bottom slot; below one, your own info, warning, or success message can show.
        </Hint>
        <Form id="profile" initialValues={{ email: "", website: "", bio: "", notify: true }}>
          <FormInput name="email" label="Email" type="email" required placeholder="you@company.com" help="Work email, not personal." />
          <FormInput
            name="website"
            label="Website"
            type="url"
            message={{ message: "Adding one makes your profile easier to verify.", type: "info" }}
          />
          <FormInput name="bio" label="Bio" type="textarea" rows={3} maxLength={200} placeholder="A couple of lines about you" />
          <FormInput name="notify" label="Email me product updates" type="switch" />
        </Form>
      </Section>

      <Section id="forms-groups" title="FormGroup: responsive column layout">
        <Hint>
          Group inputs on one line and set columns per breakpoint. The card below renders one column on mobile, two on
          tablet, three on desktop.
        </Hint>
        <Form id="address" initialValues={{ street: "", city: "", zip: "", country: "" }}>
          <FormGroup label="Shipping address" description="Columns per breakpoint: base 1, md 2, lg 3." columns={{ base: 1, md: 2, lg: 3 }}>
            <FormInput name="street" label="Street" required />
            <FormInput name="city" label="City" required />
            <FormInput name="zip" label="Postal code" required />
            <FormInput name="country" label="Country" type="select" options={[{ label: "Philippines", value: "PH" }, { label: "Germany", value: "DE" }, { label: "Japan", value: "JP" }]} />
          </FormGroup>
        </Form>
        <CodeView
          height={200}
          title="columns config"
          code={`<FormGroup label="Shipping address" columns={{ base: 1, md: 2, lg: 3 }}>
  <FormInput name="street" label="Street" required />
  <FormInput name="city" label="City" required />
  <FormInput name="zip" label="Postal code" required />
</FormGroup>`}
        />
      </Section>

      <Section id="forms-zod" title="Zod-shaped validation, optional">
        <Hint>
          Pass any schema with a safeParse method (zod v3 and v4 both fit) and its issues map onto the matching fields.
          Field-level rules and required flags work without it.
        </Hint>
        <Form id="zod-demo" schema={emailSchema} initialValues={{ name: "", email: "" }}>
          <FormInput name="name" label="Full name" required />
          <FormInput name="email" label="Email" type="email" required />
        </Form>
        <CodeView
          height={190}
          title="schema"
          code={`const emailSchema = {
  safeParse(data) {
    const issues = []
    if (data.email && !EMAIL_RE.test(data.email)) {
      issues.push({ path: ['email'], message: 'Enter a valid email address.' })
    }
    return issues.length ? { success: false, error: { issues } } : { success: true }
  },
}

<Form schema={emailSchema} onSubmit={save} />`}
        />
      </Section>

      <Section id="forms-modal" title="Modal footer buttons, outside the form">
        <Hint>
          The form lives in the modal body and the action buttons live in the footer: different scopes, one registry.
          FormButton references the form by id. It disables itself while the form is invalid and clear empties the
          fields, exactly as the buttons inside would.
        </Hint>
        <div className="flex items-center gap-3">
          <button
            className="prui-button inline-flex h-9 items-center rounded-[var(--prui-radius)] bg-[var(--prui-brand)] px-3.5 text-sm font-medium text-[var(--prui-brand-fg)] cursor-pointer"
            onClick={() => setModalOpen(true)}
            data-testid="open-invite"
          >
            Invite teammate
          </button>
          {savedName ? (
            <span className="text-sm text-[var(--prui-ok)]" data-testid="invited-name">
              Invited {savedName}
            </span>
          ) : null}
        </div>

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} size="sm" ariaLabel="Invite teammate" noPadding>
          <div className="px-6 pt-6 pb-2">
            <h2 className="text-lg font-semibold text-[var(--prui-fg)]">Invite teammate</h2>
            <p className="text-sm text-[var(--prui-dim)]">They get an email invitation.</p>
          </div>
          <div className="px-6">
            <Form id="invite" initialValues={{ email: "" }} onSubmit={async (v) => {
              setSavedName(String(v.email))
              await new Promise((r) => setTimeout(r, 400))
              setModalOpen(false)
            }}>
              <FormInput name="email" label="Email" type="email" required placeholder="name@company.com" />
            </Form>
          </div>
          <div className="flex items-center justify-end gap-2 px-6 pb-6 pt-4">
            <FormButton form="invite" action="clear" variant="ghost" size="sm">Clear</FormButton>
            <FormButton form="invite" action="submit" variant="primary" size="sm" disableWhen="invalid">Send invite</FormButton>
          </div>
        </Modal>

        <CodeView
          height={340}
          title="invite-modal.tsx"
          code={`<Modal footer={actions}>
  {/* body: the form */}
  <Form id="invite" onSubmit={invite}>
    <FormInput name="email" label="Email" type="email" required />
  </Form>
</Modal>

{/* footer: buttons in a different scope, same registry */}
<FormButton form="invite" action="clear" variant="ghost">Clear</FormButton>
<FormButton form="invite" action="submit" variant="primary" disableWhen="invalid">
  Send invite
</FormButton>`}
        />
      </Section>

      <Section id="forms-api" title="Props reference">
        <MetaOnly meta={formPropsMeta} />
        <MetaOnly meta={formGroupPropsMeta} />
        <MetaOnly meta={formInputPropsMeta} />
        <MetaOnly meta={formButtonPropsMeta} />
      </Section>
    </div>
  )
}
