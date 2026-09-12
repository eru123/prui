import type { NavItem } from "prui/app"
import { BookOpenIcon, PaletteIcon, LayersIcon } from "./nav-icons"

export const nav: NavItem[] = [
  { label: "Introduction", href: "/", icon: BookOpenIcon },
  {
    label: "Guides",
    items: [
      { label: "Installation", href: "/guides/installation" },
      { label: "Progressive adoption", href: "/guides/adoption" },
      { label: "Agents", href: "/agents" },
    ],
  },
  {
    label: "Appearance",
    icon: PaletteIcon,
    items: [
      { label: "Icons", href: "/icons" },
      { label: "Layouts", href: "/layouts" },
      { label: "Theming", href: "/theming" },
      { label: "Theme builder", href: "/theme-builder" },
    ],
  },
  {
    label: "Components",
    icon: LayersIcon,
    items: [
      { label: "Primitives", heading: true },
      { label: "Button", href: "/components/button" },
      { label: "Input", href: "/components/input" },
      { label: "Textarea", href: "/components/textarea" },
      { label: "Select", href: "/components/select" },
      { label: "Switch", href: "/components/switch" },
      { label: "Tabs", href: "/components/tabs" },
      { label: "Badge", href: "/components/badge" },
      { label: "Card", href: "/components/card" },
      { label: "Avatar", href: "/components/avatar" },
      { label: "Label", href: "/components/label" },
      { label: "Separator", href: "/components/separator" },
      { label: "Scroll area", href: "/components/scroll-area" },
      { label: "Dialog", href: "/components/dialog" },
      { label: "Dropdown", href: "/components/dropdown" },
      { label: "Modal", href: "/components/modal" },
      { label: "Shell & data", heading: true },
      { label: "App layer", href: "/app-layer" },
      { label: "DataTable", href: "/components/data-table" },
      { label: "Resource", href: "/resources" },
      { label: "Forms", href: "/forms" },
      { label: "Pre-made pages", href: "/pages-doc" },
    ],
  },
]
