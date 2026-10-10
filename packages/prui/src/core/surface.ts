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
  /** Any CSS background value: color, gradient, or var(). Solid colors also pick an automatic readable text color. */
  bg?: string
  /** Any CSS color for text or icons on this surface. Overrides the automatic pick. */
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

/* ------------------------------------------------------------------ */
/* Color-aware ink picking                                              */
/* ------------------------------------------------------------------ */

/** Basic CSS named colors, the only keywords readableInk resolves. */
const NAMED_COLORS: Record<string, readonly [number, number, number]> = {
  aqua: [0, 255, 255],
  black: [0, 0, 0],
  blue: [0, 0, 255],
  fuchsia: [255, 0, 255],
  gray: [128, 128, 128],
  green: [0, 128, 0],
  lime: [0, 255, 0],
  maroon: [128, 0, 0],
  navy: [0, 0, 128],
  olive: [128, 128, 0],
  purple: [128, 0, 128],
  red: [255, 0, 0],
  silver: [192, 192, 192],
  teal: [0, 128, 128],
  white: [255, 255, 255],
  yellow: [255, 255, 0],
}

function fromHex(digits: string): [number, number, number] | undefined {
  const byte = (i: number) => parseInt(digits.slice(i, i + 1).repeat(2), 16)
  if (digits.length === 3 || digits.length === 4) {
    if (digits.length === 4 && byte(3) === 0) return undefined
    return [byte(0), byte(1), byte(2)]
  }
  if (digits.length === 6 || digits.length === 8) {
    const r = parseInt(digits.slice(0, 2), 16)
    const g = parseInt(digits.slice(2, 4), 16)
    const b = parseInt(digits.slice(4, 6), 16)
    const a = digits.length === 8 ? parseInt(digits.slice(6, 8), 16) : 255
    if (Number.isNaN(a) || a === 0) return undefined
    return [r, g, b]
  }
  return undefined
}

/** Parse one `rgb()`/`hsl()` argument: a number, or a percentage of `scale`. */
function channel(part: string, scale: number): number {
  const pct = part.endsWith("%")
  const v = parseFloat(pct ? part.slice(0, -1) : part)
  if (Number.isNaN(v)) return NaN
  return pct ? (v / 100) * scale : v
}

function fromFunction(fn: "rgb" | "rgba" | "hsl" | "hsla", argsRaw: string): [number, number, number] | undefined {
  const parts = argsRaw.split(/[\s,/]+/).filter(Boolean)
  if (parts.length < 3 || parts.length > 4) return undefined

  // alpha: unitless 0-1 or a percentage; fully transparent carries no color
  const alphaPart = parts[3]
  if (alphaPart !== undefined) {
    const a = alphaPart.endsWith("%") ? parseFloat(alphaPart) / 100 : parseFloat(alphaPart)
    if (Number.isNaN(a) || a === 0) return undefined
  }

  if (fn === "rgb" || fn === "rgba") {
    const rgb = parts.slice(0, 3).map((p) => channel(p, 255))
    if (rgb.some((v) => Number.isNaN(v))) return undefined
    return rgb.map((v) => Math.min(255, Math.max(0, Math.round(v)))) as [number, number, number]
  }

  const [hPart = "", sPart = "", lPart = ""] = parts
  const h = parseFloat(hPart)
  const s = channel(sPart, 100)
  const l = channel(lPart, 100)
  if (Number.isNaN(h + s + l)) return undefined
  const hue = ((h % 360) + 360) % 360
  const sat = s / 100
  const light = l / 100
  const chroma = sat * Math.min(light, 1 - light)
  const k = (i: number) => (i + hue / 30) % 12
  const f = (i: number) => light - chroma * Math.max(-1, Math.min(k(i) - 3, Math.min(9 - k(i), 1)))
  return [f(0), f(8), f(4)].map((v) => Math.min(255, Math.max(0, Math.round(v * 255)))) as [number, number, number]
}

function parseSolidColor(input: string): [number, number, number] | undefined {
  const c = input.trim().toLowerCase()
  if (!c || c === "transparent" || c === "currentcolor" || c === "inherit") return undefined

  const hex = c.match(/^#([0-9a-f]+)$/)?.[1]
  if (hex) return fromHex(hex)

  const fn = c.match(/^(rgba?|hsla?)\(([^)]*)\)$/)
  if (fn?.[1] && fn[2]) return fromFunction(fn[1] as "rgb" | "rgba" | "hsl" | "hsla", fn[2])

  const named = NAMED_COLORS[c]
  return named ? [...named] : undefined
}

/**
 * Pick a readable ink (#ffffff or #000000) for a background color by WCAG
 * relative luminance. Returns undefined when the value is not a solid,
 * parseable color (var(), gradients, url(), unusual keywords) — callers
 * then keep their theme's default pairing.
 */
export function readableInk(bg: string): "#ffffff" | "#000000" | undefined {
  const rgb = parseSolidColor(bg)
  if (!rgb) return undefined
  const lin = (c: number) => {
    const v = c / 255
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  const l = 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2])
  // Crossover luminance where the black and white contrast ratios meet;
  // below it white text wins, above it black text wins.
  return l < 0.179 ? "#ffffff" : "#000000"
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

  if (p.bg) {
    style["--prui-s-bg"] = p.bg
    // color-aware default: a solid background picks its own readable ink
    if (!p.fg) {
      const ink = readableInk(p.bg)
      if (ink) style["--prui-s-fg"] = ink
    }
  }
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
