import { Suspense, lazy } from "react"
import { Routes, Route } from "react-router-dom"
import { App } from "prui/app"
import { nav } from "./nav"
import { LandingPage } from "./pages/Landing"

// Lazy routes keep the landing bundle small (AC-6): only the landing ships in
// the initial chunk; every other page streams on demand.
const ComponentsPage = lazy(() => import("./pages/Components").then((m) => ({ default: m.ComponentsPage })))
const LayoutsPage = lazy(() => import("./pages/Layouts").then((m) => ({ default: m.LayoutsPage })))
const ThemingPage = lazy(() => import("./pages/Theming").then((m) => ({ default: m.ThemingPage })))
const GuidesPage = lazy(() => import("./pages/Guides").then((m) => ({ default: m.GuidesPage })))
const AgentsPage = lazy(() => import("./pages/Guides").then((m) => ({ default: m.AgentsPage })))
const ResourcesDemoPage = lazy(() => import("./pages/ResourcesDemo").then((m) => ({ default: m.ResourcesDemoPage })))
const DesignerPage = lazy(() => import("./pages/Designer").then((m) => ({ default: m.DesignerPage })))
const NotFoundPage = lazy(() => import("./NotFound").then((m) => ({ default: m.NotFoundPage })))
const ProvenancePage = lazy(() => import("./pages/Provenance").then((m) => ({ default: m.ProvenancePage })))

function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center font-mono text-xs text-[var(--prui-dim)]">loading…</div>
  )
}

export function SiteApp() {
  return (
    <App
      brand={{ name: "prui", href: "/" }}
      nav={nav}
      search={{ enabled: true, hotkey: "/", placeholder: "Search the system" }}
      theme={{ default: "control", persist: true }}
      sidebar={{ width: 240 }}
    >
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/components" element={<ComponentsPage />} />
          <Route path="/layouts" element={<LayoutsPage />} />
          <Route path="/theming" element={<ThemingPage />} />
          <Route path="/guides" element={<GuidesPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/resources" element={<ResourcesDemoPage />} />
          <Route path="/designer" element={<DesignerPage />} />
          <Route path="/internal/provenance" element={<ProvenancePage />} />
          <Route path="*" element={<NotFoundPage brand={{ name: "prui" }} />} />
        </Routes>
      </Suspense>
    </App>
  )
}
