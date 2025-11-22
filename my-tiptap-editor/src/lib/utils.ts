import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind class names safely while preserving shadcn-style overrides.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
