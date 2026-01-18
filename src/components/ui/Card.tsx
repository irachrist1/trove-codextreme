import { forwardRef, HTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'gradient' | 'interactive'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  as?: 'div' | 'article' | 'section'
}

const variants = {
  default: 'bg-[var(--color-white)] border border-[var(--color-gray-100)]',
  elevated: 'bg-[var(--color-white)] border border-[var(--color-gray-100)] shadow-lg shadow-black/10',
  gradient: 'gradient-border',
  interactive: `
    bg-[var(--color-white)] border border-[var(--color-gray-100)]
    hover:border-[var(--color-gray-200)] hover:bg-[var(--color-offwhite-3)]
    cursor-pointer transition-all duration-200
  `,
}

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'rounded-2xl',
          variants[variant],
          paddings[padding],
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

Card.displayName = 'Card'

// Card Header
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  action?: React.ReactNode
}

export function CardHeader({ className, title, description, action, ...props }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-4', className)} {...props}>
      <div>
        <h3 className="text-lg font-semibold text-[var(--color-black-900)]">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-[var(--color-gray-400)]">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

// Card Footer
export function CardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 pt-4 mt-4 border-t border-[var(--color-gray-100)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
