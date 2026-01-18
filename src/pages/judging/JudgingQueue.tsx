import { useState } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Layers,
  Shuffle,
  ExternalLink,
  Github,
  Video,
} from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar, AvatarGroup } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { usePageView, ANALYTICS_EVENTS, useAnalytics } from '@/lib/posthog'

// Mock judging queue
const mockAssignments = {
  completedCount: 3,
  totalCount: 8,
  submissions: [
    {
      _id: '1',
      projectName: 'MindBridge AI',
      tagline: 'AI-powered mental health support for everyone',
      team: { name: 'Neural Nexus', avatarUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=neural' },
      trackId: 'healthcare',
      demoUrl: 'https://demo.example.com',
      videoUrl: 'https://youtube.com',
      repoUrl: 'https://github.com',
      isScored: true,
      score: 42,
    },
    {
      _id: '2',
      projectName: 'EcoTrack Pro',
      tagline: 'Track your carbon footprint with AI',
      team: { name: 'Green Coders', avatarUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=green' },
      trackId: 'sustainability',
      demoUrl: 'https://demo.example.com',
      repoUrl: 'https://github.com',
      isScored: true,
      score: 38,
    },
    {
      _id: '3',
      projectName: 'LearnPath',
      tagline: 'Personalized learning journeys for everyone',
      team: { name: 'EduTech', avatarUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=edu' },
      trackId: 'education',
      demoUrl: 'https://demo.example.com',
      isScored: true,
      score: 45,
    },
    {
      _id: '4',
      projectName: 'HealthBot',
      tagline: 'Your personal health assistant',
      team: { name: 'MedTech', avatarUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=med' },
      trackId: 'healthcare',
      videoUrl: 'https://youtube.com',
      isScored: false,
    },
    {
      _id: '5',
      projectName: 'ClimateWatch',
      tagline: 'Real-time climate monitoring',
      team: { name: 'Planet Savers', avatarUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=planet' },
      trackId: 'sustainability',
      repoUrl: 'https://github.com',
      isScored: false,
    },
  ],
}

const trackColors: Record<string, string> = {
  healthcare: '#10B981',
  education: '#6366F1',
  sustainability: '#EC4899',
}

export function JudgingPage() {
  const { eventSlug } = useParams({ from: '/judging/$eventSlug' })
  const { track } = useAnalytics()

  usePageView('judging_queue', { event_slug: eventSlug })

  const [filter, setFilter] = useState<'all' | 'pending' | 'scored'>('all')

  const assignments = mockAssignments
  const filteredSubmissions = assignments.submissions.filter((s) => {
    if (filter === 'pending') return !s.isScored
    if (filter === 'scored') return s.isScored
    return true
  })

  const progress = (assignments.completedCount / assignments.totalCount) * 100

  return (
    <div className="py-8">
      <Container>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Judging Dashboard</h1>
          <p className="text-zinc-400">AI for Good Hackathon 2026</p>
        </div>

        {/* Progress */}
        <Card className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Your Progress</h3>
              <p className="text-sm text-zinc-400">
                {assignments.completedCount} of {assignments.totalCount} submissions judged
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-white">{Math.round(progress)}%</span>
            </div>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link to="/judging/$eventSlug/compare" params={{ eventSlug }}>
            <Button
              size="lg"
              leftIcon={<Shuffle className="w-5 h-5" />}
              onClick={() => track(ANALYTICS_EVENTS.JUDGING_SESSION_STARTED, { event_slug: eventSlug, mode: 'compare' })}
            >
              Compare Mode
            </Button>
          </Link>
          <div className="flex gap-2">
            {(['all', 'pending', 'scored'] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : f === 'pending' ? 'Pending' : 'Scored'}
              </Button>
            ))}
          </div>
        </div>

        {/* Submissions Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredSubmissions.map((submission, i) => (
            <motion.div
              key={submission._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card variant={submission.isScored ? 'default' : 'interactive'}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={submission.team.avatarUrl}
                      name={submission.team.name}
                      size="md"
                    />
                    <div>
                      <h3 className="font-semibold text-white">{submission.projectName}</h3>
                      <p className="text-sm text-zinc-500">{submission.team.name}</p>
                    </div>
                  </div>
                  {submission.isScored ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-medium text-emerald-400">{submission.score}/55</span>
                    </div>
                  ) : (
                    <Badge variant="warning" dot>Pending</Badge>
                  )}
                </div>

                <p className="text-sm text-zinc-400 mb-4">{submission.tagline}</p>

                <div className="flex items-center justify-between">
                  <Badge
                    size="sm"
                    style={{
                      backgroundColor: `${trackColors[submission.trackId]}20`,
                      color: trackColors[submission.trackId],
                    }}
                  >
                    {submission.trackId}
                  </Badge>

                  <div className="flex items-center gap-2">
                    {submission.demoUrl && (
                      <a
                        href={submission.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-zinc-400" />
                      </a>
                    )}
                    {submission.videoUrl && (
                      <a
                        href={submission.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                      >
                        <Video className="w-4 h-4 text-zinc-400" />
                      </a>
                    )}
                    {submission.repoUrl && (
                      <a
                        href={submission.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                      >
                        <Github className="w-4 h-4 text-zinc-400" />
                      </a>
                    )}
                  </div>
                </div>

                {!submission.isScored && (
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <Button fullWidth variant="secondary" size="sm">
                      Score This Project
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </Container>
    </div>
  )
}
