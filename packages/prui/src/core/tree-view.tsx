import * as React from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "./cn"
import type { PropsMeta } from "./props-meta"

/**
 * TreeView: nested expandable nodes (files/folders, categories). Full tree
 * keyboard pattern: ArrowUp/Down move between visible nodes, ArrowRight
 * expands (or moves into), ArrowLeft collapses (or moves to parent),
 * Home/End jump. aria-level/aria-expanded/role=tree/treeitem carry the
 * structure to assistive tech.
 */

export interface TreeViewItem {
  id: string
  label: React.ReactNode
  children?: TreeViewItem[]
  /** Render as a leaf action (no expander). Default: has children. */
  disabled?: boolean
  /** Extra data passed back on events. */
  meta?: unknown
}

export interface TreeViewProps {
  items: TreeViewItem[]
  /** Expanded node ids (controlled). */
  expanded?: string[]
  defaultExpanded?: string[]
  onExpandedChange?: (ids: string[]) => void
  /** Selected node id (controlled). */
  selected?: string
  defaultSelected?: string
  onSelect?: (id: string, item: TreeViewItem) => void
  /** Accessible label for the tree landmark. */
  ariaLabel?: string
  className?: string
}

interface FlatNode {
  item: TreeViewItem
  level: number
  hasChildren: boolean
  parentIds: string[]
}

export const TreeView = React.forwardRef<HTMLUListElement, TreeViewProps>(function TreeView(
  { items, expanded: expandedProp, defaultExpanded = [], onExpandedChange, selected: selectedProp, defaultSelected, onSelect, ariaLabel, className },
  ref,
) {
  const [uncontrolledExpanded, setUncontrolledExpanded] = React.useState<string[]>(defaultExpanded)
  const [uncontrolledSelected, setUncontrolledSelected] = React.useState<string | undefined>(defaultSelected)
  const expandedControlled = expandedProp !== undefined
  const expanded = expandedControlled ? expandedProp : uncontrolledExpanded
  const selectedControlled = selectedProp !== undefined
  const selected = selectedControlled ? selectedProp : uncontrolledSelected
  const itemRefs = React.useRef(new Map<string, HTMLButtonElement>())

  const setExpanded = (ids: string[]) => {
    if (!expandedControlled) setUncontrolledExpanded(ids)
    onExpandedChange?.(ids)
  }

  const toggle = (id: string) => {
    setExpanded(expanded.includes(id) ? expanded.filter((x) => x !== id) : [...expanded, id])
  }

  const select = (node: FlatNode) => {
    if (node.item.disabled) return
    if (!selectedControlled) setUncontrolledSelected(node.item.id)
    onSelect?.(node.item.id, node.item)
  }

  // flatten to visible rows
  const flat: FlatNode[] = []
  const walk = (list: TreeViewItem[], level: number, parentIds: string[], visible: boolean) => {
    for (const item of list) {
      if (!visible) continue
      const hasChildren = !!item.children?.length
      const node: FlatNode = { item, level, hasChildren, parentIds }
      flat.push(node)
      if (hasChildren && expanded.includes(item.id)) {
        walk(item.children!, level + 1, [...parentIds, item.id], visible && expanded.includes(item.id))
      }
    }
  }
  walk(items, 1, [], true)

  const focusNode = (id: string) => {
    itemRefs.current.get(id)?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent, node: FlatNode) => {
    const idx = flat.findIndex((n) => n.item.id === node.item.id)
    switch (e.key) {
      case "ArrowDown":
        if (idx < flat.length - 1) {
          e.preventDefault()
          focusNode(flat[idx + 1]!.item.id)
        }
        break
      case "ArrowUp":
        if (idx > 0) {
          e.preventDefault()
          focusNode(flat[idx - 1]!.item.id)
        }
        break
      case "ArrowRight":
        e.preventDefault()
        if (node.hasChildren && !expanded.includes(node.item.id)) toggle(node.item.id)
        else if (node.hasChildren) {
          const child = flat.find((n) => n.parentIds[n.parentIds.length - 1] === node.item.id)
          if (child) focusNode(child.item.id)
        }
        break
      case "ArrowLeft":
        e.preventDefault()
        if (node.hasChildren && expanded.includes(node.item.id)) toggle(node.item.id)
        else {
          const parentId = node.parentIds[node.parentIds.length - 1]
          if (parentId) focusNode(parentId)
        }
        break
      case "Home":
        if (flat.length) {
          e.preventDefault()
          focusNode(flat[0]!.item.id)
        }
        break
      case "End":
        if (flat.length) {
          e.preventDefault()
          focusNode(flat[flat.length - 1]!.item.id)
        }
        break
      case "Enter":
      case " ":
        e.preventDefault()
        select(node)
        break
    }
  }

  return (
    <ul
      ref={ref}
      role="tree"
      aria-label={ariaLabel}
      className={cn("prui-tree-view flex flex-col gap-0.5 text-sm", className)}
    >
      {flat.map((node) => {
        const isOpen = expanded.includes(node.item.id)
        const isSelected = selected === node.item.id
        return (
          <li
            key={node.item.id}
            role="treeitem"
            aria-level={node.level}
            aria-expanded={node.hasChildren ? isOpen : undefined}
            aria-selected={isSelected}
            aria-disabled={node.item.disabled || undefined}
            className="rounded-[var(--prui-radius-1)]"
            style={{ paddingInlineStart: `${(node.level - 1) * 16}px` }}
          >
            <button
              type="button"
              ref={(el) => {
                if (el) itemRefs.current.set(node.item.id, el)
                else itemRefs.current.delete(node.item.id)
              }}
              tabIndex={isSelected ? 0 : -1}
              disabled={node.item.disabled}
              data-selected={isSelected || undefined}
              onClick={() => {
                if (node.hasChildren) toggle(node.item.id)
                select(node)
              }}
              onKeyDown={(e) => handleKeyDown(e, node)}
              className={cn(
                "flex w-full cursor-pointer items-center gap-1.5 rounded-[var(--prui-radius-1)] px-2 py-1 text-left outline-none",
                "focus-visible:ring-2 focus-visible:ring-[var(--prui-brand)]",
                isSelected ? "bg-[var(--prui-brand)]/15 text-[var(--prui-brand)]" : "text-[var(--prui-fg)] hover:bg-[var(--prui-raise)]",
                node.item.disabled && "opacity-50 cursor-not-allowed",
              )}
            >
              <ChevronRight
                className={cn("h-3.5 w-3.5 shrink-0 text-[var(--prui-dim)] transition-transform", isOpen && "rotate-90", !node.hasChildren && "invisible")}
                aria-hidden
              />
              {node.item.label}
            </button>
          </li>
        )
      })}
    </ul>
  )
})
TreeView.displayName = "TreeView"

export const treeViewPropsMeta: PropsMeta = {
  name: "TreeView",
  props: [
    { name: "items", type: "TreeViewItem[]", default: null, control: "object" },
    { name: "expanded", type: "string[]", default: "undefined", control: "object" },
    { name: "defaultExpanded", type: "string[]", default: "[]", control: "object" },
    { name: "onExpandedChange", type: "(ids: string[]) => void", default: null, control: "none" },
    { name: "selected", type: "string", default: "undefined", control: "text" },
    { name: "onSelect", type: "(id, item) => void", default: null, control: "none" },
    { name: "ariaLabel", type: "string", default: null, control: "text" },
  ],
}
