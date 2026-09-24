import * as React from "react"
import { ArrowDown, ArrowUp, ArrowUpDown, Inbox, ChevronRight } from "lucide-react"
import { cn } from "../core/cn"
import type { PropsMeta } from "../core/props-meta"
import { usePruiI18n } from "../i18n"

/**
 * DataTable family: column config, sorting, cursor pagination.
 * Callers provide rows plus an optional cursor contract; filtering helpers
 * live in the toolbar/filter components.
 *
 * Enterprise additions: row selection (with a checkbox column), expandable
 * rows (renderExpandedRow), memoized row rendering, and an opt-in windowed
 * rendering mode (virtualized) for very large row sets.
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
  /**
   * Row selection: renders a checkbox column. `true` = multiple selection,
   * `{ multiple: false }` = single.
   */
  selectable?: boolean | { multiple?: boolean }
  /** Selected row keys (controlled). */
  selectedRowKeys?: (string | number)[]
  onSelectionChange?: (keys: (string | number)[], rows: T[]) => void
  /** Expandable rows: renders an expander column and this content when open. */
  renderExpandedRow?: (row: T) => React.ReactNode
  /** Expanded row keys (controlled). */
  expandedRowKeys?: (string | number)[]
  onExpandedRowsChange?: (keys: (string | number)[]) => void
  /** Window-render large row sets (render only the visible slice + spacers). */
  virtualized?: boolean
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
  emptyMessage,
  onRowClick,
  selectable,
  selectedRowKeys,
  onSelectionChange,
  renderExpandedRow,
  expandedRowKeys,
  onExpandedRowsChange,
  virtualized = false,
  className,
}: DataTableProps<T>) {
  const { t } = usePruiI18n()
  const [uncontrolledSort, setUncontrolledSort] = React.useState(defaultSort)
  const [uncontrolledSelected, setUncontrolledSelected] = React.useState<(string | number)[]>([])
  const [uncontrolledExpanded, setUncontrolledExpanded] = React.useState<(string | number)[]>([])
  const isControlled = sortProp !== undefined
  const sort = isControlled ? sortProp : uncontrolledSort

  const selectionControlled = selectedRowKeys !== undefined
  const selected = selectionControlled ? selectedRowKeys : uncontrolledSelected
  const expansionControlled = expandedRowKeys !== undefined
  const expanded = expansionControlled ? expandedRowKeys : uncontrolledExpanded

  const selectableEnabled = selectable !== undefined && selectable !== false
  const selectionMultiple = selectable === true || (typeof selectable === "object" && selectable.multiple !== false)

  const keyFor = React.useCallback(
    (row: T, index: number): string | number => {
      if (rowKey) return rowKey(row, index)
      const id = (row as { id?: string | number }).id
      return id !== undefined ? id : index
    },
    [rowKey],
  )

  const visible = React.useMemo(() => columns.filter((c) => !c.hidden), [columns])

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

  const setSelection = (keys: (string | number)[]) => {
    if (!selectionControlled) setUncontrolledSelected(keys)
    onSelectionChange?.(keys, rows.filter((r, i) => keys.includes(keyFor(r, i))))
  }

  const toggleRowSelected = (key: string | number, row: T) => {
    if (!selectionMultiple) {
      const next = selected.includes(key) ? [] : [key]
      setSelection(next)
      return
    }
    const next = selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]
    void row
    setSelection(next)
  }

  const allSelected = selectableEnabled && sortedRows.length > 0 && sortedRows.every((r, i) => selected.includes(keyFor(r, i)))
  const someSelected = selectableEnabled && !allSelected && sortedRows.some((r, i) => selected.includes(keyFor(r, i)))

  const toggleAllSelected = () => {
    if (allSelected) setSelection(selectionMultiple ? [] : [])
    else setSelection(sortedRows.map((r, i) => keyFor(r, i)))
  }

  const setExpandedKeys = (keys: (string | number)[]) => {
    if (!expansionControlled) setUncontrolledExpanded(keys)
    onExpandedRowsChange?.(keys)
  }

  const toggleRowExpanded = (key: string | number) => {
    setExpandedKeys(expanded.includes(key) ? expanded.filter((k) => k !== key) : [...expanded, key])
  }

  /* windowed rendering for large sets */
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [rowHeight, setRowHeight] = React.useState(41)
  const [window_, setWindow] = React.useState({ start: 0, end: 50 })
  const useWindowing = virtualized && sortedRows.length > 50

  const recomputeWindow = React.useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const overscan = 8
    const start = Math.max(0, Math.floor(el.scrollTop / rowHeight) - overscan)
    const visibleCount = Math.ceil(el.clientHeight / rowHeight) + overscan * 2
    setWindow({ start, end: start + visibleCount })
  }, [rowHeight])

  React.useEffect(() => {
    if (!useWindowing) return
    const el = scrollRef.current
    if (!el) return
    const firstRow = el.querySelector("tbody tr") as HTMLTableRowElement | null
    if (firstRow && firstRow.offsetHeight > 0) setRowHeight(firstRow.offsetHeight)
    recomputeWindow()
  }, [useWindowing, recomputeWindow, sortedRows.length])

  const slicedRows = useWindowing ? sortedRows.slice(window_.start, window_.end) : sortedRows
  const padTop = useWindowing ? window_.start * rowHeight : 0
  const padBottom = useWindowing ? Math.max(0, (sortedRows.length - window_.end) * rowHeight) : 0

  return (
    <div
      ref={scrollRef}
      onScroll={useWindowing ? recomputeWindow : undefined}
      className={cn(
        "prui-data-table w-full overflow-auto rounded-prui border border-line",
        useWindowing && "max-h-[70vh]",
        className,
      )}
    >
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-[var(--prui-z-content)]">
          <tr className="border-b border-line bg-raise">
            {renderExpandedRow ? (
              <th scope="col" className="w-8 px-3 py-2" aria-label={undefined}>
                <span className="sr-only">Toggle row</span>
              </th>
            ) : null}
            {selectableEnabled ? (
              <th scope="col" className="w-10 px-3 py-2">
                {selectionMultiple ? (
                  <input
                    type="checkbox"
                    aria-label={t.selectAllRows}
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected
                    }}
                    onChange={toggleAllSelected}
                    className="h-4 w-4 cursor-pointer accent-brand"
                  />
                ) : (
                  <span className="sr-only">Selected</span>
                )}
              </th>
            ) : null}
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
                    "px-3 py-2 text-xs font-medium uppercase tracking-wide text-dim",
                    // <th> defaults to center in the UA stylesheet; a header
                    // sits over its cells, which are left-aligned by default
                    !col.align && "text-left",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                  )}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className={cn(
                        "inline-flex items-center gap-1 hover:text-fg cursor-pointer uppercase",
                        active && "text-fg",
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
              <td colSpan={visible.length + (selectableEnabled ? 1 : 0) + (renderExpandedRow ? 1 : 0)} className="px-3 py-8 text-center text-dim" data-testid="data-table-loading">
                {t.loading}
              </td>
            </tr>
          ) : sortedRows.length === 0 ? (
            <tr>
              <td colSpan={visible.length + (selectableEnabled ? 1 : 0) + (renderExpandedRow ? 1 : 0)} className="px-3 py-8 text-center text-dim" data-testid="data-table-empty">
                <span className="inline-flex items-center gap-2">
                  <Inbox className="h-4 w-4" aria-hidden />
                  {emptyMessage ?? t.noResults}
                </span>
              </td>
            </tr>
          ) : (
            <>
              {padTop > 0 ? (
                <tr aria-hidden style={{ height: padTop }}>
                  <td colSpan={visible.length + 2} className="p-0 border-0" />
                </tr>
              ) : null}
              {slicedRows.map((row, i) => (
                <DataTableRow
                  key={rowKey ? rowKey(row, window_.start + i) : keyFor(row, i)}
                  row={row}
                  index={useWindowing ? window_.start + i : i}
                  rowKeyValue={keyFor(row, useWindowing ? window_.start + i : i)}
                  columns={visible}
                  onRowClick={onRowClick}
                  selectable={selectableEnabled}
                  selected={selected.includes(keyFor(row, useWindowing ? window_.start + i : i))}
                  selectionMultiple={selectionMultiple}
                  onToggleSelected={toggleRowSelected}
                  expandable={!!renderExpandedRow}
                  expanded={expanded.includes(keyFor(row, useWindowing ? window_.start + i : i))}
                  onToggleExpanded={toggleRowExpanded}
                  renderExpandedRow={renderExpandedRow}
                  colCount={visible.length + (selectableEnabled ? 1 : 0) + (renderExpandedRow ? 1 : 0)}
                />
              ))}
              {padBottom > 0 ? (
                <tr aria-hidden style={{ height: padBottom }}>
                  <td colSpan={visible.length + 2} className="p-0 border-0" />
                </tr>
              ) : null}
            </>
          )}
        </tbody>
      </table>
    </div>
  )
}

/* memoized row: stable props keep large tables from re-rendering every row
   on unrelated state changes (selection resets build new arrays, but render
   cell closures are stable across rows) */
interface DataTableRowProps<T extends Record<string, unknown>> {
  row: T
  index: number
  rowKeyValue: string | number
  columns: Column<T>[]
  onRowClick?: (row: T, index: number) => void
  selectable: boolean
  selected: boolean
  selectionMultiple: boolean
  onToggleSelected: (key: string | number, row: T) => void
  expandable: boolean
  expanded: boolean
  onToggleExpanded: (key: string | number) => void
  renderExpandedRow?: (row: T) => React.ReactNode
  colCount: number
}

function DataTableRowImpl<T extends Record<string, unknown>>({
  row,
  index,
  rowKeyValue,
  columns,
  onRowClick,
  selectable,
  selected,
  selectionMultiple,
  onToggleSelected,
  expandable,
  expanded,
  onToggleExpanded,
  renderExpandedRow,
  colCount,
}: DataTableRowProps<T>) {
  const { t } = usePruiI18n()
  return (
    <>
      <tr
        data-selected={selected || undefined}
        aria-selected={selectable ? selected : undefined}
        onClick={onRowClick ? () => onRowClick(row, index) : undefined}
        className={cn(
          "border-b border-line last:border-b-0 text-fg",
          onRowClick && "cursor-pointer hover:bg-raise",
          selected && "bg-brand/8",
        )}
      >
        {expandable ? (
          <td className="px-3 py-2">
            <button
              type="button"
              aria-label={expanded ? t.collapseRow : t.expandRow}
              aria-expanded={expanded}
              onClick={(e) => {
                e.stopPropagation()
                onToggleExpanded(rowKeyValue)
              }}
              className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-prui-sm text-dim hover:bg-raise hover:text-fg"
            >
              <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-90")} aria-hidden />
            </button>
          </td>
        ) : null}
        {selectable ? (
          <td className="px-3 py-2">
            <input
              type={selectionMultiple ? "checkbox" : "radio"}
              aria-label={`${t.selectRow} ${index + 1}`}
              checked={selected}
              onChange={() => onToggleSelected(rowKeyValue, row)}
              onClick={(e) => e.stopPropagation()}
              className="h-4 w-4 cursor-pointer accent-brand"
            />
          </td>
        ) : null}
        {columns.map((col) => (
          <td
            key={col.key}
            className={cn(
              "px-3 py-2",
              col.align === "right" && "text-right",
              col.align === "center" && "text-center",
              col.className,
            )}
          >
            {col.render ? col.render(row) : <TableCellValue value={row[col.key]} />}
          </td>
        ))}
      </tr>
      {expandable && expanded && renderExpandedRow ? (
        <tr data-expanded-row={String(rowKeyValue)}>
          <td colSpan={colCount} className="border-b border-line bg-raise/40 px-4 py-3">
            {renderExpandedRow(row)}
          </td>
        </tr>
      ) : null}
    </>
  )
}

const DataTableRow = React.memo(DataTableRowImpl) as typeof DataTableRowImpl

function TableCellValue({ value }: { value: unknown }) {
  const { t } = usePruiI18n()
  if (typeof value === "boolean") return <span>{value ? t.yes : t.no}</span>
  return <>{formatCell(value)}</>
}

function formatCell(value: unknown): React.ReactNode {
  if (value == null || value === "") return <span className="text-dim">-</span>
  if (value instanceof Date) return value.toLocaleDateString()
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
    { name: "selectable", type: "boolean | { multiple?: boolean }", default: "undefined", control: "boolean", description: "Renders a checkbox column." },
    { name: "selectedRowKeys", type: "(string | number)[]", default: "undefined", control: "object" },
    { name: "onSelectionChange", type: "(keys, rows) => void", default: null, control: "none" },
    { name: "renderExpandedRow", type: "(row) => ReactNode", default: null, control: "none" },
    { name: "expandedRowKeys", type: "(string | number)[]", default: "undefined", control: "object" },
    { name: "onExpandedRowsChange", type: "(keys) => void", default: null, control: "none" },
    { name: "virtualized", type: "boolean", default: "false", control: "boolean", description: "Window-render large row sets." },
  ],
}
