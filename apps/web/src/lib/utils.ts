import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isToday, isYesterday } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMailDate(dateStr?: string): string {
  if (!dateStr) return ""
  const date = new Date(dateStr)
  if (isToday(date)) return format(date, "HH:mm")
  if (isYesterday(date)) return "昨日"
  const now = new Date()
  if (date.getFullYear() === now.getFullYear()) return format(date, "M/d")
  return format(date, "yyyy/M/d")
}

export function formatFullDate(dateStr?: string): string {
  if (!dateStr) return ""
  return format(new Date(dateStr), "yyyy年M月d日 HH:mm")
}

export function getInitials(name?: string, address?: string): string {
  const str = name || address || "?"
  return str.charAt(0).toUpperCase()
}

export function getAvatarColor(address: string): string {
  let hash = 0
  for (let i = 0; i < address.length; i++) {
    hash = address.charCodeAt(i) + ((hash << 5) - hash)
  }
  const colors = [
    "bg-neutral-800", "bg-neutral-700", "bg-neutral-600", "bg-stone-700",
    "bg-zinc-700", "bg-zinc-600", "bg-stone-800", "bg-neutral-500",
  ]
  return colors[Math.abs(hash) % colors.length]
}
