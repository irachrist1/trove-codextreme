import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Medal, Star, Filter, ChevronUp, ChevronDown, ExternalLink } from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Input'
import { LeaderboardRowSkeleton } from '@/components/ui/Skeleton'
import { usePageView, ANALYTICS_EVENTS, useAnalytics } from '@/lib/posthog'

// Mock leaderboard data
const mockLeaderboard = [
  {
    rank: 1,
    teamName: 'Neural Nexus',
    projectName: 'MindBridge AI',
    score: 52.5,
    avatarUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=neural',
    trackId: 'healthcare',
    change: 0,
  },
  {
    rank: 2,
    teamName: 'EduTech',
    projectName: 'LearnPath',
    score: 48.2,
    avatarUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=edu',
    trackId: 'education',
    change: 2,
  },
  {
    rank: 3,
    teamName: 'Green Coders',
    projectName: 'EcoTrack Pro',
    score: 46.8,
    avatarUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=green',
    trackId: 'sustainability',
    change: -1,
  },
  {
    rank: 4,
    teamName: 'MedTech',
    projectName: 'HealthBot',
    score: 44.1,
    avatarUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=med',
    trackId: 'healthcare',
    change: 1,
  },
  {
    rank: 5,
    teamName: 'Planet Savers',
    projectName: 'ClimateWatch',
    score: 42.5,
    avatarUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=planet',
    trackId: 'sustainability',
    change: -2,
  },
  {
    rank: 6,
    teamName: 'Code Warriors',
    projectName: 'StudyBuddy',
    score: 40.3,
    avatarUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=code',
    trackId: 'education',
    change: 0,
  },
  {
    rank: 7,
    teamName: 'Health Hackers',
    projectName: 'NutriScan',
    score: 38.9,
    avatarUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=health',
    trackId: 'healthcare',
    change: 1,
  },
  {
    rank: 8,
    teamName: 'Eco Innovators',
    projectName: 'WasteWise',
    score: 37.2,
    avatarUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=eco',
    trackId: 'sustainability',
    change: -1,
  },
]

const tracks = [
  { value: 'all', label: 'All Tracks' },
  { value: 'healthcare', label: 'Healthcare & Wellness' },
  { value: 'education', label: 'Education & Learning' },
  { value: 'sustainability', label: 'Climate & Sustainability' },
]

const trackColors: Record<string, string> = {
  healthcare: '#10B981',
  education: '#6366F1',
  sustainability: '#EC4899',
}

export function LeaderboardPage() {
  const { track } = useAnalytics()
  usePageView('leaderboard')

  const [selectedTrack, setSelectedTrack] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [showReveal, setShowReveal] = useState(false)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
      setShowReveal(true)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const filteredLeaderboard = mockLeaderboard.filter(
    (entry) => selectedTrack === 'all' || entry.trackId === selectedTrack
  )

  const topThree = filteredLeaderboard.slice(0, 3)
  const rest = filteredLeaderboard.slice(3)

  return (
    <div className="py-8">
      <Container>
        <PageHeader
          title="Leaderboard"
          description="Real-time rankings for AI for Good Hackathon 2026"
          actions={
            <div className="w-48">
              <Select
                options={tracks}
                value={selectedTrack}
                onChange={setSelectedTrack}
              />
            </div>
          }
        />

        {isLoading ? (
          <div className="space-y-4">
            <LeaderboardRowSkeleton />
            <LeaderboardRowSkeleton />
            <LeaderboardRowSkeleton />
            <LeaderboardRowSkeleton />
            <LeaderboardRowSkeleton />
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            <AnimatePresence>
              {showReveal && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="grid md:grid-cols-3 gap-4 mb-8"
                >
                  {/* Second Place */}
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="md:order-1 md:mt-8"
                  >
                    <PodiumCard entry={topThree[1]} place={2} />
                  </motion.div>

                  {/* First Place */}
                  <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="md:order-2"
                  >
                    <PodiumCard entry={topThree[0]} place={1} isWinner />
                  </motion.div>

                  {/* Third Place */}
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="md:order-3 md:mt-12"
                  >
                    <PodiumCard entry={topThree[2]} place={3} />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Rest of the leaderboard */}
            <Card padding="none">
              <div className="divide-y divide-[var(--color-gray-100)]">
                {rest.map((entry, i) => (
                  <motion.div
                    key={entry.rank}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.05 }}
                  >
                    <LeaderboardRow entry={entry} />
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Last updated */}
            <p className="text-center text-xs text-[var(--color-gray-400)] mt-6">
              Last updated: {new Date().toLocaleTimeString()}
            </p>
          </>
        )}
      </Container>
    </div>
  )
}

// Podium Card for top 3
function PodiumCard({
  entry,
  place,
  isWinner,
}: {
  entry: typeof mockLeaderboard[0]
  place: number
  isWinner?: boolean
}) {
  const placeIcons = {
    1: <Trophy className="w-8 h-8 text-[var(--color-warning-500)]" />,
    2: <Medal className="w-7 h-7 text-[var(--color-gray-300)]" />,
    3: <Medal className="w-6 h-6 text-[var(--color-warning-400)]" />,
  }

  return (
    <Card
      variant={isWinner ? 'gradient' : 'elevated'}
      className={`text-center relative overflow-hidden ${isWinner ? 'pulse-glow' : ''}`}
    >
      {isWinner && (
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-warning-100)] to-transparent pointer-events-none" />
      )}

      <div className="relative">
        <div className="flex justify-center mb-4">
          {placeIcons[place as keyof typeof placeIcons]}
        </div>

        <Avatar
          src={entry.avatarUrl}
          name={entry.teamName}
          size="xl"
          className="mx-auto mb-4"
        />

        <h3 className="font-bold text-[var(--color-black-900)] text-lg mb-1">{entry.teamName}</h3>
        <p className="text-sm text-[var(--color-gray-400)] mb-3">{entry.projectName}</p>

        <Badge
          size="sm"
          style={{
            backgroundColor: `${trackColors[entry.trackId]}20`,
            color: trackColors[entry.trackId],
          }}
        >
          {entry.trackId}
        </Badge>

        <div className="mt-4 pt-4 border-t border-[var(--color-gray-100)]">
          <span className="text-2xl font-bold text-[var(--color-black-900)]">{entry.score.toFixed(1)}</span>
          <span className="text-[var(--color-gray-400)] text-sm"> / 55</span>
        </div>
      </div>
    </Card>
  )
}

// Row for ranks 4+
function LeaderboardRow({ entry }: { entry: typeof mockLeaderboard[0] }) {
  return (
    <div className="flex items-center gap-4 p-4 hover:bg-[var(--color-offwhite-3)] transition-colors">
      {/* Rank */}
      <div className="w-10 h-10 rounded-lg bg-[var(--color-offwhite-4)] flex items-center justify-center flex-shrink-0">
        <span className="font-bold text-[var(--color-gray-400)]">#{entry.rank}</span>
      </div>

      {/* Team */}
      <Avatar src={entry.avatarUrl} name={entry.teamName} size="md" />

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-[var(--color-black-900)] truncate">{entry.teamName}</h4>
        <p className="text-sm text-[var(--color-gray-400)] truncate">{entry.projectName}</p>
      </div>

      {/* Track */}
      <Badge
        size="sm"
        className="hidden sm:flex"
        style={{
          backgroundColor: `${trackColors[entry.trackId]}20`,
          color: trackColors[entry.trackId],
        }}
      >
        {entry.trackId}
      </Badge>

      {/* Change indicator */}
      <div className="w-12 flex justify-center">
        {entry.change > 0 ? (
          <span className="flex items-center text-[var(--color-success-500)] text-sm">
            <ChevronUp className="w-4 h-4" />
            {entry.change}
          </span>
        ) : entry.change < 0 ? (
          <span className="flex items-center text-[var(--color-red-500)] text-sm">
            <ChevronDown className="w-4 h-4" />
            {Math.abs(entry.change)}
          </span>
        ) : (
          <span className="text-[var(--color-gray-300)] text-sm">—</span>
        )}
      </div>

      {/* Score */}
      <div className="text-right w-20">
        <span className="font-semibold text-[var(--color-black-900)]">{entry.score.toFixed(1)}</span>
        <span className="text-[var(--color-gray-400)] text-xs"> pts</span>
      </div>
    </div>
  )
}
