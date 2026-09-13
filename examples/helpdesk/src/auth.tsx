import * as React from "react"
import { LoginPage, RegisterPage, ForgotPasswordPage } from "@skiddph/prui/pages"
import {
  Dropdown, Avatar, Button, Card, CardHeader, CardTitle, CardContent, Input, Separator, Badge,
  confirmModal, toast,
} from "@skiddph/prui/core"
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
    updateUser: (patch: Partial<AuthUser>) =>
      setAuth((prev) => ({
        users: prev.users.map((u) => (u.email === prev.current ? { ...u, ...patch } : u)),
        current: patch.email ?? prev.current,
      })),
    deleteUser: () =>
      setAuth((prev) => ({ users: prev.users.filter((u) => u.email !== prev.current), current: null })),
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
      onSignOut={async () => {
        // confirmation for demonstration: destructive-ish actions confirm
        const ok = await confirmModal({
          title: "Sign out?",
          message: "Your data stays in this browser's localStorage — sign back in anytime.",
        })
        if (!ok) return
        signOut()
        toast({ title: "Signed out", variant: "neutral" })
      }}
    />
  )
}

/**
 * The profile page: edit the stored account — display name, password change
 * with the eye fields and validation, and a danger zone. Every save writes
 * the auth store (and survives reloads like everything else).
 */
export function ProfilePage() {
  const { user, updateUser, deleteUser, signOut } = useAuth()
  const [name, setName] = React.useState(user?.name ?? "")
  const [currentPw, setCurrentPw] = React.useState("")
  const [newPw, setNewPw] = React.useState("")
  const [pwError, setPwError] = React.useState<string | null>(null)

  if (!user) return null

  const saveName = () => {
    updateUser({ name })
    toast({ title: "Profile updated", variant: "success" })
  }

  const changePassword = async () => {
    if (currentPw !== user.password) {
      setPwError("Current password is wrong.")
      return
    }
    if (newPw.length < 8) {
      setPwError("New password needs 8+ characters.")
      return
    }
    const ok = await confirmModal({ title: "Change password?", message: "The new password replaces the one in this browser's store." })
    if (!ok) return
    updateUser({ password: newPw })
    setCurrentPw("")
    setNewPw("")
    setPwError(null)
    toast({ title: "Password changed", variant: "success" })
  }

  return (
    <div className="page">
      <div className="page-head">
        <h1>Profile</h1>
        <p>Your account lives in localStorage with everything else — edit it and reload to believe it.</p>
      </div>

      <Card className="max-w-md">
        <CardContent className="flex items-center gap-4 pt-5">
          <Avatar fallback={user.name} size="lg" />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{user.name}</div>
            <div className="flex items-center gap-2">
              <span className="truncate text-xs text-[var(--prui-dim)]">{user.email}</span>
              <Badge variant="ok">signed in</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-md">
        <CardHeader><CardTitle className="text-sm">Display name</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} helperText="Shown in the header account menu." />
          <div>
            <Button size="sm" variant="primary" disabled={!name.trim() || name === user.name} onClick={saveName}>
              Save name
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-md">
        <CardHeader><CardTitle className="text-sm">Password</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Input
            type="password"
            label="Current password"
            value={currentPw}
            onChange={(e) => { setCurrentPw(e.target.value); setPwError(null) }}
            helperText=" "
          />
          <Input
            type="password"
            label="New password"
            value={newPw}
            onChange={(e) => { setNewPw(e.target.value); setPwError(null) }}
            helperText={pwError ?? "8+ characters. The eye toggles never steal your caret."}
            error={!!pwError || (newPw.length > 0 && newPw.length < 8)}
          />
          <div>
            <Button size="sm" variant="primary" disabled={!currentPw || !newPw} onClick={changePassword}>
              Change password
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-md">
        <CardHeader><CardTitle className="text-sm">Danger zone</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p className="text-xs text-[var(--prui-dim)]">Both actions confirm first — the modal is the point.</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="default"
              onClick={async () => {
                const ok = await confirmModal({ title: "Sign out?", message: "Your data stays in this browser." })
                if (!ok) return
                signOut()
                toast({ title: "Signed out", variant: "neutral" })
              }}
            >
              Sign out
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                const ok = await confirmModal({ title: "Delete account?", message: "Removes your user from this browser's store and signs you out.", type: "danger" })
                if (!ok) return
                deleteUser()
                toast({ title: "Account deleted", variant: "danger" })
              }}
            >
              Delete account
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />
    </div>
  )
}
