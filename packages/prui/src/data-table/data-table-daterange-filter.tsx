import * as React from "react"
import { Input } from "../core/input"
import { Label } from "../core/label"
import { Button } from "../core/button"

/** Date range filter: from and to date inputs. */
export interface DateRangeValue {
  from?: string
  to?: string
}

export interface DateRangeFilterProps {
  label?: string
  value?: DateRangeValue
  defaultValue?: DateRangeValue
  onChange?: (value: DateRangeValue) => void
  className?: string
}

export function DateRangeFilter({
  label = "Date range",
  value: valueProp,
  defaultValue,
  onChange,
  className,
}: DateRangeFilterProps) {
  const [uncontrolled, setUncontrolled] = React.useState<DateRangeValue>(defaultValue ?? {})
  const isControlled = valueProp !== undefined
  const value = isControlled ? valueProp : uncontrolled

  const set = (next: DateRangeValue) => {
    if (!isControlled) setUncontrolled(next)
    onChange?.(next)
  }

  return (
    <div className={className ?? "flex items-end gap-2"} data-testid="daterange-filter">
      <div className="flex flex-col gap-1">
        <Label className="text-xs text-[var(--prui-dim)]">{label} from</Label>
        <Input
          type="date"
          aria-label={`${label} from`}
          className="h-8 w-36"
          value={value.from ?? ""}
          onChange={(e) => set({ ...value, from: e.target.value || undefined })}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-xs text-[var(--prui-dim)]">to</Label>
        <Input
          type="date"
          aria-label={`${label} to`}
          className="h-8 w-36"
          value={value.to ?? ""}
          onChange={(e) => set({ ...value, to: e.target.value || undefined })}
        />
      </div>
      {value.from || value.to ? (
        <Button variant="ghost" size="sm" onClick={() => set({})}>
          Clear
        </Button>
      ) : null}
    </div>
  )
}
