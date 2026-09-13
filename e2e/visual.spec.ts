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
      // the landing streams its showcase boxes in lazy chunks: wait for the
      // real content so screenshots never catch the pulse placeholders
      if (path === "/") {
        await page.waitForSelector('input[placeholder="Search employees"]')
        await page.waitForSelector("[role='progressbar']")
      }
      await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true })
    })
  }
})
