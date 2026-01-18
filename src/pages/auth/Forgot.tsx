import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/auth'
import { useToast } from '@/components/ui/Toast'

export function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth()
  const { success, error } = useToast()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const result = await requestPasswordReset(email)
      setToken(result.token)
      success('Password reset requested. Use the token below to reset.')
    } catch (err: any) {
      error(err?.message || 'Request failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center py-12">
      <Container size="sm">
        <Card className="p-8">
          <h1 className="text-2xl font-semibold text-[var(--color-black-900)] mb-2">Reset password</h1>
          <p className="text-sm text-[var(--color-gray-400)] mb-6">
            Enter your email to request a reset token.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" fullWidth isLoading={isSubmitting}>
              Request reset
            </Button>
          </form>

          {token && (
            <div className="mt-4 text-sm text-[var(--color-gray-400)]">
              Reset token: <span className="text-[var(--color-black-900)]">{token}</span>
            </div>
          )}

          <div className="mt-4 text-sm text-[var(--color-gray-400)]">
            <Link to="/auth/login" className="text-[var(--color-info-500)]">
              Back to login
            </Link>
          </div>
        </Card>
      </Container>
    </div>
  )
}
