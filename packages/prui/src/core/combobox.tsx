import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "./cn"
import { useFieldSlots, type FieldSlotProps } from "./form-field"
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

export interface ComboboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "defaultValue">, FieldSlotProps {
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
  /** Select-or-create mode: typing a value that matches no option shows a
   * create row (and Tab/blur commits the typed value). onChange fires with
   * the final string either way — picked or typed. */
  allowCreate?: boolean
  /** Label for the create row; defaults to Create "query". */
  createText?: React.ReactNode
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
    allowCreate = false,
    createText,
    defaultOpen = false,
    filter,
    disabled,
    id,
    label,
    helperText,
    className,
    onKeyDown,
    ...props
  },
  ref,
) {
  const field = useFieldSlots({ id, label, helperText })
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
  // select-or-create: the typed query becomes a committable value when it
  // does not already resolve to an option (label or value, case-insensitive)
  const trimmedQuery = query?.trim() ?? ""
  const canCreate =
    allowCreate &&
    trimmedQuery !== "" &&
    !options.some(
      (o) => o.value.toLowerCase() === trimmedQuery.toLowerCase() || o.label.toLowerCase() === trimmedQuery.toLowerCase(),
    )

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

  const commitCreate = () => {
    if (!canCreate) return
    if (valueProp === undefined) setUncontrolled(trimmedQuery)
    onChange?.(trimmedQuery)
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
    // the create row, when shown, is index 0 of the navigable rows
    const rowCount = filtered.length + (canCreate ? 1 : 0)
    const rowAt = (i: number) => (canCreate ? i - 1 : i)
    const enabled = (i: number) => {
      const r = rowAt(i)
      return r < 0 || !filtered[r]?.disabled
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setActiveIndex(moveIndex(activeIndex, 1, rowCount, { enabled }))
        break
      case "ArrowUp":
        e.preventDefault()
        setActiveIndex(moveIndex(activeIndex, -1, rowCount, { enabled }))
        break
      case "Home":
        if (rowCount) {
          e.preventDefault()
          setActiveIndex(homeIndex(rowCount, enabled))
        }
        break
      case "End":
        if (rowCount) {
          e.preventDefault()
          setActiveIndex(endIndex(rowCount, enabled))
        }
        break
      case "Enter": {
        e.preventDefault()
        const opt = filtered[rowAt(activeIndex)]
        if (canCreate && activeIndex === 0) commitCreate()
        else if (opt) pick(opt)
        break
      }
      case "Tab":
        // free text survives tabbing away, like a native datalist input
        if (canCreate) commitCreate()
        else setOpen(false)
        break
    }
  }

  return field.wrap(
    <>
      <div ref={wrapRef} className={cn("prui-combobox relative inline-flex w-full items-center", className)}>
        <input
        ref={(node) => {
          inputRef.current = node
          if (typeof ref === "function") ref(node)
          else if (ref) ref.current = node
        }}
        id={field.id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={open && (canCreate || filtered[activeIndex - (canCreate ? 1 : 0)]) ? `${listboxId}-option-${activeIndex}` : undefined}
        aria-autocomplete="list"
        autoComplete="off"
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          "prui-combobox-trigger h-9 w-full pr-8",
          "bg-background rounded-prui px-3 text-sm text-fg placeholder:text-dim",
          "outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-ring/30",
          "disabled:opacity-50 disabled:cursor-not-allowed cursor-text",
          className,
        )}
        value={query !== null ? query : (selectedLabel ?? (allowCreate && value ? value : ""))}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
          setActiveIndex(0)
        }}
        onFocus={() => {
          if (!open && !disabled) setOpen(true)
        }}
        onBlur={() => {
          if (canCreate) commitCreate()
        }}
        onKeyDown={handleKeyDown}
        {...props}
      />
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" aria-hidden />
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
              "border border-line rounded-prui bg-surface shadow-prui-md",
            )}
            style={{
              top: position?.top ?? -9999,
              left: position?.left ?? -9999,
              minWidth: inputRef.current?.offsetWidth ?? 200,
            }}
          >
            {canCreate ? (
              <div
                id={`${listboxId}-option-create`}
                role="option"
                aria-selected={false}
                data-active={activeIndex === 0 || undefined}
                tabIndex={-1}
                data-testid="combobox-create"
                onMouseEnter={() => setActiveIndex(0)}
                onClick={commitCreate}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-prui-inner px-3 py-1.5 text-sm text-brand",
                  activeIndex === 0 && "bg-raise",
                )}
              >
                <span aria-hidden className="font-semibold">+</span>
                <span className="min-w-0 truncate">{createText ?? `Create "${trimmedQuery}"`}</span>
              </div>
            ) : null}
            {options.length === 0 && emptyText && !canCreate ? (
              <div className="px-3 py-2 text-sm text-dim">{emptyText}</div>
            ) : filtered.length === 0 && !canCreate ? (
              <div className="px-3 py-2 text-sm text-dim" role="option" aria-selected="false" aria-disabled="true">
                {noMatchText}
              </div>
            ) : (
              filtered.map((opt, i) => {
                const row = i + (canCreate ? 1 : 0)
                const isSelected = value === opt.value
                return (
                  <div
                    key={opt.value}
                    id={`${listboxId}-option-${row}`}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={opt.disabled}
                    data-active={row === activeIndex || undefined}
                    data-selected={isSelected || undefined}
                    tabIndex={-1}
                    onMouseEnter={() => setActiveIndex(row)}
                    onClick={() => pick(opt)}
                    className={cn(
                      "flex cursor-pointer items-center rounded-prui-inner px-3 py-1.5 text-sm text-fg",
                      i === activeIndex && "bg-raise",
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
    </>,
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
    { name: "allowCreate", type: "boolean", default: "false", control: "boolean", description: "Select-or-create: a create row appears for typed non-matches; Enter/click/Tab/blur commits the typed value via onChange." },
    { name: "createText", type: "ReactNode", default: 'Create "query"', control: "text" },
    { name: "filter", type: "(option, query) => boolean", default: "label contains query", control: "none" },
  ],
}
