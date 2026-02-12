import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date string or Date object to local date string (YYYY-MM-DD format)
 * without timezone conversion issues
 */
export function formatLocalDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${month}/${day}/${year}`
}

/**
 * Formats a date string or Date object to local datetime string
 * without timezone conversion issues
 */
export function formatLocalDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const datePart = formatLocalDate(d)
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${datePart} ${hours}:${minutes}`
}
