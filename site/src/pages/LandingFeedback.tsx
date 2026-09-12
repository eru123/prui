import * as React from "react"
import { lazy, Suspense } from "react"
import { Button, Alert, Progress, Spinner } from "prui/core"

// Loads with the toast demo chunk: keeps six lucide icons (Alert's variant
// set, Loader2) out of the landing bundle (AC-6). toast() queues until the
// Toaster mounts, so the first click still shows its toast.
const LazyToaster = lazy(() => import("prui/core").then((m) => ({ default: m.Toaster })))

/** Live feedback demo: alert callout, progress, spinner, toast trigger. */
export function LandingFeedback() {
  const [toasterOn, setToasterOn] = React.useState(false)
  return (
    <div className="flex min-h-9 flex-col justify-center gap-2.5">
      <Alert variant="success" className="text-xs">Deployed · build 128 is live</Alert>
      <Progress value={72} aria-label="Uploading build" />
      <div className="flex items-center gap-2.5">
        <Spinner size="sm" label="Syncing" />
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setToasterOn(true)
            import("prui/core").then((m) => m.toast({ title: "Build 128 is live", variant: "success" }))
          }}
        >
          toast()
        </Button>
      </div>
      {toasterOn ? (
        <Suspense fallback={null}>
          <LazyToaster />
        </Suspense>
      ) : null}
    </div>
  )
}
