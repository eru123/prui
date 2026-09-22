import * as React from "react"
import { Clock } from "lucide-react"
import { Button } from "../core/button"
import { Modal } from "../core/modal"

/**
 * SessionTimeout: idle detection with a countdown warning, extracted from
 * HRLabs' SessionTimeout flow. Tracks mousedown/keydown/scroll/touch activity;
 * after `timeout` minus `warningTime` of inactivity it shows a countdown
 * dialog (Continue session / Log out) and calls onTimeout when it expires.
 */

export interface SessionTimeoutProps {
  /** Total idle time before logout, in minutes. Default 15. */
  timeout?: number
  /** How long before the timeout the warning appears, in minutes. Default 2. */
  warningTime?: number
  /** Called when the session expires (or the user logs out early). */
  onTimeout?: () => void
  /** Called when the user extends the session. */
  onExtend?: () => void
  /** Dialog copy overrides. */
  title?: string
  message?: string
}

const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = ["mousedown", "keydown", "scroll", "touchstart", "click"]

export function SessionTimeout({
  timeout = 15,
  warningTime = 2,
  onTimeout,
  onExtend,
  title = "Session expiring soon",
  message = "Your session is about to expire due to inactivity.",
}: SessionTimeoutProps) {
  const totalMs = Math.max(0, timeout) * 60_000
  const warningMs = Math.min(Math.max(0, warningTime) * 60_000, totalMs)

  const [warnOpen, setWarnOpen] = React.useState(false)
  const [remaining, setRemaining] = React.useState(warningMs)

  // Refs so the activity listener never needs to re-bind when state changes.
  const warnTimer = React.useRef<number | null>(null)
  const endTimer = React.useRef<number | null>(null)
  const tick = React.useRef<number | null>(null)
  const warned = React.useRef(false)

  const clearTimers = React.useCallback(() => {
    for (const t of [warnTimer, endTimer, tick]) {
      if (t.current != null) {
        clearInterval(t.current)
        clearTimeout(t.current)
        t.current = null
      }
    }
  }, [])

  const expire = React.useCallback(() => {
    clearTimers()
    setWarnOpen(false)
    onTimeout?.()
  }, [clearTimers, onTimeout])

  const arm = React.useCallback(() => {
    clearTimers()
    setWarnOpen(false)
    warned.current = false
    warnTimer.current = window.setTimeout(() => {
      warned.current = true
      setRemaining(warningMs)
      setWarnOpen(true)
      tick.current = window.setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1000) {
            expire()
            return 0
          }
          return prev - 1000
        })
      }, 1000)
    }, totalMs - warningMs)
    endTimer.current = window.setTimeout(expire, totalMs)
  }, [clearTimers, expire, totalMs, warningMs])

  React.useEffect(() => {
    const onActivity = () => {
      if (!warned.current) arm()
    }
    for (const e of ACTIVITY_EVENTS) document.addEventListener(e, onActivity, { passive: true })
    arm()
    return () => {
      clearTimers()
      for (const e of ACTIVITY_EVENTS) document.removeEventListener(e, onActivity)
    }
  }, [arm, clearTimers])

  const extend = () => {
    onExtend?.()
    arm()
  }

  const mm = Math.floor(remaining / 60_000)
  const ss = Math.floor((remaining % 60_000) / 1000)
  const clock = `${mm}:${String(ss).padStart(2, "0")}`

  return (
    <Modal
      open={warnOpen}
      onClose={extend}
      size="sm"
      ariaLabel={title}
    >
      <div className="flex flex-col items-center gap-1 px-8 pb-2 pt-8 text-center">
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-warn/15">
          <Clock className="h-6 w-6 text-warn" aria-hidden />
        </div>
        <h2 className="text-lg font-semibold text-fg">{title}</h2>
        <p className="text-sm text-dim">{message}</p>
        <div className="py-4 font-mono text-4xl font-bold text-fg" data-testid="session-countdown">
          {clock}
        </div>
      </div>
      <div className="flex flex-col gap-2 px-8 pb-8 sm:flex-row">
        <Button variant="default" className="flex-1" onClick={expire} data-testid="session-logout">
          Log out now
        </Button>
        <Button variant="primary" className="flex-1" onClick={extend} data-testid="session-extend">
          Continue session
        </Button>
      </div>
    </Modal>
  )
}

export const sessionTimeoutPropsMeta = {
  name: "SessionTimeout",
  props: [
    { name: "timeout", type: "number", default: "15", control: "number" },
    { name: "warningTime", type: "number", default: "2", control: "number" },
    { name: "onTimeout", type: "() => void", default: null, control: "none" },
    { name: "onExtend", type: "() => void", default: null, control: "none" },
  ],
} as const
