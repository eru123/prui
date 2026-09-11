import * as React from "react"
import { Button } from "../core/button"
import { Input, Textarea } from "../core/input"
import { Label } from "../core/label"
import { Avatar } from "../core/card"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../core/card"
import { Switch } from "../core/switch"
import type { PropsMeta } from "../core/props-meta"
import { PageShell, ErrorBanner } from "./shared"
import type { BrandConfig } from "../app/app"

export interface ProfilePageProps {
  /** Initial profile values. */
  profile?: {
    name?: string
    email?: string
    avatar?: string
    bio?: string
  }
  onSubmit?: (values: { name: string; email: string; bio: string }) => void | Promise<void>
  fields?: Partial<Record<"name" | "email" | "bio", boolean>>
  onSignOut?: () => void
  signOutLabel?: string
  brand?: BrandConfig
  submitLabel?: string
  loading?: boolean
  error?: string | null
}

export function ProfilePage({
  profile = {},
  onSubmit,
  fields,
  onSignOut,
  signOutLabel = "Sign out",
  brand,
  submitLabel = "Save profile",
  loading = false,
  error,
}: ProfilePageProps) {
  const show = { name: true, email: true, bio: true, ...fields }
  const [values, setValues] = React.useState({
    name: profile.name ?? "",
    email: profile.email ?? "",
    bio: profile.bio ?? "",
  })
  const [busy, setBusy] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = onSubmit?.({ ...values })
      if (result && typeof (result as Promise<void>).then === "function") {
        setBusy(true)
        await result
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <PageShell title="Your profile" brand={brand} width="max-w-lg">
      <ErrorBanner error={error} />
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" data-testid="profile-form">
        <div className="flex items-center gap-3" data-testid="profile-avatar">
          <Avatar src={profile.avatar} alt={values.name || "User"} size="lg" />
          <div className="text-sm text-[var(--prui-dim)]">{values.email || "No email"}</div>
        </div>
        {show.name !== false ? (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="profile-name">Name</Label>
            <Input
              id="profile-name"
              disabled={loading || busy}
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            />
          </div>
        ) : null}
        {show.email !== false ? (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="profile-email">Email</Label>
            <Input
              id="profile-email"
              type="email"
              disabled={loading || busy}
              value={values.email}
              onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
            />
          </div>
        ) : null}
        {show.bio !== false ? (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="profile-bio">Bio</Label>
            <Textarea
              id="profile-bio"
              rows={3}
              disabled={loading || busy}
              value={values.bio}
              onChange={(e) => setValues((v) => ({ ...v, bio: e.target.value }))}
            />
          </div>
        ) : null}
        <div className="flex items-center justify-between">
          {onSignOut ? (
            <Button type="button" variant="ghost" onClick={onSignOut}>
              {signOutLabel}
            </Button>
          ) : <span />}
          <Button type="submit" variant="primary" loading={loading || busy} data-testid="profile-submit">
            {submitLabel}
          </Button>
        </div>
      </form>
    </PageShell>
  )
}

export const profilePagePropsMeta: PropsMeta = {
  name: "ProfilePage",
  props: [
    { name: "profile", type: "{ name?, email?, avatar?, bio? }", default: "{}", control: "object" },
    { name: "onSubmit", type: "(values) => void | Promise<void>", default: null, control: "none" },
    { name: "fields", type: "{ name?, email?, bio? }", default: "all shown", control: "object" },
    { name: "onSignOut", type: "() => void", default: null, control: "none" },
    { name: "brand", type: "BrandConfig", default: "undefined", control: "object" },
    { name: "loading", type: "boolean", default: "false", control: "boolean" },
    { name: "error", type: "string | null", default: "null", control: "text" },
  ],
}

/* ---------------- SettingsPage (page flavor, not the app-layer Settings) ---------------- */

export interface SettingsToggle {
  id: string
  label: string
  description?: string
  defaultChecked?: boolean
  checked?: boolean
  onChange?: (checked: boolean) => void
}

export interface SettingsPageProps {
  title?: string
  toggles?: SettingsToggle[]
  brand?: BrandConfig
}

export function SettingsPage({ title = "Settings", toggles = [], brand }: SettingsPageProps) {
  return (
    <PageShell title={title} brand={brand} width="max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Changes apply immediately.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-[var(--prui-line)]">
          {toggles.length === 0 ? (
            <p className="py-3 text-sm text-[var(--prui-dim)]">No settings available.</p>
          ) : (
            toggles.map((t) => (
              <SettingsToggleRow key={t.id} toggle={t} />
            ))
          )}
        </CardContent>
        <CardFooter className="justify-end">
          <span className="text-xs text-[var(--prui-dim)]" data-testid="settings-page">
            {toggles.length} setting{toggles.length === 1 ? "" : "s"}
          </span>
        </CardFooter>
      </Card>
    </PageShell>
  )
}

function SettingsToggleRow({ toggle }: { toggle: SettingsToggle }) {
  const [uncontrolled, setUncontrolled] = React.useState(toggle.defaultChecked ?? false)
  const isControlled = toggle.checked !== undefined
  const checked = isControlled ? toggle.checked : uncontrolled
  return (
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[var(--prui-fg)]">{toggle.label}</p>
        {toggle.description ? <p className="text-xs text-[var(--prui-dim)]">{toggle.description}</p> : null}
      </div>
      <Switch
        aria-label={toggle.label}
        checked={checked}
        onChange={(c) => {
          if (!isControlled) setUncontrolled(c)
          toggle.onChange?.(c)
        }}
      />
    </div>
  )
}

export const settingsPagePropsMeta: PropsMeta = {
  name: "SettingsPage",
  props: [
    { name: "title", type: "string", default: "'Settings'", control: "text" },
    { name: "toggles", type: "SettingsToggle[]", default: "[]", control: "object" },
    { name: "brand", type: "BrandConfig", default: "undefined", control: "object" },
  ],
}

/* ---------------- AdminSetup ---------------- */

export interface AdminSetupProps {
  onSubmit?: (values: { name: string; email: string; password: string }) => void | Promise<void>
  brand?: BrandConfig
  description?: React.ReactNode
  loading?: boolean
  error?: string | null
}

/** First-run admin account creation. */
export function AdminSetup({
  onSubmit,
  brand,
  description = "Create the first administrator account for this instance.",
  loading = false,
  error,
}: AdminSetupProps) {
  const [values, setValues] = React.useState({ name: "", email: "", password: "" })
  const [busy, setBusy] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = onSubmit?.({ ...values })
      if (result && typeof (result as Promise<void>).then === "function") {
        setBusy(true)
        await result
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <PageShell title="Set up admin" description={description} brand={brand} width="max-w-md">
      <ErrorBanner error={error} />
      <form onSubmit={handleSubmit} className="flex flex-col gap-3" data-testid="adminsetup-form">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="admin-name">
            Name<span className="ml-0.5 text-[var(--prui-danger)]">*</span>
          </Label>
          <Input
            id="admin-name"
            required
            autoComplete="name"
            disabled={loading || busy}
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="admin-email">
            Email<span className="ml-0.5 text-[var(--prui-danger)]">*</span>
          </Label>
          <Input
            id="admin-email"
            type="email"
            required
            autoComplete="email"
            disabled={loading || busy}
            value={values.email}
            onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="admin-password">
            Password<span className="ml-0.5 text-[var(--prui-danger)]">*</span>
          </Label>
          <Input
            id="admin-password"
            type="password"
            required
            autoComplete="new-password"
            disabled={loading || busy}
            value={values.password}
            onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
          />
        </div>
        <Button type="submit" variant="primary" loading={loading || busy} data-testid="adminsetup-submit">
          Create admin
        </Button>
      </form>
    </PageShell>
  )
}

export const adminSetupPropsMeta: PropsMeta = {
  name: "AdminSetup",
  props: [
    { name: "onSubmit", type: "(values) => void | Promise<void>", default: null, control: "none" },
    { name: "brand", type: "BrandConfig", default: "undefined", control: "object" },
    { name: "description", type: "ReactNode", default: "generic", control: "text" },
    { name: "loading", type: "boolean", default: "false", control: "boolean" },
    { name: "error", type: "string | null", default: "null", control: "text" },
  ],
}
