/** PRUI primitives layer: standard composition building blocks plus cn(). */
export { cn } from "./cn"
export { resolveSurface, withSurface, type SurfaceProps, type SurfaceRadius, type SurfaceTexture, type SurfaceElevation } from "./surface"
export type { PropsMeta, PropMeta, PropControl } from "./props-meta"

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
  DialogFooter,
  dialogPropsMeta,
  type DialogProps,
  type DialogContentProps,
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
