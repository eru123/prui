import * as React from "react"
import { Button } from "../core/button"
import { Input } from "../core/input"
import type { PropsMeta } from "../core/props-meta"
import { PageShell, ErrorBanner } from "./shared"
import type { BrandConfig } from "../app/app"

/** OTP code entry: segmented inputs, paste support, auto-submit on last digit. */
export interface OtpPageProps {
  onSubmit?: (code: string) => void | Promise<void>
  length?: number
  title?: string
  description?: React.ReactNode
  brand?: BrandConfig
  submitLabel?: string
  loading?: boolean
  error?: string | null
  onResend?: () => void | Promise<void>
  resendLabel?: string
}

export function OtpPage({
  onSubmit,
  length = 6,
  title = "Enter verification code",
  description = "We sent a code to your email",
  brand,
  submitLabel = "Verify",
  loading = false,
  error,
  onResend,
  resendLabel = "Resend code",
}: OtpPageProps) {
  const [digits, setDigits] = React.useState<string[]>(() => Array.from({ length }, () => ""))
  const refs = React.useRef<(HTMLInputElement | null)[]>([])

  const code = digits.join("")

  const handleChange = (i: number, raw: string) => {
    const value = raw.replace(/\D/g, "")
    if (value.length > 1) {
      // paste
      const chars = value.slice(0, length - i).split("")
      setDigits((d) => {
        const next = [...d]
        chars.forEach((c, k) => {
          next[i + k] = c
        })
        return next
      })
      const focusIdx = Math.min(i + chars.length, length - 1)
      refs.current[focusIdx]?.focus()
      return
    }
    setDigits((d) => {
      const next = [...d]
      next[i] = value
      return next
    })
    if (value && i < length - 1) refs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus()
    }
  }

  const [busy, setBusy] = React.useState(false)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = onSubmit?.(code)
      if (result && typeof (result as Promise<void>).then === "function") {
        setBusy(true)
        await result
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <PageShell title={title} description={description} brand={brand}>
      <ErrorBanner error={error} />
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" data-testid="otp-form">
        <div className="flex justify-center gap-2" role="group" aria-label="Verification code">
          {digits.map((d, i) => (
            <Input
              key={i}
              ref={(el) => {
                refs.current[i] = el
              }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={length}
              aria-label={`Digit ${i + 1}`}
              className="h-11 w-10 text-center text-lg"
              disabled={loading || busy}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
            />
          ))}
        </div>
        <Button type="submit" variant="primary" loading={loading || busy} data-testid="otp-submit">
          {submitLabel}
        </Button>
      </form>
      {onResend ? (
        <div className="mt-3 text-center text-sm">
          <button
            type="button"
            onClick={() => void onResend()}
            className="text-[var(--prui-brand)] hover:underline cursor-pointer"
          >
            {resendLabel}
          </button>
        </div>
      ) : null}
    </PageShell>
  )
}

export const otpPagePropsMeta: PropsMeta = {
  name: "OtpPage",
  props: [
    { name: "onSubmit", type: "(code: string) => void | Promise<void>", default: null, control: "none" },
    { name: "length", type: "number", default: "6", control: "number" },
    { name: "brand", type: "BrandConfig", default: "undefined", control: "object" },
    { name: "loading", type: "boolean", default: "false", control: "boolean" },
    { name: "error", type: "string | null", default: "null", control: "text" },
    { name: "onResend", type: "() => void | Promise<void>", default: null, control: "none" },
  ],
}
