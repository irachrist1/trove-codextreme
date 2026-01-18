import { forwardRef, ButtonHTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

const variants: Record<ButtonVariant, string> = {
  primary: `
    bg-[var(--color-black-900)] text-[var(--color-white)] font-medium
    hover:bg-[var(--color-black-800)]
    active:scale-[0.98]
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
  `,
  secondary: `
    bg-[var(--color-white)] text-[var(--color-black-900)] font-medium
    border border-[var(--color-gray-100)]
    hover:bg-[var(--color-offwhite-3)]
    active:scale-[0.98]
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  ghost: `
    bg-transparent text-[var(--color-black-800)]
    hover:bg-[var(--color-offwhite-3)] hover:text-[var(--color-black-900)]
    active:scale-[0.98]
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  danger: `
    bg-[var(--color-red-500)] text-[var(--color-white)] font-medium
    hover:bg-[var(--color-red-400)]
    active:scale-[0.98]
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  outline: `
    bg-transparent text-[var(--color-black-900)] font-medium
    border border-[var(--color-gray-100)]
    hover:bg-[var(--color-offwhite-3)] hover:border-[var(--color-gray-200)]
    active:scale-[0.98]
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
}

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading,
      leftIcon,
      rightIcon,
      fullWidth,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        transition={{ duration: 0.1 }}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-200',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'
