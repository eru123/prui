import * as React from "react"
import { resolveSurface, withSurface, type SurfaceProps } from "./surface"
import { cn } from "./cn"
import type { PropsMeta } from "./props-meta"

export type BadgeVariant = "default" | "brand" | "ok" | "warn" | "danger" | "outline"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, SurfaceProps {
  variant?: BadgeVariant
}

const badgeVariants: Record<BadgeVariant, string> = {
  default: "bg-[var(--prui-raise)] text-[var(--prui-fg)] border-transparent",
  brand: "bg-[var(--prui-brand)]/15 text-[var(--prui-brand)] border-transparent",
  ok: "bg-[var(--prui-ok)]/15 text-[var(--prui-ok)] border-transparent",
  warn: "bg-[var(--prui-warn)]/15 text-[var(--prui-warn)] border-transparent",
  danger: "bg-[var(--prui-danger)]/15 text-[var(--prui-danger)] border-transparent",
  outline: "bg-transparent text-[var(--prui-fg)] border-[var(--prui-line)]",
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, style, variant = "default", bg, fg, radius, texture, textureColor, elevation, ...props }, ref) => {
    const surface = resolveSurface({ bg, fg, radius, texture, textureColor, elevation })
    const merged = withSurface(
      cn(
        "prui-badge inline-flex items-center gap-1 rounded-[var(--prui-s-radius,var(--prui-radius-full))] border px-2 py-0.5",
        "text-xs font-medium whitespace-nowrap",
        badgeVariants[variant],
        className,
      ),
      style,
      surface,
    )
    return (
      <span
        ref={ref}
        data-variant={variant}
        style={merged.style}
        className={merged.className}
        {...props}
      />
    )
  },
)
Badge.displayName = "Badge"

export const badgePropsMeta: PropsMeta = {
  name: "Badge",
  props: [
    { name: "variant", type: "'default' | 'brand' | 'ok' | 'warn' | 'danger' | 'outline'", default: "'default'", control: "select", options: ["default", "brand", "ok", "warn", "danger", "outline"] },
    { name: "children", type: "ReactNode", default: null, control: "text" },
  ],
}

/* ---------------- Card ---------------- */

export type CardVariant = "default" | "outline" | "ghost" | "elevated"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement>, SurfaceProps {
  variant?: CardVariant
  /** Strip the skin: keep the box, style everything yourself. */
  unstyled?: boolean
}

const cardVariantClasses: Record<CardVariant, string> = {
  default: "border border-[var(--prui-line)]",
  outline: "border border-[var(--prui-s-border,var(--prui-brand))] bg-transparent",
  ghost: "border border-transparent bg-transparent",
  elevated: "border border-[var(--prui-line)] prui-elev-md",
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, style, variant = "default", unstyled, bg, fg, radius, texture, textureColor, elevation, ...props }, ref) => {
    const surface = resolveSurface({ bg, fg, radius, texture, textureColor, elevation })
    const merged = withSurface(
      cn(
        "prui-card rounded-[var(--prui-s-radius,var(--prui-radius))]",
        unstyled ? [] : [cardVariantClasses[variant]],
        className,
      ),
      style,
      surface,
    )
    return <div ref={ref} className={merged.className} style={merged.style} {...props} />
  },
)
Card.displayName = "Card"

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("prui-card-header flex flex-col gap-1 p-4", className)} {...props} />
  ),
)
CardHeader.displayName = "CardHeader"

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("prui-card-title text-base font-semibold text-[var(--prui-fg)]", className)} {...props} />
  ),
)
CardTitle.displayName = "CardTitle"

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("prui-card-description text-sm text-[var(--prui-dim)]", className)} {...props} />
  ),
)
CardDescription.displayName = "CardDescription"

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("prui-card-content p-4 pt-0", className)} {...props} />
  ),
)
CardContent.displayName = "CardContent"

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("prui-card-footer flex items-center p-4 pt-0", className)} {...props} />
  ),
)
CardFooter.displayName = "CardFooter"

export const cardPropsMeta: PropsMeta = {
  name: "Card",
  props: [
    { name: "children", type: "ReactNode", default: null, control: "text" },
    { name: "className", type: "string", default: "undefined", control: "text" },
  ],
}

/* ---------------- Avatar ---------------- */

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  src?: string
  alt?: string
  /** Fallback initials when no image or image fails. */
  fallback?: string
  size?: "sm" | "md" | "lg"
}

const avatarSizes = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-12 w-12 text-base",
}

export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className, src, alt, fallback, size = "md", ...props }, ref) => {
    const [failed, setFailed] = React.useState(false)
    const showImg = src && !failed
    const initials =
      fallback ??
      (alt
        ? alt
            .split(/\s+/)
            .slice(0, 2)
            .map((w) => w[0]?.toUpperCase() ?? "")
            .join("")
        : "")
    return (
      <span
        ref={ref}
        className={cn(
          "prui-avatar relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden",
          "rounded-[var(--prui-radius-full)] bg-[var(--prui-raise)] text-[var(--prui-dim)] font-medium",
          avatarSizes[size],
          className,
        )}
        {...props}
      >
        {showImg ? (
          <img src={src} alt={alt ?? ""} className="h-full w-full object-cover" onError={() => setFailed(true)} />
        ) : (
          initials
        )}
      </span>
    )
  },
)
Avatar.displayName = "Avatar"

export const avatarPropsMeta: PropsMeta = {
  name: "Avatar",
  props: [
    { name: "src", type: "string", default: "undefined", control: "text" },
    { name: "alt", type: "string", default: "undefined", control: "text" },
    { name: "fallback", type: "string", default: "initials from alt", control: "text" },
    { name: "size", type: "'sm' | 'md' | 'lg'", default: "'md'", control: "select", options: ["sm", "md", "lg"] },
  ],
}
