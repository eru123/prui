import type { PropMeta, PropsMeta } from "prui/core"

/**
 * Tiny tolerant parser for single-element JSX snippets: `<Button variant="primary">Save</Button>`.
 * The playground round-trips these through propsMeta: edits in the editor
 * become prop values for the live demo, and values that violate the spec
 * (unknown prop, bad option, non-boolean where a boolean is expected)
 * surface as errors while the last good state keeps rendering.
 */

export interface ParsedSnippet {
  tag: string
  /** Decoded literal values; expression bodies are kept raw for reference. */
  attrs: Record<string, { value: string; kind: "string" | "expr" | "bare" }>
  children: string
  hasComplexChildren: boolean
}

export interface SnippetError {
  message: string
}

export function parseSnippet(code: string): { parsed?: ParsedSnippet; error?: string } {
  const trimmed = code.trim()
  const open = trimmed.match(/^<([A-Za-z][A-Za-z0-9.]*)/)
  if (!open) return { error: "Start the snippet with the component tag, e.g. <Button …>" }
  const tag = open[1]!

  // scan the open tag, respecting quoted strings and brace expressions
  let i = open[0].length
  let inQuote: string | null = null
  let braceDepth = 0
  let selfClosing = false
  let end = -1
  while (i < trimmed.length) {
    const ch = trimmed[i]!
    if (inQuote) {
      if (ch === inQuote) inQuote = null
    } else if (ch === '"' || ch === "'" || ch === "`") {
      inQuote = ch
    } else if (ch === "{") {
      braceDepth++
    } else if (ch === "}") {
      braceDepth--
    } else if (braceDepth === 0 && ch === ">") {
      end = i
      break
    } else if (braceDepth === 0 && ch === "/" && trimmed[i + 1] === ">") {
      end = i + 1
      selfClosing = true
      break
    }
    i++
  }
  if (end === -1) return { error: "The opening tag is not closed" }

  const interior = trimmed.slice(open[0].length, selfClosing ? end - 1 : end)

  // children: only simple text or nested markup; captured as-is
  let children = ""
  let hasComplexChildren = false
  if (!selfClosing) {
    const close = trimmed.lastIndexOf(`</${tag}>`)
    if (close === -1) return { error: `Missing closing tag </${tag}>` }
    children = trimmed.slice(end + 1, close).trim()
    hasComplexChildren = children.includes("<")
  }

  const attrs: ParsedSnippet["attrs"] = {}
  const attrRe = /([A-Za-z_][A-Za-z0-9_-]*)\s*(?:=\s*("([^"]*)"|'([^']*)'|\{([^}]*)\}|([A-Za-z0-9_.-]+)))?/g
  let m: RegExpExecArray | null
  while ((m = attrRe.exec(interior)) !== null) {
    const name = m[1]!
    if (m[3] !== undefined) attrs[name] = { value: m[3], kind: "string" }
    else if (m[4] !== undefined) attrs[name] = { value: m[4], kind: "string" }
    else if (m[5] !== undefined) attrs[name] = { value: m[5].trim(), kind: "expr" }
    else if (m[6] !== undefined) attrs[name] = { value: m[6], kind: "bare" }
    else attrs[name] = { value: "true", kind: "bare" }
  }

  return { parsed: { tag, attrs, children, hasComplexChildren } }
}

/**
 * Map parsed snippet props onto playground values, validated against
 * propsMeta. Returns the merged values plus one message per violation.
 */
export function applySnippet(
  meta: PropsMeta,
  parsed: ParsedSnippet,
  base: Record<string, unknown>,
): { values: Record<string, unknown>; errors: string[] } {
  const errors: string[] = []
  const values: Record<string, unknown> = { ...base }

  if (parsed.tag !== meta.name) {
    errors.push(`This demo renders <${meta.name}>; the editor shows <${parsed.tag}>.`)
    return { values, errors }
  }

  for (const prop of meta.props) {
    if (prop.name === "children") {
      if (!parsed.hasComplexChildren && parsed.children) {
        if (prop.control === "none") continue
        values.children = parsed.children
      }
      continue
    }
    if (!(prop.name in parsed.attrs)) continue
    const { value, kind } = parsed.attrs[prop.name]!
    const applied = applyProp(prop, value, kind, errors)
    if (applied.applied) values[prop.name] = applied.value
  }

  for (const name of Object.keys(parsed.attrs)) {
    if (!meta.props.some((p) => p.name === name)) {
      errors.push(`<${meta.name}> has no prop called "${name}".`)
    }
  }

  return { values, errors }
}

function applyProp(
  prop: PropMeta,
  value: string,
  kind: "string" | "expr" | "bare",
  errors: string[],
): { applied: boolean; value?: unknown } {
  switch (prop.control) {
    case "boolean": {
      const v = kind === "bare" ? "true" : value.trim()
      if (v === "true") return { applied: true, value: true }
      if (v === "false") return { applied: true, value: false }
      errors.push(`"${prop.name}" expects true or false.`)
      return { applied: false }
    }
    case "number": {
      const n = Number(value)
      if (value !== "" && !Number.isNaN(n)) return { applied: true, value: n }
      errors.push(`"${prop.name}" expects a number.`)
      return { applied: false }
    }
    case "select": {
      const options = prop.options ?? []
      if (options.includes(value)) return { applied: true, value }
      errors.push(`"${prop.name}" must be one of: ${options.join(", ")}.`)
      return { applied: false }
    }
    case "text":
      return { applied: true, value }
    case "multiselect": {
      // arrays like ['a', 'b'] or ["a","b"]
      const m = value.match(/^\[(.*)]$/s)
      if (!m) {
        errors.push(`"${prop.name}" expects an array like ['${(prop.options ?? [])[0] ?? "value"}'].`)
        return { applied: false }
      }
      const items = m[1]!.split(",").map((s) => s.trim().replace(/^['"]|['"]$/g, "")).filter(Boolean)
      const bad = items.filter((s) => !(prop.options ?? []).includes(s))
      if (bad.length) {
        errors.push(`"${prop.name}" values must be among: ${prop.options?.join(", ")}.`)
        return { applied: false }
      }
      return { applied: true, value: items }
    }
    default:
      // object / none / icon: nothing sensible to apply statically
      return { applied: false }
  }
}
