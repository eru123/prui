import type { NavItem } from "prui/app"
import { BookOpen, Palette, Layers, LayoutTemplate, PenTool } from "lucide-react"

export const nav: NavItem[] = [
  { label: "Introduction", href: "/", icon: BookOpen },
  {
    label: "Components",
    icon: Layers,
    items: [
      { label: "Primitives", heading: true },
      { label: "Button", href: "/components/button" },
      { label: "Input", href: "/components/input" },
      { label: "Select", href: "/components/select" },
      { label: "Switch", href: "/components/switch" },
      { label: "Tabs", href: "/components/tabs" },
      { label: "Badge", href: "/components/badge" },
      { label: "Dropdown", href: "/components/dropdown" },
      { label: "Avatar", href: "/components/avatar" },
      { label: "Modal", href: "/components/modal" },
      { label: "Data", heading: true },
      { label: "DataTable", href: "/components/data-table" },
      { label: "Resource", href: "/components#resource" },
    ],
  },
  {
    label: "Layouts",
    icon: LayoutTemplate,
    items: [
      { label: "Layouts", heading: true },
      { label: "Dashboard", href: "/layouts#dashboard" },
      { label: "Listing", href: "/layouts#listing" },
      { label: "Settings", href: "/layouts#settings" },
      { label: "Auth", href: "/layouts#auth" },
    ],
  },
  {
    label: "Theming",
    icon: Palette,
    items: [
      { label: "Token reference", href: "/theming#tokens" },
      { label: "Named themes", href: "/theming#themes" },
      { label: "Runtime switching", href: "/theming#switching" },
    ],
  },
  {
    label: "Guides",
    icon: BookOpen,
    items: [
      { label: "Installation", href: "/guides#install" },
      { label: "Progressive adoption", href: "/guides#adoption" },
      { label: "Agents", href: "/agents" },
    ],
  },
  { label: "Designer", href: "/designer", icon: PenTool },
]
