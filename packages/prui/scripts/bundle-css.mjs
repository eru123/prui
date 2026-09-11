#!/usr/bin/env node
/**
 * Emits a self-contained dist/prui.css: all theme token files concatenated,
 * with intra-theme @import lines inlined so the output has no external
 * references (a flattened file cannot resolve relative imports).
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { execFileSync } from "node:child_process"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const src = (...p) => resolve(root, "src", "theme", ...p)

function inline(path) {
  const text = readFileSync(path, "utf8")
  return text.replace(/^\s*@import\s+"(.+?)";?\s*$/gm, (_, rel) => {
    return inline(resolve(dirname(path), rel))
  })
}

// Compile the tailwind utilities prui's own class strings use. Consumers
// need no tailwind setup at all (AC-1); apps with their own tailwind simply
// load these utilities twice, which is harmless.
const utilitiesFile = resolve(root, "dist", "prui-utilities.css")
const cliEntry = resolve(root, "node_modules", "@tailwindcss", "cli", "dist", "index.mjs")
execFileSync(process.execPath, [cliEntry, "-i", resolve(root, "scripts", "tw-input.css"), "-o", utilitiesFile, "--minify"], { stdio: "inherit" })
const utilitiesCss = readFileSync(utilitiesFile, "utf8")

const out = [
  inline(src("base.css")),
  inline(src("control.css")),
  inline(src("workshop.css")),
  inline(src("ember.css")),
  inline(src("daylight.css")),
  utilitiesCss,
].join("\n")

mkdirSync(resolve(root, "dist"), { recursive: true })
writeFileSync(resolve(root, "dist", "prui.css"), out + "\n")
console.log(`wrote dist/prui.css (${out.length} bytes)`)

// Ship each named theme as @skiddph/prui/theme/<name>.css (cross-platform: no shell cp)
mkdirSync(resolve(root, "dist", "theme"), { recursive: true })
for (const f of readdirSync(src())) {
  if (f.endsWith(".css")) copyFileSync(src(f), resolve(root, "dist", "theme", f))
}
console.log("copied theme css to dist/theme/")
