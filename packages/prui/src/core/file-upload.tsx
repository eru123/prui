import * as React from "react"
import { UploadCloud, File as FileIcon, X } from "lucide-react"
import { cn } from "./cn"
import { usePruiI18n } from "../i18n"
import type { PropsMeta } from "./props-meta"

/**
 * FileUpload: an accessible dropzone + file picker. The dropzone is a real
 * button wrapping a visually-hidden input (keyboard + screen reader
 * native); drag events highlight the zone. Files render as a removable
 * list. Accept/multiple mirror the native input attributes.
 */

export interface FileUploadProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onError"> {
  /** Accepted file types (native input accept syntax). */
  accept?: string
  /** Allow multiple files. Default true. */
  multiple?: boolean
  /** Validate/reject files; return an error message string or null. */
  validate?: (file: File) => string | null
  onFiles?: (files: File[]) => void
  /** Control the visible file list externally. */
  files?: File[]
  /** Max file size in bytes per file. */
  maxSize?: number
  /** Primary dropzone copy. */
  hint?: React.ReactNode
  disabled?: boolean
  /** Hide the selected-files list (caller renders their own). */
  hideList?: boolean
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(function FileUpload(
  { accept, multiple = true, validate, onFiles, files: filesProp, maxSize, hint, disabled, hideList, className, ...props },
  ref,
) {
  const { t } = usePruiI18n()
  const [uncontrolled, setUncontrolled] = React.useState<File[]>([])
  const [dragging, setDragging] = React.useState(false)
  const [errors, setErrors] = React.useState<string[]>([])
  const isControlled = filesProp !== undefined
  const files = isControlled ? filesProp : uncontrolled
  const innerRef = React.useRef<HTMLInputElement>(null)

  const addFiles = (incoming: FileList | File[]) => {
    if (disabled) return
    const nextErrors: string[] = []
    const accepted: File[] = []
    for (const file of Array.from(incoming)) {
      const reason =
        maxSize != null && file.size > maxSize
          ? `${file.name} is larger than ${formatBytes(maxSize)}.`
          : (validate?.(file) ?? null)
      if (reason) nextErrors.push(reason)
      else accepted.push(file)
    }
    setErrors(nextErrors)
    const next = multiple ? [...files, ...accepted] : (accepted.slice(-1) as File[])
    if (!isControlled) setUncontrolled(next)
    onFiles?.(next)
  }

  const removeAt = (index: number) => {
    const next = files.filter((_, i) => i !== index)
    if (!isControlled) setUncontrolled(next)
    onFiles?.(next)
  }

  return (
    <div className={cn("prui-file-upload flex flex-col gap-2", className)} {...props}>
      <button
        type="button"
        disabled={disabled}
        aria-describedby={errors.length ? "prui-file-upload-errors" : undefined}
        onClick={() => innerRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files)
        }}
        data-dragging={dragging || undefined}
        data-disabled={disabled || undefined}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-prui border border-dashed p-8 text-sm",
          "transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
          dragging
            ? "border-brand bg-brand/10 text-brand"
            : "border-line bg-background text-dim hover:border-dim",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <UploadCloud className="h-6 w-6" aria-hidden />
        <span>{hint ?? t.dropFiles}</span>
      </button>
      <input
        ref={(node) => {
          innerRef.current = node
          if (typeof ref === "function") ref(node)
          else if (ref) ref.current = node
        }}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          if (e.target.files?.length) addFiles(e.target.files)
          e.target.value = ""
        }}
      />
      {errors.length > 0 ? (
        <div id="prui-file-upload-errors" role="alert" className="flex flex-col gap-1 text-xs text-danger">
          {errors.map((err, i) => (
            <span key={i}>{err}</span>
          ))}
        </div>
      ) : null}
      {!hideList && files.length > 0 ? (
        <ul className="flex flex-col gap-1" data-testid="file-upload-list">
          {files.map((file, i) => (
            <li key={`${file.name}-${i}`} className="flex items-center gap-2 rounded-prui-sm bg-raise px-3 py-2 text-sm text-fg">
              <FileIcon className="h-4 w-4 shrink-0 text-dim" aria-hidden />
              <span className="min-w-0 flex-1 truncate">{file.name}</span>
              <span className="text-xs text-dim">{formatBytes(file.size)}</span>
              <button
                type="button"
                aria-label={`${t.removeFile}: ${file.name}`}
                onClick={() => removeAt(i)}
                className="rounded-prui-sm p-1 text-dim transition-colors hover:text-danger cursor-pointer"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
})
FileUpload.displayName = "FileUpload"

export const fileUploadPropsMeta: PropsMeta = {
  name: "FileUpload",
  props: [
    { name: "accept", type: "string (input accept)", default: "undefined", control: "text" },
    { name: "multiple", type: "boolean", default: "true", control: "boolean" },
    { name: "onFiles", type: "(files: File[]) => void", default: null, control: "none" },
    { name: "files", type: "File[]", default: "internal state", control: "none" },
    { name: "maxSize", type: "number (bytes)", default: "undefined", control: "number" },
    { name: "validate", type: "(file: File) => string | null", default: null, control: "none" },
    { name: "hint", type: "ReactNode", default: "'Drag files here or click to browse'", control: "text" },
    { name: "hideList", type: "boolean", default: "false", control: "boolean" },
  ],
}
