import type { ReactNode } from "react"

/**
 * A validator shaped like zod's schema. Structurally typed so any version
 * of zod (or anything with the same safeParse shape) works without this
 * package depending on it.
 */
export interface SafeParseSchema<T = Record<string, unknown>> {
  safeParse(data: unknown): { success: boolean; data?: T | unknown; error?: { issues: ReadonlyArray<{ path: ReadonlyArray<string | number | symbol>; message: string }> } }
}

export interface FormFieldRule {
  label: string
  required?: boolean
  validate?: (value: unknown, values: Record<string, unknown>) => string | null
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  patternMessage?: string
}

export interface FormSnapshot {
  isValid: boolean
  isDirty: boolean
  errorCount: number
  values: Record<string, unknown>
}

export interface FormApi {
  readonly id: string
  submit(): Promise<boolean>
  reset(): void
  clear(): void
  setField(name: string, value: unknown): void
  getValue(name: string): unknown
  getState(): FormSnapshot
  subscribe(listener: (snapshot: FormSnapshot) => void): () => void
}

export interface FormGroupColumns {
  base?: 1 | 2 | 3 | 4
  sm?: 1 | 2 | 3 | 4
  md?: 1 | 2 | 3 | 4
  lg?: 1 | 2 | 3 | 4
}

export interface FormMessage {
  message: ReactNode
  type?: "info" | "warning" | "success"
}
