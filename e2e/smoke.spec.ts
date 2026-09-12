import { test, expect } from "@playwright/test"

test.describe("docs site smoke (built with prui)", () => {
  test("landing renders the shell", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByTestId("app-header")).toBeVisible()
    await expect(page.getByTestId("sidebar")).toBeVisible()
  })

  test("nav groups expand and navigate", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")
    const group = page.getByRole("button", { name: /^Components$/ })
    await group.click()
    // the group may already start expanded on the landing (expandAllOn):
    // if the links did not appear, the click collapsed it — click again
    const link = page.getByRole("link", { name: "Button", exact: true }).first()
    try {
      await link.waitFor({ state: "visible", timeout: 2500 })
    } catch {
      await group.click()
    }
    await link.click()
    await expect(page).toHaveURL(/\/components\/button/)
    await expect(page.getByRole("heading", { name: "Button", exact: true })).toBeVisible()
  })

  test("command palette opens on / and filters", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")
    await page.keyboard.press("/")
    const palette = page.getByTestId("command-palette")
    await expect(palette).toBeVisible()
    await page.getByRole("combobox", { name: "Command palette search" }).fill("button")
    await expect(palette.getByRole("option", { name: /Button/ }).first()).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(palette).toBeHidden()
  })

  test("theme switch cycles named themes", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")
    await page.getByTestId("theme-toggle").click()
    await page.getByRole("menuitem", { name: /workshop/ }).click()
    await expect(page.locator("html")).toHaveAttribute("data-prui-theme", "workshop")
  })

  test("new component doc pages render", async ({ page }) => {
    for (const path of ["/components/feedback", "/components/inputs", "/components/dates", "/guides/design-tokens", "/migration"]) {
      await page.goto(path)
      await expect(page.getByTestId("app-content")).toBeVisible()
    }
  })
})
