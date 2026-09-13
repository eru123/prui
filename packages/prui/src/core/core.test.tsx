import * as React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Button } from "./button"
import { Input, Textarea } from "./input"
import { Label, Separator } from "./label"
import { Badge, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Avatar } from "./card"
import { Switch } from "./switch"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./dialog"
import { Dropdown } from "./dropdown"
import { ScrollArea } from "./scroll-area"
import { cn } from "./cn"

describe("cn", () => {
  it("merges class names with tailwind awareness", () => {
    expect(cn("px-2", "px-4")).toBe("px-4")
    // false is the fixture: clsx must skip falsy args
    expect(cn("text-sm", false && "hidden", "font-medium")).toBe("text-sm font-medium") // eslint-disable-line no-constant-binary-expression
  })
})

describe("Button", () => {
  it("renders children and defaults", () => {
    render(<Button>Save</Button>)
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument()
  })

  it("applies variant and size classes", () => {
    const { container } = render(<Button variant="primary" size="sm">Go</Button>)
    const el = container.querySelector("button")
    expect(el?.className).toContain("prui-button")
  })

  it("shows a spinner when loading and disables", () => {
    render(<Button loading>Save</Button>)
    const btn = screen.getByRole("button")
    expect(btn).toBeDisabled()
    expect(btn.getAttribute("data-loading")).toBe("true")
  })

  it("asChild renders the child element with button classes", () => {
    render(
      <Button asChild>
        <a href="/x">Link</a>
      </Button>,
    )
    const link = screen.getByRole("link", { name: "Link" })
    expect(link.className).toContain("prui-button")
  })

  it("fires onClick", async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)
    await user.click(screen.getByRole("button"))
    expect(onClick).toHaveBeenCalledOnce()
  })
})

describe("Input / Textarea", () => {
  it("Input is controlled", async () => {
    const user = userEvent.setup()
    function Demo() {
      const [v, setV] = React.useState("")
      return <Input value={v} onChange={(e) => setV(e.target.value)} aria-label="Name" />
    }
    render(<Demo />)
    const input = screen.getByLabelText("Name")
    await user.type(input, "abc")
    expect(input).toHaveValue("abc")
  })

  it("Input disabled state", () => {
    render(<Input disabled aria-label="Locked" />)
    expect(screen.getByLabelText("Locked")).toBeDisabled()
  })

  it("Textarea renders and accepts input", async () => {
    const user = userEvent.setup()
    render(<Textarea aria-label="Notes" />)
    await user.type(screen.getByLabelText("Notes"), "hello")
    expect(screen.getByLabelText("Notes")).toHaveValue("hello")
  })
})

describe("Label / Separator", () => {
  it("Label associates with a control", () => {
    render(
      <>
        <Label htmlFor="x">Email</Label>
        <Input id="x" />
      </>,
    )
    expect(screen.getByLabelText("Email")).toBeInTheDocument()
  })

  it("Separator exposes aria-orientation", () => {
    render(<Separator orientation="vertical" data-testid="sep" />)
    expect(screen.getByTestId("sep")).toHaveAttribute("aria-orientation", "vertical")
  })
})

describe("Badge / Card / Avatar", () => {
  it("Badge variants render data-variant", () => {
    render(<Badge variant="ok" data-testid="b">Active</Badge>)
    expect(screen.getByTestId("b").getAttribute("data-variant")).toBe("ok")
  })

  it("Card renders parts", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Desc</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Foot</CardFooter>
      </Card>,
    )
    expect(screen.getByText("Title")).toBeInTheDocument()
    expect(screen.getByText("Desc")).toBeInTheDocument()
    expect(screen.getByText("Body")).toBeInTheDocument()
    expect(screen.getByText("Foot")).toBeInTheDocument()
  })

  it("Avatar derives initials from alt", () => {
    render(<Avatar alt="Ada Lovelace" data-testid="av" />)
    expect(screen.getByTestId("av")).toHaveTextContent("AL")
  })

  it("Avatar parses the fallback to initials; full names never render", () => {
    render(<Avatar fallback="Jericho Aquino" data-testid="av-fb" />)
    expect(screen.getByTestId("av-fb")).toHaveTextContent("JA")
    render(<Avatar fallback="Grace Hopper" data-testid="av-fb2" />)
    expect(screen.getByTestId("av-fb2")).toHaveTextContent("GH")
    render(<Avatar fallback="Admin" data-testid="av-fb3" />)
    expect(screen.getByTestId("av-fb3")).toHaveTextContent("A")
  })

  it("Avatar text stays on one line regardless of input", () => {
    render(<Avatar fallback="Ada Lovelace" data-testid="av-nw" />)
    expect(screen.getByTestId("av-nw").className).toContain("whitespace-nowrap")
    expect(screen.getByTestId("av-nw").className).toContain("overflow-hidden")
  })
})

describe("Switch", () => {
  it("uncontrolled toggle fires onChange", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Switch aria-label="Dark mode" onChange={onChange} />)
    const sw = screen.getByRole("switch")
    expect(sw).toHaveAttribute("aria-checked", "false")
    await user.click(sw)
    expect(onChange).toHaveBeenCalledWith(true)
    expect(sw).toHaveAttribute("aria-checked", "true")
  })

  it("controlled switch respects checked prop", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Switch checked={false} aria-label="Locked" onChange={onChange} />)
    await user.click(screen.getByRole("switch"))
    expect(onChange).toHaveBeenCalledWith(true)
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false")
  })

  it("disabled switch does not fire", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Switch disabled aria-label="Off" onChange={onChange} />)
    await user.click(screen.getByRole("switch"))
    expect(onChange).not.toHaveBeenCalled()
  })
})

describe("Tabs", () => {
  it("renders triggers and switches content", async () => {
    const user = userEvent.setup()
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">Alpha</TabsTrigger>
          <TabsTrigger value="b">Beta</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Content A</TabsContent>
        <TabsContent value="b">Content B</TabsContent>
      </Tabs>,
    )
    expect(screen.getByText("Content A")).toBeInTheDocument()
    expect(screen.queryByText("Content B")).toBeNull()
    await user.click(screen.getByRole("tab", { name: "Beta" }))
    expect(screen.getByText("Content B")).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Beta" }).getAttribute("aria-selected")).toBe("true")
  })

  it("controlled value", () => {
    render(
      <Tabs value="b">
        <TabsList>
          <TabsTrigger value="a">Alpha</TabsTrigger>
          <TabsTrigger value="b">Beta</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Content A</TabsContent>
        <TabsContent value="b">Content B</TabsContent>
      </Tabs>,
    )
    expect(screen.queryByText("Content A")).toBeNull()
    expect(screen.getByText("Content B")).toBeInTheDocument()
  })
})

describe("Select", () => {
  it("opens, selects, and reports onChange", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <Select value="" onChange={onChange}>
        <SelectTrigger aria-label="Fruit">
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="pear">Pear</SelectItem>
        </SelectContent>
      </Select>,
    )
    await user.click(screen.getByRole("combobox"))
    expect(screen.getByRole("listbox")).toBeInTheDocument()
    await user.click(screen.getByRole("option", { name: "Apple" }))
    expect(onChange).toHaveBeenCalledWith("apple")
  })

  it("simple options prop mode", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <Select options={[{ label: "One", value: "1" }]} onChange={onChange} />,
    )
    await user.click(screen.getByRole("combobox"))
    await user.click(screen.getByRole("option", { name: "One" }))
    expect(onChange).toHaveBeenCalledWith("1")
  })
})

describe("Dialog", () => {
  it("renders content only when open", () => {
    const { rerender } = render(
      <Dialog open={false}>
        <DialogContent ariaLabel="Confirm">Hidden</DialogContent>
      </Dialog>,
    )
    expect(screen.queryByRole("dialog")).toBeNull()
    rerender(
      <Dialog open>
        <DialogContent ariaLabel="Confirm">
          <DialogHeader>
            <DialogTitle>Confirm</DialogTitle>
          </DialogHeader>
          <DialogFooter>Foot</DialogFooter>
        </DialogContent>
      </Dialog>,
    )
    expect(screen.getByRole("dialog", { name: "Confirm" })).toBeInTheDocument()
  })

  it("closes on Escape", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <Dialog open onOpenChange={onOpenChange}>
        <DialogContent ariaLabel="Confirm">Body</DialogContent>
      </Dialog>,
    )
    await user.keyboard("{Escape}")
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("closes via the close button", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <Dialog open onOpenChange={onOpenChange}>
        <DialogContent ariaLabel="Confirm">Body</DialogContent>
      </Dialog>,
    )
    await user.click(screen.getByRole("button", { name: "Close" }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})

describe("Dropdown", () => {
  it("opens menu and selects an item", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <Dropdown
        trigger={<button>Open actions</button>}
        items={[
          { label: "Edit", onSelect },
          { label: "Delete", danger: true, separatorBefore: true },
        ]}
      />,
    )
    // the wrapper div also exposes role=button; the inner button is the visible trigger
    await user.click(screen.getAllByRole("button", { name: "Open actions" })[0]!)
    const item = screen.getByRole("menuitem", { name: "Edit" })
    await user.click(item)
    expect(onSelect).toHaveBeenCalledOnce()
  })
})

describe("ScrollArea", () => {
  it("applies maxHeight style", () => {
    render(
      <ScrollArea maxHeight={100} data-testid="sa">
        content
      </ScrollArea>,
    )
    expect(screen.getByTestId("sa").style.maxHeight).toBe("100px")
  })
})
