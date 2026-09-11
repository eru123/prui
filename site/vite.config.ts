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
  { find: /^prui\/app$/, replacement: pruiSrc("app/index.ts") },
]

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: pruiAliases,
  },
  build: {
    manifest: true,
    rollupOptions: {
      output: {
        // Vendor code is grouped per family so the landing never downloads
        // designer/editor-only deps (AC-6); prui source splits naturally.
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-dom") || id.includes("scheduler")) return "vendor-react-dom"
            if (id.includes("/react/")) return "vendor-react"
            if (id.includes("react-router") || id.includes("@remix-run")) return "vendor-react-dom"
            if (id.includes("@dnd-kit")) return "vendor-dnd"
            if (id.includes("@monaco-editor") || id.includes("monaco-editor")) return "vendor-monaco"
            return "vendor-misc"
          }
        },
      },
    },
  },
})
