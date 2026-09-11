import * as React from "react"
import { Input } from "../core/input"
import { Label } from "../core/label"
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
    <div className={className ?? "flex items-end gap-2"} data-testid="numberrange-filter">
      <div className="flex flex-col gap-1">
        <Label className="text-xs text-[var(--prui-dim)]">{label} min</Label>
        <Input
          type="number"
          aria-label={`${label} min`}
          className="h-8 w-24"
          value={value.min ?? ""}
          onChange={(e) => set({ ...value, min: parse(e.target.value) })}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-xs text-[var(--prui-dim)]">max</Label>
        <Input
          type="number"
          aria-label={`${label} max`}
          className="h-8 w-24"
          value={value.max ?? ""}
          onChange={(e) => set({ ...value, max: parse(e.target.value) })}
        />
      </div>
      {value.min !== undefined || value.max !== undefined ? (
        <Button variant="ghost" size="sm" onClick={() => set({})}>
          Clear
        </Button>
      ) : null}
    </div>
  )
}
