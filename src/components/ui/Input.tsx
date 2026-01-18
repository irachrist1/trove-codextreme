import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--color-black-800)] mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-gray-400)]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full bg-[var(--color-white)] border border-[var(--color-gray-100)] rounded-xl',
              'px-4 py-3 text-[var(--color-black-900)] placeholder:text-[var(--color-gray-300)]',
              'focus:outline-none focus:border-[var(--color-black-900)] focus:ring-1 focus:ring-[var(--color-black-900)]',
              'transition-colors duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-[var(--color-red-500)] focus:border-[var(--color-red-500)] focus:ring-[var(--color-red-500)]',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-gray-400)]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-2 text-sm text-[var(--color-red-500)]">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-2 text-sm text-[var(--color-gray-400)]">{hint}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

// Textarea
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--color-black-800)] mb-2"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full bg-[var(--color-white)] border border-[var(--color-gray-100)] rounded-xl',
            'px-4 py-3 text-[var(--color-black-900)] placeholder:text-[var(--color-gray-300)]',
            'focus:outline-none focus:border-[var(--color-black-900)] focus:ring-1 focus:ring-[var(--color-black-900)]',
            'transition-colors duration-200 resize-none',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-[var(--color-red-500)] focus:border-[var(--color-red-500)] focus:ring-[var(--color-red-500)]',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-[var(--color-red-500)]">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-2 text-sm text-[var(--color-gray-400)]">{hint}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

// Select
interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends Omit<InputHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string
  error?: string
  hint?: string
  options: SelectOption[]
  onChange?: (value: string) => void
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, options, id, onChange, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--color-black-800)] mb-2"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn(
            'w-full bg-[var(--color-white)] border border-[var(--color-gray-100)] rounded-xl',
            'px-4 py-3 text-[var(--color-black-900)]',
            'focus:outline-none focus:border-[var(--color-black-900)] focus:ring-1 focus:ring-[var(--color-black-900)]',
            'transition-colors duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-[var(--color-red-500)] focus:border-[var(--color-red-500)] focus:ring-[var(--color-red-500)]',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-2 text-sm text-[var(--color-red-500)]">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-2 text-sm text-[var(--color-gray-400)]">{hint}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
