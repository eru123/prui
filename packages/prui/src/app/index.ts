/** PRUI App layer: config-driven super-components. */

// Route-authoring helpers re-exported so consumer code never imports
// react-router-dom directly — the App layer owns routing.
export { Routes, Route, Outlet, Link, NavLink, Navigate } from "react-router-dom"

export { AutoPages } from "./auto-pages"
export type { PagesMode, PagesConfig, PageSetName } from "./auto-pages"

export {
  App,
  AppShell,
  SidebarNav,
  CommandPalette,
  useThemeState,
  appPropsMeta,
  type AppProps,
  type NavItem,
  type NavIconType,
  type BrandConfig,
  type SearchConfig,
  type ThemeConfig,
  type AuthConfig,
  type SidebarConfig,
  type RouterMode,
  type PaletteEntry,
} from "./app"

export {
  Resource,
  resourcePropsMeta,
  type ResourceProps,
  type ResourceColumn,
  type ResourceRow,
  type ResourceAction,
  type ResourceFilterOptions,
  type ListQuery,
  type ListResult,
} from "./resource"

export {
  Form,
  formPropsMeta,
  type FormProps,
  type FormSchema,
  type FormFieldSchema,
  type FormFieldType,
} from "./form"

export { StatRow, statRowPropsMeta, type StatRowProps, type StatItem } from "./stat-row"
export { Settings, settingsPropsMeta, type SettingsProps, type SettingsSection, type SettingsField } from "./settings"

export {
  SessionTimeout,
  sessionTimeoutPropsMeta,
  type SessionTimeoutProps,
} from "./session-timeout"

export {
  AuthShell,
  authShellPropsMeta,
  type AuthShellProps,
} from "./auth-shell"
