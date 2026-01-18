import { ReactNode, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/lib/auth'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: '/auth/login' })
    }
  }, [isLoading, user, navigate])

  if (isLoading || !user) {
    return <div className="p-8 text-sm text-[var(--color-gray-400)]">Loading...</div>
  }

  return <>{children}</>
}

export function RequireRole({
  roles,
  children,
}: {
  roles: string[]
  children: ReactNode
}) {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: '/auth/login' })
      return
    }
    if (!isLoading && user && !roles.some((role) => user.roles.includes(role))) {
      navigate({ to: '/' })
    }
  }, [isLoading, user, roles, navigate])

  if (isLoading || !user) {
    return <div className="p-8 text-sm text-[var(--color-gray-400)]">Loading...</div>
  }

  if (!roles.some((role) => user.roles.includes(role))) {
    return <div className="p-8 text-sm text-[var(--color-gray-400)]">Not authorized.</div>
  }

  return <>{children}</>
}
