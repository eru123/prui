import * as React from "react"
import { ComponentDoc, MetaOnly, Button, Tooltip, Popover, Checkbox } from "../../components/ComponentDoc"
import { tooltipPropsMeta, popoverPropsMeta } from "prui/core"

export function TooltipDoc() {
  return (
    <ComponentDoc
      name="Tooltip"
      importPath="@skiddph/prui/core"
      description="A hover/focus label for controls that need one more line of explanation. Non-modal by design: it never takes focus, shows after a short delay, hides immediately, and flips against the viewport."
      when={[
        "Clarifying icon-only buttons and abbreviated metrics",
        "Explaining why a control is disabled",
        "Revealing the full value of a truncated string"
      ]}
      anatomy={
        <p>
          <code className="rounded bg-[var(--prui-raise)] px-1">&lt;Tooltip content side align delay&gt;</code> wraps a trigger
          element (cloned and wired) or plain content; the bubble portals to the body and anchors to the trigger.
        </p>
      }
      demos={[
        {
          title: "Sides",
          render: (
            <>
              <Tooltip content="Deletes the selected rows permanently" side="top"><Button variant="danger">top</Button></Tooltip>
              <Tooltip content="Copies the API key to your clipboard" side="bottom"><Button>bottom</Button></Tooltip>
              <Tooltip content="Archived rows stay searchable" side="right"><Button variant="ghost">right</Button></Tooltip>
            </>
          ),
          code: `<Tooltip content="Deletes the selected rows permanently">
  <Button variant="danger">Delete</Button>
</Tooltip>`,
        },
        {
          title: "Keyboard focus shows it too",
          desc: "Tab to the button; the tooltip appears on focus, exactly as on hover.",
          render: (
            <Tooltip content="Press to sync all workspaces" delay={100}>
              <Button variant="outline">Sync now</Button>
            </Tooltip>
          ),
          code: `<Tooltip content="Press to sync all workspaces" delay={100}>
  <Button variant="outline">Sync now</Button>
</Tooltip>`,
        },
      ]}
      api={<MetaOnly meta={tooltipPropsMeta} />}
      examples={[
        {
          title: "Icon-only action",
          code: `<Tooltip content="Duplicate row">
  <Button variant="ghost" size="icon" aria-label="Duplicate"><Copy /></Button>
</Tooltip>`,
        },
        {
          title: "Truncated value",
          code: `<Tooltip content={user.email}>
  <span className="truncate">{user.email}</span>
</Tooltip>`,
        },
      ]}
      dos={[
        "Keep content to one short sentence",
        "Wrap the focusable control itself so hover and keyboard agree",
        "Prefer side=top near the bottom edge of the viewport (flipping is automatic)",
      ]}
      donts={[
        "Don't put interactive content inside a tooltip; use Popover",
        "Don't duplicate the visible label as the tooltip",
        "Don't rely on tooltips on touch-only targets",
      ]}
      accessibility={
        <ul className="list-disc pl-5">
          <li>Shows on focus as well as hover; role=tooltip when visible.</li>
          <li>Escape (while the tooltip is the topmost overlay) hides it without moving focus.</li>
          <li>pointer-events: none; the bubble can never intercept a click.</li>
        </ul>
      }
      composition={
        <p>
          Wraps any single element (button, link, span). Compound triggers: pass a plain node and it becomes a focusable
          span, or clone-wire your own element as the trigger.
        </p>
      }
      customization={<p>Bubble styles come from tokens (--prui-surface, --prui-shadow-md); max width is 15rem; restyle via className on the wrapper.</p>}
      edgeCases={[
        "The delay is canceled if you leave before it fires",
        "Flips top↔bottom / left↔right automatically and clamps inside the viewport with 8px padding",
        "Repositions on scroll and resize while open",
      ]}
      mistakes={[
        "Tooltips on disabled buttons (disabled controls don't fire hover/focus in all browsers; wrap them instead)",
        "Long paragraphs inside the bubble",
      ]}
      performance={<p>One portaled node while open; the anchor hook listens to scroll/resize only while visible.</p>}
      crossLinks={[
        { label: "Popover; interactive anchored content", href: "/components/popover" },
        { label: "Dropdown; menus", href: "/components/dropdown" },
      ]}
    />
  )
}

export function PopoverDoc() {
  const [open, setOpen] = React.useState(false)
  const [active, setActive] = React.useState(true)
  return (
    <ComponentDoc
      name="Popover"
      importPath="@skiddph/prui/core"
      description="A click-triggered anchored panel for rich, interactive content; filters, pickers, mini-forms. Non-modal by default: initial focus moves inside, Escape or an outside click closes it, and focus returns to the trigger."
      when={[
        "Filter/control clusters that shouldn't warrant a dialog",
        "Quick forms (rename, note) tied to an element",
        "Any anchored surface with focusable content; the interactive Tooltip"
      ]}
      anatomy={
        <p>
          <code className="rounded bg-[var(--prui-raise)] px-1">&lt;Popover trigger placement modal ariaLabel&gt;</code> clones
          your trigger (aria-haspopup=dialog + aria-expanded) and portals the panel with collision-aware placement
          (default bottom-end; shifts and flips to stay inside the visible boundary, RTL-aware start/end).
        </p>
      }
      demos={[
        {
          title: "Quick filter",
          render: (
            <>
              <Popover open={open} onOpenChange={setOpen} ariaLabel="Quick filter" trigger={<Button>Quick filter</Button>}>
                <div className="flex w-56 flex-col gap-3">
                  <Checkbox label="Active only" checked={active} onChange={setActive} />
                  <Checkbox label="Has salary" />
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button size="sm" variant="primary" onClick={() => setOpen(false)}>Apply</Button>
                  </div>
                </div>
              </Popover>
            </>
          ),
          code: `<Popover ariaLabel="Quick filter" trigger={<Button>Quick filter</Button>}>
  <Checkbox label="Active only" checked={active} onChange={setActive} />
  <div className="flex justify-end gap-2">
    <Button size="sm" variant="ghost">Cancel</Button>
    <Button size="sm" variant="primary" onClick={apply}>Apply</Button>
  </div>
</Popover>`,
        },
        {
          title: "Controlled open state",
          desc: "drive open from URL state, dashboards, or a parent; the trigger still toggles.",
          render: (
            <Popover trigger={<Button variant="outline">Details</Button>} ariaLabel="Chart details">
              <div className="w-64 text-sm text-[var(--prui-dim)]">
                Sessions peaked at 14:00. This panel opens uncontrolled; the demo above shows the controlled variant.
              </div>
            </Popover>
          ),
          code: `const [open, setOpen] = useState(false)
<Popover open={open} onOpenChange={setOpen} trigger={<Button>Filters</Button>}>
  …
</Popover>`,
        },
      ]}
      api={<MetaOnly meta={popoverPropsMeta} />}
      examples={[
        {
          title: "Modal popover (traps focus)",
          code: `<Popover modal ariaLabel="Rename" trigger={<Button>Rename</Button>}>
  <Input defaultValue={name} … />
</Popover>`,
        },
        {
          title: "Placements",
          desc: "side-align values, all collision-aware: bottom-end (default), top-center, right-start, … start/end follow the writing direction.",
          code: `<Popover placement="top-center" trigger={<Button>Open</Button>}>…</Popover>

// legacy pair still composes: side + align
<Popover side="right" align="center" trigger={<Button>Open</Button>}>…</Popover>`,
        },
      ]}
      dos={[
        "Give every panel an ariaLabel",
        "Keep panels compact; use a Dialog for anything scrollable",
        "Return focus is automatic; don't fight it",
      ]}
      donts={[
        "Don't put menus in a Popover. Dropdown has the menu keyboard map",
        "Don't stack popovers off each other; anchor to the real trigger",
      ]}
      accessibility={
        <ul className="list-disc pl-5">
          <li>Trigger: aria-haspopup=dialog + aria-expanded; panel is role=dialog with an accessible name.</li>
          <li>Initial focus lands on the first focusable (or the panel); Escape and outside-pointer close and restore focus.</li>
          <li>Tab moves focus out and closes the non-modal panel; modal opts into the full trap + inert background.</li>
        </ul>
      }
      composition={
        <p>
          Composes with Checkbox, RadioGroup, Combobox, TimePanel; anything interactive. The panel repositions on
          scroll/resize/trigger move: it shifts along its alignment axis first, flips the side when it must, and
          never leaves the clipping boundary of its containers.
        </p>
      }
      customization={<p>minWidth defaults to 200px; panel tokens are the standard surface/line/shadow set. Content padding is yours.</p>}
      edgeCases={[
        "Trigger clicks toggle; clicks inside the panel never close it",
        "onOpenChange fires on every transition so controlled state stays honest",
      ]}
      mistakes={[
        "Forgetting ariaLabel; the dialog then borrows a default name",
        "Wrapping the whole page in modal popovers (defeats non-modality)",
      ]}
      performance={<p>One portal while open; scroll/resize listeners exist only while visible.</p>}
      crossLinks={[
        { label: "Tooltip; passive labels", href: "/components/tooltip" },
        { label: "Dialog; modal flows", href: "/components/dialog" },
      ]}
    />
  )
}
