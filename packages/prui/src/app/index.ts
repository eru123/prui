/** PRUI App layer: config-driven super-components. */
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
