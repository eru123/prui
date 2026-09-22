import * as React from "react"
import { cn } from "./cn"
import type { PropsMeta } from "./props-meta"

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "prui-label block text-sm font-medium text-fg select-none",
        className,
      )}
      {...props}
    />
  ),
)
Label.displayName = "Label"

export const labelPropsMeta: PropsMeta = {
  name: "Label",
  props: [
    { name: "htmlFor", type: "string", default: "undefined", control: "text" },
    { name: "children", type: "ReactNode", default: null, control: "text" },
  ],
}

export type SeparatorProps = React.HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical"
}

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = "horizontal", ...props }, ref) => (
    <div
      ref={ref}
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "prui-separator shrink-0 bg-line",
        orientation === "horizontal" ? "h-px w-full" : "w-px h-full min-h-4",
        className,
      )}
      {...props}
    />
  ),
)
Separator.displayName = "Separator"

export const separatorPropsMeta: PropsMeta = {
  name: "Separator",
  props: [
    { name: "orientation", type: "'horizontal' | 'vertical'", default: "'horizontal'", control: "select", options: ["horizontal", "vertical"] },
  ],
}
