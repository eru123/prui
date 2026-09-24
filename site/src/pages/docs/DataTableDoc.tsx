import * as React from "react"
import { ComponentDoc, DataTable, DataTablePagination, DataTableToolbar, FacetedFilter, DateRangeFilter, NumberRangeFilter, Badge } from "../../components/ComponentDoc"

interface Row extends Record<string, unknown> {
  id: string
  name: string
  status: "active" | "leave" | "new"
  salary: number
  hired: string
}

const rows: Row[] = [
  { id: "1", name: "Ada Lovelace", status: "active", salary: 132, hired: "2021-06-10" },
  { id: "2", name: "Grace Hopper", status: "leave", salary: 148, hired: "2020-02-03" },
  { id: "3", name: "Linus Torvalds", status: "active", salary: 120, hired: "2022-09-15" },
  { id: "4", name: "Margaret Hamilton", status: "new", salary: 155, hired: "2026-08-20" },
  { id: "5", name: "Barbara Liskov", status: "active", salary: 140, hired: "2021-03-22" },
]

export function DataTableDoc() {
  const [sort, setSort] = React.useState<{ key: string; direction: "asc" | "desc" } | null>(null)
  const [page, setPage] = React.useState(1)
  const [filters, setFilters] = React.useState<Record<string, unknown>>({})

  return (
    <ComponentDoc
      name="DataTable"
      importPath="@skiddph/prui/data-table"
      description="Column-configured table with sorting, loading/empty states, and the whole filter family: toolbar search, faceted select, date-range, number-range, plus cursor pagination (with optional totals for countable servers): the same parts <Resource> orchestrates. Headers align with their column by default."
      when={[
        "Any listing screen; usually reach for <Resource> first",
        "Direct composition when you need custom data flow",
      ]}
      anatomy={
        <p>
          <code className="rounded bg-[var(--prui-raise)] px-1">Column&lt;T&gt;</code>: key, label, sortable, align, width,
          render(row), hidden. Sorting controlled (sort + onSortChange) or uncontrolled (defaultSort).
        </p>
      }
      demos={[
        {
          title: "Sorting (click headers)",
          render: (
            <div className="w-full">
              <DataTable
                columns={[
                  { key: "name", label: "Name", sortable: true },
                  { key: "status", label: "Status", render: (r) => <Badge variant={r.status === "active" ? "ok" : r.status === "leave" ? "warn" : "brand"}>{r.status}</Badge> },
                  { key: "salary", label: "Salary (k)", sortable: true, align: "right" },
                ]}
                rows={rows}
                rowKey={(r) => r.id}
                sort={sort}
                onSortChange={setSort}
              />
            </div>
          ),
          code: `const columns: Column<Employee>[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "status", label: "Status", render: (r) => <Badge variant="ok">{r.status}</Badge> },
  { key: "salary", label: "Salary", sortable: true, align: "right" },
]

<DataTable columns={columns} rows={rows} rowKey={(r) => r.id}
           sort={sort} onSortChange={setSort} />`,
        },
        {
          title: "Empty and loading states",
          render: (
            <div className="w-full">
              <DataTable columns={[{ key: "name", label: "Name" }]} rows={[]} emptyMessage="No employees yet." />
            </div>
          ),
          code: `<DataTable columns={cols} rows={[]} emptyMessage="No employees yet." />
<DataTable columns={cols} rows={[]} loading />`,
        },
      ]}
      examples={[
        {
          title: "Toolbar + filters + pagination",
          render: (
            <div className="w-full">
              <DataTableToolbar
                searchPlaceholder="Search…"
                onSearchChange={() => {}}
                filters={[
                  { key: "status", label: "Status", type: "select", options: [{ label: "Active", value: "active" }, { label: "Leave", value: "leave" }] },
                  { key: "hired", label: "Hired", type: "daterange" },
                  { key: "salary", label: "Salary", type: "numberrange" },
                ]}
                filterValues={filters as never}
                onFilterChange={(k, v) => setFilters((f) => ({ ...f, [k]: v }))}
              />
              <DataTablePagination page={page} pageSize={20} hasNextPage={false} hasPreviousPage={page > 1} onPageChange={(p) => setPage(p)} />
            </div>
          ),
          code: `<DataTableToolbar
  searchValue={q} onSearchChange={setQ}
  filters={[
    { key: "status", label: "Status", type: "select", options },
    { key: "hired", label: "Hired", type: "daterange" },
    { key: "salary", label: "Salary", type: "numberrange" },
  ]}
  filterValues={filters}
  onFilterChange={(k, v) => setFilters(f => ({ ...f, [k]: v }))}
/>
<DataTable columns={cols} rows={rows} />
<DataTablePagination page={page} hasNextPage={!!cursor}
    hasPreviousPage={page > 1} onPageChange={goPage} />`,
        },
        {
          title: "Faceted / date / number filters standalone",
          render: (
            <>
              <FacetedFilter label="Status" options={[{ label: "Active", value: "active", count: 3 }, { label: "Leave", value: "leave", count: 2 }]} />
              <DateRangeFilter label="Hired" />
              <NumberRangeFilter label="Salary" />
            </>
          ),
          code: `<FacetedFilter label="Status" options={facets} value={sel} onChange={setSel} />
<DateRangeFilter label="Hired" value={dr} onChange={setDr} />
<NumberRangeFilter label="Salary" value={nr} onChange={setNr} />`,
        },
      ]}
      dos={[
        "rowKey to a stable id",
        "Use render for cells, not string templating",
        "hidden columns still feed filters",
      ]}
      donts={[
        "Don't hand-roll pagination: DataTablePagination takes cursors, and totalPages/totalRows when your server counts",
        "Don't sort client-side when the API sorts; pass sort through",
        "Don't set text-align on headers from app CSS: column align flows to the header automatically",
      ]}
    />
  )
}
