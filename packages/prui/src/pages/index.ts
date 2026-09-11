/** PRUI pre-made page components. */
export {
  LoginPage,
  loginPagePropsMeta,
  type LoginPageProps,
  type LoginLinks,
} from "./login"

export {
  RegisterPage,
  registerPagePropsMeta,
  type RegisterPageProps,
} from "./register"

export {
  ForgotPasswordPage,
  forgotPasswordPagePropsMeta,
  type ForgotPasswordPageProps,
} from "./forgot-password"

export {
  ResetPasswordPage,
  resetPasswordPagePropsMeta,
  type ResetPasswordPageProps,
} from "./reset-password"

export {
  OtpPage,
  otpPagePropsMeta,
  type OtpPageProps,
} from "./otp"

export {
  LogoutPage,
  logoutPagePropsMeta,
  type LogoutPageProps,
} from "./logout"

export {
  NotFoundPage,
  notFoundPagePropsMeta,
  ErrorPage,
  errorPagePropsMeta,
  EmptyState,
  emptyStatePropsMeta,
  type NotFoundPageProps,
  type ErrorPageProps,
  type EmptyStateProps,
} from "./status"

export {
  ProfilePage,
  profilePagePropsMeta,
  SettingsPage,
  settingsPagePropsMeta,
  AdminSetup,
  adminSetupPropsMeta,
  type ProfilePageProps,
  type SettingsPageProps,
  type SettingsToggle,
  type AdminSetupProps,
} from "./profile-settings"

export type {
  PageField,
  PageLink,
  OAuthProvider,
  PageSubmitState,
} from "./shared"

/* ---------------- PagesRegistry (for <App pages="..."> auto-routing) ---------------- */

import type { ComponentType } from "react"
import type { PageSetName } from "../app/auto-pages"
import { LoginPage } from "./login"
import { RegisterPage } from "./register"
import { ForgotPasswordPage } from "./forgot-password"
import { ResetPasswordPage } from "./reset-password"
import { OtpPage } from "./otp"
import { LogoutPage } from "./logout"
import { NotFoundPage, ErrorPage } from "./status"
import { ProfilePage, SettingsPage, AdminSetup } from "./profile-settings"

/**
 * Registry of pre-made pages keyed by PageSetName; consumed by AutoPages.
 * Assembled here (not in app/) so the app layer never statically imports
 * the pages bundle.
 */
export const PagesRegistry: Record<PageSetName, ComponentType<Record<string, unknown>>> = {
  login: LoginPage as never,
  register: RegisterPage as never,
  forgotPassword: ForgotPasswordPage as never,
  resetPassword: ResetPasswordPage as never,
  otp: OtpPage as never,
  logout: LogoutPage as never,
  notFound: NotFoundPage as never,
  error: ErrorPage as never,
  profile: ProfilePage as never,
  settings: SettingsPage as never,
  adminSetup: AdminSetup as never,
}
