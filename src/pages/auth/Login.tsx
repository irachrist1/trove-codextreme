import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/auth'
import { useToast } from '@/components/ui/Toast'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { error } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await login(email, password)
      navigate({ to: '/hackathons' })
    } catch (err: any) {
      error(err?.message || 'Login failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center py-12">
      <Container size="sm">
        <Card className="p-8">
          <h1 className="text-2xl font-semibold text-[var(--color-black-900)] mb-2">Welcome back</h1>
          <p className="text-sm text-[var(--color-gray-400)] mb-6">
            Sign in to continue to Trove.
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
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              type="submit"
              fullWidth
              isLoading={isSubmitting}
              className="bg-[var(--color-red-500)] hover:bg-[var(--color-red-400)]"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-sm text-[var(--color-gray-400)]">
            <Link to="/auth/forgot" className="text-[var(--color-info-500)]">
              Forgot password?
            </Link>
          </div>

          <div className="mt-4 text-sm text-[var(--color-gray-400)]">
            No account?{' '}
            <Link to="/auth/register" className="text-[var(--color-info-500)]">
              Create one
            </Link>
          </div>
        </Card>
      </Container>
    </div>
  )
}
