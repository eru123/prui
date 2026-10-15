import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "./cn"
import { Portal, useOverlay } from "./overlay"
import type { PropsMeta } from "./props-meta"

/**
 * Lightbox: a full-screen image viewer. Modal through useOverlay (focus
 * trap, scroll lock, background inertness), Escape closes, ArrowLeft/
 * Right and on-screen chevrons move between images, the backdrop click
 * closes, and a counter keeps position legible.
 */

export interface LightboxImage {
  src: string
  alt?: string
  caption?: string
}

export interface LightboxProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  images: ReadonlyArray<LightboxImage>
  index?: number
  defaultIndex?: number
  onIndexChange?: (index: number) => void
}

export const Lightbox = React.forwardRef<HTMLDivElement, LightboxProps>(function Lightbox(
  { open, onOpenChange, images, index: indexProp, defaultIndex = 0, onIndexChange },
  ref,
) {
  const isControlled = indexProp !== undefined
  const [uncontrolled, setUncontrolled] = React.useState(defaultIndex)
  const index = Math.min(Math.max(isControlled ? indexProp : uncontrolled, 0), Math.max(images.length - 1, 0))

  const close = () => onOpenChange(false)
  const step = (delta: 1 | -1) => {
    if (images.length < 2) return
    const next = (index + delta + images.length) % images.length
    if (!isControlled) setUncontrolled(next)
    onIndexChange?.(next)
  }

  const { ref: overlayRef } = useOverlay({ open, onEscape: close })
  const setRefs = (el: HTMLDivElement | null) => {
    overlayRef(el)
    if (typeof ref === "function") ref(el)
    else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el
  }

  const image = images[index]

  return (
    <>
      {open && image ? (
        <Portal>
          <div
            ref={setRefs}
            role="dialog"
            aria-modal="true"
            aria-label={image.caption ?? image.alt ?? "Image viewer"}
            data-state="open"
            className={cn(
              "prui-lightbox fixed inset-0 z-[var(--prui-z-modal)]",
              "flex flex-col items-center justify-center gap-3 p-6",
              "bg-scrim/85 backdrop-blur-sm prui-anim-fade",
            )}
          >
            {/* backdrop: click closes, invisible to the tree */}
            <button
              type="button"
              aria-label="Close image viewer"
              tabIndex={-1}
              onClick={close}
              className="absolute inset-0 cursor-zoom-out"
            />
            <figure className="relative flex max-h-full max-w-full flex-col items-center gap-3">
              {/* runtime geometry: viewport-relative image bounds */}
              <img
                src={image.src}
                alt={image.alt ?? ""}
                className="max-w-full rounded-prui object-contain shadow-prui-modal"
                style={{ maxHeight: "82vh" }}
              />
              {image.caption ? (
                <figcaption className="rounded-prui bg-surface px-2 py-0.5 text-xs text-fg">{image.caption}</figcaption>
              ) : null}
            </figure>
            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous image"
                  className={cn(
                    "absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer",
                    "inline-flex h-10 w-10 items-center justify-center rounded-prui-full",
                    "border border-line bg-surface text-fg shadow-prui-md",
                    "transition-colors hover:bg-raise focus-visible:ring-2 focus-visible:ring-ring/70 outline-none",
                  )}
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next image"
                  className={cn(
                    "absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer",
                    "inline-flex h-10 w-10 items-center justify-center rounded-prui-full",
                    "border border-line bg-surface text-fg shadow-prui-md",
                    "transition-colors hover:bg-raise focus-visible:ring-2 focus-visible:ring-ring/70 outline-none",
                  )}
                >
                  <ChevronRight className="h-5 w-5" aria-hidden />
                </button>
                <div className="rounded-prui-full bg-surface px-2 py-0.5 text-xs font-medium text-dim">
                  {index + 1} / {images.length}
                </div>
              </>
            ) : null}
          </div>
        </Portal>
      ) : null}
    </>
  )
})
Lightbox.displayName = "Lightbox"

export const lightboxPropsMeta: PropsMeta = {
  name: "Lightbox",
  props: [
    { name: "open", type: "boolean", default: null, control: "boolean" },
    { name: "onOpenChange", type: "(open: boolean) => void", default: null, control: "none" },
    { name: "images", type: "{ src, alt?, caption? }[]", default: null, control: "none" },
    { name: "index", type: "number", default: "undefined", control: "number" },
    { name: "defaultIndex", type: "number", default: "0", control: "number" },
    { name: "onIndexChange", type: "(index: number) => void", default: null, control: "none" },
  ],
}
