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
    const rows = container.querySelectorAll(".prui-form-field > div")
    expect(rows.length).toBe(3)
    expect(rows[0].className).toContain("min-h-[1.25rem]")
    expect(rows[2].className).toContain("min-h-[1rem]")
    expect(rows[2].textContent).toBe("")
  })

  it("reserves the label row when only helperText is set", () => {
    const { container } = render(
      <FormField helperText="We never share it.">
        <Input />
      </FormField>,
    )
    const rows = container.querySelectorAll(".prui-form-field > div")
    expect(rows[0].textContent).toBe("")
    expect(rows[2].textContent).toContain("We never share it.")
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
    expect(container.querySelector(".prui-form-field > div:last-child")!.className).toContain("text-[var(--prui-danger)]")
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
  it("rows align items-end and range filters carry one group label", () => {
    const { container } = render(
      <DataTableToolbar
        filters={[
          { key: "team", label: "Team", type: "select", options: [{ label: "Core", value: "core" }] },
          { key: "hired", label: "Hired", type: "daterange" },
          { key: "salary", label: "Salary", type: "numberrange" },
        ]}
      />,
    )
    const bar = container.querySelector(".prui-toolbar")
    expect(bar!.className).toContain("items-end")
    // every filter is one FormField: a single group label above the control
    const fields = bar!.querySelectorAll(".prui-form-field")
    expect(fields.length).toBe(3)
    expect(screen.getByText("Hired")).toBeInTheDocument()
    expect(screen.getByText("Salary")).toBeInTheDocument()
    // range children carry compact sub-labels, not stacked label rows
    expect(screen.getByText("from")).toBeInTheDocument()
    expect(screen.getByText("min")).toBeInTheDocument()
    expect(screen.queryByText("Hired from")).toBeNull()
  })
})
