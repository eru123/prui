import * as React from "react"
import { Circle } from "lucide-react"
import { cn } from "./cn"
import type { PropsMeta } from "./props-meta"

/**
 * RadioGroup + Radio: a single-choice control with roving-tabIndex keyboard
 * navigation (ArrowUp/Down + ArrowLeft/Right, Home/End). The group owns
 * the value; radios register their own value.
 */

interface RadioGroupCtx {
  value: string
  name: string
  setValue: (v: string) => void
  register: (value: string, el: HTMLButtonElement | null) => void
  /** First registered radio; tabbable when nothing is checked. */
  firstValue: string | null
}

const Ctx = React.createContext<RadioGroupCtx | null>(null)

function useRadioGroup(): RadioGroupCtx {
  const ctx = React.useContext(Ctx)
  if (!ctx) throw new Error("Radio must be used inside <RadioGroup>")
  return ctx
}

export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  /** Group label exposed to assistive tech. */
  label?: string
  name?: string
  disabled?: boolean
  orientation?: "vertical" | "horizontal"
}

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
  { value: valueProp, defaultValue, onChange, label, name: nameProp, disabled, orientation = "vertical", className, onKeyDown, children, ...props },
  ref,
) {
  const name = React.useId()
  const fullName = nameProp ?? `prui-radio-${name}`
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? "")
  const value = valueProp !== undefined ? valueProp : uncontrolled
  const [registered, setRegistered] = React.useState<string[]>([])
  const elsRef = React.useRef(new Map<string, HTMLButtonElement>())

  const setValue = (v: string) => {
    if (valueProp === undefined) setUncontrolled(v)
    onChange?.(v)
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
    const radios = registered.map((v) => elsRef.current.get(v)).filter((el): el is HTMLButtonElement => !!el && !el.disabled)
    if (radios.length === 0) return
    const current = radios.findIndex((r) => r.tabIndex === 0)
    const delta = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0
    if (delta !== 0) {
      e.preventDefault()
      const next = radios[(current + delta + radios.length) % radios.length]!
      next.focus()
      next.click()
      return
    }
    if (e.key === "Home") {
      e.preventDefault()
      radios[0]!.focus()
      radios[0]!.click()
      return
    }
    if (e.key === "End") {
      e.preventDefault()
      const last = radios[radios.length - 1]!
      last.focus()
      last.click()
    }
  }

  return (
    <Ctx.Provider value={{ value, name: fullName, setValue, register, firstValue: registered[0] ?? null }}>
      <div
        ref={ref}
        role="radiogroup"
        aria-label={label}
        aria-disabled={disabled}
        data-orientation={orientation}
        onKeyDown={handleKeyDown}
        className={cn(
          "prui-radio-group flex gap-2",
          orientation === "vertical" ? "flex-col" : "flex-row flex-wrap items-center",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </Ctx.Provider>
  )
})
RadioGroup.displayName = "RadioGroup"

export interface RadioProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value" | "onChange" | "checked"> {
  value: string
  disabled?: boolean
  label?: React.ReactNode
}

export const Radio = React.forwardRef<HTMLButtonElement, RadioProps>(function Radio(
  { className, value, disabled, label, children, onClick, ...props },
  ref,
) {
  const { value: selected, setValue, register, firstValue } = useRadioGroup()
  const checked = selected === value
  const internalRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    register(value, internalRef.current)
    return () => register(value, null)
  }, [value, register])

  const tabbable = checked || (!selected && value === firstValue)

  return (
    <button
      ref={(node) => {
        internalRef.current = node
        if (typeof ref === "function") ref(node)
        else if (ref) ref.current = node
      }}
      type="button"
      role="radio"
      aria-checked={checked}
      aria-disabled={disabled}
      data-state={checked ? "checked" : "unchecked"}
      tabIndex={tabbable ? 0 : -1}
      disabled={disabled}
      onClick={(e) => {
        onClick?.(e)
        if (!e.defaultPrevented && !disabled) setValue(value)
      }}
      className={cn(
        "prui-radio inline-flex items-center gap-2 text-sm cursor-pointer outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-prui-sm",
        disabled ? "opacity-50 cursor-not-allowed" : "text-fg",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className={cn(
          "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
          "transition-colors duration-150",
          checked ? "border-brand" : "border-line bg-background",
        )}
      >
        {checked ? <Circle className="h-2 w-2 fill-brand text-brand" /> : null}
      </span>
      {label ?? children}
    </button>
  )
})
Radio.displayName = "Radio"

export const radioGroupPropsMeta: PropsMeta = {
  name: "RadioGroup",
  props: [
    { name: "value", type: "string", default: "undefined", control: "text" },
    { name: "defaultValue", type: "string", default: "undefined", control: "text" },
    { name: "onChange", type: "(value: string) => void", default: null, control: "none" },
    { name: "label", type: "string (group label)", default: null, control: "text" },
    { name: "orientation", type: "'vertical' | 'horizontal'", default: "'vertical'", control: "select", options: ["vertical", "horizontal"] },
  ],
}
