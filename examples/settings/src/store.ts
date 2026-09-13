import { useCallback, useSyncExternalStore } from "react"

/**
 * localStorage-backed store: the app's entire "backend". Every write updates
 * an in-memory cache (stable snapshot references), mirrors to localStorage,
 * and notifies subscribers; no server anywhere.
 */

const cache = new Map<string, unknown>()
const listeners = new Set<() => void>()
let version = 0

function emit() {
  version++
  listeners.forEach((l) => l())
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

function load<T>(key: string, seed: () => T): T {
  if (cache.has(key)) return cache.get(key) as T
  let value: T
  try {
    const raw = localStorage.getItem(key)
    value = raw ? (JSON.parse(raw) as T) : seed()
  } catch {
    value = seed()
  }
  cache.set(key, value)
  localStorage.setItem(key, JSON.stringify(value))
  return value
}

export function readLocal<T>(key: string, seed: () => T): T {
  return load(key, seed)
}

export function writeLocal<T>(key: string, next: T | ((prev: T) => T), seed: () => T): void {
  const prev = load(key, seed)
  const value = typeof next === "function" ? (next as (p: T) => T)(prev) : next
  cache.set(key, value)
  localStorage.setItem(key, JSON.stringify(value))
  emit()
}

/** Reset one key (or everything) back to its seed. */
export function resetLocal(key?: string): void {
  if (key) {
    cache.delete(key)
    localStorage.removeItem(key)
  } else {
    cache.clear()
    localStorage.clear()
  }
  emit()
}

/** Reactive slice: re-renders on any write, snapshot-stable between writes. */
export function useLocal<T>(key: string, seed: () => T): [T, (next: T | ((prev: T) => T)) => void] {
  useSyncExternalStore(subscribe, () => version)
  const set = useCallback(
    (next: T | ((prev: T) => T)) => writeLocal(key, next, seed),
    // seed is only read on a cache miss; the identity refresh is harmless
    [key, seed],
  )
  return [load(key, seed), set]
}
