export * from "./core"
export * from "./data-table"
export * from "./app"
export * from "./pages"
export * from "./theme"
export {
  PruiProvider,
  usePruiI18n,
  setPruiDictionary,
  resetPruiDictionary,
  getPruiDictionary,
  defaultDictionary,
  type PruiDictionary,
} from "./i18n"
// The forms module's <Form> intentionally stays on @skiddph/prui/forms:
// the app layer already exports a schema-driven Form.
export {
  FormGroup,
  FormInput,
  FormButton,
  useFormApi,
  registerForm,
  getFormApi,
  formGroupPropsMeta,
  formInputPropsMeta,
  formButtonPropsMeta,
  type FormGroupProps,
  type FormInputProps,
  type FormButtonProps,
  type SafeParseSchema,
} from "./forms"
