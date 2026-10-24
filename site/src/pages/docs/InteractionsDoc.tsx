import * as React from "react"
import { Trash2 } from "lucide-react"
import { ComponentDoc } from "../../components/ComponentDoc"
import {
  CopyButton, HoldToConfirm, OTPInput, PasswordStrength, FloatingLabel, ExpandingSearch,
  SegmentedControl, Slider, WizardSteps, ContextMenu, Lightbox, LikeBurst, Ripple, PressDepth, Skeleton, SkeletonSwap,
} from "@skiddph/prui/core"

/**
 * /components/interactions: the micro-interaction kit — behaviors inspired
 * by interior.dev, reimplemented in prui tokens and CSS transitions (no
 * Motion dependency). One page: they are small by design.
 */

function DemoHolder({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-14 flex-wrap items-center gap-3">{children}</div>
}

export default function InteractionsDoc() {
  const [pw, setPw] = React.useState("")
  const [range, setRange] = React.useState("day")
  const [volume, setVolume] = React.useState(50)
  const [step, setStep] = React.useState(0)
  const [liked, setLiked] = React.useState(false)
  const [swapping, setSwapping] = React.useState(true)

  return (
    <ComponentDoc
      name="Interaction kit"
      importPath="@skiddph/prui/core"
      description="Micro-interaction primitives — the half-second after a click. CopyButton, HoldToConfirm, OTPInput, PasswordStrength, FloatingLabel, ExpandingSearch, SegmentedControl, Slider (with detents), WizardSteps, ContextMenu, Lightbox, and the press-feedback kit (Ripple / PressDepth / LikeBurst), plus SkeletonSwap for anti-flash loading. All token-driven, CSS-animated, keyboard-accessible."
      when={[
        "Destructive actions that deserve a beat of hesitation (HoldToConfirm)",
        "Verification codes (OTPInput) and password meters (PasswordStrength)",
        "Immediate in-place switches (SegmentedControl) and felt-stop values (Slider detents)",
        "Multi-step flows (WizardSteps), right-click surfaces (ContextMenu), image viewers (Lightbox)",
      ]}
      demos={[
        {
          title: "CopyButton — confirms without layout shift",
          render: (
            <DemoHolder>
              <CopyButton value="npx @skiddph/prui init" copiedLabel="Copied!">
                Copy install command
              </CopyButton>
              <CopyButton value="https://prui.skiddph.com" size="icon" variant="ghost" aria-label="Copy link" />
            </DemoHolder>
          ),
          code: `<CopyButton value="npx @skiddph/prui init" copiedLabel="Copied!">
  Copy install command
</CopyButton>`,
        },
        {
          title: "HoldToConfirm — press and hold to fire",
          render: (
            <DemoHolder>
              <HoldToConfirm onConfirm={() => setSwapping((s) => !s)} duration={800}>
                <Trash2 className="h-4 w-4" aria-hidden /> Hold to delete
              </HoldToConfirm>
              <span className="text-sm text-[var(--prui-dim)]">state: {swapping ? "alive" : "deleted"}</span>
            </DemoHolder>
          ),
          code: `<HoldToConfirm onConfirm={deleteThing} duration={800}>
  <Trash2 /> Hold to delete
</HoldToConfirm>`,
        },
        {
          title: "OTPInput — paste, arrows, backspace, autoComplete",
          render: <DemoHolder><OTPInput onComplete={(code) => void code} /></DemoHolder>,
          code: `<OTPInput length={6} onComplete={(code) => verify(code)} />`,
        },
        {
          title: "PasswordStrength — heuristic meter + live label",
          render: (
            <div className="w-full max-w-sm">
              <FloatingLabel label="Choose a password" type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
              <div className="mt-1.5">
                <PasswordStrength value={pw} />
              </div>
            </div>
          ),
          code: `<FloatingLabel label="Choose a password" type="password" value={pw} onChange={...} />
<PasswordStrength value={pw} />`,
        },
        {
          title: "ExpandingSearch — quiet until focused",
          render: <DemoHolder><ExpandingSearch onSearch={(q) => void q} /></DemoHolder>,
          code: `<ExpandingSearch onSearch={(q) => run(q)} />`,
        },
        {
          title: "SegmentedControl — the gliding indicator",
          render: (
            <DemoHolder>
              <SegmentedControl
                ariaLabel="Time range"
                value={range}
                onChange={setRange}
                options={[
                  { value: "day", label: "Day" },
                  { value: "week", label: "Week" },
                  { value: "month", label: "Month" },
                ]}
              />
            </DemoHolder>
          ),
          code: `<SegmentedControl ariaLabel="Time range" value={r} onChange={setR}
  options={[{ value: "day", label: "Day" }, ...]} />`,
        },
        {
          title: "Slider — magnetic detents at 25 / 50 / 75",
          render: (
            <div className="w-full max-w-sm">
              <Slider
                ariaLabel="Volume"
                value={volume}
                onChange={setVolume}
                detents={[25, 50, 75]}
                formatValue={(v) => `${v}%`}
              />
              <div className="mt-1 text-xs text-[var(--prui-dim)]">{volume}%</div>
            </div>
          ),
          code: `<Slider ariaLabel="Volume" value={v} onChange={setV} detents={[25, 50, 75]} />`,
        },
        {
          title: "WizardSteps — linear gate, clickable history",
          render: (
            <div className="w-full py-8">
              <WizardSteps
                steps={[{ label: "Account" }, { label: "Profile" }, { label: "Review" }, { label: "Done" }]}
                current={step}
                onStepChange={setStep}
              />
            </div>
          ),
          code: `<WizardSteps steps={steps} current={i} onStepChange={setI} />`,
        },
        {
          title: "ContextMenu — right-click this card",
          render: (
            <DemoHolder>
              <ContextMenu
                items={[
                  { label: "Rename", onSelect: () => void 0 },
                  { label: "Duplicate", onSelect: () => void 0 },
                  { label: "Delete", danger: true, separatorBefore: true, onSelect: () => void 0 },
                ]}
              >
                <div className="rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-surface)] px-4 py-3 text-sm text-[var(--prui-fg)]">
                  Right-click me
                </div>
              </ContextMenu>
            </DemoHolder>
          ),
          code: `<ContextMenu items={menuItems}>
  <Card>Right-click me</Card>
</ContextMenu>`,
        },
        {
          title: "Lightbox — fullscreen viewer with arrows",
          render: (
            <DemoHolder>
              <LightboxDemo />
            </DemoHolder>
          ),
          code: `const [open, setOpen] = useState(false)
<Lightbox open={open} onOpenChange={setOpen} images={images} />`,
        },
        {
          title: "Press feedback — Ripple, PressDepth, LikeBurst",
          render: (
            <DemoHolder>
              <Ripple>
                <CopyButton value="ripple" variant="secondary">Ripple me</CopyButton>
              </Ripple>
              <PressDepth>
                <CopyButton value="depth" variant="secondary">Press me</CopyButton>
              </PressDepth>
              <LikeBurst pressed={liked} onChange={setLiked} />
            </DemoHolder>
          ),
          code: `<Ripple><Button>Save</Button></Ripple>
<PressDepth><Button>Press</Button></PressDepth>
<LikeBurst pressed={liked} onChange={setLiked} />`,
        },
        {
          title: "SkeletonSwap — loads under 150ms never flash",
          render: (
            <DemoHolder>
              <SkeletonSwap loading={swapping} skeleton={<Skeleton lines={2} className="w-48" />}>
                <div className="w-48 text-sm text-[var(--prui-fg)]">Real content is here.</div>
              </SkeletonSwap>
              <CopyButton value="toggle" variant="ghost" size="sm" onClick={() => setSwapping((s) => !s)}>
                Toggle loading
              </CopyButton>
            </DemoHolder>
          ),
          code: `<SkeletonSwap loading={loading} skeleton={<Skeleton lines={2} />}>
  <RealContent />
</SkeletonSwap>`,
        },
      ]}
      examples={[
        { title: "Danger zone that forgives", code: `<HoldToConfirm onConfirm={purge} duration={1200}>Purge cache</HoldToConfirm>` },
        { title: "Login flow", code: `<OTPInput onComplete={verify} />\n<PasswordStrength value={pw} />` },
      ]}
      dos={[
        "Keep the hold under ~1s; longer feels broken",
        "Give Slider an ariaLabel and detents users can feel",
        "Pair SkeletonSwap with real loading state, not timers",
      ]}
      donts={[
        "Don't stack press feedback on every control — moments, not wallpaper",
        "Don't use LikeBurst for destructive actions (it reads positive)",
      ]}
    />
  )
}

function LightboxDemo() {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <CopyButton value="lightbox" variant="secondary" onClick={() => setOpen(true)}>
        Open lightbox
      </CopyButton>
      <Lightbox
        open={open}
        onOpenChange={setOpen}
        images={[
          { src: "/logo.svg", alt: "prui logo", caption: "The prui mark" },
          { src: "/logo.svg", alt: "prui logo again", caption: "Arrows and Escape work" },
        ]}
      />
    </>
  )
}
