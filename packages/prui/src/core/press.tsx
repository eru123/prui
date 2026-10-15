import * as React from "react"
import { Heart } from "lucide-react"
import { cn } from "./cn"
import type { PropsMeta } from "./props-meta"

/**
 * Press-feedback kit: the tactile layer for momentary interactions.
 *
 * - PressDepth wraps a control and sinks it slightly while active
 *   (pure CSS transform).
 * - Ripple wraps a control and spawns a radial pulse at the press point
 *   (one short-lived span per press; position/size are runtime geometry).
 * - LikeBurst is a self-contained toggle button whose activation bursts
 *   particles outward from the heart.
 *
 * The wrappers clone their child (the Tooltip pattern), so the child must
 * accept className and pointer handlers — any prui Button does.
 */

/* ---------------- PressDepth ---------------- */

export interface PressDepthProps {
  children: React.ReactElement<Record<string, unknown>>
  className?: string
}

export function PressDepth({ children, className }: PressDepthProps) {
  return React.cloneElement(children, {
    className: cn("prui-press-depth", className, children.props.className as string | undefined),
  })
}

/* ---------------- Ripple ---------------- */

export interface RippleProps {
  children: React.ReactElement<Record<string, unknown>>
  className?: string
}

export function Ripple({ children, className }: RippleProps) {
  const [pulses, setPulses] = React.useState<Array<{ id: number; x: number; y: number; size: number }>>([])
  const nextId = React.useRef(0)

  const spawn = (e: React.PointerEvent<HTMLElement>) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 2
    const pulse = { id: nextId.current++, x: e.clientX - rect.left, y: e.clientY - rect.top, size }
    setPulses((p) => [...p, pulse])
  }

  const child = children as React.ReactElement<Record<string, unknown>>
  return React.cloneElement(child, {
    className: cn("prui-ripple-host relative overflow-hidden", className, child.props.className as string | undefined),
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
      ;(child.props.onPointerDown as ((ev: React.PointerEvent<HTMLElement>) => void) | undefined)?.(e)
      // jsdom synthetic pointer events carry no button; treat as primary
      if (!e.defaultPrevented && (e.button == null || e.button === 0)) spawn(e)
    },
    children: (
      <>
        {(child.props.children as React.ReactNode) ?? null}
        {pulses.map((p) => (
          <span
            key={p.id}
            aria-hidden
            className="prui-ripple-dot pointer-events-none absolute rounded-full bg-brand/30"
            style={{ left: p.x - p.size / 2, top: p.y - p.size / 2, width: p.size, height: p.size }}
            onAnimationEnd={() => setPulses((prev) => prev.filter((q) => q.id !== p.id))}
          />
        ))}
      </>
    ),
  })
}

/* ---------------- LikeBurst ---------------- */

export interface LikeBurstProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  pressed?: boolean
  defaultPressed?: boolean
  onChange?: (pressed: boolean) => void
  /** Particles per activation. Default 8. */
  particles?: number
}

export const LikeBurst = React.forwardRef<HTMLButtonElement, LikeBurstProps>(function LikeBurst(
  { pressed: pressedProp, defaultPressed = false, onChange, particles = 8, className, disabled, ...props },
  ref,
) {
  const isControlled = pressedProp !== undefined
  const [uncontrolled, setUncontrolled] = React.useState(defaultPressed)
  const pressed = isControlled ? pressedProp : uncontrolled
  const [burstAt, setBurstAt] = React.useState(0)

  const toggle = () => {
    if (disabled) return
    const next = !pressed
    if (!isControlled) setUncontrolled(next)
    if (next) setBurstAt(Date.now())
    onChange?.(next)
  }

  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={pressed}
      aria-label={pressed ? "Unlike" : "Like"}
      disabled={disabled}
      data-pressed={pressed || undefined}
      onClick={toggle}
      className={cn(
        "prui-like-burst relative inline-flex h-9 w-9 cursor-pointer select-none",
        "items-center justify-center rounded-prui-full outline-none",
        "transition-colors duration-150 hover:bg-raise",
        "focus-visible:ring-2 focus-visible:ring-ring/70",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <Heart
        aria-hidden
        className={cn(
          "h-5 w-5 transition-all duration-200 ease-prui",
          pressed ? "scale-110 fill-ok text-ok" : "scale-100 fill-transparent text-dim hover:text-fg",
        )}
      />
      {burstAt > 0 ? (
        <span key={burstAt} aria-hidden className="pointer-events-none absolute inset-0">
          {Array.from({ length: particles }).map((_, i) => {
            const angle = (360 / particles) * i
            return (
              <span key={i} className="absolute left-1/2 top-1/2" style={{ transform: `rotate(${angle}deg)` }}>
                <span className="prui-burst-particle block h-1 w-1 rounded-full bg-ok" />
              </span>
            )
          })}
        </span>
      ) : null}
    </button>
  )
})
LikeBurst.displayName = "LikeBurst"

export const pressKitPropsMeta: PropsMeta = {
  name: "PressDepth / Ripple / LikeBurst",
  props: [
    { name: "children (PressDepth, Ripple)", type: "ReactElement (a control)", default: null, control: "none" },
    { name: "pressed (LikeBurst)", type: "boolean", default: "false", control: "boolean" },
    { name: "onChange (LikeBurst)", type: "(pressed: boolean) => void", default: null, control: "none" },
    { name: "particles (LikeBurst)", type: "number", default: "8", control: "number" },
  ],
}
