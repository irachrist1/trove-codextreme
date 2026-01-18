import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import { useAnalytics, ANALYTICS_EVENTS } from './posthog'

type AuthUser = {
  _id: string
  email: string
  displayName: string
  avatarUrl?: string | null
  roles: string[]
}

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  sessionToken: string | null
  login: (email: string, password: string) => Promise<void>
  register: (payload: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>
  logout: () => Promise<void>
  requestMagicLink: (email: string) => Promise<{ code: string }>
  verifyCode: (email: string, code: string) => Promise<void>
  requestPasswordReset: (email: string) => Promise<{ token: string }>
  resetPassword: (token: string, newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredToken() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem('sessionToken')
}

function storeToken(token: string | null) {
  if (typeof window === 'undefined') return
  if (token) {
    window.localStorage.setItem('sessionToken', token)
  } else {
    window.localStorage.removeItem('sessionToken')
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { identify, reset: resetAnalytics, track } = useAnalytics()
  const [sessionToken, setSessionToken] = useState<string | null>(() => readStoredToken())

  const userQuery = useQuery(
    api.auth.getCurrentUser,
    sessionToken ? { sessionToken } : undefined
  )

  const isLoading = sessionToken ? userQuery === undefined : false
  const user = useMemo(() => {
    if (!sessionToken) return null
    return userQuery ?? null
  }, [sessionToken, userQuery])

  const registerMutation = useMutation(api.auth.register)
  const loginMutation = useMutation(api.auth.login)
  const logoutMutation = useMutation(api.auth.logout)
  const magicLinkMutation = useMutation(api.auth.requestMagicLink)
  const verifyCodeMutation = useMutation(api.auth.verifyCode)
  const requestResetMutation = useMutation(api.auth.requestPasswordReset)
  const resetPasswordMutation = useMutation(api.auth.resetPassword)

  useEffect(() => {
    storeToken(sessionToken)
  }, [sessionToken])

  useEffect(() => {
    if (user) {
      identify(user._id, { email: user.email, name: user.displayName, roles: user.roles })
    }
  }, [user, identify])

  const login = async (email: string, password: string) => {
    const result = await loginMutation({ email, password })
    setSessionToken(result.sessionToken)
    track(ANALYTICS_EVENTS.AUTH_LOGIN_SUCCESS, { method: 'password' })
  }

  const register = async (payload: { email: string; password: string; firstName: string; lastName: string }) => {
    const result = await registerMutation(payload)
    setSessionToken(result.sessionToken)
  }

  const logout = async () => {
    if (sessionToken) {
      await logoutMutation({ sessionToken })
    }
    setSessionToken(null)
    resetAnalytics()
  }

  const requestMagicLink = async (email: string) => {
    const result = await magicLinkMutation({ email })
    return { code: result.code }
  }

  const verifyCode = async (email: string, code: string) => {
    const result = await verifyCodeMutation({ email, code })
    setSessionToken(result.sessionToken)
    track(ANALYTICS_EVENTS.AUTH_LOGIN_SUCCESS, { method: 'magic_link' })
  }

  const requestPasswordReset = async (email: string) => {
    const result = await requestResetMutation({ email })
    return { token: result.token }
  }

  const resetPassword = async (token: string, newPassword: string) => {
    await resetPasswordMutation({ token, newPassword })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        sessionToken,
        login,
        register,
        logout,
        requestMagicLink,
        verifyCode,
        requestPasswordReset,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
