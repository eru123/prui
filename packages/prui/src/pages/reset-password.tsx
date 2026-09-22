import * as React from "react"
import { Button } from "../core/button"
import { Input } from "../core/input"
import { Label } from "../core/label"
import type { PropsMeta } from "../core/props-meta"
import { PageShell, ErrorBanner, linkHref, linkLabel, type PageLinkInput } from "./shared"
import type { BrandConfig } from "../app/app"

export interface ResetPasswordPageProps {
  onSubmit?: (values: { password: string; confirm: string }) => void | Promise<void>
  fields?: Partial<Record<"password" | "confirm", boolean>>
  links?: { login?: PageLinkInput | false }
  brand?: BrandConfig
  submitLabel?: string
  loading?: boolean
  error?: string | null
}

export function ResetPasswordPage({
  onSubmit,
  fields,
  links,
  brand,
  submitLabel = "Reset password",
  loading = false,
  error,
}: ResetPasswordPageProps) {
  const show = { password: true, confirm: true, ...fields }
  const [values, setValues] = React.useState({ password: "", confirm: "" })
  const [busy, setBusy] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = onSubmit?.({ ...values })
      if (result && typeof (result as Promise<void>).then === "function") {
        setBusy(true)
        await result
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <PageShell title="Choose a new password" description="Your new password must be different from previous ones" brand={brand}>
      <ErrorBanner error={error} />
      <form onSubmit={handleSubmit} className="flex flex-col gap-3" data-testid="reset-form">
        {show.password !== false ? (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reset-password">
              New password<span className="ml-0.5 text-danger">*</span>
            </Label>
            <Input
              id="reset-password"
              type="password"
              autoComplete="new-password"
              required
              disabled={loading || busy}
              value={values.password}
              onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
            />
          </div>
        ) : null}
        {show.confirm !== false ? (
          <div className="flex flex-col gap-1.5" data-testid="reset-confirm">
            <Label htmlFor="reset-confirm">
              Confirm password<span className="ml-0.5 text-danger">*</span>
            </Label>
            <Input
              id="reset-confirm"
              type="password"
              autoComplete="new-password"
              required
              disabled={loading || busy}
              value={values.confirm}
              onChange={(e) => setValues((v) => ({ ...v, confirm: e.target.value }))}
            />
          </div>
        ) : null}
        <Button type="submit" variant="primary" loading={loading || busy} data-testid="reset-submit">
          {submitLabel}
        </Button>
      </form>
      {links?.login !== false && links?.login ? (
        <div className="mt-3 text-center text-sm">
          <a href={linkHref(links.login)} className="text-brand hover:underline">
            {linkLabel(links.login, "Back to sign in")}
          </a>
        </div>
      ) : null}
    </PageShell>
  )
}

export const resetPasswordPagePropsMeta: PropsMeta = {
  name: "ResetPasswordPage",
  props: [
    { name: "onSubmit", type: "({ password, confirm }) => void | Promise<void>", default: null, control: "none" },
    { name: "fields", type: "{ password?, confirm? }", default: "both shown", control: "object" },
    { name: "links", type: "{ login? }", default: "undefined", control: "object" },
    { name: "brand", type: "BrandConfig", default: "undefined", control: "object" },
    { name: "loading", type: "boolean", default: "false", control: "boolean" },
    { name: "error", type: "string | null", default: "null", control: "text" },
  ],
}
