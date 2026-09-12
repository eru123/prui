import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const here = dirname(fileURLToPath(import.meta.url))
const pruiSrc = (...p: string[]) => resolve(here, "../packages/prui/src", ...p)

// Bundle the library from source: true dogfooding + clean per-layer chunking
// (the prebuilt dist merges shared chunks across layers, which would drag
// pages/Resource code into the landing chunk and break the AC-6 budget).
const pruiAliases = [
  { find: /^prui\/styles\.css$/, replacement: resolve(here, "../packages/prui/dist/prui.css") },
  { find: /^prui\/theme$/, replacement: pruiSrc("theme/index.ts") },
  { find: /^prui\/pages$/, replacement: pruiSrc("pages/index.ts") },
  { find: /^prui\/data-table$/, replacement: pruiSrc("data-table/index.ts") },
  { find: /^prui\/core$/, replacement: pruiSrc("core/index.ts") },
  { find: /^prui$/, replacement: pruiSrc("index.ts") },
  // The site chrome only needs the shell; importing the app-layer barrel
  // would drag Resource/DataTable into the landing chunk (AC-6).
  { find: /^prui\/app-shell$/, replacement: pruiSrc("app/app.tsx") },
  { find: /^prui\/forms$/, replacement: pruiSrc("forms/index.ts") },
  { find: /^prui\/app$/, replacement: pruiSrc("app/index.ts") },
]

/**
 * Group vendor code by the REAL package directory (the segment right after
 * the last node_modules/). Substring checks on the full id are unsafe here:
 * pnpm's virtual-store directory names embed peer suffixes like
 * "_react-dom@19.3.0", so "@dnd-kit/core/..." can contain "react-dom" and
 * get hijacked into the wrong chunk — differently per platform.
 */
function vendorPackage(id: string): string | undefined {
  const marker = id.lastIndexOf("node_modules/")
  if (marker === -1) return
  const rest = id.slice(marker + "node_modules/".length)
  const m = rest.match(/^(@[^/]+\/[^/]+|[^/]+)/)
  const pkg = m?.[1]
  if (!pkg) return
  if (pkg === "react" || pkg === "react-dom" || pkg === "scheduler") return "vendor-react-dom"
  if (pkg === "react-router-dom" || pkg === "@remix-run/router") return "vendor-react-dom"
  if (pkg === "lucide-react") return "vendor-icons"
  if (pkg.startsWith("@dnd-kit/")) return "vendor-dnd"
  if (pkg.startsWith("@monaco-editor/")) return "vendor-monaco"
  return "vendor-misc"
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: pruiAliases,
  },
  build: {
    manifest: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          return vendorPackage(id)
        },
      },
    },
  },
})
