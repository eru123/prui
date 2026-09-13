import * as React from "react"
import { DatePicker } from "../core/date-picker"
import { FormField } from "../core/form-field"
import { Button } from "../core/button"

/** Single-date filter: one date input (exact day match). */
export interface DateValue {
  date?: string
}

export interface DateFilterProps {
  label?: string
  value?: DateValue
  defaultValue?: DateValue
  onChange?: (value: DateValue) => void
  className?: string
}

export function DateFilter({
  label = "Date",
  value: valueProp,
  defaultValue,
  onChange,
  className,
}: DateFilterProps) {
  const [uncontrolled, setUncontrolled] = React.useState<DateValue>(defaultValue ?? {})
  const isControlled = valueProp !== undefined
  const value = isControlled ? valueProp : uncontrolled

  const set = (next: DateValue) => {
    if (!isControlled) setUncontrolled(next)
    onChange?.(next)
  }

  return (
    <FormField label={label} className={className} data-testid="date-filter">
      <div className="flex items-center gap-1.5">
        <DatePicker
          ariaLabel={label}
          className="h-8 w-36"
          value={value.date}
          onChange={(date) => set({ date: date || undefined })}
        />
        {value.date ? (
          <Button variant="ghost" size="sm" onClick={() => set({})}>
            Clear
          </Button>
        ) : null}
      </div>
    </FormField>
  )
}
