import * as React from "react"
import { ChevronDown, Check, Search } from "lucide-react"
import { cn } from "./cn"
import { Portal, useOverlayStack, useEscapeKey } from "./overlay"
import { useAnchoredPosition } from "./anchor"
import { moveIndex, homeIndex, endIndex, typeaheadIndex } from "./list-nav"
import { usePruiI18n } from "../i18n"
import type { PropsMeta } from "./props-meta"

/**
 * Select: a native-feeling single/multiple select listbox.
 *
 * - searchable: a filter input pins to the top of the listbox; typing
 *   narrows the options in place (works with the options prop and with
 *   compound <SelectItem> children alike).
 * - multiple: multi-select — clicking toggles without closing; value and
 *   onChange become string[] and the trigger shows the first selected
 *   label plus a +N count.
 *
 * Keyboard: Enter/Space/ArrowDown open, ArrowUp/Down/Home/End move,
 * Enter/Space pick, Escape (topmost overlay only) closes and restores
 * focus, Tab closes, printable-character typeahead jumps. Non-modal: no
 * scroll lock. The listbox portals to the body and anchors under the
 * trigger, so no ancestor can clip or displace it.
 */

export interface SelectOption {
  label: string
  value: string
  disabled?: boolean
}

export interface SelectProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "value" | "defaultValue" | "multiple"> {
  options?: SelectOption[]
  /** string in single mode, string[] with multiple. */
  value?: string | string[]
  defaultValue?: string | string[]
  placeholder?: string
  disabled?: boolean
  name?: string
  /** Emits string in single mode, string[] with multiple. */
  onChange?: (value: string | string[]) => void
  onOpenChange?: (open: boolean) => void
  /** Type-to-filter the options inside the listbox. */
  searchable?: boolean
  /** Multi-select: value/onChange become string[], items toggle. */
  multiple?: boolean
}

interface SelectCtx {
  values: string[]
  multiple: boolean
  searchable: boolean
  /** Display labels for the current selection when the options prop is used. */
  displayValue?: string
  open: boolean
  /** The rendered trigger element (listbox anchors to it). */
  triggerEl: HTMLButtonElement | null
  triggerId?: string
  toggleValue: (v: string) => void
  setOpen: (o: boolean) => void
  registerTrigger: (el: HTMLButtonElement | null) => void
  /** Restore focus to the trigger when the listbox closes. */
  returnFocusToTrigger: () => void
  /** SelectItem registers its label so SelectValue can display it. */
  registerLabel: (value: string, label: string | null) => void
}

const Ctx = React.createContext<SelectCtx | null>(null)

function useSelect(): SelectCtx {
  const ctx = React.useContext(Ctx)
  if (!ctx) throw new Error("Select parts must be used inside <Select>")
  return ctx
}

const asArray = (v: string | string[] | undefined): string[] =>
  v === undefined ? [] : Array.isArray(v) ? v : [v]

export const Select = ({
  options,
  value: valueProp,
  defaultValue,
  placeholder = "Select...",
  disabled,
  name,
  onChange,
  onOpenChange,
  searchable = false,
  multiple = false,
  id,
  children,
  ...rest
}: SelectProps) => {
  const [uncontrolled, setUncontrolled] = React.useState<string[]>(asArray(defaultValue))
  const [open, setOpenRaw] = React.useState(false)
  const [triggerEl, setTriggerEl] = React.useState<HTMLButtonElement | null>(null)
  const [labels, setLabels] = React.useState<Record<string, string>>({})
  const isControlled = valueProp !== undefined
  const values = isControlled ? asArray(valueProp) : uncontrolled

  const toggleValue = (v: string) => {
    let next: string[]
    if (multiple) {
      next = values.includes(v) ? values.filter((x) => x !== v) : [...values, v]
    } else {
      next = values.includes(v) ? [] : [v]
    }
    if (!isControlled) setUncontrolled(next)
    onChange?.(multiple ? next : (next[0] ?? ""))
  }

  const changeOpen = (o: boolean) => {
    setOpenRaw(o)
    onOpenChange?.(o)
  }

  const returnFocusToTrigger = () => triggerEl?.focus()

  const labelOf = (v: string) => labels[v] ?? options?.find((o) => o.value === v)?.label
  const displayValue = values.length ? values.map((v) => labelOf(v) ?? v).join(", ") : undefined

  const registerLabel = React.useCallback((v: string, label: string | null) => {
    setLabels((prev) => {
      if (label === null) {
        if (!(v in prev)) return prev
        const next = { ...prev }
        delete next[v]
        return next
      }
      if (prev[v] === label) return prev
      return { ...prev, [v]: label }
    })
  }, [])

  return (
    <Ctx.Provider
      value={{ values, multiple, searchable, displayValue, open, triggerEl, triggerId: triggerEl?.id || undefined, toggleValue, setOpen: changeOpen, registerTrigger: setTriggerEl, returnFocusToTrigger, registerLabel }}
    >
      {name ? <input type="hidden" name={name} value={values.join(",")} /> : null}
      {children ?? (
        <>
          <SelectTrigger disabled={disabled} id={id} {...rest}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {(options ?? []).map((opt) => (
              <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </>
      )}
    </Ctx.Provider>
  )
}
Select.displayName = "Select"

export type SelectTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, onClick, onKeyDown, disabled, id, ...props }, ref) => {
    const { open, setOpen, registerTrigger } = useSelect()
    const internalRef = React.useRef<HTMLButtonElement>(null)
    // auto-id so the listbox can label itself from the trigger
    const autoId = React.useId()
    const effectiveId = id ?? `prui-select-${autoId}`
    React.useEffect(() => {
      registerTrigger(internalRef.current)
      return () => registerTrigger(null)
    }, [registerTrigger])
    const listboxId = `${effectiveId}-listbox`
    return (
      <button
        ref={(node) => {
          internalRef.current = node
          if (typeof ref === "function") ref(node)
          else if (ref) ref.current = node
        }}
        id={effectiveId}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listboxId : undefined}
        disabled={disabled}
        data-state={open ? "open" : "closed"}
        className={cn(
          "prui-select-trigger flex h-9 w-full items-center justify-between gap-2 border border-[var(--prui-line)]",
          "bg-[var(--prui-background)] rounded-[var(--prui-radius)] px-3 text-sm text-[var(--prui-fg)]",
          "outline-none transition-colors focus:border-[var(--prui-brand)] focus:ring-2 focus:ring-[var(--prui-brand)]/30",
          "disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
          className,
        )}
        onClick={(e) => {
          onClick?.(e)
          if (!e.defaultPrevented) setOpen(!open)
        }}
        onKeyDown={(e) => {
          onKeyDown?.(e)
          if (e.defaultPrevented) return
          if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ")) {
            e.preventDefault()
            setOpen(true)
          }
        }}
        {...props}
      >
        {children}
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-[var(--prui-dim)] transition-transform", open && "rotate-180")} aria-hidden />
      </button>
    )
  },
)
SelectTrigger.displayName = "SelectTrigger"

export interface SelectValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  placeholder?: string
}

export const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ className, placeholder, children, ...props }, ref) => {
    const { values, displayValue, multiple } = useSelect()
    const empty = values.length === 0
    return (
      <span ref={ref} className={cn("truncate", className)} {...props}>
        {children ??
          (empty ? (
            <span className="text-[var(--prui-dim)]">{placeholder}</span>
          ) : multiple && values.length > 1 ? (
            <>
              <span className="text-[var(--prui-fg)]">{displayValue?.split(", ")[0] ?? values[0]}</span>
              <span className="ml-1 rounded-[var(--prui-radius-full)] bg-[var(--prui-raise)] px-1.5 text-xs text-[var(--prui-dim)]">
                +{values.length - 1}
              </span>
            </>
          ) : (
            (displayValue ?? values[0])
          ))}
      </span>
    )
  },
)
SelectValue.displayName = "SelectValue"

export type SelectContentProps = React.HTMLAttributes<HTMLDivElement>

export const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, id, ...props }, ref) => {
    const { open, setOpen, triggerEl, toggleValue, returnFocusToTrigger, searchable, multiple } = useSelect()
    const listRef = React.useRef<HTMLDivElement>(null)
    const searchRef = React.useRef<HTMLInputElement>(null)
    const [activeIndex, setActiveIndex] = React.useState(-1)
    const [query, setQuery] = React.useState("")
    const typeaheadRef = React.useRef({ buffer: "", at: 0 })
    const anchorRef = React.useRef<HTMLButtonElement | null>(null)
    anchorRef.current = triggerEl
    // panel element in state: the portal mounts its container one commit
    // after open flips, so effects need the post-mount render to see it
    const [listEl, setListEl] = React.useState<HTMLDivElement | null>(null)
    const { t } = usePruiI18n()

    const { setElement, isTop } = useOverlayStack(open)
    useEscapeKey(open, isTop, () => {
      setOpen(false)
      returnFocusToTrigger()
    })

    // the listbox portals to the body and anchors under the trigger so no
    // ancestor (overflow containers, sticky headers) can clip or displace it
    const { ref: floatingRef, position } = useAnchoredPosition({ active: open, anchorRef, side: "bottom", align: "start" })

    const optionEls = React.useCallback(() => {
      const list = listRef.current
      if (!list) return [] as HTMLElement[]
      return Array.from(list.querySelectorAll<HTMLElement>("[role='option']"))
    }, [])

    const visibleEls = React.useCallback(
      () => optionEls().filter((el) => el.style.display !== "none"),
      [optionEls],
    )

    // searchable: hide options whose label does not contain the query
    const applyFilter = (q: string) => {
      const needle = q.trim().toLowerCase()
      for (const el of optionEls()) {
        el.style.display = (el.textContent ?? "").toLowerCase().includes(needle) ? "" : "none"
      }
      setActiveIndex(-1)
    }

    React.useEffect(() => {
      if (!open) {
        setQuery("")
        return
      }
      applyFilter("")
      // eslint-disable-next-line react-hooks/exhaustive-deps -- reset the filter on every open
    }, [open])

    const focusOption = (i: number) => {
      const els = visibleEls()
      if (i < 0 || els.length === 0) return
      const clamped = Math.min(i, els.length - 1)
      setActiveIndex(clamped)
      els[clamped]?.focus()
    }

    // on open: searchable focuses the filter input; otherwise the selected
    // option, else the first enabled one
    React.useEffect(() => {
      if (!open || !listEl) return
      setActiveIndex(-1)
      if (searchable) {
        searchRef.current?.focus()
        return
      }
      const els = optionEls()
      const selectedIdx = els.findIndex((el) => el.getAttribute("aria-selected") === "true")
      const firstEnabled = els.findIndex((el) => el.getAttribute("aria-disabled") !== "true")
      const target = selectedIdx >= 0 ? selectedIdx : firstEnabled
      if (target >= 0) {
        setActiveIndex(target)
        els[target]?.focus()
      }
    }, [open, listEl, optionEls, searchable])

    if (!open) return null

    const onKeyDown = (e: React.KeyboardEvent) => {
      // keystrokes typed into the filter input belong to it (they bubble
      // here); only Tab falls through to close the listbox
      if ((e.target as HTMLElement)?.tagName === "INPUT") {
        if (e.key === "Tab") setOpen(false)
        return
      }
      const els = visibleEls()
      const enabled = (i: number) => els[i]?.getAttribute("aria-disabled") !== "true"
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          focusOption(moveIndex(activeIndex, 1, els.length, { enabled }))
          break
        case "ArrowUp":
          e.preventDefault()
          focusOption(moveIndex(activeIndex, -1, els.length, { enabled }))
          break
        case "Home":
          e.preventDefault()
          focusOption(homeIndex(els.length, enabled))
          break
        case "End":
          e.preventDefault()
          focusOption(endIndex(els.length, enabled))
          break
        case "Enter":
        case " ": {
          e.preventDefault()
          const el = els[activeIndex]
          if (el && enabled(activeIndex)) {
            const value = el.dataset.value
            if (value !== undefined) {
              toggleValue(value)
              if (!multiple) {
                setOpen(false)
                returnFocusToTrigger()
              }
            } else {
              el.click()
            }
          }
          break
        }
        case "Tab":
          setOpen(false)
          break
        default: {
          if (e.key.length === 1) {
            const labels = () => els.map((el) => el.textContent ?? "")
            const { index } = typeaheadIndex(labels, typeaheadRef.current, e.key, activeIndex)
            if (index >= 0 && index !== activeIndex) {
              e.preventDefault()
              focusOption(index)
            }
          }
        }
      }
    }

    const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        const els = visibleEls()
        const firstEnabled = els.findIndex((el) => el.getAttribute("aria-disabled") !== "true")
        if (firstEnabled >= 0) focusOption(firstEnabled)
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        const els = visibleEls()
        const lastEnabled = endIndex(els.length, (i) => els[i]?.getAttribute("aria-disabled") !== "true")
        if (lastEnabled >= 0) focusOption(lastEnabled)
      } else if (e.key === "Enter") {
        e.preventDefault()
        const els = visibleEls()
        const firstEnabled = els.findIndex((el) => el.getAttribute("aria-disabled") !== "true")
        if (firstEnabled >= 0) {
          const value = els[firstEnabled]!.dataset.value
          if (value !== undefined) {
            toggleValue(value)
            if (!multiple) {
              setOpen(false)
              returnFocusToTrigger()
            }
          }
        }
      }
    }

    const noMatches = searchable && query !== "" && visibleEls().length === 0

    return (
      <Portal>
        <div
          ref={(node) => {
            listRef.current = node
            setListEl(node)
            floatingRef(node)
            setElement(node)
            if (typeof ref === "function") ref(node)
            else if (ref) ref.current = node
          }}
          id={id ?? (triggerEl?.id ? `${triggerEl.id}-listbox` : undefined)}
          role="listbox"
          aria-labelledby={triggerEl?.id || undefined}
          aria-multiselectable={multiple || undefined}
          tabIndex={-1}
          data-state={open ? "open" : "closed"}
          onKeyDown={onKeyDown}
          className={cn(
            "prui-select-content fixed z-[var(--prui-z-overlay)] max-h-60 overflow-auto p-1",
            "bg-[var(--prui-surface)] border border-[var(--prui-line)] rounded-[var(--prui-radius)] shadow-[var(--prui-shadow-md)] outline-none",
            className,
          )}
          style={{
            top: position?.top ?? -9999,
            left: position?.left ?? -9999,
            minWidth: triggerEl ? Math.max(triggerEl.offsetWidth, 160) : 160,
          }}
          {...props}
        >
          {searchable ? (
            <div className="sticky top-0 z-[var(--prui-z-content)] mb-1 bg-[var(--prui-surface)] p-1">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--prui-dim)]" aria-hidden />
                <input
                  ref={searchRef}
                  type="text"
                  role="searchbox"
                  aria-label={t.search}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    applyFilter(e.target.value)
                  }}
                  onKeyDown={onSearchKeyDown}
                  placeholder={`${t.search}…`}
                  className="h-8 w-full rounded-[calc(var(--prui-radius)-2px)] border border-[var(--prui-line)] bg-[var(--prui-background)] pl-8 pr-2 text-sm text-[var(--prui-fg)] placeholder:text-[var(--prui-dim)] outline-none focus:border-[var(--prui-brand)]"
                />
              </div>
            </div>
          ) : null}
          {noMatches ? (
            <div className="px-3 py-2 text-sm text-[var(--prui-dim)]" role="option" aria-selected="false" aria-disabled="true">
              {t.noResults}
            </div>
          ) : (
            children
          )}
        </div>
      </Portal>
    )
  },
)
SelectContent.displayName = "SelectContent"

export type SelectItemProps = React.HTMLAttributes<HTMLDivElement> & {
  value: string
  disabled?: boolean
}

export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, value, disabled, children, onClick, tabIndex = -1, ...props }, ref) => {
    const { values, toggleValue, setOpen, returnFocusToTrigger, multiple, registerLabel } = useSelect()
    const isSelected = values.includes(value)
    // a plain-text child doubles as the display label for SelectValue;
    // registration survives unmount so the closed trigger keeps its label
    const labelText = typeof children === "string" || typeof children === "number" ? String(children) : undefined
    React.useEffect(() => {
      if (labelText !== undefined) registerLabel(value, labelText)
    }, [value, labelText, registerLabel])
    return (
      <div
        ref={ref}
        role="option"
        aria-selected={isSelected}
        aria-disabled={disabled}
        data-selected={isSelected || undefined}
        data-value={value}
        tabIndex={tabIndex}
        className={cn(
          "prui-select-item relative flex cursor-pointer items-center gap-2 rounded-[calc(var(--prui-radius)-1px)]",
          "py-1.5 pl-3 pr-8 text-sm text-[var(--prui-fg)] hover:bg-[var(--prui-raise)] focus-visible:bg-[var(--prui-raise)] outline-none",
          isSelected && "font-medium",
          disabled && "opacity-50 pointer-events-none",
          className,
        )}
        onClick={(e) => {
          onClick?.(e)
          if (e.defaultPrevented || disabled) return
          toggleValue(value)
          if (!multiple) {
            setOpen(false)
            returnFocusToTrigger()
          }
        }}
        {...props}
      >
        {children}
        {isSelected ? <Check className="absolute right-2 h-4 w-4 text-[var(--prui-brand)]" aria-hidden /> : null}
      </div>
    )
  },
)
SelectItem.displayName = "SelectItem"

export const selectPropsMeta: PropsMeta = {
  name: "Select",
  props: [
    { name: "options", type: "SelectOption[]", default: "[]", control: "object" },
    { name: "value", type: "string | string[]", default: "undefined", control: "text" },
    { name: "defaultValue", type: "string | string[]", default: "undefined", control: "text" },
    { name: "placeholder", type: "string", default: "'Select...'", control: "text" },
    { name: "disabled", type: "boolean", default: "false", control: "boolean" },
    { name: "onChange", type: "(value: string | string[]) => void", default: null, control: "none", description: "string in single mode, string[] with multiple." },
    { name: "searchable", type: "boolean", default: "false", control: "boolean", description: "Adds a filter input to the listbox." },
    { name: "multiple", type: "boolean", default: "false", control: "boolean", description: "Multi-select; items toggle, value becomes string[]." },
  ],
}
