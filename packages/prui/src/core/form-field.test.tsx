import { describe, it, expect, afterEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import { FormField } from "./form-field"
import { Input, InputGroup, Select } from "./index"
import { DataTableToolbar } from "../data-table/index"

afterEach(() => {
  cleanup()
  document.body.innerHTML = ""
})

describe("FormField slots", () => {
  it("reserves the helper row when only a label is set", () => {
    const { container } = render(
      <FormField label="Email">
        <Input />
      </FormField>,
    )
    const rows = [...container.querySelectorAll(".prui-form-field > div")]
    const [labelRow, , helperRow] = rows
    expect(rows.length).toBe(3)
    expect(labelRow?.className).toContain("min-h-5")
    expect(helperRow?.className).toContain("min-h-4")
    expect(helperRow?.textContent).toBe("")
  })

  it("reserves the label row when only helperText is set", () => {
    const { container } = render(
      <FormField helperText="We never share it.">
        <Input />
      </FormField>,
    )
    const rows = [...container.querySelectorAll(".prui-form-field > div")]
    const [labelRow, , helperRow] = rows
    expect(labelRow?.textContent).toBe("")
    expect(helperRow?.textContent).toContain("We never share it.")
  })

  it("inline drops both slot rows", () => {
    const { container } = render(
      <FormField inline label="Hidden">
        <Input />
      </FormField>,
    )
    expect(container.querySelector(".prui-form-field-inline")).not.toBeNull()
    expect(container.querySelectorAll(".prui-form-field > div").length).toBe(0)
  })

  it("error renders the helper in danger color", () => {
    const { container } = render(
      <FormField helperText="Required" error>
        <Input />
      </FormField>,
    )
    expect(container.querySelector(".prui-form-field > div:last-child")!.className).toContain("text-danger")
  })
})

describe("Controls on the slot system", () => {
  it("Input with a label wraps in FormField and associates the id", () => {
    const { container } = render(<Input label="Full name" placeholder="Ada" />)
    const field = container.querySelector(".prui-form-field")
    expect(field).not.toBeNull()
    const label = screen.getByText("Full name")
    const input = screen.getByPlaceholderText("Ada")
    expect(label.getAttribute("for")).toBe(input.id)
  })

  it("bare Input renders without the wrapper (existing layouts unchanged)", () => {
    const { container } = render(<Input placeholder="Plain" />)
    expect(container.querySelector(".prui-form-field")).toBeNull()
  })

  it("helperText alone still wraps and lands under the control", () => {
    render(<Input helperText="6+ characters" placeholder="Password" />)
    expect(screen.getByText("6+ characters")).toBeInTheDocument()
  })

  it("Select with a label names its trigger through the slots", () => {
    const { container } = render(
      <Select label="Team" options={[{ label: "Core", value: "core" }]} />,
    )
    expect(container.querySelector(".prui-form-field")).not.toBeNull()
    const trigger = screen.getByRole("combobox")
    expect(screen.getByText("Team").getAttribute("for")).toBe(trigger.id)
  })

  it("InputGroup renders addons and composes with the slots", () => {
    const { container } = render(
      <InputGroup label="Price" leading="$" trailing=".00" placeholder="0" />,
    )
    expect(container.querySelector(".prui-form-field")).not.toBeNull()
    expect(screen.getByText("$")).toBeInTheDocument()
    expect(screen.getByText(".00")).toBeInTheDocument()
    const input = screen.getByPlaceholderText("0")
    expect(input.className).toContain("pl-9")
    expect(input.className).toContain("pr-12")
  })
})

describe("Toolbar baseline alignment", () => {
  it("search, filters, and actions share one aligned field grid", () => {
    const { container } = render(
      <DataTableToolbar
        actions={<button type="button">New</button>}
        filters={[
          { key: "team", label: "Team", type: "select", options: [{ label: "Core", value: "core" }] },
          { key: "hired", label: "Hired", type: "daterange" },
          { key: "salary", label: "Salary", type: "numberrange" },
        ]}
      />,
    )
    const bar = container.querySelector(".prui-toolbar")
    expect(bar!.className).toContain("items-start")
    // search, every filter, and the actions cluster are each one FormField,
    // so all of them share the label-row + control-row grid
    const fields = bar!.querySelectorAll(".prui-form-field")
    expect(fields.length).toBe(5)
    expect(screen.getByLabelText("Search")).toBeInTheDocument()
    expect(screen.getByText("Hired")).toBeInTheDocument()
    expect(screen.getByText("Salary")).toBeInTheDocument()
    // the daterange filter is ONE in-house DateRangePicker trigger
    expect(screen.getByRole("combobox", { name: "Hired" })).toBeInTheDocument()
    expect(screen.queryByText("from")).toBeNull()
    // numberrange children still carry compact sub-labels
    expect(screen.getByText("min")).toBeInTheDocument()
    expect(screen.queryByText("Hired from")).toBeNull()
    // the actions land inside the last FormField's control row
    expect(fields[fields.length - 1]?.querySelector("button")?.textContent).toBe("New")
  })
})

describe("Input validation state", () => {
  it("error renders the danger border and focus ring", () => {
    render(<Input error aria-label="Bad" />)
    const input = screen.getByLabelText("Bad")
    expect(input.className).toContain("border-danger")
    expect(input.className).toContain("focus:ring-danger/30")
  })
})
