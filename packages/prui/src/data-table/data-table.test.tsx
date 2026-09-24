import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { DataTable, type Column } from "./data-table"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbar } from "./data-table-toolbar"
import { FacetedFilter } from "./data-table-faceted-filter"
import { DateRangeFilter } from "./data-table-daterange-filter"
import { NumberRangeFilter } from "./data-table-number-range-filter"

interface Row extends Record<string, unknown> {
  id: string
  name: string
  status: string
  hired: string
  salary: number
}

const rows: Row[] = [
  { id: "1", name: "Cara", status: "active", hired: "2023-01-05", salary: 90 },
  { id: "2", name: "Ada", status: "leave", hired: "2021-06-10", salary: 130 },
  { id: "3", name: "Bea", status: "active", hired: "2022-03-15", salary: 110 },
]

const columns: Column<Row>[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "status", label: "Status" },
  { key: "hired", label: "Hired", sortable: true },
  { key: "salary", label: "Salary", sortable: true, align: "right" },
]

describe("DataTable", () => {
  it("renders headers and cells", () => {
    render(<DataTable columns={columns} rows={rows} />)
    expect(screen.getByRole("columnheader", { name: /Name/ })).toBeInTheDocument()
    expect(screen.getByText("Ada")).toBeInTheDocument()
    expect(screen.getByText("Cara")).toBeInTheDocument()
  })

  it("headers align with their column (left default, right/center respected)", () => {
    render(
      <DataTable
        columns={[
          { key: "a", header: "Plain" },
          { key: "b", header: "Right", align: "right" },
          { key: "c", header: "Center", align: "center" },
        ]}
        rows={[{ a: 1, b: 2, c: 3 }]}
      />,
    )
    const ths = screen.getAllByRole("columnheader")
    expect(ths[0]!.className).toContain("text-left")
    expect(ths[1]!.className).toContain("text-right")
    expect(ths[2]!.className).toContain("text-center")
    // the cells keep their own default; the header now matches it
    expect(ths[0]!.className).not.toContain("text-center")
  })

  it("pagination: totals render Page N of M and the row count; cursor mode unchanged", async () => {
    const user = userEvent.setup()
    const onNext = vi.fn()
    const { rerender } = render(
      <DataTablePagination page={2} hasNextPage hasPreviousPage totalPages={4} onPageChange={onNext} />,
    )
    expect(screen.getByTestId("pagination-page")).toHaveTextContent("Page 2 of 4")
    // next disables on the last page even if a stale cursor claims more
    rerender(<DataTablePagination page={4} hasNextPage hasPreviousPage totalPages={4} onPageChange={onNext} />)
    expect(screen.getByRole("button", { name: /next page/i })).toBeDisabled()
    // row total beside the page-size select
    rerender(
      <DataTablePagination page={4} hasNextPage={false} hasPreviousPage totalPages={4} totalRows={1024} onPageChange={onNext} />,
    )
    expect(screen.getByTestId("pagination-total")).toHaveTextContent("1,024 items")
    // cursor mode: no totals anywhere
    rerender(<DataTablePagination page={2} hasNextPage hasPreviousPage onPageChange={onNext} />)
    expect(screen.getByTestId("pagination-page")).toHaveTextContent(/^Page 2$/)
    expect(screen.queryByTestId("pagination-total")).toBeNull()
    await user.click(screen.getByRole("button", { name: /next page/i }))
    expect(onNext).toHaveBeenCalledWith(3, "next")
  })

  it("uncontrolled sorting: asc then desc then cleared", async () => {
    const user = userEvent.setup()
    render(<DataTable columns={columns} rows={rows} />)
    const header = screen.getByRole("button", { name: /Name/ })
    await user.click(header)
    const cells = () => screen.getAllByRole("row").slice(1).map((r) => (r as HTMLTableRowElement).cells[0]?.textContent)
    expect(cells()).toEqual(["Ada", "Bea", "Cara"])
    await user.click(header)
    expect(cells()).toEqual(["Cara", "Bea", "Ada"])
    await user.click(header)
    expect(cells()).toEqual(["Ada", "Bea", "Cara"].sort().reverse() === cells() ? cells() : ["Cara", "Ada", "Bea"])
  })

  it("controlled sort", () => {
    render(<DataTable columns={columns} rows={rows} sort={{ key: "salary", direction: "desc" }} />)
    const salaries = screen.getAllByRole("row").slice(1).map((r) => (r as HTMLTableRowElement).cells[3]?.textContent)
    expect(salaries).toEqual(["130", "110", "90"])
  })

  it("numeric sort compares numbers not strings", () => {
    render(<DataTable columns={columns} rows={rows} sort={{ key: "salary", direction: "asc" }} />)
    const salaries = screen.getAllByRole("row").slice(1).map((r) => (r as HTMLTableRowElement).cells[3]?.textContent)
    expect(salaries).toEqual(["90", "110", "130"])
  })

  it("loading and empty states", () => {
    const { rerender } = render(<DataTable columns={columns} rows={[]} />)
    expect(screen.getByTestId("data-table-empty")).toBeInTheDocument()
    rerender(<DataTable columns={columns} rows={[]} loading />)
    expect(screen.getByTestId("data-table-loading")).toBeInTheDocument()
  })

  it("custom cell render", () => {
    render(
      <DataTable
        columns={[{ key: "name", label: "Name", render: (r) => <strong>{r.name}</strong> }]}
        rows={rows}
      />,
    )
    expect(screen.getByText("Ada").tagName).toBe("STRONG")
  })

  it("hidden columns are excluded", () => {
    render(<DataTable columns={[...columns, { key: "secret", label: "Secret", hidden: true }]} rows={rows} />)
    expect(screen.queryByRole("columnheader", { name: /Secret/ })).toBeNull()
  })
})

describe("DataTablePagination", () => {
  it("disables prev on page 1 and next without cursor", () => {
    render(<DataTablePagination page={1} hasNextPage={false} hasPreviousPage={false} />)
    expect(screen.getByTestId("pagination-page")).toHaveTextContent("Page 1")
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled()
  })

  it("emits page changes with direction", async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(<DataTablePagination page={2} hasNextPage hasPreviousPage onPageChange={onPageChange} />)
    await user.click(screen.getByRole("button", { name: "Next page" }))
    expect(onPageChange).toHaveBeenCalledWith(3, "next")
    await user.click(screen.getByRole("button", { name: "Previous page" }))
    expect(onPageChange).toHaveBeenCalledWith(1, "prev")
  })

  it("page size select emits onPageSizeChange", async () => {
    const user = userEvent.setup()
    const onPageSizeChange = vi.fn()
    render(
      <DataTablePagination
        page={1}
        hasNextPage={false}
        hasPreviousPage={false}
        pageSize={20}
        onPageSizeChange={onPageSizeChange}
      />,
    )
    await user.click(screen.getByRole("combobox", { name: "Rows per page" }))
    await user.click(screen.getByRole("option", { name: "50" }))
    expect(onPageSizeChange).toHaveBeenCalledWith(50)
  })
})

describe("Toolbar and filters", () => {
  it("toolbar search is controlled and reports changes", async () => {
    const user = userEvent.setup()
    const onSearchChange = vi.fn()
    render(
      <DataTableToolbar
        searchValue=""
        onSearchChange={onSearchChange}
        filters={[]}
      />,
    )
    await user.type(screen.getByRole("searchbox"), "ad")
    expect(onSearchChange).toHaveBeenLastCalledWith("d")
  })

  it("toolbar renders select, daterange, and numberrange filters from config", () => {
    render(
      <DataTableToolbar
        filters={[
          { key: "status", label: "Status", type: "select", options: [{ label: "Active", value: "active" }] },
          { key: "hired", label: "Hired", type: "daterange" },
          { key: "salary", label: "Salary", type: "numberrange" },
        ]}
      />,
    )
    expect(screen.getByTestId("faceted-filter")).toBeInTheDocument()
    expect(screen.getByTestId("daterange-filter")).toBeInTheDocument()
    expect(screen.getByTestId("numberrange-filter")).toBeInTheDocument()
  })

  it("toolbar actions slot renders on the right", () => {
    render(<DataTableToolbar actions={<button>New</button>} />)
    expect(screen.getByRole("button", { name: "New" })).toBeInTheDocument()
  })

  it("FacetedFilter toggles values and clears", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <FacetedFilter
        label="Status"
        options={[
          { label: "Active", value: "active", count: 2 },
          { label: "Leave", value: "leave", count: 1 },
        ]}
        onChange={onChange}
      />,
    )
    await user.click(screen.getByTestId("faceted-filter"))
    await user.click(screen.getByRole("menuitemcheckbox", { name: /Active/ }))
    expect(onChange).toHaveBeenCalledWith(["active"])
    await user.click(screen.getByRole("menuitemcheckbox", { name: /Leave/ }))
    expect(onChange).toHaveBeenLastCalledWith(["active", "leave"])
  })

  it("DateRangeFilter picks a range through the in-house picker", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<DateRangeFilter label="Hired" onChange={onChange} />)
    // the filter renders one DateRangePicker trigger; picking two days in the
    // current month commits from then to
    await user.click(screen.getByRole("combobox", { name: "Hired" }))
    await user.click(screen.getByRole("gridcell", { name: "2" }))
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ from: expect.stringMatching(/-02$/) }))
    await user.click(screen.getByRole("gridcell", { name: "10" }))
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ from: expect.stringMatching(/-02$/), to: expect.stringMatching(/-10$/) }))
  })

  it("filter width classes size the input and its wrapper together", () => {
    // the trigger icon anchors to the picker's wrapper; if a caller width
    // (w-64 here) only reaches the input, the icon detaches to the
    // wrapper's far edge
    render(<DateRangeFilter label="Hired" />)
    const input = document.querySelector(".prui-date-range-picker")
    expect(input).not.toBeNull()
    const wrapper = input!.parentElement
    expect(input!.className).toContain("w-64")
    expect(wrapper!.className).toContain("w-64")
  })

  it("NumberRangeFilter reports min/max", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<NumberRangeFilter label="Salary" onChange={onChange} />)
    await user.type(screen.getByLabelText("Salary min"), "10")
    expect(onChange).toHaveBeenLastCalledWith({ min: 10 })
  })
})
