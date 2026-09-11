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
  nextCursor?: string | null
}

export type ResourceRow = Record<string, unknown>

export interface ResourceColumn<T extends ResourceRow> extends Column<T> {
  /** Filter type rendered in the toolbar. */
  filter?: "select" | "daterange" | "numberrange"
  /** Options for filter select. */
  filterOptions?: { label: string; value: string; count?: number }[]
  /** Field name for the form; defaults to key. */
  formField?: boolean
}

export type ResourceAction = "create" | "edit" | "delete"

export interface ResourceProps<T extends ResourceRow> {
  /** Resource display name, e.g. "employees". */
  name: string
  columns: ResourceColumn<T>[]
  /** (query) => Promise<{rows, cursor}> */
  list: (query: ListQuery) => Promise<ListResult<T>>
  create?: (values: Record<string, unknown>) => Promise<void> | void
  update?: (row: T, values: Record<string, unknown>) => Promise<void> | void
  remove?: (row: T) => Promise<void> | void
  /** Enabled actions, default all three when the functions are provided. */
  actions?: ResourceAction[]
  /** Custom form node; receives the editing row (null on create). */
  form?: React.ReactNode
  /** Schema for the built-in form; derived from columns when omitted. */
  formSchema?: FormSchema
  /** Get a row identity, defaults to row.id then index. */
  rowKey?: (row: T, index: number) => string
  searchPlaceholder?: string
  pageSize?: number
  className?: string
}

function schemaFromColumns<T extends ResourceRow>(columns: ResourceColumn<T>[], row?: T | null): FormSchema {
  const fields = columns
    .filter((c) => c.formField !== false && !c.hidden)
    .filter((c) => c.key !== "id" && c.key !== "actions")
    .map((c) => ({
      name: c.key,
      label: typeof c.label === "string" ? c.label : c.key,
      type: inferFieldType(c, row),
      required: false,
    }))
  return { fields, submitLabel: row ? "Save" : "Create" }
}

function inferFieldType<T extends ResourceRow>(col: ResourceColumn<T>, row?: T | null): "text" | "number" | "select" | "textarea" {
  if (col.filter === "select") return "select"
  const sample = row?.[col.key]
  if (typeof sample === "number") return "number"
  return "text"
}

export function Resource<T extends ResourceRow>({
  name,
  columns,
  list,
  create,
  update,
  remove,
  actions,
  form,
  formSchema,
  rowKey,
  searchPlaceholder,
  pageSize: initialPageSize = 20,
  className,
}: ResourceProps<T>) {
  const enabled = actions ?? (["create", "edit", "delete"] as ResourceAction[])
  const can = (a: ResourceAction) => enabled.includes(a) && (a === "create" ? !!create : a === "edit" ? !!update : !!remove)

  const [rows, setRows] = React.useState<T[]>([])
  const [nextCursor, setNextCursor] = React.useState<string | null>(null)
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(initialPageSize)
  const [cursorStack, setCursorStack] = React.useState<(string | null)[]>([null])
  const [search, setSearch] = React.useState("")
  const [filters, setFilters] = React.useState<ToolbarFilterValues>({})
  const [sort, setSort] = React.useState<{ key: string; direction: "asc" | "desc" } | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [editing, setEditing] = React.useState<T | null>(null)
  const [modalOpen, setModalOpen] = React.useState(false)
  const [deleteBusy, setDeleteBusy] = React.useState(false)

  const currentCursor = cursorStack[page - 1] ?? null

  const load = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await list({ search, cursor: currentCursor, pageSize, sort, filters })
      setRows(result.rows)
      setNextCursor(result.nextCursor ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setRows([])
      setNextCursor(null)
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, currentCursor, pageSize, sort, JSON.stringify(filters), list])

  React.useEffect(() => {
    void load()
  }, [load])

  // reset pagination when search/filters/pageSize change
  React.useEffect(() => {
    setPage(1)
    setCursorStack([null])
  }, [search, pageSize, JSON.stringify(filters)])

  const toolbarFilters: ToolbarFilterConfig[] = columns
    .filter((c) => c.filter)
    .map((c) => ({
      key: c.key,
      label: typeof c.label === "string" ? c.label : c.key,
      type: c.filter as ToolbarFilterConfig["type"],
      options: c.filterOptions,
    }))

  const onFilterChange = (key: string, value: ToolbarFilterValue) => {
    setFilters((f) => ({ ...f, [key]: value }))
  }

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
      title: `Delete ${singular}?`,
      message: "This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
    })
    if (!confirmed || !remove) return
    setDeleteBusy(true)
    try {
      await remove(row)
      await load()
    } finally {
      setDeleteBusy(false)
    }
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
    setPage(next)
  }

  const tableColumns: Column<T>[] = [
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
                  <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => openEdit(row)} data-testid="resource-edit">
                    <Pencil className="h-3.5 w-3.5" aria-hidden />
                  </Button>
                ) : null}
                {can("delete") ? (
                  <Button variant="ghost" size="icon" aria-label="Delete" disabled={deleteBusy} onClick={() => void openDelete(row)} data-testid="resource-delete">
                    <Trash2 className="h-3.5 w-3.5 text-[var(--prui-danger)]" aria-hidden />
                  </Button>
                ) : null}
              </div>
            ),
          } satisfies Column<T>,
        ]
      : []),
  ]

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
        searchPlaceholder={searchPlaceholder ?? `Search ${name}...`}
        searchValue={search}
        onSearchChange={setSearch}
        filters={toolbarFilters}
        filterValues={filters}
        onFilterChange={onFilterChange}
        actions={
          can("create") ? (
            <Button variant="primary" size="sm" onClick={openCreate} data-testid="resource-create">
              <Plus className="h-4 w-4" aria-hidden />
              New {singular}
            </Button>
          ) : undefined
        }
      />

      {error ? (
        <div role="alert" data-testid="resource-error" className="rounded-[var(--prui-radius)] border border-[var(--prui-danger)]/40 bg-[var(--prui-danger)]/10 px-3 py-2 text-sm text-[var(--prui-danger)]">
          {error}
        </div>
      ) : null}

      <DataTable columns={tableColumns} rows={rows} rowKey={rowKey} sort={sort} onSortChange={setSort} loading={loading} />

      <DataTablePagination
        page={page}
        pageSize={pageSize}
        hasNextPage={nextCursor != null}
        hasPreviousPage={page > 1}
        onPageChange={goPage}
        onPageSizeChange={(s) => setPageSize(s)}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} size="sm" ariaLabel={editing ? `Edit ${singular}` : `New ${singular}`} noPadding>
          <div className="px-8 pt-8 pb-2">
            <h2 className="text-lg font-semibold" style={{ color: "var(--prui-fg)" }}>{editing ? `Edit ${singular}` : `New ${singular}`}</h2>
          </div>
          <div className="px-8 pb-8">
            {form ?? (
              <Form
                schema={effectiveSchema}
                initialValues={initialValues}
                onCancel={() => setModalOpen(false)}
                onSubmit={async (values) => {
                  if (editing) await update?.(editing, values)
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
    { name: "list", type: "(query) => Promise<{rows, nextCursor}>", default: null, control: "none" },
    { name: "create", type: "(values) => Promise<void>", default: null, control: "none" },
    { name: "update", type: "(row, values) => Promise<void>", default: null, control: "none" },
    { name: "remove", type: "(row) => Promise<void>", default: null, control: "none" },
    { name: "actions", type: "('create' | 'edit' | 'delete')[]", default: "all provided", control: "multiselect", options: ["create", "edit", "delete"] },
    { name: "form", type: "ReactNode", default: "built-in schema form", control: "none" },
    { name: "formSchema", type: "FormSchema", default: "derived from columns", control: "object" },
    { name: "pageSize", type: "number", default: "20", control: "number" },
  ],
}
