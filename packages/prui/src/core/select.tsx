import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "./cn"
import { useOverlayStack, useEscapeKey } from "./overlay"
import { moveIndex, homeIndex, endIndex, typeaheadIndex } from "./list-nav"
import type { PropsMeta } from "./props-meta"

/**
 * Select: a native-feeling single-select listbox. Full keyboard support:
 * Enter/Space/ArrowDown open, ArrowUp/Down/Home/End move, Enter/Space pick,
 * Escape (topmost overlay only) closes and restores focus, Tab closes,
 * printable-character typeahead jumps. Non-modal: no scroll lock.
 */

export interface SelectOption {
  label: string
  value: string
  disabled?: boolean
}

export interface SelectProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "value"> {
  options?: SelectOption[]
  value?: string
  defaultValue?: string
  placeholder?: string
  disabled?: boolean
  name?: string
  onChange?: (value: string) => void
  onOpenChange?: (open: boolean) => void
}

interface SelectCtx {
  value: string
  /** Display label for the current value when the options prop is used. */
  displayValue?: string
  open: boolean
  triggerId?: string
  setValue: (v: string) => void
  setOpen: (o: boolean) => void
  registerTrigger: (el: HTMLButtonElement | null) => void
  /** Restore focus to the trigger when the listbox closes. */
  returnFocusToTrigger: () => void
  /** SelectItem registers its label so SelectValue can display it. */
  registerLabel: (value: string, label: string | null) => void
  labeledBy?: string
}

const Ctx = React.createContext<SelectCtx | null>(null)

function useSelect(): SelectCtx {
  const ctx = React.useContext(Ctx)
  if (!ctx) throw new Error("Select parts must be used inside <Select>")
  return ctx
}

export const Select = ({
  options,
  value: valueProp,
  defaultValue,
  placeholder = "Select...",
  disabled,
  name,
  id,
  onChange,
  onOpenChange,
  children,
  ...rest
}: SelectProps) => {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? "")
  const [open, setOpenRaw] = React.useState(false)
  const [triggerEl, setTriggerEl] = React.useState<HTMLButtonElement | null>(null)
  const [labels, setLabels] = React.useState<Record<string, string>>({})
  const value = valueProp !== undefined ? valueProp : uncontrolled

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

  const setValue = (v: string) => {
    if (valueProp === undefined) setUncontrolled(v)
    onChange?.(v)
  }
  const changeOpen = (o: boolean) => {
    setOpenRaw(o)
    onOpenChange?.(o)
  }

  const returnFocusToTrigger = () => triggerEl?.focus()

  const displayValue = labels[value] ?? options?.find((o) => o.value === value)?.label

  return (
    <Ctx.Provider
      value={{ value, displayValue, open, triggerId: triggerEl?.id || undefined, setValue, setOpen: changeOpen, registerTrigger: setTriggerEl, returnFocusToTrigger, registerLabel }}
    >
      {name ? <input type="hidden" name={name} value={value} /> : null}
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
    const { value, displayValue } = useSelect()
    return (
      <span ref={ref} className={cn("truncate", className)} {...props}>
        {children ?? (displayValue ?? (value || <span className="text-[var(--prui-dim)]">{placeholder}</span>))}
      </span>
    )
  },
)
SelectValue.displayName = "SelectValue"

export type SelectContentProps = React.HTMLAttributes<HTMLDivElement>

export const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, id, ...props }, ref) => {
    const { open, setOpen, triggerId, setValue, returnFocusToTrigger } = useSelect()
    const listRef = React.useRef<HTMLDivElement>(null)
    const [activeIndex, setActiveIndex] = React.useState(-1)
    const typeaheadRef = React.useRef({ buffer: "", at: 0 })

    const { setElement, isTop } = useOverlayStack(open)
    useEscapeKey(open, isTop, () => {
      setOpen(false)
      returnFocusToTrigger()
    })

    const optionEls = React.useCallback(() => {
      const list = listRef.current
      if (!list) return [] as HTMLElement[]
      return Array.from(list.querySelectorAll<HTMLElement>("[role='option']"))
    }, [])

    const focusOption = (i: number) => {
      setActiveIndex(i)
      optionEls()[i]?.focus()
    }

    // on open: focus the selected option, else the first enabled one
    React.useEffect(() => {
      if (!open) return
      setActiveIndex(-1)
      const els = optionEls()
      const selectedIdx = els.findIndex((el) => el.getAttribute("aria-selected") === "true")
      const firstEnabled = els.findIndex((el) => el.getAttribute("aria-disabled") !== "true")
      const target = selectedIdx >= 0 ? selectedIdx : firstEnabled
      if (target >= 0) {
        setActiveIndex(target)
        els[target]?.focus()
      }
    }, [open, optionEls])

    if (!open) return null

    const onKeyDown = (e: React.KeyboardEvent) => {
      const els = optionEls()
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
              setValue(value)
              setOpen(false)
              returnFocusToTrigger()
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

    return (
      <div
        ref={(node) => {
          listRef.current = node
          setElement(node?.parentElement ?? null)
          if (typeof ref === "function") ref(node)
          else if (ref) ref.current = node
        }}
        id={id ?? (triggerId ? `${triggerId}-listbox` : undefined)}
        role="listbox"
        aria-labelledby={triggerId}
        tabIndex={-1}
        data-state={open ? "open" : "closed"}
        onKeyDown={onKeyDown}
        className={cn(
          "prui-select-content absolute z-[var(--prui-z-overlay)] mt-1 min-w-40 max-h-60 overflow-auto p-1",
          "bg-[var(--prui-surface)] border border-[var(--prui-line)] rounded-[var(--prui-radius)] shadow-[var(--prui-shadow-md)] outline-none",
          className,
        )}
        {...props}
      >
        {children}
      </div>
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
    const { value: selected, setValue, setOpen, returnFocusToTrigger, registerLabel } = useSelect()
    const isSelected = selected === value
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
          setValue(value)
          setOpen(false)
          returnFocusToTrigger()
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
    { name: "value", type: "string", default: "undefined", control: "text" },
    { name: "defaultValue", type: "string", default: "undefined", control: "text" },
    { name: "placeholder", type: "string", default: "'Select...'", control: "text" },
    { name: "disabled", type: "boolean", default: "false", control: "boolean" },
    { name: "onChange", type: "(value: string) => void", default: null, control: "none" },
  ],
}
