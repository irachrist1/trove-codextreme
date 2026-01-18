import { useState, useCallback } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Github,
  Video,
  X,
  Check,
  RotateCcw,
} from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { usePageView, ANALYTICS_EVENTS, useAnalytics } from '@/lib/posthog'

// Mock submissions for comparison
const mockSubmissions = [
  {
    _id: '1',
    projectName: 'MindBridge AI',
    tagline: 'AI-powered mental health support for everyone',
    problemStatement: 'Mental health support is often inaccessible, expensive, or stigmatized.',
    solution: 'MindBridge AI provides 24/7 AI-powered mental health support through conversational AI.',
    techStack: ['React', 'Python', 'OpenAI API', 'Convex'],
    team: { name: 'Neural Nexus', avatarUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=neural' },
    trackId: 'healthcare',
    demoUrl: 'https://demo.example.com',
    videoUrl: 'https://youtube.com',
  },
  {
    _id: '2',
    projectName: 'HealthBot',
    tagline: 'Your personal health assistant',
    problemStatement: 'People struggle to manage their health data and get timely advice.',
    solution: 'HealthBot aggregates health data and provides personalized recommendations.',
    techStack: ['Vue.js', 'FastAPI', 'PostgreSQL'],
    team: { name: 'MedTech', avatarUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=med' },
    trackId: 'healthcare',
    videoUrl: 'https://youtube.com',
  },
  {
    _id: '3',
    projectName: 'LearnPath',
    tagline: 'Personalized learning journeys for everyone',
    problemStatement: 'Traditional education doesn\'t cater to individual learning styles.',
    solution: 'LearnPath creates AI-driven personalized learning paths.',
    techStack: ['Next.js', 'TensorFlow', 'MongoDB'],
    team: { name: 'EduTech', avatarUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=edu' },
    trackId: 'education',
    demoUrl: 'https://demo.example.com',
  },
]

export function JudgingComparePage() {
  const { eventSlug } = useParams({ from: '/judging/$eventSlug/compare' })
  const { success } = useToast()
  const { track } = useAnalytics()

  usePageView('judging_compare', { event_slug: eventSlug })

  const [currentPair, setCurrentPair] = useState([0, 1])
  const [comparisons, setComparisons] = useState<{ winner: string; loser: string }[]>([])
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)

  const leftSubmission = mockSubmissions[currentPair[0]]
  const rightSubmission = mockSubmissions[currentPair[1]]

  const handleChoice = useCallback((winner: 'left' | 'right') => {
    const winnerSubmission = winner === 'left' ? leftSubmission : rightSubmission
    const loserSubmission = winner === 'left' ? rightSubmission : leftSubmission

    setComparisons((prev) => [
      ...prev,
      { winner: winnerSubmission._id, loser: loserSubmission._id },
    ])

    track(ANALYTICS_EVENTS.JUDGING_COMPARISON_MADE, {
      event_slug: eventSlug,
      winner_id: winnerSubmission._id,
      loser_id: loserSubmission._id,
    })

    // Move to next pair
    const nextIndex = Math.max(currentPair[0], currentPair[1]) + 1
    if (nextIndex < mockSubmissions.length) {
      setSwipeDirection(winner === 'left' ? 'left' : 'right')
      setTimeout(() => {
        setCurrentPair([currentPair[1], nextIndex])
        setSwipeDirection(null)
      }, 300)
    } else {
      success(`Completed ${comparisons.length + 1} comparisons!`)
    }
  }, [currentPair, leftSubmission, rightSubmission, comparisons, eventSlug, track, success])

  const handleSwipe = (info: { offset: { x: number }; velocity: { x: number } }, side: 'left' | 'right') => {
    const threshold = 100
    const velocity = 500

    if (Math.abs(info.offset.x) > threshold || Math.abs(info.velocity.x) > velocity) {
      // Swiped away - this means the OTHER side wins
      handleChoice(side === 'left' ? 'right' : 'left')
    }
  }

  const SubmissionCard = ({ submission, side }: { submission: typeof mockSubmissions[0]; side: 'left' | 'right' }) => (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(_, info) => handleSwipe(info, side)}
      whileDrag={{ scale: 1.02 }}
      animate={{
        x: swipeDirection === side ? (side === 'left' ? -300 : 300) : 0,
        opacity: swipeDirection === side ? 0 : 1,
        rotate: swipeDirection === side ? (side === 'left' ? -10 : 10) : 0,
      }}
      transition={{ duration: 0.3 }}
      className="cursor-grab active:cursor-grabbing"
    >
      <Card className="h-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar src={submission.team.avatarUrl} name={submission.team.name} size="lg" />
          <div>
            <h3 className="font-semibold text-white">{submission.projectName}</h3>
            <p className="text-sm text-zinc-500">{submission.team.name}</p>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-zinc-300 mb-4">{submission.tagline}</p>

        {/* Problem & Solution */}
        <div className="space-y-4 mb-6">
          <div>
            <h4 className="text-xs font-medium text-zinc-500 uppercase mb-1">Problem</h4>
            <p className="text-sm text-zinc-400">{submission.problemStatement}</p>
          </div>
          <div>
            <h4 className="text-xs font-medium text-zinc-500 uppercase mb-1">Solution</h4>
            <p className="text-sm text-zinc-400">{submission.solution}</p>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mb-4">
          <h4 className="text-xs font-medium text-zinc-500 uppercase mb-2">Tech Stack</h4>
          <div className="flex flex-wrap gap-2">
            {submission.techStack.map((tech) => (
              <Badge key={tech} size="sm" variant="default">
                {tech}
              </Badge>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="flex gap-2 pt-4 border-t border-zinc-800">
          {submission.demoUrl && (
            <a
              href={submission.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 rounded-lg text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Demo
            </a>
          )}
          {submission.videoUrl && (
            <a
              href={submission.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 rounded-lg text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              <Video className="w-3.5 h-3.5" />
              Video
            </a>
          )}
        </div>
      </Card>
    </motion.div>
  )

  return (
    <div className="py-8 min-h-screen">
      <Container size="xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/judging/$eventSlug"
            params={{ eventSlug }}
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to queue
          </Link>

          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <span>{comparisons.length} comparisons made</span>
          </div>
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-bold text-white mb-2">Compare Mode</h1>
          <p className="text-zinc-400">
            Swipe away the project you think is weaker, or click the buttons below
          </p>
        </motion.div>

        {/* Comparison Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="relative">
            <SubmissionCard submission={leftSubmission} side="left" />
            <div className="absolute -top-3 -left-3 w-8 h-8 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-zinc-400">A</span>
            </div>
          </div>

          <div className="relative">
            <SubmissionCard submission={rightSubmission} side="right" />
            <div className="absolute -top-3 -left-3 w-8 h-8 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-zinc-400">B</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4">
          <Button
            size="lg"
            variant="outline"
            onClick={() => handleChoice('left')}
            className="min-w-[140px]"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            A is Better
          </Button>

          <Button
            size="lg"
            variant="ghost"
            onClick={() => {
              // Skip / can't decide
              const nextIndex = Math.max(currentPair[0], currentPair[1]) + 1
              if (nextIndex < mockSubmissions.length) {
                setCurrentPair([currentPair[1], nextIndex])
              }
            }}
          >
            Skip
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => handleChoice('right')}
            className="min-w-[140px]"
          >
            B is Better
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Keyboard shortcuts hint */}
        <p className="text-center text-xs text-zinc-600 mt-6">
          Tip: Use keyboard shortcuts: <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded">←</kbd> for A,{' '}
          <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded">→</kbd> for B,{' '}
          <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded">Space</kbd> to skip
        </p>
      </Container>
    </div>
  )
}
