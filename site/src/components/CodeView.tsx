import * as React from "react"
import { CopyButton } from "./CopyButton"

/**
 * CodeView: all code display goes through Monaco (@monaco-editor/react),
 * lazy-loaded so it never lands in the landing bundle (proposal scope,
 * AC-6 budget). Falls back to a plain <pre> while the editor chunk streams.
 */

const MonacoEditor = React.lazy(async () => {
  const mod = await import("@monaco-editor/react")
  return { default: mod.Editor }
})

export function CodeView({
  code,
  title = "tsx",
  language = "typescript",
  height = "auto",
  readOnly = true,
  onEdit,
  className,
}: {
  code: string
  title?: string
  language?: string
  /** Fixed px height, or "auto" to size to the content. */
  height?: number | "auto"
  readOnly?: boolean
  /** When set (with readOnly false), edits stream back through this callback. */
  onEdit?: (value: string) => void
  className?: string
}) {
  const lines = React.useMemo(() => code.split("\n").length, [code])
  const computedHeight = height === "auto" ? Math.min(560, Math.max(72, lines * 19 + 24)) : height

  return (
    <div className={className ?? "relative mb-4 mt-2 overflow-hidden rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-surface)]"}>
      <div className="flex items-center justify-between border-b border-[var(--prui-line)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-[var(--prui-dim)]">
        <span>{title}</span>
        {readOnly ? <CopyButton text={code} /> : null}
      </div>
      <div style={{ height: computedHeight }}>
        <React.Suspense
          fallback={
            <pre className="overflow-x-auto px-4 py-3 font-mono text-xs leading-relaxed text-[var(--prui-fg)]">{code}</pre>
          }
        >
          <MonacoEditor
            height="100%"
            language={language}
            value={code}
            theme="vs-dark"
            onChange={onEdit && !readOnly ? (value) => onEdit(value ?? "") : undefined}
            options={{
              readOnly,
              minimap: { enabled: false },
              fontSize: 12,
              lineHeight: 19,
              lineNumbers: "off",
              scrollBeyondLastLine: false,
              wordWrap: "on",
              padding: { top: 10, bottom: 10 },
              renderLineHighlight: "none",
              overviewRulerLanes: 0,
              scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
              folding: true,
              automaticLayout: true,
            }}
            loading={
              <pre className="overflow-x-auto px-4 py-3 font-mono text-xs leading-relaxed text-[var(--prui-fg)]">{code}</pre>
            }
          />
        </React.Suspense>
      </div>
    </div>
  )
}
