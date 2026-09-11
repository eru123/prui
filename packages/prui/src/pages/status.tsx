import * as React from "react"
import { FileQuestion, AlertTriangle, Inbox } from "lucide-react"
import { Button } from "../core/button"
import type { PropsMeta } from "../core/props-meta"
import { PageShell } from "./shared"

export interface NotFoundPageProps {
  title?: string
  description?: React.ReactNode
  /** Home link target. */
  homeHref?: string
  onGoHome?: () => void
  brand?: import("../app/app").BrandConfig
}

export function NotFoundPage({
  title = "Page not found",
  description = "The page you are looking for does not exist or has been moved.",
  homeHref = "/",
  onGoHome,
  brand,
}: NotFoundPageProps) {
  return (
    <PageShell title={title} description={description} brand={brand} width="max-w-md">
      <div className="flex flex-col items-center gap-4 py-4" data-testid="notfound-page">
        <FileQuestion className="h-10 w-10 text-[var(--prui-dim)]" aria-hidden />
        <code className="text-3xl font-bold text-[var(--prui-fg)]">404</code>
        {onGoHome ? (
          <Button variant="primary" onClick={onGoHome} data-testid="notfound-home">
            Go home
          </Button>
        ) : (
          <Button variant="primary" asChild data-testid="notfound-home">
            <a href={homeHref}>Go home</a>
          </Button>
        )}
      </div>
    </PageShell>
  )
}

export const notFoundPagePropsMeta: PropsMeta = {
  name: "NotFoundPage",
  props: [
    { name: "title", type: "string", default: "'Page not found'", control: "text" },
    { name: "description", type: "ReactNode", default: "generic", control: "text" },
    { name: "homeHref", type: "string", default: "'/'", control: "text" },
    { name: "onGoHome", type: "() => void", default: null, control: "none" },
    { name: "brand", type: "BrandConfig", default: "undefined", control: "object" },
  ],
}

export interface ErrorPageProps {
  title?: string
  /** Error object or message; shown in a details block when provided. */
  error?: unknown
  onRetry?: () => void
  retryLabel?: string
  brand?: import("../app/app").BrandConfig
}

export function ErrorPage({
  title = "Something went wrong",
  error,
  onRetry,
  retryLabel = "Try again",
  brand,
}: ErrorPageProps) {
  const message = error instanceof Error ? error.message : typeof error === "string" ? error : undefined
  return (
    <PageShell title={title} brand={brand} width="max-w-md">
      <div className="flex flex-col items-center gap-4 py-4" data-testid="error-page">
        <AlertTriangle className="h-10 w-10 text-[var(--prui-warn)]" aria-hidden />
        {message ? (
          <p role="alert" className="rounded-[var(--prui-radius)] border border-[var(--prui-warn)]/40 bg-[var(--prui-warn)]/10 px-3 py-2 text-sm text-[var(--prui-warn)]">
            {message}
          </p>
        ) : (
          <p className="text-sm text-[var(--prui-dim)]">An unexpected error occurred.</p>
        )}
        {onRetry ? (
          <Button variant="primary" onClick={onRetry} data-testid="error-retry">
            {retryLabel}
          </Button>
        ) : null}
      </div>
    </PageShell>
  )
}

export const errorPagePropsMeta: PropsMeta = {
  name: "ErrorPage",
  props: [
    { name: "title", type: "string", default: "'Something went wrong'", control: "text" },
    { name: "error", type: "unknown", default: null, control: "text" },
    { name: "onRetry", type: "() => void", default: null, control: "none" },
    { name: "retryLabel", type: "string", default: "'Try again'", control: "text" },
    { name: "brand", type: "BrandConfig", default: "undefined", control: "object" },
  ],
}

export interface EmptyStateProps {
  title?: string
  description?: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  title = "Nothing here yet",
  description,
  icon: Icon = Inbox,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={className ?? "flex flex-col items-center justify-center gap-3 rounded-[var(--prui-radius)] border border-dashed border-[var(--prui-line)] px-6 py-12 text-center"} data-testid="empty-state">
      <Icon className="h-8 w-8 text-[var(--prui-dim)]" aria-hidden />
      <div>
        <p className="text-sm font-medium text-[var(--prui-fg)]">{title}</p>
        {description ? <p className="mt-1 text-sm text-[var(--prui-dim)]">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}

export const emptyStatePropsMeta: PropsMeta = {
  name: "EmptyState",
  props: [
    { name: "title", type: "string", default: "'Nothing here yet'", control: "text" },
    { name: "description", type: "ReactNode", default: null, control: "text" },
    { name: "icon", type: "LucideIcon", default: "Inbox", control: "icon" },
    { name: "action", type: "ReactNode", default: null, control: "none" },
  ],
}
