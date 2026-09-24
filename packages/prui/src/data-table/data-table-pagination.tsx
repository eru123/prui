import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "../core/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../core/select"
import type { PropsMeta } from "../core/props-meta"
import { usePruiI18n } from "../i18n"

/**
 * Cursor pagination. The list contract returns { rows, nextCursor, prevCursor };
 * callers hold cursors and pass them back through onCursorChange.
 */

export interface CursorPaginationState {
  nextCursor?: string | null
  prevCursor?: string | null
}

export interface DataTablePaginationProps {
  /** 1-based logical page number, maintained by the caller from cursor movements. */
  page: number
  pageSize?: number
  /** Whether a next page exists (nextCursor truthy). Superseded for the
   * next button when totalPages is provided. */
  hasNextPage: boolean
  /** Whether a previous page exists. */
  hasPreviousPage: boolean
  /** When the server count is known: renders "Page N of M" and disables
   * next on the last page. Omit for cursor mode (renders "Page N"). */
  totalPages?: number
  /** When the row count is known: renders the total beside the page-size
   * select ("1,024 items" — pair with rowsLabel to rename the unit). */
  totalRows?: number
  /** Unit word after totalRows. Default "items". */
  rowsLabel?: string
  onPageChange?: (page: number, direction: "next" | "prev") => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
  className?: string
}

export function DataTablePagination({
  page,
  pageSize = 20,
  hasNextPage,
  hasPreviousPage,
  totalPages,
  totalRows,
  rowsLabel = "items",
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  className,
}: DataTablePaginationProps) {
  const { t } = usePruiI18n()
  const nextPageDisabled = totalPages !== undefined ? page >= totalPages : !hasNextPage
  return (
    <div className={className ?? "flex items-center justify-between gap-2 py-2"}>
      <div className="flex items-center gap-2 text-sm text-dim">
        <span>{t.rowsPerPage}</span>
        <div className="w-20">
          <Select
            value={String(pageSize)}
            onChange={(v) => onPageSizeChange?.(Number(v))}
            options={pageSizeOptions.map((n) => ({ label: String(n), value: String(n) }))}
          >
            <SelectTrigger aria-label={t.rowsPerPage} className="h-7">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {totalRows !== undefined ? (
          <span className="text-sm text-dim" data-testid="pagination-total">
            {totalRows.toLocaleString()} {rowsLabel}
          </span>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-dim" data-testid="pagination-page">
          {totalPages !== undefined ? `${t.page} ${page} ${t.of} ${totalPages}` : `${t.page} ${page}`}
        </span>
        <Button
          variant="default"
          size="icon"
          aria-label={t.previousPage}
          disabled={!hasPreviousPage}
          onClick={() => onPageChange?.(page - 1, "prev")}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </Button>
        <Button
          variant="default"
          size="icon"
          aria-label={t.nextPage}
          disabled={nextPageDisabled}
          onClick={() => onPageChange?.(page + 1, "next")}
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </div>
  )
}

export const dataTablePaginationPropsMeta: PropsMeta = {
  name: "DataTablePagination",
  props: [
    { name: "page", type: "number", default: null, control: "number" },
    { name: "pageSize", type: "number", default: "20", control: "select", options: ["10", "20", "50", "100"] },
    { name: "hasNextPage", type: "boolean", default: null, control: "boolean" },
    { name: "hasPreviousPage", type: "boolean", default: null, control: "boolean" },
    { name: "totalPages", type: "number", default: "undefined", control: "number", description: "Renders 'Page N of M'; next disables on the last page." },
    { name: "totalRows", type: "number", default: "undefined", control: "number", description: "Row total beside the page-size select." },
    { name: "rowsLabel", type: "string", default: "'items'", control: "text" },
    { name: "onPageChange", type: "(page, direction) => void", default: null, control: "none" },
    { name: "onPageSizeChange", type: "(size) => void", default: null, control: "none" },
  ],
}
