import * as React from "react"
import { cn } from "./cn"
import type { PropsMeta } from "./props-meta"

export interface DropdownItem {
  label: string
  onSelect?: () => void
  danger?: boolean
  disabled?: boolean
  separatorBefore?: boolean
}

export interface DropdownProps {
  items?: DropdownItem[]
  trigger?: React.ReactNode
  children?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  align?: "start" | "end"
  className?: string
}

export const Dropdown = ({
  items,
  trigger,
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  align = "start",
  className,
}: DropdownProps) => {
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : uncontrolled
  const rootRef = React.useRef<HTMLDivElement>(null)

  const setOpen = (o: boolean) => {
    if (!isControlled) setUncontrolled(o)
    onOpenChange?.(o)
  }

  React.useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onDocClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDocClick)
      document.removeEventListener("keydown", onKey)
    }
  })

  return (
    <div ref={rootRef} className={cn("prui-dropdown relative inline-block", className)} data-state={open ? "open" : "closed"}>
      <div
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            setOpen(!open)
          }
        }}
      >
        {trigger}
      </div>
      {open ? (
        <div
          role="menu"
          className={cn(
            "prui-dropdown-menu absolute z-50 mt-1 min-w-40 rounded-[var(--prui-radius)] border border-[var(--prui-line)]",
            "bg-[var(--prui-surface)] p-1 shadow-lg",
            align === "end" ? "right-0" : "left-0",
          )}
        >
          {children ??
            (items ?? []).map((item, i) => (
              <React.Fragment key={`${item.label}-${i}`}>
                {item.separatorBefore ? <div className="my-1 h-px bg-[var(--prui-line)]" /> : null}
                <button
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => {
                    if (item.disabled) return
                    setOpen(false)
                    item.onSelect?.()
                  }}
                  className={cn(
                    "flex w-full items-center rounded-[calc(var(--prui-radius)-1px)] px-2.5 py-1.5 text-left text-sm",
                    "hover:bg-[var(--prui-raise)] cursor-pointer disabled:opacity-50 disabled:pointer-events-none",
                    item.danger ? "text-[var(--prui-danger)]" : "text-[var(--prui-fg)]",
                  )}
                >
                  {item.label}
                </button>
              </React.Fragment>
            ))}
        </div>
      ) : null}
    </div>
  )
}
Dropdown.displayName = "Dropdown"

export const dropdownPropsMeta: PropsMeta = {
  name: "Dropdown",
  props: [
    { name: "items", type: "DropdownItem[]", default: "[]", control: "object" },
    { name: "trigger", type: "ReactNode", default: null, control: "none" },
    { name: "align", type: "'start' | 'end'", default: "'start'", control: "select", options: ["start", "end"] },
    { name: "onOpenChange", type: "(open: boolean) => void", default: null, control: "none" },
  ],
}
