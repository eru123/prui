import { Suspense, lazy } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { App } from "prui/app-shell"
import { nav } from "./nav"
import { LandingPage } from "./pages/Landing"

// Lazy routes keep the landing bundle small (AC-6): only the landing ships in
// the initial chunk; every other page streams on demand.
const ComponentsPage = lazy(() => import("./pages/Components").then((m) => ({ default: m.ComponentsPage })))
const LayoutsCatalogPage = lazy(() => import("./pages/layouts/LayoutsPages").then((m) => ({ default: m.LayoutsCatalogPage })))
const LayoutDemoPage = lazy(() => import("./pages/layouts/LayoutsPages").then((m) => ({ default: m.LayoutDemoPage })))
const LayoutCodePage = lazy(() => import("./pages/layouts/LayoutsPages").then((m) => ({ default: m.LayoutCodePage })))
const ThemingPage = lazy(() => import("./pages/Theming").then((m) => ({ default: m.ThemingPage })))
const InstallationPage = lazy(() => import("./pages/Guides").then((m) => ({ default: m.InstallationPage })))
const AdoptionPage = lazy(() => import("./pages/Guides").then((m) => ({ default: m.AdoptionPage })))
const AgentsPage = lazy(() => import("./pages/Guides").then((m) => ({ default: m.AgentsPage })))
const ResourcesDemoPage = lazy(() => import("./pages/ResourcesDemo").then((m) => ({ default: m.ResourcesDemoPage })))
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
const CardDoc = lazy(() => import("./pages/docs/CardDoc").then((m) => ({ default: m.CardDoc })))
const DialogDoc = lazy(() => import("./pages/docs/DialogDoc").then((m) => ({ default: m.DialogDoc })))
const LabelDoc = lazy(() => import("./pages/docs/LabelDoc").then((m) => ({ default: m.LabelDoc })))
const SeparatorDoc = lazy(() => import("./pages/docs/SeparatorDoc").then((m) => ({ default: m.SeparatorDoc })))
const TextareaDoc = lazy(() => import("./pages/docs/TextareaDoc").then((m) => ({ default: m.TextareaDoc })))
const ScrollAreaDoc = lazy(() => import("./pages/docs/ScrollAreaDoc").then((m) => ({ default: m.ScrollAreaDoc })))
const AppLayerDoc = lazy(() => import("./pages/docs/AppLayerDoc").then((m) => ({ default: m.AppLayerDoc })))
const PagesDoc = lazy(() => import("./pages/docs/PagesDoc").then((m) => ({ default: m.PagesDoc })))
const FormsPage = lazy(() => import("./pages/FormsPage").then((m) => ({ default: m.FormsPage })))
const ThemeBuilderPage = lazy(() => import("./pages/ThemeBuilder").then((m) => ({ default: m.ThemeBuilderPage })))

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
      expandAllOn="/"
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
          <Route path="/components/card" element={<CardDoc />} />
          <Route path="/components/dialog" element={<DialogDoc />} />
          <Route path="/components/label" element={<LabelDoc />} />
          <Route path="/components/separator" element={<SeparatorDoc />} />
          <Route path="/components/textarea" element={<TextareaDoc />} />
          <Route path="/components/scroll-area" element={<ScrollAreaDoc />} />
          <Route path="/app-layer" element={<AppLayerDoc />} />
          <Route path="/pages-doc" element={<PagesDoc />} />
          <Route path="/layouts" element={<LayoutsCatalogPage />} />
          <Route path="/layouts/:slug" element={<LayoutDemoPage />} />
          <Route path="/layouts/:slug/code" element={<LayoutCodePage />} />
          <Route path="/forms" element={<FormsPage />} />
          <Route path="/theme-builder" element={<ThemeBuilderPage />} />
          <Route path="/theming" element={<ThemingPage />} />
          <Route path="/guides" element={<Navigate to="/guides/installation" replace />} />
          <Route path="/guides/installation" element={<InstallationPage />} />
          <Route path="/guides/adoption" element={<AdoptionPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/resources" element={<ResourcesDemoPage />} />
          <Route path="/internal/provenance" element={<ProvenancePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </App>
  )
}
