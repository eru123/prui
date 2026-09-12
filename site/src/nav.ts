import type { NavItem } from "prui/app"
import { BookOpen, Palette, Layers, LayoutTemplate, PenTool, ClipboardPen } from "lucide-react"

export const nav: NavItem[] = [
  { label: "Introduction", href: "/", icon: BookOpen },
  {
    label: "Components",
    icon: Layers,
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
      { label: "Pre-made pages", href: "/pages-doc" },
    ],
  },
  { label: "Layouts", href: "/layouts", icon: LayoutTemplate },
  { label: "Theming", href: "/theming", icon: Palette },
  { label: "Forms", href: "/forms", icon: ClipboardPen },
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
