# Pre-made pages: auth, utility, and profile screens

Import from `prui/pages`:

```tsx
import { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage, OtpPage, NotFoundPage, ErrorPage, ProfilePage, AdminSetup } from '@skiddph/prui/pages'
```

The set: `LoginPage`, `RegisterPage`, `ForgotPasswordPage`, `ResetPasswordPage`, `OtpPage`, `NotFoundPage`, `ErrorPage`, `ProfilePage`, `AdminSetup`, and more being added over time.

## Page props

Every page shares the same three prop shapes. Pages render their own layout, so they sit outside the `<App>` shell (or inside it as full-width routes); auth pages normally replace the shell entirely.

### `fields`: show/hide inputs

A map of input name to boolean. A field present with `true` renders; present with `false` is hidden; omitted falls back to the page default.

```tsx
// no remember-me input, email and password shown
// `username` is an accepted alias of the email field
<LoginPage fields={{ username: true, remember: false }} />

// remember-me shown (default is hidden, so this is the explicit toggle)
<LoginPage fields={{ remember: true }} />

// register form with the confirm-password field
<RegisterPage fields={{ confirm: true }} />
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
    await api.login(values.email, values.password)
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

Utility routes (`/404`, `/error`, `/profile`, `/settings`, `/admin-setup`) wire with `pages="utility"`, or `pages="auth+utility"` for both sets.

### Customizing auto-routed pages

Auto-routing accepts the same props you would pass by hand, via `pagesConfig` keyed by page name:

```tsx
<App
  pages="auth"
  pagesConfig={{
    login: {
      fields: { username: true, remember: false },
      links: { register: '/register', forgot: '/forgot-password' },
      oauth: ['google', 'github'],
      onSubmit: (values) => api.login(values.email, values.password),
    },
    register: { oauth: ['google'] },
  }}
>
```

## Standalone usage (no auto-route)

Import and route the pages yourself when you want custom paths or a different router mode:

```tsx
import { Routes, Route } from 'react-router-dom'
import { LoginPage, OtpPage } from '@skiddph/prui/pages'
import Dashboard from './routes'

<App brand={{ name: 'HRLabs' }} nav={[...]} pages="auth">
  <Routes>
    <Route path="/" element={<Dashboard />} />
    {/* /login and /otp are already routed by pages="auth" */}
  </Routes>
</App>
```

## Field/link matrix by page

Common toggles per page (defaults in bold; check the rendered output when in doubt):

| Page | `fields` keys | `links` keys | `oauth` |
|---|---|---|---|
| `LoginPage` | **email** (`username` alias), **password**, remember (default hidden) | **register**, **forgot** | supported |
| `RegisterPage` | **name**, **email**, **password**, confirm (default hidden) | **login** | supported |
| `ForgotPasswordPage` | **email** | **login**, **register** | - |
| `ResetPasswordPage` | **password**, **confirm** | **login** | - |
| `OtpPage` | fixed-length code input | - | - |
| `ProfilePage` | **name**, **email**, **bio** | - | - |
| `AdminSetup` | **name**, **email**, **password** (fixed shape) | - | - |

`NotFoundPage` and `ErrorPage` take `title`, `description` and `homeHref`.

Links accept either a plain href string or a `{ label, href }` object; `false` hides the link. OAuth accepts plain provider ids (`'google'`, `'github'`, `'microsoft'`) or `{ id, label, icon? }` objects.

## Verification hooks

When using these pages, extend the [verification.md](verification.md) checklist with: every `fields` toggle actually shows/hides the input, every `links` target route exists, and `oauth` buttons render only when the prop is set.
