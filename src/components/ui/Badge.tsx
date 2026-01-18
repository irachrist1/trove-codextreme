import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info'
type BadgeSize = 'sm' | 'md'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-[var(--color-gray-50)] text-[var(--color-black-800)] border border-[var(--color-gray-100)]',
  success: 'bg-[var(--color-success-50)] text-[var(--color-success-500)] border border-[var(--color-success-100)]',
  warning: 'bg-[var(--color-warning-50)] text-[var(--color-warning-500)] border border-[var(--color-warning-100)]',
  error: 'bg-[var(--color-red-50)] text-[var(--color-red-500)] border border-[var(--color-red-100)]',
  info: 'bg-[var(--color-info-50)] text-[var(--color-info-500)] border border-[var(--color-info-100)]',
}

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-[var(--color-gray-400)]',
  success: 'bg-[var(--color-success-500)]',
  warning: 'bg-[var(--color-warning-500)]',
  error: 'bg-[var(--color-red-500)]',
  info: 'bg-[var(--color-info-500)]',
}

const sizes: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
}

export function Badge({
  className,
  variant = 'default',
  size = 'sm',
  dot,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />
      )}
      {children}
    </span>
  )
}

// Status badge specifically for events
export function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { variant: BadgeVariant; label: string }> = {
    draft: { variant: 'default', label: 'Draft' },
    published: { variant: 'info', label: 'Coming Soon' },
    registration_open: { variant: 'success', label: 'Registration Open' },
    registration_closed: { variant: 'warning', label: 'Registration Closed' },
    in_progress: { variant: 'info', label: 'In Progress' },
    judging: { variant: 'warning', label: 'Judging' },
    completed: { variant: 'default', label: 'Completed' },
    cancelled: { variant: 'error', label: 'Cancelled' },
  }

  const { variant, label } = config[status] || { variant: 'default', label: status }

  return (
    <Badge variant={variant} dot>
      {label}
    </Badge>
  )
}
