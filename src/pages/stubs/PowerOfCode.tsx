import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Code2,
  Zap,
  Trophy,
  Target,
  Flame,
  Star,
  Lock,
  Sparkles,
} from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { useToast } from '@/components/ui/Toast'
import { usePageView, ANALYTICS_EVENTS, useAnalytics } from '@/lib/posthog'

// Mock challenges preview
const mockChallenges = [
  {
    id: 1,
    title: 'Build a REST API',
    difficulty: 'Beginner',
    xp: 100,
    completions: 2340,
    tags: ['Backend', 'Node.js'],
    locked: false,
  },
  {
    id: 2,
    title: 'Implement Authentication',
    difficulty: 'Intermediate',
    xp: 250,
    completions: 1205,
    tags: ['Security', 'JWT'],
    locked: false,
  },
  {
    id: 3,
    title: 'Real-time Chat System',
    difficulty: 'Advanced',
    xp: 500,
    completions: 456,
    tags: ['WebSockets', 'React'],
    locked: true,
  },
]

const difficultyColors = {
  Beginner: 'text-emerald-400',
  Intermediate: 'text-amber-400',
  Advanced: 'text-red-400',
}

export function PowerOfCodePage() {
  const { success } = useToast()
  const { track } = useAnalytics()
  usePageView('power_of_code_stub')

  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleJoinWaitlist = async () => {
    if (!email) return

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    track(ANALYTICS_EVENTS.WAITLIST_JOINED, { feature: 'power_of_code', email })
    success('You\'re on the list! We\'ll notify you when Power of Code launches.')
    setEmail('')
    setIsSubmitting(false)
  }

  return (
    <div className="py-8 min-h-screen">
      <Container>
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-300">Coming Soon</span>
          </div>

          <h1 className="text-display mb-6">
            Level Up Your
            <span className="gradient-text block">Coding Skills</span>
          </h1>

          <p className="text-xl text-zinc-400 mb-8 leading-relaxed">
            Power of Code is challenge-based learning that actually works.
            Real-world projects, instant feedback, and a path from beginner to expert.
          </p>

          {/* Waitlist form */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              placeholder="Enter your email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleJoinWaitlist} isLoading={isSubmitting}>
              Join Waitlist
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
        >
          {[
            { icon: Code2, value: '150+', label: 'Challenges' },
            { icon: Target, value: '12', label: 'Learning Paths' },
            { icon: Star, value: '50K+', label: 'XP to Earn' },
            { icon: Trophy, value: '25', label: 'Achievements' },
          ].map((stat, i) => (
            <Card key={i} className="text-center">
              <stat.icon className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-zinc-500">{stat.label}</p>
            </Card>
          ))}
        </motion.div>

        {/* Challenges Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-xl font-bold text-white text-center mb-6">Sample Challenges</h2>

          <div className="space-y-4">
            {mockChallenges.map((challenge, i) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <Card
                  variant={challenge.locked ? 'default' : 'interactive'}
                  className={challenge.locked ? 'opacity-60' : ''}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
                      {challenge.locked ? (
                        <Lock className="w-5 h-5 text-zinc-500" />
                      ) : (
                        <Code2 className="w-5 h-5 text-emerald-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate">{challenge.title}</h3>
                      <div className="flex items-center gap-3 text-sm">
                        <span className={difficultyColors[challenge.difficulty as keyof typeof difficultyColors]}>
                          {challenge.difficulty}
                        </span>
                        <span className="text-zinc-500">{challenge.completions.toLocaleString()} completions</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="default" size="sm">
                        <Zap className="w-3 h-3 mr-1" />
                        {challenge.xp} XP
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3 pt-3 border-t border-zinc-800">
                    {challenge.tags.map((tag) => (
                      <Badge key={tag} size="sm" variant="default">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          {[
            {
              icon: Flame,
              title: 'Daily Streaks',
              description: 'Build consistency with daily challenges and streak rewards.',
            },
            {
              icon: Target,
              title: 'Learning Paths',
              description: 'Structured journeys from beginner to job-ready developer.',
            },
            {
              icon: Trophy,
              title: 'Achievements',
              description: 'Unlock badges and showcase your skills on your profile.',
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              <Card className="h-full text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-zinc-400">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </Container>
    </div>
  )
}
