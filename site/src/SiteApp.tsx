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
const TokensDoc = lazy(() => import("./pages/docs/GuidesDoc").then((m) => ({ default: m.TokensDoc })))
const ArchitectureDoc = lazy(() => import("./pages/docs/GuidesDoc").then((m) => ({ default: m.ArchitectureDoc })))
const AccessibilityDoc = lazy(() => import("./pages/docs/GuidesDoc").then((m) => ({ default: m.AccessibilityDoc })))
const SSRDoc = lazy(() => import("./pages/docs/GuidesDoc").then((m) => ({ default: m.SSRDoc })))
const PerformanceDoc = lazy(() => import("./pages/docs/GuidesDoc").then((m) => ({ default: m.PerformanceDoc })))
const I18nDoc = lazy(() => import("./pages/docs/GuidesDoc").then((m) => ({ default: m.I18nDoc })))
const ChangelogDoc = lazy(() => import("./pages/docs/GuidesDoc").then((m) => ({ default: m.ChangelogDoc })))
const MigrationDoc = lazy(() => import("./pages/docs/GuidesDoc").then((m) => ({ default: m.MigrationDoc })))
const AlertDocPage = lazy(() => import("./pages/docs/FeedbackDocs").then((m) => ({ default: m.AlertDoc })))
const ToastDocPage = lazy(() => import("./pages/docs/FeedbackDocs").then((m) => ({ default: m.ToastDoc })))
const ProgressDocPage = lazy(() => import("./pages/docs/FeedbackDocs").then((m) => ({ default: m.ProgressDoc })))
const SkeletonDocPage = lazy(() => import("./pages/docs/FeedbackDocs").then((m) => ({ default: m.SkeletonDoc })))
const SpinnerDocPage = lazy(() => import("./pages/docs/FeedbackDocs").then((m) => ({ default: m.SpinnerDoc })))
const TooltipDocPage = lazy(() => import("./pages/docs/AnchoredDocs").then((m) => ({ default: m.TooltipDoc })))
const PopoverDocPage = lazy(() => import("./pages/docs/AnchoredDocs").then((m) => ({ default: m.PopoverDoc })))
const CheckboxDocPage = lazy(() => import("./pages/docs/InputsDocs").then((m) => ({ default: m.CheckboxDoc })))
const RadioDocPage = lazy(() => import("./pages/docs/InputsDocs").then((m) => ({ default: m.RadioDoc })))
const ComboboxDocPage = lazy(() => import("./pages/docs/InputsDocs").then((m) => ({ default: m.ComboboxDoc })))
const FileUploadDocPage = lazy(() => import("./pages/docs/InputsDocs").then((m) => ({ default: m.FileUploadDoc })))
const AccordionDocPage = lazy(() => import("./pages/docs/NavigationDocs").then((m) => ({ default: m.AccordionDoc })))
const BreadcrumbDocPage = lazy(() => import("./pages/docs/NavigationDocs").then((m) => ({ default: m.BreadcrumbDoc })))
const TreeViewDocPage = lazy(() => import("./pages/docs/NavigationDocs").then((m) => ({ default: m.TreeViewDoc })))
const TimelineDocPage = lazy(() => import("./pages/docs/NavigationDocs").then((m) => ({ default: m.TimelineDoc })))
const DrawerDocPage = lazy(() => import("./pages/docs/OverlayDocs").then((m) => ({ default: m.DrawerDoc })))
const SheetDocPage = lazy(() => import("./pages/docs/OverlayDocs").then((m) => ({ default: m.SheetDoc })))
const CalendarDocPage = lazy(() => import("./pages/docs/DatesDocs").then((m) => ({ default: m.CalendarDoc })))
const DatePickerDocPage = lazy(() => import("./pages/docs/DatesDocs").then((m) => ({ default: m.DatePickerDoc })))
const DateRangePickerDocPage = lazy(() => import("./pages/docs/DatesDocs").then((m) => ({ default: m.DateRangePickerDoc })))
const TimePickerDocPage = lazy(() => import("./pages/docs/DatesDocs").then((m) => ({ default: m.TimePickerDoc })))
const TimeRangePickerDocPage = lazy(() => import("./pages/docs/DatesDocs").then((m) => ({ default: m.TimeRangePickerDoc })))
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
const TagInputDoc = lazy(() => import("./pages/docs/TagInputDoc").then((m) => ({ default: m.TagInputDoc })))
const FormFieldDoc = lazy(() => import("./pages/docs/FormFieldDoc").then((m) => ({ default: m.FormFieldDoc })))
const ScrollAreaDoc = lazy(() => import("./pages/docs/ScrollAreaDoc").then((m) => ({ default: m.ScrollAreaDoc })))
const AppLayerDoc = lazy(() => import("./pages/docs/AppLayerDoc").then((m) => ({ default: m.AppLayerDoc })))
const PagesDoc = lazy(() => import("./pages/docs/PagesDoc").then((m) => ({ default: m.PagesDoc })))
const FormsPage = lazy(() => import("./pages/FormsPage").then((m) => ({ default: m.FormsPage })))
const IconsPage = lazy(() => import("./pages/IconsPage").then((m) => ({ default: m.IconsPage })))
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
          <Route path="/components/tag-input" element={<TagInputDoc />} />
          <Route path="/components/form-field" element={<FormFieldDoc />} />
          <Route path="/components/scroll-area" element={<ScrollAreaDoc />} />
          <Route path="/app-layer" element={<AppLayerDoc />} />
          <Route path="/pages-doc" element={<PagesDoc />} />
          <Route path="/layouts" element={<LayoutsCatalogPage />} />
          <Route path="/layouts/:slug" element={<LayoutDemoPage />} />
          <Route path="/layouts/:slug/code" element={<LayoutCodePage />} />
          <Route path="/forms" element={<FormsPage />} />
          <Route path="/icons" element={<IconsPage />} />
          <Route path="/theme-builder" element={<ThemeBuilderPage />} />
          <Route path="/theming" element={<ThemingPage />} />
          <Route path="/guides" element={<Navigate to="/guides/installation" replace />} />
          <Route path="/guides/installation" element={<InstallationPage />} />
          <Route path="/guides/adoption" element={<AdoptionPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/resources" element={<ResourcesDemoPage />} />
          <Route path="/components/alert" element={<AlertDocPage />} />
          <Route path="/components/toast" element={<ToastDocPage />} />
          <Route path="/components/progress" element={<ProgressDocPage />} />
          <Route path="/components/skeleton" element={<SkeletonDocPage />} />
          <Route path="/components/spinner" element={<SpinnerDocPage />} />
          <Route path="/components/tooltip" element={<TooltipDocPage />} />
          <Route path="/components/popover" element={<PopoverDocPage />} />
          <Route path="/components/checkbox" element={<CheckboxDocPage />} />
          <Route path="/components/radio" element={<RadioDocPage />} />
          <Route path="/components/combobox" element={<ComboboxDocPage />} />
          <Route path="/components/file-upload" element={<FileUploadDocPage />} />
          <Route path="/components/accordion" element={<AccordionDocPage />} />
          <Route path="/components/breadcrumb" element={<BreadcrumbDocPage />} />
          <Route path="/components/tree-view" element={<TreeViewDocPage />} />
          <Route path="/components/timeline" element={<TimelineDocPage />} />
          <Route path="/components/drawer" element={<DrawerDocPage />} />
          <Route path="/components/sheet" element={<SheetDocPage />} />
          <Route path="/components/calendar" element={<CalendarDocPage />} />
          <Route path="/components/date-picker" element={<DatePickerDocPage />} />
          <Route path="/components/date-range-picker" element={<DateRangePickerDocPage />} />
          <Route path="/components/time-picker" element={<TimePickerDocPage />} />
          <Route path="/components/time-range-picker" element={<TimeRangePickerDocPage />} />
          <Route path="/guides/design-tokens" element={<TokensDoc />} />
          <Route path="/guides/architecture" element={<ArchitectureDoc />} />
          <Route path="/guides/accessibility" element={<AccessibilityDoc />} />
          <Route path="/guides/ssr" element={<SSRDoc />} />
          <Route path="/guides/performance" element={<PerformanceDoc />} />
          <Route path="/guides/i18n" element={<I18nDoc />} />
          <Route path="/changelog" element={<ChangelogDoc />} />
          <Route path="/migration" element={<MigrationDoc />} />
          <Route path="/internal/provenance" element={<ProvenancePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </App>
  )
}
