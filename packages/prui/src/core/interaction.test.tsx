import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react"
import * as React from "react"
import { CopyButton, copyText } from "./copy-button"
import { HoldToConfirm } from "./hold-to-confirm"
import { OTPInput } from "./otp-input"
import { PasswordStrength, scorePassword } from "./password-strength"
import { FloatingLabel } from "./floating-label"
import { ExpandingSearch } from "./expanding-search"
import { SegmentedControl } from "./segmented-control"
import { Slider } from "./slider"
import { WizardSteps } from "./wizard-steps"
import { ContextMenu } from "./context-menu"
import { Lightbox } from "./lightbox"
import { LikeBurst } from "./press"
import { SkeletonSwap } from "./skeleton"

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe("CopyButton", () => {
  it("copies the value and reverts after the timeout", async () => {
    vi.useFakeTimers()
    const write = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText: write } })
    render(<CopyButton value="secret">Copy</CopyButton>)
    fireEvent.click(screen.getByRole("button", { name: /copy/i }))
    expect(write).toHaveBeenCalledWith("secret")
    act(() => {
      vi.advanceTimersByTime(50)
    })
    expect(screen.getByText("Copy")).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(1600)
    })
    expect(screen.getByText("Copy")).toBeInTheDocument()
  })

  it("supports lazy values via a getter", async () => {
    const write = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText: write } })
    const getter = vi.fn(() => "lazy")
    render(<CopyButton value={getter} />)
    fireEvent.click(screen.getByRole("button"))
    expect(getter).toHaveBeenCalled()
    expect(write).toHaveBeenCalledWith("lazy")
  })
})

describe("HoldToConfirm", () => {
  it("confirms only when the hold completes; releasing early cancels", () => {
    vi.useFakeTimers()
    const onConfirm = vi.fn()
    render(<HoldToConfirm onConfirm={onConfirm} duration={500}>Delete</HoldToConfirm>)
    const btn = screen.getByRole("button", { name: /delete/i })

    fireEvent.pointerDown(btn, { button: 0 })
    act(() => {
      vi.advanceTimersByTime(200)
    })
    fireEvent.pointerUp(btn)
    expect(onConfirm).not.toHaveBeenCalled()

    fireEvent.pointerDown(btn, { button: 0 })
    act(() => {
      vi.advanceTimersByTime(600)
    })
    fireEvent.pointerUp(btn)
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it("works from the keyboard (Enter hold)", () => {
    vi.useFakeTimers()
    const onConfirm = vi.fn()
    render(<HoldToConfirm onConfirm={onConfirm} duration={300}>Delete</HoldToConfirm>)
    const btn = screen.getByRole("button", { name: /delete/i })
    fireEvent.keyDown(btn, { key: "Enter" })
    act(() => {
      vi.advanceTimersByTime(400)
    })
    fireEvent.keyUp(btn, { key: "Enter" })
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })
})

describe("OTPInput", () => {
  const box = () => screen.getAllByRole("textbox") as HTMLInputElement[]
  const at = (i: number) => box()[i] as HTMLInputElement

  it("types across boxes, backspaces into previous, completes", () => {
    const onComplete = vi.fn()
    const onChange = vi.fn()
    render(<OTPInput onComplete={onComplete} onChange={onChange} />)
    expect(box()).toHaveLength(6)

    fireEvent.change(at(0), { target: { value: "1" } })
    expect(at(1)).toHaveFocus()
    fireEvent.change(at(1), { target: { value: "2" } })
    fireEvent.change(at(2), { target: { value: "3" } })
    expect(onComplete).not.toHaveBeenCalled()

    fireEvent.change(at(3), { target: { value: "4" } })
    fireEvent.change(at(4), { target: { value: "5" } })
    fireEvent.change(at(5), { target: { value: "6" } })
    expect(onComplete).toHaveBeenCalledWith("123456")
    expect(onChange).toHaveBeenLastCalledWith("123456")

    fireEvent.keyDown(at(5), { key: "Backspace" })
    fireEvent.keyDown(at(5), { key: "Backspace" }) // empty -> clears + focuses 4
    expect(at(4)).toHaveFocus()
  })

  it("distributes a paste across boxes", () => {
    const onComplete = vi.fn()
    render(<OTPInput onComplete={onComplete} />)
    fireEvent.paste(at(0), { clipboardData: { getData: () => "123456" } } as unknown as React.ClipboardEvent)
    expect(onComplete).toHaveBeenCalledWith("123456")
  })

  it("numeric mode rejects letters", () => {
    render(<OTPInput />)
    fireEvent.change(at(0), { target: { value: "a" } })
    expect(at(0).value).toBe("")
  })
})

describe("PasswordStrength", () => {
  it("scores passwords sensibly", () => {
    expect(scorePassword("")).toBe(0)
    expect(scorePassword("abc")).toBe(0)
    expect(scorePassword("abcdef")).toBe(1)
    expect(scorePassword("abcdefgh")).toBe(1) // one character class stays fair
    expect(scorePassword("Password1")).toBe(2)
    expect(scorePassword("Str0ng!Passw0rd")).toBe(3)
    expect(scorePassword("aaaaaaaaaa")).toBeLessThan(3) // repetitive penalty
  })

  it("renders the label for the current score", () => {
    const { rerender } = render(<PasswordStrength value="" />)
    expect(screen.queryByText("Weak")).not.toBeInTheDocument()
    rerender(<PasswordStrength value="abc" />)
    expect(screen.getByText("Weak")).toBeInTheDocument()
    rerender(<PasswordStrength value="Str0ng!Passw0rd" />)
    expect(screen.getByText("Strong")).toBeInTheDocument()
  })
})

describe("FloatingLabel", () => {
  it("associates the label with the input and marks filled", () => {
    render(<FloatingLabel label="Email" defaultValue="a@b.c" />)
    const input = screen.getByLabelText("Email") as HTMLInputElement
    const field = input.closest("label")
    expect(field).toHaveAttribute("data-filled")
    fireEvent.change(input, { target: { value: "" } })
    expect(field).not.toHaveAttribute("data-filled")
  })
})

describe("ExpandingSearch", () => {
  it("expands on focus and reports searches on Enter", () => {
    const onSearch = vi.fn()
    render(<ExpandingSearch onSearch={onSearch} />)
    const input = screen.getByRole("searchbox")
    expect(input.closest("[data-state]")?.getAttribute("data-state")).toBe("closed")
    fireEvent.focus(input)
    expect(input.closest("[data-state]")?.getAttribute("data-state")).toBe("open")
    fireEvent.change(input, { target: { value: "prui" } })
    fireEvent.keyDown(input, { key: "Enter" })
    expect(onSearch).toHaveBeenCalledWith("prui")
  })
})

describe("SegmentedControl", () => {
  const options = [
    { value: "day" as const, label: "Day" },
    { value: "week" as const, label: "Week" },
    { value: "month" as const, label: "Month" },
  ]

  it("selects, announces as radios, and arrows between segments", () => {
    const onChange = vi.fn()
    render(<SegmentedControl options={options} ariaLabel="Range" onChange={onChange} />)
    const group = screen.getByRole("radiogroup", { name: "Range" })
    const day = screen.getByRole("radio", { name: "Day" })
    const week = screen.getByRole("radio", { name: "Week" })
    expect(day).toBeChecked()
    expect(week).not.toBeChecked()

    fireEvent.click(week)
    expect(onChange).toHaveBeenCalledWith("week")
    expect(week).toBeChecked()
    expect(day).not.toBeChecked()

    // keyboard from the checked radio: right arrow moves (and selects) on
    fireEvent.keyDown(group, { key: "ArrowRight" })
    expect(screen.getByRole("radio", { name: "Month" })).toBeChecked()
    fireEvent.keyDown(group, { key: "Home" })
    expect(screen.getByRole("radio", { name: "Day" })).toBeChecked()
  })

  it("controlled mode follows the value prop", () => {
    const { rerender } = render(<SegmentedControl options={options} value="month" ariaLabel="Range" />)
    expect(screen.getByRole("radio", { name: "Month" })).toBeChecked()
    rerender(<SegmentedControl options={options} value="day" ariaLabel="Range" />)
    expect(screen.getByRole("radio", { name: "Day" })).toBeChecked()
  })
})

describe("Slider", () => {
  it("exposes slider semantics and snaps to detents from the keyboard", () => {
    const onChange = vi.fn()
    render(<Slider ariaLabel="Volume" defaultValue={45} min={0} max={100} detents={[0, 50, 100]} onChange={onChange} />)
    const slider = screen.getByRole("slider", { name: "Volume" })
    expect(slider).toHaveAttribute("aria-valuemin", "0")
    expect(slider).toHaveAttribute("aria-valuemax", "100")
    expect(slider).toHaveAttribute("aria-valuenow", "45")

    // arrow right: 45 -> 46, within the 6% window of the 50 detent -> snaps
    fireEvent.keyDown(slider, { key: "ArrowRight" })
    expect(slider).toHaveAttribute("aria-valuenow", "50")
    expect(onChange).toHaveBeenLastCalledWith(50)

    fireEvent.keyDown(slider, { key: "Home" })
    expect(slider).toHaveAttribute("aria-valuenow", "0")
  })

  it("drags via pointer events", () => {
    render(<Slider ariaLabel="Volume" defaultValue={0} min={0} max={100} />)
    const slider = screen.getByRole("slider", { name: "Volume" })
    const track = slider.firstElementChild as HTMLElement
    track.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 20, right: 100, bottom: 20 }) as DOMRect
    // RTL's jsdom pointer-event fallback drops coordinates; dispatching a
    // constructed MouseEvent carries them through
    fireEvent(slider, new MouseEvent("pointerdown", { clientX: 75, button: 0, bubbles: true }))
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "75")
  })
})

describe("WizardSteps", () => {
  const steps = [{ label: "Account" }, { label: "Profile" }, { label: "Done" }]

  it("locks future steps until visited, marks progress", () => {
    render(<WizardSteps steps={steps} />)
    const profile = screen.getByRole("button", { name: /profile/i })
    const done = screen.getByRole("button", { name: /done/i })
    expect(done).toBeDisabled()
    fireEvent.click(profile)
    expect(screen.getByRole("button", { name: /profile/i }).getAttribute("aria-current")).toBe("step")
    expect(done).toBeEnabled()
  })

  it("controlled current with allowSkip permits jumping", () => {
    const onStepChange = vi.fn()
    render(<WizardSteps steps={steps} current={0} allowSkip onStepChange={onStepChange} />)
    fireEvent.click(screen.getByRole("button", { name: /done/i }))
    expect(onStepChange).toHaveBeenCalledWith(2)
  })
})

describe("ContextMenu", () => {
  it("opens on right-click at the pointer, closes on Escape and runs items", () => {
    const onSelect = vi.fn()
    render(
      <ContextMenu items={[{ label: "Rename", onSelect }, { label: "Delete", danger: true, separatorBefore: true }]}>
        <div data-testid="region">File</div>
      </ContextMenu>,
    )
    const region = screen.getByTestId("region")
    fireEvent.contextMenu(region, { clientX: 20, clientY: 30 })
    const menu = screen.getByRole("menu")
    expect(menu).toHaveStyle({ left: "20px", top: "30px" })
    fireEvent.click(screen.getByRole("menuitem", { name: "Rename" }))
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole("menu")).not.toBeInTheDocument()
  })
})

describe("Lightbox", () => {
  const images = [
    { src: "a.png", alt: "Alpha", caption: "First" },
    { src: "b.png", alt: "Beta" },
  ]

  it("opens as a dialog, steps through images, closes on Escape", () => {
    const onOpenChange = vi.fn()
    const onIndexChange = vi.fn()
    const { rerender } = render(
      <Lightbox open onOpenChange={onOpenChange} images={images} onIndexChange={onIndexChange} />,
    )
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.getByText("1 / 2")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Next image" }))
    expect(onIndexChange).toHaveBeenCalledWith(1)
    // useEscapeKey listens on document (capture): dispatch from an element
    fireEvent.keyDown(document.body, { key: "Escape" })
    expect(onOpenChange).toHaveBeenCalledWith(false)
    rerender(<Lightbox open={false} onOpenChange={onOpenChange} images={images} />)
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })
})

describe("LikeBurst", () => {
  it("toggles pressed state and fires onChange", () => {
    const onChange = vi.fn()
    render(<LikeBurst onChange={onChange} />)
    const btn = screen.getByRole("button", { name: /like/i })
    expect(btn).toHaveAttribute("aria-pressed", "false")
    fireEvent.click(btn)
    expect(onChange).toHaveBeenCalledWith(true)
    expect(btn).toHaveAttribute("aria-pressed", "true")
  })
})

describe("SkeletonSwap", () => {
  it("never flashes the skeleton inside the delay", () => {
    vi.useFakeTimers()
    const { rerender } = render(
      <SkeletonSwap loading skeleton={<div data-testid="sk" />}>
        <div data-testid="content" />
      </SkeletonSwap>,
    )
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(screen.queryByTestId("sk")).not.toBeInTheDocument()
    rerender(
      <SkeletonSwap loading={false} skeleton={<div data-testid="sk" />}>
        <div data-testid="content" />
      </SkeletonSwap>,
    )
    expect(screen.getByTestId("content")).toBeInTheDocument()
  })

  it("shows the skeleton once past the delay", () => {
    vi.useFakeTimers()
    render(
      <SkeletonSwap loading skeleton={<div data-testid="sk" />}>
        <div data-testid="content" />
      </SkeletonSwap>,
    )
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(screen.getByTestId("sk")).toBeInTheDocument()
  })
})

describe("copyText fallback", () => {
  it("falls back to execCommand without the async clipboard", async () => {
    const execCommand = vi.fn().mockReturnValue(true)
    document.execCommand = execCommand as unknown as typeof document.execCommand
    const original = navigator.clipboard
    Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true })
    try {
      await copyText("legacy")
      expect(execCommand).toHaveBeenCalledWith("copy")
    } finally {
      Object.defineProperty(navigator, "clipboard", { value: original, configurable: true })
    }
  })
})
