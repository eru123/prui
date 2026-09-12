import * as React from "react"
import { cn } from "./cn"
import type { PropsMeta } from "./props-meta"

interface TabsCtx {
  value: string
  setValue: (v: string) => void
  baseId: string
}

const Ctx = React.createContext<TabsCtx | null>(null)

function useTabs(): TabsCtx {
  const ctx = React.useContext(Ctx)
  if (!ctx) throw new Error("Tabs parts must be used inside <Tabs>")
  return ctx
}

export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
}

export const Tabs = ({ value: valueProp, defaultValue, onChange, className, children, ...props }: TabsProps) => {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? "")
  const value = valueProp !== undefined ? valueProp : uncontrolled
  const baseId = React.useId()

  const setValue = (v: string) => {
    if (valueProp === undefined) setUncontrolled(v)
    onChange?.(v)
  }

  return (
    <Ctx.Provider value={{ value, setValue, baseId }}>
      <div className={cn("prui-tabs", className)} {...props}>
        {children}
      </div>
    </Ctx.Provider>
  )
}
Tabs.displayName = "Tabs"

export type TabsListProps = React.HTMLAttributes<HTMLDivElement>

export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, onKeyDown, ...props }, ref) => {
    const listRef = React.useRef<HTMLDivElement>(null)

    const tabsInList = (): HTMLButtonElement[] => {
      const list = listRef.current
      if (!list) return []
      return Array.from(list.querySelectorAll<HTMLButtonElement>("[role='tab']"))
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e)
      if (e.defaultPrevented) return
      const tabs = tabsInList()
      const current = tabs.findIndex((t) => t.tabIndex === 0)
      const delta = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0
      if (delta !== 0) {
        e.preventDefault()
        const next = tabs[(current + delta + tabs.length) % tabs.length]
        next?.focus()
        next?.click()
        return
      }
      if (e.key === "Home") {
        e.preventDefault()
        tabs[0]?.focus()
        tabs[0]?.click()
        return
      }
      if (e.key === "End") {
        e.preventDefault()
        const last = tabs[tabs.length - 1]
        last?.focus()
        last?.click()
      }
    }

    return (
      <div
        ref={(node) => {
          listRef.current = node
          if (typeof ref === "function") ref(node)
          else if (ref) ref.current = node
        }}
        role="tablist"
        aria-orientation="horizontal"
        onKeyDown={handleKeyDown}
        className={cn(
          "prui-tabs-list inline-flex h-9 items-center gap-1 rounded-[var(--prui-radius)] bg-[var(--prui-raise)] p-1",
          className,
        )}
        {...props}
      />
    )
  },
)
TabsList.displayName = "TabsList"

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, onClick, ...props }, ref) => {
    const { value: active, setValue, baseId } = useTabs()
    const selected = active === value
    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        id={`${baseId}-tab-${value}`}
        aria-selected={selected}
        // the panel exists in the DOM only while selected; referencing a
        // missing id is an invalid ARIA value, so point only when mounted
        aria-controls={selected ? `${baseId}-panel-${value}` : undefined}
        data-state={selected ? "active" : "inactive"}
        tabIndex={selected ? 0 : -1}
        className={cn(
          "prui-tabs-trigger inline-flex items-center justify-center whitespace-nowrap rounded-[calc(var(--prui-radius)-1px)]",
          "px-3 py-1 text-sm font-medium transition-colors cursor-pointer outline-none",
          "focus-visible:ring-2 focus-visible:ring-[var(--prui-brand)]",
          selected
            ? "bg-[var(--prui-background)] text-[var(--prui-fg)] shadow"
            : "text-[var(--prui-dim)] hover:text-[var(--prui-fg)]",
          className,
        )}
        onClick={(e) => {
          onClick?.(e)
          if (!e.defaultPrevented) setValue(value)
        }}
        {...props}
      />
    )
  },
)
TabsTrigger.displayName = "TabsTrigger"

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, ...props }, ref) => {
    const { value: active, baseId } = useTabs()
    if (active !== value) return null
    return (
      <div
        ref={ref}
        role="tabpanel"
        id={`${baseId}-panel-${value}`}
        aria-labelledby={`${baseId}-tab-${value}`}
        tabIndex={0}
        className={cn("prui-tabs-content mt-2 outline-none", className)}
        {...props}
      />
    )
  },
)
TabsContent.displayName = "TabsContent"

export const tabsPropsMeta: PropsMeta = {
  name: "Tabs",
  props: [
    { name: "value", type: "string", default: "undefined", control: "text" },
    { name: "defaultValue", type: "string", default: "first tab", control: "text" },
    { name: "onChange", type: "(value: string) => void", default: null, control: "none" },
  ],
}
