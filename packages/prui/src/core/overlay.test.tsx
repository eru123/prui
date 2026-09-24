import * as React from "react"
import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, cleanup, fireEvent, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Modal, confirmModal } from "./modal"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog"
import { Dropdown } from "./dropdown"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs"
import { Portal, useOverlay, useReducedMotion, useScrollLock } from "./overlay"
import { moveIndex, homeIndex, endIndex, typeaheadIndex } from "./list-nav"

afterEach(() => {
  cleanup()
  document.body.innerHTML = ""
  document.body.className = ""
  document.body.style.overflow = ""
})

describe("Modal accessibility infrastructure", () => {
  it("traps Tab inside the modal and restores focus on close", async () => {
    const user = userEvent.setup()
    function Demo() {
      const [open, setOpen] = React.useState(false)
      return (
        <div>
          <button onClick={() => setOpen(true)}>Open</button>
          <Modal open={open} onClose={() => setOpen(false)} ariaLabel="Test modal">
            <button>First</button>
            <button>Second</button>
          </Modal>
        </div>
      )
    }
    render(<Demo />)
    const opener = screen.getByRole("button", { name: "Open" })
    await user.click(opener)
    const dialog = screen.getByRole("dialog", { name: "Test modal" })
    expect(document.body.contains(dialog)).toBe(true)

    // initial focus lands on the first focusable element
    await act(async () => {})
    expect(screen.getByRole("button", { name: "First" })).toHaveFocus()

    // Tab cycles within the modal (First -> Second -> close button -> First)
    await user.tab()
    expect(screen.getByRole("button", { name: "Second" })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole("button", { name: "Close modal" })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole("button", { name: "First" })).toHaveFocus()
    // Shift+Tab wraps backwards
    await user.tab({ shift: true })
    expect(screen.getByRole("button", { name: "Close modal" })).toHaveFocus()

    // background is aria-hidden while open (inert fallback)
    expect(opener.closest("[aria-hidden='true']") ?? opener.getAttribute("aria-hidden")).toBeTruthy()

    // Escape closes and focus returns to the invoker
    await user.keyboard("{Escape}")
    await act(async () => {})
    fireEvent.transitionEnd(screen.getByRole("dialog", { name: "Test modal" }))
    await act(async () => {})
    expect(screen.queryByRole("dialog")).toBeNull()
    expect(opener).toHaveFocus()
  })

  it("locks body scroll while open and unlocks on close (counter-based)", async () => {
    const user = userEvent.setup()
    function Demo() {
      const [open, setOpen] = React.useState(false)
      return (
        <>
          <button onClick={() => setOpen(true)}>Open</button>
          <Modal open={open} onClose={() => setOpen(false)} ariaLabel="M">
            <button>Inner</button>
          </Modal>
        </>
      )
    }
    render(<Demo />)
    await user.click(screen.getByRole("button", { name: "Open" }))
    expect(document.body.style.overflow).toBe("hidden")
    expect(document.body.classList.contains("modal-open")).toBe(true)
    await user.click(screen.getByRole("button", { name: "Inner" }))
    fireEvent.keyDown(document, { key: "Escape" })
    await act(async () => {})
    fireEvent.transitionEnd(screen.getByRole("dialog", { name: "M" }))
    await act(async () => {})
    expect(document.body.style.overflow).toBe("")
    expect(document.body.classList.contains("modal-open")).toBe(false)
  })

  it("nested modals: only the topmost answers Escape", async () => {
    const user = userEvent.setup()
    function Nested() {
      const [outer, setOuter] = React.useState(false)
      const [inner, setInner] = React.useState(false)
      return (
        <div>
          <button onClick={() => setOuter(true)}>Open outer</button>
          <Modal open={outer} onClose={() => setOuter(false)} ariaLabel="Outer">
            <button onClick={() => setInner(true)}>Open inner</button>
          </Modal>
          <Modal open={inner} onClose={() => setInner(false)} ariaLabel="Inner">
            <button>Inner content</button>
          </Modal>
        </div>
      )
    }
    render(<Nested />)
    await user.click(screen.getByRole("button", { name: "Open outer" }))
    await act(async () => {})
    await user.click(screen.getByRole("button", { name: "Open inner" }))
    await act(async () => {})
    expect(screen.getByRole("dialog", { name: "Outer" })).toBeInTheDocument()
    expect(screen.getByRole("dialog", { name: "Inner" })).toBeInTheDocument()

    // first Escape closes only the inner modal
    await user.keyboard("{Escape}")
    await act(async () => {})
    fireEvent.transitionEnd(screen.getByRole("dialog", { name: "Inner" }))
    await act(async () => {})
    expect(screen.queryByRole("dialog", { name: "Inner" })).toBeNull()
    expect(screen.getByRole("dialog", { name: "Outer" })).toBeInTheDocument()
  })

  it("disableDefaultClose blocks Escape and shakes instead", async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    function Demo() {
      const [open, setOpen] = React.useState(true)
      return (
        <Modal open={open} onClose={() => { onClose(); setOpen(false) }} disableDefaultClose ariaLabel="Blocked">
          <button>Body</button>
        </Modal>
      )
    }
    render(<Demo />)
    await user.click(screen.getByRole("button", { name: "Body" }))
    await user.keyboard("{Escape}")
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByRole("dialog", { name: "Blocked" }).className).toContain("prui-modal-shake")
  })

  it("title renders an in-flow header and the close button joins it (no overlay)", async () => {
    render(
      <Modal open onClose={vi.fn()} title="Edit employee" description="Changes apply immediately.">
        <p>form body</p>
      </Modal>,
    )
    const dialog = screen.getByRole("dialog", { name: "Edit employee" })
    expect(dialog).toBeInTheDocument()
    // title + description wired for assistive tech
    expect(screen.getByRole("heading", { name: "Edit employee" })).toBeInTheDocument()
    expect(dialog).toHaveAttribute("aria-describedby")
    // the close button sits inside the header row, not absolutely positioned
    const close = screen.getByRole("button", { name: "Close modal" })
    expect(close.className).not.toContain("absolute")
  })

  it("without a title the close button keeps the legacy overlay corner", () => {
    render(
      <Modal open onClose={vi.fn()} ariaLabel="Plain">
        <p>body</p>
      </Modal>,
    )
    expect(screen.getByRole("dialog", { name: "Plain" })).toBeInTheDocument()
    const close = screen.getByRole("button", { name: "Close modal" })
    expect(close.className).toContain("absolute")
  })

  it("dismissible=false: overlay click and Escape shake and stay open; the X still closes", async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    function Demo() {
      const [open, setOpen] = React.useState(true)
      return (
        <Modal
          open={open}
          onClose={() => {
            onClose()
            setOpen(false)
          }}
          dismissible={false}
          ariaLabel="Guarded"
        >
          <button>Body</button>
        </Modal>
      )
    }
    render(<Demo />)
    const dialog = () => screen.getByRole("dialog", { name: "Guarded" })
    // overlay click shakes, does not close
    const overlay = document.querySelector(".prui-modal-overlay")!
    await user.click(overlay)
    expect(dialog().className).toContain("prui-modal-shake")
    expect(dialog()).toBeInTheDocument()
    // Escape shakes, does not close
    await user.keyboard("{Escape}")
    expect(dialog()).toBeInTheDocument()
    // neither path invoked the consumer's onClose
    expect(onClose).not.toHaveBeenCalled()
    // the X still dismisses (the consumer onClose runs; the panel then
    // animates out, so element removal is asserted via onClose here)
    await user.click(screen.getByRole("button", { name: "Close modal" }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it("modal choreography runs on the modal-scoped 200ms token", () => {
    render(
      <Modal open onClose={vi.fn()} ariaLabel="Timed">
        <p>body</p>
      </Modal>,
    )
    const content = screen.getByRole("dialog", { name: "Timed" })
    expect(content.style.transition).toContain("var(--prui-duration-modal")
    // overlay fades on the same token so fade and transform stay in sync
    const overlay = document.querySelector(".prui-modal-overlay") as HTMLElement
    expect(overlay.style.transition).toContain("var(--prui-duration-modal")

  })

  it("the visible title wins the accessible name over ariaLabel (never both)", () => {
    render(
      <Modal open onClose={vi.fn()} title="Add API key" ariaLabel="Add product">
        <p>body</p>
      </Modal>,
    )
    const dialog = screen.getByRole("dialog", { name: "Add API key" })
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveAttribute("aria-labelledby")
    expect(dialog).not.toHaveAttribute("aria-label")
    // without a title, ariaLabel keeps naming the dialog
    cleanup()
    render(
      <Modal open onClose={vi.fn()} ariaLabel="Add product">
        <p>body</p>
      </Modal>,
    )
    expect(screen.getByRole("dialog", { name: "Add product" })).toBeInTheDocument()
  })

  it("DropdownItem renders a leading icon that inherits the row color", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <Dropdown
        trigger={<button>Actions</button>}
        items={[
          { label: "Edit", icon: <svg data-testid="edit-icon" />, onSelect },
          { label: "Delete", icon: <svg data-testid="delete-icon" />, danger: true, onSelect },
        ]}
      />,
    )
    await user.click(screen.getByText("Actions"))
    const edit = screen.getByRole("menuitem", { name: "Edit" })
    expect(edit.querySelector("[data-testid=edit-icon]")).toBeInTheDocument()
    // the icon span carries no color of its own: currentColor flows from the row
    const iconSlot = edit.querySelector("span[aria-hidden]")!
    expect(iconSlot.className).not.toMatch(/text-(danger|fg|dim)/)
    const del = screen.getByRole("menuitem", { name: "Delete" })
    expect(del.querySelector("[data-testid=delete-icon]")).toBeInTheDocument()
    expect(del.className).toContain("text-danger")
  })

  it("confirmModal resolves true on confirm and false on Escape", async () => {
    const user = userEvent.setup()
    const promise = confirmModal({ title: "Sure?", message: "Really?" })
    const dialog = await screen.findByRole("alertdialog", { name: "Sure?" })
    expect(dialog).toBeInTheDocument()
    // initial focus lands on the confirm button
    await act(async () => {})
    expect(screen.getByRole("button", { name: "Confirm" })).toHaveFocus()
    await user.click(screen.getByRole("button", { name: "Confirm" }))
    await expect(promise).resolves.toBe(true)

    const promise2 = confirmModal({ title: "Cancel me", message: "Nope" })
    await screen.findByRole("alertdialog", { name: "Cancel me" })
    await act(async () => {})
    await user.keyboard("{Escape}")
    await expect(promise2).resolves.toBe(false)
  })
})

describe("Dialog accessibility infrastructure", () => {
  it("focuses the dialog, traps Tab, and restores focus on close", async () => {
    const user = userEvent.setup()
    function Demo() {
      const [open, setOpen] = React.useState(false)
      return (
        <>
          <button onClick={() => setOpen(true)}>Invoke</button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent ariaLabel="Confirm">
              <DialogHeader>
                <DialogTitle>Title here</DialogTitle>
              </DialogHeader>
              <button>Action</button>
            </DialogContent>
          </Dialog>
        </>
      )
    }
    render(<Demo />)
    const invoke = screen.getByRole("button", { name: "Invoke" })
    await user.click(invoke)
    await act(async () => {})
    expect(screen.getByRole("button", { name: "Action" })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus()
    await user.keyboard("{Escape}")
    await act(async () => {})
    expect(screen.queryByRole("dialog")).toBeNull()
    expect(invoke).toHaveFocus()
  })
})

describe("Dropdown keyboard support", () => {
  const items = [
    { label: "Apple" },
    { label: "Banana" },
    { label: "Cherry", disabled: true },
    { label: "Durian" },
  ]

  it("Enter opens, arrows move (skipping disabled), Home/End work, Escape restores focus", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<Dropdown trigger={<button>Actions</button>} items={items.map((i) => ({ ...i, onSelect }))} />)
    const trigger = screen.getByRole("button", { name: "Actions" })
    trigger.focus()
    await user.keyboard("{Enter}")
    expect(screen.getByRole("menu")).toBeInTheDocument()
    expect(screen.getByRole("menuitem", { name: "Apple" })).toHaveFocus()

    await user.keyboard("{ArrowDown}")
    expect(screen.getByRole("menuitem", { name: "Banana" })).toHaveFocus()

    // skips the disabled Cherry
    await user.keyboard("{ArrowDown}")
    expect(screen.getByRole("menuitem", { name: "Durian" })).toHaveFocus()

    await user.keyboard("{Home}")
    expect(screen.getByRole("menuitem", { name: "Apple" })).toHaveFocus()

    await user.keyboard("{End}")
    expect(screen.getByRole("menuitem", { name: "Durian" })).toHaveFocus()

    await user.keyboard("{Escape}")
    expect(screen.queryByRole("menu")).toBeNull()
    expect(trigger).toHaveFocus()
  })

  it("typeahead jumps to the matching item", async () => {
    const user = userEvent.setup()
    render(<Dropdown trigger={<button>Fruit</button>} items={items.map((i) => ({ ...i }))} />)
    const trigger = screen.getByRole("button", { name: "Fruit" })
    trigger.focus()
    await user.keyboard("{ArrowDown}")
    expect(screen.getByRole("menuitem", { name: "Apple" })).toHaveFocus()
    await user.keyboard("d")
    expect(screen.getByRole("menuitem", { name: "Durian" })).toHaveFocus()
  })

  it("Enter on a focused item selects it and closes the menu", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<Dropdown trigger={<button>Go</button>} items={[{ label: "Apple", onSelect }, { label: "Pear", onSelect }]} />)
    screen.getByRole("button", { name: "Go" }).focus()
    await user.keyboard("{Enter}")
    await user.keyboard("{ArrowDown}")
    expect(screen.getByRole("menuitem", { name: "Pear" })).toHaveFocus()
    await user.keyboard("{Enter}")
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole("menu")).toBeNull()
  })

  it("supports controlled open state", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const { rerender } = render(
      <Dropdown open={false} onOpenChange={onOpenChange} trigger={<button>T</button>} items={[{ label: "A" }]} />,
    )
    await user.click(screen.getByRole("button", { name: "T" }))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    rerender(<Dropdown open onOpenChange={onOpenChange} trigger={<button>T</button>} items={[{ label: "A" }]} />)
    expect(screen.getByRole("menu")).toBeInTheDocument()
  })
})

describe("Select keyboard support", () => {
  function FruitSelect(props: Partial<React.ComponentProps<typeof Select>> = {}) {
    return (
      <Select {...props}>
        <SelectTrigger aria-label="Fruit">
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="cherry">Cherry</SelectItem>
        </SelectContent>
      </Select>
    )
  }

  it("ArrowDown opens, arrows move, Enter selects, Escape restores focus", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<FruitSelect onChange={onChange} />)
    const trigger = screen.getByRole("combobox", { name: "Fruit" })
    trigger.focus()
    await user.keyboard("{ArrowDown}")
    expect(screen.getByRole("listbox")).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Apple" })).toHaveFocus()

    await user.keyboard("{ArrowDown}")
    expect(screen.getByRole("option", { name: "Banana" })).toHaveFocus()

    await user.keyboard("{End}")
    expect(screen.getByRole("option", { name: "Cherry" })).toHaveFocus()

    await user.keyboard("{Enter}")
    expect(onChange).toHaveBeenCalledWith("cherry")
    expect(screen.queryByRole("listbox")).toBeNull()
    expect(trigger).toHaveFocus()
    expect(trigger).toHaveTextContent("Cherry")
  })

  it("typeahead moves to the matching option", async () => {
    const user = userEvent.setup()
    render(<FruitSelect />)
    screen.getByRole("combobox", { name: "Fruit" }).focus()
    await user.keyboard("{Enter}")
    await user.keyboard("c")
    expect(screen.getByRole("option", { name: "Cherry" })).toHaveFocus()
  })

  it("opens focused on the selected option", async () => {
    const user = userEvent.setup()
    render(<FruitSelect defaultValue="banana" />)
    screen.getByRole("combobox", { name: "Fruit" }).focus()
    await user.keyboard("{ArrowDown}")
    expect(screen.getByRole("option", { name: "Banana" })).toHaveFocus()
  })
})

describe("Tabs keyboard support", () => {
  function DemoTabs() {
    return (
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">Alpha</TabsTrigger>
          <TabsTrigger value="b">Beta</TabsTrigger>
          <TabsTrigger value="c">Gamma</TabsTrigger>
        </TabsList>
        <TabsContent value="a">A panel</TabsContent>
        <TabsContent value="b">B panel</TabsContent>
        <TabsContent value="c">C panel</TabsContent>
      </Tabs>
    )
  }

  it("ArrowRight/ArrowLeft move focus and activate", async () => {
    const user = userEvent.setup()
    render(<DemoTabs />)
    const alpha = screen.getByRole("tab", { name: "Alpha" })
    alpha.focus()
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("tab", { name: "Beta" })).toHaveFocus()
    expect(screen.getByText("B panel")).toBeInTheDocument()
    await user.keyboard("{ArrowLeft}")
    expect(screen.getByRole("tab", { name: "Alpha" })).toHaveFocus()
    expect(screen.getByText("A panel")).toBeInTheDocument()
  })

  it("Home and End jump to the first and last tab", async () => {
    const user = userEvent.setup()
    render(<DemoTabs />)
    screen.getByRole("tab", { name: "Beta" }).focus()
    await user.keyboard("{End}")
    expect(screen.getByRole("tab", { name: "Gamma" })).toHaveFocus()
    expect(screen.getByText("C panel")).toBeInTheDocument()
    await user.keyboard("{Home}")
    expect(screen.getByRole("tab", { name: "Alpha" })).toHaveFocus()
    expect(screen.getByText("A panel")).toBeInTheDocument()
  })
})

describe("useReducedMotion", () => {
  it("reflects the media query and reacts to changes", async () => {
    let listeners: ((e: { matches: boolean }) => void)[] = []
    let matches = false
    vi.stubGlobal("matchMedia", (query: string) => ({
      get matches() {
        return matches
      },
      media: query,
      addEventListener: (_: string, cb: (e: { matches: boolean }) => void) => listeners.push(cb),
      removeEventListener: (_: string, cb: (e: { matches: boolean }) => void) => {
        listeners = listeners.filter((l) => l !== cb)
      },
      addListener: (cb: (e: { matches: boolean }) => void) => listeners.push(cb),
      removeListener: (cb: (e: { matches: boolean }) => void) => {
        listeners = listeners.filter((l) => l !== cb)
      },
      dispatchEvent: () => false,
    }))
    const seen: boolean[] = []
    function Probe() {
      seen.push(useReducedMotion())
      return null
    }
    render(<Probe />)
    expect(seen[seen.length - 1]).toBe(false)
    matches = true
    act(() => listeners.forEach((l) => l({ matches: true })))
    expect(seen[seen.length - 1]).toBe(true)
    vi.unstubAllGlobals()
  })
})

describe("list-nav helpers", () => {
  it("moveIndex wraps and skips disabled entries", () => {
    const enabled = (i: number) => i !== 2
    expect(moveIndex(0, 1, 4, { enabled })).toBe(1)
    expect(moveIndex(1, 1, 4, { enabled })).toBe(3)
    expect(moveIndex(3, 1, 4, { enabled })).toBe(0)
    expect(moveIndex(0, -1, 4, { enabled })).toBe(3)
    expect(moveIndex(3, -1, 4, { enabled })).toBe(1)
    expect(moveIndex(-1, 1, 4, { enabled })).toBe(0)
    expect(moveIndex(-1, -1, 4, { enabled })).toBe(3)
    expect(moveIndex(1, 1, 4, { loop: false, enabled })).toBe(3) // scans past disabled without wrapping
    expect(moveIndex(3, 1, 4, { loop: false })).toBe(3) // at the edge: stays
  })

  it("homeIndex and endIndex skip disabled entries", () => {
    const enabled = (i: number) => i !== 0
    expect(homeIndex(3, enabled)).toBe(1)
    expect(endIndex(3, () => false)).toBe(-1)
  })

  it("typeaheadIndex matches prefixes and wraps", () => {
    const labels = () => ["Apple", "Banana", "Apricot"]
    const state = { buffer: "", at: 0 }
    expect(typeaheadIndex(labels, state, "a", 0).index).toBe(2) // Apricot, not the current Apple
    const state2 = { buffer: "", at: 0 }
    expect(typeaheadIndex(labels, state2, "b", 0).index).toBe(1)
    const state3 = { buffer: "", at: 0 }
    typeaheadIndex(labels, state3, "a", 1) // first keystroke
    expect(typeaheadIndex(labels, state3, "p", 1).index).toBe(2) // "ap" prefix matches Apricot from Banana
  })
})

describe("Portal + useOverlay composition", () => {
  it("Portal renders children into document.body", () => {
    render(
      <Portal>
        <div data-testid="portaled">Portaled content</div>
      </Portal>,
    )
    const el = screen.getByTestId("portaled")
    expect(document.body.contains(el)).toBe(true)
  })

  it("useOverlay: escape only fires for the registered overlay", async () => {
    const user = userEvent.setup()
    const first: string[] = []
    function Layer({ name, onEscape }: { name: string; onEscape: () => void }) {
      const { ref } = useOverlay({ open: true, onEscape })
      return (
        <Portal>
          <div ref={ref} data-testid={name}>
            <button>{name}</button>
          </div>
        </Portal>
      )
    }
    function Demo() {
      const [second, setSecond] = React.useState(false)
      return (
        <>
          <Layer name="one" onEscape={() => first.push("one")} />
          {second ? <Layer name="two" onEscape={() => first.push("two")} /> : null}
          <button data-testid="add-layer" onClick={() => setSecond(true)}>Add layer</button>
        </>
      )
    }
    render(<Demo />)
    await user.keyboard("{Escape}")
    expect(first).toEqual(["one"])
    // the background is inert while a modal layer is open: query by testid, not role
    await user.click(screen.getByTestId("add-layer"))
    await user.keyboard("{Escape}")
    expect(first).toEqual(["one", "two"]) // topmost only
  })

  it("useScrollLock is nest-safe", () => {
    function Inner() {
      useScrollLock(true)
      return null
    }
    function Outer() {
      useScrollLock(true)
      return <Inner />
    }
    const { unmount } = render(<Outer />)
    expect(document.body.style.overflow).toBe("hidden")
    unmount()
    expect(document.body.style.overflow).toBe("")
  })
})
