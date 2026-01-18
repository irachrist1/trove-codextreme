import { useState } from 'react'
import { Link, useParams, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Users, ArrowRight, Check, AlertCircle } from 'lucide-react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Avatar, AvatarGroup } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import { usePageView, useAnalytics } from '@/lib/posthog'
import { useAuth } from '@/lib/auth'

const roleOptions = [
  { value: '', label: 'Select your role' },
  { value: 'frontend', label: 'Frontend Developer' },
  { value: 'backend', label: 'Backend Developer' },
  { value: 'fullstack', label: 'Full Stack Developer' },
  { value: 'ml', label: 'ML/AI Engineer' },
  { value: 'designer', label: 'UI/UX Designer' },
  { value: 'pm', label: 'Product Manager' },
]

export function JoinTeamPage() {
  const { inviteCode } = useParams({ from: '/join/$inviteCode' })
  const navigate = useNavigate()
  const { success, error } = useToast()
  const { track } = useAnalytics()
  const { user } = useAuth()

  usePageView('join_team', { invite_code: inviteCode })

  const [isJoining, setIsJoining] = useState(false)
  const team = useQuery(api.teams.getByInviteCode, { inviteCode })
  const joinTeam = useMutation(api.teams.joinByInviteCode)
  const [role, setRole] = useState('')

  const handleJoin = async () => {
    if (!role) {
      error('Please select your role')
      return
    }

    if (!team || !user) return
    setIsJoining(true)
    try {
      await joinTeam({
        inviteCode,
        userId: user._id as any,
        role,
      })

      success('Successfully joined the team!')
      navigate({ to: '/hackathons/$slug/team', params: { slug: team!.event.slug } })
    } catch (err) {
      error((err as any)?.message || 'Failed to join team. Please try again.')
    } finally {
      setIsJoining(false)
    }
  }

  if (team === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8">
        <Container size="sm">
          <Card className="text-center py-12">
            <Skeleton variant="circular" width={64} height={64} className="mx-auto mb-4" />
            <Skeleton width="60%" height={24} className="mx-auto mb-2" />
            <Skeleton width="80%" height={16} className="mx-auto" />
          </Card>
        </Container>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8">
        <Container size="sm">
          <Card className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-[var(--color-red-50)] flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-[var(--color-red-500)]" />
            </div>
            <h1 className="text-xl font-bold text-[var(--color-black-900)] mb-2">Invalid Invite Code</h1>
            <p className="text-[var(--color-gray-400)] mb-6">
              This invite code is invalid or has expired. Please check the code and try again.
            </p>
            <Link to="/hackathons">
              <Button>Browse Events</Button>
            </Link>
          </Card>
        </Container>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-8">
      <Container size="sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="text-center">
            {/* Team Info */}
            <div className="p-6 border-b border-[var(--color-gray-100)]">
              <div className="w-16 h-16 rounded-full bg-[var(--color-gray-100)] flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-[var(--color-black-700)]" />
              </div>
              <h1 className="text-xl font-bold text-[var(--color-black-900)] mb-1">{team.name}</h1>
              <p className="text-sm text-[var(--color-gray-400)] mb-4">{team.description}</p>

              <div className="flex items-center justify-center gap-4 text-sm text-[var(--color-gray-400)]">
                <Badge variant="default">Healthcare Track</Badge>
                <span>{team.memberCount}/{team.maxTeamSize} members</span>
              </div>

              {/* Team Members Preview */}
              <div className="flex justify-center mt-6">
                <AvatarGroup
                  avatars={team.members.map((m) => ({ src: m.avatarUrl, name: m.name }))}
                  size="md"
                />
              </div>
            </div>

            {/* Join Form */}
            <div className="p-6">
              <h2 className="text-lg font-semibold text-[var(--color-black-900)] mb-4">Join this team</h2>

              <div className="mb-6">
                <Select
                  label="Your Role"
                  options={roleOptions}
                  value={role}
                  onChange={setRole}
                />
              </div>

              <Button
                fullWidth
                size="lg"
                onClick={handleJoin}
                isLoading={isJoining}
                className="bg-[var(--color-red-500)] hover:bg-[var(--color-red-400)]"
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Join {team.name}
              </Button>

              <p className="text-xs text-[var(--color-gray-400)] mt-4">
                By joining, you'll be part of this team for{' '}
                <span className="text-[var(--color-black-700)]">{team.event.title}</span>
              </p>
            </div>
          </Card>

          {/* Alternative */}
          <p className="text-center text-sm text-[var(--color-gray-400)] mt-6">
            Have a different code?{' '}
            <Link to="/hackathons" className="text-[var(--color-info-500)]">
              Enter it manually
            </Link>
          </p>
        </motion.div>
      </Container>
    </div>
  )
}
