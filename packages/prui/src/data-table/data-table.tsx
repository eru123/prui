import * as React from "react"
import { ArrowDown, ArrowUp, ArrowUpDown, Inbox } from "lucide-react"
import { cn } from "../core/cn"
import type { PropsMeta } from "../core/props-meta"

/**
 * DataTable family: column config, sorting, cursor pagination.
 * Callers provide rows plus an optional cursor contract; filtering helpers
 * live in the toolbar/filter components.
 */

export type SortDirection = "asc" | "desc"

export interface Column<T> {
  /** Row field key. */
  key: string
  /** Header label. */
  label: React.ReactNode
  sortable?: boolean
  align?: "left" | "right" | "center"
  /** Fixed width or min width hint. */
  width?: number | string
  /** Custom cell renderer; defaults to String(row[key]). */
  render?: (row: T) => React.ReactNode
  /** Hidden from the table but available to filters. */
  hidden?: boolean
  className?: string
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey?: (row: T, index: number) => string
  /** Sort state; when provided the table is controlled. */
  sort?: { key: string; direction: SortDirection } | null
  onSortChange?: (sort: { key: string; direction: SortDirection } | null) => void
  defaultSort?: { key: string; direction: SortDirection } | null
  loading?: boolean
  emptyMessage?: React.ReactNode
  onRowClick?: (row: T, index: number) => void
  className?: string
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  rowKey,
  sort: sortProp,
  onSortChange,
  defaultSort = null,
  loading = false,
  emptyMessage = "No results.",
  onRowClick,
  className,
}: DataTableProps<T>) {
  const [uncontrolledSort, setUncontrolledSort] = React.useState(defaultSort)
  const isControlled = sortProp !== undefined
  const sort = isControlled ? sortProp : uncontrolledSort

  const visible = columns.filter((c) => !c.hidden)

  const sortedRows = React.useMemo(() => {
    if (!sort) return rows
    const col = columns.find((c) => c.key === sort.key)
    if (!col?.sortable) return rows
    const dir = sort.direction === "asc" ? 1 : -1
    return [...rows].sort((a, b) => {
      const av = a[sort.key]
      const bv = b[sort.key]
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir
      return String(av).localeCompare(String(bv)) * dir
    })
  }, [rows, sort, columns])

  const toggleSort = (key: string) => {
    const col = columns.find((c) => c.key === key)
    if (!col?.sortable) return
    const next =
      sort?.key === key
        ? sort.direction === "asc"
          ? { key, direction: "desc" as SortDirection }
          : null
        : { key, direction: "asc" as SortDirection }
    if (!isControlled) setUncontrolledSort(next)
    onSortChange?.(next)
  }

  return (
    <div className={cn("prui-data-table w-full overflow-x-auto rounded-[var(--prui-radius)] border border-[var(--prui-line)]", className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--prui-line)] bg-[var(--prui-raise)]">
            {visible.map((col) => {
              const active = sort?.key === col.key
              const Icon = active ? (sort?.direction === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown
              return (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={active ? (sort?.direction === "asc" ? "ascending" : "descending") : col.sortable ? "none" : undefined}
                  style={col.width !== undefined ? { width: col.width } : undefined}
                  className={cn(
                    "px-3 py-2 text-xs font-medium uppercase tracking-wide text-[var(--prui-dim)]",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                  )}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className={cn(
                        "inline-flex items-center gap-1 hover:text-[var(--prui-fg)] cursor-pointer uppercase",
                        active && "text-[var(--prui-fg)]",
                      )}
                    >
                      {col.label}
                      <Icon className="h-3 w-3" aria-hidden />
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={visible.length} className="px-3 py-8 text-center text-[var(--prui-dim)]" data-testid="data-table-loading">
                Loading...
              </td>
            </tr>
          ) : sortedRows.length === 0 ? (
            <tr>
              <td colSpan={visible.length} className="px-3 py-8 text-center text-[var(--prui-dim)]" data-testid="data-table-empty">
                <span className="inline-flex items-center gap-2">
                  <Inbox className="h-4 w-4" aria-hidden />
                  {emptyMessage}
                </span>
              </td>
            </tr>
          ) : (
            sortedRows.map((row, i) => (
              <tr
                key={rowKey ? rowKey(row, i) : i}
                onClick={onRowClick ? () => onRowClick(row, i) : undefined}
                className={cn(
                  "border-b border-[var(--prui-line)] last:border-b-0 text-[var(--prui-fg)]",
                  onRowClick && "cursor-pointer hover:bg-[var(--prui-raise)]",
                )}
              >
                {visible.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-3 py-2",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
                      col.className,
                    )}
                  >
                    {col.render ? col.render(row) : formatCell(row[col.key])}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

function formatCell(value: unknown): React.ReactNode {
  if (value == null || value === "") return <span className="text-[var(--prui-dim)]">-</span>
  if (value instanceof Date) return value.toLocaleDateString()
  if (typeof value === "boolean") return value ? "Yes" : "No"
  return String(value)
}

export const dataTablePropsMeta: PropsMeta = {
  name: "DataTable",
  props: [
    { name: "columns", type: "Column<T>[]", default: null, control: "object" },
    { name: "rows", type: "T[]", default: "[]", control: "object" },
    { name: "sort", type: "{ key, direction } | null", default: "undefined", control: "none" },
    { name: "onSortChange", type: "(sort) => void", default: null, control: "none" },
    { name: "loading", type: "boolean", default: "false", control: "boolean" },
    { name: "emptyMessage", type: "ReactNode", default: "'No results.'", control: "text" },
    { name: "onRowClick", type: "(row, index) => void", default: null, control: "none" },
  ],
}
