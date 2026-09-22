import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "../core/cn"
import type { BrandConfig } from "../app/app"

/**
 * Shared page scaffolding for the pre-made page set.
 * All pages share: onSubmit, fields (per-field show/hide), links, oauth
 * providers optional, brand. Loading and error states included.
 */

export type FieldType = "text" | "email" | "password" | "number" | "tel" | "url"

export interface PageField {
  name: string
  label: string
  type?: FieldType
  placeholder?: string
  required?: boolean
  autoComplete?: string
}

export interface PageLink {
  label: string
  href: string
}

export interface OAuthProvider {
  id: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
}

/** Well-known providers may be passed as plain ids. */
export type OAuthProviderInput = OAuthProvider | "google" | "github" | "microsoft"

const BUILTIN_PROVIDERS: Record<string, OAuthProvider> = {
  google: { id: "google", label: "Google" },
  github: { id: "github", label: "GitHub" },
  microsoft: { id: "microsoft", label: "Microsoft" },
}

export function normalizeProviders(providers?: OAuthProviderInput[]): OAuthProvider[] {
  if (!providers?.length) return []
  return providers.map((p) =>
    typeof p === "string" ? BUILTIN_PROVIDERS[p] ?? { id: p, label: p.charAt(0).toUpperCase() + p.slice(1) } : p,
  )
}

/** Links accept a plain href string or a {label, href} object. */
export type PageLinkInput = PageLink | string

export function linkHref(link: PageLinkInput): string {
  return typeof link === "string" ? link : link.href
}

export function linkLabel(link: PageLinkInput, fallback: string): string {
  return (typeof link === "string" ? fallback : link.label) ?? fallback
}

export interface PageSubmitState {
  loading?: boolean
  error?: string | null
}

export interface PageShellProps {
  title: string
  description?: React.ReactNode
  brand?: BrandConfig
  /** Column width class for the card. */
  width?: string
  children?: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function PageShell({ title, description, brand, width = "max-w-sm", children, footer }: PageShellProps) {
  return (
    <div className="prui-page flex min-h-dvh items-center justify-center bg-background p-4">
      <div className={cn("w-full", width)}>
        {brand ? (
          <div className="mb-6 flex items-center justify-center gap-2" data-testid="page-brand">
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

export function ErrorBanner({ error }: { error?: string | null }) {
  if (!error) return null
  return (
    <p
      role="alert"
      data-testid="page-error"
      className="mb-3 rounded-prui border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
    >
      {error}
    </p>
  )
}

export function LoadingButtonLabel({ loading, children }: { loading?: boolean; children: React.ReactNode }) {
  return (
    <>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
      {children}
    </>
  )
}

export function OAuthButtons({ providers: rawProviders }: { providers?: OAuthProviderInput[] }) {
  const providers = normalizeProviders(rawProviders)
  if (providers.length === 0) return null
  return (
    <div className="mt-4" data-testid="oauth-providers">
      <div className="relative my-3">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-line" /></div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-surface px-2 text-dim">or continue with</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {providers.map((p) => {
          const Icon = p.icon
          return (
            <button
              key={p.id}
              type="button"
              onClick={(e) => {
                const handler = (providers as (OAuthProvider & { onClick?: () => void })[]).find((x) => x.id === p.id)?.onClick
                handler?.()
                e.preventDefault()
              }}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-prui border border-line bg-background text-sm text-fg hover:border-dim cursor-pointer"
            >
              {Icon ? <Icon className="h-4 w-4" aria-hidden /> : null}
              {p.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Default field sets per page; pages merge with caller overrides via the fields prop. */
export const defaultLoginFields: PageField[] = [
  { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
  { name: "password", label: "Password", type: "password", required: true, autoComplete: "current-password" },
]

export const defaultRegisterFields: PageField[] = [
  { name: "name", label: "Name", type: "text", required: true, autoComplete: "name" },
  { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
  { name: "password", label: "Password", type: "password", required: true, autoComplete: "new-password" },
]
