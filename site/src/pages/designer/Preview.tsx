import * as React from "react"
import { App, type NavItem } from "prui/app"
import type { DesignerState } from "./state"
import { IframePortal } from "../../components/IframePortal"

/**
 * Live designer canvas (AC-12): the real <App> from the package renders
 * inside an iframe (theme isolation). Theme classes and token overrides are
 * applied to the frame root; the topbar toggle is preview-only styling.
 */
export function DesignerPreview({ state }: { state: DesignerState }) {
  const applyFrame = React.useCallback(
    (doc: Document) => {
      const root = doc.documentElement
      root.classList.add("prui-root", `prui-theme-${state.theme}`, `prui-mode-${state.theme === "daylight" ? "light" : "dark"}`)
      root.dataset.pruiTheme = state.theme
      root.style.colorScheme = state.theme === "daylight" ? "light" : "dark"
      const body = doc.body
      body.style.margin = "0"
      body.style.background = "var(--prui-background)"
      if (state.tokens.brand) body.style.setProperty("--prui-brand", state.tokens.brand)
      else body.style.removeProperty("--prui-brand")
      if (state.tokens.radius) body.style.setProperty("--prui-radius", `${state.tokens.radius}px`)
      else body.style.removeProperty("--prui-radius")
      if (state.tokens.density === "compact") body.style.setProperty("--prui-dim-op", "0.7")
      else body.style.removeProperty("--prui-dim-op")

      let styleEl = doc.getElementById("prui-designer-overrides") as HTMLStyleElement | null
      if (!state.topbar) {
        if (!styleEl) {
          styleEl = doc.createElement("style")
          styleEl.id = "prui-designer-overrides"
          doc.head.appendChild(styleEl)
        }
        styleEl.textContent = `[data-testid="app-header"]{display:none!important}`
      } else if (styleEl) {
        styleEl.remove()
      }
    },
    [state.theme, state.topbar, state.tokens.brand, state.tokens.radius, state.tokens.density],
  )

  const nav: NavItem[] = state.nav

  return (
    <IframePortal title="App preview" testId="designer-canvas" height={560}>
      {(doc) => {
        applyFrame(doc)
        // <App router="memory"> brings its own MemoryRouter: no outer router
        return (
          <App
            router="memory"
            brand={{ name: state.name, mark: state.mark || undefined }}
            nav={nav}
            search={{ enabled: state.palette, hotkey: "/" }}
            theme={false}
            sidebar={{ width: state.sidebarWidth, collapsible: state.sidebarCollapsible }}
          >
              <div className="p-6">
                <p className="mb-3 text-xs text-[var(--prui-dim)]">
                  Content outlet: your routes render here.
                </p>
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-16 flex-1 rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-surface)]"
                    />
                  ))}
                </div>
              </div>
          </App>
        )
      }}
    </IframePortal>
  )
}
