import * as React from "react"
import { LoginPage, RegisterPage, ForgotPasswordPage } from "@skiddph/prui/pages"
import { Dropdown, Avatar, toast } from "@skiddph/prui/core"
import { useLocal } from "./store"

/**
 * localStorage auth: users and the current session live in the store like
 * everything else. The screens are prui's pre-made auth pages; their links
 * switch views through the hash so the SPA never reloads.
 */

export interface AuthUser {
  name: string
  email: string
  password: string
}

interface AuthState {
  users: AuthUser[]
  current: string | null
}

const KEY = "hd.auth"
const seed = (): AuthState => ({
  users: [{ name: "Demo User", email: "demo@helpdesk.io", password: "demo1234" }],
  current: null,
})

export function useAuth() {
  const [auth, setAuth] = useLocal<AuthState>(KEY, seed)
  return {
    user: auth.users.find((u) => u.email === auth.current) ?? null,
    signIn: (email: string, password: string): string | null => {
      const user = auth.users.find((u) => u.email.toLowerCase() === email.toLowerCase())
      if (!user) return "No account with that email — register first."
      if (user.password !== password) return "Wrong password."
      setAuth((prev) => ({ ...prev, current: user.email }))
      return null
    },
    signUp: (name: string, email: string, password: string): string | null => {
      if (auth.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) return "That email is already registered."
      const user = { name, email, password }
      setAuth((prev) => ({ ...prev, users: [...prev.users, user], current: email }))
      return null
    },
    signOut: () => setAuth((prev) => ({ ...prev, current: null })),
  }
}

type View = "login" | "register" | "forgot"

const viewFromHash = (): View =>
  location.hash === "#register" ? "register" : location.hash === "#forgot" ? "forgot" : "login"

export function Gate({ brand, children }: { brand: { name: string }; children: React.ReactNode }) {
  const auth = useAuth()
  const [view, setView] = React.useState<View>(viewFromHash)
  const [error, setError] = React.useState<string | null>(null)
  const [sent, setSent] = React.useState(false)

  React.useEffect(() => {
    const onHash = () => {
      setView(viewFromHash())
      setError(null)
    }
    window.addEventListener("hashchange", onHash)
    return () => window.removeEventListener("hashchange", onHash)
  }, [])

  if (auth.user) return <>{children}</>

  if (view === "register") {
    return (
      <RegisterPage
        brand={brand}
        links={{ login: "#login" }}
        error={error}
        onSubmit={async (v) => {
          const err = auth.signUp(String(v.name ?? ""), String(v.email ?? ""), String(v.password ?? ""))
          setError(err)
          if (!err) toast({ title: `Welcome, ${v.name}`, variant: "success" })
        }}
      />
    )
  }

  if (view === "forgot") {
    return (
      <ForgotPasswordPage
        brand={brand}
        sent={sent}
        links={{ login: "#login", register: "#register" }}
        onSubmit={async () => {
          setSent(true)
          toast({ title: "Reset link sent (to localStorage)", variant: "neutral" })
        }}
      />
    )
  }

  return (
    <LoginPage
      brand={brand}
      oauth={[
        { id: "github", label: "GitHub" },
        { id: "google", label: "Google" },
      ]}
      links={{ register: "#register", forgot: "#forgot" }}
      error={error}
      onSubmit={async (v) => {
        const err = auth.signIn(String(v.email ?? v.username ?? ""), String(v.password ?? ""))
        setError(err)
        if (!err) toast({ title: "Signed in", variant: "success" })
      }}
    />
  )
}

export function UserMenu({ name, email, onSignOut }: { name: string; email: string; onSignOut: () => void }) {
  return (
    <Dropdown
      align="end"
      trigger={
        <button
          type="button"
          aria-label={`Account: ${name}`}
          className="flex cursor-pointer items-center gap-2 rounded-[var(--prui-radius)] px-1.5 py-1 hover:bg-[var(--prui-raise)]"
        >
          <Avatar fallback={name} />
        </button>
      }
      items={[
        { label: email, onSelect: () => {} },
        { label: "Sign out", onSelect: onSignOut },
      ]}
    />
  )
}

/**
 * The header user menu. Render as a node (header={<UserMenu />}) so its
 * hooks run inside the App's tree; no router hooks needed — clearing the
 * session makes the Gate swap the shell for the login screen.
 */
export function UserMenuSlot() {
  const { user, signOut } = useAuth()
  if (!user) return null
  return (
    <UserMenu
      name={user.name}
      email={user.email}
      onSignOut={() => {
        signOut()
        toast({ title: "Signed out", variant: "neutral" })
      }}
    />
  )
}
