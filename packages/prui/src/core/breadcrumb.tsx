import * as React from "react"
import { ChevronRight, MoreHorizontal } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "./cn"
import { usePruiI18n } from "../i18n"
import type { PropsMeta } from "./props-meta"

/**
 * Breadcrumb: a nav/ol/li trail with separators and optional collapsed
 * overflow. Current page carries aria-current="page".
 */

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  /** Accessible label for the nav landmark. */
  label?: string
  /** Collapse the middle of long trails behind an ellipsis item. */
  collapseAfter?: number
  /** What the ellipsis expands to. */
  onExpand?: () => void
  children?: React.ReactNode
}

export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(function Breadcrumb(
  { label, collapseAfter, onExpand, className, children, ...props },
  ref,
) {
  const items = React.Children.toArray(children)
  let rendered: React.ReactNode[] = items
  if (collapseAfter != null && items.length > collapseAfter + 1) {
    const head = items.slice(0, 1)
    const tail = items.slice(items.length - collapseAfter)
    rendered = [
      ...head,
      <BreadcrumbEllipsis key="ellipsis" onExpand={onExpand} />,
      ...tail,
    ]
  }
  return (
    <nav ref={ref} aria-label={label ?? "Breadcrumb"} className={cn("prui-breadcrumb", className)} {...props}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--prui-dim)]">
        {React.Children.map(rendered, (child, i) => (
          <li className="flex items-center gap-1.5">
            {child}
            {i < rendered.length - 1 ? <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden /> : null}
          </li>
        ))}
      </ol>
    </nav>
  )
})
Breadcrumb.displayName = "Breadcrumb"

export interface BreadcrumbItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Route destination; omit for the current (plain text) page. */
  href?: string
  /** Mark as the current page (adds aria-current). */
  current?: boolean
}

export const BreadcrumbItem = React.forwardRef<HTMLDivElement, BreadcrumbItemProps>(function BreadcrumbItem(
  { href, current, className, children, ...props },
  ref,
) {
  return (
    <div ref={ref} className={cn("prui-breadcrumb-item", className)} {...props}>
      {href ? (
        <Link
          to={href}
          aria-current={current ? "page" : undefined}
          className="cursor-pointer transition-colors hover:text-[var(--prui-fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--prui-brand)] rounded-[var(--prui-radius-1)]"
        >
          {children}
        </Link>
      ) : (
        <span aria-current={current ? "page" : undefined} className={cn(current && "font-medium text-[var(--prui-fg)]")}>
          {children}
        </span>
      )}
    </div>
  )
})
BreadcrumbItem.displayName = "BreadcrumbItem"

export const BreadcrumbEllipsis = ({ onExpand }: { onExpand?: () => void }) => {
  const { t } = usePruiI18n()
  return (
    <button
      type="button"
      aria-label="Show more breadcrumbs"
      onClick={onExpand}
      className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-[var(--prui-radius-1)] text-[var(--prui-dim)] transition-colors hover:text-[var(--prui-fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--prui-brand)]"
    >
      <MoreHorizontal className="h-4 w-4" aria-hidden />
      <span className="sr-only">{t.of}</span>
    </button>
  )
}
BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis"

export const breadcrumbPropsMeta: PropsMeta = {
  name: "Breadcrumb",
  props: [
    { name: "label", type: "string", default: "'Breadcrumb'", control: "text" },
    { name: "collapseAfter", type: "number", default: "undefined", control: "number", description: "Collapse the middle items behind an ellipsis, keeping this many at the end." },
    { name: "onExpand", type: "() => void", default: null, control: "none" },
    { name: "children", type: "BreadcrumbItem[]", default: null, control: "none" },
  ],
}
