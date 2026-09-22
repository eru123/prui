import * as React from "react"
import { cn } from "../core/cn"
import type { BrandConfig } from "./app"

/**
 * AuthShell: the centered card layout for login/OTP/session-timeout screens
 * (proposal: app-layer component sourced from HRLabs' auth screens). Brand
 * mark on top, card below, full-viewport centering.
 */

export interface AuthShellProps {
  title: string
  description?: React.ReactNode
  brand?: BrandConfig
  /** Column width class for the card. Default max-w-sm. */
  width?: string
  footer?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

export function AuthShell({ title, description, brand, width = "max-w-sm", footer, children, className }: AuthShellProps) {
  return (
    <div className={cn("prui-auth-shell flex min-h-dvh items-center justify-center bg-background p-4", className)} data-testid="auth-shell">
      <div className={cn("w-full", width)}>
        {brand ? (
          <div className="mb-6 flex items-center justify-center gap-2" data-testid="auth-shell-brand">
            {brand.mark ? <img src={brand.mark} alt="" className="h-8 w-8 rounded-prui-sm object-cover" /> : null}
            <span className="text-lg font-semibold text-fg">{brand.name}</span>
          </div>
        ) : null}
        <div className="rounded-prui border border-line bg-surface p-6">
          <div className="mb-4 flex flex-col gap-1 text-center">
            <h1 className="text-lg font-semibold text-fg">{title}</h1>
            {description ? <p className="text-sm text-dim">{description}</p> : null}
          </div>
          {children}
          {footer ? <div className="mt-4 text-center text-sm text-dim">{footer}</div> : null}
        </div>
      </div>
    </div>
  )
}

export const authShellPropsMeta = {
  name: "AuthShell",
  props: [
    { name: "title", type: "string", default: null, control: "text" },
    { name: "description", type: "ReactNode", default: null, control: "text" },
    { name: "brand", type: "{ name, mark?, href? }", default: "undefined", control: "object" },
    { name: "width", type: "string", default: "'max-w-sm'", control: "text" },
    { name: "footer", type: "ReactNode", default: null, control: "none" },
    { name: "children", type: "ReactNode", default: null, control: "none" },
  ],
} as const
