import * as React from "react"
import { ComponentDoc, MetaOnly, Button, Alert, toast, Toaster, dismissAllToasts, Progress, Skeleton, Spinner } from "../../components/ComponentDoc"
import { alertPropsMeta, toastPropsMeta, progressPropsMeta, skeletonPropsMeta, spinnerPropsMeta } from "prui/core"

export function AlertDoc() {
  const [dismissed, setDismissed] = React.useState(false)
  return (
    <ComponentDoc
      name="Alert"
      importPath="@skiddph/prui/core"
      description="An inline callout for persistent status feedback. It occupies layout (unlike a toast), announces with the right urgency; role=alert for danger/warning, role=status otherwise; and can host a dismiss action."
      when={[
        "Form/validation outcomes the user must see while acting on the page",
        "Quotas, warnings, and degraded-state notices that persist",
        "Error banners above forms where the field-level message is not enough",
        "Any status that should still be visible after the user scrolls or moves focus",
      ]}
      anatomy={
        <p>
          A single element: <code className="rounded bg-[var(--prui-raise)] px-1">&lt;Alert variant title onDismiss hideIcon&gt;</code>. Icon,
          title, content, and optional dismiss are arranged by the component; every color resolves through theme tokens.
        </p>
      }
      demos={[
        {
          title: "Variants",
          render: (
            <div className="flex w-full flex-col gap-2">
              <Alert variant="neutral">A neutral note with no title.</Alert>
              <Alert variant="info" title="Maintenance window">Read replicas sync at 02:00 UTC.</Alert>
              <Alert variant="success" title="Deployed">Build 128 is live in production.</Alert>
              <Alert variant="warning" title="Approaching limit">8 of 10 seats used.</Alert>
              <Alert variant="danger" title="Upload failed">The file exceeds the 1MB limit.</Alert>
            </div>
          ),
          code: `<Alert variant="neutral">A neutral note.</Alert>
<Alert variant="info" title="Maintenance">Read replicas sync at 02:00.</Alert>
<Alert variant="success" title="Deployed">Build 128 is live.</Alert>
<Alert variant="warning" title="Approaching limit">8 of 10 seats used.</Alert>
<Alert variant="danger" title="Upload failed">File exceeds 1MB.</Alert>`,
        },
        {
          title: "Dismissible",
          desc: "onDismiss renders a labelled close button; pair it with your own visibility state.",
          render: dismissed ? (
            <Button size="sm" onClick={() => setDismissed(false)}>Bring it back</Button>
          ) : (
            <Alert variant="warning" title="Cookie preferences" className="w-full" onDismiss={() => setDismissed(true)}>
              You can change these any time in settings.
            </Alert>
          ),
          code: `const [open, setOpen] = useState(true)

{open && (
  <Alert variant="warning" title="Cookie preferences" onDismiss={() => setOpen(false)}>
    You can change these any time in settings.
  </Alert>
)}`,
        },
      ]}
      api={<MetaOnly meta={alertPropsMeta} />}
      examples={[
        {
          title: "Form-level error banner",
          code: `{error && (
  <Alert variant="danger" title="Save failed">
    {error.message}; correct the fields below and retry.
  </Alert>
)}`,
        },
        {
          title: "Icon-free in dense tables",
          code: `<Alert variant="warning" hideIcon className="text-xs">
  Row 12 conflicts with an existing record.
</Alert>`,
        },
      ]}
      dos={[
        "Keep one alert per concern; stack related ones with a flex column",
        "Use danger/warning only for what must interrupt; they announce assertively",
        "Give a title when the body is longer than a line",
      ]}
      donts={[
        "Don't use Alert for transient feedback; that is toast()'s job",
        "Don't alert the same condition in two places on one screen",
        "Don't rely on color alone; the icon plus title carries the meaning",
      ]}
      accessibility={
        <ul className="list-disc pl-5">
          <li>danger/warning map to <code>role=alert</code> (assertive announcement); other variants use <code>role=status</code> (polite).</li>
          <li>The dismiss button is labelled from the dictionary (<code>dismiss</code>) and keyboard operable.</li>
          <li>Icons are aria-hidden; text carries the message for screen readers.</li>
          <li>Appears with a fade that is disabled under prefers-reduced-motion.</li>
        </ul>
      }
      composition={
        <p>
          Alert is a leaf; compose it anywhere in layout: above forms, inside <code>DialogBody</code>, or as an empty-state
          explainer. Children are free-form nodes, so links and buttons can live inside the body.
        </p>
      }
      customization={
        <p>
          Variants resolve to theme tokens (<code>--prui-ok</code>, <code>--prui-warn</code>, <code>--prui-danger</code>,
          <code>--prui-brand</code>). Override per instance with <code>className</code>; a re-skinned app follows automatically.
        </p>
      }
      edgeCases={[
        "Empty children with only a title renders the icon + title row alone",
        "onDismiss without controlled state dismisses visually but re-mounts on re-render; own the state",
        "Long unbroken strings wrap normally; the icon stays top-aligned",
      ]}
      mistakes={[
        "Rendering an Alert per row in a table (use a toast or a column badge instead)",
        "Using role=alert variants for positive news; it interrupts the screen-reader user unnecessarily",
      ]}
      performance={
        <p>Static markup, no portals, no listeners. Rendering cost is a single element tree; safe in large lists.</p>
      }
      crossLinks={[
        { label: "Toast; transient feedback", href: "/components/toast" },
        { label: "Dialog; modal errors", href: "/components/dialog" },
      ]}
    />
  )
}

export function ToastDoc() {
  return (
    <ComponentDoc
      name="Toast"
      importPath="@skiddph/prui/core"
      description="Transient notifications: an imperative toast() queue plus a mounted <Toaster/> stack. Announced through an aria-live region without moving focus, auto-dismissing after a delay, and always layered above every other overlay."
      when={[
        "Confirming an action the user just took (saved, copied, deployed)",
        "Background job outcomes (export finished, sync failed)",
        "Non-blocking errors where the user can continue working",
      ]}
      anatomy={
        <p>
          Two pieces: <code className="rounded bg-[var(--prui-raise)] px-1">&lt;Toaster /&gt;</code> mounted once near the app root
          renders the portaled stack; <code className="rounded bg-[var(--prui-raise)] px-1">toast(&#123; title, description, variant, duration &#125;)</code> queues
          from anywhere and returns a dismiss handle.
        </p>
      }
      demos={[
        {
          title: "The four variants + manual dismiss",
          render: (
            <>
              <Toaster />
              <Button variant="primary" size="sm" onClick={() => toast({ title: "Saved", description: "Changes are live.", variant: "success" })}>success</Button>
              <Button size="sm" onClick={() => toast({ title: "Heads up", variant: "warning", duration: 0 })}>warning (sticky)</Button>
              <Button variant="danger" size="sm" onClick={() => toast({ title: "Upload failed", variant: "danger" })}>danger</Button>
              <Button variant="ghost" size="sm" onClick={() => dismissAllToasts()}>clear</Button>
            </>
          ),
          code: `import { Toaster, toast } from '@skiddph/prui/core'

// mount once, near the app root
<Toaster />

// fire from anywhere; event handlers, effects, query hooks
const t = toast({ title: 'Saved', description: 'Changes are live.', variant: 'success' })
t.dismiss()          // hide early
toast({ title: 'Sticky', variant: 'warning', duration: 0 })  // no auto-dismiss`,
        },
      ]}
      api={<MetaOnly meta={toastPropsMeta} />}
      examples={[
        {
          title: "Optimistic save with rollback",
          code: `const t = toast({ title: 'Saving…', variant: 'neutral', duration: 0 })
try {
  await api.save(values)
  t.dismiss()
  toast({ title: 'Saved', variant: 'success' })
} catch (e) {
  t.dismiss()
  toast({ title: 'Save failed', description: e.message, variant: 'danger', duration: 0 })
}`,
        },
        {
          title: "Positioning the stack",
          code: `<Toaster position="top-center" />   // top-right | top-center | bottom-right | bottom-center | bottom-left`,
        },
      ]}
      dos={[
        "Mount exactly one Toaster per app",
        "Keep titles short (a few words); put detail in description",
        "Use duration: 0 for errors the user must act on",
        "Pair with onDismiss for cleanup (logs, refetches)",
      ]}
      donts={[
        "Don't toast on page load; that's an Alert or a banner",
        "Don't queue dozens on a loop; collapse repeated events into one",
        "Don't put critical actions only inside a toast",
      ]}
      accessibility={
        <ul className="list-disc pl-5">
          <li>The stack is an <code>aria-live=polite</code> list; new toasts announce without stealing focus.</li>
          <li>Each toast has a labelled dismiss button; Escape is not bound (toasts are non-blocking).</li>
          <li>The slide-in animation is disabled under prefers-reduced-motion.</li>
        </ul>
      }
      composition={
        <p>
          Toaster is a portal sibling of your app tree. Description accepts nodes, so a toast can carry a link
          (“View build →”). The imperative API works outside React too (API interceptors, workers via callbacks).
        </p>
      }
      customization={
        <p>
          Width (w-80), radius, and shadow come from tokens; pass <code>className</code> to Toaster to restyle the stack.
          Variant colors map to <code>--prui-ok/warn/danger/brand</code>.
        </p>
      }
      edgeCases={[
        "duration: 0 keeps the toast until dismissed or dismissAllToasts()",
        "toasts emitted before a Toaster mounts queue and flush on mount",
        "stacks in the z-toast layer sit above open modals by design",
      ]}
      mistakes={[
        "Rendering a Toaster per page (route changes duplicate stacks)",
        "Using toasts for validation errors the user must fix inline",
      ]}
      performance={
        <p>
          The queue updates through a tiny subscription store, not React state in your app; firing a toast never
          re-renders the app tree.
        </p>
      }
      crossLinks={[
        { label: "Alert; persistent inline feedback", href: "/components/alert" },
        { label: "Spinner; in-place loading", href: "/components/spinner" },
      ]}
    />
  )
}

export function ProgressDoc() {
  const [v, setV] = React.useState(35)
  return (
    <ComponentDoc
      name="Progress"
      importPath="@skiddph/prui/core"
      description="A linear progress indicator with the complete ARIA value triplet, an optional percentage label, an indeterminate mode while the total is unknown, and four color variants."
      when={[
        "Uploads, exports, multi-step setup; anything with a known total",
        "Indeterminate activity: request in flight, background job started",
        "Reading position or quota usage with a labeled meter"
      ]}
      anatomy={
        <p>
          <code className="rounded bg-[var(--prui-raise)] px-1">&lt;Progress value min max showValue variant&gt;</code>; a
          role=progressbar track plus an optional numeric label. Omit <code>value</code> for the indeterminate sweep.
        </p>
      }
      demos={[
        {
          title: "Determinate, labeled, and indeterminate",
          render: (
            <div className="flex w-full flex-col gap-3">
              <Progress value={v} showValue aria-label="Upload" />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setV(Math.max(0, v - 10))}>-10</Button>
                <Button size="sm" onClick={() => setV(Math.min(100, v + 10))}>+10</Button>
              </div>
              <Progress variant="danger" aria-label="Retrying" />
            </div>
          ),
          code: `<Progress value={62} showValue aria-label="Upload" />
<Progress aria-label="Retrying" />          {/* indeterminate */}
<Progress variant="success" value={done} max={tasks.length} />`,
        },
      ]}
      api={<MetaOnly meta={progressPropsMeta} />}
      examples={[
        {
          title: "Non-100 scales",
          code: `<Progress value={answered} min={0} max={survey.questions.length} showValue aria-label="Survey" />`,
        },
        {
          title: "Step indicator",
          code: `<Progress value={step} min={1} max={steps.length} variant="brand" aria-label="Setup steps" />`,
        },
      ]}
      dos={[
        "Always pass aria-label when there is no visible label",
        "Use indeterminate only when the total is truly unknown",
        "Keep one progress line per activity",
      ]}
      donts={[
        "Don't animate value manually; let the token transition smooth it",
        "Don't use red (danger) for routine progress; reserve it for failures",
      ]}
      accessibility={
        <ul className="list-disc pl-5">
          <li><code>role=progressbar</code> with <code>aria-valuenow/min/max</code>; indeterminate omits aria-valuenow per spec.</li>
          <li>Pair with a visible label or aria-label; the percentage label is visual only.</li>
        </ul>
      }
      composition={<p>Sits inline at block width; compose inside cards, drawer bodies, or list rows. Pair with a Spinner for icon-sized activity.</p>}
      customization={<p>Track uses --prui-raise; the bar uses the variant token (--prui-brand/ok/warn/danger). Height and radius via className.</p>}
      edgeCases={[
        "value is clamped to [min, max]",
        "value=0 renders an empty track (not indeterminate)",
        "min === max degenerates to a full bar",
      ]}
      mistakes={[
        "Confusing a meter (quota) with progress; this component announces as progress",
        "Rendering indeterminate forever after the job finishes",
      ]}
      performance={<p>Pure presentational; value updates animate the bar width only.</p>}
      crossLinks={[
        { label: "Spinner; compact activity", href: "/components/spinner" },
        { label: "Skeleton; layout placeholders", href: "/components/skeleton" },
      ]}
    />
  )
}

export function SkeletonDoc() {
  return (
    <ComponentDoc
      name="Skeleton"
      importPath="@skiddph/prui/core"
      description="Shimmer placeholders for loading layouts. Decorative by design (aria-hidden) so it never announces itself; pair it with a status region when the loading state itself matters."
      when={[
        "Reserving layout while a page or card streams in",
        "List rows awaiting data (keeps scroll position stable)",
        "Avoiding layout shift on slow connections"
      ]}
      anatomy={
        <p>
          <code className="rounded bg-[var(--prui-raise)] px-1">&lt;Skeleton variant lines bg&gt;</code>; text lines (with an
          auto-shortened last line), a rect for blocks and media, or a circle for avatars.
        </p>
      }
      demos={[
        {
          title: "Card skeleton",
          render: (
            <div className="flex w-64 flex-col gap-2">
              <div className="flex items-center gap-3">
                <Skeleton variant="circle" className="h-10 w-10" />
                <div className="flex-1"><Skeleton variant="text" /></div>
              </div>
              <Skeleton variant="text" lines={3} />
              <Skeleton variant="rect" className="h-24 w-full" />
            </div>
          ),
          code: `<div className="flex w-64 flex-col gap-2">
  <div className="flex items-center gap-3">
    <Skeleton variant="circle" className="h-10 w-10" />
    <div className="flex-1"><Skeleton variant="text" /></div>
  </div>
  <Skeleton variant="text" lines={3} />
  <Skeleton variant="rect" className="h-24 w-full" />
</div>`,
        },
      ]}
      api={<MetaOnly meta={skeletonPropsMeta} />}
      examples={[
        {
          title: "Row placeholders while loading",
          code: `{loading
  ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
  : rows.map(renderRow)}`,
        },
      ]}
      dos={[
        "Match the skeleton shape to the real content it reserves",
        "Announce loading separately (Spinner label or a status region) when it matters",
      ]}
      donts={[
        "Don't skeleton everything; a single spinner is better for sub-300ms waits",
        "Don't leave skeletons up on error; show an Alert",
      ]}
      accessibility={
        <ul className="list-disc pl-5">
          <li>Always aria-hidden; no announcement, no focus.</li>
          <li>The shimmer animation is disabled under prefers-reduced-motion.</li>
        </ul>
      }
      composition={<p>Plain divs: compose freely in grids, flex rows, or inside Card parts. bg overrides the shimmer base per instance.</p>}
      customization={<p>Base color is --prui-raise with a wave animation; pass any CSS background via bg or restyle the width/height with className.</p>}
      edgeCases={[
        "lines only applies to the text variant",
        "the last line of a multi-line skeleton renders at 2/3 width for a natural paragraph end",
      ]}
      mistakes={[
        "Skeletons that never resolve (missing loading=false path)",
        "Using skeletons for empty states; show an empty message instead",
      ]}
      performance={<p>One div per line; the animation is a single opacity keyframe shared by all instances.</p>}
      crossLinks={[
        { label: "Spinner; labeled activity", href: "/components/spinner" },
        { label: "Alert; error states", href: "/components/alert" },
      ]}
    />
  )
}

export function SpinnerDoc() {
  return (
    <ComponentDoc
      name="Spinner"
      importPath="@skiddph/prui/core"
      description="An inline loading indicator with role=status and an accessible label; the announcement-friendly counterpart to Skeleton, sized from xs (inline in text) to lg (empty states)."
      when={[
        "Button-level and inline activity where a skeleton is too much",
        "Empty-state loading panels",
        "Inside table cells or list rows awaiting a value"
      ]}
      anatomy={
        <p>
          <code className="rounded bg-[var(--prui-raise)] px-1">&lt;Spinner label size /&gt;</code>; an animated icon inside a
          role=status wrapper; the label defaults to the localized “Loading…” string.
        </p>
      }
      demos={[
        {
          title: "Sizes",
          render: (
            <div className="flex items-center gap-4">
              <Spinner size="xs" label="xs" />
              <Spinner size="sm" label="sm" />
              <Spinner label="md (default)" />
              <Spinner size="lg" label="lg" />
            </div>
          ),
          code: `<Spinner size="xs" label="Loading rows" />`,
        },
      ]}
      api={<MetaOnly meta={spinnerPropsMeta} />}
      examples={[
        {
          title: "Loading panel",
          code: `{isLoading ? (
  <div className="flex h-40 items-center justify-center">
    <Spinner size="lg" label="Loading report" />
  </div>
) : (
  <Report data={data} />
)}`,
        },
      ]}
      dos={["Give a specific label when the wait has a subject (“Loading chart…”)"]}
      donts={["Don't pair a Spinner with a Skeleton for the same region", "Don't spin forever; cap and show an error"]}
      accessibility={
        <ul className="list-disc pl-5">
          <li>role=status announces politely on appearance.</li>
          <li>The label is both the aria-label and a screen-reader-only span.</li>
        </ul>
      }
      composition={<p>Inline-flex: sits in text, buttons, and table cells without breaking the line box. Button has its own loading spinner; use that one there.</p>}
      customization={<p>Color inherits the dim token; override with className (text-[var(--prui-brand)] etc.).</p>}
      edgeCases={["The spin animation stops under prefers-reduced-motion (the icon remains visible)"]}
      mistakes={["Using aria-hidden spinners with no announcement anywhere in the region"]}
      performance={<p>One icon; the animation is Tailwind's animate-spin on a single element.</p>}
      crossLinks={[
        { label: "Skeleton; layout placeholders", href: "/components/skeleton" },
        { label: "Progress; known totals", href: "/components/progress" },
      ]}
    />
  )
}
