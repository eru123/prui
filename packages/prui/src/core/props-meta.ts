/**
 * Prop metadata system.
 * Every PRUI component exports a propsMeta declaration describing its props,
 * types, defaults, and control hints. This is the single source that drives
 * docs tables, playground controls, and generated snippets later.
 */

export type PropControl =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "select"
  | "multiselect"
  | "color"
  | "date"
  | "daterange"
  | "icon"
  | "object"
  | "none"

export interface PropMeta {
  /** Prop name as written in JSX. */
  name: string
  /** Human-readable type label, e.g. "'primary' | 'default'". */
  type: string
  /** Default value rendered into snippets; null when required. */
  default: string | number | boolean | null
  /** Control hint for the playground. "none" hides the control. */
  control: PropControl
  /** Options for select/multiselect controls. */
  options?: readonly string[]
  /** Short description for docs tables. */
  description?: string
}

export interface PropsMeta {
  /** Component name, e.g. "Button". */
  name: string
  props: readonly PropMeta[]
}
