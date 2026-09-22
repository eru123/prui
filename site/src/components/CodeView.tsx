import * as React from "react"
import { CopyButton } from "./CopyButton"

/**
 * CodeView: all code display goes through Monaco (@monaco-editor/react),
 * lazy-loaded so it never lands in the landing bundle (proposal scope,
 * AC-6 budget). Editors accept typing; Reset restores the canonical code
 * passed in `code`. Edits stream back through onEdit so parents can drive
 * live demos from the code.
 */

const MonacoEditor = React.lazy(async () => {
  const mod = await import("@monaco-editor/react")
  return { default: mod.Editor }
})

/**
 * Snippets are fragments (a single JSX tag, a CSS block), so the language
 * services would light them up with "module not found" and syntax squiggles.
 * Turn every diagnostic source off before the first editor mounts.
 */
function configureMonaco(monaco: unknown): void {
  try {
    const m = monaco as {
      languages?: Record<string, Record<string, { setDiagnosticsOptions?: (o: Record<string, unknown>) => void; setOptions?: (o: Record<string, unknown>) => void }>>
    }
    const lang = m.languages ?? {}
    for (const key of ["typescript", "javascript"]) {
      for (const d of [lang[key]?.typescriptDefaults, lang[key]?.javascriptDefaults]) {
        d?.setDiagnosticsOptions?.({ noSemanticValidation: true, noSyntaxValidation: true, noSuggestionDiagnostics: true })
      }
    }
    lang.css?.cssDefaults?.setOptions?.({ validate: false })
    lang.json?.jsonDefaults?.setDiagnosticsOptions?.({ noValidation: true, allowComments: true })
    lang.html?.htmlDefaults?.setOptions?.({ format: { tabSize: 2 } })
  } catch {
    // diagnostics suppression is cosmetic; never block the editor on it
  }
}

/** Pick a Monaco language id from a file name or extension. */
export function languageForFile(path: string): string {
  const ext = path.slice(path.lastIndexOf(".") + 1).toLowerCase()
  switch (ext) {
    case "ts": return "typescript"
    case "tsx": return "typescript"
    case "js": return "javascript"
    case "jsx": return "javascript"
    case "mjs": return "javascript"
    case "cjs": return "javascript"
    case "css": return "css"
    case "json": return "json"
    case "md": return "markdown"
    case "html": return "html"
    default: return "typescript"
  }
}

export function CodeView({
  code,
  canonical,
  title = "tsx",
  language = "typescript",
  height = "auto",
  readOnly = false,
  onEdit,
  className,
}: {
  code: string
  /** Reset target; defaults to `code`. The playground passes the snippet
   * regenerated from the demo's current prop values. */
  canonical?: string
  title?: string
  language?: string
  /** Fixed px height, or "auto" to size to the content. */
  height?: number | "auto"
  /** Read-only view for generated output; live views leave it unset. */
  readOnly?: boolean
  /** Called on every edit, and on reset with the canonical code. */
  onEdit?: (value: string) => void
  className?: string
}) {
  const editable = !readOnly
  const [value, setValue] = React.useState(code)

  // adopt external code (control-panel changes, regenerated snippets)
  React.useEffect(() => {
    setValue(code)
  }, [code])

  const reset = () => {
    const target = canonical ?? code
    setValue(target)
    onEdit?.(target)
  }


  const lines = React.useMemo(() => value.split("\n").length, [value])
  const computedHeight = height === "auto" ? Math.min(560, Math.max(72, lines * 19 + 24)) : height

  return (
    <div className={className ?? "relative mb-4 mt-2 overflow-hidden rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-surface)]"}>
      <div className="flex items-center justify-between border-b border-[var(--prui-line)] px-3 py-1.5 font-mono text-micro uppercase tracking-widest text-[var(--prui-dim)]">
        <span>{title}</span>
        <span className="flex items-center gap-1.5">
          {editable ? (
            <button
              type="button"
              onClick={reset}
              className="cursor-pointer rounded-[var(--prui-radius-1)] border border-[var(--prui-line)] px-2 py-0.5 font-mono text-micro text-[var(--prui-dim)] hover:text-[var(--prui-fg)]"
              aria-label="Reset code"
            >
              reset
            </button>
          ) : null}
          <CopyButton text={value} />
        </span>
      </div>
      <div style={{ height: computedHeight }}>
        <React.Suspense
          fallback={
            <pre tabIndex={0} className="overflow-x-auto px-4 py-3 font-mono text-xs leading-relaxed text-[var(--prui-fg)] outline-none">{value}</pre>
          }
        >
          <MonacoEditor
            height="100%"
            language={language}
            value={value}
            theme="vs-dark"
            beforeMount={configureMonaco}
            onChange={(v) => {
              const next = v ?? ""
              setValue(next)
              onEdit?.(next)
            }}
            options={{
              readOnly,
              minimap: { enabled: false },
              fontSize: 12,
              lineHeight: 19,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              wordWrap: "on",
              padding: { top: 10, bottom: 10 },
              renderLineHighlight: "none",
              overviewRulerLanes: 0,
              scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
              folding: true,
              automaticLayout: true,
              renderValidationDecorations: "off",
            }}
            loading={
              <pre tabIndex={0} className="overflow-x-auto px-4 py-3 font-mono text-xs leading-relaxed text-[var(--prui-fg)] outline-none">{value}</pre>
            }
          />
        </React.Suspense>
      </div>
    </div>
  )
}
