import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/** Merge class names; tailwind-aware. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
