import { describe, it, expect } from "vitest"
import {
  DEFAULT_STATE,
  decodeState,
  encodeState,
  flattenNav,
  generateAgentPrompt,
  generateAppCode,
  generateTokenCss,
  initHistory,
  pushHistory,
  redo,
  unflattenNav,
  undo,
  canDrop,
  type FlatNav,
} from "./state"

describe("URL codec (AC-13)", () => {
  it("round-trips state through encode/decode", () => {
    const state = { ...DEFAULT_STATE, name: "Ops", theme: "ember" as const, sidebarWidth: 280 }
    const decoded = decodeState(encodeState(state))
    expect(decoded).toEqual(state)
  })

  it("falls back to defaults for garbage", () => {
    expect(decodeState("not-base64!!!")).toEqual(DEFAULT_STATE)
    expect(decodeState(null)).toEqual(DEFAULT_STATE)
  })

  it("sanitizes unknown fields and bad types from a crafted payload", () => {
    const crafted = btoa(JSON.stringify({ name: "X", nav: [{ label: "A", href: "/a" }], evil: "<script>", sidebarWidth: 9999 }))
    const decoded = decodeState(crafted)
    expect(decoded.name).toBe("X")
    expect(decoded.sidebarWidth).toBe(400)
    expect((decoded as unknown as Record<string, unknown>).evil).toBeUndefined()
  })
})

describe("nav flatten/unflatten (AC-14 validity)", () => {
  it("round-trips groups", () => {
    const flat = flattenNav(DEFAULT_STATE.nav)
    expect(unflattenNav(flat)).toEqual(DEFAULT_STATE.nav)
  })

  it("groups never keep an href after unflatten", () => {
    const nav = unflattenNav([
      { label: "Group", href: "/oops", depth: 0 },
      { label: "Child", href: "/child", depth: 1 },
    ])
    expect(nav[0]!.href).toBeUndefined()
    expect(nav[0]!.items?.[0]).toEqual({ label: "Child", href: "/child" })
  })

  it("orphaned children are promoted to top level", () => {
    const nav = unflattenNav([{ label: "Ghost", href: "/ghost", depth: 1 }])
    expect(nav).toEqual([{ label: "Ghost", href: "/ghost" }])
  })

  it("canDrop rejects nesting without a preceding top-level item", () => {
    const flat: FlatNav[] = [{ label: "A", href: "/a", depth: 0 }]
    expect(canDrop(flat, 0, 1)).toBe(false) // nothing above index 0
    expect(canDrop(flat, 1, 1)).toBe(true) // after A, a child is valid
    expect(canDrop([{ label: "A", depth: 0 }, { label: "B", depth: 0 }], 1, 1)).toBe(true)
  })
})

describe("undo/redo history (AC-14)", () => {
  it("pushes, undoes and redoes structural edits", () => {
    let history = initHistory(DEFAULT_STATE)
    const edited = { ...DEFAULT_STATE, name: "Edited" }
    history = pushHistory(history, edited)
    expect(history.index).toBe(1)

    const back = undo(history)
    expect(back.state?.name).toBe("HRLabs")

    const forward = redo(back.history)
    expect(forward.state?.name).toBe("Edited")
  })

  it("a branch cut by a new edit drops the redo tail", () => {
    let history = initHistory(DEFAULT_STATE)
    history = pushHistory(history, { ...DEFAULT_STATE, name: "A" })
    const back = undo(history)
    history = pushHistory(back.history, { ...DEFAULT_STATE, name: "B" })
    expect(redo(history).state).toBeNull()
    expect(undo(history).state?.name).toBe("HRLabs")
  })
})

describe("code generation (AC-12)", () => {
  it("emits a runnable <App> invocation reflecting the state", () => {
    const code = generateAppCode({ ...DEFAULT_STATE, palette: false, pages: "auth", sidebarWidth: 260 })
    expect(code).toContain("from '@skiddph/prui/app'")
    expect(code).toContain("brand={{ name: 'HRLabs' }}")
    expect(code).toContain("search={false}")
    expect(code).toContain("pages='auth'")
    expect(code).toContain("sidebar={{ width: 260 }}")
    expect(code).toContain("href: '/leave/requests'")
  })

  it("omits default sidebar config", () => {
    const code = generateAppCode(DEFAULT_STATE)
    expect(code).not.toContain("sidebar=")
  })

  it("token css holds only the overrides that are set", () => {
    expect(generateTokenCss(DEFAULT_STATE)).toContain("no overrides")
    const css = generateTokenCss({ ...DEFAULT_STATE, tokens: { brand: "#ff0000", radius: "10", density: "compact" } })
    expect(css).toContain("--prui-brand: #ff0000")
    expect(css).toContain("--prui-radius-2: 10px")
  })

  it("agent prompt names the skill folder and the nav", () => {
    const prompt = generateAgentPrompt(DEFAULT_STATE)
    expect(prompt).toContain("skill/")
    expect(prompt).toContain("/leave/requests")
  })
})
