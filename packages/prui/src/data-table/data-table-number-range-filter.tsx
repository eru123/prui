import * as React from "react"
import { Input } from "../core/input"
import { FormField } from "../core/form-field"
import { Button } from "../core/button"

/** Number range filter: min and max numeric inputs. */
export interface NumberRangeValue {
  min?: number
  max?: number
}

export interface NumberRangeFilterProps {
  label?: string
  value?: NumberRangeValue
  defaultValue?: NumberRangeValue
  onChange?: (value: NumberRangeValue) => void
  className?: string
}

export function NumberRangeFilter({
  label = "Range",
  value: valueProp,
  defaultValue,
  onChange,
  className,
}: NumberRangeFilterProps) {
  const [uncontrolled, setUncontrolled] = React.useState<NumberRangeValue>(defaultValue ?? {})
  const isControlled = valueProp !== undefined
  const value = isControlled ? valueProp : uncontrolled

  const set = (next: NumberRangeValue) => {
    if (!isControlled) setUncontrolled(next)
    onChange?.(next)
  }

  const parse = (raw: string): number | undefined => {
    if (raw === "") return undefined
    const n = Number(raw)
    return Number.isNaN(n) ? undefined : n
  }

  return (
    <FormField label={label} className={className} data-testid="numberrange-filter">
      <div className="flex items-center gap-1.5">
        <span aria-hidden className="text-xs text-dim">min</span>
        <Input
          type="number"
          aria-label={`${label} min`}
          className="h-8 w-24"
          value={value.min ?? ""}
          onChange={(e) => set({ ...value, min: parse(e.target.value) })}
        />
        <span aria-hidden className="text-xs text-dim">max</span>
        <Input
          type="number"
          aria-label={`${label} max`}
          className="h-8 w-24"
          value={value.max ?? ""}
          onChange={(e) => set({ ...value, max: parse(e.target.value) })}
        />
        {value.min !== undefined || value.max !== undefined ? (
          <Button variant="ghost" size="sm" onClick={() => set({})}>
            Clear
          </Button>
        ) : null}
      </div>
    </FormField>
  )
}
