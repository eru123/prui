import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "./cn"
import type { PropsMeta } from "./props-meta"

/**
 * WizardSteps: the "where am I in this flow" header for multi-step forms.
 * Completed steps are clickable (the standard walkthrough affordance),
 * future steps stay locked unless allowSkip, and the connectors fill as
 * progress advances. Present the step content yourself next to it.
 */

export interface WizardStep {
  label: string
  description?: string
}

export interface WizardStepsProps {
  steps: ReadonlyArray<WizardStep>
  current?: number
  defaultCurrent?: number
  onStepChange?: (index: number) => void
  /** Allow jumping to any step, not just visited ones. Default false. */
  allowSkip?: boolean
  className?: string
}

export const WizardSteps = React.forwardRef<HTMLOListElement, WizardStepsProps>(function WizardSteps(
  { steps, current: currentProp, defaultCurrent = 0, onStepChange, allowSkip = false, className },
  ref,
) {
  const isControlled = currentProp !== undefined
  const [uncontrolled, setUncontrolled] = React.useState(defaultCurrent)
  const current = isControlled ? currentProp : uncontrolled
  // furthest step reached gates which future steps unlock
  const [furthest, setFurthest] = React.useState(defaultCurrent)

  // uncontrolled wizards allow the linear next step; controlled ones gate
  // by furthest-visited (or allowSkip) since the app drives current
  const canGo = (i: number) => allowSkip || i <= furthest || (!isControlled && i <= current + 1)

  const goto = (i: number) => {
    if (i < 0 || i >= steps.length) return
    if (!canGo(i)) return
    if (!isControlled) {
      setUncontrolled(i)
    }
    setFurthest((f) => Math.max(f, i))
    onStepChange?.(i)
  }

  return (
    <ol ref={ref} aria-label="Progress" className={cn("prui-wizard-steps flex w-full", className)}>
      {steps.map((step, i) => {
        const state = i < current ? "complete" : i === current ? "current" : "upcoming"
        const reachable = canGo(i)
        const last = i === steps.length - 1
        return (
          <li key={step.label} className={cn("flex min-w-0 flex-col items-center", !last && "flex-1")} data-state={state}>
            <button
              type="button"
              onClick={() => goto(i)}
              disabled={!reachable}
              aria-current={state === "current" ? "step" : undefined}
              className={cn(
                "group inline-flex w-full cursor-pointer select-none flex-col items-center gap-1.5 rounded-prui outline-none",
                "focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                !reachable && "cursor-not-allowed",
              )}
            >
              {/* circle row: connector in / circle / connector out, at circle height */}
              <span className="flex w-full items-center">
                <span aria-hidden className={cn("h-0.5 flex-1 overflow-hidden rounded-full bg-line", i === 0 && "invisible")}>
                  <span
                    className={cn("block h-full bg-brand transition-[width] duration-300 ease-prui", i <= current ? "w-full" : "w-0")}
                  />
                </span>
                <span
                  className={cn(
                    "mx-2 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                    "transition-colors duration-200",
                    state === "complete" && "border-transparent bg-brand text-brand-fg",
                    state === "current" && "border-brand text-brand ring-2 ring-ring/30",
                    state === "upcoming" && "border-line text-dim group-enabled:group-hover:border-dim",
                    !reachable && "opacity-60",
                  )}
                >
                  {state === "complete" ? <Check className="h-3.5 w-3.5" aria-hidden /> : i + 1}
                </span>
                <span aria-hidden className={cn("h-0.5 flex-1 overflow-hidden rounded-full bg-line", last && "invisible")}>
                  <span
                    className={cn("block h-full bg-brand transition-[width] duration-300 ease-prui", i < current ? "w-full" : "w-0")}
                  />
                </span>
              </span>
              <span className="flex max-w-24 flex-col items-center text-center">
                <span className={cn("text-xs font-medium", state === "current" ? "text-fg" : "text-dim")}>{step.label}</span>
                {step.description ? <span className="mt-0.5 text-2xs text-dim">{step.description}</span> : null}
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
})
WizardSteps.displayName = "WizardSteps"

export const wizardStepsPropsMeta: PropsMeta = {
  name: "WizardSteps",
  props: [
    { name: "steps", type: "{ label, description? }[]", default: null, control: "none" },
    { name: "current", type: "number", default: "undefined", control: "number" },
    { name: "defaultCurrent", type: "number", default: "0", control: "number" },
    { name: "onStepChange", type: "(index: number) => void", default: null, control: "none" },
    { name: "allowSkip", type: "boolean", default: "false", control: "boolean" },
  ],
}
