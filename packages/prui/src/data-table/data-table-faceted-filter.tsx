import * as React from "react"
import { Check, PlusCircle } from "lucide-react"
import { Badge } from "../core/card"
import { Dropdown } from "../core/dropdown"

/** Faceted select filter: multi-select of named options with counts. */
export interface FacetOption {
  label: string
  value: string
  count?: number
}

export interface FacetedFilterProps {
  /** Column title shown on the trigger badge. */
  label: string
  options: FacetOption[]
  value?: string[]
  defaultValue?: string[]
  onChange?: (values: string[]) => void
  className?: string
}

export function FacetedFilter({
  label,
  options,
  value: valueProp,
  defaultValue,
  onChange,
  className,
}: FacetedFilterProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? [])
  const isControlled = valueProp !== undefined
  const selected = isControlled ? valueProp : uncontrolled

  const toggle = (v: string) => {
    const next = selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v]
    if (!isControlled) setUncontrolled(next)
    onChange?.(next)
  }

  return (
    <Dropdown
      className={className}
      trigger={
        <button
          type="button"
          className="prui-faceted-filter inline-flex h-8 items-center gap-1.5 rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-background)] px-2.5 text-sm cursor-pointer hover:border-[var(--prui-dim)]"
          data-testid="faceted-filter"
        >
          <PlusCircle className="h-3.5 w-3.5 text-[var(--prui-dim)]" aria-hidden />
          {label}
          {selected.length > 0 ? (
            <>
              <span className="ml-1 rounded-[var(--prui-radius-full)] bg-[var(--prui-raise)] px-1.5 text-xs">{selected.length}</span>
            </>
          ) : null}
        </button>
      }
    >
      <div role="menu" className="min-w-44">
        {options.length === 0 ? (
          <div className="px-2 py-1.5 text-sm text-[var(--prui-dim)]">No options</div>
        ) : (
          options.map((opt) => {
            const checked = selected.includes(opt.value)
            return (
              <button
                key={opt.value}
                type="button"
                role="menuitemcheckbox"
                aria-checked={checked}
                onClick={() => toggle(opt.value)}
                data-selected={checked || undefined}
                className="flex w-full cursor-pointer items-center gap-2 rounded-[calc(var(--prui-radius)-1px)] px-2 py-1.5 text-left text-sm text-[var(--prui-fg)] hover:bg-[var(--prui-raise)]"
              >
                <span
                  className="flex h-4 w-4 items-center justify-center rounded-[var(--prui-radius-1)] border border-[var(--prui-line)]"
                  style={checked ? { backgroundColor: "var(--prui-brand)", borderColor: "var(--prui-brand)" } : undefined}
                >
                  {checked ? <Check className="h-3 w-3 text-white" aria-hidden /> : null}
                </span>
                {opt.label}
                {opt.count !== undefined ? (
                  <Badge variant="outline" className="ml-auto">
                    {opt.count}
                  </Badge>
                ) : null}
              </button>
            )
          })
        )}
        {selected.length > 0 ? (
          <button
            type="button"
            onClick={() => {
              if (!isControlled) setUncontrolled([])
              onChange?.([])
            }}
            className="mt-1 w-full cursor-pointer rounded-[calc(var(--prui-radius)-1px)] border-t border-[var(--prui-line)] px-2 py-1.5 text-left text-xs text-[var(--prui-dim)] hover:text-[var(--prui-fg)]"
          >
            Clear ({selected.length})
          </button>
        ) : null}
      </div>
    </Dropdown>
  )
}
