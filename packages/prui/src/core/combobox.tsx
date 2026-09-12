import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "./cn"
import { Portal, useOverlayStack, useEscapeKey } from "./overlay"
import { useAnchoredPosition } from "./anchor"
import { moveIndex, homeIndex, endIndex } from "./list-nav"
import type { PropsMeta } from "./props-meta"

/**
 * Combobox: a text input with a filtered listbox (the editable Select).
 * Full ARIA 1.2 combobox pattern: aria-expanded/controls/activedescendant,
 * ArrowDown/Up move, Home/End jump, Enter picks, Escape (topmost only)
 * closes and refocuses, typing filters. Controlled and uncontrolled value.
 */

export interface ComboboxOption {
  label: string
  value: string
  disabled?: boolean
}

export interface ComboboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "defaultValue"> {
  options: ComboboxOption[]
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onOpenChange?: (open: boolean) => void
  placeholder?: string
  /** Input placeholder when no value is set. */
  emptyText?: React.ReactNode
  /** Message when no option matches the query. */
  noMatchText?: React.ReactNode
  /** Start with the listbox open. */
  defaultOpen?: boolean
  /** Match function; default is label contains query (case-insensitive). */
  filter?: (option: ComboboxOption, query: string) => boolean
  disabled?: boolean
}

export const Combobox = React.forwardRef<HTMLInputElement, ComboboxProps>(function Combobox(
  {
    options,
    value: valueProp,
    defaultValue,
    onChange,
    onOpenChange,
    placeholder = "Type to search...",
    emptyText,
    noMatchText = "No matches.",
    defaultOpen = false,
    filter,
    disabled,
    id,
    className,
    onKeyDown,
    ...props
  },
  ref,
) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? "")
  const [open, setOpenRaw] = React.useState(defaultOpen)
  const [query, setQuery] = React.useState<string | null>(null)
  const [activeIndex, setActiveIndex] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const listboxId = React.useId()
  const value = valueProp !== undefined ? valueProp : uncontrolled
  const selectedLabel = options.find((o) => o.value === value)?.label

  const setOpen = (o: boolean) => {
    setOpenRaw(o)
    onOpenChange?.(o)
    if (!o) {
      setQuery(null)
      const active = document.activeElement
      if (active && listRef.current?.contains(active)) inputRef.current?.focus()
    }
  }

  const { setElement, isTop } = useOverlayStack(open)
  useEscapeKey(open, isTop, () => {
    setOpen(false)
    inputRef.current?.focus()
  })

  // outside pointer closes the listbox
  React.useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node
      if (wrapRef.current?.contains(target)) return
      if (listRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener("mousedown", onPointer)
    return () => document.removeEventListener("mousedown", onPointer)
  })

  const filtered = React.useMemo(() => {
    if (query === null) return options
    const q = query.toLowerCase()
    if (!q) return options
    return options.filter((o) => (filter ? filter(o, q) : o.label.toLowerCase().includes(q)))
  }, [options, query, filter])

  React.useEffect(() => {
    setActiveIndex((prev) => (prev < filtered.length ? prev : Math.max(0, filtered.length - 1)))
  }, [filtered.length])

  const pick = (opt: ComboboxOption) => {
    if (opt.disabled) return
    if (valueProp === undefined) setUncontrolled(opt.value)
    onChange?.(opt.value)
    setQuery(null)
    setOpen(false)
    inputRef.current?.focus()
  }

  const anchorRef = wrapRef as React.RefObject<HTMLElement | null>
  const { ref: floatingRef, position } = useAnchoredPosition({ active: open, anchorRef, side: "bottom", align: "start" })

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e)
    if (e.defaultPrevented) return
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault()
      setOpen(true)
      return
    }
    if (!open) return
    const enabled = (i: number) => !filtered[i]?.disabled
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setActiveIndex(moveIndex(activeIndex, 1, filtered.length, { enabled }))
        break
      case "ArrowUp":
        e.preventDefault()
        setActiveIndex(moveIndex(activeIndex, -1, filtered.length, { enabled }))
        break
      case "Home":
        if (filtered.length) {
          e.preventDefault()
          setActiveIndex(homeIndex(filtered.length, enabled))
        }
        break
      case "End":
        if (filtered.length) {
          e.preventDefault()
          setActiveIndex(endIndex(filtered.length, enabled))
        }
        break
      case "Enter":
        e.preventDefault()
        if (filtered[activeIndex]) pick(filtered[activeIndex])
        break
      case "Tab":
        setOpen(false)
        break
    }
  }

  return (
    <>
      <div ref={wrapRef} className={cn("prui-combobox relative inline-flex w-full items-center", className)}>
        <input
        ref={(node) => {
          inputRef.current = node
          if (typeof ref === "function") ref(node)
          else if (ref) ref.current = node
        }}
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={open && filtered[activeIndex] ? `${listboxId}-option-${activeIndex}` : undefined}
        aria-autocomplete="list"
        autoComplete="off"
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          "prui-combobox-trigger h-9 w-full pr-8",
          "bg-[var(--prui-background)] rounded-[var(--prui-radius)] px-3 text-sm text-[var(--prui-fg)] placeholder:text-[var(--prui-dim)]",
          "outline-none transition-colors focus:border-[var(--prui-brand)] focus:ring-2 focus:ring-[var(--prui-brand)]/30",
          "disabled:opacity-50 disabled:cursor-not-allowed cursor-text",
          className,
        )}
        value={query !== null ? query : (selectedLabel ?? "")}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
          setActiveIndex(0)
        }}
        onFocus={() => {
          if (!open && !disabled) setOpen(true)
        }}
        onKeyDown={handleKeyDown}
        {...props}
      />
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--prui-dim)]" aria-hidden />
      </div>
      {open ? (
        <Portal>
          <div
            ref={(node) => {
              listRef.current = node
              floatingRef(node)
              setElement(node)
            }}
            id={listboxId}
            role="listbox"
            aria-label={props["aria-label"] ?? "Options"}
            tabIndex={-1}
            data-state="open"
            className={cn(
              "prui-combobox-content fixed z-[var(--prui-z-overlay)] min-w-40 max-h-60 overflow-auto p-1",
              "border border-[var(--prui-line)] rounded-[var(--prui-radius)] bg-[var(--prui-surface)] shadow-[var(--prui-shadow-md)]",
            )}
            style={{
              top: position?.top ?? -9999,
              left: position?.left ?? -9999,
              minWidth: inputRef.current?.offsetWidth ?? 200,
            }}
          >
            {options.length === 0 && emptyText ? (
              <div className="px-3 py-2 text-sm text-[var(--prui-dim)]">{emptyText}</div>
            ) : filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-[var(--prui-dim)]" role="option" aria-selected="false" aria-disabled="true">
                {noMatchText}
              </div>
            ) : (
              filtered.map((opt, i) => {
                const isSelected = value === opt.value
                return (
                  <div
                    key={opt.value}
                    id={`${listboxId}-option-${i}`}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={opt.disabled}
                    data-active={i === activeIndex || undefined}
                    data-selected={isSelected || undefined}
                    tabIndex={-1}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => pick(opt)}
                    className={cn(
                      "flex cursor-pointer items-center rounded-[calc(var(--prui-radius)-1px)] px-3 py-1.5 text-sm text-[var(--prui-fg)]",
                      i === activeIndex && "bg-[var(--prui-raise)]",
                      isSelected && "font-medium",
                      opt.disabled && "opacity-50 pointer-events-none",
                    )}
                  >
                    {opt.label}
                  </div>
                )
              })
            )}
          </div>
        </Portal>
      ) : null}
    </>
  )
})
Combobox.displayName = "Combobox"

export const comboboxPropsMeta: PropsMeta = {
  name: "Combobox",
  props: [
    { name: "options", type: "ComboboxOption[]", default: null, control: "object" },
    { name: "value", type: "string", default: "undefined", control: "text" },
    { name: "defaultValue", type: "string", default: "undefined", control: "text" },
    { name: "onChange", type: "(value: string) => void", default: null, control: "none" },
    { name: "placeholder", type: "string", default: "'Type to search...'", control: "text" },
    { name: "noMatchText", type: "ReactNode", default: "'No matches.'", control: "text" },
    { name: "filter", type: "(option, query) => boolean", default: "label contains query", control: "none" },
  ],
}
