import * as React from "react"
import { cn } from "./cn"
import type { PropsMeta } from "./props-meta"

/**
 * PasswordStrength: a live meter for password fields. scorePassword() is a
 * dependency-free heuristic (length + character classes + repetition), and
 * the meter renders segments + a label from status tokens. Drop it under
 * any input; aria-live announces the level as it changes.
 */

export const PASSWORD_STRENGTH_LABELS = ["Weak", "Fair", "Good", "Strong"] as const
export type PasswordScore = 0 | 1 | 2 | 3

/** Heuristic 0..3: length, character classes, and repetition penalties. */
export function scorePassword(pw: string): PasswordScore {
  if (!pw) return 0
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(pw)).length
  const unique = new Set(pw).size
  const repetitive = unique <= pw.length / 2 && pw.length >= 6
  let score: PasswordScore = 0
  if (pw.length >= 6) score = 1
  if (pw.length >= 8 && classes >= 2) score = 2
  if (pw.length >= 12 && classes >= 3) score = 3
  if (score > 0 && repetitive) score = (score - 1) as PasswordScore
  if (pw.length < 6 || classes < 2) score = Math.min(score, 1) as PasswordScore
  return score
}

const SEGMENT_TONE: Record<PasswordScore, string[]> = {
  0: ["bg-danger", "bg-danger/25", "bg-danger/25", "bg-danger/25"],
  1: ["bg-warn", "bg-warn", "bg-warn/25", "bg-warn/25"],
  2: ["bg-ok", "bg-ok", "bg-ok", "bg-ok/25"],
  3: ["bg-ok-strong", "bg-ok-strong", "bg-ok-strong", "bg-ok-strong"],
}

export interface PasswordStrengthProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** The password to evaluate. */
  value: string
  /** Hide the text label, keep the meter + announcement. */
  hideLabel?: boolean
}

export const PasswordStrength = React.forwardRef<HTMLDivElement, PasswordStrengthProps>(function PasswordStrength(
  { value, hideLabel, className, ...props },
  ref,
) {
  const score = scorePassword(value)
  const label = value ? PASSWORD_STRENGTH_LABELS[score] : ""
  return (
    <div
      ref={ref}
      data-score={value ? score : undefined}
      className={cn("prui-password-strength flex items-center gap-2", className)}
      {...props}
    >
      <span aria-hidden className="flex flex-1 gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={cn("h-1 flex-1 rounded-full transition-colors duration-200", SEGMENT_TONE[score][i])} />
        ))}
      </span>
      {!hideLabel ? (
        <span aria-live="polite" className="w-14 text-right text-xs text-dim">
          {label}
        </span>
      ) : null}
    </div>
  )
})
PasswordStrength.displayName = "PasswordStrength"

export const passwordStrengthPropsMeta: PropsMeta = {
  name: "PasswordStrength",
  props: [
    { name: "value", type: "string", default: null, control: "text" },
    { name: "hideLabel", type: "boolean", default: "false", control: "boolean" },
  ],
}
