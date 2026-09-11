import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  OtpPage,
  LogoutPage,
  NotFoundPage,
  ErrorPage,
  EmptyState,
  ProfilePage,
  SettingsPage,
  AdminSetup,
} from "./index"
import { applyTheme, readPersistedTheme, PRUI_THEMES, nextTheme } from "../theme"

/* ---------------- field show/hide matrix ---------------- */

describe("LoginPage field matrix", () => {
  it("shows email and password, hides remember by default", () => {
    render(<LoginPage />)
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Password/)).toBeInTheDocument()
    expect(screen.queryByTestId("login-remember")).toBeNull()
  })

  it("fields={{ remember: true }} renders the remember-me input", () => {
    render(<LoginPage fields={{ remember: true }} />)
    expect(screen.getByTestId("login-remember")).toBeInTheDocument()
  })

  it("fields={{ password: false }} hides the password input", () => {
    render(<LoginPage fields={{ password: false }} />)
    expect(screen.queryByLabelText(/Password/)).toBeNull()
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument()
  })

  it("fields={{ email: false }} hides the email input", () => {
    render(<LoginPage fields={{ email: false }} />)
    expect(screen.queryByLabelText(/Email/)).toBeNull()
    expect(screen.getByLabelText(/Password/)).toBeInTheDocument()
  })

  it("submit wiring: passes values and remember to onSubmit", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<LoginPage onSubmit={onSubmit} fields={{ remember: true }} />)
    await user.type(screen.getByLabelText(/Email/), "a@b.c")
    await user.type(screen.getByLabelText(/Password/), "secret")
    await user.click(screen.getByTestId("login-submit"))
    expect(onSubmit).toHaveBeenCalledWith({ email: "a@b.c", password: "secret", remember: "false" })
  })

  it("error and loading states render", () => {
    const { rerender } = render(<LoginPage error="Invalid credentials" />)
    expect(screen.getByTestId("page-error")).toHaveTextContent("Invalid credentials")
    rerender(<LoginPage loading />)
    expect(screen.getByTestId("login-submit")).toBeDisabled()
    rerender(<LoginPage />)
    expect(screen.getByTestId("login-submit")).toBeEnabled()
  })

  it("links: register and forgot render as anchors", () => {
    render(
      <LoginPage
        links={{
          forgot: { label: "Forgot?", href: "/forgot" },
          register: { label: "Sign up", href: "/register" },
        }}
      />,
    )
    expect(screen.getByRole("link", { name: "Forgot?" })).toHaveAttribute("href", "/forgot")
    expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute("href", "/register")
  })

  it("links:false hides both links", () => {
    render(<LoginPage links={{ forgot: false, register: false }} />)
    expect(screen.queryByRole("link")).toBeNull()
  })

  it("oauth providers render when provided, absent otherwise", () => {
    const { rerender } = render(<LoginPage />)
    expect(screen.queryByTestId("oauth-providers")).toBeNull()
    rerender(<LoginPage oauth={[{ id: "google", label: "Google" }]} />)
    expect(screen.getByTestId("oauth-providers")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Google/ })).toBeInTheDocument()
  })

  it("brand renders name and mark", () => {
    render(<LoginPage brand={{ name: "Acme", mark: "/logo.svg" }} />)
    expect(screen.getByTestId("page-brand")).toHaveTextContent("Acme")
    expect(screen.getByTestId("page-brand").querySelector("img")).toHaveAttribute("src", "/logo.svg")
  })
})

describe("RegisterPage field matrix", () => {
  it("shows name, email, password; no confirm by default", () => {
    render(<RegisterPage />)
    expect(screen.getByLabelText(/Name/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Password/)).toBeInTheDocument()
    expect(screen.queryByTestId("register-confirm")).toBeNull()
  })

  it("fields={{ confirm: true }} adds confirm password", () => {
    render(<RegisterPage fields={{ confirm: true }} />)
    expect(screen.getByTestId("register-confirm")).toBeInTheDocument()
  })

  it("fields={{ name: false, email: false }} hides those fields", () => {
    render(<RegisterPage fields={{ name: false, email: false }} />)
    expect(screen.queryByLabelText(/Name/)).toBeNull()
    expect(screen.queryByLabelText(/Email/)).toBeNull()
    expect(screen.getByLabelText(/Password/)).toBeInTheDocument()
  })

  it("submit wiring includes confirm when shown", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<RegisterPage onSubmit={onSubmit} fields={{ confirm: true }} />)
    await user.type(screen.getByLabelText(/Name/), "Ada")
    await user.type(screen.getByLabelText(/Email/), "a@b.c")
    await user.type(screen.getByLabelText(/Password/), "pw")
    await user.type(screen.getByTestId("register-confirm").querySelector("input")!, "pw")
    await user.click(screen.getByTestId("register-submit"))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: "Ada", confirm: "pw" }))
  })

  it("login link renders", () => {
    render(<RegisterPage links={{ login: { label: "Sign in", href: "/login" } }} />)
    expect(screen.getByTestId("register-login-link")).toBeInTheDocument()
  })
})

describe("ResetPasswordPage field matrix", () => {
  it("shows both password fields by default", () => {
    render(<ResetPasswordPage />)
    expect(screen.getByLabelText(/New password/)).toBeInTheDocument()
    expect(screen.getByTestId("reset-confirm")).toBeInTheDocument()
  })

  it("fields={{ confirm: false }} hides confirm", () => {
    render(<ResetPasswordPage fields={{ confirm: false }} />)
    expect(screen.queryByTestId("reset-confirm")).toBeNull()
  })

  it("submit wiring", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ResetPasswordPage onSubmit={onSubmit} />)
    await user.type(screen.getByLabelText(/New password/), "newpw")
    await user.type(screen.getByTestId("reset-confirm").querySelector("input")!, "newpw")
    await user.click(screen.getByTestId("reset-submit"))
    expect(onSubmit).toHaveBeenCalledWith({ password: "newpw", confirm: "newpw" })
  })
})

describe("ForgotPasswordPage", () => {
  it("renders email field and submits", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ForgotPasswordPage onSubmit={onSubmit} />)
    await user.type(screen.getByLabelText(/Email/), "a@b.c")
    await user.click(screen.getByTestId("forgot-submit"))
    expect(onSubmit).toHaveBeenCalledWith({ email: "a@b.c" })
  })

  it("sent state replaces the form", () => {
    render(<ForgotPasswordPage sent />)
    expect(screen.getByTestId("forgot-sent")).toBeInTheDocument()
    expect(screen.queryByTestId("forgot-form")).toBeNull()
  })
})

describe("OtpPage", () => {
  it("renders the configured number of digit inputs", () => {
    render(<OtpPage length={4} />)
    const inputs = screen.getByRole("group", { name: "Verification code" }).querySelectorAll("input")
    expect(inputs.length).toBe(4)
  })

  it("types digits, moves focus, and submits the joined code", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<OtpPage onSubmit={onSubmit} length={4} />)
    const inputs = screen.getByRole("group", { name: "Verification code" }).querySelectorAll("input")
    await user.type(inputs[0]!, "1234")
    await user.click(screen.getByTestId("otp-submit"))
    expect(onSubmit).toHaveBeenCalledWith("1234")
  })

  it("error state renders", () => {
    render(<OtpPage error="Wrong code" />)
    expect(screen.getByTestId("page-error")).toHaveTextContent("Wrong code")
  })
})

describe("LogoutPage", () => {
  it("calls onLogout once on mount and shows the signed-out message", () => {
    const onLogout = vi.fn()
    render(<LogoutPage onLogout={onLogout} />)
    expect(onLogout).toHaveBeenCalledOnce()
    expect(screen.getByTestId("logout-page")).toBeInTheDocument()
  })
})

describe("NotFoundPage / ErrorPage / EmptyState", () => {
  it("404 shows code and home link", () => {
    render(<NotFoundPage />)
    expect(screen.getByTestId("notfound-page")).toHaveTextContent("404")
    expect(screen.getByTestId("notfound-home")).toBeInTheDocument()
  })

  it("ErrorPage shows message and retry", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    render(<ErrorPage error="disk on fire" onRetry={onRetry} />)
    expect(screen.getByRole("alert")).toHaveTextContent("disk on fire")
    await user.click(screen.getByTestId("error-retry"))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it("EmptyState shows title, description, action", () => {
    render(<EmptyState title="No projects" description="Create one" action={<button>New</button>} />)
    expect(screen.getByTestId("empty-state")).toHaveTextContent("No projects")
    expect(screen.getByRole("button", { name: "New" })).toBeInTheDocument()
  })
})

describe("ProfilePage / SettingsPage / AdminSetup", () => {
  it("ProfilePage field matrix: all shown by default, hide bio", async () => {
    const { rerender } = render(<ProfilePage profile={{ name: "Ada", email: "a@b.c" }} />)
    expect(screen.getByLabelText(/Name/)).toHaveValue("Ada")
    expect(screen.getByLabelText(/Email/)).toHaveValue("a@b.c")
    expect(screen.getByLabelText(/Bio/)).toBeInTheDocument()
    rerender(<ProfilePage fields={{ bio: false }} />)
    expect(screen.queryByLabelText(/Bio/)).toBeNull()
  })

  it("ProfilePage submits edited values", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ProfilePage onSubmit={onSubmit} profile={{ name: "Ada" }} />)
    await user.clear(screen.getByLabelText(/Name/))
    await user.type(screen.getByLabelText(/Name/), "Ada L")
    await user.click(screen.getByTestId("profile-submit"))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: "Ada L" }))
  })

  it("SettingsPage renders toggles that flip", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <SettingsPage
        toggles={[{ id: "notifications", label: "Notifications", description: "Email alerts", onChange }]}
      />,
    )
    expect(screen.getByTestId("settings-page")).toHaveTextContent("1 setting")
    await user.click(screen.getByRole("switch", { name: "Notifications" }))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it("AdminSetup submits name, email, password", async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<AdminSetup onSubmit={onSubmit} />)
    await user.type(screen.getByLabelText(/Name/), "Root")
    await user.type(screen.getByLabelText(/Email/), "root@x.y")
    await user.type(screen.getByLabelText(/Password/), "pw")
    await user.click(screen.getByTestId("adminsetup-submit"))
    expect(onSubmit).toHaveBeenCalledWith({ name: "Root", email: "root@x.y", password: "pw" })
  })
})

/* ---------------- theme ---------------- */

describe("theme", () => {
  it("applyTheme sets classes and persists; readPersistedTheme round-trips", () => {
    localStorage.clear()
    const applied = applyTheme({ theme: "ember" })
    expect(applied).toEqual({ theme: "ember", mode: "dark" })
    expect(document.documentElement.classList.contains("prui-theme-ember")).toBe(true)
    expect(document.documentElement.dataset.pruiTheme).toBe("ember")
    expect(readPersistedTheme()).toEqual({ theme: "ember", mode: "dark" })

    applyTheme({ theme: "daylight" })
    expect(document.documentElement.classList.contains("prui-theme-daylight")).toBe(true)
    expect(readPersistedTheme()?.mode).toBe("light")
    expect(document.documentElement.classList.contains("prui-theme-ember")).toBe(false)
  })

  it("storageKey null disables persistence", () => {
    localStorage.clear()
    applyTheme({ theme: "workshop", storageKey: null })
    expect(localStorage.getItem("prui:theme")).toBeNull()
  })

  it("nextTheme cycles the list", () => {
    expect(nextTheme("control")).toBe("workshop")
    expect(nextTheme("daylight")).toBe("control")
    expect(PRUI_THEMES).toEqual(["control", "workshop", "ember", "daylight"])
  })
})
