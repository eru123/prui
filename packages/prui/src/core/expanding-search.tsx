import * as React from "react"
import { Search } from "lucide-react"
import { cn } from "./cn"
import type { PropsMeta } from "./props-meta"

/**
 * ExpandingSearch: a quiet icon-sized field that grows to a full search
 * input on focus and collapses back on blur when empty — the "search
 * exists but doesn't dominate the chrome" pattern. Width animates; the
 * input itself stays focusable at all times.
 */

export interface ExpandingSearchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  /** Placeholder while expanded. Default "Search…". */
  placeholder?: string
  /** Expanded width. Default "13rem". */
  expandedWidth?: string
  /** Fires on Enter with the current query. */
  onSearch?: (query: string) => void
  size?: "sm" | "md"
}

export const ExpandingSearch = React.forwardRef<HTMLInputElement, ExpandingSearchProps>(function ExpandingSearch(
  { placeholder = "Search…", expandedWidth = "13rem", onSearch, size = "md", className, value: valueProp, defaultValue, onChange, onFocus, onBlur, onKeyDown, ...props },
  ref,
) {
  const isControlled = valueProp !== undefined
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const value = isControlled ? valueProp : uncontrolled
  const [focused, setFocused] = React.useState(false)
  const open = focused || String(value ?? "").length > 0

  return (
    <div
      data-state={open ? "open" : "closed"}
      className={cn(
        "prui-expanding-search relative inline-flex items-center rounded-prui-full",
        "border border-transparent bg-ghost transition-all duration-200 ease-prui",
        "focus-within:border-line focus-within:bg-field",
        size === "sm" ? "h-7" : "h-9",
        className,
      )}
      style={{ width: open ? expandedWidth : size === "sm" ? "1.75rem" : "2.25rem" }}
    >
      <Search aria-hidden className={cn("pointer-events-none absolute left-2.5 h-4 w-4 text-dim", open && "text-brand")} />
      <input
        ref={ref}
        type="search"
        role="searchbox"
        aria-label={placeholder}
        placeholder={placeholder}
        value={valueProp}
        defaultValue={isControlled ? undefined : uncontrolled}
        onChange={(e) => {
          if (!isControlled) setUncontrolled(e.target.value)
          onChange?.(e)
        }}
        onFocus={(e) => {
          onFocus?.(e)
          setFocused(true)
        }}
        onBlur={(e) => {
          onBlur?.(e)
          setFocused(false)
        }}
        onKeyDown={(e) => {
          onKeyDown?.(e)
          if (e.key === "Enter") onSearch?.(String(value ?? ""))
        }}
        className={cn(
          "prui-f-control h-full w-full bg-transparent text-fg caret-brand outline-none",
          "pl-8 transition-opacity duration-200",
          open ? "opacity-100" : "cursor-pointer opacity-0",
          "[&::-webkit-search-cancel-button]:appearance-none",
          size === "sm" ? "text-xs" : "text-sm",
        )}
        {...props}
      />
    </div>
  )
})
ExpandingSearch.displayName = "ExpandingSearch"

export const expandingSearchPropsMeta: PropsMeta = {
  name: "ExpandingSearch",
  props: [
    { name: "placeholder", type: "string", default: "'Search…'", control: "text" },
    { name: "expandedWidth", type: "string (CSS width)", default: "'13rem'", control: "text" },
    { name: "onSearch", type: "(query: string) => void", default: null, control: "none" },
    { name: "size", type: "'sm' | 'md'", default: "'md'", control: "select", options: ["sm", "md"] },
  ],
}
