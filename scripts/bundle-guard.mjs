#!/usr/bin/env node
/**
 * AC-7 bundle guard: importing only prui/core/button must ship no App or
 * Resource code. Verifies at the built-package level: core/button.js's
 * static import graph (chunks included) must not contain the app-layer
 * markers (sidebar shell, Resource CRUD strings).
 */
import { readFileSync, existsSync } from "node:fs"
import { resolve, dirname, relative } from "node:path"
import { fileURLToPath } from "node:url"

const dist = resolve(dirname(fileURLToPath(import.meta.url)), "../packages/prui/dist")

if (!existsSync(dist)) {
  console.error("bundle-guard: packages/prui/dist missing — run pnpm --filter prui build first")
  process.exit(1)
}

// Gather the static import graph starting from core/button.js
const seen = new Set()
const queue = ["core/button.js"]
const APP_MARKERS = [
  "prui-app-nav", // App shell sidebar
  "prui-resource", // Resource CRUD screen
  "mobile-drawer", // App drawer
  "command-palette", // App palette
]
let violations = []
let bytes = 0

while (queue.length) {
  const rel = queue.pop()
  if (!rel || seen.has(rel)) continue
  seen.add(rel)
  const file = resolve(dist, rel)
  if (!existsSync(file)) continue
  const code = readFileSync(file, "utf8")
  bytes += code.length
  for (const marker of APP_MARKERS) {
    if (code.includes(marker)) violations.push(`${rel} contains "${marker}"`)
  }
  for (const m of code.matchAll(/(?:from|import)\s*"(\.[^"]+\.js)"/g)) {
    queue.push(relative(dist, resolve(dirname(file), m[1])))
  }
}

console.log(`bundle-guard: prui/core/button graph = ${seen.size} file(s), ${(bytes / 1024).toFixed(1)} KB raw`)

if (violations.length) {
  console.error("bundle-guard FAILED (AC-7):")
  for (const v of violations) console.error("  - " + v)
  process.exit(1)
}
console.log("bundle-guard passed: no App/Resource code in the prui/core/button graph")
