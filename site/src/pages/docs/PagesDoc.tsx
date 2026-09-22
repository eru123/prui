import * as React from "react"
import { MemoryRouter } from "react-router-dom"
import { LoginPage, RegisterPage, NotFoundPage, ErrorPage } from "prui/pages"
import { MetaOnly } from "../../components/Playground"
import { loginPagePropsMeta, registerPagePropsMeta } from "prui/pages"
import { TocRail } from "../../components/TocRail"
import { IframePortal } from "../../components/IframePortal"

/** Pre-made pages catalog: live demos of the shipped page set. */

const PAGES_TOC = [
  { id: "pages-login", label: "LoginPage" },
  { id: "pages-register", label: "RegisterPage" },
  { id: "pages-utility", label: "Utility pages" },
  { id: "pages-auto", label: "Auto-routing" },
]

function Frame({ height, children }: { height: number; children: React.ReactNode }) {
  return (
    <IframePortal title="Page demo" height={height}>
      {(doc) => {
        doc.documentElement.classList.add("prui-root", "prui-theme-control", "prui-mode-dark")
        doc.body.style.margin = "0"
        doc.body.style.background = "var(--prui-background)"
        return <MemoryRouter initialEntries={["/"]}>{children}</MemoryRouter>
      }}
    </IframePortal>
  )
}

export function PagesDoc() {
  const [remember, setRemember] = React.useState(true)
  const [oauth, setOauth] = React.useState(true)
  return (
    <div className="mx-auto flex w-full max-w-site justify-center gap-6 px-4 pb-20 pt-8 md:px-6">
      <div className="min-w-0 max-w-content flex-1">
        <div className="mb-2 font-mono text-xs text-[var(--prui-dim)]">components / pages</div>
        <h1 className="mb-1.5 text-title font-bold tracking-tight text-[var(--prui-fg)]">Pre-made pages</h1>
        <p className="mb-8 max-w-read text-lede text-[var(--prui-dim)]">
          Production auth and utility pages, importable from{" "}
          <code className="rounded bg-[var(--prui-raise)] px-1">@skiddph/prui/pages</code> or auto-routed by{" "}
          <code className="rounded bg-[var(--prui-raise)] px-1">{'<App pages="auth">'}</code>. Every page takes{" "}
          <code className="rounded bg-[var(--prui-raise)] px-1">onSubmit</code>,{" "}
          <code className="rounded bg-[var(--prui-raise)] px-1">fields</code> (per-field show/hide),{" "}
          <code className="rounded bg-[var(--prui-raise)] px-1">links</code>,{" "}
          <code className="rounded bg-[var(--prui-raise)] px-1">oauth</code> and{" "}
          <code className="rounded bg-[var(--prui-raise)] px-1">brand</code>.
        </p>

        <section id="pages-login" className="mb-10 scroll-mt-20">
          <h2 className="mb-3 font-mono text-sm font-semibold text-[var(--prui-brand)]">LoginPage</h2>
          <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-[var(--prui-dim)]">
            <label className="flex items-center gap-1.5">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> remember-me field
            </label>
            <label className="flex items-center gap-1.5">
              <input type="checkbox" checked={oauth} onChange={(e) => setOauth(e.target.checked)} /> oauth buttons
            </label>
          </div>
          <div className="overflow-hidden rounded-[var(--prui-radius)] border border-[var(--prui-line)]">
            <Frame height={430}>
              <LoginPage
                fields={{ remember }}
                oauth={oauth ? [{ id: "google", label: "Google" }, { id: "github", label: "GitHub" }] : undefined}
                brand={{ name: "HRLabs" }}
                onSubmit={async () => {}}
              />
            </Frame>
          </div>
          <div className="mt-3">
            <MetaOnly meta={loginPagePropsMeta} />
          </div>
        </section>

        <section id="pages-register" className="mb-10 scroll-mt-20">
          <h2 className="mb-3 font-mono text-sm font-semibold text-[var(--prui-brand)]">RegisterPage</h2>
          <div className="overflow-hidden rounded-[var(--prui-radius)] border border-[var(--prui-line)]">
            <Frame height={480}>
              <RegisterPage oauth={[{ id: "google", label: "Google" }]} brand={{ name: "HRLabs" }} onSubmit={async () => {}} />
            </Frame>
          </div>
          <div className="mt-3">
            <MetaOnly meta={registerPagePropsMeta} />
          </div>
        </section>

        <section id="pages-utility" className="mb-10 scroll-mt-20">
          <h2 className="mb-3 font-mono text-sm font-semibold text-[var(--prui-brand)]">Utility pages</h2>
          <p className="mb-3 text-sm text-[var(--prui-dim)]">
            Also shipped: ForgotPasswordPage, ResetPasswordPage, OtpPage, LogoutPage, ProfilePage, SettingsPage,
            AdminSetup, plus the status pages below.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="overflow-hidden rounded-[var(--prui-radius)] border border-[var(--prui-line)]">
              <Frame height={280}>
                <NotFoundPage />
              </Frame>
            </div>
            <div className="overflow-hidden rounded-[var(--prui-radius)] border border-[var(--prui-line)]">
              <Frame height={280}>
                <ErrorPage />
              </Frame>
            </div>
          </div>
        </section>

        <section id="pages-auto" className="mb-10 scroll-mt-20">
          <h2 className="mb-3 font-mono text-sm font-semibold text-[var(--prui-brand)]">Auto-routing</h2>
          <p className="mb-3 text-sm text-[var(--prui-dim)]">
            <code className="rounded bg-[var(--prui-raise)] px-1">{'<App pages="auth">'}</code> wires the whole set with
            zero route code; <code className="rounded bg-[var(--prui-raise)] px-1">pagesConfig</code> passes per-page props.
          </p>
          <pre className="overflow-x-auto rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-surface)] px-4 py-3 font-mono text-xs leading-relaxed text-[var(--prui-fg)]">{`<App
  pages="auth"
  pagesConfig={{ login: { fields: { remember: true } } }}
  brand={{ name: 'HRLabs' }}
  nav={nav}
>
  {routes}
</App>`}</pre>
        </section>
      </div>

      <TocRail items={PAGES_TOC} />
    </div>
  )
}
