/** Higher-order forms: config-driven inputs, responsive groups, zod-optional
 * validation, and buttons that drive a form from outside its scope. */
export {
  Form,
  FormGroup,
  FormInput,
  FormButton,
  formPropsMeta,
  formGroupPropsMeta,
  formInputPropsMeta,
  formButtonPropsMeta,
  type FormProps,
  type FormGroupProps,
  type FormInputProps,
  type FormButtonProps,
} from "./form"

export {
  registerForm,
  getFormApi,
  formIds,
} from "./registry"

import { getFormApi } from "./registry"
import type { FormApi } from "./types"

/** Resolve a mounted form's API by id: submit, reset, clear, read state. */
export function useFormApi(id: string): FormApi | undefined {
  return getFormApi(id)
}

export type {
  SafeParseSchema,
  FormFieldRule,
  FormSnapshot,
  FormApi,
  FormGroupColumns,
  FormMessage,
} from "./types"
