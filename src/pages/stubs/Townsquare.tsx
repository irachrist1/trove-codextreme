import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  MessageCircle,
  Heart,
  Share2,
  Bookmark,
  Bell,
  Globe,
  Sparkles,
} from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar, AvatarGroup } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { usePageView, ANALYTICS_EVENTS, useAnalytics } from '@/lib/posthog'

// Mock feed preview
const mockPosts = [
  {
    id: 1,
    author: { name: 'Sarah Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', role: 'Organizer' },
    content: 'Excited to announce our next hackathon theme: AI for Social Good! Who\'s ready to build something that matters?',
    likes: 234,
    comments: 45,
    timeAgo: '2h ago',
  },
  {
    id: 2,
    author: { name: 'Alex Rivera', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', role: 'Hacker' },
    content: 'Just shipped our ML pipeline for the healthcare track. Using transformers for symptom analysis. Open to feedback!',
    likes: 89,
    comments: 12,
    timeAgo: '4h ago',
  },
]

export function TownsquarePage() {
  const { success } = useToast()
  const { track } = useAnalytics()
  usePageView('townsquare_stub')

  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleJoinWaitlist = async () => {
    if (!email) return

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    track(ANALYTICS_EVENTS.WAITLIST_JOINED, { feature: 'townsquare', email })
    success('You\'re on the list! We\'ll notify you when Townsquare launches.')
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
            Where Builders
            <span className="gradient-text block">Connect & Create</span>
          </h1>

          <p className="text-xl text-[var(--color-gray-400)] mb-8 leading-relaxed">
            Townsquare is the global community hub for CodeXtreme builders.
            Share your work, find collaborators, get feedback, and stay connected
            with the most ambitious builders in tech.
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

          <p className="text-xs text-[var(--color-gray-400)] mt-3">
            Join 2,400+ builders waiting for early access
          </p>
        </motion.div>

        {/* Feature Preview */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            {
              icon: Globe,
              title: 'Global Feed',
              description: 'See what builders around the world are creating, sharing, and learning.',
            },
            {
              icon: Users,
              title: 'Find Your People',
              description: 'Connect with hackers, mentors, and partners who share your interests.',
            },
            {
              icon: MessageCircle,
              title: 'Meaningful Discussions',
              description: 'Deep conversations about tech, ideas, and the future of building.',
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
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

        {/* Feed Preview (Blurred) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)] via-[var(--color-bg-primary)]/80 to-transparent z-10 flex items-center justify-center">
            <div className="text-center">
              <Bell className="w-8 h-8 text-[var(--color-red-500)] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[var(--color-black-900)] mb-2">Get notified at launch</h3>
              <p className="text-sm text-[var(--color-gray-400)] mb-4">Be the first to explore the community</p>
            </div>
          </div>

          <div className="filter blur-sm opacity-50 space-y-4 pointer-events-none">
            {mockPosts.map((post) => (
              <Card key={post.id}>
                <div className="flex gap-4">
                  <Avatar src={post.author.avatar} name={post.author.name} size="md" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-[var(--color-black-900)]">{post.author.name}</span>
                      <Badge size="sm" variant="default">{post.author.role}</Badge>
                      <span className="text-xs text-[var(--color-gray-400)]">{post.timeAgo}</span>
                    </div>
                    <p className="text-[var(--color-black-800)] mb-4">{post.content}</p>
                    <div className="flex items-center gap-6 text-[var(--color-gray-400)]">
                      <button className="flex items-center gap-1.5 hover:text-[var(--color-red-400)] transition-colors">
                        <Heart className="w-4 h-4" />
                        <span className="text-sm">{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-[var(--color-info-500)] transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">{post.comments}</span>
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-[var(--color-success-500)] transition-colors">
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-amber-400 transition-colors ml-auto">
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      </Container>
    </div>
  )
}
