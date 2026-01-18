import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const sizes = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = 'xl', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('mx-auto px-4 md:px-6', sizes[size], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Container.displayName = 'Container'
