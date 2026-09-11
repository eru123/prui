import * as React from "react"
import { Input } from "../core/input"
import { Label } from "../core/label"
import { Button } from "../core/button"

/** Price range filter: min and max with a currency symbol. */
export interface PriceRangeValue {
  min?: number
  max?: number
}

export interface PriceFilterProps {
  label?: string
  value?: PriceRangeValue
  defaultValue?: PriceRangeValue
  onChange?: (value: PriceRangeValue) => void
  /** Currency symbol shown inside the inputs. */
  currency?: string
  className?: string
}

export function PriceFilter({
  label = "Price",
  value: valueProp,
  defaultValue,
  onChange,
  currency = "₱",
  className,
}: PriceFilterProps) {
  const [uncontrolled, setUncontrolled] = React.useState<PriceRangeValue>(defaultValue ?? {})
  const isControlled = valueProp !== undefined
  const value = isControlled ? valueProp : uncontrolled

  const set = (next: PriceRangeValue) => {
    if (!isControlled) setUncontrolled(next)
    onChange?.(next)
  }

  const parse = (raw: string): number | undefined => {
    if (raw === "") return undefined
    const n = Number(raw)
    return Number.isNaN(n) ? undefined : n
  }

  return (
    <div className={className ?? "flex items-end gap-2"} data-testid="price-filter">
      <div className="flex flex-col gap-1">
        <Label className="text-xs text-[var(--prui-dim)]">{label} min</Label>
        <div className="relative">
          <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-[var(--prui-dim)]" aria-hidden>
            {currency}
          </span>
          <Input
            type="number"
            aria-label={`${label} min`}
            className="h-8 w-24 pl-6"
            value={value.min ?? ""}
            onChange={(e) => set({ ...value, min: parse(e.target.value) })}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-xs text-[var(--prui-dim)]">max</Label>
        <div className="relative">
          <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-[var(--prui-dim)]" aria-hidden>
            {currency}
          </span>
          <Input
            type="number"
            aria-label={`${label} max`}
            className="h-8 w-24 pl-6"
            value={value.max ?? ""}
            onChange={(e) => set({ ...value, max: parse(e.target.value) })}
          />
        </div>
      </div>
      {value.min !== undefined || value.max !== undefined ? (
        <Button variant="ghost" size="sm" onClick={() => set({})}>
          Clear
        </Button>
      ) : null}
    </div>
  )
}
