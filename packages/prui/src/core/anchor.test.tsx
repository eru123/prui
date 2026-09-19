import { describe, it, expect, afterEach } from "vitest"
import { render, screen, cleanup, act } from "@testing-library/react"
import { computePlacement, computePosition, getClippingBoundary, PLACEMENTS, type Rect } from "./anchor"
import { Popover } from "./popover"

afterEach(() => {
  cleanup()
  document.body.innerHTML = ""
})

/** 1000x800 boundary; the engine pads it by 8 on every side. */
const boundary: Rect = { left: 0, top: 0, right: 1000, bottom: 800, width: 1000, height: 800 }
/** Trigger at (400,300) sized 100x40. */
const anchor: Rect = { left: 400, top: 300, right: 500, bottom: 340, width: 100, height: 40 }
/** Floating panel 200x100. */
const size = { width: 200, height: 100 }
const opts = { boundary }

const rect = (left: number, top: number, width: number, height: number): Rect => ({
  left,
  top,
  right: left + width,
  bottom: top + height,
  width,
  height,
})

describe("placement geometry (no collisions)", () => {
  const expected: Record<string, { top: number; left: number }> = {
    "bottom-start": { top: 348, left: 400 },
    "bottom-center": { top: 348, left: 350 },
    "bottom-end": { top: 348, left: 300 },
    "top-start": { top: 192, left: 400 },
    "top-center": { top: 192, left: 350 },
    "top-end": { top: 192, left: 300 },
    "right-start": { top: 300, left: 508 },
    "right-center": { top: 270, left: 508 },
    "right-end": { top: 240, left: 508 },
    "left-start": { top: 300, left: 192 },
    "left-center": { top: 270, left: 192 },
    "left-end": { top: 240, left: 192 },
  }

  for (const placement of PLACEMENTS) {
    it(`places ${placement} verbatim when it fits`, () => {
      const pos = computePlacement(anchor, size, placement, opts)
      expect(pos).toMatchObject({ ...expected[placement], placement, side: placement.split("-")[0] })
    })
  }

  it("defaults to bottom-end", () => {
    const pos = computePlacement(anchor, size)
    expect(pos.placement).toBe("bottom-end")
    // jsdom viewport is 1024x768: the default fits without adjustment
    expect(pos).toMatchObject({ top: 348, left: 300 })
  })

  it("computePosition composes side+align into a placement", () => {
    const legacy = computePosition(anchor, size, "top", "center", opts)
    expect(legacy).toEqual(computePlacement(anchor, size, "top-center", opts))
  })
})

describe("logical alignment (RTL)", () => {
  it("flips horizontal start/end under rtl", () => {
    const rtl = { boundary, dir: "rtl" as const }
    // start = right edge under rtl, so top-start matches ltr top-end
    expect(computePlacement(anchor, size, "top-start", rtl)).toMatchObject({ top: 192, left: 300 })
    expect(computePlacement(anchor, size, "top-end", rtl)).toMatchObject({ top: 192, left: 400 })
  })

  it("keeps vertical start/end unchanged under rtl (horizontal writing mode)", () => {
    const rtl = { boundary, dir: "rtl" as const }
    expect(computePlacement(anchor, size, "right-start", rtl)).toMatchObject({ top: 300, left: 508 })
    expect(computePlacement(anchor, size, "right-end", rtl)).toMatchObject({ top: 240, left: 508 })
  })
})

describe("collision resolution", () => {
  it("flips the side (keeping alignment) when the main axis collides", () => {
    // trigger near the bottom edge: no room below even after shifting
    const pos = computePlacement(rect(400, 700, 100, 40), size, "bottom-end", opts)
    expect(pos.placement).toBe("top-end")
    expect(pos).toMatchObject({ top: 592, left: 300 })
  })

  it("shifts along the secondary axis instead of flipping when a shift resolves it", () => {
    // trigger at the right edge: bottom-end overflows horizontally, but
    // there is plenty of room below the trigger
    const pos = computePlacement(rect(910, 300, 100, 40), size, "bottom-end", opts)
    expect(pos.placement).toBe("bottom-end")
    expect(pos.top).toBe(348) // still anchored below the trigger
    expect(pos.left).toBe(792) // shifted left to fit: 992 - 200
  })

  it("shifts a right-center popover vertically when it would overflow the bottom", () => {
    const pos = computePlacement(rect(100, 730, 60, 40), size, "right-center", opts)
    expect(pos.placement).toBe("right-center")
    expect(pos.left).toBe(168) // still anchored beside the trigger
    expect(pos.top).toBe(692) // shifted up to fit: 792 - 100
  })

  it("constrains inside the boundary with the greatest visible area when nothing fits", () => {
    // 400x300 boundary, popover 300x400: no side fits on the vertical axis,
    // so the engine keeps the side with the most visible area and clamps
    const small: Rect = rect(0, 0, 400, 300)
    const pos = computePlacement(rect(150, 130, 100, 40), { width: 300, height: 400 }, "bottom-end", {
      boundary: small,
    })
    // right/left show 134x284 of area vs 300x114 for top/bottom
    expect(pos.placement).toBe("right-end")
    expect(pos).toMatchObject({ top: 8, left: 92 })
  })

  it("picks by geometry, not cycle order, in the fallback pass", () => {
    // same small boundary, trigger near the top: the opposite side (top)
    // comes earlier in preference order but bottom shows far more area
    const small: Rect = rect(0, 0, 400, 300)
    const pos = computePlacement(rect(150, 20, 100, 40), { width: 300, height: 400 }, "bottom-end", { boundary: small })
    expect(pos.placement).toBe("bottom-end")
  })
})

describe("getClippingBoundary", () => {
  const domRect = (r: Rect) => () => r as DOMRect

  function mount(anchor: HTMLElement, ...parents: HTMLElement[]) {
    let node: HTMLElement = anchor
    for (const parent of parents) {
      parent.appendChild(node)
      node = parent
    }
    document.body.appendChild(node)
    return () => node.remove()
  }

  it("intersects the viewport with clipping ancestors of the anchor", () => {
    const anchor = document.createElement("button")
    const inner = document.createElement("div")
    const outer = document.createElement("div")
    outer.style.overflow = "auto"
    outer.getBoundingClientRect = domRect(rect(0, 0, 600, 400))
    const unmount = mount(anchor, inner, outer)
    // jsdom viewport is 1024x768; intersection is the 600x400 container
    expect(getClippingBoundary(anchor)).toMatchObject({ left: 0, top: 0, right: 600, bottom: 400 })
    unmount()
  })

  it("ignores ancestors that do not clip", () => {
    const anchor = document.createElement("button")
    const outer = document.createElement("div")
    outer.getBoundingClientRect = domRect(rect(0, 0, 600, 400))
    const unmount = mount(anchor, outer)
    expect(getClippingBoundary(anchor).width).toBe(1024)
    unmount()
  })

  it("keeps the last sane region when a container is fully off-screen", () => {
    const anchor = document.createElement("button")
    const outer = document.createElement("div")
    outer.style.overflow = "hidden"
    outer.getBoundingClientRect = domRect(rect(2000, 0, 600, 400))
    const unmount = mount(anchor, outer)
    expect(getClippingBoundary(anchor)).toMatchObject({ width: 1024, height: 768 })
    unmount()
  })
})

describe("Popover placement wiring", () => {
  // jsdom has no layout: give the trigger and panel measurable geometry,
  // then let the hook's frame loop pick the change up
  function mockGeometry(triggerRect: Rect, panelWidth: number, panelHeight: number) {
    const trigger = screen.getByRole("button", { name: "T" })
    trigger.getBoundingClientRect = () => triggerRect as DOMRect
    const panel = screen.getByRole("dialog", { name: "P" })
    Object.defineProperty(panel, "offsetWidth", { value: panelWidth })
    Object.defineProperty(panel, "offsetHeight", { value: panelHeight })
    return panel
  }
  const settle = () => act(async () => new Promise((r) => setTimeout(r, 50)))

  it("reports the default bottom-end placement through data attributes", () => {
    render(
      <Popover open trigger={<button>T</button>} ariaLabel="P">
        Body
      </Popover>,
    )
    const panel = screen.getByRole("dialog", { name: "P" })
    expect(panel.dataset.placement).toBe("bottom-end")
    expect(panel.dataset.side).toBe("bottom")
    expect(panel.dataset.align).toBe("end")
  })

  it("positions through the engine against measured geometry", async () => {
    render(
      <Popover open placement="bottom-end" trigger={<button>T</button>} ariaLabel="P">
        Body
      </Popover>,
    )
    const panel = mockGeometry(rect(900, 300, 100, 40), 200, 100)
    await settle()
    expect(panel.dataset.placement).toBe("bottom-end")
    expect(panel.style.top).toBe("348px")
    expect(panel.style.left).toBe("800px")
  })

  it("flips the side when the measured geometry collides", async () => {
    render(
      <Popover open placement="bottom-end" trigger={<button>T</button>} ariaLabel="P">
        Body
      </Popover>,
    )
    // near the bottom of the jsdom viewport (1024x768): no room below
    const panel = mockGeometry(rect(900, 700, 100, 40), 200, 100)
    await settle()
    expect(panel.dataset.placement).toBe("top-end")
    expect(panel.style.top).toBe("592px")
  })

  it("composes the legacy side/align pair into a placement", async () => {
    render(
      <Popover open side="left" align="end" trigger={<button>T</button>} ariaLabel="P">
        Body
      </Popover>,
    )
    const panel = mockGeometry(rect(400, 300, 100, 40), 200, 100)
    await settle()
    expect(panel.dataset.placement).toBe("left-end")
    expect(panel.style.left).toBe("192px")
  })
})
