import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleString()
}

export function truncate(str: string, length: number) {
  return str.length > length ? str.slice(0, length) + '...' : str
} 