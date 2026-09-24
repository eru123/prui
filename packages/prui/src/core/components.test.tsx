describe("Combobox select-or-create (allowCreate)", () => {
  const options = [
    { label: "mlbb", value: "mlbb" },
    { label: "hoyo", value: "hoyo" },
  ]

  it("typing a non-match shows a create row; Enter commits the typed value", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Combobox options={options} allowCreate onChange={onChange} aria-label="Category" />)
    const input = screen.getByRole("combobox", { name: "Category" })
    await user.click(input)
    await user.type(input, "my-new-cat")
    const create = await screen.findByTestId("combobox-create")
    expect(create).toHaveTextContent('Create "my-new-cat"')
    await user.type(input, "{Enter}")
    expect(onChange).toHaveBeenLastCalledWith("my-new-cat")
    // the field keeps the free-typed value after the listbox closes
    expect(input).toHaveValue("my-new-cat")
    expect(screen.queryByRole("listbox")).toBeNull()
  })

  it("picking an existing option still fires onChange with its value", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Combobox options={options} allowCreate onChange={onChange} aria-label="Category" />)
    const input = screen.getByRole("combobox", { name: "Category" })
    await user.click(input)
    await user.click(screen.getByRole("option", { name: "hoyo" }))
    expect(onChange).toHaveBeenLastCalledWith("hoyo")
  })

  it("Tab commits the typed free text like a native datalist input", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Combobox options={options} allowCreate onChange={onChange} aria-label="Category" />)
    const input = screen.getByRole("combobox", { name: "Category" })
    await user.click(input)
    await user.type(input, "riot")
    await user.tab()
    expect(onChange).toHaveBeenLastCalledWith("riot")
    expect(input).toHaveValue("riot")
  })

  it("without allowCreate there is no create row and typed text stays a filter", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Combobox options={options} onChange={onChange} aria-label="Category" />)
    const input = screen.getByRole("combobox", { name: "Category" })
    await user.click(input)
    await user.type(input, "my-new-cat")
    expect(screen.queryByTestId("combobox-create")).toBeNull()
    await user.tab()
    expect(onChange).not.toHaveBeenCalled()
  })

  it("an exact option match never offers to create it", async () => {
    const user = userEvent.setup()
    render(<Combobox options={options} allowCreate onChange={vi.fn()} aria-label="Category" />)
    const input = screen.getByRole("combobox", { name: "Category" })
    await user.click(input)
    await user.type(input, "MLBB")
    expect(screen.queryByTestId("combobox-create")).toBeNull()
    expect(screen.getByRole("option", { name: "mlbb" })).toBeInTheDocument()
  })

  it("keyboard highlight moves onto the options past the create row", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Combobox options={options} allowCreate onChange={onChange} aria-label="Category" />)
    const input = screen.getByRole("combobox", { name: "Category" })
    await user.click(input)
    await user.type(input, "h") // filters to hoyo; index 0 is the create row
    expect(screen.getByTestId("combobox-create")).toHaveAttribute("data-active")
    await user.keyboard("{ArrowDown}") // onto hoyo
    expect(screen.getByRole("option", { name: "hoyo" }).className).toContain("bg-raise")
    expect(screen.getByTestId("combobox-create")).not.toHaveAttribute("data-active")
    await user.keyboard("{Enter}")
    expect(onChange).toHaveBeenLastCalledWith("hoyo")
  })

  it("aria-activedescendant tracks the create row, then the options", async () => {
    const user = userEvent.setup()
    render(<Combobox options={options} allowCreate onChange={vi.fn()} aria-label="Category" />)
    const input = screen.getByRole("combobox", { name: "Category" })
    await user.click(input)
    await user.type(input, "h")
    const listboxId = input.getAttribute("aria-controls")!
    expect(input).toHaveAttribute("aria-activedescendant", `${listboxId}-option-create`)
    await user.keyboard("{ArrowDown}")
    expect(input).toHaveAttribute("aria-activedescendant", `${listboxId}-option-1`)
  })
})

describe("Floating surfaces layer above Modal (--prui-z-floating)", () => {
  // every portaled surface must reference the floating layer token, so it
  // clears Modal (10000) and Confirm (10010) instead of the old overlay (50)
  const floating = (selector: string) =>
    expect(document.querySelector(selector)!.className).toContain("z-[var(--prui-z-floating)]")

  it("combobox listbox", async () => {
    const user = userEvent.setup()
    render(<Combobox options={[{ label: "A", value: "a" }]} aria-label="Cat" />)
    await user.click(screen.getByRole("combobox", { name: "Cat" }))
    floating(".prui-combobox-content")
  })

  it("select listbox", async () => {
    const user = userEvent.setup()
    render(<Select options={[{ label: "A", value: "a" }]} aria-label="Pick" />)
    await user.click(screen.getByRole("combobox", { name: "Pick" }))
    floating(".prui-select-content")
  })

  it("popover panel", async () => {
    const user = userEvent.setup()
    render(
      <Popover ariaLabel="Filters" trigger={<button>Filter</button>}>
        Body
      </Popover>,
    )
    await user.click(screen.getByRole("button", { name: "Filter" }))
    floating(".prui-popover")
  })

  it("tooltip", async () => {
    const user = userEvent.setup()
    render(
      <Tooltip content="Save the document">
        <button>Save</button>
      </Tooltip>,
    )
    await user.hover(screen.getByRole("button", { name: "Save" }))
    await screen.findByRole("tooltip")
    floating(".prui-tooltip")
  })

  it("dropdown menu", async () => {
    const user = userEvent.setup()
    render(<Dropdown trigger={<button>Actions</button>} items={[{ label: "A", onSelect: vi.fn() }]} />)
    await user.click(screen.getByRole("button", { name: "Actions" }))
    floating(".prui-dropdown-menu")
  })
})

import * as React from "react"
import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, cleanup, act, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Spinner } from "./spinner"
import { Skeleton } from "./skeleton"
import { Alert } from "./alert"
import { Progress } from "./progress"
import { Toaster, toast, dismissAllToasts } from "./toast"
import { Tooltip } from "./tooltip"
import { Popover } from "./popover"
import { Dropdown } from "./dropdown"
import { Select } from "./select"
import { Checkbox } from "./checkbox"
import { RadioGroup, Radio } from "./radio"
import { Combobox } from "./combobox"

afterEach(() => {
  cleanup()
  dismissAllToasts()
  document.body.innerHTML = ""
})

describe("Spinner / Skeleton / Alert / Progress", () => {
  it("Spinner exposes role=status with a label", () => {
    render(<Spinner label="Loading results" />)
    expect(screen.getByRole("status", { name: "Loading results" })).toBeInTheDocument()
  })

  it("Skeleton renders multiple text lines and stays aria-hidden", () => {
    const { container } = render(<Skeleton variant="text" lines={3} />)
    const skeletons = container.querySelectorAll(".prui-skeleton")
    expect(skeletons.length).toBe(3)
    expect(skeletons[0]!.getAttribute("aria-hidden")).toBe("true")
  })

  it("Alert uses role=alert for danger and status otherwise; dismiss fires", async () => {
    const user = userEvent.setup()
    const onDismiss = vi.fn()
    const { rerender } = render(<Alert variant="info">Saved</Alert>)
    expect(screen.getByRole("status")).toBeInTheDocument()
    rerender(
      <Alert variant="danger" title="Failed" onDismiss={onDismiss}>
        Everything broke
      </Alert>,
    )
    expect(screen.getByRole("alert")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Dismiss" }))
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it("Progress exposes the aria value triple and indeterminate mode", () => {
    const { rerender } = render(<Progress value={40} min={0} max={200} aria-label="Upload" />)
    const bar = screen.getByRole("progressbar", { name: "Upload" })
    expect(bar).toHaveAttribute("aria-valuenow", "40")
    expect(bar).toHaveAttribute("aria-valuemin", "0")
    expect(bar).toHaveAttribute("aria-valuemax", "200")
    rerender(<Progress aria-label="Upload" />)
    expect(bar).toHaveAttribute("data-state", "indeterminate")
  })
})

describe("Toast", () => {
  it("toast() renders into a Toaster live region and auto-dismisses", async () => {
    vi.useFakeTimers()
    render(<Toaster />)
    act(() => {
      toast({ title: "Saved", description: "Your changes are live", variant: "success", duration: 1000 })
    })
    expect(screen.getByTestId("toast")).toHaveTextContent("Saved")
    expect(screen.getByText("Your changes are live")).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(1100)
    })
    expect(screen.queryByTestId("toast")).toBeNull()
    vi.useRealTimers()
  })

  it("the dismiss handle removes the toast early and fires onDismiss", () => {
    const onDismiss = vi.fn()
    render(<Toaster />)
    let handle: ReturnType<typeof toast> | undefined
    act(() => {
      handle = toast({ title: "Bye", duration: 0, onDismiss })
    })
    expect(screen.getByTestId("toast")).toHaveTextContent("Bye")
    act(() => handle!.dismiss())
    expect(onDismiss).toHaveBeenCalledOnce()
    expect(screen.queryByTestId("toast")).toBeNull()
  })
})

describe("Tooltip", () => {
  it("shows on hover and hides on unhover", async () => {
    const user = userEvent.setup()
    render(
      <Tooltip content="Save the document">
        <button>Save</button>
      </Tooltip>,
    )
    expect(screen.queryByRole("tooltip")).toBeNull()
    await user.hover(screen.getByRole("button", { name: "Save" }))
    await waitFor(() => expect(screen.getByRole("tooltip")).toHaveTextContent("Save the document"))
    await user.unhover(screen.getByRole("button", { name: "Save" }))
    expect(screen.queryByRole("tooltip")).toBeNull()
  })

  it("shows on keyboard focus and Escape hides it", async () => {
    const user = userEvent.setup()
    render(
      <Tooltip content="Keyboard tip">
        <button>Focused</button>
      </Tooltip>,
    )
    await user.tab()
    await waitFor(() => expect(screen.getByRole("tooltip")).toHaveTextContent("Keyboard tip"))
    await user.keyboard("{Escape}")
    expect(screen.queryByRole("tooltip")).toBeNull()
  })
})

describe("Popover", () => {
  it("toggles on trigger click, closes on Escape and restores focus", async () => {
    const user = userEvent.setup()
    render(
      <Popover ariaLabel="Filters" trigger={<button>Filter</button>}>
        <button>Reset filters</button>
      </Popover>,
    )
    const trigger = screen.getByRole("button", { name: "Filter" })
    await user.click(trigger)
    const panel = screen.getByRole("dialog", { name: "Filters" })
    expect(panel).toBeInTheDocument()
    expect(document.body.contains(panel)).toBe(true)
    // initial focus moved inside the panel
    expect(screen.getByRole("button", { name: "Reset filters" })).toHaveFocus()
    await user.keyboard("{Escape}")
    expect(screen.queryByRole("dialog")).toBeNull()
    expect(trigger).toHaveFocus()
  })

  it("supports controlled open state", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const { rerender } = render(
      <Popover open={false} onOpenChange={onOpenChange} trigger={<button>T</button>}>
        Body
      </Popover>,
    )
    await user.click(screen.getByRole("button", { name: "T" }))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    rerender(
      <Popover open onOpenChange={onOpenChange} trigger={<button>T</button>}>
        Body
      </Popover>,
    )
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })
})

describe("Checkbox", () => {
  it("toggles with click and Space, reports onChange", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Checkbox aria-label="Subscribe" onChange={onChange} />)
    const box = screen.getByRole("checkbox", { name: "Subscribe" })
    expect(box).toHaveAttribute("aria-checked", "false")
    await user.click(box)
    expect(onChange).toHaveBeenCalledWith(true, expect.anything())
    expect(box).toHaveAttribute("aria-checked", "true")
    await user.keyboard(" ")
    expect(onChange).toHaveBeenLastCalledWith(false, expect.anything())
  })

  it("indeterminate renders aria-checked=mixed and clicking checks", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Checkbox aria-label="All" indeterminate onChange={onChange} />)
    const box = screen.getByRole("checkbox", { name: "All" })
    expect(box).toHaveAttribute("aria-checked", "mixed")
    await user.click(box)
    expect(onChange).toHaveBeenCalledWith(true, expect.anything())
  })
})

describe("RadioGroup", () => {
  function Group(props: Partial<React.ComponentProps<typeof RadioGroup>> = {}) {
    return (
      <RadioGroup label="Plan" {...props}>
        <Radio value="free" label="Free" />
        <Radio value="pro" label="Pro" />
        <Radio value="enterprise" label="Enterprise" />
      </RadioGroup>
    )
  }

  it("arrow keys move and activate; selection is exclusive", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Group onChange={onChange} />)
    const free = screen.getByRole("radio", { name: "Free" })
    expect(free).toHaveAttribute("tabindex", "0") // first is tabbable when none checked
    free.focus()
    await user.keyboard("{ArrowDown}")
    expect(screen.getByRole("radio", { name: "Pro" })).toHaveFocus()
    expect(onChange).toHaveBeenCalledWith("pro")
    expect(screen.getByRole("radio", { name: "Pro" })).toHaveAttribute("aria-checked", "true")
    await user.keyboard("{ArrowDown}")
    expect(screen.getByRole("radio", { name: "Enterprise" })).toHaveAttribute("aria-checked", "true")
    expect(screen.getByRole("radio", { name: "Pro" })).toHaveAttribute("aria-checked", "false")
  })

  it("Home and End jump to first and last radio", async () => {
    const user = userEvent.setup()
    render(<Group defaultValue="pro" />)
    screen.getByRole("radio", { name: "Pro" }).focus()
    await user.keyboard("{End}")
    expect(screen.getByRole("radio", { name: "Enterprise" })).toHaveAttribute("aria-checked", "true")
    await user.keyboard("{Home}")
    expect(screen.getByRole("radio", { name: "Free" })).toHaveAttribute("aria-checked", "true")
  })
})

describe("Combobox", () => {
  const options = [
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
    { label: "Blueberry", value: "blueberry" },
    { label: "Cherry", value: "cherry", disabled: true },
  ]

  it("filters as you type and picks with Enter", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Combobox options={options} onChange={onChange} aria-label="Fruit" />)
    const input = screen.getByRole("combobox", { name: "Fruit" })
    await user.click(input)
    expect(screen.getByRole("listbox")).toBeInTheDocument()
    await user.type(input, "bl")
    expect(screen.getByRole("option", { name: "Blueberry" })).toBeInTheDocument()
    expect(screen.queryByRole("option", { name: "Apple" })).toBeNull()
    await user.keyboard("{ArrowDown}")
    await user.keyboard("{Enter}")
    expect(onChange).toHaveBeenCalledWith("blueberry")
    expect(screen.queryByRole("listbox")).toBeNull()
    expect(input).toHaveValue("Blueberry")
  })

  it("Escape closes and refocuses the input; disabled options are skipped", async () => {
    const user = userEvent.setup()
    render(<Combobox options={options} aria-label="Fruit" />)
    const input = screen.getByRole("combobox", { name: "Fruit" })
    await user.click(input)
    await user.type(input, "b")
    // active is Banana; End jumps to the last enabled (Blueberry), skipping Cherry
    await user.keyboard("{End}")
    expect(screen.getByRole("option", { name: "Blueberry" }).getAttribute("data-active")).toBe("true")
    await user.keyboard("{Escape}")
    expect(screen.queryByRole("listbox")).toBeNull()
    expect(input).toHaveFocus()
  })
})
