# Pre-made pages: auth, utility, and profile screens

Import from `prui/pages`:

```tsx
import { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage, OtpPage, NotFoundPage, ErrorPage, ProfilePage, AdminSetup } from 'prui/pages'
```

The set: `LoginPage`, `RegisterPage`, `ForgotPasswordPage`, `ResetPasswordPage`, `OtpPage`, `NotFoundPage`, `ErrorPage`, `ProfilePage`, `AdminSetup`, and more being added over time.

## Page props

Every page shares the same three prop shapes. Pages render their own layout, so they sit outside the `<App>` shell (or inside it as full-width routes); auth pages normally replace the shell entirely.

### `fields`: show/hide inputs

A map of input name to boolean. A field present with `true` renders; present with `false` is hidden; omitted falls back to the page default.

```tsx
// no remember-me input, password field shown
<LoginPage fields={{ username: true, remember: false }} />

// remember-me shown (default is true, so this is redundant but explicit)
<LoginPage fields={{ remember: true }} />

// register form without the company input
<RegisterPage fields={{ company: false }} />
```

### `links`: control navigation links

A map of link id to target href. Set a link to `false` to hide it.

```tsx
<LoginPage
  fields={{ username: true, remember: false }}
  links={{ register: '/register', forgot: '/forgot-password' }}
/>

// hide the forgot-password link
<LoginPage links={{ forgot: false }} />
```

### `oauth`: social login buttons

An array of provider ids. Omit the prop for no social buttons.

```tsx
<LoginPage oauth={['google', 'github']} />

// the register page supports it too
<RegisterPage oauth={['google']} />
```

## Submit wiring

Each auth page accepts `onSubmit`, called with the form values after validation:

```tsx
<LoginPage
  onSubmit={async (values) => {
    await api.login(values.username, values.password)
  }}
/>
```

Loading and error states are built in: `onSubmit` returning a rejected promise surfaces the error message on the form.

## Auto-routing with `App pages="auth"`

`<App>` can generate routes for the pre-made page set for you. Set `pages="auth"` and `<App>` wires the standard auth routes:

```tsx
<App
  brand={{ name: 'HRLabs' }}
  nav={[...]}
  pages="auth"
>
  <Routes>
    <Route path="/" element={<Dashboard />} />
  </Routes>
</App>
```

What `pages="auth"` generates:

| Route | Page |
|---|---|
| `/login` | `LoginPage` |
| `/register` | `RegisterPage` |
| `/forgot-password` | `ForgotPasswordPage` |
| `/reset-password` | `ResetPasswordPage` |
| `/otp` | `OtpPage` |

Utility pages (`404`, error) are always wired by `<App>` automatically; you do not need `pages` for them.

### Customizing auto-routed pages

Auto-routing accepts the same props you would pass by hand, via a config object:

```tsx
<App
  pages={{
    auth: {
      login: {
        fields: { username: true, remember: false },
        links: { register: '/register', forgot: '/forgot-password' },
        oauth: ['google', 'github'],
        onSubmit: (values) => api.login(values.username, values.password),
      },
      register: { oauth: ['google'] },
    },
  }}
>
```

## Standalone usage (no auto-route)

Import and route the pages yourself when you want custom paths or a different router mode:

```tsx
import { App } from 'prui/app'
import { Routes, Route } from 'react-router-dom'
import { LoginPage, OtpPage, Dashboard } from './routes'

<App brand={{ name: 'HRLabs' }} nav={[...]} router="memory">
  <Routes>
    <Route path="/login" element={<LoginPage fields={{ remember: false }} oauth={['google']} />} />
    <Route path="/otp" element={<OtpPage />} />
    <Route path="/" element={<Dashboard />} />
  </Routes>
</App>
```

## Field/link matrix by page

Common toggles per page (defaults in bold; check the rendered output when in doubt):

| Page | `fields` keys | `links` keys | `oauth` |
|---|---|---|---|
| `LoginPage` | **username**, **password**, **remember** | **register**, **forgot** | supported |
| `RegisterPage` | **name**, **email**, **password**, **company** | **login** | supported |
| `ForgotPasswordPage` | **email** | **login** | - |
| `ResetPasswordPage` | **password**, **confirm** | **login** | - |
| `OtpPage` | **code** | - | - |
| `ProfilePage` | **name**, **email**, **avatar** | - | - |
| `AdminSetup` | **name**, **email**, **password** | - | - |

`NotFoundPage` and `ErrorPage` take no config props beyond optional `message`.

## Verification hooks

When using these pages, extend the [verification.md](verification.md) checklist with: every `fields` toggle actually shows/hides the input, every `links` target route exists, and `oauth` buttons render only when the prop is set.
