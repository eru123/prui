import * as React from "react"
import { Button } from "../core/button"
import { Input } from "../core/input"
import { Label } from "../core/label"
import type { PropsMeta } from "../core/props-meta"
import { PageShell, ErrorBanner, linkHref, linkLabel, type PageLinkInput } from "./shared"
import type { BrandConfig } from "../app/app"

export interface ForgotPasswordPageProps {
  onSubmit?: (values: { email: string }) => void | Promise<void>
  links?: { login?: PageLinkInput | false; register?: PageLinkInput | false }
  brand?: BrandConfig
  submitLabel?: string
  loading?: boolean
  error?: string | null
  /** Show the "check your email" success state instead of the form. */
  sent?: boolean
}

export function ForgotPasswordPage({
  onSubmit,
  links,
  brand,
  submitLabel = "Send reset link",
  loading = false,
  error,
  sent = false,
}: ForgotPasswordPageProps) {
  const [email, setEmail] = React.useState("")
  const [busy, setBusy] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = onSubmit?.({ email })
      if (result && typeof (result as Promise<void>).then === "function") {
        setBusy(true)
        await result
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <PageShell title="Forgot your password?" description="Enter your email and we send you a reset link" brand={brand}>
      <ErrorBanner error={error} />
      {sent ? (
        <p data-testid="forgot-sent" className="rounded-prui border border-ok/40 bg-ok/10 px-3 py-3 text-center text-sm text-ok">
          Check your email for the reset link.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3" data-testid="forgot-form">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="forgot-email">
              Email<span className="ml-0.5 text-danger">*</span>
            </Label>
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              disabled={loading || busy}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button type="submit" variant="primary" loading={loading || busy} data-testid="forgot-submit">
            {submitLabel}
          </Button>
        </form>
      )}
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

export const forgotPasswordPagePropsMeta: PropsMeta = {
  name: "ForgotPasswordPage",
  props: [
    { name: "onSubmit", type: "({ email }) => void | Promise<void>", default: null, control: "none" },
    { name: "links", type: "{ login?, register? }", default: "undefined", control: "object" },
    { name: "brand", type: "BrandConfig", default: "undefined", control: "object" },
    { name: "loading", type: "boolean", default: "false", control: "boolean" },
    { name: "error", type: "string | null", default: "null", control: "text" },
    { name: "sent", type: "boolean", default: "false", control: "boolean" },
  ],
}
