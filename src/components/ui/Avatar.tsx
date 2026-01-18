import { HTMLAttributes } from 'react'
import { cn, getInitials, stringToColor } from '@/lib/utils'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null
  name: string
  size?: AvatarSize
  showBorder?: boolean
}

const sizes: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
}

export function Avatar({ className, src, name, size = 'md', showBorder, ...props }: AvatarProps) {
  const initials = getInitials(name)
  const bgColor = stringToColor(name)

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full overflow-hidden flex-shrink-0',
        sizes[size],
        showBorder && 'ring-2 ring-[var(--color-gray-100)]',
        className
      )}
      style={{ backgroundColor: src ? undefined : bgColor }}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <span className="font-semibold text-[var(--color-white)]">{initials}</span>
      )}
    </div>
  )
}

// Avatar group for teams
interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  avatars: { src?: string | null; name: string }[]
  max?: number
  size?: AvatarSize
}

export function AvatarGroup({ className, avatars, max = 4, size = 'sm', ...props }: AvatarGroupProps) {
  const displayed = avatars.slice(0, max)
  const remaining = avatars.length - max

  return (
    <div className={cn('flex -space-x-2', className)} {...props}>
      {displayed.map((avatar, i) => (
        <Avatar
          key={i}
          src={avatar.src}
          name={avatar.name}
          size={size}
          showBorder
        />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-[var(--color-gray-100)] ring-2 ring-[var(--color-gray-100)]',
            sizes[size]
          )}
        >
          <span className="text-xs font-medium text-[var(--color-black-700)]">+{remaining}</span>
        </div>
      )}
    </div>
  )
}
