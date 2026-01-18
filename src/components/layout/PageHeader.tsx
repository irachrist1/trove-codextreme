import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  badge?: ReactNode
  actions?: ReactNode
  className?: string
}

export function PageHeader({ title, description, badge, actions, className }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('mb-8', className)}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-display">{title}</h1>
            {badge}
          </div>
          {description && (
            <p className="text-[var(--color-gray-400)] max-w-2xl">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Section header for within pages
interface SectionHeaderProps {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function SectionHeader({ title, description, action, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-6', className)}>
      <div>
        <h2 className="text-headline">{title}</h2>
        {description && (
          <p className="text-[var(--color-gray-400)] mt-1">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}
