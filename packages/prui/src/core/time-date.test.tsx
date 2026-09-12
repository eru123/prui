import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { TimePicker, TimeRangePicker } from "./time-picker"
import { DatePicker, DateRangePicker } from "./date-picker"

afterEach(() => {
  cleanup()
  document.body.innerHTML = ""
})

describe("TimePicker", () => {
  it("opens on click, picks hour and minute, reports HH:mm", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TimePicker ariaLabel="Meeting time" onChange={onChange} />)
    await user.click(screen.getByRole("combobox", { name: "Meeting time" }))
    expect(screen.getByRole("dialog", { name: "Meeting time" })).toBeInTheDocument()
    await user.click(screen.getAllByTestId("time-h").find((el) => el.textContent === "14")!)
    expect(onChange).toHaveBeenLastCalledWith("14:00")
    await user.click(screen.getAllByTestId("time-m").find((el) => el.textContent === "30")!)
    expect(onChange).toHaveBeenLastCalledWith("14:30")
  })

  it("seconds mode produces HH:mm:ss values", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TimePicker ariaLabel="Precise" seconds defaultValue="10:20:30" onChange={onChange} />)
    await user.click(screen.getByRole("combobox", { name: "Precise" }))
    await user.click(screen.getAllByTestId("time-s").find((el) => el.textContent === "59")!)
    expect(onChange).toHaveBeenLastCalledWith("10:20:59")
  })

  it("respects min/max bounds (out-of-range options disable)", async () => {
    const user = userEvent.setup()
    render(<TimePicker ariaLabel="Window" min="09:00" max="17:00" />)
    await user.click(screen.getByRole("combobox", { name: "Window" }))
    const hour8 = screen.getAllByTestId("time-h").find((el) => el.textContent === "08")!
    const hour12 = screen.getAllByTestId("time-h").find((el) => el.textContent === "12")!
    expect(hour8).toHaveAttribute("aria-disabled", "true")
    expect(hour12).not.toHaveAttribute("aria-disabled")
  })

  it("minuteStep lists only stepped minutes", async () => {
    const user = userEvent.setup()
    render(<TimePicker ariaLabel="Quarter" minuteStep={15} />)
    await user.click(screen.getByRole("combobox", { name: "Quarter" }))
    const minutes = screen.getAllByTestId("time-m").map((el) => el.textContent)
    expect(minutes).toEqual(["00", "15", "30", "45"])
  })

  it("closes on outside click and Escape refocuses the input", async () => {
    const user = userEvent.setup()
    render(
      <div>
        <TimePicker ariaLabel="Slot" />
        <button>elsewhere</button>
      </div>,
    )
    const input = screen.getByRole("combobox", { name: "Slot" })
    await user.click(input)
    expect(screen.getByRole("dialog", { name: "Slot" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "elsewhere" }))
    expect(screen.queryByRole("dialog")).toBeNull()
    await user.click(input)
    await user.keyboard("{Escape}")
    expect(screen.queryByRole("dialog")).toBeNull()
    expect(input).toHaveFocus()
  })
})

describe("TimeRangePicker", () => {
  it("picks from then to and reports the pair", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TimeRangePicker ariaLabel="Shift" onChange={onChange} />)
    await user.click(screen.getByRole("combobox", { name: "Shift" }))
    await user.click(screen.getAllByTestId("time-h").find((el) => el.textContent === "09")!)
    expect(onChange).toHaveBeenLastCalledWith({ from: "09:00", to: undefined })
    // the "to" column is the second hours column
    const toHours = screen.getAllByTestId("time-h").filter((el) => el.textContent === "17")
    await user.click(toHours[toHours.length - 1]!)
    expect(onChange).toHaveBeenLastCalledWith({ from: "09:00", to: "17:00" })
    expect(screen.getByTestId("timerange-label")).toHaveTextContent("09:00 – 17:00")
  })

  it("the to-panel constrains picks to after the from time", async () => {
    const user = userEvent.setup()
    render(<TimeRangePicker ariaLabel="Window" />)
    await user.click(screen.getByRole("combobox", { name: "Window" }))
    const hours = (n: string) => screen.getAllByTestId("time-h").filter((el) => el.textContent === n)
    await user.click(hours("14")[0]!)
    // 08:00 in the to column is disabled once from = 14:00
    const toEight = hours("08")[hours("08").length - 1]!
    expect(toEight).toHaveAttribute("aria-disabled", "true")
    // while 16:00 stays selectable
    const toSixteen = hours("16")[hours("16").length - 1]!
    expect(toSixteen).not.toHaveAttribute("aria-disabled")
  })
})

describe("DatePicker + timepicker composition", () => {
  it("timepicker=false keeps date-only values (the default)", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<DatePicker ariaLabel="Due" onChange={onChange} />)
    await user.click(screen.getByRole("combobox", { name: "Due" }))
    await user.click(screen.getByRole("gridcell", { name: "10" }))
    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/^\d{4}-\d{2}-10$/))
    // date-only mode closes after picking
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("timepicker=true keeps the panel open and appends HH:mm", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<DatePicker ariaLabel="Starts" timepicker onChange={onChange} />)
    await user.click(screen.getByRole("combobox", { name: "Starts" }))
    await user.click(screen.getByRole("gridcell", { name: "10" }))
    expect(onChange).toHaveBeenLastCalledWith(expect.stringMatching(/^\d{4}-\d{2}-10 00:00$/))
    // panel stays open to refine the time
    expect(screen.getByRole("dialog", { name: "Starts" })).toBeInTheDocument()
    await user.click(screen.getAllByTestId("time-h").find((el) => el.textContent === "14")!)
    await user.click(screen.getAllByTestId("time-m").find((el) => el.textContent === "30")!)
    expect(onChange).toHaveBeenLastCalledWith(expect.stringMatching(/^\d{4}-\d{2}-10 14:30$/))
  })
})

describe("DateRangePicker maxRange", () => {
  it("disables to-dates beyond from+maxRange (3m cap)", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<DateRangePicker ariaLabel="Window" maxRange="3m" onChange={onChange} />)
    await user.click(screen.getByRole("combobox", { name: "Window" }))
    // anchor on day 5 of next month (relative to today, deterministic)
    await user.click(screen.getByRole("button", { name: "Next month" }))
    await user.click(screen.getByRole("gridcell", { name: "5" }))
    const pickedFrom = onChange.mock.calls.at(-1)![0].from as string
    expect(pickedFrom).toMatch(/^\d{4}-\d{2}-05$/)
    // three months later the cap lands on same-day-of-month; verify two
    // boundaries inside the month that is from+3 months
    const [y, m] = pickedFrom.split("-").map(Number)
    const capMonth = new Date(y!, (m ?? 1) - 1 + 3, 1)
    const capLabel = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(capMonth)
    // navigate to that month
    for (let i = 0; i < 3; i++) {
      await user.click(screen.getByRole("button", { name: "Next month" }))
    }
    expect(screen.getByText(capLabel)).toBeInTheDocument()
    const capKey = (day: number) => {
      const d = new Date(capMonth.getFullYear(), capMonth.getMonth(), day)
      const mo = String(d.getMonth() + 1).padStart(2, "0")
      const dd = String(d.getDate()).padStart(2, "0")
      return `${d.getFullYear()}-${mo}-${dd}`
    }
    // the day before the cap day is selectable, the day after is disabled
    expect(document.querySelector<HTMLElement>(`[data-prui-calendar-day="${capKey(3)}"]`)).not.toHaveAttribute("aria-disabled")
    expect(document.querySelector<HTMLElement>(`[data-prui-calendar-day="${capKey(8)}"]`)).toHaveAttribute("aria-disabled", "true")
  })

  it("clamps a picked to-date beyond the cap to the cap itself", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<DateRangePicker ariaLabel="Clamp" maxRange={7} onChange={onChange} />)
    await user.click(screen.getByRole("combobox", { name: "Clamp" }))
    await user.click(screen.getByRole("gridcell", { name: "1" }))
    // pick the 20th: beyond +7 days, clamps to the 8th
    await user.click(screen.getByRole("gridcell", { name: "20" }))
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ to: expect.stringMatching(/^\d{4}-\d{2}-08$/) }),
    )
  })

  it("closes when clicking outside the panel", async () => {
    const user = userEvent.setup()
    render(
      <div>
        <DateRangePicker ariaLabel="Range" />
        <button>outside</button>
      </div>,
    )
    await user.click(screen.getByRole("combobox", { name: "Range" }))
    expect(screen.getByRole("dialog", { name: "Range" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "outside" }))
    expect(screen.queryByRole("dialog")).toBeNull()
  })
})
