import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/auth'
import { useToast } from '@/components/ui/Toast'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const { resetPassword } = useAuth()
  const { success, error } = useToast()
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await resetPassword(token, newPassword)
      success('Password updated. You can now sign in.')
      navigate({ to: '/auth/login' })
    } catch (err: any) {
      error(err?.message || 'Reset failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center py-12">
      <Container size="sm">
        <Card className="p-8">
          <h1 className="text-2xl font-semibold text-[var(--color-black-900)] mb-2">Set new password</h1>
          <p className="text-sm text-[var(--color-gray-400)] mb-6">
            Paste your reset token and choose a new password.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Reset token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
            <Input
              label="New password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Button type="submit" fullWidth isLoading={isSubmitting}>
              Update password
            </Button>
          </form>

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
