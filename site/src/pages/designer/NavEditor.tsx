import * as React from "react"
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
  useDroppable,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button, Input, Badge } from "prui/core"
import { CodeView } from "../../components/CodeView"
import { GripVertical, Trash2, IndentIncrease, IndentDecrease, Code2, ListTree } from "lucide-react"
import { canDrop, type FlatNav } from "./state"

/**
 * Nav editor (AC-14): drag-to-reorder, drag-to-nest (drop a row onto a
 * group's nest strip), select-to-edit inline fields, indent/outdent and
 * delete. Validity is enforced by state.unflattenNav — every gesture ends
 * in a valid config. A Monaco JSON mode edits the same tree as code.
 */

function Row({
  entry,
  index,
  canNest,
  onLabel,
  onHref,
  onDepth,
  onDelete,
}: {
  entry: FlatNav
  index: number
  canNest: boolean
  onLabel: (v: string) => void
  onHref: (v: string) => void
  onDepth: (depth: 0 | 1) => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: index })
  const droppable = useDroppable({ id: `nest-${index}`, disabled: entry.depth !== 0 || isDragging })
  const isNestTarget = droppable.isOver && !isDragging

  return (
    <div>
      <div
        ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
        className="flex items-center gap-1.5"
      >
        <button
          type="button"
          aria-label={`Drag to reorder ${entry.label}`}
          className="cursor-grab touch-none rounded p-1 text-[var(--prui-dim)] hover:text-[var(--prui-fg)]"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-3.5 w-3.5" aria-hidden />
        </button>
        {entry.depth === 0 ? (
          <Badge variant={entry.href ? "default" : "brand"} className="shrink-0">
            {entry.href ? "item" : "group"}
          </Badge>
        ) : null}
        <Input
          value={entry.label}
          onChange={(e) => onLabel(e.target.value)}
          className="h-7 flex-1"
          style={{ marginLeft: entry.depth === 1 ? 20 : 0 }}
          aria-label={`Nav item ${index + 1} label`}
        />
        {entry.depth === 1 || entry.href !== undefined ? (
          <Input
            value={entry.href ?? ""}
            onChange={(e) => onHref(e.target.value)}
            placeholder="/path"
            className="h-7 w-28"
            aria-label={`Nav item ${index + 1} href`}
          />
        ) : null}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          aria-label={entry.depth === 0 ? `Nest ${entry.label} under previous` : `Unnest ${entry.label}`}
          disabled={!canNest && entry.depth === 0}
          onClick={() => onDepth(entry.depth === 0 ? 1 : 0)}
        >
          {entry.depth === 0 ? <IndentIncrease className="h-3.5 w-3.5" aria-hidden /> : <IndentDecrease className="h-3.5 w-3.5" aria-hidden />}
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={`Remove ${entry.label}`} onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5 text-[var(--prui-danger)]" aria-hidden />
        </Button>
      </div>
      {entry.depth === 0 ? (
        <div
          ref={droppable.setNodeRef}
          data-testid={`nest-zone-${index}`}
          className={
            "mb-0.5 h-5 rounded border border-dashed text-center font-mono text-[9px] leading-5 transition-colors " +
            (isNestTarget
              ? "border-[var(--prui-brand)] bg-[var(--prui-brand)]/15 text-[var(--prui-brand)]"
              : "border-transparent text-transparent")
          }
        >
          drop to nest under {entry.label}
        </div>
      ) : null}
    </div>
  )
}

export function NavEditor({
  flat,
  onChange,
  monacoReady,
}: {
  flat: FlatNav[]
  onChange: (next: FlatNav[]) => void
  /** Whether the lazy Monaco chunk has loaded; JSON mode falls back to a textarea. */
  monacoReady: boolean
}) {
  const [mode, setMode] = React.useState<"tree" | "json">("tree")
  const [jsonError, setJsonError] = React.useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const setAt = (index: number, patch: Partial<FlatNav>) => {
    onChange(flat.map((e, i) => (i === index ? { ...e, ...patch } : e)))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return
    const from = Number(active.id)
    if (String(over.id).startsWith("nest-")) {
      // drag-to-nest: move after the group and demote to depth 1
      const groupIndex = Number(String(over.id).slice(5))
      const item = flat[from]
      if (!item || !canDrop(flat, groupIndex + 1, 1)) return
      const without = flat.filter((_, i) => i !== from)
      const insertAt = groupIndex > from ? groupIndex : groupIndex + 1
      without.splice(insertAt, 0, { ...item, depth: 1 })
      onChange(without)
      return
    }
    const to = Number(over.id)
    if (from === to || Number.isNaN(from) || Number.isNaN(to)) return
    const next = [...flat]
    const [moved] = next.splice(from, 1)
    if (!moved) return
    next.splice(to, 0, moved)
    // an orphaned depth-1 entry (no depth-0 above) is normalized by unflattenNav
    onChange(next)
  }

  const jsonString = React.useMemo(() => JSON.stringify(flat, null, 2), [flat])

  const applyJson = (value: string) => {
    try {
      const parsed = JSON.parse(value) as FlatNav[]
      if (!Array.isArray(parsed)) throw new Error("expected an array")
      for (const e of parsed) {
        if (typeof e.label !== "string" || !e.label) throw new Error("every entry needs a label")
        if (e.depth !== 0 && e.depth !== 1) throw new Error("depth must be 0 or 1")
      }
      setJsonError(null)
      onChange(parsed)
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--prui-dim)]">navigation</div>
        <div className="flex gap-1">
          <Button variant={mode === "tree" ? "default" : "ghost"} size="sm" onClick={() => setMode("tree")} aria-label="Tree editor mode">
            <ListTree className="h-3.5 w-3.5" aria-hidden /> tree
          </Button>
          <Button variant={mode === "json" ? "default" : "ghost"} size="sm" onClick={() => setMode("json")} aria-label="JSON editor mode">
            <Code2 className="h-3.5 w-3.5" aria-hidden /> json
          </Button>
        </div>
      </div>

      {mode === "tree" ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={flat.map((_, i) => i)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col">
              {flat.map((entry, i) => (
                <Row
                  key={`${entry.label}-${i}`}
                  entry={entry}
                  index={i}
                  canNest={canDrop(flat, i, 1)}
                  onLabel={(v) => setAt(i, { label: v })}
                  onHref={(v) => setAt(i, { href: v })}
                  onDepth={(depth) => setAt(i, { depth })}
                  onDelete={() => onChange(flat.filter((_, j) => j !== i))}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="flex flex-col gap-1">
          {monacoReady ? (
            <CodeView code={jsonString} title="nav.json" language="json" readOnly={false} height={240} onEdit={applyJson} />
          ) : (
            <textarea
              aria-label="Nav JSON"
              className="h-40 w-full resize-y rounded-[var(--prui-radius)] border border-[var(--prui-line)] bg-[var(--prui-background)] p-3 font-mono text-xs text-[var(--prui-fg)]"
              defaultValue={jsonString}
              onChange={(e) => applyJson(e.target.value)}
            />
          )}
          {jsonError ? (
            <p role="alert" className="text-xs text-[var(--prui-danger)]">
              nav.json: {jsonError}
            </p>
          ) : null}
        </div>
      )}
    </div>
  )
}
