import { describe, it, expect, afterEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { axe } from "vitest-axe"
import { MemoryRouter } from "react-router-dom"

import { Button } from "../core/button"
import { Input } from "../core/input"
import { Switch } from "../core/switch"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../core/tabs"
import { Badge, Card, CardHeader, CardTitle, CardContent } from "../core/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../core/dialog"
import { Dropdown } from "../core/dropdown"
import { Select } from "../core/select"
import { Modal } from "../core/modal"
import { Alert } from "../core/alert"
import { Checkbox } from "../core/checkbox"
import { RadioGroup, Radio } from "../core/radio"
import { Combobox } from "../core/combobox"
import { Progress } from "../core/progress"
import { Skeleton } from "../core/skeleton"
import { Spinner } from "../core/spinner"
import { Accordion, AccordionItem } from "../core/accordion"
import { Breadcrumb, BreadcrumbItem } from "../core/breadcrumb"
import { TreeView } from "../core/tree-view"
import { Timeline } from "../core/timeline"
import { Calendar } from "../core/calendar"
import { FileUpload } from "../core/file-upload"
import { Drawer } from "../core/drawer"
import { Tooltip } from "../core/tooltip"
import { DataTable } from "../data-table/data-table"
import { DataTablePagination } from "../data-table/data-table-pagination"
import { AppShell } from "../app/app"
import { Resource } from "../app/resource"
import { Form } from "../app/form"

/**
 * axe-core accessibility audits. jsdom cannot compute color contrast or
 * layout, so color-contrast and a few visual rules are disabled; everything
 * structural (roles, names, labels, focus order primitives) is enforced.
 */
const AXE_OPTIONS = {
  rules: {
    "color-contrast": { enabled: false },
    "nested-interactive": { enabled: true },
    "aria-required-children": { enabled: true },
    "aria-required-parent": { enabled: true },
  },
} as const

async function expectNoViolations(container: HTMLElement) {
  const results = await axe(container, AXE_OPTIONS as never)
  const detail = (results.violations as unknown as { id: string; help: string; nodes: { target: string[] }[] }[])
    .map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(",")).join(" | ")})`)
    .join("; ")
  expect(detail || "none").toBe("none")
}

afterEach(() => {
  cleanup()
  document.body.innerHTML = ""
})

describe("axe: core primitives", () => {
  it("Button", async () => {
    const { container } = render(
      <div>
        <Button variant="primary">Save</Button>
        <Button variant="ghost" aria-label="Close">×</Button>
      </div>,
    )
    await expectNoViolations(container)
  })

  it("Input + Switch + Checkbox + Radio", async () => {
    const { container } = render(
      <form>
        <label htmlFor="email">Email</label>
        <Input id="email" type="email" />
        <Switch aria-label="Notifications" />
        <Checkbox aria-label="Subscribe" />
        <RadioGroup label="Plan">
          <Radio value="free" label="Free" />
          <Radio value="pro" label="Pro" />
        </RadioGroup>
      </form>,
    )
    await expectNoViolations(container)
  })

  it("Tabs", async () => {
    const { container } = render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">Alpha</TabsTrigger>
          <TabsTrigger value="b">Beta</TabsTrigger>
        </TabsList>
        <TabsContent value="a">A</TabsContent>
        <TabsContent value="b">B</TabsContent>
      </Tabs>,
    )
    await expectNoViolations(container)
  })

  it("Badge + Card", async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="success">live</Badge>
        </CardContent>
      </Card>,
    )
    await expectNoViolations(container)
  })

  it("Alert + Progress + Skeleton + Spinner", async () => {
    const { container } = render(
      <div>
        <Alert variant="info" title="Heads up">Something informative</Alert>
        <Progress value={30} aria-label="Upload" />
        <Skeleton variant="text" lines={2} />
        <Spinner label="Loading" />
      </div>,
    )
    await expectNoViolations(container)
  })

  it("Accordion + Breadcrumb + Timeline", async () => {
    const { container } = render(
      <MemoryRouter>
        <Accordion defaultValue={["a"]}>
          <AccordionItem value="a">A header<div>body</div></AccordionItem>
        </Accordion>
        <Breadcrumb>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem current>Here</BreadcrumbItem>
        </Breadcrumb>
        <Timeline items={[{ title: "Created", time: "Mon" }]} />
      </MemoryRouter>,
    )
    await expectNoViolations(container)
  })

  it("TreeView + Calendar + FileUpload", async () => {
    const { container } = render(
      <div>
        <TreeView ariaLabel="Files" items={[{ id: "a", label: "a", children: [{ id: "b", label: "b" }] }]} />
        <Calendar aria-label="Calendar" value="2026-09-12" />
        <FileUpload aria-label="Upload" />
      </div>,
    )
    await expectNoViolations(container)
  })
})

describe("axe: overlays (open state)", () => {
  it("Modal", async () => {
    const { container } = render(
      <div>
        <button>opener</button>
        <Modal open onClose={() => {}} ariaLabel="Confirm">
          <p>Body</p>
        </Modal>
      </div>,
    )
    await expectNoViolations(container)
  })

  it("Dialog", async () => {
    const { container } = render(
      <div>
        <button>opener</button>
        <Dialog open>
          <DialogContent ariaLabel="Confirm">
            <DialogHeader>
              <DialogTitle>Title</DialogTitle>
            </DialogHeader>
            <DialogFooter>Foot</DialogFooter>
          </DialogContent>
        </Dialog>
      </div>,
    )
    await expectNoViolations(container)
  })

  it("Drawer", async () => {
    const { container } = render(
      <div>
        <button>opener</button>
        <Drawer open ariaLabel="Panel">
          <p>Body</p>
        </Drawer>
      </div>,
    )
    await expectNoViolations(container)
  })

  it("Dropdown open with keyboard focus", async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Dropdown
        trigger={<button>Actions</button>}
        items={[{ label: "Edit" }, { label: "Delete", danger: true }]}
      />,
    )
    await user.click(screen.getByRole("button", { name: "Actions" }))
    await expectNoViolations(container)
  })

  it("Select open", async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Select options={[{ label: "One", value: "1" }]} aria-label="Count" />,
    )
    await user.click(screen.getByRole("combobox"))
    await expectNoViolations(container)
  })

  it("Combobox open with options", async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Combobox
        aria-label="Assignee"
        options={[
          { label: "Ada", value: "ada" },
          { label: "Grace", value: "grace" },
        ]}
      />,
    )
    await user.click(screen.getByRole("combobox"))
    await expectNoViolations(container)
  })

  it("Tooltip visible", async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Tooltip content="Save the document">
        <button>Save</button>
      </Tooltip>,
    )
    await user.hover(screen.getByRole("button", { name: "Save" }))
    await screen.findByRole("tooltip")
    await expectNoViolations(container)
  })
})

describe("axe: app layer", () => {
  it("DataTable with selection + pagination", async () => {
    const { container } = render(
      <div>
        <DataTable
          selectable
          columns={[
            { key: "name", label: "Name", sortable: true },
            { key: "status", label: "Status" },
          ]}
          rows={[
            { id: "1", name: "Ada", status: "active" },
            { id: "2", name: "Grace", status: "leave" },
          ]}
        />
        <DataTablePagination page={1} hasNextPage hasPreviousPage={false} />
      </div>,
    )
    await expectNoViolations(container)
  })

  it("AppShell", async () => {
    const { container } = render(
      <MemoryRouter>
        <AppShell
          brand={{ name: "Audit" }}
          nav={[
            { label: "Home", href: "/" },
            { label: "Group", items: [{ label: "Child", href: "/child" }] },
          ]}
        >
          <div>content</div>
        </AppShell>
      </MemoryRouter>,
    )
    await expectNoViolations(container)
  })

  it("Resource screen (idle)", async () => {
    const { container } = render(
      <Resource
        name="employees"
        columns={[
          { key: "name", label: "Name", sortable: true },
          { key: "status", label: "Status", filter: "select", filterOptions: [{ label: "Active", value: "active" }] },
        ]}
        list={async () => ({ rows: [], nextCursor: null })}
      />,
    )
    await expectNoViolations(container)
  })

  it("schema Form with validation errors", async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Form
        schema={{
          fields: [
            { name: "email", label: "Email", type: "email", required: true },
          ],
          submitLabel: "Save",
        }}
        onSubmit={() => {}}
      />,
    )
    await user.click(screen.getByRole("button", { name: "Save" }))
    await screen.findByRole("alert")
    await expectNoViolations(container)
  })
})
