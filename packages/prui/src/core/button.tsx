import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "./cn"
import type { PropsMeta } from "./props-meta"
import { resolveSurface, withSurface, type SurfaceProps } from "./surface"

/**
 * Button variants. The shared PRUI vocabulary is
 * primary / secondary / neutral / danger / success / warning (plus the
 * stylistic ghost / outline / soft / link kept from the original API).
 * Legacy names keep working: `default` = secondary, and soft-colored
 * success/warning map to their token colors.
 */
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "default"
  | "neutral"
  | "ghost"
  | "danger"
  | "success"
  | "warning"
  | "outline"
  | "soft"
  | "link"
export type ButtonSize = "sm" | "md" | "lg" | "icon"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, SurfaceProps {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Render the single child instead of a button element. */
  asChild?: boolean
  /** Show a spinner and disable the button. */
  loading?: boolean
  /** Strip the skin: keep structure and behavior, style it yourself. */
  unstyled?: boolean
  /** Stretch to the parent's full width. */
  fullWidth?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--prui-s-bg,var(--prui-brand))] text-[var(--prui-s-fg,var(--prui-brand-fg))] hover:brightness-110 active:brightness-95",
  secondary:
    "bg-[var(--prui-s-bg,var(--prui-raise))] text-[var(--prui-s-fg,var(--prui-fg))] border border-[var(--prui-line)] hover:border-[var(--prui-dim)]",
  // legacy alias of secondary
  default:
    "bg-[var(--prui-s-bg,var(--prui-raise))] text-[var(--prui-s-fg,var(--prui-fg))] border border-[var(--prui-line)] hover:border-[var(--prui-dim)]",
  neutral:
    "bg-[var(--prui-s-bg,transparent)] text-[var(--prui-s-fg,var(--prui-fg))] border border-[var(--prui-line)] hover:bg-[var(--prui-raise)]",
  ghost:
    "bg-[var(--prui-s-bg,transparent)] text-[var(--prui-s-fg,var(--prui-fg))] hover:bg-[var(--prui-raise)]",
  danger:
    "bg-[var(--prui-s-bg,var(--prui-danger))] text-[var(--prui-s-fg,#fff)] hover:brightness-110 active:brightness-95",
  success:
    "bg-[var(--prui-s-bg,var(--prui-ok))] text-[var(--prui-s-fg,#fff)] hover:brightness-110 active:brightness-95",
  warning:
    "bg-[var(--prui-s-bg,var(--prui-warn))] text-[var(--prui-s-fg,#fff)] hover:brightness-110 active:brightness-95",
  outline:
    "bg-[var(--prui-s-bg,transparent)] text-[var(--prui-s-fg,var(--prui-brand))] border border-[var(--prui-s-border,var(--prui-brand))] hover:bg-[var(--prui-brand)]/10",
  soft:
    "bg-[var(--prui-brand)]/12 text-[var(--prui-s-fg,var(--prui-brand))] hover:bg-[var(--prui-brand)]/20",
  link:
    "bg-transparent text-[var(--prui-s-fg,var(--prui-brand))] underline-offset-4 hover:underline p-0",
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-7 px-2.5 text-xs gap-1.5",
  md: "h-9 px-3.5 text-sm gap-2",
  lg: "h-11 px-5 text-base gap-2",
  icon: "h-9 w-9 p-0",
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, style, variant = "default", size = "md", asChild = false, loading = false, disabled, unstyled, fullWidth, bg, fg, radius, texture, textureColor, elevation, children, ...props }, ref) => {
    const surface = resolveSurface({ bg, fg, radius, texture, textureColor, elevation })
    const classes = cn(
      "prui-button inline-flex items-center justify-center whitespace-nowrap font-medium select-none",
      "transition-[filter,background-color,border-color] duration-150 outline-none cursor-pointer",
      "focus-visible:ring-2 focus-visible:ring-[var(--prui-brand)] focus-visible:ring-offset-1",
      "disabled:pointer-events-none disabled:opacity-50",
      fullWidth && "w-full",
      "rounded-[var(--prui-s-radius,var(--prui-radius))]",
      unstyled ? [] : [variantClasses[variant], sizeClasses[size]],
      className,
    )
    const merged = withSurface(classes, style, surface)

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<Record<string, unknown>>
      return React.cloneElement(child, {
        className: cn(merged.className, child.props.className as string | undefined),
        style: { ...(merged.style ?? {}), ...(child.props.style as object | undefined) },
        ...props,
        children: loading ? <Spinner /> : child.props.children,
      })
    }

    return (
      <button ref={ref} className={merged.className} style={merged.style} disabled={disabled || loading} data-loading={loading || undefined} {...props}>
        {loading ? (
          <>
            <Spinner />
            {children}
          </>
        ) : (
          children
        )}
      </button>
    )
  },
)
Button.displayName = "Button"

function Spinner() {
  return <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
}

export const buttonPropsMeta: PropsMeta = {
  name: "Button",
  props: [
    { name: "variant", type: "'primary' | 'secondary' | 'neutral' | 'ghost' | 'danger' | 'success' | 'warning' | 'outline' | 'soft' | 'link' | 'default'", default: "'default' (secondary)", control: "select", options: ["primary", "secondary", "neutral", "ghost", "danger", "success", "warning", "outline", "soft", "link", "default"] },
    { name: "size", type: "'sm' | 'md' | 'lg' | 'icon'", default: "'md'", control: "select", options: ["sm", "md", "lg", "icon"] },
    { name: "asChild", type: "boolean", default: "false", control: "boolean" },
    { name: "loading", type: "boolean", default: "false", control: "boolean" },
    { name: "disabled", type: "boolean", default: "false", control: "boolean" },
    { name: "unstyled", type: "boolean", default: "false", control: "boolean" },
    { name: "fullWidth", type: "boolean", default: "false", control: "boolean" },
    { name: "bg", type: "string (CSS color or var)", default: "theme default", control: "text" },
    { name: "fg", type: "string (CSS color)", default: "theme default", control: "text" },
    { name: "radius", type: "'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | length", default: "var(--prui-radius)", control: "text" },
    { name: "texture", type: "'none' | 'dots' | 'grid' | 'stripes' | 'diagonal'", default: "'none'", control: "select", options: ["none", "dots", "grid", "stripes", "diagonal"] },
    { name: "elevation", type: "'none' | 'sm' | 'md' | 'lg'", default: "'none'", control: "select", options: ["none", "sm", "md", "lg"] },
    { name: "children", type: "ReactNode", default: null, control: "text" },
  ],
}
