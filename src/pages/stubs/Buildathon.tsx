import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Rocket,
  Target,
  Calendar,
  CheckCircle2,
  Clock,
  Trophy,
  Users,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { usePageView, ANALYTICS_EVENTS, useAnalytics } from '@/lib/posthog'

// Mock buildathon preview
const mockBuildathon = {
  title: 'SaaS Sprint 2026',
  description: '8 weeks to build a profitable SaaS product',
  duration: '8 weeks',
  participants: 156,
  milestones: [
    { week: 1, title: 'Ideation & Validation', status: 'completed' },
    { week: 2, title: 'MVP Design', status: 'completed' },
    { week: 3, title: 'Core Development', status: 'current' },
    { week: 4, title: 'Beta Launch', status: 'upcoming' },
    { week: 5, title: 'User Testing', status: 'upcoming' },
    { week: 6, title: 'Iteration', status: 'upcoming' },
    { week: 7, title: 'Marketing Push', status: 'upcoming' },
    { week: 8, title: 'Demo Day', status: 'upcoming' },
  ],
  prizes: ['$50K in funding', 'Mentorship from YC alums', 'Featured on Product Hunt'],
}

export function BuildathonPage() {
  const { success } = useToast()
  const { track } = useAnalytics()
  usePageView('buildathon_stub')

  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleJoinWaitlist = async () => {
    if (!email) return

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    track(ANALYTICS_EVENTS.WAITLIST_JOINED, { feature: 'buildathon', email })
    success('You\'re on the list! We\'ll notify you when Buildathon launches.')
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-offwhite-4)] border border-[var(--color-gray-200)] rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-[var(--color-red-500)]" />
            <span className="text-sm font-medium text-[var(--color-red-400)]">Coming Soon</span>
          </div>

          <h1 className="text-display mb-6">
            Build Something
            <span className="gradient-text block">That Lasts</span>
          </h1>

          <p className="text-xl text-[var(--color-gray-400)] mb-8 leading-relaxed">
            Buildathon is for the long game. Multi-week challenges with structured milestones,
            mentor check-ins, and the accountability you need to ship a real product.
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

        {/* Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <Card variant="gradient" className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--color-offwhite-5)] to-[var(--color-gray-100)] blur-3xl" />

            <div className="relative">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <Badge variant="default" className="mb-2">Preview</Badge>
                  <h2 className="text-2xl font-bold text-[var(--color-black-900)]">{mockBuildathon.title}</h2>
                  <p className="text-[var(--color-gray-400)]">{mockBuildathon.description}</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-[var(--color-gray-400)]">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {mockBuildathon.duration}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {mockBuildathon.participants} builders
                  </span>
                </div>
              </div>

              {/* Milestones Timeline */}
              <div className="relative mb-8">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[var(--color-gray-100)]" />

                <div className="space-y-4">
                  {mockBuildathon.milestones.map((milestone, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      className="flex items-center gap-4 pl-2"
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          milestone.status === 'completed'
                            ? 'bg-[var(--color-success-500)]'
                            : milestone.status === 'current'
                            ? 'bg-[var(--color-red-500)] pulse-glow'
                            : 'bg-[var(--color-gray-200)]'
                        }`}
                      >
                        {milestone.status === 'completed' && (
                          <CheckCircle2 className="w-3 h-3 text-[var(--color-white)]" />
                        )}
                        {milestone.status === 'current' && (
                          <Clock className="w-3 h-3 text-[var(--color-white)]" />
                        )}
                      </div>
                      <div className="flex-1 flex items-center justify-between py-2">
                        <span
                          className={`font-medium ${
                            milestone.status === 'upcoming' ? 'text-[var(--color-gray-400)]' : 'text-[var(--color-black-900)]'
                          }`}
                        >
                          {milestone.title}
                        </span>
                        <span className="text-xs text-[var(--color-gray-400)]">Week {milestone.week}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Prizes */}
              <div className="flex flex-wrap gap-3">
                {mockBuildathon.prizes.map((prize, i) => (
                  <Badge key={i} variant="default" size="md">
                    <Trophy className="w-3.5 h-3.5 mr-1.5" />
                    {prize}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Target,
              title: 'Structured Milestones',
              description: 'Clear weekly goals keep you on track and shipping consistently.',
            },
            {
              icon: Users,
              title: 'Mentor Support',
              description: 'Regular check-ins with experienced founders and builders.',
            },
            {
              icon: Trophy,
              title: 'Demo Day',
              description: 'Showcase your product to investors, press, and the community.',
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              <Card className="h-full text-center">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-offwhite-4)] flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-[var(--color-red-500)]" />
                </div>
                <h3 className="font-semibold text-[var(--color-black-900)] mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--color-gray-400)]">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </Container>
    </div>
  )
}
