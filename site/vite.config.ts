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
  { find: /^prui\/app$/, replacement: pruiSrc("app/index.ts") },
  { find: /^prui\/pages$/, replacement: pruiSrc("pages/index.ts") },
  { find: /^prui\/data-table$/, replacement: pruiSrc("data-table/index.ts") },
  { find: /^prui\/core$/, replacement: pruiSrc("core/index.ts") },
  { find: /^prui$/, replacement: pruiSrc("index.ts") },
]

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: pruiAliases,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-dom") || id.includes("scheduler")) return "vendor-react-dom"
            if (id.includes("/react/") || id.includes("react-router") || id.includes("@remix-run")) return "vendor-react"
            if (id.includes("lucide-react")) return "vendor-icons"
            return "vendor-misc"
          }
          if (id.includes("packages/prui/src")) {
            if (id.includes("/src/app/") || id.includes("/src/data-table/")) return "prui-app"
            if (id.includes("/src/pages/")) return "prui-pages"
            if (id.includes("/src/core/") || id.includes("/src/theme/")) return "prui-core"
            return "prui-misc"
          }
        },
      },
    },
  },
})
