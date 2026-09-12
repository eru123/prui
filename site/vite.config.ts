import { defineConfig, type Plugin } from "vite"
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
  // lucide-react must split naturally: its root module carries the full icon
  // catalog (the icons map export), and the site chrome only needs a handful
  // of nav icons. A shared chunk would drag 700KB of icons into every page's
  // static graph, so no manual grouping here.
  if (pkg.startsWith("@dnd-kit/")) return "vendor-dnd"
  if (pkg.startsWith("@monaco-editor/")) return "vendor-monaco"
  if (pkg === "lucide-react") return undefined // natural split: chrome uses a few icons, the catalog page pulls the rest lazily
  return "vendor-misc"
}

// The lucide root module re-exports the full icon catalog through its
// `icons` map. Any static use of the root (even one spinner icon) would
// pull all 1600 icons into the static graph, so the site build strips the
// map; the icons page imports the catalog lazily via a deep path instead.
function stripLucideIconsMap(): Plugin {
  return {
    name: "strip-lucide-icons-map",
    transform(code, id) {
      const norm = id.split("\\").join("/")
      if (!norm.includes("lucide-react") || !norm.endsWith("dist/esm/lucide-react.js")) return
      return code
        .replace(/import \* as index from ['"]\.\/icons\/index\.js['"];?/, "")
        .replace(/export \{ index as icons \};?/, "")
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), stripLucideIconsMap()],
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
