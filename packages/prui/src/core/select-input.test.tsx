import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Select } from "./select"
import { Input, Textarea } from "./input"
import { Search, X } from "lucide-react"

afterEach(() => {
  cleanup()
  document.body.innerHTML = ""
})

describe("Input icons", () => {
  it("renders leading and trailing icons with adjusted padding", () => {
    const { container } = render(
      <Input icon={<Search />} trailingIcon={<X />} aria-label="Search" />,
    )
    const input = screen.getByLabelText("Search")
    expect(input.className).toContain("pl-9")
    expect(input.className).toContain("pr-9")
    // icons live inside the wrapper, aria-hidden, not intercepting clicks
    const wrapper = container.querySelector("span.relative")
    expect(wrapper).not.toBeNull()
    expect(wrapper!.querySelectorAll("[aria-hidden='true']").length).toBeGreaterThanOrEqual(2)
  })

  it("without icons the input renders bare (no wrapper)", () => {
    const { container } = render(<Input aria-label="Plain" />)
    expect(container.querySelector("span.relative")).toBeNull()
    expect(screen.getByLabelText("Plain").className).not.toContain("pl-9")
  })
})

describe("Textarea padding", () => {
  it("has horizontal padding (px-3) alongside the vertical", () => {
    render(<Textarea aria-label="Notes" data-testid="ta" />)
    const cls = screen.getByTestId("ta").className
    expect(cls).toContain("px-3")
    expect(cls).toContain("py-2")
  })
})

describe("Input password toggle", () => {
  it("type=password renders an eye toggle that reveals and re-masks", async () => {
    const user = userEvent.setup()
    render(<Input type="password" defaultValue="hunter2" aria-label="Password" />)
    const input = screen.getByLabelText("Password") as HTMLInputElement
    expect(input.type).toBe("password")
    const eye = screen.getByRole("button", { name: "Show password" })
    expect(input.className).toContain("pr-9")
    await user.click(eye)
    expect(input.type).toBe("text")
    expect(screen.getByRole("button", { name: "Hide password" })).toHaveAttribute("aria-pressed", "true")
    await user.click(screen.getByRole("button", { name: "Hide password" }))
    expect(input.type).toBe("password")
  })

  it("passwordToggle={false} and custom trailingIcon suppress the eye", () => {
    const { rerender } = render(<Input type="password" passwordToggle={false} aria-label="Pw" />)
    expect(screen.queryByRole("button", { name: /password/i })).toBeNull()
    rerender(<Input type="password" trailingIcon={<X />} aria-label="Pw" />)
    expect(screen.queryByRole("button", { name: /password/i })).toBeNull()
  })

  it("the eye is disabled with the field", () => {
    render(<Input type="password" disabled aria-label="Locked" />)
    expect(screen.getByRole("button", { name: "Show password" })).toBeDisabled()
  })

  it("toggling never steals the caret from the field", async () => {
    const user = userEvent.setup()
    render(<Input type="password" defaultValue="s3cret" aria-label="Focus test" />)
    const input = screen.getByLabelText("Focus test")
    await user.click(input)
    await user.click(screen.getByRole("button", { name: "Show password" }))
    // mousedown is prevented: focus stays in the field while typing continues
    expect(input).toHaveFocus()
    await user.keyboard("x")
    expect((input as HTMLInputElement).value).toBe("s3cretx")
  })
})

const fruits = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Blueberry", value: "blueberry" },
  { label: "Cherry", value: "cherry" },
]

describe("Select: searchable", () => {
  it("typing in the filter narrows the options", async () => {
    const user = userEvent.setup()
    render(<Select options={fruits} searchable aria-label="Fruit" />)
    await user.click(screen.getByRole("combobox", { name: "Fruit" }))
    // focus lands in the search input
    expect(screen.getByRole("searchbox", { name: "Search" })).toHaveFocus()
    await user.type(screen.getByRole("searchbox", { name: "Search" }), "bl")
    expect(screen.getByRole("option", { name: "Blueberry" })).toBeInTheDocument()
    expect(screen.queryByRole("option", { name: "Apple" })).toBeNull()
    expect(screen.queryByRole("option", { name: "Cherry" })).toBeNull()
  })

  it("Enter in the search picks the first visible match and commits it", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Select options={fruits} searchable onChange={onChange} aria-label="Fruit" />)
    await user.click(screen.getByRole("combobox", { name: "Fruit" }))
    await user.type(screen.getByRole("searchbox", { name: "Search" }), "ban")
    await user.keyboard("{Enter}")
    expect(onChange).toHaveBeenCalledWith("banana")
    expect(screen.getByRole("combobox", { name: "Fruit" })).toHaveTextContent("Banana")
  })

  it("shows the no-results row when nothing matches", async () => {
    const user = userEvent.setup()
    render(<Select options={fruits} searchable aria-label="Fruit" />)
    await user.click(screen.getByRole("combobox", { name: "Fruit" }))
    await user.type(screen.getByRole("searchbox", { name: "Search" }), "zzz")
    expect(screen.getByText("No results.")).toBeInTheDocument()
  })

  it("ArrowDown moves focus from the search into the options", async () => {
    const user = userEvent.setup()
    render(<Select options={fruits} searchable aria-label="Fruit" />)
    await user.click(screen.getByRole("combobox", { name: "Fruit" }))
    await user.keyboard("{ArrowDown}")
    expect(screen.getByRole("option", { name: "Apple" })).toHaveFocus()
  })
})

describe("Select: multiple", () => {
  it("toggles items without closing and reports arrays", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Select options={fruits} multiple onChange={onChange} aria-label="Fruits" />)
    await user.click(screen.getByRole("combobox", { name: "Fruits" }))
    await user.click(screen.getByRole("option", { name: "Apple" }))
    expect(onChange).toHaveBeenCalledWith(["apple"])
    // still open for the next pick
    expect(screen.getByRole("listbox")).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Apple" }).getAttribute("aria-selected")).toBe("true")
    await user.click(screen.getByRole("option", { name: "Cherry" }))
    expect(onChange).toHaveBeenLastCalledWith(["apple", "cherry"])
    // trigger shows first label + count
    expect(screen.getByRole("combobox", { name: "Fruits" })).toHaveTextContent("Apple")
    expect(screen.getByRole("combobox", { name: "Fruits" })).toHaveTextContent("+1")
    // deselect
    await user.click(screen.getByRole("option", { name: "Apple" }))
    expect(onChange).toHaveBeenLastCalledWith(["cherry"])
  })

  it("works searchable + multiple together", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Select options={fruits} multiple searchable onChange={onChange} aria-label="Fruits" />)
    await user.click(screen.getByRole("combobox", { name: "Fruits" }))
    const search = screen.getByRole("searchbox", { name: "Search" })
    await user.type(search, "b")
    await user.click(screen.getByRole("option", { name: "Banana" }))
    await user.click(screen.getByRole("option", { name: "Blueberry" }))
    expect(onChange).toHaveBeenLastCalledWith(["banana", "blueberry"])
  })

  it("controlled string[] selection renders selected items", () => {
    render(<Select options={fruits} multiple value={["banana", "cherry"]} aria-label="Fruits" />)
    const trigger = screen.getByRole("combobox", { name: "Fruits" })
    expect(trigger).toHaveTextContent("Banana")
    expect(trigger).toHaveTextContent("+1")
  })

  it("Enter on a focused option toggles without closing", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Select options={fruits} multiple onChange={onChange} aria-label="Fruits" />)
    await user.click(screen.getByRole("combobox", { name: "Fruits" }))
    await user.keyboard("{ArrowDown}")
    await user.keyboard("{Enter}")
    expect(onChange).toHaveBeenCalledWith(["banana"])
    expect(screen.getByRole("listbox")).toBeInTheDocument()
  })
})
