import * as React from "react"
import { Button } from "../core/button"
import { Input } from "../core/input"
import { Label } from "../core/label"
import type { PropsMeta } from "../core/props-meta"
import {
  PageShell,
  ErrorBanner,
  LoadingButtonLabel,
  OAuthButtons,
  defaultLoginFields,
  type PageField,
  type PageLink,
  type OAuthProvider,
} from "./shared"
import type { BrandConfig } from "../app/app"

export interface LoginLinks {
  forgot?: PageLink | false
  register?: PageLink | false
}

export interface LoginPageProps {
  onSubmit?: (values: Record<string, string>) => void | Promise<void>
  /** Per-field show/hide: keys match field names, true renders the field. */
  fields?: Partial<Record<"email" | "password" | "remember", boolean>>
  /** Extra fields appended to the defaults. */
  extraFields?: PageField[]
  links?: LoginLinks
  oauth?: OAuthProvider[]
  brand?: BrandConfig
  submitLabel?: string
  loading?: boolean
  error?: string | null
  className?: string
}

export function LoginPage({
  onSubmit,
  fields,
  extraFields,
  links,
  oauth,
  brand,
  submitLabel = "Sign in",
  loading = false,
  error,
  className,
}: LoginPageProps) {
  const show = { email: true, password: true, remember: false, ...fields }
  const visible = [
    ...(show.email !== false ? [defaultLoginFields[0]!] : []),
    ...(show.password !== false ? [defaultLoginFields[1]!] : []),
    ...(extraFields ?? []),
  ]
  const [values, setValues] = React.useState<Record<string, string>>({})
  const [remember, setRemember] = React.useState(false)
  const [busy, setBusy] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = onSubmit?.({ ...values, remember: String(remember) })
      if (result && typeof (result as Promise<void>).then === "function") {
        setBusy(true)
        await result
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <PageShell title="Welcome back" description="Sign in to your account" brand={brand} className={className}>
      <ErrorBanner error={error} />
      <form onSubmit={handleSubmit} className="flex flex-col gap-3" data-testid="login-form">
        {visible.map((f) => (
          <div key={f.name} className="flex flex-col gap-1.5">
            <Label htmlFor={`login-${f.name}`}>{f.label}{f.required ? <span className="ml-0.5 text-[var(--prui-danger)]">*</span> : null}</Label>
            <Input
              id={`login-${f.name}`}
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
        {show.remember ? (
          <label className="flex items-center gap-2 text-sm text-[var(--prui-dim)]" data-testid="login-remember">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 accent-[var(--prui-brand)]"
            />
            Remember me
          </label>
        ) : null}
        <Button type="submit" variant="primary" loading={loading || busy} data-testid="login-submit">
          <LoadingButtonLabel loading={loading || busy}>{submitLabel}</LoadingButtonLabel>
        </Button>
      </form>
      <OAuthButtons providers={oauth} />
      {links?.forgot !== false && links?.forgot ? (
        <div className="mt-3 text-center">
          <a href={links.forgot.href} className="text-sm text-[var(--prui-brand)] hover:underline">
            {links.forgot.label ?? "Forgot password?"}
          </a>
        </div>
      ) : null}
      {(links?.register !== false && links?.register) ? (
        <div className="mt-1 text-center text-sm text-[var(--prui-dim)]">
          No account?{" "}
          <a href={links.register.href} className="text-[var(--prui-brand)] hover:underline">
            {links.register.label ?? "Register"}
          </a>
        </div>
      ) : null}
    </PageShell>
  )
}

export const loginPagePropsMeta: PropsMeta = {
  name: "LoginPage",
  props: [
    { name: "onSubmit", type: "(values) => void | Promise<void>", default: null, control: "none" },
    { name: "fields", type: "{ email?, password?, remember? }", default: "all except remember", control: "object" },
    { name: "links", type: "{ forgot?, register? }", default: "undefined", control: "object" },
    { name: "oauth", type: "OAuthProvider[]", default: "undefined", control: "object" },
    { name: "brand", type: "{ name, mark?, href? }", default: "undefined", control: "object" },
    { name: "loading", type: "boolean", default: "false", control: "boolean" },
    { name: "error", type: "string | null", default: "null", control: "text" },
  ],
}
