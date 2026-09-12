import * as React from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "../core/button"
import { Modal } from "../core/modal"
import { confirmModal } from "../core/modal"
import { cn } from "../core/cn"
import type { PropsMeta } from "../core/props-meta"
import { DataTable, type Column } from "../data-table/data-table"
import { DataTablePagination } from "../data-table/data-table-pagination"
import {
  DataTableToolbar,
  type ToolbarFilterConfig,
  type ToolbarFilterValues,
  type ToolbarFilterValue,
} from "../data-table/data-table-toolbar"
import { Form, type FormSchema } from "./form"
import { usePruiI18n } from "../i18n"

/**
 * <Resource>: a complete CRUD screen from a column config and API functions.
 * Toolbar + filters + DataTable + cursor pagination + create/edit modal +
 * delete confirmation, all wired to caller-provided list/create/update/delete.
 */

export interface ListQuery {
  search?: string
  cursor?: string | null
  pageSize?: number
  sort?: { key: string; direction: "asc" | "desc" } | null
  filters?: ToolbarFilterValues
}

export interface ListResult<T> {
  rows: T[]
  /** Next-page cursor. `cursor` is accepted as an alias. */
  nextCursor?: string | null
  cursor?: string | null
}

export type ResourceRow = Record<string, unknown>

/** Select choices: plain strings/numbers or label/value pairs. */
export type ResourceFilterOptions = (string | number | { label: string; value: string; count?: number })[]

export interface ResourceColumn<T extends ResourceRow> extends Column<T> {
  /** Filter type rendered in the toolbar. */
  filter?: "select" | "date" | "daterange" | "number" | "numberrange" | "price" | "time"
  /** Select filter choices: strings/numbers or {label, value} pairs. */
  options?: ResourceFilterOptions
  /** Select filter choices; `options` is an alias of this. */
  filterOptions?: ResourceFilterOptions
  /** Field name for the form; defaults to key. */
  formField?: boolean
}

export type ResourceAction = "create" | "edit" | "delete"

/** The full interactive state of a Resource screen. */
export interface ResourceState {
  page: number
  pageSize: number
  search: string
  filters: ToolbarFilterValues
  sort: { key: string; direction: "asc" | "desc" } | null
  /** Keys of selected rows (rowKey or row.id). */
  selection: (string | number)[]
  /** Keys of expanded rows (requires renderExpandedRow). */
  expandedRows: (string | number)[]
}

export interface ResourceProps<T extends ResourceRow> {
  /** Resource display name, e.g. "employees". */
  name: string
  columns: ResourceColumn<T>[]
  /** (query) => Promise<{rows, cursor}> */
  list: (query: ListQuery) => Promise<ListResult<T>>
  /** Return values are ignored — resolve or reject to signal outcome. */
  create?: (values: Record<string, unknown>) => unknown
  update?: (row: T, values: Partial<T>) => unknown
  /** Deletes a row; `delete` is an alias. */
  remove?: (row: T) => unknown
  /** Alias of remove. */
  delete?: (row: T) => unknown
  /** Enabled actions, default all three when the functions are provided. */
  actions?: ResourceAction[]
  /** Custom form node; receives the editing row (null on create). */
  form?: React.ReactNode
  /** Schema for the built-in form; derived from columns when omitted. */
  formSchema?: FormSchema
  /** Get a row identity, defaults to row.id then index. */
  rowKey?: (row: T, index: number) => string
  searchPlaceholder?: string
  /** Default page size (alias of defaultState.pageSize). */
  pageSize?: number
  /**
   * Controlled state: any subset of { page, pageSize, search, filters, sort,
   * selection, expandedRows }. Omitted keys stay uncontrolled.
   */
  state?: Partial<ResourceState>
  /** Initial values for the uncontrolled keys. */
  defaultState?: Partial<ResourceState>
  /** Fires on every state change with the complete state. */
  onStateChange?: (state: ResourceState) => void
  /** Granular callbacks (also fired alongside onStateChange). */
  onPageChange?: (page: number) => void
  onFilterChange?: (filters: ToolbarFilterValues) => void
  onSortChange?: (sort: ResourceState["sort"]) => void
  onSearchChange?: (search: string) => void
  /** Fires when the page size control changes. */
  onPageSizeChange?: (size: number) => void
  onSelectionChange?: (keys: (string | number)[], rows: T[]) => void
  /** Row selection: true = multiple, { multiple: false } = single. */
  selectable?: boolean | { multiple?: boolean }
  /** Expandable row detail (rendered under the row when expanded). */
  renderExpandedRow?: (row: T) => React.ReactNode
  /** Window-render large row sets. */
  virtualized?: boolean
  /** Debounce for the search input before list() refires, in ms. Default 250. */
  searchDebounce?: number
  className?: string
}

function normalizeFilterOptions(opts?: ResourceFilterOptions): { label: string; value: string; count?: number }[] | undefined {
  if (!opts) return undefined
  return opts.map((o) => (typeof o === "string" || typeof o === "number" ? { label: String(o), value: String(o) } : o))
}

function schemaFromColumns<T extends ResourceRow>(columns: ResourceColumn<T>[], row?: T | null): FormSchema {
  const fields = columns
    .filter((c) => c.formField !== false && !c.hidden)
    .filter((c) => c.key !== "id" && c.key !== "actions")
    .map((c) => ({
      name: c.key,
      label: typeof c.label === "string" ? c.label : c.key,
      type: inferFieldType(c, row),
      options: normalizeFilterOptions(c.filterOptions ?? c.options)?.map((o) => ({ label: o.label, value: o.value })),
      required: false,
    }))
  return { fields, submitLabel: row ? "Save" : "Create" }
}

function inferFieldType<T extends ResourceRow>(col: ResourceColumn<T>, row?: T | null): "text" | "number" | "select" | "textarea" | "date" {
  if (col.filter === "select") return "select"
  const sample = row?.[col.key]
  if (typeof sample === "number") return "number"
  if (col.filter === "number" || col.filter === "numberrange" || col.filter === "price") return "number"
  if (col.filter === "date" || col.filter === "daterange") return "date"
  return "text"
}

export function Resource<T extends ResourceRow>({
  name,
  columns,
  list,
  create,
  update,
  remove,
  delete: deleteAlias,
  actions,
  form,
  formSchema,
  rowKey,
  searchPlaceholder,
  pageSize: initialPageSize,
  state: stateProp,
  defaultState,
  onStateChange,
  onPageChange,
  onFilterChange,
  onSortChange,
  onSearchChange,
  onPageSizeChange,
  onSelectionChange,
  selectable,
  renderExpandedRow,
  virtualized,
  searchDebounce = 250,
  className,
}: ResourceProps<T>) {
  const { t } = usePruiI18n()
  const doRemove = remove ?? deleteAlias
  const enabled = actions ?? (["create", "edit", "delete"] as ResourceAction[])
  const can = (a: ResourceAction) => enabled.includes(a) && (a === "create" ? !!create : a === "edit" ? !!update : !!doRemove)

  /* -------- controlled/uncontrolled state (per-key) ---------------- */
  const defaults = React.useMemo<ResourceState>(
    () => ({
      page: 1,
      pageSize: initialPageSize ?? defaultState?.pageSize ?? 20,
      search: defaultState?.search ?? "",
      filters: defaultState?.filters ?? {},
      sort: defaultState?.sort ?? null,
      selection: defaultState?.selection ?? [],
      expandedRows: defaultState?.expandedRows ?? [],
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- defaults are read once
    [],
  )

  const [uncontrolled, setUncontrolled] = React.useState<ResourceState>(defaults)
  const state: ResourceState = React.useMemo(
    () => ({ ...uncontrolled, ...Object.fromEntries(Object.entries(stateProp ?? {}).filter(([, v]) => v !== undefined)) }),
    [uncontrolled, stateProp],
  )

  const patchState = React.useCallback(
    (patch: Partial<ResourceState>) => {
      setUncontrolled((prev) => {
        const next: ResourceState = { ...prev }
        const overrides = stateProp as Partial<Record<keyof ResourceState, unknown>> | undefined
        for (const [k, v] of Object.entries(patch)) {
          // a controlled key keeps its external value
          if (overrides && k in overrides && overrides[k as keyof ResourceState] !== undefined) continue
          ;(next as unknown as Record<string, unknown>)[k] = v
        }
        const merged: ResourceState = { ...next, ...Object.fromEntries(Object.entries(stateProp ?? {}).filter(([, v]) => v !== undefined)) }
        onStateChange?.(merged)
        return next
      })
    },
    [stateProp, onStateChange],
  )

  const { page, pageSize, search, filters, sort, selection, expandedRows } = state

  const [rows, setRows] = React.useState<T[]>([])
  const [nextCursor, setNextCursor] = React.useState<string | null>(null)
  const [cursorStack, setCursorStack] = React.useState<(string | null)[]>([null])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [editing, setEditing] = React.useState<T | null>(null)
  const [modalOpen, setModalOpen] = React.useState(false)
  const [deleteBusy, setDeleteBusy] = React.useState(false)

  // debounce the search term before it refires list()
  const [debouncedSearch, setDebouncedSearch] = React.useState(search)
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), searchDebounce)
    return () => clearTimeout(t)
  }, [search, searchDebounce])

  const currentCursor = cursorStack[page - 1] ?? null

  const filtersKey = JSON.stringify(filters)
  const load = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await list({ search: debouncedSearch, cursor: currentCursor, pageSize, sort, filters })
      setRows(result.rows)
      setNextCursor(result.nextCursor ?? result.cursor ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setRows([])
      setNextCursor(null)
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, currentCursor, pageSize, sort, filtersKey, list])

  React.useEffect(() => {
    void load()
  }, [load])

  // reset pagination when search/filters/pageSize change
  React.useEffect(() => {
    patchState({ page: 1 })
    setCursorStack([null])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, pageSize, filtersKey])

  const toolbarFilters: ToolbarFilterConfig[] = React.useMemo(
    () =>
      columns
        .filter((c) => c.filter)
        .map((c) => ({
          key: c.key,
          label: typeof c.label === "string" ? c.label : c.key,
          type: (c.filter === "numberrange" ? "number" : c.filter) as ToolbarFilterConfig["type"],
          options: normalizeFilterOptions(c.filterOptions ?? c.options),
        })),
    [columns],
  )

  const handleFilterChange = (key: string, value: ToolbarFilterValue) => {
    const next = { ...filters, [key]: value }
    patchState({ filters: next })
    onFilterChange?.(next)
  }

  const setSearchValue = (value: string) => {
    patchState({ search: value })
    onSearchChange?.(value)
  }

  const applySort = (next: { key: string; direction: "asc" | "desc" } | null) => {
    patchState({ sort: next })
    onSortChange?.(next)
  }

  const goPage = (next: number, direction: "next" | "prev") => {
    if (direction === "next") {
      const cursor = nextCursor
      setCursorStack((s) => {
        const copy = [...s]
        copy[next - 1] = cursor
        return copy
      })
    }
    patchState({ page: next })
    onPageChange?.(next)
  }

  const tableColumns: Column<T>[] = React.useMemo(
    () => [
      ...columns.filter((c) => !c.hidden),
      ...(can("edit") || can("delete")
        ? [
            {
              key: "actions",
              label: "",
              align: "right" as const,
              render: (row: T) => (
                <div className="flex items-center justify-end gap-1">
                  {can("edit") ? (
                    <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => openEditRef.current?.(row)} data-testid="resource-edit">
                      <Pencil className="h-3.5 w-3.5" aria-hidden />
                    </Button>
                  ) : null}
                  {can("delete") ? (
                    <Button variant="ghost" size="icon" aria-label="Delete" disabled={deleteBusy} onClick={() => void openDeleteRef.current?.(row)} data-testid="resource-delete">
                      <Trash2 className="h-3.5 w-3.5 text-[var(--prui-danger)]" aria-hidden />
                    </Button>
                  ) : null}
                </div>
              ),
            } satisfies Column<T>,
          ]
        : []),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- can() depends only on the action functions
    [columns, create, update, doRemove, deleteBusy],
  )

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (row: T) => {
    setEditing(row)
    setModalOpen(true)
  }

  const openDelete = async (row: T) => {
    const confirmed = await confirmModal({
      title: `${t.delete} ${singular}?`,
      message: t.deleteConfirmMessage,
      confirmText: t.delete,
      cancelText: t.cancel,
      type: "danger",
    })
    if (!confirmed || !doRemove) return
    setDeleteBusy(true)
    try {
      await doRemove(row)
      await load()
    } finally {
      setDeleteBusy(false)
    }
  }

  // stable refs so the memoized action cells don't capture stale closures
  const openEditRef = React.useRef(openEdit)
  openEditRef.current = openEdit
  const openDeleteRef = React.useRef(openDelete)
  openDeleteRef.current = openDelete

  const rowKeyFn = React.useCallback(
    (row: T, index: number) => String(rowKey ? rowKey(row, index) : ((row as { id?: string | number }).id ?? index)),
    [rowKey],
  )

  const effectiveSchema = formSchema ?? schemaFromColumns(columns, editing)
  const initialValues = editing
    ? Object.fromEntries(
        effectiveSchema.fields.map((f) => [f.name, (editing as Record<string, unknown>)[f.name] ?? ""]),
      )
    : undefined

  const singular = name.replace(/s$/, "")

  return (
    <div className={cn("prui-resource flex flex-col gap-2", className)} data-testid="resource">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold capitalize text-[var(--prui-fg)]">{name}</h1>
      </div>

      <DataTableToolbar
        searchPlaceholder={searchPlaceholder ?? t.searchEntity.replace("{name}", name)}
        searchValue={search}
        onSearchChange={setSearchValue}
        filters={toolbarFilters}
        filterValues={filters}
        onFilterChange={handleFilterChange}
        actions={
          can("create") ? (
            <Button variant="primary" size="sm" onClick={openCreate} data-testid="resource-create">
              <Plus className="h-4 w-4" aria-hidden />
              {t.newEntity.replace("{name}", singular)}
            </Button>
          ) : undefined
        }
      />

      {error ? (
        <div role="alert" data-testid="resource-error" className="rounded-[var(--prui-radius)] border border-[var(--prui-danger)]/40 bg-[var(--prui-danger)]/10 px-3 py-2 text-sm text-[var(--prui-danger)]">
          {error}
        </div>
      ) : null}

      <DataTable
        columns={tableColumns}
        rows={rows}
        rowKey={rowKeyFn}
        sort={sort}
        onSortChange={applySort}
        loading={loading}
        selectable={selectable}
        selectedRowKeys={selection}
        onSelectionChange={(keys, selectedRows) => {
          patchState({ selection: keys })
          onSelectionChange?.(keys, selectedRows)
        }}
        renderExpandedRow={renderExpandedRow}
        expandedRowKeys={expandedRows}
        onExpandedRowsChange={(keys) => patchState({ expandedRows: keys })}
        virtualized={virtualized}
      />

      <DataTablePagination
        page={page}
        pageSize={pageSize}
        hasNextPage={nextCursor != null}
        hasPreviousPage={page > 1}
        onPageChange={goPage}
        onPageSizeChange={(s) => {
          patchState({ pageSize: s })
          onPageSizeChange?.(s)
        }}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} size="sm" ariaLabel={editing ? t.editEntity.replace("{name}", singular) : t.newEntity.replace("{name}", singular)} noPadding>
          <div className="px-8 pt-8 pb-2">
            <h2 className="text-lg font-semibold" style={{ color: "var(--prui-fg)" }}>{editing ? t.editEntity.replace("{name}", singular) : t.newEntity.replace("{name}", singular)}</h2>
          </div>
          <div className="px-8 pb-8">
            {form ?? (
              <Form
                schema={effectiveSchema}
                initialValues={initialValues}
                onCancel={() => setModalOpen(false)}
                onSubmit={async (values) => {
                  if (editing) await update?.(editing, values as Partial<T>)
                  else await create?.(values)
                  setModalOpen(false)
                  await load()
                }}
              />
            )}
          </div>
      </Modal>

    </div>
  )
}

export const resourcePropsMeta: PropsMeta = {
  name: "Resource",
  props: [
    { name: "name", type: "string", default: null, control: "text" },
    { name: "columns", type: "ResourceColumn<T>[]", default: null, control: "object" },
    { name: "list", type: "(query) => Promise<{rows, cursor}>", default: null, control: "none" },
    { name: "create", type: "(values) => Promise<void>", default: null, control: "none" },
    { name: "update", type: "(row, values) => Promise<void>", default: null, control: "none" },
    { name: "remove", type: "(row) => Promise<void>", default: null, control: "none" },
    { name: "delete", type: "(row) => Promise<void>", default: "alias of remove", control: "none" },
    { name: "actions", type: "('create' | 'edit' | 'delete')[]", default: "all provided", control: "multiselect", options: ["create", "edit", "delete"] },
    { name: "form", type: "ReactNode", default: "built-in schema form", control: "none" },
    { name: "formSchema", type: "FormSchema", default: "derived from columns", control: "object" },
    { name: "pageSize", type: "number", default: "20", control: "number" },
    { name: "state", type: "Partial<ResourceState>", default: "undefined", control: "object", description: "Controlled page/pageSize/search/filters/sort/selection/expandedRows." },
    { name: "defaultState", type: "Partial<ResourceState>", default: "{}", control: "object" },
    { name: "onStateChange", type: "(state: ResourceState) => void", default: null, control: "none" },
    { name: "onPageChange", type: "(page: number) => void", default: null, control: "none" },
    { name: "onPageSizeChange", type: "(size: number) => void", default: null, control: "none" },
    { name: "onFilterChange", type: "(filters: ToolbarFilterValues) => void", default: null, control: "none" },
    { name: "onSortChange", type: "(sort: ResourceState['sort']) => void", default: null, control: "none" },
    { name: "onSearchChange", type: "(search: string) => void", default: null, control: "none" },
    { name: "onSelectionChange", type: "(keys, rows) => void", default: null, control: "none" },
    { name: "selectable", type: "boolean | { multiple?: boolean }", default: "undefined", control: "boolean" },
    { name: "renderExpandedRow", type: "(row: T) => ReactNode", default: null, control: "none" },
    { name: "virtualized", type: "boolean", default: "false", control: "boolean" },
    { name: "searchDebounce", type: "number (ms)", default: "250", control: "number" },
  ],
}
