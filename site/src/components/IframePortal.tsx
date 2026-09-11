import * as React from "react"
import { createRoot, type Root } from "react-dom/client"

/**
 * IframeIsland: mounts a SEPARATE React root inside an iframe document.
 * A portal would inherit the host tree's context (its BrowserRouter, theme
 * state), so preview content that owns a <MemoryRouter> crashes with
 * "Router inside Router" — a fresh createRoot has no inherited context.
 * The host clones its styles into the frame; the sandbox allows same-origin
 * only, so the parent owns the DOM and no scripts run inside the frame.
 */
export function IframePortal({
  height = 560,
  title,
  testId,
  children,
  className,
}: {
  height?: number
  title: string
  testId?: string
  /** Render function invoked with the frame document on every host render. */
  children: (doc: Document) => React.ReactNode
  className?: string
}) {
  const frameRef = React.useRef<HTMLIFrameElement>(null)
  const [doc, setDoc] = React.useState<Document | null>(null)
  const rootRef = React.useRef<Root | null>(null)
  const renderRef = React.useRef(children)
  renderRef.current = children

  const onLoad = React.useCallback(() => {
    const frameDoc = frameRef.current?.contentDocument
    if (!frameDoc) return
    copyStyles(frameDoc)
    setDoc(frameDoc)
  }, [])

  // mount a dedicated root in the frame document and keep it in sync
  React.useEffect(() => {
    if (!doc) return
    if (!rootRef.current) rootRef.current = createRoot(doc.body)
    rootRef.current.render(renderRef.current(doc))
  }, [doc, children])

  React.useEffect(() => {
    if (!doc) return
    const observer = new MutationObserver(() => copyStyles(doc))
    observer.observe(document.head, { childList: true, subtree: true, attributes: true, characterData: true })
    return () => observer.disconnect()
  }, [doc])

  React.useEffect(() => {
    return () => {
      // unmount on host unmount; the srcdoc document is being discarded
      rootRef.current?.unmount()
      rootRef.current = null
    }
  }, [])

  return (
    <iframe
      ref={frameRef}
      title={title}
      data-testid={testId}
      className={className ?? "w-full border-0"}
      style={{ height }}
      sandbox="allow-same-origin"
      // An explicit initial document: the browser fires onLoad for THIS
      // document last, so content written in onLoad survives instead of
      // being wiped by the async initial about:blank load.
      srcDoc="<!doctype html><html><head></head><body></body></html>"
      onLoad={onLoad}
    />
  )
}

function copyStyles(targetDoc: Document) {
  targetDoc.head.querySelectorAll("style").forEach((n) => n.remove())
  const styles = document.querySelectorAll("style")
  styles.forEach((styleEl) => {
    const clone = targetDoc.createElement("style")
    clone.textContent = styleEl.textContent
    targetDoc.head.appendChild(clone)
  })
  const links = document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
  links.forEach((link) => {
    if (targetDoc.head.querySelector(`link[href="${link.href}"]`)) return
    const clone = targetDoc.createElement("link")
    clone.rel = "stylesheet"
    clone.href = link.href
    targetDoc.head.appendChild(clone)
  })
}
