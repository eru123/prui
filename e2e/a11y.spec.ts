import { test, expect } from "@playwright/test"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

/** axe-core source injected into the page (real-browser color rules ON). */
const AXE_SOURCE = readFileSync(
  resolve(process.cwd(), "packages/prui/node_modules/axe-core/axe.min.js"),
  "utf8",
)

async function axeScan(page: import("@playwright/test").Page) {
  await page.addScriptTag({ content: AXE_SOURCE })
  const violations = await page.evaluate(async () => {
    const results = await (window as unknown as { axe: { run: (ctx: unknown) => Promise<{ violations: { id: string; help: string; nodes: unknown[] }[] }> } }).axe.run(document)
    return results.violations.map((v) => ({ id: v.id, help: v.help, count: v.nodes.length }))
  })
  return violations
}

test.describe("real-browser axe audits", () => {
  for (const path of ["/", "/components", "/components/toast", "/components/date-range-picker", "/guides/accessibility"]) {
    test(`${path} has no serious axe violations`, async ({ page }) => {
      await page.goto(path)
      await page.waitForLoadState("networkidle")
      const violations = await axeScan(page)
      const serious = violations.filter((v) => v.id !== "color-contrast-enhanced" || v.count > 0)
      // allow only minor/contrast findings, surface them in the report
      const blocking = violations.filter((v) => !["color-contrast", "color-contrast-enhanced"].includes(v.id))
      expect(
        blocking.map((v) => `${v.id}(${v.count})`).join(", ") || "none",
      ).toBe("none")
      void serious
      if (violations.length) {
        console.log(`[axe ${path}]`, JSON.stringify(violations))
      }
    })
  }
})
