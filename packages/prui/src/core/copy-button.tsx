import * as React from "react"
import { Copy, Check } from "lucide-react"
import { Button, type ButtonProps } from "./button"
import { IconMorph } from "./icon-morph"
import type { PropsMeta } from "./props-meta"

/**
 * CopyButton: a Button that copies a value and confirms it visually —
 * icon morphs Copy → Check, the label swaps (optional), and everything
 * reverts after a beat. Layout stays stable: the label slot is reserved.
 */

/** Clipboard write with the legacy fallback for non-secure/jsdom contexts. */
export async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }
  const ta = document.createElement("textarea")
  ta.value = text
  ta.setAttribute("readonly", "")
  ta.style.position = "fixed"
  ta.style.opacity = "0"
  document.body.appendChild(ta)
  ta.select()
  try {
    document.execCommand("copy")
  } finally {
    ta.remove()
  }
}

export interface CopyButtonProps extends Omit<ButtonProps, "value" | "onClick"> {
  /** The text to copy, or a getter for lazy values. */
  value: string | (() => string)
  /** Label shown while copied; omit to keep the idle label. */
  copiedLabel?: string
  /** How long the copied state lasts, ms. Default 1600. */
  timeout?: number
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export const CopyButton = React.forwardRef<HTMLButtonElement, CopyButtonProps>(function CopyButton(
  { value, copiedLabel, timeout = 1600, onClick, children, disabled, ...props },
  ref,
) {
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<number | null>(null)

  React.useEffect(
    () => () => {
      if (timer.current != null) window.clearTimeout(timer.current)
    },
    [],
  )

  const handle = async (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e)
    if (e.defaultPrevented || disabled) return
    try {
      await copyText(typeof value === "function" ? value() : value)
      setCopied(true)
      if (timer.current != null) window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), timeout)
    } catch {
      /* clipboard unavailable — stay in idle state */
    }
  }

  return (
    <Button ref={ref} aria-live="polite" disabled={disabled} onClick={handle} {...props}>
      <IconMorph from={<Copy className="h-4 w-4" aria-hidden />} to={<Check className="h-4 w-4" aria-hidden />} active={copied} />
      {children ? <span>{copied && copiedLabel ? copiedLabel : children}</span> : null}
    </Button>
  )
})
CopyButton.displayName = "CopyButton"

export const copyButtonPropsMeta: PropsMeta = {
  name: "CopyButton",
  props: [
    { name: "value", type: "string | (() => string)", default: null, control: "text" },
    { name: "copiedLabel", type: "string", default: "undefined (keep idle label)", control: "text" },
    { name: "timeout", type: "number (ms)", default: "1600", control: "number" },
    { name: "variant", type: "ButtonVariant", default: "'default'", control: "select", options: ["primary", "secondary", "neutral", "ghost", "outline", "soft", "link"] },
    { name: "size", type: "'sm' | 'md' | 'lg' | 'icon'", default: "'md'", control: "select", options: ["sm", "md", "lg", "icon"] },
    { name: "children", type: "ReactNode", default: null, control: "text" },
  ],
}
