import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/auth'
import { useToast } from '@/components/ui/Toast'

export function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const { error } = useToast()

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await register({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
      })
      navigate({ to: '/hackathons' })
    } catch (err: any) {
      error(err?.message || 'Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center py-12">
      <Container size="sm">
        <Card className="p-8">
          <h1 className="text-2xl font-semibold text-[var(--color-black-900)] mb-2">Create your account</h1>
          <p className="text-sm text-[var(--color-gray-400)] mb-6">
            Join Trove and start building.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First name"
                value={form.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                required
              />
              <Input
                label="Last name"
                value={form.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
                required
              />
            </div>
            <Input
              label="Email"
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Create a password"
              value={form.password}
              onChange={(e) => updateField('password', e.target.value)}
              required
            />
            <Button
              type="submit"
              fullWidth
              isLoading={isSubmitting}
              className="bg-[var(--color-red-500)] hover:bg-[var(--color-red-400)]"
            >
              Create Account
            </Button>
          </form>

          <div className="mt-4 text-sm text-[var(--color-gray-400)]">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-[var(--color-info-500)]">
              Sign in
            </Link>
          </div>
        </Card>
      </Container>
    </div>
  )
}
