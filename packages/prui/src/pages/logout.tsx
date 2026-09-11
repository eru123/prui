import * as React from "react"
import { LogOut } from "lucide-react"
import type { PropsMeta } from "../core/props-meta"
import { PageShell } from "./shared"
import type { BrandConfig } from "../app/app"

export interface LogoutPageProps {
  onLogout?: () => void | Promise<void>
  brand?: BrandConfig
  /** Message shown while the logout runs; defaults to a generic one. */
  message?: React.ReactNode
  loading?: boolean
}

export function LogoutPage({ onLogout, brand, message, loading = false }: LogoutPageProps) {
  React.useEffect(() => {
    if (!onLogout) return
    // Fire and forget: pages that unmount on logout should not block here.
    void onLogout()
  }, [onLogout])

  return (
    <PageShell title="Signing out" brand={brand} width="max-w-xs">
      <div className="flex flex-col items-center gap-3 py-4 text-[var(--prui-dim)]" data-testid="logout-page">
        <LogOut className="h-6 w-6" aria-hidden />
        <p className="text-sm text-center">{message ?? (loading ? "Signing you out..." : "You have been signed out.")}</p>
      </div>
    </PageShell>
  )
}

export const logoutPagePropsMeta: PropsMeta = {
  name: "LogoutPage",
  props: [
    { name: "onLogout", type: "() => void | Promise<void>", default: null, control: "none" },
    { name: "brand", type: "BrandConfig", default: "undefined", control: "object" },
    { name: "message", type: "ReactNode", default: "generic", control: "text" },
    { name: "loading", type: "boolean", default: "false", control: "boolean" },
  ],
}
