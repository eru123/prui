import * as React from "react"
import { ExternalLink } from "lucide-react"

/**
 * Online playground links. Renders buttons that POST the snippet to
 * StackBlitz (open-in-editor of a fresh Vite + prui project) and to
 * CodeSandbox's define API, so every documented example is one click from
 * running code.
 */

const APP_TSX_HEADER = `import { createRoot } from 'react-dom/client'
import '@skiddph/prui/styles.css'
import { App } from '@skiddph/prui/app'
import Demo from './Demo'

createRoot(document.getElementById('root')!).render(
  <App brand={{ name: 'PRUI playground' }} nav={[{ label: 'Home', href: '/' }]}>
    <Demo />
  </App>,
)
`

const DEMO_WRAPPER = `import { App } from '@skiddph/prui/app'
import '@skiddph/prui/styles.css'

export default function Demo() {
  return (
    <div style={{ padding: 24 }}>
__SNIPPET__
    </div>
  )
}
`

const INDEX_HTML = `<!doctype html>
<html>
  <head><meta charset="utf-8" /><title>PRUI playground</title></head>
  <body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body>
</html>
`

const PACKAGE_JSON = JSON.stringify(
  {
    name: "prui-playground",
    private: true,
    type: "module",
    dependencies: {
      "@skiddph/prui": "^0.7.0",
      react: "^19.0.0",
      "react-dom": "^19.0.0",
      "react-router-dom": "^7.6.0",
      "lucide-react": "^0.525.0",
    },
    devDependencies: {
      "@vitejs/plugin-react": "^4.5.0",
      typescript: "^5.9.0",
      vite: "^6.3.0",
    },
  },
  null,
  2,
)

const VITE_CONFIG = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({ plugins: [react()] })
`

export function PlaygroundLinks({ snippet, name }: { snippet: string; name?: string }) {
  const demo = DEMO_WRAPPER.replace("__SNIPPET__", snippet.split("\n").map((l) => "      " + l).join("\n"))

  const stackblitz = (e: React.MouseEvent) => {
    e.preventDefault()
    const form = document.createElement("form")
    form.method = "POST"
    form.action = "https://stackblitz.com/fork/vitejs-vite-react-ts?file=src%2FDemo.tsx"
    form.target = "_blank"
    const files: Record<string, string> = {
      "index.html": INDEX_HTML,
      "package.json": PACKAGE_JSON,
      "vite.config.ts": VITE_CONFIG,
      "src/main.tsx": APP_TSX_HEADER,
      "src/Demo.tsx": demo,
    }
    for (const [path, content] of Object.entries(files)) {
      const input = document.createElement("input")
      input.type = "hidden"
      input.name = `project[files][${path}]`
      input.value = content
      form.appendChild(input)
    }
    const title = document.createElement("input")
    title.type = "hidden"
    title.name = "project[title]"
    title.value = `PRUI playground${name ? ` — ${name}` : ""}`
    form.appendChild(title)
    document.body.appendChild(form)
    form.submit()
    form.remove()
  }

  const codesandbox = (e: React.MouseEvent) => {
    e.preventDefault()
    const form = document.createElement("form")
    form.method = "POST"
    form.action = "https://codesandbox.io/api/v1/sandboxes/define"
    form.target = "_blank"
    const parameters = {
      files: {
        "package.json": { content: PACKAGE_JSON },
        "index.html": { content: INDEX_HTML },
        "vite.config.ts": { content: VITE_CONFIG },
        "src/main.tsx": { content: APP_TSX_HEADER },
        "src/Demo.tsx": { content: demo },
      },
    }
    const input = document.createElement("input")
    input.type = "hidden"
    input.name = "parameters"
    input.value = JSON.stringify(parameters)
    form.appendChild(input)
    document.body.appendChild(form)
    form.submit()
    form.remove()
  }

  return (
    <div className="mt-1 flex items-center gap-2 text-xs text-[var(--prui-dim)]">
      <span>Open in:</span>
      <button
        type="button"
        onClick={stackblitz}
        className="inline-flex cursor-pointer items-center gap-1 rounded-[var(--prui-radius-1)] border border-[var(--prui-line)] px-2 py-0.5 transition-colors hover:border-[var(--prui-dim)] hover:text-[var(--prui-fg)]"
      >
        StackBlitz <ExternalLink className="h-3 w-3" aria-hidden />
      </button>
      <button
        type="button"
        onClick={codesandbox}
        className="inline-flex cursor-pointer items-center gap-1 rounded-[var(--prui-radius-1)] border border-[var(--prui-line)] px-2 py-0.5 transition-colors hover:border-[var(--prui-dim)] hover:text-[var(--prui-fg)]"
      >
        CodeSandbox <ExternalLink className="h-3 w-3" aria-hidden />
      </button>
    </div>
  )
}
