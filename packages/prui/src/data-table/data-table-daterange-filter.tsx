import * as React from "react"
import { DateRangePicker } from "../core/date-picker"
import { FormField } from "../core/form-field"
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
    <FormField
      label={label}
      className={className}
      data-testid="daterange-filter"
    >
      <div className="flex items-center gap-1.5">
        <DateRangePicker
          ariaLabel={label}
          className="h-8 w-64"
          value={{ from: value.from, to: value.to }}
          onChange={(range) => set({ from: range.from || undefined, to: range.to || undefined })}
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
