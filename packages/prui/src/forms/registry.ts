import type { FormApi } from "./types"

/**
 * Module-level registry: forms register under an id and buttons (anywhere
 * in the tree, including modal footers that are siblings of the form) can
 * resolve them. This is what lets a submit button live outside the
 * <form> element and still drive it.
 */

const registry = new Map<string, FormApi>()

export function registerForm(api: FormApi): () => void {
  registry.set(api.id, api)
  return () => {
    if (registry.get(api.id) === api) registry.delete(api.id)
  }
}

export function getFormApi(id: string): FormApi | undefined {
  return registry.get(id)
}

export function formIds(): string[] {
  return [...registry.keys()]
}
