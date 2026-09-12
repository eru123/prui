import { defineConfig, devices } from "@playwright/test"

/**
 * PRUI end-to-end suite: runs against the built docs site (the site is
 * built with prui itself, so it doubles as PRUI's integration harness).
 *
 *   pnpm --filter prui-site build
 *   npx playwright test
 *
 * Visual snapshots live in e2e/__screenshots__ (update with --update-snapshots).
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.02 },
  },
  webServer: {
    command: "pnpm --filter prui-site exec vite preview --port 4173 --strictPort",
    port: 4173,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: "http://localhost:4173",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
})
