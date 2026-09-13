import * as React from "react"
import { Input } from "../core/input"
import { FormField } from "../core/form-field"
import { Button } from "../core/button"

/** Time range filter: start and end as HH:MM strings. */
export interface TimeRangeValue {
  from?: string
  to?: string
}

export interface TimeRangeFilterProps {
  label?: string
  value?: TimeRangeValue
  defaultValue?: TimeRangeValue
  onChange?: (value: TimeRangeValue) => void
  className?: string
}

export function TimeRangeFilter({
  label = "Time",
  value: valueProp,
  defaultValue,
  onChange,
  className,
}: TimeRangeFilterProps) {
  const [uncontrolled, setUncontrolled] = React.useState<TimeRangeValue>(defaultValue ?? {})
  const isControlled = valueProp !== undefined
  const value = isControlled ? valueProp : uncontrolled

  const set = (next: TimeRangeValue) => {
    if (!isControlled) setUncontrolled(next)
    onChange?.(next)
  }

  return (
    <FormField label={label} className={className} data-testid="time-filter">
      <div className="flex items-center gap-1.5">
        <span aria-hidden className="text-xs text-[var(--prui-dim)]">from</span>
        <Input
          type="time"
          aria-label={`${label} from`}
          className="h-8 w-28"
          value={value.from ?? ""}
          onChange={(e) => set({ ...value, from: e.target.value || undefined })}
        />
        <span aria-hidden className="text-xs text-[var(--prui-dim)]">to</span>
        <Input
          type="time"
          aria-label={`${label} to`}
          className="h-8 w-28"
          value={value.to ?? ""}
          onChange={(e) => set({ ...value, to: e.target.value || undefined })}
        />
        {value.from || value.to ? (
          <Button variant="ghost" size="sm" onClick={() => set({})}>
            Clear
          </Button>
        ) : null}
      </div>
    </FormField>
  )
}
