import { useState } from 'react'
import { Link, useParams, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { ArrowLeft, Users, Sparkles } from 'lucide-react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { usePageView, ANALYTICS_EVENTS, useAnalytics } from '@/lib/posthog'
import { useAuth } from '@/lib/auth'

const roles = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'ML/AI Engineer',
  'UI/UX Designer',
  'Product Manager',
  'Data Scientist',
]

export function CreateTeamPage() {
  const { slug } = useParams({ from: '/hackathons/$slug/team/create' })
  const navigate = useNavigate()
  const { success, error } = useToast()
  const { track } = useAnalytics()
  const { user } = useAuth()

  usePageView('create_team', { event_slug: slug })

  const event = useQuery(api.events.getBySlug, { slug })
  const createTeam = useMutation(api.teams.create)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trackId: '',
    isOpenForMembers: true,
    lookingFor: [] as string[],
  })

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleLookingFor = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      lookingFor: prev.lookingFor.includes(role)
        ? prev.lookingFor.filter((r) => r !== role)
        : [...prev.lookingFor, role],
    }))
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      error('Please enter a team name')
      return
    }
    if (!event || !user) {
      error('Event or user not available')
      return
    }

    setIsSubmitting(true)
    try {
      await createTeam({
        eventId: event._id,
        name: formData.name,
        description: formData.description,
        trackId: formData.trackId || undefined,
        leaderId: user._id as any,
        isOpenForMembers: formData.isOpenForMembers,
        lookingFor: formData.lookingFor,
      })

      track(ANALYTICS_EVENTS.TEAM_CREATED, {
        event_slug: slug,
        track_id: formData.trackId,
        is_open: formData.isOpenForMembers,
      })

      success('Team created successfully!')
      navigate({ to: '/hackathons/$slug/team', params: { slug } })
    } catch (err) {
      error('Failed to create team. Please try again.')
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[var(--color-gray-100)] rounded-xl">
                <Users className="w-6 h-6 text-[var(--color-black-700)]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--color-black-900)]">Create Your Team</h1>
                <p className="text-sm text-[var(--color-gray-400)]">Assemble your dream team for the hackathon</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Team Name */}
              <Input
                label="Team Name"
                placeholder="e.g., Neural Nexus, Code Crusaders"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                hint="Choose a memorable name for your team"
              />

              {/* Description */}
              <Textarea
                label="Description"
                placeholder="What are you planning to build? What's your team's focus?"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={3}
              />

              {/* Track Selection */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-black-800)] mb-3">
                  Choose a Track
                </label>
                <div className="grid gap-3">
                  {event.tracks.map((t: any) => (
                    <button
                      key={t.id}
                      onClick={() => updateField('trackId', t.id)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        formData.trackId === t.id
                          ? 'border-[var(--color-black-900)] bg-[var(--color-offwhite-4)]'
                          : 'border-[var(--color-gray-100)] bg-[var(--color-offwhite-3)] hover:border-[var(--color-gray-200)]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: t.color }}
                        />
                        <span className="font-medium text-[var(--color-black-900)]">{t.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Open for Members Toggle */}
              <div className="p-4 bg-[var(--color-offwhite-4)] rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-[var(--color-black-900)] mb-1">Open for new members</h3>
                    <p className="text-sm text-[var(--color-gray-400)]">
                      Allow other participants to request to join your team
                    </p>
                  </div>
                  <button
                    onClick={() => updateField('isOpenForMembers', !formData.isOpenForMembers)}
                    className={`w-12 h-7 rounded-full transition-colors ${
                      formData.isOpenForMembers ? 'bg-[var(--color-black-900)]' : 'bg-[var(--color-gray-200)]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        formData.isOpenForMembers ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Looking For Roles */}
              {formData.isOpenForMembers && (
                <div>
                  <label className="block text-sm font-medium text-[var(--color-black-800)] mb-3">
                    What roles are you looking for?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {roles.map((role) => (
                      <button
                        key={role}
                        onClick={() => toggleLookingFor(role)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          formData.lookingFor.includes(role)
                            ? 'bg-[var(--color-black-900)] text-[var(--color-white)]'
                            : 'bg-[var(--color-offwhite-3)] text-[var(--color-black-800)] hover:bg-[var(--color-offwhite-4)]'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-gray-100)]">
                <Link to="/hackathons/$slug" params={{ slug }}>
                  <Button variant="ghost">Cancel</Button>
                </Link>
                <Button
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                  className="bg-[var(--color-red-500)] hover:bg-[var(--color-red-400)]"
                >
                  Create Team
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </Container>
    </div>
  )
}
