import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "./cn"
import type { PropsMeta } from "./props-meta"

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
  open: boolean
  triggerId?: string
  setValue: (v: string) => void
  setOpen: (o: boolean) => void
  registerTrigger: (id: string) => void
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
  onChange,
  onOpenChange,
  children,
}: SelectProps) => {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? "")
  const [open, setOpen] = React.useState(false)
  const [triggerId, setTriggerId] = React.useState<string | undefined>()
  const value = valueProp !== undefined ? valueProp : uncontrolled

  const setValue = (v: string) => {
    if (valueProp === undefined) setUncontrolled(v)
    onChange?.(v)
  }
  const changeOpen = (o: boolean) => {
    setOpen(o)
    onOpenChange?.(o)
  }

  return (
    <Ctx.Provider
      value={{ value, open, triggerId, setValue, setOpen: changeOpen, registerTrigger: setTriggerId }}
    >
      {name ? <input type="hidden" name={name} value={value} /> : null}
      {children ?? (
        <>
          <SelectTrigger disabled={disabled}>
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
  ({ className, children, onClick, disabled, id, ...props }, ref) => {
    const { open, setOpen, registerTrigger } = useSelect()
    React.useEffect(() => {
      if (id) registerTrigger(id)
    }, [id, registerTrigger])
    return (
      <button
        ref={ref}
        id={id}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
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
    const { value } = useSelect()
    return (
      <span ref={ref} className={cn("truncate", className)} {...props}>
        {children ?? (value || <span className="text-[var(--prui-dim)]">{placeholder}</span>)}
      </span>
    )
  },
)
SelectValue.displayName = "SelectValue"

export type SelectContentProps = React.HTMLAttributes<HTMLDivElement>

export const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen, triggerId } = useSelect()
    void setOpen
    if (!open) return null
    return (
      <div
        ref={ref}
        role="listbox"
        aria-labelledby={triggerId}
        tabIndex={-1}
        data-state={open ? "open" : "closed"}
        className={cn(
          "prui-select-content absolute z-50 mt-1 min-w-40 max-h-60 overflow-auto p-1",
          "bg-[var(--prui-surface)] border border-[var(--prui-line)] rounded-[var(--prui-radius)] shadow-lg",
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
  ({ className, value, disabled, children, onClick, ...props }, ref) => {
    const { value: selected, setValue, setOpen } = useSelect()
    const isSelected = selected === value
    return (
      <div
        ref={ref}
        role="option"
        aria-selected={isSelected}
        aria-disabled={disabled}
        data-selected={isSelected || undefined}
        className={cn(
          "prui-select-item relative flex cursor-pointer items-center gap-2 rounded-[calc(var(--prui-radius)-1px)]",
          "py-1.5 pl-3 pr-8 text-sm text-[var(--prui-fg)] hover:bg-[var(--prui-raise)]",
          isSelected && "font-medium",
          disabled && "opacity-50 pointer-events-none",
          className,
        )}
        onClick={(e) => {
          onClick?.(e)
          if (e.defaultPrevented || disabled) return
          setValue(value)
          setOpen(false)
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
