import * as React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../core/card"
import { cn } from "../core/cn"
import type { PropsMeta } from "../core/props-meta"

/** StatRow: the KPI cards every dashboard starts with. */
export interface StatItem {
  label: string
  value: React.ReactNode
  /** Optional delta, e.g. "+12%". */
  delta?: string
  /** Trend direction coloring. */
  trend?: "up" | "down" | "flat"
  icon?: React.ComponentType<{ className?: string }>
}

export interface StatRowProps {
  items: StatItem[]
  className?: string
}

export function StatRow({ items, className }: StatRowProps) {
  return (
    <div className={cn("prui-stat-row grid gap-3 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {items.map((item, i) => {
        const Icon = item.icon
        return (
          <Card key={`${item.label}-${i}`} data-testid="stat-card">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5 text-xs">
                {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden /> : null}
                {item.label}
              </CardDescription>
              <CardTitle className="text-2xl">{item.value}</CardTitle>
            </CardHeader>
            {item.delta ? (
              <CardContent className="pb-3">
                <span
                  className={cn(
                    "text-xs font-medium",
                    item.trend === "up" && "text-ok",
                    item.trend === "down" && "text-danger",
                    (!item.trend || item.trend === "flat") && "text-dim",
                  )}
                >
                  {item.delta}
                </span>
              </CardContent>
            ) : null}
          </Card>
        )
      })}
    </div>
  )
}

export const statRowPropsMeta: PropsMeta = {
  name: "StatRow",
  props: [
    { name: "items", type: "StatItem[]", default: null, control: "object" },
    { name: "className", type: "string", default: "undefined", control: "text" },
  ],
}
