import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Form, FormGroup, FormInput, FormButton } from "./form"
import type { SafeParseSchema } from "./types"

describe("Form + FormButton across scopes", () => {
  function Case({ onSubmit, disableWhen = "invalid" as "invalid" | "never" }: { onSubmit: (v: Record<string, unknown>) => void; disableWhen?: "invalid" | "never" }) {
    return (
      <div>
        <Form id="user" initialValues={{ name: "" }} onSubmit={onSubmit}>
          <FormInput name="name" label="Name" required />
        </Form>
        {/* outside the form scope, like a modal footer */}
        <div data-testid="footer">
          <FormButton form="user" action="submit" disableWhen={disableWhen}>Save</FormButton>
          <FormButton form="user" action="clear">Clear</FormButton>
        </div>
      </div>
    )
  }

  it("submit button disables while the form is invalid, submits when filled", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Case onSubmit={onSubmit} />)
    const save = screen.getByTestId("form-button-user-submit")
    expect(save).toBeDisabled()

    await user.type(screen.getByLabelText(/Name/), "Ada")
    expect(save).toBeEnabled()
    await user.click(save)
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ name: "Ada" }))
  })

  it("clear button empties the form and disables submit again", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Case onSubmit={onSubmit} />)
    await user.type(screen.getByLabelText(/Name/), "Ada")
    await user.click(screen.getByTestId("form-button-user-clear"))
    expect(screen.getByLabelText(/Name/)).toHaveValue("")
    expect(screen.getByTestId("form-button-user-submit")).toBeDisabled()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("required validation surfaces under the field after a failed submit", async () => {
    const user = userEvent.setup()
    render(<Case onSubmit={vi.fn()} disableWhen="never" />)
    await user.click(screen.getByTestId("form-button-user-submit"))
    expect(await screen.findByRole("alert")).toHaveTextContent("Name is required.")
  })
})

describe("FormGroup responsive columns", () => {
  it("renders the responsive grid classes", () => {
    render(
      <Form id="g" initialValues={{}}>
        <FormGroup label="Contact" columns={{ base: 1, md: 2, lg: 3 }}>
          <FormInput name="email" label="Email" type="email" />
          <FormInput name="phone" label="Phone" type="tel" />
        </FormGroup>
      </Form>,
    )
    const group = screen.getByRole("group")
    const grid = group.querySelector(".grid")
    expect(grid?.className).toContain("grid-cols-1")
    expect(grid?.className).toContain("md:grid-cols-2")
    expect(grid?.className).toContain("lg:grid-cols-3")
    expect(screen.getByText("Contact")).toBeInTheDocument()
  })
})

describe("zod-shaped schema validation", () => {
  const fakeZod: SafeParseSchema = {
    safeParse(data) {
      const name = (data as { name?: string }).name ?? ""
      if (name.length < 3) {
        return {
          success: false,
          error: { issues: [{ path: ["name"], message: "Name must be at least 3 characters." }] },
        }
      }
      return { success: true, data }
    },
  }

  it("maps schema issues onto fields on submit", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <Form id="z" schema={fakeZod} initialValues={{ name: "abc" }} onSubmit={onSubmit}>
        <FormInput name="name" label="Name" />
        <FormButton form="z" action="submit">Submit</FormButton>
      </Form>,
    )
    // make the value short so the field has content but the schema rejects it
    await user.clear(screen.getByLabelText(/Name/))
    await user.type(screen.getByLabelText(/Name/), "ab")
    await user.click(screen.getByTestId("form-button-z-submit"))
    expect(await screen.findByRole("alert")).toHaveTextContent("Name must be at least 3 characters.")
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
