#!/usr/bin/env node
/**
 * AC-6 landing budget: measure what the BROWSER actually loads for the
 * landing — the entry script from dist/index.html, its modulepreload links,
 * and the static import graph behind them — and gate the compressed total
 * at 100KB (brotli, what Cloudflare serves; gzip printed for reference).
 */
import { readFileSync, existsSync } from "node:fs"
import { resolve, dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { gzipSync, brotliCompressSync } from "node:zlib"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const dist = join(root, "site", "dist")
const manifestPath = join(dist, ".vite", "manifest.json")

if (!existsSync(manifestPath)) {
  console.error("landing-budget: site/dist/.vite/manifest.json missing — run pnpm --filter prui-site build first")
  process.exit(1)
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"))
const html = readFileSync(join(dist, "index.html"), "utf8")

// browser-truth seeds: the module script + every modulepreload link in index.html
const seeds = new Set()
for (const m of html.matchAll(/\/assets\/[^"']+\.js/g)) {
  seeds.add(m[0].replace(/^\/assets\//, ""))
}
if (seeds.size === 0) {
  console.error("landing-budget: no entry script found in dist/index.html")
  process.exit(1)
}

const byFile = new Map()
for (const chunk of Object.values(manifest)) {
  if (chunk.file?.endsWith(".js")) byFile.set(chunk.file, chunk)
}

const BUDGET_BYTES = 100 * 1024

const seen = new Set()
let raw = 0
let gz = 0
let br = 0
const queue = [...seeds]

while (queue.length) {
  const file = queue.pop()
  if (!file || seen.has(file)) continue
  seen.add(file)
  const buf = readFileSync(join(dist, "assets", file))
  raw += buf.length
  gz += gzipSync(buf).length
  br += brotliCompressSync(buf).length
  // follow static imports only; dynamic imports stream on demand
  const chunk = byFile.get(file)
  for (const imp of chunk?.imports ?? []) {
    const impFile = manifest[imp]?.file
    if (impFile) queue.push(impFile)
  }
}

const kb = (n) => `${(n / 1024).toFixed(1)} KB`
console.log(`landing-budget: ${seen.size} chunks [${[...seen].join(", ")}], raw ${kb(raw)} | gzip ${kb(gz)} | brotli ${kb(br)}`)

if (br > BUDGET_BYTES) {
  console.error(`landing-budget FAILED (AC-6): landing JS brotli ${kb(br)} exceeds the ${kb(BUDGET_BYTES)} budget`)
  process.exit(1)
}
console.log(`landing-budget passed (AC-6): landing JS brotli ${kb(br)} under the ${kb(BUDGET_BYTES)} budget`)
