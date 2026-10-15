import * as React from "react"
import { cn } from "./cn"
import type { PropsMeta } from "./props-meta"

/**
 * OTPInput: one-time-code entry — one character per box, paste across
 * boxes, Backspace steps back, arrows move, and the full code is handed
 * to onComplete. Numeric mode uses inputMode/autocomplete hints so mobile
 * keyboards and password managers behave.
 */

export interface OTPInputProps {
  /** Number of boxes. Default 6. */
  length?: number
  /** Controlled value; shorter strings fill from the first box. */
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  /** Fires when every box is filled. */
  onComplete?: (value: string) => void
  /** Accessible name for the group. Default "Verification code". */
  groupLabel?: string
  /** numeric (digits only) or alphanumeric. Default numeric. */
  mode?: "numeric" | "alphanumeric"
  disabled?: boolean
  autoFocus?: boolean
  className?: string
}

const sanitize = (ch: string, mode: "numeric" | "alphanumeric") =>
  mode === "numeric" ? (/\d/.test(ch) ? ch : "") : (/[\dA-Za-z]/.test(ch) ? ch.toUpperCase() : "")

export const OTPInput = React.forwardRef<HTMLInputElement, OTPInputProps>(function OTPInput(
  { length = 6, value: valueProp, defaultValue = "", onChange, onComplete, groupLabel = "Verification code", mode = "numeric", disabled, autoFocus, className },
  ref,
) {
  const isControlled = valueProp !== undefined
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const value = isControlled ? valueProp : uncontrolled
  const boxes = React.useRef<Array<HTMLInputElement | null>>([])
  const completedRef = React.useRef("")

  const chars = Array.from({ length }, (_, i) => value[i] ?? "")

  const commit = (next: string) => {
    const clamped = next.slice(0, length)
    if (!isControlled) setUncontrolled(clamped)
    onChange?.(clamped)
    if (clamped.length === length && clamped !== completedRef.current) {
      completedRef.current = clamped
      onComplete?.(clamped)
    } else if (clamped.length < length) {
      completedRef.current = ""
    }
  }

  const setCharAt = (i: number, ch: string) => {
    const arr = [...chars]
    arr[i] = ch
    commit(arr.join(""))
  }

  const handleChange = (i: number, raw: string) => {
    const cleaned = [...raw].map((c) => sanitize(c, mode)).join("")
    if (!cleaned) return
    // typing over a filled box or an autofill dump: take from position i
    const arr = [...chars]
    for (let k = 0; k < cleaned.length && i + k < length; k++) arr[i + k] = cleaned.charAt(k)
    commit(arr.join(""))
    const next = Math.min(i + cleaned.length, length - 1)
    boxes.current[next]?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault()
      if (chars[i]) {
        setCharAt(i, "")
      } else if (i > 0) {
        setCharAt(i - 1, "")
        boxes.current[i - 1]?.focus()
      }
    } else if (e.key === "ArrowLeft" && i > 0) {
      e.preventDefault()
      boxes.current[i - 1]?.focus()
    } else if (e.key === "ArrowRight" && i < length - 1) {
      e.preventDefault()
      boxes.current[i + 1]?.focus()
    }
  }

  const handlePaste = (i: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = [...e.clipboardData.getData("text")]
      .map((c) => sanitize(c, mode))
      .join("")
    if (!pasted) return
    const arr = [...chars]
    for (let k = 0; k < pasted.length && i + k < length; k++) arr[i + k] = pasted.charAt(k)
    commit(arr.join(""))
    boxes.current[Math.min(i + pasted.length, length - 1)]?.focus()
  }

  return (
    <div
      role="group"
      aria-label={groupLabel}
      data-disabled={disabled || undefined}
      className={cn("prui-otp-input inline-flex gap-1.5", className)}
      onFocus={() => {
        /* focus stays on boxes; group is structural */
      }}
    >
      {chars.map((ch, i) => (
        <input
          key={i}
          ref={(el) => {
            boxes.current[i] = el
            if (i === 0 && ref) {
              if (typeof ref === "function") ref(el)
              else (ref as React.MutableRefObject<HTMLInputElement | null>).current = el
            }
          }}
          type="text"
          inputMode={mode === "numeric" ? "numeric" : "text"}
          autoComplete={mode === "numeric" && i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          aria-label={`${groupLabel}, character ${i + 1} of ${length}`}
          value={ch}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={(e) => handlePaste(i, e)}
          className={cn(
            "prui-otp-box h-10 w-9 rounded-prui border border-line bg-field",
            "text-center font-mono text-base text-fg caret-brand",
            "transition-colors duration-150 outline-none",
            "focus:border-brand focus-visible:ring-2 focus-visible:ring-ring/70",
            "disabled:cursor-not-allowed disabled:opacity-50",
            ch && "border-brand/60",
          )}
        />
      ))}
    </div>
  )
})
OTPInput.displayName = "OTPInput"

export const otpInputPropsMeta: PropsMeta = {
  name: "OTPInput",
  props: [
    { name: "length", type: "number", default: "6", control: "number" },
    { name: "value", type: "string", default: "undefined", control: "text" },
    { name: "defaultValue", type: "string", default: "''", control: "text" },
    { name: "onChange", type: "(value: string) => void", default: null, control: "none" },
    { name: "onComplete", type: "(value: string) => void", default: null, control: "none" },
    { name: "groupLabel", type: "string", default: "'Verification code'", control: "text" },
    { name: "mode", type: "'numeric' | 'alphanumeric'", default: "'numeric'", control: "select", options: ["numeric", "alphanumeric"] },
    { name: "disabled", type: "boolean", default: "false", control: "boolean" },
    { name: "autoFocus", type: "boolean", default: "false", control: "boolean" },
  ],
}
