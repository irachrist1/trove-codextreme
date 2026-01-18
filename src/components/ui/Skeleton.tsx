import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'shimmer',
        variant === 'text' && 'h-4 rounded',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded-xl',
        className
      )}
      style={{
        width: width || (variant === 'circular' ? height : '100%'),
        height: height || (variant === 'text' ? undefined : '100%'),
      }}
      {...props}
    />
  )
}

// Event card skeleton
export function EventCardSkeleton() {
  return (
    <div className="bg-[var(--color-white)] border border-[var(--color-gray-100)] rounded-2xl p-6">
      <div className="flex gap-4">
        <Skeleton variant="rectangular" width={80} height={80} className="rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton width="60%" height={20} />
          <Skeleton width="40%" height={16} />
          <Skeleton width="80%" height={14} />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton width={80} height={24} className="rounded-full" />
        <Skeleton width={100} height={24} className="rounded-full" />
      </div>
    </div>
  )
}

// Team card skeleton
export function TeamCardSkeleton() {
  return (
    <div className="bg-[var(--color-white)] border border-[var(--color-gray-100)] rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="space-y-2">
          <Skeleton width={120} height={18} />
          <Skeleton width={80} height={14} />
        </div>
      </div>
      <Skeleton width="100%" height={40} className="rounded-xl" />
      <div className="mt-4 flex gap-2">
        <Skeleton width={60} height={20} className="rounded-full" />
        <Skeleton width={70} height={20} className="rounded-full" />
      </div>
    </div>
  )
}

// Leaderboard row skeleton
export function LeaderboardRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-[var(--color-white)] border border-[var(--color-gray-100)] rounded-xl">
      <Skeleton width={32} height={32} className="rounded-lg" />
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1 space-y-2">
        <Skeleton width="50%" height={16} />
        <Skeleton width="30%" height={14} />
      </div>
      <Skeleton width={60} height={24} className="rounded-full" />
    </div>
  )
}
