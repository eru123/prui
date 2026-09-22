import * as React from "react"
import { ComponentDoc, MetaOnly, Calendar, DatePicker, DateRangePicker, TimePicker, TimeRangePicker } from "../../components/ComponentDoc"
import { calendarPropsMeta, datePickerPropsMeta, dateRangePickerPropsMeta, timePickerPropsMeta, timeRangePickerPropsMeta } from "prui/core"

export function CalendarDoc() {
  const [date, setDate] = React.useState("2026-09-12")
  return (
    <ComponentDoc
      name="Calendar"
      importPath="@skiddph/prui/core"
      description="A month-grid date picker with complete grid semantics and keyboard control: day/week arrows, Home/End week jumps, PageUp/PageDown month navigation, and aria-current today marking. Values are plain YYYY-MM-DD strings."
      when={[
        "The visible month picker inside pickers and filters",
        "Booking/availability surfaces where the calendar IS the UI",
        "Anywhere a date library is unwanted"
      ]}
      anatomy={
        <p>
          <code className="rounded bg-[var(--prui-raise)] px-1">&lt;Calendar value onSelect month onMonthChange min max disabled weekStartsOn showToday /&gt;</code>:
          header (prev/label/next) plus a 6×7 role=grid.
        </p>
      }
      demos={[
        {
          title: "Controlled selection",
          render: <Calendar value={date} onSelect={setDate} aria-label="Pick a date" />,
          code: `const [date, setDate] = useState('2026-09-12')
<Calendar value={date} onSelect={setDate} aria-label="Pick a date" />`,
        },
        {
          title: "Bounded + Monday-first",
          render: <Calendar min="2026-09-01" max="2026-09-20" weekStartsOn={1} showToday aria-label="Bounded" />,
          code: `<Calendar min="2026-09-01" max="2026-09-20" weekStartsOn={1} aria-label="Bounded" />`,
        },
      ]}
      api={<MetaOnly meta={calendarPropsMeta} />}
      examples={[
        {
          title: "Disabling arbitrary days (holidays)",
          code: `const holidays = new Set(['2026-12-25', '2027-01-01'])
<Calendar disabled={(key) => holidays.has(key)} onSelect={setDate} />`,
        },
        {
          title: "Controlled month view",
          code: `const [month, setMonth] = useState('2026-09')
<Calendar month={month} onMonthChange={setMonth} onSelect={setDate} />`,
        },
      ]}
      dos={["Pass aria-label when multiple calendars can appear", "Use weekStartsOn={1} for Monday-first locales"]}
      donts={["Don't add a date library for arithmetic; toDateKey/fromDateKey are exported"]}
      accessibility={
        <ul className="list-disc pl-5">
          <li>role=grid/gridcell with aria-selected, aria-current=date for today, aria-disabled for unreachable days.</li>
          <li>Keyboard: arrows move by day/week; Home/End jump to week edges; PageUp/PageDown change months; Enter/Space select.</li>
          <li>The month label is aria-live so month navigation is announced.</li>
        </ul>
      }
      composition={<p>Calendar is the engine inside DatePicker and DateRangePicker; use it bare for inline/always-visible date UIs.</p>}
      customization={<p>Selected/today/disabled colors are brand/line tokens; the Today shortcut is dictionary-driven.</p>}
      edgeCases={[
        "Month views always render 6 rows; trailing days of the next month are blank cells",
        "min/max clamp keyboard focus movement too",
        "weekStartsOn shifts the weekday header row accordingly",
      ]}
      mistakes={["Passing Date objects; values are strings", "Uncontrolled month with a controlled value that moves months"]}
      performance={<p>One grid; 42 day buttons per view.</p>}
      crossLinks={[
        { label: "DatePicker; the anchored picker", href: "/components/date-picker" },
        { label: "DateRangePicker; spans", href: "/components/date-range-picker" },
      ]}
    />
  )
}

export function DatePickerDoc() {
  const [date, setDate] = React.useState("")
  const [at, setAt] = React.useState("")
  return (
    <ComponentDoc
      name="DatePicker"
      importPath="@skiddph/prui/core"
      description="A text trigger opening an anchored Calendar popover: click or focus opens, a day commits, Escape and outside clicks close and refocus, and typing a full date commits it too. With timepicker on, a time panel rides along and values become 'YYYY-MM-DD HH:mm'."
      when={[
        "Form date fields that must stay native-input compatible",
        "Scheduling deadlines and due dates",
        "Date+time moments: enable timepicker for 'YYYY-MM-DD HH:mm' values"
      ]}
      anatomy={
        <p>
          <code className="rounded bg-[var(--prui-raise)] px-1">&lt;DatePicker value onChange min max timepicker seconds minuteStep /&gt;</code>:
          a combobox trigger, a portaled calendar panel, and (optionally) the time panel beside it.
        </p>
      }
      demos={[
        {
          title: "Date only (the default)",
          render: <div className="w-44"><DatePicker value={date} onChange={setDate} ariaLabel="Due date" /></div>,
          code: `<DatePicker value={due} onChange={setDue} ariaLabel="Due date" />`,
        },
        {
          title: "Date + time (timepicker)",
          desc: "the panel stays open after picking the day so the time can be refined; values carry HH:mm.",
          render: <div className="w-52"><DatePicker timepicker value={at} onChange={setAt} ariaLabel="Starts at" /></div>,
          code: `<DatePicker timepicker value={at} onChange={setAt} ariaLabel="Starts at" />
// value: '2026-09-12 14:30'`,
        },
        {
          title: "Bounded",
          render: <div className="w-44"><DatePicker min="2026-09-01" max="2026-09-30" ariaLabel="Within September" /></div>,
          code: `<DatePicker min="2026-09-01" max="2026-09-30" ariaLabel="Within September" />`,
        },
      ]}
      api={<MetaOnly meta={datePickerPropsMeta} />}
      examples={[
        {
          title: "Typed input commits",
          code: `// typing "2026-10-04" (or "2026-10-04 09:30" with timepicker)
// in the trigger commits the value directly`,
        },
        {
          title: "Seconds precision",
          code: `<DatePicker timepicker seconds value={at} onChange={setAt} ariaLabel="Snapshot at" />
// value: '2026-09-12 14:30:07'`,
        },
      ]}
      dos={["Always pass ariaLabel (or bind a visible label)", "Default the time with defaultValue including '00:00' when you need stable payloads"]}
      donts={["Don't wrap in your own popover; anchoring and dismissal are built in"]}
      accessibility={
        <ul className="list-disc pl-5">
          <li>Combobox trigger semantics (aria-expanded/haspopup) over a role=dialog panel.</li>
          <li>Escape closes and refocuses the input; clicking outside dismisses; the calendar keeps its grid keyboard map.</li>
          <li>With timepicker, the time columns are listboxes with their own arrow navigation.</li>
        </ul>
      }
      composition={<p>Drops into forms at h-9. Pairs with DateRangePicker for spans; TimePanel composes into custom pickers.</p>}
      customization={<p>Trigger styles are the input tokens; the icon swaps to a clock when timepicker is on.</p>}
      edgeCases={[
        "timepicker=false closes the panel after the day is picked",
        "timepicker=true stays open; refine the time, then click out or Escape",
        "min/max accept the same string format and clip both typing and the grid",
      ]}
      mistakes={["Expecting a Date object from onChange", "Forgetting ariaLabel on an icon-only trigger"]}
      performance={<p>Panel mounts only while open; positioning re-computes on scroll/resize.</p>}
      crossLinks={[
        { label: "DateRangePicker; spans", href: "/components/date-range-picker" },
        { label: "TimePicker; time only", href: "/components/time-picker" },
        { label: "Calendar; the inline grid", href: "/components/calendar" },
      ]}
    />
  )
}

export function DateRangePickerDoc() {
  const [range, setRange] = React.useState<{ from?: string; to?: string }>({})
  const [capped, setCapped] = React.useState<{ from?: string; to?: string }>({})
  return (
    <ComponentDoc
      name="DateRangePicker"
      importPath="@skiddph/prui/core"
      description="Start–end selection on one calendar: the first click anchors, the second completes, an earlier second click restarts. maxRange caps the span ('3m', '90d', '12w', '1y', or a day count) by disabling out-of-range days, and timepicker adds from/to time panels."
      when={[
        "Report windows and analytics filters",
        "Booking and leave requests with bounded spans",
        "Export and retention windows"
      ]}
      anatomy={
        <p>
          <code className="rounded bg-[var(--prui-raise)] px-1">&lt;DateRangePicker value onChange min max maxRange timepicker /&gt;</code>:
          combobox trigger + portaled panel with the calendar, optional time columns, and a clear/apply footer.
        </p>
      }
      demos={[
        {
          title: "Basic range",
          render: <div className="w-64"><DateRangePicker value={range} onChange={setRange} ariaLabel="Report range" /></div>,
          code: `const [range, setRange] = useState<{ from?: string; to?: string }>({})
<DateRangePicker value={range} onChange={setRange} ariaLabel="Report range" />`,
        },
        {
          title: "Capped span (maxRange=\"3m\")",
          desc: "once a start is anchored, days beyond start + 3 months disable; a beyond-cap click clamps to the cap.",
          render: <div className="w-64"><DateRangePicker maxRange="3m" value={capped} onChange={setCapped} ariaLabel="Last 3 months max" /></div>,
          code: `<DateRangePicker maxRange="3m" value={r} onChange={setR} ariaLabel="Window" />
// also: maxRange={90}  '90d'  '12w'  '1y'`,
        },
      ]}
      api={<MetaOnly meta={dateRangePickerPropsMeta} />}
      examples={[
        {
          title: "With times",
          code: `<DateRangePicker timepicker value={r} onChange={setR} ariaLabel="Outage window" />
// r: { from: '2026-09-12 09:00', to: '2026-09-12 17:30' }`,
        },
        {
          title: "Preset chips alongside",
          code: `<div className="flex gap-2">
  <Button size="sm" onClick={() => setRange(last7Days())}>Last 7d</Button>
  <Button size="sm" onClick={() => setRange(monthToDate())}>MTD</Button>
  <DateRangePicker value={range} onChange={setRange} ariaLabel="Custom" />
</div>`,
        },
      ]}
      dos={["Offer presets for common spans; the picker handles the custom case", "Use maxRange when your API or pricing bounds the window"]}
      donts={["Don't hide the trigger value; it is the confirmation of what will run"]}
      accessibility={
        <ul className="list-disc pl-5">
          <li>Same combobox-over-dialog pattern as DatePicker; clear and apply are labelled buttons.</li>
          <li>Out-of-cap days are aria-disabled and announced by the grid.</li>
          <li>Escape and outside click dismiss and refocus the trigger.</li>
        </ul>
      }
      composition={<p>The value shape mirrors DateRange; feed it straight into Resource filters or query builders.</p>}
      customization={<p>Panel tokens shared with DatePicker; footer copy comes from the dictionary (clear/apply/from/to).</p>}
      edgeCases={[
        "Picking an end before the start restarts the range at that day",
        "A click beyond maxRange clamps to the cap rather than rejecting",
        "With timepicker, completing the range keeps the panel open for time refinement",
      ]}
      mistakes={["Confusing maxRange with max (max bounds absolute dates; maxRange bounds the span)", "Treating {from} alone as a complete range"]}
      performance={<p>Panel mounts while open; cap computation is memoized on the anchor.</p>}
      crossLinks={[
        { label: "DatePicker; single dates", href: "/components/date-picker" },
        { label: "TimeRangePicker; time spans", href: "/components/time-range-picker" },
      ]}
    />
  )
}

export function TimePickerDoc() {
  const [time, setTime] = React.useState("09:30")
  return (
    <ComponentDoc
      name="TimePicker"
      importPath="@skiddph/prui/core"
      description="A 12-hour time picker by default: hour/minute(/second) columns plus an AM/PM column, listbox semantics, arrow navigation, min/max bounds, and a stepped minute grid. Pass hour12={false} for the 24-hour grid. Values are always wire-format 'HH:mm' ('HH:mm:ss' with seconds) no matter the display."
      when={[
        "Meeting and reminder times",
        "Business-hours windows and cutoffs",
        "The time half of a date+time field (see DatePicker timepicker)"
      ]}
      anatomy={
        <p>
          <code className="rounded bg-[var(--prui-raise)] px-1">&lt;TimePicker value onChange minuteStep seconds min max /&gt;</code>:
          a combobox trigger over a portaled panel of column listboxes. Add hour12={false} for the 24-hour grid.
        </p>
      }
      demos={[
        {
          title: "Basic (12-hour default)",
          render: <div className="w-32"><TimePicker value={time} onChange={setTime} ariaLabel="Meeting time" /></div>,
          code: `<TimePicker value={time} onChange={setTime} ariaLabel="Meeting time" />   // shows 9:30 AM, onChange still gets "09:30"`,
        },
        {
          title: "24-hour grid",
          render: <div className="w-32"><TimePicker hour12={false} ariaLabel="Server time" /></div>,
          code: `<TimePicker hour12={false} ariaLabel="Server time" />`,
        },
        {
          title: "Quarter-hour steps",
          render: <div className="w-32"><TimePicker minuteStep={15} ariaLabel="Slot" /></div>,
          code: `<TimePicker minuteStep={15} ariaLabel="Slot" />`,
        },
        {
          title: "Seconds precision",
          render: <div className="w-36"><TimePicker seconds ariaLabel="Log at" /></div>,
          code: `<TimePicker seconds ariaLabel="Log at" />   // 'HH:mm:ss'`,
        },
      ]}
      api={<MetaOnly meta={timePickerPropsMeta} />}
      examples={[
        {
          title: "Bounded window",
          code: `<TimePicker min="09:00" max="17:00" ariaLabel="Book between" />`,
        },
      ]}
      dos={["Use minuteStep to shrink the column to real choices (15/30)", "Pick seconds only when the domain needs it"]}
      donts={["Don't use for durations; that's a number input pair"]}
      accessibility={
        <ul className="list-disc pl-5">
          <li>Each column is a role=listbox with a labelled header; options carry aria-selected/aria-disabled.</li>
          <li>Arrows move within a column; Left/Right move between columns; Enter/Space pick; Escape closes and refocuses.</li>
        </ul>
      }
      composition={<p>TimePanel (the inline grid) is exported for custom compositions. DatePicker embeds it. Values are zero-padded strings.</p>}
      customization={<p>Column width 64px; selection uses brand tokens; the compact variant drops headers for dense panels.</p>}
      edgeCases={[
        "min/max disable out-of-window options rather than hiding them; the AM/PM column stays usable whenever any hour of that period is in range",
        "minuteStep > 1 snaps values to the step grid",
      ]}
      mistakes={["Passing '9:30'; values are zero-padded '09:30'", "Storing the display string: hour12 only changes the trigger/panel view, onChange always reports 'HH:mm(:ss)'"]}
      performance={<p>At most 12|24+60(+60)+2 buttons while open; columns scroll independently.</p>}
      crossLinks={[
        { label: "TimeRangePicker; spans", href: "/components/time-range-picker" },
        { label: "DatePicker timepicker; date+time", href: "/components/date-picker" },
      ]}
    />
  )
}

export function TimeRangePickerDoc() {
  const [shift, setShift] = React.useState<{ from?: string; to?: string }>({})
  return (
    <ComponentDoc
      name="TimeRangePicker"
      importPath="@skiddph/prui/core"
      description="A from–to time span on side-by-side column pairs: pick the start, then the end; the end panel constrains itself to after the start so an inverted range can't be built. Clear/apply footer, bounds, and stepped minutes included. 12-hour with AM/PM by default (hour12={false} for 24-hour); values stay 'HH:mm'."
      when={[
        "Shift and store-hours windows",
        "On-call and maintenance spans within a day",
        "Filtering rows by time-of-day"
      ]}
      anatomy={
        <p>
          <code className="rounded bg-[var(--prui-raise)] px-1">&lt;TimeRangePicker value onChange minuteStep seconds min max /&gt;</code>:
          combobox trigger over a portaled panel with From/To time grids.
        </p>
      }
      demos={[
        {
          title: "Shift window",
          render: <div className="w-44"><TimeRangePicker value={shift} onChange={setShift} ariaLabel="Shift" /></div>,
          code: `const [shift, setShift] = useState<{ from?: string; to?: string }>({})
<TimeRangePicker value={shift} onChange={setShift} ariaLabel="Shift" />`,
        },
        {
          title: "Bookable slots",
          render: <div className="w-44"><TimeRangePicker minuteStep={30} min="08:00" max="20:00" ariaLabel="Bookable" /></div>,
          code: `<TimeRangePicker minuteStep={30} min="08:00" max="20:00" ariaLabel="Bookable" />`,
        },
      ]}
      api={<MetaOnly meta={timeRangePickerPropsMeta} />}
      examples={[
        {
          title: "Same-day constraint wiring",
          code: `// pair with a DatePicker for a single-day window
<DatePicker value={day} onChange={setDay} ariaLabel="Day" />
<TimeRangePicker value={span} onChange={setSpan} ariaLabel="That day, between" />`,
        },
      ]}
      dos={["Set min/max to the business window", "Use minuteStep to match your slot length"]}
      donts={["Don't use for multi-day spans. DateRangePicker with timepicker covers those"]}
      accessibility={
        <ul className="list-disc pl-5">
          <li>Two labelled grid groups (From/To) with the TimePicker column semantics.</li>
          <li>The To panel disables times before From; invalid states are unbuildable, not just rejected.</li>
          <li>Escape/outside click dismiss; clear and apply are labelled buttons.</li>
        </ul>
      }
      composition={<p>The value shape mirrors TimeRange; combine with a date for full moments, or feed filters directly.</p>}
      customization={<p>Same tokens and compact grids as TimePicker; the trigger shows 'HH:mm – HH:mm'.</p>}
      edgeCases={[
        "Changing From after To constrains/invalidates the To choices accordingly",
        "An out-of-bounds controlled value still renders (external data), but cannot be re-picked",
      ]}
      mistakes={["Assuming overnight spans (22:00–06:00); day-crossing needs your own modeling"]}
      performance={<p>Two grid groups while open; identical column rendering to TimePicker.</p>}
      crossLinks={[
        { label: "TimePicker; single times", href: "/components/time-picker" },
        { label: "DateRangePicker; date spans", href: "/components/date-range-picker" },
      ]}
    />
  )
}
