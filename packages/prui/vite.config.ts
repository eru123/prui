import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import dts from "vite-plugin-dts"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { readdirSync } from "node:fs"

const r = (p: string) => resolve(fileURLToPath(new URL(".", import.meta.url)), p)

// per-primitive entries: src/core/button.tsx -> entry "core/button"
const coreDir = r("src/core")
const coreEntries = Object.fromEntries(
  readdirSync(coreDir)
    .filter((f) => /^(?!index).*\.(ts|tsx)$/.test(f) && !f.includes(".test."))
    .map((f) => {
      const name = f.replace(/\.(ts|tsx)$/, "")
      return [`core/${name}`, resolve(coreDir, f)]
    }),
)

export default defineConfig({
  plugins: [
    react(),
    dts({
      entryRoot: "src",
      tsconfigPath: "./tsconfig.json",
      exclude: ["src/**/*.test.tsx", "src/**/*.test.ts", "src/test/**", "*.config.ts"],
    }),
  ],
  build: {
    lib: {
      entry: {
        index: r("src/index.ts"),
        core: r("src/core/index.ts"),
        ...coreEntries,
        app: r("src/app/index.ts"),
        forms: r("src/forms/index.ts"),
        i18n: r("src/i18n/index.tsx"),
        pages: r("src/pages/index.ts"),
        "data-table": r("src/data-table/index.ts"),
        theme: r("src/theme/index.ts"),
      },
      formats: ["es"],
    },
    rollupOptions: {
      external: [
        "react",
        "react/jsx-runtime",
        "react-dom",
        "react-dom/client",
        "react-router-dom",
        "lucide-react",
        "clsx",
        "tailwind-merge",
      ],
      output: {
        chunkFileNames: "chunks/[name]-[hash].js",
      },
    },
  },
})
