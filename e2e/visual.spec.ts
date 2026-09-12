import { test, expect } from "@playwright/test"

/**
 * Visual regression: full-page screenshots of key docs pages in both theme
 * modes. Baselines land in e2e/__screenshots__; update intentionally with
 * `npx playwright test --update-snapshots` and review the diff.
 */
const PAGES = [
  { path: "/", name: "landing" },
  { path: "/components/button", name: "button-doc" },
  { path: "/components/toast", name: "toast-doc" },
  { path: "/guides/design-tokens", name: "tokens-guide" },
]

test.describe("visual regression", () => {
  for (const { path, name } of PAGES) {
    test(`${name} matches the baseline`, async ({ page }) => {
      await page.goto(path)
      await page.waitForLoadState("networkidle")
      await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true })
    })
  }
})
