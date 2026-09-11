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
const ButtonDoc = lazy(() => import("./pages/docs/ButtonDoc").then((m) => ({ default: m.ButtonDoc })))
const InputDoc = lazy(() => import("./pages/docs/InputDoc").then((m) => ({ default: m.InputDoc })))
const ModalDoc = lazy(() => import("./pages/docs/ModalDoc").then((m) => ({ default: m.ModalDoc })))
const SelectDoc = lazy(() => import("./pages/docs/SelectDoc").then((m) => ({ default: m.SelectDoc })))
const SwitchDoc = lazy(() => import("./pages/docs/SwitchDoc").then((m) => ({ default: m.SwitchDoc })))
const TabsDoc = lazy(() => import("./pages/docs/TabsDoc").then((m) => ({ default: m.TabsDoc })))
const BadgeDoc = lazy(() => import("./pages/docs/BadgeDoc").then((m) => ({ default: m.BadgeDoc })))
const DropdownDoc = lazy(() => import("./pages/docs/DropdownDoc").then((m) => ({ default: m.DropdownDoc })))
const AvatarDoc = lazy(() => import("./pages/docs/AvatarDoc").then((m) => ({ default: m.AvatarDoc })))
const DataTableDoc = lazy(() => import("./pages/docs/DataTableDoc").then((m) => ({ default: m.DataTableDoc })))

function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center font-mono text-xs text-[var(--prui-dim)]">loading…</div>
  )
}

export function SiteApp() {
  return (
    <App
      brand={{ name: "prui", mark: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2032%2032%22%3E%3Crect%20x%3D%226%22%20y%3D%225%22%20width%3D%225.4%22%20height%3D%2222%22%20rx%3D%222.7%22%20fill%3D%22%237c9cff%22/%3E%3Crect%20x%3D%2214.2%22%20y%3D%225%22%20width%3D%229.6%22%20height%3D%228.4%22%20rx%3D%222.5%22%20fill%3D%22%237c9cff%22/%3E%3Crect%20x%3D%2214.2%22%20y%3D%2215.4%22%20width%3D%227%22%20height%3D%228.4%22%20rx%3D%222.5%22%20fill%3D%22%237c9cff%22%20opacity%3D%22.55%22/%3E%3C/svg%3E", href: "/" }}
      nav={nav}
      search={{ enabled: true, hotkey: "/", placeholder: "Search the system" }}
      theme={{ default: "control", persist: true }}
      sidebar={{ width: 240 }}
    >
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/components" element={<ComponentsPage />} />
          <Route path="/components/button" element={<ButtonDoc />} />
          <Route path="/components/input" element={<InputDoc />} />
          <Route path="/components/modal" element={<ModalDoc />} />
          <Route path="/components/select" element={<SelectDoc />} />
          <Route path="/components/switch" element={<SwitchDoc />} />
          <Route path="/components/tabs" element={<TabsDoc />} />
          <Route path="/components/badge" element={<BadgeDoc />} />
          <Route path="/components/dropdown" element={<DropdownDoc />} />
          <Route path="/components/avatar" element={<AvatarDoc />} />
          <Route path="/components/data-table" element={<DataTableDoc />} />
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
