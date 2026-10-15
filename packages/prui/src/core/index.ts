/** PRUI primitives layer: standard composition building blocks plus cn(). */
export { cn } from "./cn"
export { resolveSurface, withSurface, readableInk, type SurfaceProps, type SurfaceRadius, type SurfaceTexture, type SurfaceElevation } from "./surface"
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
  InputGroup,
  inputGroupPropsMeta,
  Textarea,
  textareaPropsMeta,
  type InputProps,
  type InputGroupProps,
  type TextareaProps,
} from "./input"

export {
  FormField,
  formFieldPropsMeta,
  useFieldSlots,
  type FormFieldProps,
  type FieldSlotProps,
} from "./form-field"

export {
  TagInput,
  tagInputPropsMeta,
  type TagInputProps,
  type TagInputSize,
} from "./tag-input"

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

export {
  computePosition,
  computePlacement,
  getClippingBoundary,
  useAnchoredPosition,
  PLACEMENTS,
  DEFAULT_PLACEMENT,
  type AnchorSide,
  type AnchorAlign,
  type Placement,
  type Rect,
  type AnchoredPosition,
  type PositionOptions,
} from "./anchor"

/* Feedback primitives */
export { Spinner, spinnerPropsMeta, type SpinnerProps, type SpinnerSize } from "./spinner"
export { Skeleton, SkeletonSwap, skeletonPropsMeta, type SkeletonProps, type SkeletonSwapProps } from "./skeleton"
export { Alert, alertPropsMeta, type AlertProps, type AlertVariant } from "./alert"
export { Progress, progressPropsMeta, type ProgressProps } from "./progress"
export { Toaster, toast, dismissAllToasts, toasterPropsMeta, toastPropsMeta, type ToasterProps, type ToastOptions, type ToastVariant, type ToastHandle } from "./toast"

/* Interaction kit (interior.dev-inspired micro-interactions, MIT-adapted) */
export { CopyButton, copyText, copyButtonPropsMeta, type CopyButtonProps } from "./copy-button"
export { HoldToConfirm, holdToConfirmPropsMeta, type HoldToConfirmProps } from "./hold-to-confirm"
export { useLongPress, type UseLongPressOptions, type LongPressResult } from "./use-long-press"
export { IconMorph, type IconMorphProps } from "./icon-morph"
export { OTPInput, otpInputPropsMeta, type OTPInputProps } from "./otp-input"
export { PasswordStrength, scorePassword, PASSWORD_STRENGTH_LABELS, passwordStrengthPropsMeta, type PasswordStrengthProps, type PasswordScore } from "./password-strength"
export { FloatingLabel, floatingLabelPropsMeta, type FloatingLabelProps } from "./floating-label"
export { ExpandingSearch, expandingSearchPropsMeta, type ExpandingSearchProps } from "./expanding-search"
export { SegmentedControl, segmentedControlPropsMeta, type SegmentedControlProps, type SegmentedOption } from "./segmented-control"
export { Slider, sliderPropsMeta, type SliderProps } from "./slider"
export { WizardSteps, wizardStepsPropsMeta, type WizardStepsProps, type WizardStep } from "./wizard-steps"
export { ContextMenu, contextMenuPropsMeta, type ContextMenuProps } from "./context-menu"
export { Lightbox, lightboxPropsMeta, type LightboxProps, type LightboxImage } from "./lightbox"
export { Ripple, PressDepth, LikeBurst, pressKitPropsMeta, type RippleProps, type PressDepthProps, type LikeBurstProps } from "./press"

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
