import { useState } from 'react'
import { Link, useParams, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { ArrowLeft, Check, Users, Code, Zap } from 'lucide-react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { usePageView, ANALYTICS_EVENTS, useAnalytics } from '@/lib/posthog'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/lib/auth'

const experienceOptions = [
  { value: '', label: 'Select your experience level' },
  { value: 'beginner', label: 'Beginner (0-1 years)' },
  { value: 'intermediate', label: 'Intermediate (1-3 years)' },
  { value: 'advanced', label: 'Advanced (3-5 years)' },
  { value: 'expert', label: 'Expert (5+ years)' },
]

const roleOptions = [
  { value: 'frontend', label: 'Frontend Developer' },
  { value: 'backend', label: 'Backend Developer' },
  { value: 'fullstack', label: 'Full Stack Developer' },
  { value: 'ml', label: 'ML/AI Engineer' },
  { value: 'designer', label: 'UI/UX Designer' },
  { value: 'pm', label: 'Product Manager' },
  { value: 'data', label: 'Data Scientist' },
  { value: 'other', label: 'Other' },
]

export function RegisterPage() {
  const { slug } = useParams({ from: '/hackathons/$slug/register' })
  const navigate = useNavigate()
  const { track } = useAnalytics()
  const { success, error } = useToast()
  const { user } = useAuth()

  usePageView('registration_form', { event_slug: slug })

  const event = useQuery(api.events.getBySlug, { slug })
  const existingRegistration = useQuery(
    api.registrations.checkRegistration,
    event && user ? { eventId: event._id, userId: user._id as any } : undefined
  )
  const registerMutation = useMutation(api.registrations.register)

  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    experience: '',
    motivation: '',
    lookingForTeam: true,
    preferredRoles: [] as string[],
    dietaryRestrictions: '',
    tshirtSize: '',
    agreeToRules: false,
  })

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleRole = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      preferredRoles: prev.preferredRoles.includes(role)
        ? prev.preferredRoles.filter((r) => r !== role)
        : [...prev.preferredRoles, role],
    }))
  }

  const handleSubmit = async () => {
    if (!event || !user) return
    setIsSubmitting(true)
    try {
      await registerMutation({
        eventId: event._id,
        userId: user._id as any,
        experience: formData.experience,
        motivation: formData.motivation,
        dietaryRestrictions: formData.dietaryRestrictions,
        tshirtSize: formData.tshirtSize,
        emergencyContact: undefined,
        lookingForTeam: formData.lookingForTeam,
        preferredTrackId: undefined,
        lookingForRoles: formData.preferredRoles,
      })

      track(ANALYTICS_EVENTS.EVENT_REGISTER_COMPLETE, {
        event_slug: slug,
        looking_for_team: formData.lookingForTeam,
        experience: formData.experience,
      })

      success('Registration successful! Welcome to the hackathon.')
      navigate({ to: '/hackathons/$slug', params: { slug } })
    } catch (err) {
      error((err as any)?.message || 'Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (event === undefined) {
    return (
      <Container className="py-8">
        <Card className="p-8 text-center">
          <p className="text-sm text-[var(--color-gray-400)]">Loading event...</p>
        </Card>
      </Container>
    )
  }

  if (!event) {
    return (
      <Container className="py-8">
        <Card className="p-8 text-center">
          <p className="text-sm text-[var(--color-gray-400)]">Event not found.</p>
        </Card>
      </Container>
    )
  }

  if (existingRegistration && existingRegistration.status) {
    return (
      <Container className="py-8">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-[var(--color-black-900)] mb-2">You are registered</h2>
          <p className="text-sm text-[var(--color-gray-400)] mb-6">Status: {existingRegistration.status}</p>
          <Link to="/hackathons/$slug/team" params={{ slug }}>
            <Button>Go to Team</Button>
          </Link>
        </Card>
      </Container>
    )
  }

  return (
    <div className="py-8 min-h-screen">
      <Container size="md">
        {/* Back link */}
        <Link
          to="/hackathons/$slug"
          params={{ slug }}
          className="inline-flex items-center gap-2 text-[var(--color-gray-400)] hover:text-[var(--color-black-900)] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to event
        </Link>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s <= step ? 'bg-[var(--color-black-900)]' : 'bg-[var(--color-gray-100)]'
              }`}
            />
          ))}
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          {step === 1 && (
            <Card>
              <h1 className="text-headline mb-2">Tell us about yourself</h1>
              <p className="text-[var(--color-gray-400)] mb-8">Help us match you with the right team and resources.</p>

              <div className="space-y-6">
                <Select
                  label="Experience Level"
                  options={experienceOptions}
                  value={formData.experience}
                  onChange={(value) => updateField('experience', value)}
                />

                <Textarea
                  label="Why do you want to participate?"
                  placeholder="What excites you about this hackathon? What do you hope to build or learn?"
                  value={formData.motivation}
                  onChange={(e) => updateField('motivation', e.target.value)}
                  rows={4}
                />

                <div className="flex justify-end">
                  <Button onClick={() => setStep(2)} disabled={!formData.experience}>
                    Continue
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <h1 className="text-headline mb-2">Team Preferences</h1>
              <p className="text-[var(--color-gray-400)] mb-8">Let us know if you need help finding teammates.</p>

              <div className="space-y-6">
                {/* Looking for team toggle */}
                <div className="p-4 bg-[var(--color-offwhite-4)] rounded-xl">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-[var(--color-gray-100)] rounded-lg">
                      <Users className="w-5 h-5 text-[var(--color-black-700)]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-[var(--color-black-900)] mb-1">Looking for teammates?</h3>
                      <p className="text-sm text-[var(--color-gray-400)]">
                        We'll help connect you with other participants looking for team members.
                      </p>
                    </div>
                    <button
                      onClick={() => updateField('lookingForTeam', !formData.lookingForTeam)}
                      className={`w-12 h-7 rounded-full transition-colors ${
                        formData.lookingForTeam ? 'bg-[var(--color-black-900)]' : 'bg-[var(--color-gray-200)]'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full transition-transform ${
                          formData.lookingForTeam ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Role selection */}
                {formData.lookingForTeam && (
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-black-800)] mb-3">
                      What roles can you fill?
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {roleOptions.map((role) => (
                        <button
                          key={role.value}
                          onClick={() => toggleRole(role.value)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            formData.preferredRoles.includes(role.value)
                              ? 'bg-[var(--color-black-900)] text-[var(--color-white)]'
                              : 'bg-[var(--color-offwhite-3)] text-[var(--color-black-800)] hover:bg-[var(--color-offwhite-4)]'
                          }`}
                        >
                          {role.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button onClick={() => setStep(3)}>Continue</Button>
                </div>
              </div>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <h1 className="text-headline mb-2">Almost there!</h1>
              <p className="text-[var(--color-gray-400)] mb-8">Just a few more details and you're all set.</p>

              <div className="space-y-6">
                <Select
                  label="T-Shirt Size (optional)"
                  options={[
                    { value: '', label: 'Select size' },
                    { value: 'xs', label: 'XS' },
                    { value: 's', label: 'S' },
                    { value: 'm', label: 'M' },
                    { value: 'l', label: 'L' },
                    { value: 'xl', label: 'XL' },
                    { value: '2xl', label: '2XL' },
                  ]}
                  value={formData.tshirtSize}
                  onChange={(value) => updateField('tshirtSize', value)}
                />

                <Input
                  label="Dietary Restrictions (optional)"
                  placeholder="e.g., Vegetarian, Vegan, Gluten-free"
                  value={formData.dietaryRestrictions}
                  onChange={(e) => updateField('dietaryRestrictions', e.target.value)}
                />

                {/* Agreement */}
                <div className="p-4 bg-[var(--color-offwhite-4)] rounded-xl">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <button
                      onClick={() => updateField('agreeToRules', !formData.agreeToRules)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                        formData.agreeToRules
                          ? 'bg-[var(--color-black-900)] border-[var(--color-black-900)]'
                          : 'border-[var(--color-gray-300)]'
                      }`}
                    >
                      {formData.agreeToRules && <Check className="w-3 h-3 text-[var(--color-white)]" />}
                    </button>
                    <span className="text-sm text-[var(--color-black-800)]">
                      I agree to the hackathon rules and code of conduct. I understand that my
                      participation is subject to approval by the organizers.
                    </span>
                  </label>
                </div>

                <div className="flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    isLoading={isSubmitting}
                    disabled={!formData.agreeToRules}
                    className="bg-[var(--color-red-500)] hover:bg-[var(--color-red-400)]"
                  >
                    Complete Registration
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </motion.div>

        {/* Benefits reminder */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          {[
            { icon: Zap, label: 'Build Something Amazing' },
            { icon: Users, label: 'Meet Great People' },
            { icon: Code, label: 'Learn New Skills' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center p-4">
              <item.icon className="w-6 h-6 text-[var(--color-black-700)] mb-2" />
              <span className="text-xs text-[var(--color-gray-400)]">{item.label}</span>
            </div>
          ))}
        </div>
      </Container>
    </div>
  )
}
