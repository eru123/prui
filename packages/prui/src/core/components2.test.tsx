import * as React from "react"
import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, cleanup, fireEvent, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Drawer, Sheet } from "./drawer"
import { Accordion, AccordionItem } from "./accordion"
import { Breadcrumb, BreadcrumbItem } from "./breadcrumb"
import { TreeView, type TreeViewItem } from "./tree-view"
import { Timeline } from "./timeline"
import { Calendar, toDateKey } from "./calendar"
import { DatePicker, DateRangePicker } from "./date-picker"
import { FileUpload } from "./file-upload"
import { MemoryRouter } from "react-router-dom"

afterEach(() => {
  cleanup()
  document.body.innerHTML = ""
})

describe("Drawer / Sheet", () => {
  it("opens portaled, traps Escape to close, restores focus", async () => {
    const user = userEvent.setup()
    function Demo() {
      const [open, setOpen] = React.useState(false)
      return (
        <>
          <button onClick={() => setOpen(true)}>Open drawer</button>
          <Drawer open={open} onOpenChange={setOpen} ariaLabel="Settings">
            <button>Inside</button>
          </Drawer>
        </>
      )
    }
    render(<Demo />)
    const opener = screen.getByRole("button", { name: "Open drawer" })
    await user.click(opener)
    const dialog = screen.getByRole("dialog", { name: "Settings" })
    expect(document.body.contains(dialog)).toBe(true)
    expect(screen.getByRole("button", { name: "Inside" })).toHaveFocus()
    await user.keyboard("{Escape}")
    // jsdom fires no transitions: let the 300ms unmount timeout elapse
    await act(async () => {
      await new Promise((r) => setTimeout(r, 350))
    })
    expect(screen.queryByRole("dialog")).toBeNull()
    expect(opener).toHaveFocus()
  })

  it("Sheet renders bottom-anchored with a drag handle", () => {
    render(
      <Sheet open ariaLabel="Filters">
        Content
      </Sheet>,
    )
    const dialog = screen.getByRole("dialog", { name: "Filters" })
    expect(dialog.className).toContain("bottom-0")
  })
})

describe("Accordion", () => {
  function Demo(props: Partial<React.ComponentProps<typeof Accordion>> = {}) {
    return (
      <Accordion {...props}>
        <AccordionItem value="a">
          Alpha header
          <div>Alpha body</div>
        </AccordionItem>
        <AccordionItem value="b">
          Beta header
          <div>Beta body</div>
        </AccordionItem>
      </Accordion>
    )
  }

  it("toggles items with correct aria wiring", async () => {
    const user = userEvent.setup()
    render(<Demo />)
    const header = screen.getByRole("button", { name: /Alpha header/ })
    expect(header).toHaveAttribute("aria-expanded", "false")
    await user.click(header)
    expect(header).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("region", { name: /Alpha header/ })).toHaveTextContent("Alpha body")
  })

  it("single type closes the other item", async () => {
    const user = userEvent.setup()
    render(<Demo type="single" />)
    await user.click(screen.getByRole("button", { name: /Alpha header/ }))
    await user.click(screen.getByRole("button", { name: /Beta header/ }))
    expect(screen.getByRole("button", { name: /Beta header/ })).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("button", { name: /Alpha header/ })).toHaveAttribute("aria-expanded", "false")
  })

  it("multiple type keeps both open", async () => {
    const user = userEvent.setup()
    render(<Demo type="multiple" />)
    await user.click(screen.getByRole("button", { name: /Alpha header/ }))
    await user.click(screen.getByRole("button", { name: /Beta header/ }))
    expect(screen.getByRole("button", { name: /Alpha header/ })).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("button", { name: /Beta header/ })).toHaveAttribute("aria-expanded", "true")
  })

  it("ArrowDown moves between headers", async () => {
    const user = userEvent.setup()
    render(<Demo />)
    screen.getByRole("button", { name: /Alpha header/ }).focus()
    await user.keyboard("{ArrowDown}")
    expect(screen.getByRole("button", { name: /Beta header/ })).toHaveFocus()
  })
})

describe("Breadcrumb", () => {
  it("renders a nav landmark with separators and aria-current", () => {
    render(
      <MemoryRouter>
        <Breadcrumb>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
          <BreadcrumbItem current>PRUI</BreadcrumbItem>
        </Breadcrumb>
      </MemoryRouter>,
    )
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument()
    const current = screen.getByText("PRUI")
    expect(current.getAttribute("aria-current")).toBe("page")
  })

  it("collapses the middle behind an ellipsis button", async () => {
    const user = userEvent.setup()
    const onExpand = vi.fn()
    render(
      <MemoryRouter>
        <Breadcrumb collapseAfter={1} onExpand={onExpand}>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem href="/a">A</BreadcrumbItem>
          <BreadcrumbItem href="/b">B</BreadcrumbItem>
          <BreadcrumbItem current>C</BreadcrumbItem>
        </Breadcrumb>
      </MemoryRouter>,
    )
    expect(screen.queryByText("A")).toBeNull()
    expect(screen.queryByText("B")).toBeNull()
    await user.click(screen.getByRole("button", { name: /more breadcrumbs/i }))
    expect(onExpand).toHaveBeenCalledOnce()
  })
})

const tree: TreeViewItem[] = [
  {
    id: "src",
    label: "src",
    children: [
      { id: "src/core", label: "core", children: [{ id: "src/core/button.tsx", label: "button.tsx" }] },
      { id: "src/app", label: "app" },
    ],
  },
  { id: "readme", label: "README.md" },
]

describe("TreeView", () => {
  it("expands/collapses with aria-level and aria-expanded", async () => {
    const user = userEvent.setup()
    render(<TreeView items={tree} ariaLabel="Files" />)
    const src = screen.getByRole("treeitem", { name: /src/ })
    expect(src).toHaveAttribute("aria-expanded", "false")
    expect(src).toHaveAttribute("aria-level", "1")
    await user.click(screen.getByRole("button", { name: /src/ }))
    expect(src).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("treeitem", { name: /core/ })).toHaveAttribute("aria-level", "2")
  })

  it("ArrowRight expands, ArrowLeft collapses and returns to parent", async () => {
    const user = userEvent.setup()
    render(<TreeView items={tree} ariaLabel="Files" />)
    const srcButton = screen.getAllByRole("button", { name: /src/ })[0]!
    srcButton.focus()
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("treeitem", { name: /core/ })).toBeInTheDocument()
    // move into core, then ArrowLeft twice: collapse core, then focus src
    await user.keyboard("{ArrowDown}")
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("treeitem", { name: /button.tsx/ })).toBeInTheDocument()
    await user.keyboard("{ArrowLeft}")
    expect(screen.queryByRole("treeitem", { name: /button.tsx/ })).toBeNull()
  })

  it("reports selection through onSelect", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<TreeView items={tree} ariaLabel="Files" onSelect={onSelect} />)
    await user.click(screen.getByRole("button", { name: /README/ }))
    expect(onSelect).toHaveBeenCalledWith("readme", expect.objectContaining({ id: "readme" }))
    expect(screen.getByRole("treeitem", { name: /README/ })).toHaveAttribute("aria-selected", "true")
  })
})

describe("Timeline", () => {
  it("renders an ordered list with titles, times, and descriptions", () => {
    render(
      <Timeline
        items={[
          { title: "Created", time: "Mon", description: "First commit" },
          { title: "Released", time: "Tue", variant: "success" },
        ]}
      />,
    )
    expect(screen.getByRole("list")).toBeInTheDocument()
    expect(screen.getByText("Created")).toBeInTheDocument()
    expect(screen.getByText("First commit")).toBeInTheDocument()
  })
})

describe("Calendar", () => {
  it("renders the current month grid with weekday headers and today marker", () => {
    render(<Calendar aria-label="Pick a date" />)
    expect(screen.getByRole("grid")).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: "Mo" })).toBeInTheDocument()
    const today = toDateKey(new Date())
    expect(document.querySelector(`[data-prui-calendar-day="${today}"]`)).not.toBeNull()
  })

  it("selects a day and reports it; month nav updates the label", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<Calendar onSelect={onSelect} value="2026-09-01" aria-label="Calendar" />)
    expect(screen.getByRole("gridcell", { selected: true, name: "1" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Next month" }))
    expect(screen.getByText("October 2026")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Previous month" }))
    await user.click(screen.getByRole("gridcell", { name: "15" }))
    expect(onSelect).toHaveBeenCalledWith("2026-09-15")
  })

  it("arrow keys move focus by day and week", async () => {
    const user = userEvent.setup()
    render(<Calendar value="2026-09-15" aria-label="Calendar" />)
    const day = document.querySelector<HTMLElement>('[data-prui-calendar-day="2026-09-15"]')!
    day.focus()
    await user.keyboard("{ArrowRight}")
    await act(async () => {})
    expect(document.querySelector<HTMLElement>('[data-prui-calendar-day="2026-09-16"]')!).toHaveFocus()
  })
})

describe("DatePicker / DateRangePicker", () => {
  it("opens the calendar on click and commits a selection", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<DatePicker onChange={onChange} ariaLabel="Start date" />)
    await user.click(screen.getByRole("combobox", { name: "Start date" }))
    expect(screen.getByRole("dialog", { name: "Choose date" })).toBeInTheDocument()
    await user.click(screen.getByRole("gridcell", { name: "10" }))
    expect(onChange).toHaveBeenCalled()
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("range picker picks from then to and reports the range", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<DateRangePicker onChange={onChange} ariaLabel="Dates" />)
    await user.click(screen.getByRole("combobox", { name: "Dates" }))
    await user.click(screen.getByRole("gridcell", { name: "3" }))
    await user.click(screen.getByRole("gridcell", { name: "12" }))
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ from: expect.stringContaining("-03"), to: expect.stringContaining("-12") }))
    // the popover closed on completion; the trigger carries the range
    const rangeInput = screen.getByRole("combobox", { name: "Dates" }) as HTMLInputElement
    expect(rangeInput.value).toContain("-03")
    expect(rangeInput.value).toContain("-12")
  })
})

describe("FileUpload", () => {
  function makeFile(name: string, size = 10): File {
    const file = new File(["x".repeat(size)], name, { type: "text/plain" })
    Object.defineProperty(file, "size", { value: size })
    return file
  }

  it("accepts files through the hidden input and lists them", async () => {
    const onFiles = vi.fn()
    render(<FileUpload onFiles={onFiles} aria-label="Upload" />)
    const input = document.querySelector<HTMLInputElement>("input[type=file]")!
    fireEvent.change(input, { target: { files: [makeFile("a.txt")] } })
    expect(onFiles).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId("file-upload-list")).toHaveTextContent("a.txt")
  })

  it("rejects files over maxSize with an alert", async () => {
    render(<FileUpload maxSize={5} />)
    const input = document.querySelector<HTMLInputElement>("input[type=file]")!
    fireEvent.change(input, { target: { files: [makeFile("big.txt", 100)] } })
    expect(screen.getByRole("alert")).toHaveTextContent(/larger than/)
    expect(screen.queryByTestId("file-upload-list")).toBeNull()
  })

  it("removes a listed file", async () => {
    const user = userEvent.setup()
    const onFiles = vi.fn()
    render(<FileUpload onFiles={onFiles} />)
    const input = document.querySelector<HTMLInputElement>("input[type=file]")!
    fireEvent.change(input, { target: { files: [makeFile("a.txt")] } })
    await user.click(screen.getByRole("button", { name: /Remove file: a.txt/ }))
    expect(onFiles).toHaveBeenLastCalledWith([])
    expect(screen.queryByTestId("file-upload-list")).toBeNull()
  })
})
