import * as React from "react"
import { Input } from "../core/input"
import { Label } from "../core/label"
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
    <div className={className ?? "flex items-end gap-2"} data-testid="date-filter">
      <div className="flex flex-col gap-1">
        <Label className="text-xs text-[var(--prui-dim)]">{label}</Label>
        <Input
          type="date"
          aria-label={label}
          className="h-8 w-36"
          value={value.date ?? ""}
          onChange={(e) => set({ date: e.target.value || undefined })}
        />
      </div>
      {value.date ? (
        <Button variant="ghost" size="sm" onClick={() => set({})}>
          Clear
        </Button>
      ) : null}
    </div>
  )
}
