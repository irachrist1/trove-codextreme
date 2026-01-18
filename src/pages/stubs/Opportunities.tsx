import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Briefcase,
  MapPin,
  DollarSign,
  Building,
  Clock,
  Filter,
  Search,
  Sparkles,
  ExternalLink,
} from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { usePageView, ANALYTICS_EVENTS, useAnalytics } from '@/lib/posthog'

// Mock opportunities preview
const mockOpportunities = [
  {
    id: 1,
    title: 'Full Stack Engineer',
    company: 'TechCorp',
    logo: 'https://placehold.co/48x48/1a1a1a/white?text=TC',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary: '$150K - $200K',
    tags: ['React', 'Node.js', 'AWS'],
    postedAt: '2 days ago',
  },
  {
    id: 2,
    title: 'ML Engineer',
    company: 'AI Labs',
    logo: 'https://placehold.co/48x48/1a1a1a/white?text=AI',
    location: 'Remote',
    type: 'Full-time',
    salary: '$180K - $250K',
    tags: ['Python', 'PyTorch', 'MLOps'],
    postedAt: '1 week ago',
  },
  {
    id: 3,
    title: 'Founding Engineer',
    company: 'Stealth Startup',
    logo: 'https://placehold.co/48x48/1a1a1a/white?text=SS',
    location: 'New York, NY',
    type: 'Full-time',
    salary: '$120K + Equity',
    tags: ['Full Stack', 'Startup', 'Equity'],
    postedAt: '3 days ago',
  },
]

export function OpportunitiesPage() {
  const { success } = useToast()
  const { track } = useAnalytics()
  usePageView('opportunities_stub')

  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleJoinWaitlist = async () => {
    if (!email) return

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    track(ANALYTICS_EVENTS.WAITLIST_JOINED, { feature: 'opportunity_board', email })
    success('You\'re on the list! We\'ll notify you when Opportunity Board launches.')
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-300">Coming Soon</span>
          </div>

          <h1 className="text-display mb-6">
            Your Next Role
            <span className="gradient-text block">Awaits</span>
          </h1>

          <p className="text-xl text-zinc-400 mb-8 leading-relaxed">
            Opportunity Board connects CodeXtreme builders with companies that value
            hackathon experience. Curated roles from startups and tech giants alike.
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

        {/* Search Preview (Disabled) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <div className="flex gap-4 opacity-50 pointer-events-none">
            <Input
              placeholder="Search roles, skills, or companies..."
              leftIcon={<Search className="w-4 h-4" />}
              className="flex-1"
            />
            <Button variant="secondary" leftIcon={<Filter className="w-4 h-4" />}>
              Filters
            </Button>
          </div>
        </motion.div>

        {/* Opportunities Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          <div className="space-y-4">
            {mockOpportunities.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <Card variant="interactive">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <img
                      src={job.logo}
                      alt={job.company}
                      className="w-12 h-12 rounded-xl object-cover"
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white mb-1">{job.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5" />
                          {job.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" />
                          {job.salary}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-zinc-500">{job.postedAt}</span>
                      <Button variant="secondary" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                        Apply
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-zinc-800">
                    <Badge variant="default" size="sm">{job.type}</Badge>
                    {job.tags.map((tag) => (
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
              icon: Briefcase,
              title: 'Curated Roles',
              description: 'Handpicked opportunities from companies that value builders.',
            },
            {
              icon: Building,
              title: 'Direct Access',
              description: 'Skip the resume pile. Your hackathon projects speak for themselves.',
            },
            {
              icon: Clock,
              title: 'Fast Hiring',
              description: 'Companies committed to efficient hiring processes.',
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              <Card className="h-full text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-amber-400" />
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
