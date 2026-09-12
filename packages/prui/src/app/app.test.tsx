import { describe, it, expect, vi } from "vitest"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import { App, AppShell, SidebarNav, type NavItem } from "./app"
import { Resource, type ResourceProps, type ResourceRow } from "./resource"
import { Form } from "./form"
import { StatRow } from "./stat-row"
import { Settings } from "./settings"

const nav: NavItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Employees", href: "/employees" },
  {
    label: "Leave",
    items: [
      { label: "Requests", href: "/leave/requests" },
      { label: "Balances", href: "/leave/balances" },
    ],
  },
]

function renderAppAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppShell brand={{ name: "HRLabs" }} nav={nav}>
        <Routes>
          <Route path="/" element={<div>HOME</div>} />
          <Route path="/employees" element={<div>EMPLOYEES</div>} />
          <Route path="/leave/requests" element={<div>REQUESTS</div>} />
        </Routes>
      </AppShell>
    </MemoryRouter>,
  )
}

describe("App nav rendering", () => {
  it("renders brand and nav items into the sidebar", () => {
    renderAppAt("/")
    expect(screen.getAllByText("HRLabs").length).toBeGreaterThan(0)
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Employees" })).toBeInTheDocument()
    expect(screen.getByTestId("nav-group")).toBeInTheDocument()
  })

  it("collapsible groups expand to reveal nested items", async () => {
    const user = userEvent.setup()
    renderAppAt("/")
    expect(screen.queryByRole("link", { name: "Requests" })).toBeNull()
    await user.click(screen.getByRole("button", { name: /Leave/ }))
    expect(screen.getByRole("link", { name: "Requests" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Balances" })).toBeInTheDocument()
  })

  it("auto-expands groups containing the active route and highlights it", () => {
    renderAppAt("/leave/requests")
    const link = screen.getByRole("link", { name: "Requests" })
    expect(link.getAttribute("aria-current")).toBe("page")
    expect(link.className).toMatch(/prui-brand|font-medium/)
  })

  it("highlights the top-level active route", () => {
    renderAppAt("/employees")
    const link = screen.getByRole("link", { name: "Employees" })
    expect(link.getAttribute("aria-current")).toBe("page")
  })

  it("mobile drawer: toggle opens, backdrop closes, scroll locks", async () => {
    const user = userEvent.setup()
    renderAppAt("/")
    const toggle = screen.getByTestId("drawer-toggle")
    await user.click(toggle)
    const drawer = screen.getByTestId("mobile-drawer")
    expect(drawer).toBeInTheDocument()
    // the brand sits beside the close button so it is not alone in the header
    expect(within(drawer).getAllByText("HRLabs").length).toBeGreaterThan(0)
    expect(within(drawer).getByRole("button", { name: "Close navigation" })).toBeInTheDocument()
    expect(document.body.style.overflow).toBe("hidden")
    await user.click(screen.getByTestId("drawer-backdrop"))
    // the panel slides out before unmounting
    await waitFor(() => expect(screen.queryByTestId("mobile-drawer")).toBeNull())
    expect(document.body.style.overflow).toBe("")
  })

  it("command palette opens on the / hotkey and filters entries", async () => {
    const user = userEvent.setup()
    renderAppAt("/")
    await user.keyboard("/")
    const palette = screen.getByTestId("command-palette")
    expect(palette).toBeInTheDocument()
    const input = screen.getByRole("combobox", { name: "Command palette search" })
    await user.type(input, "balan")
    expect(screen.getByRole("option", { name: /Balances/ })).toBeInTheDocument()
    expect(screen.queryByRole("option", { name: /^Dashboard$/ })).toBeNull()
  })

  it("hotkey does not fire while typing in an input", async () => {
    const user = userEvent.setup()
    renderAppAt("/")
    const input = document.createElement("input")
    document.body.appendChild(input)
    input.focus()
    await user.keyboard("/")
    expect(screen.queryByTestId("command-palette")).toBeNull()
    input.remove()
  })

  it("App wraps AppShell in a router (memory mode)", () => {
    render(
      <App router="memory" initialEntries={["/"]} brand={{ name: "Mem" }} nav={nav}>
        <Routes>
          <Route path="/" element={<div>MEMHOME</div>} />
        </Routes>
      </App>,
    )
    expect(screen.getAllByText("Mem").length).toBeGreaterThan(0)
    expect(screen.getByText("MEMHOME")).toBeInTheDocument()
  })
})

describe("SidebarNav standalone", () => {
  it("renders groups and items", () => {
    render(
      <MemoryRouter>
        <SidebarNav nav={nav} />
      </MemoryRouter>,
    )
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument()
    expect(screen.getByTestId("nav-group")).toBeInTheDocument()
  })
})

/* ---------------- Resource ---------------- */

interface Employee extends ResourceRow {
  id: string
  name: string
  status: string
  salary?: number
}

const employees: Employee[] = [
  { id: "1", name: "Ada", status: "active", salary: 120 },
  { id: "2", name: "Grace", status: "leave", salary: 140 },
  { id: "3", name: "Linus", status: "active", salary: 110 },
]

function makeList(calls?: { query?: unknown }) {
  const fn = async (query: Parameters<ResourceProps<Employee>["list"]>[0]) => {
    if (calls) calls.query = query
    let rows = employees
    if (query.search) {
      rows = rows.filter((r) => r.name.toLowerCase().includes(query.search!.toLowerCase()))
    }
    const statusFilter = query.filters?.["status"] as string[] | undefined
    if (statusFilter && statusFilter.length > 0) {
      rows = rows.filter((r) => statusFilter.includes(r.status))
    }
    return { rows, nextCursor: null }
  }
  return vi.fn(fn)
}

function renderResource(overrides: Partial<ResourceProps<Employee>> = {}) {
  const list = (overrides.list ?? makeList()) as ReturnType<typeof makeList>
  render(
    <Resource
      name="employees"
      columns={[
        { key: "name", label: "Name", sortable: true },
        { key: "status", label: "Status", filter: "select", filterOptions: [{ label: "Active", value: "active" }, { label: "Leave", value: "leave" }] },
        { key: "salary", label: "Salary", filter: "numberrange" },
      ]}
      list={list}
      {...overrides}
    />,
  )
  return { list }
}

describe("Resource", () => {
  it("loads rows through list() and renders them", async () => {
    const { list } = renderResource() as { list: ReturnType<typeof makeList> }
    await waitFor(() => {
      expect(screen.getByText("Ada")).toBeInTheDocument()
    })
    expect(list).toHaveBeenCalledOnce()
    expect(list.mock.calls[0]![0]).toMatchObject({ cursor: null, pageSize: 20 })
  })

  it("renders filter controls for filter columns", async () => {
    renderResource()
    await screen.findByTestId("faceted-filter")
    expect(screen.getByTestId("numberrange-filter")).toBeInTheDocument()
  })

  it("faceted filter narrows results via list()", async () => {
    const user = userEvent.setup()
    const list = makeList()
    renderResource({ list })
    await waitFor(() => expect(screen.getByText("Ada")).toBeInTheDocument())
    await user.click(screen.getByTestId("faceted-filter"))
    await user.click(screen.getByRole("menuitemcheckbox", { name: /Leave/ }))
    await waitFor(() => {
      expect(list).toHaveBeenCalledTimes(2)
    })
    const lastQuery = list.mock.calls.at(-1)![0]
    expect(lastQuery.filters?.["status"]).toEqual(["leave"])
    await waitFor(() => {
      expect(screen.getByText("Grace")).toBeInTheDocument()
      expect(screen.queryByText("Ada")).toBeNull()
    })
  })

  it("pagination: next disabled without a cursor, page label rendered", async () => {
    renderResource()
    await waitFor(() => expect(screen.getByText("Ada")).toBeInTheDocument())
    expect(screen.getByTestId("pagination-page")).toHaveTextContent("Page 1")
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled()
  })

  it("pagination: navigates with cursors", async () => {
    const user = userEvent.setup()
    const pageOne = [{ id: "1", name: "Ada", status: "active" }]
    const pageTwo = [{ id: "2", name: "Zoe", status: "active" }]
    const list = vi.fn(async (q: { cursor?: string | null }) => {
      if (q.cursor === "c2") return { rows: pageTwo, nextCursor: null }
      return { rows: pageOne, nextCursor: "c2" }
    })
    renderResource({ list })
    await waitFor(() => expect(screen.getByText("Ada")).toBeInTheDocument())
    await user.click(screen.getByRole("button", { name: "Next page" }))
    await waitFor(() => expect(screen.getByText("Zoe")).toBeInTheDocument())
    expect(screen.getByTestId("pagination-page")).toHaveTextContent("Page 2")
    expect(screen.getByRole("button", { name: "Previous page" })).toBeEnabled()
  })

  it("shows create modal with a form and submits via create()", async () => {
    const user = userEvent.setup()
    const create = vi.fn<(values: Record<string, unknown>) => Promise<void>>(async () => {})
    const list = makeList()
    renderResource({ create, list })
    await waitFor(() => expect(screen.getByText("Ada")).toBeInTheDocument())
    await user.click(screen.getByTestId("resource-create"))
    const dialog = screen.getByRole("dialog")
    expect(dialog).toBeInTheDocument()
    const nameInput = dialog.querySelector("#prui-form-name") as HTMLInputElement
    await user.type(nameInput, "New Person")
    await user.click(dialog.querySelector("button[type=submit]")!)
    await waitFor(() => expect(create).toHaveBeenCalledOnce())
    expect((create as ReturnType<typeof vi.fn>).mock.calls[0]![0]).toMatchObject({ name: "New Person" })
  })

  it("edit and delete actions render in rows", async () => {
    renderResource({ update: async () => {}, remove: async () => {} })
    await waitFor(() => expect(screen.getByText("Ada")).toBeInTheDocument())
    expect(screen.getAllByTestId("resource-edit").length).toBe(3)
    expect(screen.getAllByTestId("resource-delete").length).toBe(3)
  })

  it("delete confirm modal (confirmModal) calls remove()", async () => {
    const user = userEvent.setup()
    const remove = vi.fn(async () => {})
    renderResource({ remove })
    await waitFor(() => expect(screen.getByText("Ada")).toBeInTheDocument())
    await user.click(screen.getAllByTestId("resource-delete")[0]!)
    // imperative confirmModal renders an alertdialog
    const dialog = await screen.findByRole("alertdialog", { name: "Delete employee?" })
    expect(dialog).toBeInTheDocument()
    const confirmBtn = [...dialog.querySelectorAll("button")].find((b) => b.textContent === "Delete")!
    await user.click(confirmBtn)
    await waitFor(() => expect(remove).toHaveBeenCalledOnce())
  })

  it("error state renders when list rejects", async () => {
    const list = vi.fn(async () => {
      throw new Error("boom")
    })
    renderResource({ list })
    await waitFor(() => expect(screen.getByTestId("resource-error")).toHaveTextContent("boom"))
  })

  it("sorting clicks pass sort to list()", async () => {
    const user = userEvent.setup()
    const list = makeList()
    renderResource({ list })
    await waitFor(() => expect(screen.getByText("Ada")).toBeInTheDocument())
    await user.click(screen.getByRole("button", { name: /Name/ }))
    await waitFor(() => {
      expect(list.mock.calls.at(-1)![0].sort).toEqual({ key: "name", direction: "asc" })
    })
  })
})

/* ---------------- Form ---------------- */

describe("Form", () => {
  const schema = {
    fields: [
      { name: "email", label: "Email", type: "email" as const, required: true },
      { name: "role", label: "Role", type: "select" as const, options: [{ label: "Admin", value: "admin" }] },
    ],
    submitLabel: "Save",
  }

  it("renders fields from schema and submits values", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Form schema={schema} onSubmit={onSubmit} />)
    await user.type(screen.getByLabelText(/Email/), "a@b.c")
    await user.click(screen.getByRole("button", { name: "Save" }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ email: "a@b.c" }))
  })

  it("shows required-field errors and blocks submit", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Form schema={schema} onSubmit={onSubmit} />)
    await user.click(screen.getByRole("button", { name: "Save" }))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByRole("alert")).toHaveTextContent(/required/i)
  })

  it("prefills initialValues", () => {
    render(<Form schema={schema} initialValues={{ email: "x@y.z" }} onSubmit={() => {}} />)
    expect(screen.getByLabelText(/Email/)).toHaveValue("x@y.z")
  })
})

/* ---------------- StatRow / Settings ---------------- */

describe("StatRow", () => {
  it("renders one card per item with labels and deltas", () => {
    render(
      <StatRow
        items={[
          { label: "Users", value: 12, delta: "+2", trend: "up" },
          { label: "Churn", value: 3, delta: "-1", trend: "down" },
        ]}
      />,
    )
    expect(screen.getAllByTestId("stat-card").length).toBe(2)
    expect(screen.getByText("Users")).toBeInTheDocument()
    expect(screen.getByText("+2")).toBeInTheDocument()
  })
})

describe("Settings", () => {
  it("renders sections and field rows", () => {
    render(
      <Settings
        sections={[
          { id: "general", title: "General", description: "Basics", fields: [{ label: "App name", description: "Shown everywhere" }] },
          { id: "security", title: "Security", fields: [] },
        ]}
      />,
    )
    expect(screen.getAllByTestId("settings-section").length).toBe(2)
    expect(screen.getAllByText("General").length).toBeGreaterThan(0)
    expect(screen.getByText("App name")).toBeInTheDocument()
  })
})

describe("Shell layouts (layoutType)", () => {
  function shell(layoutType: "A" | "B" | "C" | "D", props: Record<string, unknown> = {}) {
    return render(
      <MemoryRouter initialEntries={["/"]}>
        <AppShell brand={{ name: "T" }} nav={nav} layoutType={layoutType} {...props}>
          <div>CONTENT</div>
        </AppShell>
      </MemoryRouter>,
    )
  }

  it("A, B and C start expanded and expose the collapse toggle", () => {
    for (const v of ["A", "B", "C"] as const) {
      const { unmount } = shell(v)
      const el = document.querySelector(".prui-shell")
      expect(el?.getAttribute("data-layout")).toBe(v)
      expect(el?.getAttribute("data-collapsed")).toBeNull()
      expect(screen.getByTestId("sidebar-toggle")).toBeInTheDocument()
      unmount()
    }
  })

  it("the toggle collapses any variant and hides nav labels", async () => {
    const user = userEvent.setup()
    shell("B")
    await user.click(screen.getByTestId("sidebar-toggle"))
    const el = document.querySelector(".prui-shell")
    expect(el?.getAttribute("data-collapsed")).toBe("true")
    expect(el?.getAttribute("style")).toContain("--prui-rail-width")
    expect(document.querySelector(".prui-shell-sidebar .prui-nav-mono")).toBeInTheDocument()
  })

  it("the header rail toggle sits before the brand; no mobile toggle exists", () => {
    shell("A")
    const header = screen.getByTestId("app-header")
    const toggle = screen.getByTestId("sidebar-toggle")
    expect(header).toContainElement(toggle)
    const brand = within(header).getAllByText("T")[0]
    if (!brand) throw new Error("brand not found in the header")
    expect(toggle.compareDocumentPosition(brand) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    // hidden below md: the drawer hamburger rules mobile
    expect(toggle.className).toContain("md:inline-flex")
    expect(screen.queryByTestId("rail-toggle-mobile")).toBeNull()
  })

  it("C renders a sidebar header row aligned with the topbar", () => {
    shell("C")
    const head = screen.getByTestId("sidebar-header")
    expect(head).toBeInTheDocument()
    expect(head.className).toContain("h-14")
    expect(head).toHaveTextContent("T")
  })

  it("C owns the brand in the sidehead; the topbar brand is mobile-only", () => {
    const { unmount } = shell("C")
    const header = screen.getByTestId("app-header")
    const brandC = within(header).getAllByText("T")[0]
    if (!brandC) throw new Error("brand not found in the C topbar")
    expect(brandC.closest(".md\\:hidden")).not.toBeNull()
    unmount()
    shell("A")
    const brandA = within(screen.getByTestId("app-header")).getAllByText("T")[0]
    if (!brandA) throw new Error("brand not found in the A topbar")
    // A/B keep the brand in the topbar at every width
    expect(brandA.closest(".md\\:hidden")).toBeNull()
  })

  it("C accepts a custom sidebar header", () => {
    shell("C", { sidebarHeader: <span>Workspace</span> })
    expect(screen.getByTestId("sidebar-header")).toHaveTextContent("Workspace")
  })

  it("a collapsed group is one rail item opening a flyout menu", async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppShell brand={{ name: "T" }} nav={nav} layoutType="A">
          <Routes>
            <Route path="/" element={<div>HOME</div>} />
            <Route path="/leave/requests" element={<div>REQUESTS</div>} />
          </Routes>
        </AppShell>
      </MemoryRouter>,
    )
    await user.click(screen.getByTestId("sidebar-toggle"))
    // the Leave group is a single rail item now
    expect(screen.getByTestId("rail-group-trigger")).toBeInTheDocument()
    expect(screen.queryByText("Requests")).toBeNull()
    // clicking it opens the flyout (portaled to the body, outside the rail)
    await user.click(screen.getByTestId("rail-group-trigger"))
    const flyout = await screen.findByTestId("rail-flyout")
    expect(flyout).toBeInTheDocument()
    expect(document.body.contains(flyout)).toBe(true)
    // items navigate and close the flyout
    await user.click(screen.getAllByTestId("rail-flyout-item").find((el) => el.textContent === "Requests")!)
    expect(screen.getByText("REQUESTS")).toBeInTheDocument()
    expect(screen.queryByTestId("rail-flyout")).toBeNull()
  })

  it("the flyout closes on backdrop click and Escape", async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppShell brand={{ name: "T" }} nav={nav} layoutType="A">
          <div>HOME</div>
        </AppShell>
      </MemoryRouter>,
    )
    await user.click(screen.getByTestId("sidebar-toggle"))
    await user.click(screen.getByTestId("rail-group-trigger"))
    expect(screen.getByTestId("rail-flyout")).toBeInTheDocument()
    await user.click(screen.getByTestId("rail-flyout-backdrop"))
    expect(screen.queryByTestId("rail-flyout")).toBeNull()
    await user.click(screen.getByTestId("rail-group-trigger"))
    await user.keyboard("{Escape}")
    expect(screen.queryByTestId("rail-flyout")).toBeNull()
  })

  it("passive nav headings are hidden in the collapsed rail", async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppShell brand={{ name: "T" }} nav={[...nav, { label: "Section", heading: true }]} layoutType="A">
          <div>HOME</div>
        </AppShell>
      </MemoryRouter>,
    )
    expect(screen.getByText("Section")).toBeInTheDocument()
    await user.click(screen.getByTestId("sidebar-toggle"))
    expect(screen.queryByText("Section")).toBeNull()
  })

  it("D has no collapse toggle and renders the sidebar footer slot", () => {
    shell("D", { sidebarFooter: <button>New project</button> })
    expect(screen.queryByTestId("sidebar-toggle")).toBeNull()
    expect(screen.queryByTestId("rail-toggle-mobile")).toBeNull()
    expect(screen.getByText("New project")).toBeInTheDocument()
  })
})
