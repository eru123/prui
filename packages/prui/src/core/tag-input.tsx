import * as React from "react"
import { X } from "lucide-react"
import { resolveSurface, withSurface, type SurfaceProps } from "./surface"
import { cn } from "./cn"
import { usePruiI18n } from "../i18n"
import { useFieldSlots, type FieldSlotProps } from "./form-field"
import type { PropsMeta } from "./props-meta"

/**
 * TagInput: comma-separated entry as removable chips (tags, email
 * recipients, keywords). Text commits the moment a separator arrives — by
 * keydown, or through the input value itself (IME, virtual keyboards,
 * autofill, multi-char separators like " and ") — plus Enter, multi-value
 * paste, or blur; Backspace on an empty field removes the last tag. The
 * chip and the value are separate concerns: labelFor decides what the chip
 * displays while onChange keeps emitting the original strings, and
 * renderTag takes over the chip entirely.
 */

export type TagInputSize = "sm" | "md" | "lg"

export interface TagInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "value" | "defaultValue" | "onChange" | "children">,
    SurfaceProps,
    FieldSlotProps {
  /** Control height step (the field grows vertically with wrapped chips). */
  size?: TagInputSize
  /** Visual variant: outlined (default) or filled. */
  variant?: "default" | "filled"
  /** Controlled tag values. */
  value?: string[]
  /** Initial tags for the uncontrolled field. */
  defaultValue?: string[]
  /** Emits the full tag array on every add/remove. */
  onChange?: (tags: string[]) => void
  /** Characters that commit the typed text as a tag (default: comma). */
  separators?: string[]
  /** Commit the pending text when the field blurs (default true). */
  commitOnBlur?: boolean
  /** Programmable commit: split raw text into tag values. Defaults to
   * splitting on `separators`, trimming, and dropping empties. Use it to
   * accept pair syntaxes (e.g. "Name, email" -> "Name <email>"). */
  parseInput?: (raw: string) => string[]
  /** Reject a candidate; rejected text stays editable in the field. */
  validate?: (tag: string) => boolean
  /** Stop accepting new tags at this count. */
  maxTags?: number
  /** Allow the same value more than once (default false). */
  allowDuplicates?: boolean
  /** What the chip displays — the emitted value keeps the original string
   * (e.g. show only the name for "Name <email>"). */
  labelFor?: (tag: string) => React.ReactNode
  /** Fully custom chip: (tag, { remove }) => node. */
  renderTag?: (tag: string, api: { remove: () => void }) => React.ReactNode
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const boxSizeClasses = {
  sm: "min-h-8 text-sm",
  md: "min-h-9 text-sm",
  lg: "min-h-11 text-base",
} as const

export const TagInput = React.forwardRef<HTMLInputElement, TagInputProps>(function TagInput(
  {
    className,
    style,
    size = "md",
    variant = "default",
    value,
    defaultValue,
    onChange,
    separators = [","],
    commitOnBlur = true,
    parseInput,
    validate,
    maxTags,
    allowDuplicates = false,
    labelFor,
    renderTag,
    disabled,
    label,
    helperText,
    id,
    bg,
    fg,
    radius,
    texture,
    textureColor,
    elevation,
    ...props
  },
  ref,
) {
  const { t } = usePruiI18n()
  const field = useFieldSlots({ id, label, helperText })
  const isControlled = value !== undefined
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? [])
  const tags = isControlled ? value : uncontrolled
  const [input, setInput] = React.useState("")

  const parse = parseInput ?? ((raw: string) => raw.split(new RegExp(separators.map(escapeRe).join("|"))).map((s) => s.trim()).filter(Boolean))

  const setTags = (next: string[]) => {
    if (!isControlled) setUncontrolled(next)
    onChange?.(next)
  }

  const commit = (raw: string) => {
    const candidates = parse(raw)
    if (!candidates.length) {
      setInput("")
      return
    }
    const next = [...tags]
    const rejected: string[] = []
    for (const candidate of candidates) {
      if (maxTags !== undefined && next.length >= maxTags) rejected.push(candidate)
      else if (!allowDuplicates && next.includes(candidate)) {
        // duplicates discard silently: the value already exists, nothing to fix
      } else if (validate && !validate(candidate)) rejected.push(candidate)
      else next.push(candidate)
    }
    // rejected candidates stay in the field for correction
    setInput(rejected.join(separators[0] ?? ", "))
    if (next.length !== tags.length) setTags(next)
  }

  const removeAt = (i: number) => setTags(tags.filter((_, idx) => idx !== i))

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || separators.includes(e.key)) {
      e.preventDefault()
      commit(input)
    } else if (e.key === "Backspace" && !input && tags.length) {
      e.preventDefault()
      removeAt(tags.length - 1)
    }
    props.onKeyDown?.(e as React.KeyboardEvent<HTMLInputElement>)
  }

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text")
    if (text && separators.some((s) => text.includes(s))) {
      e.preventDefault()
      commit(input ? `${input}${separators[0] ?? ","}${text}` : text)
      return
    }
    props.onPaste?.(e as React.ClipboardEvent<HTMLInputElement>)
  }

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (commitOnBlur) commit(input)
    props.onBlur?.(e as React.FocusEvent<HTMLInputElement>)
  }

  // IME and virtual keyboards deliver the separator through the input event
  // (keydown never fires), so the value path commits too — this is what makes
  // the tag render the moment the operator is typed on phones, autofill, and
  // multi-char separators like " and ". Keydown-prevented commits never reach
  // the value, so the two paths cannot double-fire.
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value
    if (separators.some((s) => next.includes(s))) {
      commit(next)
      return
    }
    setInput(next)
  }

  const surface = resolveSurface({ bg, fg, radius, texture, textureColor, elevation })
  const merged = withSurface(
    cn(
      "prui-f-control prui-taginput flex w-full flex-wrap items-center gap-1 px-1.5 py-1",
      "border border-[var(--prui-line)] rounded-[var(--prui-s-radius,var(--prui-radius))]",
      "bg-[var(--prui-s-bg,var(--prui-background))] text-[var(--prui-s-fg,var(--prui-fg))] placeholder:text-[var(--prui-dim)]",
      "outline-none transition-colors focus-within:border-[var(--prui-brand)] focus-within:ring-2 focus-within:ring-[var(--prui-brand)]/30",
      boxSizeClasses[size],
      variant === "filled" && "bg-[var(--prui-s-bg,var(--prui-raise))] border-transparent",
      disabled && "opacity-50 cursor-not-allowed",
      className,
    ),
    style,
    surface,
  )

  return field.wrap(
    <div className={merged.className} style={merged.style}>
      {tags.map((tag, i) =>
        renderTag ? (
          <React.Fragment key={`${tag}-${i}`}>{renderTag(tag, { remove: () => removeAt(i) })}</React.Fragment>
        ) : (
          <span
            key={`${tag}-${i}`}
            className="inline-flex max-w-full items-center gap-1 rounded-[var(--prui-radius-full)] border border-[var(--prui-line)] bg-[var(--prui-raise)] py-0.5 pl-2 pr-1 text-xs text-[var(--prui-fg)]"
          >
            <span className="max-w-64 truncate">{labelFor ? labelFor(tag) : tag}</span>
            <button
              type="button"
              aria-label={t.removeTag.replace("{label}", tag)}
              disabled={disabled}
              onClick={() => removeAt(i)}
              className="flex h-4 w-4 cursor-pointer items-center justify-center rounded-full text-[var(--prui-dim)] hover:bg-[var(--prui-line)] hover:text-[var(--prui-fg)] disabled:cursor-not-allowed"
            >
              <X className="h-3 w-3" aria-hidden />
            </button>
          </span>
        ),
      )}
      <input
        ref={ref}
        id={field.id}
        value={input}
        onChange={onInputChange}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        onBlur={onBlur}
        disabled={disabled}
        {...props}
        className="h-7 min-w-16 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--prui-dim)] disabled:cursor-not-allowed"
      />
    </div>,
  )
})
TagInput.displayName = "TagInput"

export const tagInputPropsMeta: PropsMeta = {
  name: "TagInput",
  props: [
    { name: "value", type: "string[]", default: "uncontrolled", control: "none" },
    { name: "defaultValue", type: "string[]", default: "[]", control: "none" },
    { name: "onChange", type: "(tags: string[]) => void", default: null, control: "none" },
    { name: "separators", type: "string[]", default: "[',']", control: "none", description: "Characters that commit the typed text (plus Enter, paste, blur)." },
    { name: "commitOnBlur", type: "boolean", default: "true", control: "boolean" },
    { name: "parseInput", type: "(raw: string) => string[]", default: "split on separators", control: "none", description: "Programmable commit: build tag values from raw text (pair syntaxes, normalization)." },
    { name: "validate", type: "(tag: string) => boolean", default: "undefined", control: "none", description: "Reject a candidate; it stays editable in the field." },
    { name: "labelFor", type: "(tag: string) => ReactNode", default: "undefined", control: "none", description: "Chip display; onChange keeps emitting the original strings." },
    { name: "renderTag", type: "(tag, { remove }) => ReactNode", default: "default chip", control: "none", description: "Fully custom chip rendering." },
    { name: "maxTags", type: "number", default: "undefined", control: "number" },
    { name: "allowDuplicates", type: "boolean", default: "false", control: "boolean" },
    { name: "size", type: "'sm' | 'md' | 'lg'", default: "'md'", control: "select", options: ["sm", "md", "lg"] },
    { name: "variant", type: "'default' | 'filled'", default: "'default'", control: "select", options: ["default", "filled"] },
    { name: "placeholder", type: "string", default: "undefined", control: "text" },
    { name: "disabled", type: "boolean", default: "false", control: "boolean" },
  ],
}
