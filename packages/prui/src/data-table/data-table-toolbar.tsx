import * as React from "react"
import { Search } from "lucide-react"
import { Input } from "../core/input"
import { cn } from "../core/cn"
import type { PropsMeta } from "../core/props-meta"
import { FacetedFilter } from "./data-table-faceted-filter"
import type { FacetOption } from "./data-table-faceted-filter"
import { DateRangeFilter } from "./data-table-daterange-filter"
import { NumberRangeFilter } from "./data-table-number-range-filter"

/**
 * Toolbar: search input plus declarative filters.
 * Filter config entries are column keys with a type; the toolbar renders the
 * matching filter control and reports values through onFilterChange.
 */

export type ToolbarFilterType = "select" | "daterange" | "numberrange"

export interface ToolbarFilterConfig {
  key: string
  label: string
  type: ToolbarFilterType
  /** Options for type select. */
  options?: FacetOption[]
}

export type ToolbarFilterValue =
  | string[]
  | { from?: string; to?: string }
  | { min?: number; max?: number }
  | undefined

export type ToolbarFilterValues = Record<string, ToolbarFilterValue>

export interface DataTableToolbarProps {
  /** Global search placeholder. */
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  filters?: ToolbarFilterConfig[]
  filterValues?: ToolbarFilterValues
  onFilterChange?: (key: string, value: ToolbarFilterValue) => void
  /** Right-side actions slot (e.g. create button). */
  actions?: React.ReactNode
  className?: string
}

function isFilterActive(value: ToolbarFilterValue): boolean {
  if (value == null) return false
  if (Array.isArray(value)) return value.length > 0
  return Object.values(value).some((v) => v !== undefined && v !== "")
}
void isFilterActive

export function DataTableToolbar({
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  filters = [],
  filterValues,
  onFilterChange,
  actions,
  className,
}: DataTableToolbarProps) {
  const [uncontrolledSearch, setUncontrolledSearch] = React.useState("")
  const isControlled = searchValue !== undefined
  const search = isControlled ? searchValue : uncontrolledSearch

  return (
    <div className={cn("prui-toolbar flex flex-wrap items-center gap-2 py-2", className)}>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--prui-dim)]" aria-hidden />
        <Input
          type="search"
          aria-label="Search"
          placeholder={searchPlaceholder}
          className="h-8 w-56 pl-8"
          value={search}
          onChange={(e) => {
            if (!isControlled) setUncontrolledSearch(e.target.value)
            onSearchChange?.(e.target.value)
          }}
        />
      </div>

      {filters.map((f) => {
        const current = filterValues?.[f.key]
        if (f.type === "select") {
          return (
            <FacetedFilter
              key={f.key}
              label={f.label}
              options={f.options ?? []}
              value={(current as string[] | undefined) ?? []}
              onChange={(vals) => onFilterChange?.(f.key, vals)}
            />
          )
        }
        if (f.type === "daterange") {
          return (
            <DateRangeFilter
              key={f.key}
              label={f.label}
              value={(current as { from?: string; to?: string } | undefined) ?? {}}
              onChange={(v) => onFilterChange?.(f.key, v)}
            />
          )
        }
        return (
          <NumberRangeFilter
            key={f.key}
            label={f.label}
            value={(current as { min?: number; max?: number } | undefined) ?? {}}
            onChange={(v) => onFilterChange?.(f.key, v)}
          />
        )
      })}

      {actions ? <div className="ml-auto flex items-center gap-2">{actions}</div> : null}
    </div>
  )
}

export const dataTableToolbarPropsMeta: PropsMeta = {
  name: "DataTableToolbar",
  props: [
    { name: "searchPlaceholder", type: "string", default: "'Search...'", control: "text" },
    { name: "searchValue", type: "string", default: "undefined", control: "text" },
    { name: "onSearchChange", type: "(value: string) => void", default: null, control: "none" },
    { name: "filters", type: "ToolbarFilterConfig[]", default: "[]", control: "object" },
    { name: "filterValues", type: "ToolbarFilterValues", default: "{}", control: "object" },
    { name: "onFilterChange", type: "(key, value) => void", default: null, control: "none" },
    { name: "actions", type: "ReactNode", default: null, control: "none" },
  ],
}
