import * as React from "react"

/**
 * PRUI internationalization.
 *
 * Every user-facing string PRUI renders comes from a dictionary. The
 * default dictionary is English; apps override it wholesale or per-key via
 * <PruiProvider dictionary={...}> or setPruiDictionary(). Components read
 * strings through usePruiI18n().t("key") so translations need no re-render
 * wiring beyond the provider.
 */

export interface PruiDictionary {
  /* overlays */
  close: string
  closeDialog: string
  cancel: string
  confirm: string
  delete: string
  save: string
  create: string
  edit: string
  loading: string
  /* command palette */
  commandPlaceholder: string
  commandNoMatches: string
  search: string
  /* tables */
  noResults: string
  rowsPerPage: string
  page: string
  nextPage: string
  previousPage: string
  selectAllRows: string
  selectRow: string
  expandRow: string
  collapseRow: string
  yes: string
  no: string
  /* forms */
  requiredField: string
  formErrorTitle: string
  invalidFormat: string
  minLength: string
  maxLength: string
  minNumber: string
  maxNumber: string

  /* resource */
  newEntity: string
  editEntity: string
  searchEntity: string
  deleteConfirmMessage: string
  /* toasts/alerts */
  dismiss: string
  notifications: string
  /* form fields */
  showPassword: string
  hidePassword: string
  removeTag: string
  /* nav */
  mainNavigation: string
  openNavigation: string
  closeNavigation: string
  switchTheme: string
  expandSidebar: string
  collapseSidebar: string
  /* dates & time */
  today: string
  clear: string
  apply: string
  time: string
  hours: string
  minutes: string
  seconds: string
  from: string
  to: string
  /* file upload */
  dropFiles: string
  browseFiles: string
  removeFile: string
  /* pagination misc */
  of: string
}

export const defaultDictionary: PruiDictionary = {
  close: "Close",
  closeDialog: "Close dialog",
  cancel: "Cancel",
  confirm: "Confirm",
  delete: "Delete",
  save: "Save",
  create: "Create",
  edit: "Edit",
  loading: "Loading...",

  commandPlaceholder: "Type a command or search...",
  commandNoMatches: "No matches.",
  search: "Search",

  noResults: "No results.",
  rowsPerPage: "Rows per page",
  page: "Page",
  nextPage: "Next page",
  previousPage: "Previous page",
  selectAllRows: "Select all rows",
  selectRow: "Select row",
  expandRow: "Expand row",
  collapseRow: "Collapse row",
  yes: "Yes",
  no: "No",

  requiredField: "{label} is required.",
  formErrorTitle: "Form error",
  invalidFormat: "{label} has an invalid format.",
  minLength: "{label} must be at least {min} characters.",
  maxLength: "{label} must be at most {max} characters.",
  minNumber: "{label} must be {min} or more.",
  maxNumber: "{label} must be {max} or less.",

  newEntity: "New {name}",
  editEntity: "Edit {name}",
  searchEntity: "Search {name}...",
  deleteConfirmMessage: "This action cannot be undone.",

  dismiss: "Dismiss",
  notifications: "Notifications",

  showPassword: "Show password",
  hidePassword: "Hide password",
  removeTag: "Remove {label}",

  mainNavigation: "Main",
  openNavigation: "Open navigation",
  closeNavigation: "Close navigation",
  switchTheme: "Switch theme",
  expandSidebar: "Expand sidebar",
  collapseSidebar: "Collapse sidebar",

  today: "Today",
  clear: "Clear",
  apply: "Apply",
  time: "Time",
  hours: "Hours",
  minutes: "Minutes",
  seconds: "Seconds",
  from: "From",
  to: "To",

  dropFiles: "Drag files here or click to browse",
  browseFiles: "Browse files",
  removeFile: "Remove file",

  of: "of",
}

type Listener = () => void

let currentDictionary: PruiDictionary = defaultDictionary
const listeners = new Set<Listener>()

function emit(): void {
  for (const l of listeners) l()
}

/**
 * Replace the active PRUI dictionary globally (no React context needed,
 * useful outside components / at startup). Merge partials for per-key
 * overrides.
 */
export function setPruiDictionary(dict: Partial<PruiDictionary>): void {
  currentDictionary = { ...currentDictionary, ...dict }
  emit()
}

/** Reset to the built-in English dictionary. */
export function resetPruiDictionary(): void {
  currentDictionary = defaultDictionary
  emit()
}

/** The active dictionary (readonly snapshot). */
export function getPruiDictionary(): Readonly<PruiDictionary> {
  return currentDictionary
}

const PruiI18nContext = React.createContext<PruiDictionary | null>(null)

/** Provider that scopes a dictionary to a subtree. */
export function PruiProvider({
  dictionary,
  children,
}: {
  dictionary?: Partial<PruiDictionary>
  children?: React.ReactNode
}) {
  // set the global dictionary while mounted so imperative APIs
  // (toast(), confirmModal()) see the same strings
  React.useEffect(() => {
    if (!dictionary) return
    const prev = currentDictionary
    setPruiDictionary(dictionary)
    return () => {
      currentDictionary = prev
      emit()
    }
  }, [dictionary])
  const value = React.useMemo(() => ({ ...currentDictionary, ...dictionary }), [dictionary])
  return <PruiI18nContext.Provider value={value}>{children}</PruiI18nContext.Provider>
}

export interface PruiI18n {
  /** The active dictionary. */
  t: Readonly<PruiDictionary>
}

/** Read the active PRUI dictionary (falls back to the global one). */
export function usePruiI18n(): PruiI18n {
  const ctx = React.useContext(PruiI18nContext)
  const [, force] = React.useReducer((c: number) => c + 1, 0)
  React.useEffect(() => {
    const on = force
    listeners.add(on)
    return () => {
      listeners.delete(on)
    }
  }, [])
  return { t: ctx ?? currentDictionary }
}
