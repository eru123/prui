/**
 * Shared list/menus keyboard navigation helpers.
 *
 * Pure index math plus a typeahead buffer, reused by Dropdown, Select,
 * CommandPalette, the nav rail flyout, Combobox and any roving-tabIndex
 * list. No DOM assumptions: callers own focus and rendering.
 */

/** Next index for ArrowUp/ArrowDown (and Left/Right in horizontal lists). */
export function moveIndex(
  current: number,
  delta: 1 | -1,
  length: number,
  opts: { loop?: boolean; enabled?: (index: number) => boolean } = {},
): number {
  if (length <= 0) return -1
  const { loop = true, enabled } = opts
  if (current < 0) {
    // nothing active: enter from the edge the arrow came from
    return delta > 0 ? firstEnabled(0, 1, length, enabled) : firstEnabled(length - 1, -1, length, enabled)
  }
  let next = current
  for (let step = 0; step < length; step++) {
    next = next + delta
    if (next >= length || next < 0) {
      if (!loop) return current
      next = next < 0 ? length - 1 : 0
    }
    if (!enabled || enabled(next)) return next
  }
  return current
}

function firstEnabled(start: number, dir: 1 | -1, length: number, enabled?: (i: number) => boolean): number {
  for (let i = start; i >= 0 && i < length; i += dir) {
    if (!enabled || enabled(i)) return i
  }
  return -1
}

/** Home / End clamps. */
export function homeIndex(length: number, enabled?: (i: number) => boolean): number {
  return firstEnabled(0, 1, length, enabled)
}

export function endIndex(length: number, enabled?: (i: number) => boolean): number {
  return firstEnabled(length - 1, -1, length, enabled)
}

/**
 * Typeahead: given the item labels, find the next item whose label starts
 * with the accumulated prefix (searching forward from the active item,
 * wrapping). Case-insensitive; resets after `resetMs` of inactivity.
 */
export function typeaheadIndex(
  labels: () => string[],
  state: { buffer: string; at: number },
  key: string,
  activeIndex: number,
  resetMs = 500,
): { index: number; buffer: string } {
  // printable single char only
  if (key.length !== 1) return { index: activeIndex, buffer: state.buffer }
  const now = Date.now()
  const fresh = now - state.at < resetMs
  const buffer = fresh ? state.buffer + key.toLowerCase() : key.toLowerCase()
  state.buffer = buffer
  state.at = now

  const items = labels().map((l) => l.trim().toLowerCase())
  // prefer a full-prefix match starting after the active item (wraps)
  for (let offset = 1; offset <= items.length; offset++) {
    const i = (activeIndex + offset) % items.length
    if (items[i]?.startsWith(buffer)) return { index: i, buffer }
  }
  // single new char: allow jumping to a different starting letter
  if (buffer.length > 1) {
    const ch = buffer[buffer.length - 1]!
    for (let offset = 1; offset <= items.length; offset++) {
      const i = (activeIndex + offset) % items.length
      if (items[i]?.startsWith(ch)) return { index: i, buffer }
    }
  }
  return { index: activeIndex, buffer }
}
