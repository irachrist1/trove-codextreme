import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/auth'
import { useToast } from '@/components/ui/Toast'

export function VerifyCodePage() {
  const navigate = useNavigate()
  const { verifyCode } = useAuth()
  const { error } = useToast()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await verifyCode(email, code)
      navigate({ to: '/hackathons' })
    } catch (err: any) {
      error(err?.message || 'Verification failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center py-12">
      <Container size="sm">
        <Card className="p-8">
          <h1 className="text-2xl font-semibold text-[var(--color-black-900)] mb-2">Verify code</h1>
          <p className="text-sm text-[var(--color-gray-400)] mb-6">
            Enter the email and code you received.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="One-time code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <Button type="submit" fullWidth isLoading={isSubmitting}>
              Verify and sign in
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
