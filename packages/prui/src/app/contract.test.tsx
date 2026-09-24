import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, waitFor, cleanup, act, fireEvent, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import { App, AppShell, appPropsMeta, type NavItem } from "./app"
import { AuthShell } from "./auth-shell"
import { Resource, resourcePropsMeta, type ResourceRow } from "./resource"
import { Form } from "./form"
import { Settings } from "./settings"
import { SessionTimeout } from "./session-timeout"
import { LoginPage } from "../pages/login"

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

/* ---------------- App: auth flow (session timeout) ---------------- */

const nav: NavItem[] = [{ label: "Dashboard", href: "/" }]

function renderShellWithAuth(overrides: { onTimeout?: () => void; loginPath?: string } = {}) {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <AppShell
        brand={{ name: "HRLabs" }}
        nav={nav}
        auth={{ sessionTimeout: 1, warningTime: 0.5, ...overrides }}
      >
        <Routes>
          <Route path="/" element={<div>HOME</div>} />
          <Route path={overrides.loginPath ?? "/login"} element={<div>LOGINPAGE</div>} />
        </Routes>
      </AppShell>
    </MemoryRouter>,
  )
}

describe("App auth prop (session timeout)", () => {
  it("renders no timeout dialog before the warning window", () => {
    renderShellWithAuth()
    expect(screen.queryByLabelText("Session expiring soon")).toBeNull()
  })

  it("shows the countdown warning after the idle warning time", async () => {
    vi.useFakeTimers()
    renderShellWithAuth()
    // 1 min timeout, 0.5 min warning -> warning at 30s idle
    await act(async () => {
      await vi.advanceTimersByTimeAsync(31_000)
    })
    expect(screen.getByLabelText("Session expiring soon")).toBeInTheDocument()
    expect(screen.getByTestId("session-countdown")).toHaveTextContent(/0:2\d|0:30/)
  })

  it("extend re-arms the timer; expiry calls onTimeout", async () => {
    vi.useFakeTimers()
    const onTimeout = vi.fn()
    renderShellWithAuth({ onTimeout })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(31_000)
    })
    fireEvent.click(screen.getByTestId("session-extend"))
    // jsdom fires no transition events: complete the Modal close animation by hand
    fireEvent.transitionEnd(screen.getByLabelText("Session expiring soon"))
    expect(screen.queryByLabelText("Session expiring soon")).toBeNull()
    // re-armed: warning shows again a full idle period later
    await act(async () => {
      await vi.advanceTimersByTimeAsync(31_000)
    })
    expect(screen.getByLabelText("Session expiring soon")).toBeInTheDocument()
    // the armed hard timeout elapses -> onTimeout fires
    await act(async () => {
      await vi.advanceTimersByTimeAsync(31_000)
    })
    expect(onTimeout).toHaveBeenCalled()
  })

  it("without onTimeout, expiry navigates to loginPath", async () => {
    vi.useFakeTimers()
    renderShellWithAuth({ loginPath: "/login" })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(62_000)
    })
    expect(screen.getByText("LOGINPAGE")).toBeInTheDocument()
  })
})

/* ---------------- App: theme shorthand + sidebar props ---------------- */

describe("App theme shorthand and sidebar config", () => {
  it("theme default 'dark' resolves to the control theme", () => {
    render(
      <App router="memory" initialEntries={["/"]} theme={{ default: "dark", persist: false }} brand={{ name: "T" }} nav={nav}>
        <div>HOME</div>
      </App>,
    )
    expect(document.documentElement.dataset.pruiTheme).toBe("control")
  })

  it("theme default 'light' resolves to the daylight theme", () => {
    render(
      <App router="memory" initialEntries={["/"]} theme={{ default: "light", persist: false }} brand={{ name: "T" }} nav={nav}>
        <div>HOME</div>
      </App>,
    )
    expect(document.documentElement.dataset.pruiTheme).toBe("daylight")
    expect(document.documentElement.dataset.pruiMode).toBe("light")
  })

  it("sidebar.collapsible=false hides the mobile toggle", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppShell brand={{ name: "T" }} nav={nav} sidebar={{ collapsible: false }}>
          <div>HOME</div>
        </AppShell>
      </MemoryRouter>,
    )
    expect(screen.queryByTestId("drawer-toggle")).toBeNull()
  })

  it("sidebar.defaultOpen=true starts with the drawer open", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppShell brand={{ name: "T" }} nav={nav} sidebar={{ defaultOpen: true }}>
          <div>HOME</div>
        </AppShell>
      </MemoryRouter>,
    )
    expect(screen.getByTestId("mobile-drawer")).toBeInTheDocument()
  })

  it("router 'react-router' requires an ambient router and reuses it", () => {
    // outside any router the mode fails fast (the shell binds to the
    // ambient context); inside one it renders without nesting routers
    expect(() =>
      render(
        <App router="react-router" brand={{ name: "T" }} nav={nav}>
          <div>HOME</div>
        </App>,
      ),
    ).toThrow(/useLocation|render a <Router>/i)
    cleanup()
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App router="react-router" brand={{ name: "T" }} nav={nav}>
          <div>HOME</div>
        </App>
      </MemoryRouter>,
    )
    expect(screen.getByText("HOME")).toBeInTheDocument()
  })
})

/* ---------------- AuthShell ---------------- */

describe("AuthShell", () => {
  it("renders brand, title, description and children", () => {
    render(
      <AuthShell title="Welcome back" description="Sign in" brand={{ name: "HRLabs" }} footer={<span>footer text</span>}>
        <button>form</button>
      </AuthShell>,
    )
    expect(screen.getByTestId("auth-shell")).toBeInTheDocument()
    expect(screen.getByText("Welcome back")).toBeInTheDocument()
    expect(screen.getByText("HRLabs")).toBeInTheDocument()
    expect(screen.getByText("footer text")).toBeInTheDocument()
  })
})

/* ---------------- Resource: options/delete/cursor aliases ---------------- */

interface Row extends ResourceRow {
  id: string
  name: string
  status: string
}

const rows: Row[] = [
  { id: "1", name: "Ada", status: "active" },
  { id: "2", name: "Grace", status: "leave" },
]

describe("Resource alias API", () => {
  it("accepts plain-string options for select filters", async () => {
    render(
      <Resource
        name="employees"
        columns={[{ key: "status", label: "Status", filter: "select", options: ["active", "leave"] }]}
        list={async () => ({ rows, cursor: null })}
      />,
    )
    await userEvent.setup().click(await screen.findByTestId("faceted-filter"))
    expect(screen.getByRole("menuitemcheckbox", { name: "active" })).toBeInTheDocument()
    expect(screen.getByRole("menuitemcheckbox", { name: "leave" })).toBeInTheDocument()
  })

  it("accepts delete as an alias of remove", async () => {
    const user = userEvent.setup()
    const del = vi.fn(async () => {})
    render(
      <Resource
        name="employees"
        columns={[{ key: "name", label: "Name" }]}
        list={async () => ({ rows, cursor: null })}
        delete={del}
      />,
    )
    await screen.findByText("Ada")
    await user.click(screen.getAllByTestId("resource-delete")[0]!)
    const dialog = await screen.findByRole("alertdialog")
    await user.click(within(dialog).getByRole("button", { name: "Delete" }))
    await waitFor(() => expect(del).toHaveBeenCalled())
  })

  it("accepts cursor as an alias of nextCursor", async () => {
    const user = userEvent.setup()
    const list = vi.fn(async (q: { cursor?: string | null }) =>
      q.cursor === "c2" ? { rows: [rows[1]!], cursor: null } : { rows: [rows[0]!], cursor: "c2" },
    )
    render(<Resource name="employees" columns={[{ key: "name", label: "Name" }]} list={list} />)
    await screen.findByText("Ada")
    expect(screen.getByRole("button", { name: "Next page" })).toBeEnabled()
    await user.click(screen.getByRole("button", { name: "Next page" }))
    await screen.findByText("Grace")
    expect(screen.getByTestId("pagination-page")).toHaveTextContent("Page 2")
  })

  it("renders price, date and time filter controls", async () => {
    render(
      <Resource
        name="orders"
        columns={[
          { key: "total", label: "Total", filter: "price" },
          { key: "placed", label: "Placed", filter: "date" },
          { key: "slot", label: "Slot", filter: "time" },
        ]}
        list={async () => ({ rows: [], cursor: null })}
      />,
    )
    await screen.findByTestId("price-filter")
    expect(screen.getByTestId("date-filter")).toBeInTheDocument()
    expect(screen.getByTestId("time-filter")).toBeInTheDocument()
  })
})

/* ---------------- Form: array schema, defaultValues, date, string options ---------------- */

describe("Form schema input", () => {
  it("accepts a bare field array", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <Form schema={[{ name: "name", label: "Name", required: true }]} onSubmit={onSubmit} />,
    )
    await user.type(screen.getByLabelText(/Name/), "Ada")
    await user.click(screen.getByRole("button", { name: "Submit" }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ name: "Ada" }))
  })

  it("accepts defaultValues as an alias of initialValues", () => {
    render(
      <Form
        schema={[{ name: "status", label: "Status", type: "select", options: ["active", "leave"] }]}
        defaultValues={{ status: "leave" }}
      />,
    )
    expect(screen.getByRole("combobox", { name: "Status" })).toHaveTextContent("leave")
  })

  it("renders date fields as the in-house DatePicker", () => {
    render(<Form schema={[{ name: "hired", label: "Hired", type: "date" }]} />)
    const trigger = screen.getByLabelText(/Hired/)
    expect(trigger.className).toContain("prui-date-picker")
    // picker trigger is a combobox-style readonly input, not a native date field
    expect(trigger).toHaveAttribute("type", "text")
    expect(trigger).toHaveAttribute("readonly")
  })
})

/* ---------------- Settings: typed fields ---------------- */

describe("Settings typed fields", () => {
  it("renders switch, select and text fields from type + value", async () => {
    const user = userEvent.setup()
    const onAuto = vi.fn()
    render(
      <Settings
        sections={[
          {
            id: "workspace",
            label: "Workspace",
            fields: [
              { label: "Organization", name: "orgName", type: "text", value: "HRLabs" },
              { label: "Region", name: "region", type: "select", options: ["EU", "APAC"], value: "APAC" },
              { label: "Auto-approve", name: "autoApprove", type: "switch", value: false, onChange: onAuto },
            ],
          },
        ]}
      />,
    )
    expect(screen.getByLabelText("Organization")).toHaveValue("HRLabs")
    expect(screen.getByRole("combobox", { name: "Region" })).toHaveTextContent("APAC")
    await user.click(screen.getByRole("switch", { name: "Auto-approve" }))
    expect(onAuto).toHaveBeenCalledWith(true)
  })
})

/* ---------------- SessionTimeout standalone ---------------- */

describe("SessionTimeout standalone", () => {
  it("calls onTimeout when the countdown elapses", async () => {
    vi.useFakeTimers()
    const onTimeout = vi.fn()
    act(() => {
      render(<SessionTimeout timeout={0.05} warningTime={0.02} onTimeout={onTimeout} />)
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5_000)
    })
    expect(onTimeout).toHaveBeenCalled()
  })
})

/* ---------------- docs-contract: skill docs must match the real API ---------------- */

describe("docs-contract: skill API surface", () => {
  const here = dirname(fileURLToPath(import.meta.url))

  function readSkill(rel: string): string {
    return readFileSync(resolve(here, "../../../../skill", rel), "utf8")
  }

  function tableProps(doc: string, section: string): string[] {
    const start = doc.indexOf(`## \`${section}\``)
    if (start === -1) return []
    const next = doc.indexOf("## ", start + 4)
    const body = doc.slice(start, next === -1 ? doc.length : next)
    const names: string[] = []
    for (const m of body.matchAll(/^\| `([a-zA-Z]+)`/gm)) names.push(m[1]!)
    return names
  }

  it("every prop documented for <App> exists on the component (aliases included)", () => {
    const doc = readSkill("references/app-layer.md")
    const documented = tableProps(doc, "App")
    const real = new Set(appPropsMeta.props.map((p) => p.name))
    const allowedAliases = new Set(["sidebar", "header"]) // documented superset slots
    const missing = documented.filter((p) => !real.has(p) && !allowedAliases.has(p))
    expect(missing).toEqual([])
  })

  it("every prop documented for <Resource> exists on the component (aliases included)", () => {
    const doc = readSkill("references/app-layer.md")
    const documented = tableProps(doc, "Resource")
    const real = new Set(resourcePropsMeta.props.map((p) => p.name))
    const allowedAliases = new Set(["columns"])
    const missing = documented.filter((p) => !real.has(p) && !allowedAliases.has(p))
    expect(missing).toEqual([])
  })

  it("re-exports the route helpers the skill imports from prui/app", async () => {
    const mod = await import("./index")
    for (const name of ["Routes", "Route", "Outlet", "Link", "NavLink", "Navigate"]) {
      expect(name in mod).toBe(true)
    }
  })

  it("the documented filter type names are all supported", () => {
    const doc = readSkill("references/app-layer.md")
    const m = doc.match(/filter\?:\s*'([^']+)'/)
    expect(m).not.toBeNull()
    const types = m![1]!.split("' | '")
    for (const t of types) {
      expect(["select", "date", "daterange", "number", "numberrange", "price", "time"]).toContain(t)
    }
  })
})

/* ---------------- pages: username alias + string links/oauth ---------------- */

describe("LoginPage alias API", () => {
  it("toggles the email field via the username alias", () => {
    render(
      <MemoryRouter>
        <LoginPage fields={{ username: false }} />
      </MemoryRouter>,
    )
    expect(screen.queryByLabelText(/Email/)).toBeNull()
    expect(screen.getByLabelText(/Password/)).toBeInTheDocument()
  })

  it("accepts plain string links and oauth provider ids", async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <LoginPage links={{ forgot: "/forgot-password" }} oauth={["google"]} />
      </MemoryRouter>,
    )
    expect(screen.getByRole("link", { name: "Forgot password?" })).toHaveAttribute("href", "/forgot-password")
    expect(screen.getByTestId("oauth-providers")).toHaveTextContent("Google")
    void user
  })
})
