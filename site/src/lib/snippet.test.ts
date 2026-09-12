import { describe, it, expect } from "vitest"
import { applySnippet, parseSnippet } from "./snippet"
import { buttonPropsMeta } from "prui/core"
import type { PropsMeta } from "prui/core"

describe("parseSnippet", () => {
  it("parses attributes, children and self-closing tags", () => {
    const { parsed, error } = parseSnippet('<Button variant="primary" disabled>Save</Button>')
    expect(error).toBeUndefined()
    expect(parsed!.tag).toBe("Button")
    expect(parsed!.attrs.variant).toEqual({ value: "primary", kind: "string" })
    expect(parsed!.attrs.disabled).toEqual({ value: "true", kind: "bare" })
    expect(parsed!.children).toBe("Save")
    expect(parsed!.hasComplexChildren).toBe(false)
  })

  it("parses self-closing tags and brace expressions", () => {
    const { parsed, error } = parseSnippet("<Input placeholder='Search' onChange={fn} />")
    expect(error).toBeUndefined()
    expect(parsed!.attrs.placeholder).toEqual({ value: "Search", kind: "string" })
    expect(parsed!.attrs.onChange).toEqual({ value: "fn", kind: "expr" })
  })

  it("reports unclosed and missing-tag input", () => {
    expect(parseSnippet("<Button").error).toBeTruthy()
    expect(parseSnippet("Button").error).toBeTruthy()
    expect(parseSnippet("<Badge>x").error).toBeTruthy()
  })
})

describe("applySnippet", () => {
  const base = { variant: "default", size: "md", disabled: false, children: "" }

  it("applies valid props onto values", () => {
    const { parsed } = parseSnippet('<Button variant="primary" size="sm" loading>Go</Button>')
    const { values, errors } = applySnippet(buttonPropsMeta, parsed!, base)
    expect(errors).toEqual([])
    expect(values).toMatchObject({ variant: "primary", size: "sm", loading: true, children: "Go" })
  })

  it("rejects unknown props and bad options with spec messages", () => {
    const { parsed } = parseSnippet('<Button variant="wrong" onClick={fn}>X</Button>')
    const { values, errors } = applySnippet(buttonPropsMeta, parsed!, base)
    expect(values.variant).toBe("default")
    expect(errors.some((e) => e.includes('"variant" must be one of'))).toBe(true)
    expect(errors.some((e) => e.includes('no prop called "onClick"'))).toBe(true)
  })

  it("rejects a non-boolean where a boolean is expected", () => {
    const { parsed } = parseSnippet('<Button loading="yes" />')
    const { errors } = applySnippet(buttonPropsMeta, parsed!, base)
    expect(errors.some((e) => e.includes('"loading" expects true or false'))).toBe(true)
  })

  it("flags a tag mismatch", () => {
    const { parsed } = parseSnippet("<Input />")
    const { errors } = applySnippet(buttonPropsMeta as PropsMeta, parsed!, base)
    expect(errors[0]).toContain("This demo renders <Button>")
  })
})
