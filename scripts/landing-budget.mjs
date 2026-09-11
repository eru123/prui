#!/usr/bin/env node
/**
 * AC-6 landing budget: walk the built site's module graph from the index
 * entry (the landing) through STATIC imports only, and size every JS chunk
 * the landing downloads. Gates at 100KB compressed (brotli — what Cloudflare
 * serves and Lighthouse counts); gzip is printed for reference.
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
const entryKey = Object.keys(manifest).find((k) => k === "index.html")
if (!entryKey) {
  console.error("landing-budget: no index.html entry in manifest")
  process.exit(1)
}

const BUDGET_BYTES = 100 * 1024

const seen = new Set()
let raw = 0
let gz = 0
let br = 0
const queue = [entryKey]

while (queue.length) {
  const key = queue.pop()
  if (!key || seen.has(key)) continue
  seen.add(key)
  const chunk = manifest[key]
  if (!chunk) continue
  if (chunk.isEntry || chunk.file.endsWith(".js")) {
    if (chunk.file.endsWith(".js")) {
      const buf = readFileSync(join(dist, chunk.file))
      raw += buf.length
      gz += gzipSync(buf).length
      br += brotliCompressSync(buf, { params: { [0x06]: 11 } }).length // 0x06 = brotli param quality
    }
  }
  for (const imp of chunk.imports ?? []) queue.push(imp)
  // dynamic imports are excluded: they stream on demand and never load on the landing
}

const kb = (n) => `${(n / 1024).toFixed(1)} KB`
console.log(`landing-budget: ${seen.size} chunks [${[...seen].join(", ")}], raw ${kb(raw)} | gzip ${kb(gz)} | brotli ${kb(br)}`)

if (br > BUDGET_BYTES) {
  console.error(`landing-budget FAILED (AC-6): landing JS brotli ${kb(br)} exceeds the ${kb(BUDGET_BYTES)} budget`)
  process.exit(1)
}
console.log(`landing-budget passed (AC-6): landing JS brotli ${kb(br)} under the ${kb(BUDGET_BYTES)} budget`)
