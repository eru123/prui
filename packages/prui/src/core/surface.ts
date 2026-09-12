import * as React from "react"

/**
 * Surface: an opt-in flexibility layer shared by the primitives. A surface
 * accepts any CSS color or var() for background and foreground, a radius
 * step (or raw length), a subtle background texture, and an elevation step.
 * Nothing here changes the default look: every value degrades to the
 * current theme's tokens through var() fallbacks inside the components.
 */

export type SurfaceRadius = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "full" | (string & {})
export type SurfaceTexture = "none" | "dots" | "grid" | "stripes" | "diagonal"
export type SurfaceElevation = "none" | "sm" | "md" | "lg"

export interface SurfaceProps {
  /** Any CSS background value: color, gradient, or var(). */
  bg?: string
  /** Any CSS color for text or icons on this surface. */
  fg?: string
  /** Radius step name, or a raw CSS length like "12px". */
  radius?: SurfaceRadius
  /** Subtle background pattern drawn with the texture color. */
  texture?: SurfaceTexture
  /** Pattern color; defaults to the theme's --prui-line token. */
  textureColor?: string
  /** Box shadow step. */
  elevation?: SurfaceElevation
}

const RADIUS: Record<string, string> = {
  none: "0px",
  xs: "2px",
  sm: "var(--prui-radius-1)",
  md: "var(--prui-radius)",
  lg: "var(--prui-radius-3)",
  xl: "18px",
  full: "9999px",
}

const ELEVATION_CLASS: Record<string, string> = {
  sm: "prui-elev-sm",
  md: "prui-elev-md",
  lg: "prui-elev-lg",
}

export interface SurfaceResult {
  style?: React.CSSProperties
  className?: string
}

/**
 * Resolve surface props into inline custom properties plus texture and
 * elevation classes. Returns undefined when nothing is set, so components
 * keep their original render path.
 */
export function resolveSurface(p?: SurfaceProps): SurfaceResult | undefined {
  if (!p) return undefined
  const style: Record<string, string> = {}
  const classes: string[] = []

  if (p.bg) style["--prui-s-bg"] = p.bg
  if (p.fg) style["--prui-s-fg"] = p.fg
  if (p.radius) style["--prui-s-radius"] = RADIUS[p.radius] ?? p.radius
  if (p.textureColor) style["--prui-tex-c"] = p.textureColor
  if (p.texture && p.texture !== "none") classes.push(`prui-tex-${p.texture}`)
  if (p.elevation && p.elevation !== "none") {
    const cls = ELEVATION_CLASS[p.elevation]
    if (cls) classes.push(cls)
  }

  if (!classes.length && !Object.keys(style).length) return undefined
  return {
    style: Object.keys(style).length ? (style as React.CSSProperties) : undefined,
    className: classes.length ? classes.join(" ") : undefined,
  }
}

/** Merge a surface result into a component's className and style. */
export function withSurface(
  className: string,
  style: React.CSSProperties | undefined,
  surface: SurfaceResult | undefined,
): { className: string; style?: React.CSSProperties } {
  if (!surface) return { className, style }
  return {
    className: [className, surface.className].filter(Boolean).join(" "),
    style: { ...style, ...surface.style } as React.CSSProperties,
  }
}
