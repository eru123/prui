/** PRUI App layer: config-driven super-components. */
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
