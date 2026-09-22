import * as React from "react"
import { cn } from "./cn"
import { Portal, useOverlayStack, useEscapeKey } from "./overlay"
import { useAnchoredPosition } from "./anchor"
import { moveIndex, homeIndex, endIndex, typeaheadIndex } from "./list-nav"
import type { PropsMeta } from "./props-meta"

/**
 * Dropdown: an anchored menu over a trigger. Full WAI-ARIA menu keyboard
 * support: Enter/Space/ArrowDown open, ArrowUp/Down + Home/End move,
 * printable-character typeahead selects, Escape (topmost overlay only)
 * closes and restores focus to the trigger, Tab closes. Non-modal: no scroll
 * lock and no background inertness.
 */

export interface DropdownItem {
  label: string
  onSelect?: () => void
  danger?: boolean
  disabled?: boolean
  separatorBefore?: boolean
}

export interface DropdownProps {
  items?: DropdownItem[]
  trigger?: React.ReactNode
  children?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  align?: "start" | "end"
  className?: string
}

const MENU_ITEM_SELECTOR = "[role='menuitem'], [role='menuitemcheckbox'], [role='menuitemradio']"

export const Dropdown = React.forwardRef<HTMLDivElement, DropdownProps>(function Dropdown(
  {
    items,
    trigger,
    children,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    align = "start",
    className,
  },
  ref,
) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : uncontrolled
  const rootRef = React.useRef<HTMLDivElement>(null)
  const menuRef = React.useRef<HTMLDivElement>(null)
  const [menuEl, setMenuEl] = React.useState<HTMLDivElement | null>(null)
  const triggerRef = React.useRef<HTMLElement>(null)
  const [activeIndex, setActiveIndex] = React.useState(-1)
  const typeaheadRef = React.useRef({ buffer: "", at: 0 })

  const setOpen = (o: boolean) => {
    if (!isControlled) setUncontrolled(o)
    onOpenChange?.(o)
    if (!o) {
      setActiveIndex(-1)
      typeaheadRef.current = { buffer: "", at: 0 }
      // return focus to the invoker when the menu closes through the keyboard path
      const active = document.activeElement
      if (active && menuRef.current?.contains(active)) triggerRef.current?.focus()
    }
  }

  const { setElement, isTop } = useOverlayStack(open)
  useEscapeKey(open, isTop, () => {
    setOpen(false)
  })
  // the menu floats in a body portal anchored under the trigger; inline
  // placement would clip inside overflow containers (scrollable sidebars,
  // table toolbars) and grow them instead of overlaying
  const { ref: floatingRef, position } = useAnchoredPosition({
    active: open,
    anchorRef: triggerRef,
    side: "bottom",
    align,
  })

  // outside pointer press closes (non-modal dismiss)
  React.useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (rootRef.current?.contains(target)) return
      // the menu lives in a portal now; its clicks are inside the dropdown
      if (menuRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  })

  const menuItems = React.useCallback(() => {
    const menu = menuRef.current
    if (!menu) return [] as HTMLElement[]
    return Array.from(menu.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR))
  }, [])

  const focusItem = (index: number) => {
    setActiveIndex(index)
    const els = menuItems()
    els[index]?.focus()
  }

  // on open, focus the first enabled item (menu pattern)
  React.useEffect(() => {
    if (!open) return
    const els = menuItems()
    const first = els.findIndex((el) => !(el as HTMLButtonElement).disabled)
    if (first >= 0) {
      setActiveIndex(first)
      els[first]?.focus()
    } else if (menuRef.current) {
      menuRef.current.focus()
    }
    // menuEl in deps: the portaled menu attaches after the open commit,
    // so the effect must re-run once the element exists
  }, [open, menuEl, menuItems])

  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    const els = menuItems()
    const enabled = (i: number) => !(els[i] as HTMLButtonElement | null)?.disabled
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        focusItem(moveIndex(activeIndex, 1, els.length, { enabled }))
        break
      case "ArrowUp":
        e.preventDefault()
        focusItem(moveIndex(activeIndex, -1, els.length, { enabled }))
        break
      case "Home":
        e.preventDefault()
        focusItem(homeIndex(els.length, enabled))
        break
      case "End":
        e.preventDefault()
        focusItem(endIndex(els.length, enabled))
        break
      case "Tab":
        setOpen(false)
        break
      case "Enter":
      case " ":
        // let the focused button's native activation run; just close after
        break
      default: {
        if (e.key.length === 1) {
          const labels = () => els.map((el) => el.textContent ?? "")
          const { index } = typeaheadIndex(labels, typeaheadRef.current, e.key, activeIndex)
          if (index >= 0 && index !== activeIndex) {
            e.preventDefault()
            focusItem(index)
          }
        }
      }
    }
  }

  const openWithKeyboard = () => {
    setOpen(true)
  }

  // trigger: clone a provided element (button/link/anything) and wire it up,
  // or render one for plain content. Cloning avoids nested interactive roles.
  let triggerNode: React.ReactNode
  if (React.isValidElement(trigger)) {
    const child = trigger as React.ReactElement<Record<string, unknown>>
    triggerNode = React.cloneElement(child, {
      ref: (el: HTMLElement) => {
        triggerRef.current = el
        const original = child.props.ref as React.Ref<HTMLElement> | undefined
        if (typeof original === "function") (original as (v: HTMLElement | null) => void)(el)
        else if (original && typeof original === "object") (original as React.MutableRefObject<HTMLElement | null>).current = el
      },
      "aria-haspopup": "menu",
      "aria-expanded": open,
      onClick: (e: React.MouseEvent) => {
        const original = child.props.onClick as ((ev: React.MouseEvent) => void) | undefined
        original?.(e)
        if (!e.defaultPrevented) setOpen(!open)
      },
      onKeyDown: (e: React.KeyboardEvent) => {
        const original = child.props.onKeyDown as ((ev: React.KeyboardEvent) => void) | undefined
        original?.(e)
        if (e.defaultPrevented) return
        if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
          if (!open) {
            e.preventDefault()
            openWithKeyboard()
          }
        }
      },
    })
  } else {
    triggerNode = (
      <button
        type="button"
        ref={(el) => {
          triggerRef.current = el
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if ((e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") && !open) {
            e.preventDefault()
            openWithKeyboard()
          }
        }}
      >
        {trigger}
      </button>
    )
  }

  return (
    <div ref={(node) => {
      rootRef.current = node
      if (typeof ref === "function") ref(node)
      else if (ref) ref.current = node
    }} className={cn("prui-dropdown relative inline-block", className)} data-state={open ? "open" : "closed"}>
      {triggerNode}
      {open ? (
        <Portal>
        <div
          ref={(node) => {
            menuRef.current = node
            setMenuEl(node)
            floatingRef(node)
            setElement(node)
          }}
          role="menu"
          tabIndex={-1}
          onKeyDown={onMenuKeyDown}
          style={{ top: position?.top ?? -9999, left: position?.left ?? -9999 }}
          className={cn(
            "prui-dropdown-menu fixed z-[calc(var(--prui-z-modal,10000)+1)] min-w-40 rounded-prui border border-line",
            "bg-surface p-1 shadow-prui-md outline-none",
          )}
        >
          {children ??
            (items ?? []).map((item, i) => (
              <React.Fragment key={`${item.label}-${i}`}>
                {item.separatorBefore ? <div className="my-1 h-px bg-line" /> : null}
                <button
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  disabled={item.disabled}
                  onClick={() => {
                    if (item.disabled) return
                    setOpen(false)
                    item.onSelect?.()
                  }}
                  className={cn(
                    "flex w-full items-center rounded-prui-inner px-2.5 py-1.5 text-left text-sm",
                    "hover:bg-raise focus-visible:bg-raise outline-none cursor-pointer disabled:opacity-50 disabled:pointer-events-none",
                    item.danger ? "text-danger" : "text-fg",
                  )}
                >
                  {item.label}
                </button>
              </React.Fragment>
            ))}
        </div>
        </Portal>
      ) : null}
    </div>
  )
})
Dropdown.displayName = "Dropdown"

export const dropdownPropsMeta: PropsMeta = {
  name: "Dropdown",
  props: [
    { name: "items", type: "DropdownItem[]", default: "[]", control: "object" },
    { name: "trigger", type: "ReactNode", default: null, control: "none" },
    { name: "align", type: "'start' | 'end'", default: "'start'", control: "select", options: ["start", "end"] },
    { name: "onOpenChange", type: "(open: boolean) => void", default: null, control: "none" },
    { name: "open", type: "boolean", default: "undefined", control: "boolean" },
  ],
}
