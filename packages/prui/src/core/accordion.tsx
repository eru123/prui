import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "./cn"
import type { PropsMeta } from "./props-meta"

/**
 * Accordion: collapsible sections. Single (default, like <details>) or
 * multiple open; headers are buttons with aria-expanded + aria-controls,
 * arrow keys move between headers, and panels animate unless
 * prefers-reduced-motion is set.
 */

interface AccordionCtx {
  openItems: string[]
  toggle: (value: string) => void
  register: (value: string, el: HTMLButtonElement | null) => void
}

const Ctx = React.createContext<AccordionCtx | null>(null)

function useAccordion(): AccordionCtx {
  const ctx = React.useContext(Ctx)
  if (!ctx) throw new Error("Accordion parts must be used inside <Accordion>")
  return ctx
}

export interface AccordionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** "single" keeps at most one item open; "multiple" allows any number. */
  type?: "single" | "multiple"
  value?: string[]
  defaultValue?: string[]
  onChange?: (openValues: string[]) => void
}

export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(function Accordion(
  { type = "single", value: valueProp, defaultValue, onChange, className, onKeyDown, children, ...props },
  ref,
) {
  const [uncontrolled, setUncontrolled] = React.useState<string[]>(defaultValue ?? [])
  const isControlled = valueProp !== undefined
  const openItems = isControlled ? valueProp : uncontrolled
  const [registered, setRegistered] = React.useState<string[]>([])
  const elsRef = React.useRef(new Map<string, HTMLButtonElement>())

  const setOpenItems = (next: string[]) => {
    if (!isControlled) setUncontrolled(next)
    onChange?.(next)
  }

  const toggle = (v: string) => {
    if (openItems.includes(v)) setOpenItems(openItems.filter((x) => x !== v))
    else if (type === "single") setOpenItems([v])
    else setOpenItems([...openItems, v])
  }

  const register = React.useCallback((v: string, el: HTMLButtonElement | null) => {
    if (el) {
      elsRef.current.set(v, el)
      setRegistered((prev) => (prev.includes(v) ? prev : [...prev, v]))
    } else {
      elsRef.current.delete(v)
      setRegistered((prev) => prev.filter((x) => x !== v))
    }
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e)
    if (e.defaultPrevented) return
    const headers = registered.map((v) => elsRef.current.get(v)).filter((el): el is HTMLButtonElement => !!el)
    if (!headers.length) return
    const current = headers.indexOf(document.activeElement as HTMLButtonElement)
    const delta = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0
    if (delta !== 0) {
      e.preventDefault()
      const next = headers[(current + delta + headers.length) % headers.length]!
      next.focus()
      return
    }
    if (e.key === "Home") {
      e.preventDefault()
      headers[0]!.focus()
    }
    if (e.key === "End") {
      e.preventDefault()
      headers[headers.length - 1]!.focus()
    }
  }

  return (
    <Ctx.Provider value={{ openItems, toggle, register }}>
      <div
        ref={ref}
        onKeyDown={handleKeyDown}
        className={cn("prui-accordion flex flex-col gap-2", className)}
        data-type={type}
        {...props}
      >
        {children}
      </div>
    </Ctx.Provider>
  )
})
Accordion.displayName = "Accordion"

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  disabled?: boolean
}

export const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(function AccordionItem(
  { value, disabled, className, children, ...props },
  ref,
) {
  const { openItems, toggle, register } = useAccordion()
  const open = openItems.includes(value)
  const headerRef = React.useRef<HTMLButtonElement>(null)
  const panelId = `prui-accordion-panel-${value}`
  const headerId = `prui-accordion-header-${value}`

  React.useEffect(() => {
    register(value, headerRef.current)
    return () => register(value, null)
  }, [value, register])

  return (
    <div
      ref={ref}
      data-state={open ? "open" : "closed"}
      data-disabled={disabled || undefined}
      className={cn(
        "prui-accordion-item rounded-prui border border-line bg-surface",
        disabled && "opacity-50",
        className,
      )}
      {...props}
    >
      <button
        ref={headerRef}
        type="button"
        id={headerId}
        aria-expanded={open}
        aria-controls={panelId}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={() => toggle(value)}
        className={cn(
          "flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-medium text-fg",
          "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-prui",
          disabled && "cursor-not-allowed",
        )}
      >
        {children instanceof Array ? children[0] : children}
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-dim transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={headerId}
        hidden={!open}
        className="prui-accordion-panel px-4 pb-3 text-sm text-dim"
      >
        {children instanceof Array ? children.slice(1) : null}
      </div>
    </div>
  )
})
AccordionItem.displayName = "AccordionItem"

export const accordionPropsMeta: PropsMeta = {
  name: "Accordion",
  props: [
    { name: "type", type: "'single' | 'multiple'", default: "'single'", control: "select", options: ["single", "multiple"] },
    { name: "value", type: "string[]", default: "undefined", control: "object" },
    { name: "defaultValue", type: "string[]", default: "[]", control: "object" },
    { name: "onChange", type: "(openValues: string[]) => void", default: null, control: "none" },
  ],
}
