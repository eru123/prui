import type { NavItem } from "prui/app"
import { Home, Layers, BookOpen, Palette, Table2 } from "lucide-react"

export const nav: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Components", href: "/components", icon: Layers },
  { label: "Resources", href: "/resources", icon: Table2 },
  {
    label: "Guides",
    icon: BookOpen,
    items: [
      { label: "Getting started", href: "/getting-started" },
      { label: "Theming", href: "/theming" },
    ],
  },
]
