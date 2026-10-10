import { describe, it, expect } from "vitest"
import { readableInk, resolveSurface } from "./surface"

describe("readableInk", () => {
  it("picks white for dark backgrounds and black for light ones", () => {
    expect(readableInk("#000000")).toBe("#ffffff")
    expect(readableInk("#ffffff")).toBe("#000000")
    // the motivating case: bright brand yellows/ambers with white text
    expect(readableInk("#eab308")).toBe("#000000")
    expect(readableInk("#4f46e5")).toBe("#ffffff")
  })

  it("parses hex, rgb()/rgba(), hsl()/hsla(), and basic named colors", () => {
    expect(readableInk("#fff")).toBe("#000000")
    expect(readableInk("#00000080")).toBe("#ffffff") // alpha ignored unless fully transparent
    expect(readableInk("rgb(0, 0, 0)")).toBe("#ffffff")
    expect(readableInk("rgb(255 255 255)")).toBe("#000000")
    expect(readableInk("rgba(255, 255, 255, 0.4)")).toBe("#000000")
    expect(readableInk("hsl(0, 0%, 0%)")).toBe("#ffffff")
    expect(readableInk("hsl(120 100% 50%)")).toBe("#000000") // pure green is bright
    expect(readableInk("hsl(120 100% 25%)")).toBe("#ffffff") // forest green is dark
    expect(readableInk("yellow")).toBe("#000000")
    expect(readableInk("red")).toBe("#000000") // white on pure red is only 4:1; black clears AA
  })

  it("returns undefined for values it cannot resolve to a solid color", () => {
    expect(readableInk("var(--prui-brand)")).toBeUndefined()
    expect(readableInk("linear-gradient(#fff, #000)")).toBeUndefined()
    expect(readableInk("transparent")).toBeUndefined()
    expect(readableInk("rgba(0, 0, 0, 0)")).toBeUndefined()
    expect(readableInk("url(swatch.png)")).toBeUndefined()
    expect(readableInk("rebeccapurple")).toBeUndefined() // unsupported keyword
    expect(readableInk("#12")).toBeUndefined() // bad hex length
  })
})

describe("resolveSurface color awareness", () => {
  it("auto-picks the ink when bg is set without fg", () => {
    expect(resolveSurface({ bg: "#0a0a0a" })).toEqual({
      style: { "--prui-s-bg": "#0a0a0a", "--prui-s-fg": "#ffffff" },
      className: undefined,
    })
    expect(resolveSurface({ bg: "#fafafa" })?.style).toMatchObject({ "--prui-s-fg": "#000000" })
  })

  it("respects an explicit fg over the automatic pick", () => {
    expect(resolveSurface({ bg: "#0a0a0a", fg: "#ff0000" })?.style).toEqual({
      "--prui-s-bg": "#0a0a0a",
      "--prui-s-fg": "#ff0000",
    })
  })

  it("keeps the theme default pairing for unresolvable backgrounds", () => {
    expect(resolveSurface({ bg: "var(--prui-ok)" })?.style).toEqual({
      "--prui-s-bg": "var(--prui-ok)",
    })
  })

  it("leaves fg untouched when only fg is set", () => {
    expect(resolveSurface({ fg: "#123456" })?.style).toEqual({ "--prui-s-fg": "#123456" })
  })
})
