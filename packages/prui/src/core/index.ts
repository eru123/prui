/** PRUI primitives layer: standard composition building blocks plus cn(). */
export { cn } from "./cn"
export { resolveSurface, withSurface, type SurfaceProps, type SurfaceRadius, type SurfaceTexture, type SurfaceElevation } from "./surface"
export type { PropsMeta, PropMeta, PropControl } from "./props-meta"

/* Shared overlay + keyboard-navigation infrastructure (used by every
   floating surface; exported for advanced composition). */
export {
  Portal,
  useReducedMotion,
  useFocusTrap,
  useEscapeKey,
  useScrollLock,
  useInertBackground,
  useOverlay,
  useOverlayStack,
  pushOverlay,
  removeOverlay,
  isTopOverlay,
  overlayCount,
  getFocusable,
  overlayPropsMeta,
} from "./overlay"
export { moveIndex, homeIndex, endIndex, typeaheadIndex } from "./list-nav"

export {
  Button,
  buttonPropsMeta,
  type ButtonProps,
  type ButtonVariant,
  type ButtonSize,
} from "./button"

export {
  Input,
  inputPropsMeta,
  Textarea,
  textareaPropsMeta,
  type InputProps,
  type TextareaProps,
} from "./input"

export { Label, labelPropsMeta, Separator, separatorPropsMeta, type LabelProps, type SeparatorProps } from "./label"

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  selectPropsMeta,
  type SelectProps,
  type SelectOption,
  type SelectTriggerProps,
  type SelectValueProps,
  type SelectContentProps,
  type SelectItemProps,
} from "./select"

export { Switch, switchPropsMeta, type SwitchProps } from "./switch"

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  tabsPropsMeta,
  type TabsProps,
  type TabsListProps,
  type TabsTriggerProps,
  type TabsContentProps,
} from "./tabs"

export {
  Badge,
  badgePropsMeta,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardPropsMeta,
  Avatar,
  avatarPropsMeta,
  type BadgeProps,
  type BadgeVariant,
  type AvatarProps,
} from "./card"

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  dialogPropsMeta,
  dialogBodyPropsMeta,
  type DialogProps,
  type DialogContentProps,
  type DialogBodyProps,
} from "./dialog"

export {
  Dropdown,
  dropdownPropsMeta,
  type DropdownProps,
  type DropdownItem,
} from "./dropdown"

export { ScrollArea, scrollAreaPropsMeta, type ScrollAreaProps } from "./scroll-area"

export {
  Modal,
  confirmModal,
  modalPropsMeta,
  confirmModalPropsMeta,
  type ModalProps,
  type ModalSize,
  type ConfirmModalOptions,
  type ConfirmModalType,
} from "./modal"

export { computePosition, useAnchoredPosition, type AnchorSide, type AnchorAlign, type AnchoredPosition } from "./anchor"

/* Feedback primitives */
export { Spinner, spinnerPropsMeta, type SpinnerProps, type SpinnerSize } from "./spinner"
export { Skeleton, skeletonPropsMeta, type SkeletonProps } from "./skeleton"
export { Alert, alertPropsMeta, type AlertProps, type AlertVariant } from "./alert"
export { Progress, progressPropsMeta, type ProgressProps } from "./progress"
export { Toaster, toast, dismissAllToasts, toasterPropsMeta, toastPropsMeta, type ToasterProps, type ToastOptions, type ToastVariant, type ToastHandle } from "./toast"

/* Overlays */
export { Tooltip, tooltipPropsMeta, type TooltipProps } from "./tooltip"
export { Popover, popoverPropsMeta, type PopoverProps } from "./popover"
export { Drawer, Sheet, drawerPropsMeta, sheetPropsMeta, type DrawerProps, type DrawerSide } from "./drawer"

/* Form controls */
export { Checkbox, checkboxPropsMeta, type CheckboxProps } from "./checkbox"
export { RadioGroup, Radio, radioGroupPropsMeta, type RadioGroupProps, type RadioProps } from "./radio"
export { Combobox, comboboxPropsMeta, type ComboboxProps, type ComboboxOption } from "./combobox"

/* Navigation + display */
export { Accordion, AccordionItem, accordionPropsMeta, type AccordionProps, type AccordionItemProps } from "./accordion"
export { Breadcrumb, BreadcrumbItem, BreadcrumbEllipsis, breadcrumbPropsMeta, type BreadcrumbProps, type BreadcrumbItemProps } from "./breadcrumb"
export { TreeView, treeViewPropsMeta, type TreeViewProps, type TreeViewItem } from "./tree-view"
export { Timeline, timelinePropsMeta, type TimelineProps, type TimelineItemData, type TimelineVariant } from "./timeline"

/* Dates + files */
export { Calendar, calendarPropsMeta, toDateKey, fromDateKey, type CalendarProps } from "./calendar"
export { DatePicker, DateRangePicker, datePickerPropsMeta, dateRangePickerPropsMeta, type DatePickerProps, type DateRangePickerProps, type DateRange, type MaxRange } from "./date-picker"
export { TimePicker, TimeRangePicker, TimePanel, timePickerPropsMeta, timeRangePickerPropsMeta, type TimePickerProps, type TimeRangePickerProps, type TimeRange } from "./time-picker"
export { FileUpload, fileUploadPropsMeta, type FileUploadProps } from "./file-upload"
