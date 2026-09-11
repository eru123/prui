import * as React from "react"
import { Button } from "../core/button"
import { Input } from "../core/input"
import { Label } from "../core/label"
import type { PropsMeta } from "../core/props-meta"
import {
  PageShell,
  ErrorBanner,
  OAuthButtons,
  defaultRegisterFields,
  linkHref,
  linkLabel,
  type PageField,
  type PageLinkInput,
  type OAuthProviderInput,
} from "./shared"
import type { BrandConfig } from "../app/app"

export interface RegisterPageProps {
  onSubmit?: (values: Record<string, string>) => void | Promise<void>
  fields?: Partial<Record<"name" | "email" | "password" | "confirm", boolean>>
  extraFields?: PageField[]
  links?: { login?: PageLinkInput | false }
  oauth?: OAuthProviderInput[]
  brand?: BrandConfig
  submitLabel?: string
  loading?: boolean
  error?: string | null
}

export function RegisterPage({
  onSubmit,
  fields,
  extraFields,
  links,
  oauth,
  brand,
  submitLabel = "Create account",
  loading = false,
  error,
}: RegisterPageProps) {
  const show = { name: true, email: true, password: true, confirm: false, ...fields }
  const base = defaultRegisterFields.filter((f) =>
    f.name === "name" ? show.name !== false : f.name === "email" ? show.email !== false : show.password !== false,
  )
  const visible = [...base, ...(extraFields ?? [])]
  const [values, setValues] = React.useState<Record<string, string>>({})
  const [confirm, setConfirm] = React.useState("")
  const [busy, setBusy] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = onSubmit?.({ ...values, confirm })
      if (result && typeof (result as Promise<void>).then === "function") {
        setBusy(true)
        await result
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <PageShell title="Create your account" description="Get started in minutes" brand={brand} width="max-w-md">
      <ErrorBanner error={error} />
      <form onSubmit={handleSubmit} className="flex flex-col gap-3" data-testid="register-form">
        {visible.map((f) => (
          <div key={f.name} className="flex flex-col gap-1.5">
            <Label htmlFor={`register-${f.name}`}>
              {f.label}
              {f.required ? <span className="ml-0.5 text-[var(--prui-danger)]">*</span> : null}
            </Label>
            <Input
              id={`register-${f.name}`}
              type={f.type ?? "text"}
              placeholder={f.placeholder}
              autoComplete={f.autoComplete}
              required={f.required}
              disabled={loading || busy}
              value={values[f.name] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
            />
          </div>
        ))}
        {show.confirm ? (
          <div className="flex flex-col gap-1.5" data-testid="register-confirm">
            <Label htmlFor="register-confirm-password">Confirm password<span className="ml-0.5 text-[var(--prui-danger)]">*</span></Label>
            <Input
              id="register-confirm-password"
              type="password"
              autoComplete="new-password"
              required
              disabled={loading || busy}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
        ) : null}
        <Button type="submit" variant="primary" loading={loading || busy} data-testid="register-submit">
          {submitLabel}
        </Button>
      </form>
      <OAuthButtons providers={oauth} />
      {links?.login ? (
        <div className="mt-3 text-center text-sm text-[var(--prui-dim)]" data-testid="register-login-link">
          Already have an account?{" "}
          <a href={linkHref(links.login)} className="text-[var(--prui-brand)] hover:underline">
            {linkLabel(links.login, "Sign in")}
          </a>
        </div>
      ) : null}
    </PageShell>
  )
}

export const registerPagePropsMeta: PropsMeta = {
  name: "RegisterPage",
  props: [
    { name: "onSubmit", type: "(values) => void | Promise<void>", default: null, control: "none" },
    { name: "fields", type: "{ name?, email?, password?, confirm? }", default: "name, email, password", control: "object" },
    { name: "links", type: "{ login? }", default: "undefined", control: "object" },
    { name: "oauth", type: "OAuthProvider[]", default: "undefined", control: "object" },
    { name: "brand", type: "BrandConfig", default: "undefined", control: "object" },
    { name: "loading", type: "boolean", default: "false", control: "boolean" },
    { name: "error", type: "string | null", default: "null", control: "text" },
  ],
}
