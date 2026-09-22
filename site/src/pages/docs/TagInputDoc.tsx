import * as React from "react"
import { ComponentDoc, MetaOnly, TagInput } from "../../components/ComponentDoc"
import { tagInputPropsMeta } from "prui/core"

export function TagInputDoc() {
  const [tags, setTags] = React.useState(["react", "ui"])
  const [recipients, setRecipients] = React.useState<string[]>(["Ada Lovelace <ada@calc.io>"])
  const [emails, setEmails] = React.useState<string[]>([])
  const emailish = (v: string) => /.+@.+\..+/.test(v)

  return (
    <ComponentDoc
      name="TagInput"
      importPath="@skiddph/prui/core"
      description="Comma-separated entry as removable chips; tags, keywords, email recipients. Text commits on a separator, Enter, a multi-value paste, or blur; Backspace on an empty field removes the last chip. The chip and the value are separate concerns: labelFor decides what the chip shows while onChange keeps emitting the original strings."
      when={[
        "Free-form tags and keywords on articles, products, alerts",
        "Email recipients and CC fields with Name <email> values",
        "Any list of short strings the user builds by typing, not picking",
      ]}
      anatomy={
        <p>
          <code className="rounded bg-[var(--prui-raise)] px-1">&lt;TagInput value onChange separators parseInput validate labelFor renderTag&gt;</code>; an
          input-like box (same sizes, variants, and surface props as Input) that wraps chips plus a text field. Controlled
          with <code>string[]</code>, exactly like the multiple Select.
        </p>
      }
      demos={[
        {
          title: "Tags; comma, Enter, paste",
          desc: "Type and press comma or Enter; paste a comma-separated list to commit it all at once. Backspace on an empty field removes the last chip.",
          render: (
            <div className="w-full max-w-md">
              <TagInput aria-label="Tags" value={tags} onChange={setTags} placeholder="Add tag…" />
              <p className="mt-1.5 font-mono text-micro text-[var(--prui-dim)]">value: {JSON.stringify(tags)}</p>
            </div>
          ),
          code: `const [tags, setTags] = useState(["react", "ui"])

<TagInput value={tags} onChange={setTags} placeholder="Add tag…" />`,
        },
        {
          title: "Email recipients; chip shows the name, value keeps Name <email>",
          desc: "labelFor maps a value to its chip display. The field accepts full recipient strings; the chip renders only the name, and onChange emits the originals.",
          render: (
            <div className="w-full max-w-md">
              <TagInput
                aria-label="Recipients"
                value={recipients}
                onChange={setRecipients}
                placeholder="Name <email>…"
                labelFor={(t) => t.replace(/\s*<.*$/, "")}
              />
              <p className="mt-1.5 font-mono text-micro text-[var(--prui-dim)]">value: {JSON.stringify(recipients)}</p>
            </div>
          ),
          code: `<TagInput
  labelFor={(t) => t.replace(/\\s*<.*$/, "")}   // chip shows "Ada Lovelace"
  placeholder="Name <email>…"
  onChange={(recipients) => sendTo(recipients)} // values keep "Name <email>"
/>`,
        },
        {
          title: "Validated emails with a custom chip",
          desc: "validate rejects a candidate and keeps it editable in the field (nothing is committed); renderTag takes over the chip entirely; here with a status dot for role accounts.",
          render: (
            <div className="w-full max-w-md">
              <TagInput
                aria-label="Emails"
                value={emails}
                onChange={setEmails}
                placeholder="name@company.com…"
                validate={emailish}
                renderTag={(tag, { remove }) => (
                  <span className="inline-flex items-center gap-1.5 rounded-[var(--prui-radius-full)] border border-[var(--prui-line)] bg-[var(--prui-raise)] py-0.5 pl-2 pr-1 text-xs">
                    <span aria-hidden className={emailish(tag) ? "h-1.5 w-1.5 rounded-full bg-[var(--prui-ok)]" : "h-1.5 w-1.5 rounded-full bg-[var(--prui-warn)]"} />
                    <span className="max-w-64 truncate">{tag}</span>
                    <button type="button" onClick={remove} aria-label={`Remove ${tag}`} className="ml-0.5 cursor-pointer text-[var(--prui-dim)] hover:text-[var(--prui-fg)]">✕</button>
                  </span>
                )}
              />
              <p className="mt-1.5 font-mono text-micro text-[var(--prui-dim)]">try pasting: a@x.io, b@y.io</p>
            </div>
          ),
          code: `<TagInput
  validate={(v) => /.+@.+\\..+/.test(v)}      // rejected text stays editable
  renderTag={(tag, { remove }) => (
    <span className="chip">
      <i className={okDot(tag)} />
      {tag}
      <button onClick={remove}>✕</button>
    </span>
  )}
/>`,
        },
      ]}
      api={<MetaOnly meta={tagInputPropsMeta} />}
      examples={[
        {
          title: "Programmable commit: \"Name, email\" pairs",
          code: `const pairs = (raw: string) =>
  raw.split(",").map((s) => s.trim()).filter(Boolean)
     .map((s) => (s.includes("<") ? s : s.replace(/^(\\S+)\\s+(\\S+@\\S+)$/, "$1 <$2>")))

<TagInput parseInput={pairs} labelFor={(t) => t.replace(/\\s*<.*$/, "")} />
// typing "Ada ada@x.io" commits the value "Ada <ada@x.io>"`,
        },
        {
          title: "Keyword field with a cap",
          code: `<TagInput maxTags={5} separators={[",", ";"]} placeholder="up to 5 keywords" />`,
        },
      ]}
      dos={[
        "Keep labelFor pure and cheap; it renders per chip",
        "Use validate for format rules; rejected text stays in the field for correction",
        "Accept separators you expect users to type anyway (, ; ). Enter always commits too",
      ]}
      donts={[
        "Don't use TagInput when the set of values is known; that's Select multiple with search",
        "Don't mutate values in labelFor; it is display-only (onChange emits the originals)",
        "Don't build long free text here; that's Textarea",
      ]}
      accessibility={
        <ul className="list-disc pl-5">
          <li>The chip remove buttons are real buttons, labelled with the full original value (“Remove Ada Lovelace &lt;ada@…&gt;”) via the <code>removeTag</code> dictionary key.</li>
          <li>The inner input carries your aria-label/placeholder; chips are plain content, announced as text.</li>
          <li>Backspace-on-empty mirrors the native autocomplete removal convention.</li>
        </ul>
      }
      composition={
        <p>
          Pairs with Label for field captions and sits in the same rows as Input and Select (same size scale and
          surface props). In forms, keep values in state like any controlled field.
        </p>
      }
      customization={
        <p>
          Chips use raise/line tokens; the box follows the Input surface contract (bg, radius, texture, elevation).
          renderTag replaces the chip entirely when a dot, avatar, or icon per tag is needed.
        </p>
      }
      edgeCases={[
        "Duplicates are discarded silently (allowDuplicates to keep them); validate failures and maxTags overflow stay editable in the field",
        "An empty commit (bare Enter or separator on empty text) clears the field without emitting",
        "paste only intercepts when the text contains a separator; plain text pastes normally into the caret",
        "commitOnBlur={false} leaves pending text as text when the user clicks away",
      ]}
      mistakes={[
        "Forgetting that chip display (labelFor) and emitted values (onChange) can differ; assert on values in tests",
        "Swallowing validation failures silently instead of leaving the text for the user to fix",
      ]}
      performance={
        <p>Chips are simple spans; commits batch all candidates from one paste into a single onChange.</p>
      }
      crossLinks={[
        { label: "Input; single values", href: "/components/input" },
        { label: "Select multiple; known options", href: "/components/select" },
      ]}
    />
  )
}
