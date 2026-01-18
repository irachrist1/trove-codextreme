import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Plus,
  Users,
  Copy,
  RefreshCw,
  Settings,
  LogOut,
  Crown,
  Code,
  FileText,
} from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { copyToClipboard } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import { usePageView } from '@/lib/posthog'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
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


export function MyTeamPage() {
  const { slug } = useParams({ from: '/hackathons/$slug/team' })
  const navigate = useNavigate()
  const { success } = useToast()
  const { user } = useAuth()

  usePageView('my_team', { event_slug: slug })

  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)

  const event = useQuery(api.events.getBySlug, { slug })
  const team = useQuery(
    api.teams.getUserTeam,
    event && user ? { eventId: event._id, userId: user._id as any } : undefined
  )
  const updateTeam = useMutation(api.teams.update)
  const regenerateInvite = useMutation(api.teams.regenerateInviteCode)
  const leaveTeam = useMutation(api.teams.leave)

  const [teamForm, setTeamForm] = useState({
    name: '',
    description: '',
    isOpenForMembers: true,
    lookingFor: [] as string[],
  })

  useEffect(() => {
    if (team) {
      setTeamForm({
        name: team.name || '',
        description: team.description || '',
        isOpenForMembers: team.isOpenForMembers,
        lookingFor: team.lookingFor || [],
      })
    }
  }, [team])

  const handleCopyInviteCode = async () => {
    if (!team) return
    await copyToClipboard(team.inviteCode)
    success('Invite code copied!')
  }

  const handleCopyInviteLink = async () => {
    if (!team) return
    await copyToClipboard(`${window.location.origin}/join/${team.inviteCode}`)
    success('Invite link copied!')
  }

  const handleRegenerateInvite = async () => {
    if (!team) return
    await regenerateInvite({ teamId: team._id as any })
    success('Invite code updated!')
  }

  const handleSaveSettings = async () => {
    if (!team) return
    await updateTeam({
      teamId: team._id as any,
      updates: {
        name: teamForm.name,
        description: teamForm.description,
        isOpenForMembers: teamForm.isOpenForMembers,
        lookingFor: teamForm.lookingFor,
      },
    })
    setSettingsModalOpen(false)
    success('Team updated')
  }

  const handleLeaveTeam = async () => {
    if (!team || !user) return
    await leaveTeam({ teamId: team._id as any, userId: user._id as any })
    success('Left team')
    navigate({ to: '/hackathons/$slug', params: { slug } })
  }

  if (event === undefined || (event && user && team === undefined)) {
    return (
      <Container className="py-8">
        <Card className="text-center py-12">
          <p className="text-sm text-[var(--color-gray-400)]">Loading team...</p>
        </Card>
      </Container>
    )
  }

  if (!team) {
    return (
      <Container className="py-8">
        <Card className="text-center py-12">
          <Users className="w-12 h-12 text-[var(--color-gray-300)] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[var(--color-black-900)] mb-2">No Team Yet</h2>
          <p className="text-[var(--color-gray-400)] mb-6">Create a team or join one to get started.</p>
          <div className="flex justify-center gap-4">
            <Link to="/hackathons/$slug/team/create" params={{ slug }}>
              <Button>Create Team</Button>
            </Link>
            <Button variant="outline">Join with Code</Button>
          </div>
        </Card>
      </Container>
    )
  }

  return (
    <div className="py-8">
      <Container>
        {/* Back link */}
        <Link
          to="/hackathons/$slug"
          params={{ slug }}
          className="inline-flex items-center gap-2 text-[var(--color-gray-400)] hover:text-[var(--color-black-900)] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to event
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Team Header */}
            <Card>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-[var(--color-black-900)] mb-2">{team.name}</h1>
                  <p className="text-[var(--color-gray-400)]">{team.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Settings className="w-4 h-4" />}
                  onClick={() => setSettingsModalOpen(true)}
                >
                  Settings
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Healthcare Track</Badge>
                {team.isOpenForMembers && (
                  <Badge variant="success" dot>
                    Open for Members
                  </Badge>
                )}
              </div>
            </Card>

            {/* Team Members */}
            <Card>
              <CardHeader
                title="Team Members"
                description={`${team.members.length} of 5 members`}
                action={
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<Plus className="w-4 h-4" />}
                    onClick={() => setInviteModalOpen(true)}
                  >
                    Invite
                  </Button>
                }
              />

                <div className="space-y-4">
                  {team.members.map((member) => (
                    <motion.div
                      key={member.userId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-4 p-4 bg-[var(--color-offwhite-4)] rounded-xl"
                    >
                    <Avatar
                      src={member.user.avatarUrl}
                      name={member.user.displayName}
                      size="lg"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[var(--color-black-900)]">{member.user.displayName}</span>
                        {member.isLeader && <Crown className="w-4 h-4 text-[var(--color-black-700)]" />}
                      </div>
                      <p className="text-sm text-[var(--color-gray-400)]">{member.role}</p>
                      <div className="flex gap-2 mt-2">
                        {member.user.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} size="sm" variant="default">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Looking for */}
              {team.lookingFor.length > 0 && (
                <div className="mt-6 pt-6 border-t border-[var(--color-gray-100)]">
                  <p className="text-sm text-[var(--color-gray-400)] mb-3">Looking for:</p>
                  <div className="flex flex-wrap gap-2">
                    {team.lookingFor.map((role) => (
                      <Badge key={role} variant="default">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Link to="/hackathons/$slug/submission" params={{ slug }}>
                <Card variant="interactive" className="h-full">
                  <FileText className="w-8 h-8 text-[var(--color-black-700)] mb-3" />
                  <h3 className="font-medium text-[var(--color-black-900)] mb-1">Submission</h3>
                  <p className="text-sm text-[var(--color-gray-400)]">Create or edit your project submission</p>
                </Card>
              </Link>
              <Card variant="interactive" className="h-full cursor-pointer">
                <Code className="w-8 h-8 text-[var(--color-black-700)] mb-3" />
                <h3 className="font-medium text-[var(--color-black-900)] mb-1">Project Repo</h3>
                <p className="text-sm text-[var(--color-gray-400)]">Connect your GitHub repository</p>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Invite Card */}
            <Card>
              <h3 className="font-medium text-[var(--color-black-900)] mb-4">Invite Teammates</h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={team.inviteCode}
                    readOnly
                    className="font-mono text-center"
                  />
                  <Button variant="secondary" onClick={handleCopyInviteCode}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  fullWidth
                  leftIcon={<Copy className="w-4 h-4" />}
                  onClick={handleCopyInviteLink}
                >
                  Copy Invite Link
                </Button>
              </div>
            </Card>

            {/* Leave Team */}
            <Card>
              <Button
                variant="ghost"
                fullWidth
                leftIcon={<LogOut className="w-4 h-4" />}
                className="text-[var(--color-red-500)] hover:text-[var(--color-red-400)] hover:bg-[var(--color-red-50)]"
                onClick={handleLeaveTeam}
              >
                Leave Team
              </Button>
            </Card>
          </div>
        </div>
      </Container>

      {/* Invite Modal */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite Teammates"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[var(--color-black-800)] mb-2">Invite Code</label>
            <div className="flex gap-2">
              <Input value={team.inviteCode} readOnly className="font-mono text-lg text-center" />
              <Button variant="secondary" onClick={handleCopyInviteCode}>
                <Copy className="w-4 h-4" />
              </Button>
              <Button variant="ghost" onClick={handleRegenerateInvite}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-[var(--color-gray-400)] mt-2">Share this code with your teammates</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-black-800)] mb-2">Invite Link</label>
            <div className="flex gap-2">
              <Input
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/join/${team.inviteCode}`}
                readOnly
                className="text-sm"
              />
              <Button variant="secondary" onClick={handleCopyInviteLink}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Settings Modal */}
      <Modal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        title="Team Settings"
        size="lg"
      >
        <div className="space-y-6">
          <Input
            label="Team Name"
            value={teamForm.name}
            onChange={(e) => setTeamForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <Input
            label="Description"
            value={teamForm.description}
            onChange={(e) => setTeamForm((prev) => ({ ...prev, description: e.target.value }))}
          />

          <div>
            <label className="block text-sm font-medium text-[var(--color-black-800)] mb-2">Track</label>
            <div className="flex gap-2">
              <Badge variant="default">{team.trackId || 'General'}</Badge>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-black-800)] mb-2">Looking For</label>
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => (
                <Badge
                  key={role}
                  variant={teamForm.lookingFor.includes(role) ? 'default' : 'default'}
                  className="cursor-pointer"
                  onClick={() =>
                    setTeamForm((prev) => ({
                      ...prev,
                      lookingFor: prev.lookingFor.includes(role)
                        ? prev.lookingFor.filter((r) => r !== role)
                        : [...prev.lookingFor, role],
                    }))
                  }
                >
                  {role}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-gray-100)]">
            <Button variant="ghost" onClick={() => setSettingsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
