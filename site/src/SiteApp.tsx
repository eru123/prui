import { BrowserRouter, Routes, Route } from "react-router-dom"
import { App } from "prui/app"
import { nav } from "./nav"
import { LandingPage } from "./pages/Landing"
import { ComponentsPage } from "./pages/Components"
import { GettingStartedPage, ThemingPage } from "./pages/GettingStarted"
import { ResourcesDemoPage } from "./pages/ResourcesDemo"
import { NotFoundPage } from "prui/pages"

export function SiteApp() {
  return (
    <App
      brand={{ name: "PRUI", href: "/" }}
      nav={nav}
      search={{ enabled: true, hotkey: "/" }}
      theme={{ default: "control", persist: true }}
    >
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/components" element={<ComponentsPage />} />
        <Route path="/getting-started" element={<GettingStartedPage />} />
        <Route path="/theming" element={<ThemingPage />} />
        <Route path="/resources" element={<ResourcesDemoPage />} />
        <Route path="*" element={<NotFoundPage brand={{ name: "PRUI" }} />} />
      </Routes>
    </App>
  )
}
