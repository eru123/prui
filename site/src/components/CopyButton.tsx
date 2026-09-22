import * as React from "react"

/** Small copy-to-clipboard affordance used across the docs site. */
export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setCopied(true)
          setTimeout(() => setCopied(false), 1200)
        } catch {
          /* clipboard unavailable */
        }
      }}
      className="cursor-pointer rounded-[var(--prui-radius-1)] border border-[var(--prui-line)] px-2 py-0.5 font-mono text-micro text-[var(--prui-dim)] hover:text-[var(--prui-fg)]"
    >
      {copied ? "copied" : "copy"}
    </button>
  )
}
