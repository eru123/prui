
import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, waitFor, cleanup } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Resource, type ResourceProps, type ResourceState } from "./resource"
import type { ResourceRow } from "./resource"
import { DataTable } from "../data-table/data-table"

afterEach(() => {
  cleanup()
  document.body.innerHTML = ""
})

interface Employee extends ResourceRow {
  id: string
  name: string
  status: string
}

const employees: Employee[] = [
  { id: "1", name: "Ada", status: "active" },
  { id: "2", name: "Grace", status: "leave" },
  { id: "3", name: "Linus", status: "active" },
]

function makeList() {
  return vi.fn(async (query: Parameters<ResourceProps<Employee>["list"]>[0]) => {
    let rows = employees
    if (query.search) rows = rows.filter((r) => r.name.toLowerCase().includes(query.search!.toLowerCase()))
    const statusFilter = query.filters?.["status"] as string[] | undefined
    if (statusFilter && statusFilter.length > 0) rows = rows.filter((r) => statusFilter.includes(r.status))
    return { rows, nextCursor: null }
  })
}

const columns: ResourceProps<Employee>["columns"] = [
  { key: "name", label: "Name", sortable: true },
  { key: "status", label: "Status", filter: "select", filterOptions: [{ label: "Active", value: "active" }, { label: "Leave", value: "leave" }] },
]

describe("Resource controlled/uncontrolled state", () => {
  it("uncontrolled: reports state changes through onStateChange", async () => {
    const user = userEvent.setup()
    const onStateChange = vi.fn()
    render(<Resource name="employees" columns={columns} list={makeList()} onStateChange={onStateChange} />)
    await waitFor(() => expect(screen.getByText("Ada")).toBeInTheDocument())

    await user.click(screen.getByRole("button", { name: /Name/ }))
    await waitFor(() => {
      const last = onStateChange.mock.calls.at(-1)?.[0] as ResourceState
      expect(last.sort).toEqual({ key: "name", direction: "asc" })
    })

    await user.type(screen.getByRole("searchbox", { name: "Search" }), "gr")
    await waitFor(() => {
      const last = onStateChange.mock.calls.at(-1)?.[0] as ResourceState
      expect(last.search).toBe("gr")
    })
  })

  it("controlled: page/pageSize/search from the state prop drive list()", async () => {
    const list = makeList()
    const { rerender } = render(
      <Resource name="employees" columns={columns} list={list} state={{ search: "grace" }} />,
    )
    await waitFor(() => expect(list).toHaveBeenCalled())
    await waitFor(() => expect(screen.getByText("Grace")).toBeInTheDocument())
    expect(screen.queryByText("Ada")).toBeNull()

    rerender(<Resource name="employees" columns={columns} list={list} state={{ search: "" }} />)
    await waitFor(() => expect(screen.getByText("Ada")).toBeInTheDocument())
  })

  it("controlled search is not overwritten by internal typing (update flows outward)", async () => {
    const user = userEvent.setup()
    const onSearchChange = vi.fn()
    const list = makeList()
    render(
      <Resource
        name="employees"
        columns={columns}
        list={list}
        state={{ search: "" }}
        onSearchChange={onSearchChange}
      />,
    )
    await waitFor(() => expect(screen.getByText("Ada")).toBeInTheDocument())
    await user.type(screen.getByRole("searchbox", { name: "Search" }), "g")
    expect(onSearchChange).toHaveBeenLastCalledWith("g")
    // fully controlled: the displayed value stays at the controlled value
    // until the parent echoes it back through state.search
    expect(screen.getByRole("searchbox", { name: "Search" })).toHaveValue("")
  })

  it("onPageChange and onPageSizeChange fire", async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    const onPageSizeChange = vi.fn()
    const list = vi.fn(async () => ({ rows: employees, nextCursor: "c2" }))
    render(
      <Resource name="employees" columns={columns} list={list} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />,
    )
    await waitFor(() => expect(screen.getByText("Ada")).toBeInTheDocument())
    await user.click(screen.getByRole("button", { name: "Next page" }))
    expect(onPageChange).toHaveBeenCalledWith(2)
    // page size select
    await user.click(screen.getByRole("combobox", { name: "Rows per page" }))
    await user.click(screen.getByRole("option", { name: "50" }))
    expect(onPageSizeChange).toHaveBeenCalledWith(50)
  })

  it("onFilterChange and onSortChange fire with the full next value", async () => {
    const user = userEvent.setup()
    const onFilterChange = vi.fn()
    const onSortChange = vi.fn()
    render(
      <Resource name="employees" columns={columns} list={makeList()} onFilterChange={onFilterChange} onSortChange={onSortChange} />,
    )
    await waitFor(() => expect(screen.getByText("Ada")).toBeInTheDocument())
    await user.click(screen.getByRole("button", { name: /Name/ }))
    await waitFor(() => expect(onSortChange).toHaveBeenCalledWith({ key: "name", direction: "asc" }))

    await user.click(screen.getByTestId("faceted-filter"))
    await user.click(screen.getByRole("menuitemcheckbox", { name: /Leave/ }))
    await waitFor(() => expect(onFilterChange).toHaveBeenCalledWith({ status: ["leave"] }))
  })

  it("selectable rows report selection through onSelectionChange and onStateChange", async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()
    const onStateChange = vi.fn()
    render(
      <Resource
        name="employees"
        columns={columns}
        list={makeList()}
        selectable
        onSelectionChange={onSelectionChange}
        onStateChange={onStateChange}
      />,
    )
    await waitFor(() => expect(screen.getByText("Ada")).toBeInTheDocument())
    await user.click(screen.getByRole("checkbox", { name: "Select row 1" }))
    expect(onSelectionChange).toHaveBeenCalledWith(["1"], [employees[0]])
    await waitFor(() => {
      const last = onStateChange.mock.calls.at(-1)?.[0] as ResourceState
      expect(last.selection).toEqual(["1"])
    })
    // select-all toggles every row
    await user.click(screen.getByRole("checkbox", { name: "Select all rows" }))
    await waitFor(() => {
      const last = onSelectionChange.mock.calls.at(-1)
      expect(last?.[0]).toEqual(["1", "2", "3"])
    })
  })

  it("renderExpandedRow adds expandable rows tracked in expandedRows state", async () => {
    const user = userEvent.setup()
    const onStateChange = vi.fn()
    render(
      <Resource
        name="employees"
        columns={columns}
        list={makeList()}
        renderExpandedRow={(row) => <div>Detail: {(row as Employee).name}</div>}
        onStateChange={onStateChange}
      />,
    )
    await waitFor(() => expect(screen.getByText("Ada")).toBeInTheDocument())
    await user.click(screen.getAllByRole("button", { name: "Expand row" })[0]!)
    expect(screen.getByText("Detail: Ada")).toBeInTheDocument()
    await waitFor(() => {
      const last = onStateChange.mock.calls.at(-1)?.[0] as ResourceState
      expect(last.expandedRows).toEqual(["1"])
    })
    await user.click(screen.getAllByRole("button", { name: "Collapse row" })[0]!)
    expect(screen.queryByText("Detail: Ada")).toBeNull()
  })

  it("debounces the search before refiring list()", async () => {
    const user = userEvent.setup()
    const list = makeList()
    render(<Resource name="employees" columns={columns} list={list} searchDebounce={200} />)
    await waitFor(() => expect(screen.getByText("Ada")).toBeInTheDocument())
    const callsBefore = list.mock.calls.length
    await user.type(screen.getByRole("searchbox", { name: "Search" }), "gr")
    // during the debounce window list() has not refired
    expect(list.mock.calls.length).toBe(callsBefore)
    await waitFor(() => expect(list.mock.calls.length).toBeGreaterThan(callsBefore))
    expect(list.mock.calls.at(-1)![0].search).toBe("gr")
  })
})

describe("DataTable selection + expansion", () => {
  it("single selection mode uses radio inputs", async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()
    render(
      <DataTable
        columns={[{ key: "name", label: "Name" }]}
        rows={employees}
        selectable={{ multiple: false }}
        onSelectionChange={onSelectionChange}
      />,
    )
    await user.click(screen.getByRole("radio", { name: "Select row 1" }))
    expect(onSelectionChange).toHaveBeenCalledWith(["1"], [employees[0]])
    await user.click(screen.getByRole("radio", { name: "Select row 2" }))
    expect(onSelectionChange).toHaveBeenLastCalledWith(["2"], [employees[1]])
  })

  it("controlled selection and expansion", async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()
    render(
      <DataTable
        columns={[{ key: "name", label: "Name" }]}
        rows={employees}
        selectable
        selectedRowKeys={["2"]}
        onSelectionChange={onSelectionChange}
        renderExpandedRow={(row) => <div>open {(row as Employee).name}</div>}
        expandedRowKeys={["3"]}
      />,
    )
    expect(screen.getByRole("checkbox", { name: "Select row 2" })).toBeChecked()
    expect(screen.getByText("open Linus")).toBeInTheDocument()
    // clicking a checked row unselects it (reports outward, stays controlled)
    await user.click(screen.getByRole("checkbox", { name: "Select row 2" }))
    expect(onSelectionChange).toHaveBeenCalledWith([], [])
  })

  it("aria-sort reflects the sort state", () => {
    render(
      <DataTable
        columns={[{ key: "name", label: "Name", sortable: true }, { key: "status", label: "Status" }]}
        rows={employees}
        sort={{ key: "name", direction: "desc" }}
      />,
    )
    expect(screen.getByRole("columnheader", { name: /Name/ })).toHaveAttribute("aria-sort", "descending")
    expect(screen.getByRole("columnheader", { name: "Status" })).not.toHaveAttribute("aria-sort")
  })
})
