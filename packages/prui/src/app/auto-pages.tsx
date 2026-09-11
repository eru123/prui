import * as React from "react"
import { Routes, Route, Navigate } from "react-router-dom"

/**
 * Pre-made page auto-routing for <App pages="auth"> (AC-2b).
 * Routes the shipped page set so consumers get login/register/forgot/
 * reset/otp/logout (and optionally the utility set) with zero wiring.
 *
 * The pages layer is loaded through a dynamic-import boundary so importing
 * prui/app alone never drags the full pages bundle (landing-budget
 * friendly), and it breaks the app<->pages import cycle (pages import
 * BrandConfig from app).
 */

export type PageSetName =
  | "login"
  | "register"
  | "forgotPassword"
  | "resetPassword"
  | "otp"
  | "logout"
  | "notFound"
  | "error"
  | "profile"
  | "settings"
  | "adminSetup"

export type PagesMode = "auth" | "utility" | "auth+utility"

export type PagesConfig = Partial<Record<PageSetName, Record<string, unknown>>>

export type PageComponent = React.ComponentType<Record<string, unknown>>

const AUTH_ROUTES: { path: string; name: PageSetName }[] = [
  { path: "/login", name: "login" },
  { path: "/register", name: "register" },
  { path: "/forgot-password", name: "forgotPassword" },
  { path: "/reset-password", name: "resetPassword" },
  { path: "/otp", name: "otp" },
  { path: "/logout", name: "logout" },
]

const UTILITY_ROUTES: { path: string; name: PageSetName }[] = [
  { path: "/404", name: "notFound" },
  { path: "/error", name: "error" },
  { path: "/profile", name: "profile" },
  { path: "/settings", name: "settings" },
  { path: "/admin-setup", name: "adminSetup" },
]

export function AutoPages({ mode, config, children }: { mode: PagesMode; config?: PagesConfig; children?: React.ReactNode }) {
  const auth = mode === "auth" || mode === "auth+utility"
  const utility = mode === "utility" || mode === "auth+utility"
  const routes = [
    ...(auth ? AUTH_ROUTES : []),
    ...(utility ? UTILITY_ROUTES : []),
  ]

  const [registry, setRegistry] = React.useState<Record<PageSetName, PageComponent> | null>(null)
  React.useEffect(() => {
    let cancelled = false
    void import("../pages").then((m) => {
      if (!cancelled) setRegistry(m.PagesRegistry)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!registry) {
    return <div className="p-8 text-center text-sm text-[var(--prui-dim)]">Loading…</div>
  }

  return (
    <Routes>
      {routes.map(({ path, name }) => {
        const Component = registry[name]
        if (!Component) return null
        return <Route key={path} path={path} element={<Component {...(config?.[name] ?? {})} />} />
      })}
      {children}
      {auth ? <Route path="*" element={<Navigate to="/login" replace />} /> : null}
    </Routes>
  )
}
