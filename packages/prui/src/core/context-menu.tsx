import * as React from "react"
import { cn } from "./cn"
import { Portal, useOverlayStack, useEscapeKey } from "./overlay"
import { moveIndex, homeIndex, endIndex } from "./list-nav"
import type { DropdownItem } from "./dropdown"
import type { PropsMeta } from "./props-meta"

/**
 * ContextMenu: a right-click menu anchored at the pointer, with the same
 * WAI-ARIA menu keyboard support as Dropdown (arrows, Home/End, Escape,
 * typeahead) and the same item shape. Non-modal: no scroll lock, closes on
 * outside pointerdown or Tab, and restores focus to whatever had it.
 */

export interface ContextMenuProps {
  items: DropdownItem[]
  /** The region that receives the contextmenu event (any element). */
  children: React.ReactNode
  className?: string
}

const MENU_ITEM_SELECTOR = "[role='menuitem']"

export const ContextMenu = React.forwardRef<HTMLDivElement, ContextMenuProps>(function ContextMenu(
  { items, children, className },
  ref,
) {
  const [pos, setPos] = React.useState<{ x: number; y: number } | null>(null)
  const menuRef = React.useRef<HTMLDivElement>(null)
  const [menuEl, setMenuEl] = React.useState<HTMLDivElement | null>(null)
  const [activeIndex, setActiveIndex] = React.useState(-1)
  const restoreFocus = React.useRef<HTMLElement | null>(null)
  const open = pos != null

  const close = () => {
    setPos(null)
    setActiveIndex(-1)
    restoreFocus.current?.focus()
    restoreFocus.current = null
  }

  const { setElement, isTop } = useOverlayStack(open)
  useEscapeKey(open, isTop, close)

  // outside pointerdown closes (capture phase — clicks inside handled here)
  React.useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) close()
    }
    window.addEventListener("pointerdown", onDown, true)
    return () => window.removeEventListener("pointerdown", onDown, true)
  }, [open])

  // clamp against the viewport once the menu has rendered and measured
  const [clamped, setClamped] = React.useState<{ x: number; y: number } | null>(null)
  React.useLayoutEffect(() => {
    if (!pos || !menuEl) return
    const MARGIN = 8
    const rect = menuEl.getBoundingClientRect()
    setClamped({
      x: Math.min(pos.x, window.innerWidth - rect.width - MARGIN),
      y: Math.min(pos.y, window.innerHeight - rect.height - MARGIN),
    })
  }, [pos, menuEl])
  React.useEffect(() => {
    if (!open) setClamped(null)
  }, [open])

  const focusables = () => (menuRef.current ? [...menuRef.current.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR)] : [])
  const focusAt = (i: number) => {
    const els = focusables()
    const el = els[i]
    if (el) {
      setActiveIndex(i)
      el.focus()
    }
  }

  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    const els = focusables()
    if (e.key === "ArrowDown") {
      e.preventDefault()
      focusAt(moveIndex(activeIndex, 1, els.length))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      focusAt(moveIndex(activeIndex, -1, els.length))
    } else if (e.key === "Home") {
      e.preventDefault()
      focusAt(homeIndex(els.length))
    } else if (e.key === "End") {
      e.preventDefault()
      focusAt(endIndex(els.length))
    } else if (e.key === "Tab") {
      e.preventDefault()
      close()
    }
  }

  const trigger = React.isValidElement(children) ? (
    React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
      ref,
      onContextMenu: (e: React.MouseEvent) => {
        e.preventDefault()
        restoreFocus.current = document.activeElement as HTMLElement | null
        setClamped(null)
        setPos({ x: e.clientX, y: e.clientY })
      },
    })
  ) : (
    <span
      ref={ref}
      onContextMenu={(e) => {
        e.preventDefault()
        restoreFocus.current = document.activeElement as HTMLElement | null
        setClamped(null)
        setPos({ x: e.clientX, y: e.clientY })
      }}
    >
      {children}
    </span>
  )

  return (
    <>
      {trigger}
      {open ? (
        <Portal>
          <div
            ref={(node) => {
              menuRef.current = node
              setMenuEl(node)
              setElement(node?.parentElement ?? null)
            }}
            role="menu"
            data-state="open"
            tabIndex={-1}
            onKeyDown={onMenuKeyDown}
            className={cn(
              "prui-context-menu fixed z-[var(--prui-z-flyout)] min-w-44",
              "rounded-prui border border-line bg-surface py-1 shadow-prui-lg",
              "prui-anim-fade",
              className,
            )}
            style={{ left: (clamped ?? pos).x, top: (clamped ?? pos).y }}
          >
            {items.map((item) => (
              <React.Fragment key={item.label}>
                {item.separatorBefore ? <div role="separator" className="my-1 h-px bg-line" /> : null}
                <button
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => {
                    if (item.disabled) return
                    close()
                    item.onSelect?.()
                  }}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-left text-sm",
                    "text-fg outline-none transition-colors",
                    "focus:bg-raise hover:bg-raise",
                    item.danger && "text-danger",
                    item.disabled && "cursor-not-allowed opacity-50",
                  )}
                >
                  {item.icon ? <span className="inline-flex h-4 w-4 items-center justify-center">{item.icon}</span> : null}
                  {item.label}
                </button>
              </React.Fragment>
            ))}
          </div>
        </Portal>
      ) : null}
    </>
  )
})
ContextMenu.displayName = "ContextMenu"

export const contextMenuPropsMeta: PropsMeta = {
  name: "ContextMenu",
  props: [
    { name: "items", type: "DropdownItem[]", default: null, control: "none" },
    { name: "children", type: "ReactNode (the region)", default: null, control: "text" },
  ],
}
