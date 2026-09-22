import type { ComponentType } from "react"

declare global {
  // set once the icons page's lazy catalog chunk has loaded
  var __lucideIcons: Record<string, ComponentType<{ className?: string }>> | undefined
}

declare module "lucide-react/dist/esm/icons/index.js" {
  const icons: Record<string, ComponentType<{ className?: string }>>
  export default icons
  export { icons }
}
