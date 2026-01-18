import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Merge Tailwind classes with proper precedence
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date relative to now
export function formatRelativeDate(date: number): string {
  const now = Date.now()
  const diff = date - now

  const seconds = Math.abs(diff) / 1000
  const minutes = seconds / 60
  const hours = minutes / 60
  const days = hours / 24
  const weeks = days / 7
  const months = days / 30

  const isPast = diff < 0
  const prefix = isPast ? '' : 'in '
  const suffix = isPast ? ' ago' : ''

  if (seconds < 60) return 'just now'
  if (minutes < 60) {
    const m = Math.round(minutes)
    return `${prefix}${m} minute${m !== 1 ? 's' : ''}${suffix}`
  }
  if (hours < 24) {
    const h = Math.round(hours)
    return `${prefix}${h} hour${h !== 1 ? 's' : ''}${suffix}`
  }
  if (days < 7) {
    const d = Math.round(days)
    return `${prefix}${d} day${d !== 1 ? 's' : ''}${suffix}`
  }
  if (weeks < 4) {
    const w = Math.round(weeks)
    return `${prefix}${w} week${w !== 1 ? 's' : ''}${suffix}`
  }
  const mo = Math.round(months)
  return `${prefix}${mo} month${mo !== 1 ? 's' : ''}${suffix}`
}

// Format date for display
export function formatDate(date: number, options?: Intl.DateTimeFormatOptions): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  })
}

// Format date range
export function formatDateRange(start: number, end: number): string {
  const startDate = new Date(start)
  const endDate = new Date(end)

  const sameMonth = startDate.getMonth() === endDate.getMonth()
  const sameYear = startDate.getFullYear() === endDate.getFullYear()

  if (sameMonth && sameYear) {
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { day: 'numeric', year: 'numeric' })}`
  }

  if (sameYear) {
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }

  return `${formatDate(start)} - ${formatDate(end)}`
}

// Format time
export function formatTime(date: number): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

// Truncate text
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length).trim() + '...'
}

// Slugify text
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// Generate initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Format number with K/M suffix
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  }
  return num.toString()
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

// Check if on mobile device
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
}

// Generate a random color from a string (for avatars)
export function stringToColor(str: string): string {
  const colors = [
    '#6366F1', // indigo
    '#8B5CF6', // violet
    '#EC4899', // pink
    '#10B981', // emerald
    '#F59E0B', // amber
    '#EF4444', // red
    '#06B6D4', // cyan
    '#84CC16', // lime
  ]
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

// Event status helpers
export function getEventStatus(event: {
  registrationStartDate: number
  registrationEndDate: number
  eventStartDate: number
  eventEndDate: number
  status: string
}): {
  label: string
  color: string
  canRegister: boolean
} {
  const now = Date.now()

  if (event.status === 'cancelled') {
    return { label: 'Cancelled', color: 'red', canRegister: false }
  }

  if (event.status === 'completed') {
    return { label: 'Completed', color: 'gray', canRegister: false }
  }

  if (now < event.registrationStartDate) {
    return { label: 'Coming Soon', color: 'blue', canRegister: false }
  }

  if (now >= event.registrationStartDate && now < event.registrationEndDate) {
    return { label: 'Registration Open', color: 'green', canRegister: true }
  }

  if (now >= event.registrationEndDate && now < event.eventStartDate) {
    return { label: 'Registration Closed', color: 'yellow', canRegister: false }
  }

  if (now >= event.eventStartDate && now < event.eventEndDate) {
    return { label: 'In Progress', color: 'purple', canRegister: false }
  }

  if (event.status === 'judging') {
    return { label: 'Judging', color: 'orange', canRegister: false }
  }

  return { label: 'Ended', color: 'gray', canRegister: false }
}
