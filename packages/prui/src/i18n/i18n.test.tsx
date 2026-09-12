import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { PruiProvider, setPruiDictionary, resetPruiDictionary } from "../i18n"
import { DataTable } from "../data-table/data-table"
import { DataTablePagination } from "../data-table/data-table-pagination"
import { Button } from "../core/button"
import { AppShell } from "../app/app"
import { MemoryRouter } from "react-router-dom"
import { readFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { Drawer } from "../core/drawer"

afterEach(() => {
  cleanup()
  resetPruiDictionary()
  document.body.innerHTML = ""
  document.documentElement.removeAttribute("dir")
})

describe("i18n dictionary", () => {
  it("translates DataTable strings through the provider", async () => {
    render(
      <PruiProvider dictionary={{ noResults: "Keine Ergebnisse", loading: "Lädt", rowsPerPage: "Zeilen pro Seite" }}>
        <DataTable columns={[{ key: "name", label: "Name" }]} rows={[]} />
      </PruiProvider>,
    )
    expect(screen.getByTestId("data-table-empty")).toHaveTextContent("Keine Ergebnisse")
  })

  it("setPruiDictionary overrides globally and resets", () => {
    setPruiDictionary({ noResults: "Aucun résultat" })
    render(<DataTable columns={[{ key: "name", label: "Name" }]} rows={[]} />)
    expect(screen.getByTestId("data-table-empty")).toHaveTextContent("Aucun résultat")
  })

  it("pagination labels and aria names translate", () => {
    render(
      <PruiProvider dictionary={{ rowsPerPage: "Filas por página", page: "Página", previousPage: "Página anterior", nextPage: "Página siguiente" }}>
        <DataTablePagination page={2} hasNextPage hasPreviousPage />
      </PruiProvider>,
    )
    expect(screen.getByText(/Filas por página/)).toBeInTheDocument()
    expect(screen.getByTestId("pagination-page")).toHaveTextContent("Página 2")
    expect(screen.getByRole("button", { name: "Página siguiente" })).toBeInTheDocument()
  })

  it("Button variants share the standardized vocabulary", async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Button variant="success" onClick={onClick}>
        Publish
      </Button>,
    )
    const btn = screen.getByRole("button", { name: "Publish" })
    expect(btn.className).toContain("prui-ok")
    await user.click(btn)
    expect(onClick).toHaveBeenCalledOnce()
  })
})

describe("RTL support", () => {
  it("the shell renders under dir=rtl with logical-property padding", () => {
    document.documentElement.dir = "rtl"
    render(
      <MemoryRouter>
        <AppShell brand={{ name: "RTL App" }} nav={[{ label: "Home", href: "/" }]}>
          <div>content</div>
        </AppShell>
      </MemoryRouter>,
    )
    expect(screen.getByTestId("app-header")).toBeInTheDocument()
    // base.css uses padding-inline (logical) for the collapsed rail buttons
    const here = dirname(fileURLToPath(import.meta.url))
    const css = readFileSync(resolve(here, "../theme/base.css"), "utf8")
    expect(css).toMatch(/padding-inline/)
  })

  it("Drawer sides work under RTL (anchoring is directional by design)", () => {
    document.documentElement.dir = "rtl"
    render(
      <Drawer open side="right" ariaLabel="Panel">
        body
      </Drawer>,
    )
    const dialog = screen.getByRole("dialog", { name: "Panel" })
    expect(dialog.className).toContain("right-0")
  })
})
