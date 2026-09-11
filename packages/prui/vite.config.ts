import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import dts from "vite-plugin-dts"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"

const r = (p: string) => resolve(fileURLToPath(new URL(".", import.meta.url)), p)

export default defineConfig({
  plugins: [
    react(),
    dts({
      entryRoot: "src",
      tsconfigPath: "./tsconfig.json",
      exclude: ["src/**/*.test.tsx", "src/**/*.test.ts", "src/test/**"],
    }),
  ],
  build: {
    lib: {
      entry: {
        index: r("src/index.ts"),
        core: r("src/core/index.ts"),
        app: r("src/app/index.ts"),
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
