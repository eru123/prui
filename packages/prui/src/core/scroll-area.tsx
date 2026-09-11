import * as React from "react"
import { cn } from "./cn"
import type { PropsMeta } from "./props-meta"

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Max height in px before scrolling. */
  maxHeight?: number | string
}

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, maxHeight, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("prui-scroll-area relative overflow-y-auto", className)}
      style={maxHeight !== undefined ? { maxHeight } : undefined}
      {...props}
    >
      {children}
    </div>
  ),
)
ScrollArea.displayName = "ScrollArea"

export const scrollAreaPropsMeta: PropsMeta = {
  name: "ScrollArea",
  props: [
    { name: "maxHeight", type: "number | string", default: "undefined", control: "number" },
    { name: "children", type: "ReactNode", default: null, control: "text" },
  ],
}
