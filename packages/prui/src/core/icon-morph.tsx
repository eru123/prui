import * as React from "react"
import { cn } from "./cn"

/**
 * IconMorph: two icons stacked in one cell, crossfading with a slight
 * rotate/scale so a state change (copy → check) reads as one continuous
 * gesture instead of a blink. Pure CSS transitions; reduced motion is
 * respected globally through the transition media query in base.css.
 */

export interface IconMorphProps {
  /** Icon shown when inactive. */
  from: React.ReactNode
  /** Icon shown when active. */
  to: React.ReactNode
  active: boolean
  className?: string
}

export function IconMorph({ from, to, active, className }: IconMorphProps) {
  return (
    <span data-active={active || undefined} className={cn("prui-icon-morph relative inline-grid place-items-center", className)}>
      <span
        aria-hidden={!active || undefined}
        className={cn(
          "col-start-1 row-start-1 transition-all duration-200 ease-prui",
          active ? "scale-50 -rotate-45 opacity-0" : "scale-100 rotate-0 opacity-100",
        )}
      >
        {from}
      </span>
      <span
        aria-hidden={active ? undefined : true}
        className={cn(
          "col-start-1 row-start-1 transition-all duration-200 ease-prui",
          active ? "scale-100 rotate-0 opacity-100" : "scale-50 rotate-45 opacity-0",
        )}
      >
        {to}
      </span>
    </span>
  )
}
