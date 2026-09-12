import * as React from "react"
import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, cleanup, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { TagInput } from "./tag-input"

afterEach(() => {
  cleanup()
  document.body.innerHTML = ""
})

describe("TagInput", () => {
  it("commits on separator, Enter, and blur; emits string arrays", async () => {
    const user = userEvent.setup()
    const spy = vi.fn()
    render(<TagInput aria-label="Tags" onChange={spy} />)
    const input = screen.getByLabelText("Tags")
    await user.type(input, "alpha,")
    await user.type(input, "beta{Enter}")
    await user.type(input, "gamma")
    fireEvent.blur(input)
    expect(spy).toHaveBeenLastCalledWith(["alpha", "beta", "gamma"])
  })

  it("paste with separators commits multiple tags at once", async () => {
    const user = userEvent.setup()
    const spy = vi.fn()
    render(<TagInput aria-label="Tags" onChange={spy} />)
    await user.click(screen.getByLabelText("Tags"))
    await user.paste("one, two, three")
    expect(spy).toHaveBeenCalledWith(["one", "two", "three"])
  })

  it("Backspace on an empty field removes the last tag", async () => {
    const user = userEvent.setup()
    const spy = vi.fn()
    render(<TagInput aria-label="Tags" defaultValue={["a", "b"]} onChange={spy} />)
    const input = screen.getByLabelText("Tags")
    await user.click(input)
    await user.keyboard("{Backspace}")
    expect(spy).toHaveBeenCalledWith(["a"])
  })

  it("the remove button drops its tag and announces the full value", async () => {
    const user = userEvent.setup()
    const spy = vi.fn()
    render(<TagInput aria-label="Recipients" defaultValue={["Ada <ada@x.io>"]} onChange={spy} />)
    await user.click(screen.getByRole("button", { name: "Remove Ada <ada@x.io>" }))
    expect(spy).toHaveBeenCalledWith([])
  })

  it("validate rejects a candidate and keeps it editable in the field", async () => {
    const user = userEvent.setup()
    const spy = vi.fn()
    const emailish = (v: string) => /.+@.+\..+/.test(v)
    render(<TagInput aria-label="Emails" validate={emailish} onChange={spy} />)
    const input = screen.getByLabelText("Emails")
    await user.type(input, "not-an-email,")
    expect(spy).not.toHaveBeenCalled()
    expect(input).toHaveValue("not-an-email")
    await user.clear(input)
    await user.type(input, "ada@x.io,")
    expect(spy).toHaveBeenCalledWith(["ada@x.io"])
  })

  it("labelFor changes the chip but onChange emits the original strings", async () => {
    const user = userEvent.setup()
    const spy = vi.fn()
    render(
      <TagInput
        aria-label="Recipients"
        labelFor={(t) => t.replace(/\s*<.*$/, "")}
        onChange={spy}
      />,
    )
    await user.type(screen.getByLabelText("Recipients"), "Ada Lovelace <ada@x.io>,")
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument()
    expect(screen.queryByText("Ada Lovelace <ada@x.io>")).toBeNull()
    expect(spy).toHaveBeenCalledWith(["Ada Lovelace <ada@x.io>"])
  })

  it("renderTag takes over the chip with a remove api", async () => {
    const user = userEvent.setup()
    const spy = vi.fn()
    render(
      <TagInput
        aria-label="Custom"
        defaultValue={["keep", "drop"]}
        onChange={spy}
        renderTag={(tag, { remove }) => (
          <span data-testid={`chip-${tag}`}>
            {tag}
            <button type="button" onClick={remove}>x-{tag}</button>
          </span>
        )}
      />,
    )
    await user.click(screen.getByRole("button", { name: "x-drop" }))
    expect(spy).toHaveBeenCalledWith(["keep"])
  })

  it("parseInput commits programmable values (pair syntax -> Name <email>)", async () => {
    const user = userEvent.setup()
    const spy = vi.fn()
    const pairs = (raw: string) =>
      raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => (s.includes("<") ? s : s.replace(/^(\S+)\s+(\S+@\S+)$/, "$1 <$2>")))
    render(<TagInput aria-label="Pairs" parseInput={pairs} labelFor={(t) => t.replace(/\s*<.*$/, "")} onChange={spy} />)
    await user.type(screen.getByLabelText("Pairs"), "Ada ada@x.io, Grace <grace@x.io>{Enter}")
    expect(spy).toHaveBeenCalledWith(["Ada <ada@x.io>", "Grace <grace@x.io>"])
    expect(screen.getByText("Ada")).toBeInTheDocument()
    expect(screen.getByText("Grace")).toBeInTheDocument()
  })

  it("duplicates are skipped and maxTags stops adding (overflow stays editable)", async () => {
    const user = userEvent.setup()
    const spy = vi.fn()
    render(<TagInput aria-label="Limit" defaultValue={["a"]} maxTags={2} onChange={spy} />)
    const input = screen.getByLabelText("Limit")
    await user.type(input, "a,") // duplicate: silently skipped
    await user.type(input, "b,") // fills to max
    await user.type(input, "c,") // over max: stays in the field
    expect(spy).toHaveBeenLastCalledWith(["a", "b"])
    expect(input).toHaveValue("c")
  })

  it("disabled suppresses removal and input", () => {
    render(<TagInput aria-label="Locked" defaultValue={["x"]} disabled />)
    expect(screen.getByRole("button", { name: "Remove x" })).toBeDisabled()
    expect(screen.getByLabelText("Locked")).toBeDisabled()
  })
})
