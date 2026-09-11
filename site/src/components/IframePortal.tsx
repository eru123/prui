import * as React from "react"
import { createPortal } from "react-dom"

/**
 * IframePortal: renders React children into an iframe document through
 * createPortal, cloning the host document's styles into the frame. The
 * sandbox allows same-origin only — the parent owns the DOM and no scripts
 * run inside the frame.
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
  children: (doc: Document) => React.ReactNode
  className?: string
}) {
  const frameRef = React.useRef<HTMLIFrameElement>(null)
  const [doc, setDoc] = React.useState<Document | null>(null)

  const onLoad = React.useCallback(() => {
    const frameDoc = frameRef.current?.contentDocument
    if (!frameDoc) return
    copyStyles(frameDoc)
    setDoc(frameDoc)
  }, [])

  React.useEffect(() => {
    if (!doc) return
    const observer = new MutationObserver(() => copyStyles(doc))
    observer.observe(document.head, { childList: true, subtree: true, attributes: true, characterData: true })
    return () => observer.disconnect()
  }, [doc])

  return (
    <iframe
      ref={frameRef}
      title={title}
      data-testid={testId}
      className={className ?? "w-full border-0"}
      style={{ height }}
      sandbox="allow-same-origin"
      onLoad={onLoad}
    >
      {doc ? createPortal(children(doc), doc.body) : null}
    </iframe>
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
