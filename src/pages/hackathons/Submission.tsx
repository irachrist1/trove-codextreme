import { useEffect, useState } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Save,
  Send,
  Plus,
  X,
  Link as LinkIcon,
  Video,
  Github,
  FileText,
  Image,
  Check,
  AlertCircle,
} from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { usePageView, ANALYTICS_EVENTS, useAnalytics } from '@/lib/posthog'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import { useAuth } from '@/lib/auth'

export function SubmissionPage() {
  const { slug } = useParams({ from: '/hackathons/$slug/submission' })
  const { success, error } = useToast()
  const { track } = useAnalytics()

  usePageView('submission_form', { event_slug: slug })

  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false)
  const [submission, setSubmission] = useState({
    projectName: 'MindBridge AI',
    tagline: 'AI-powered mental health support for everyone',
    problemStatement: 'Mental health support is often inaccessible, expensive, or stigmatized. Many people who need help don\'t get it.',
    solution: 'MindBridge AI provides 24/7 AI-powered mental health support through conversational AI, mood tracking, and personalized coping strategies.',
    techStack: ['React', 'Python', 'OpenAI API', 'Convex', 'TailwindCSS'],
    keyFeatures: [
      'Real-time conversational support',
      'Mood tracking and insights',
      'Personalized coping strategies',
      'Crisis detection and resources',
    ],
    challenges: '',
    learnings: '',
    futureScope: '',
    demoUrl: '',
    videoUrl: '',
    repoUrl: '',
    presentationUrl: '',
    status: 'draft' as 'draft' | 'submitted',
  })

  const [newTech, setNewTech] = useState('')
  const [newFeature, setNewFeature] = useState('')

  const updateField = (field: string, value: any) => {
    setSubmission((prev) => ({ ...prev, [field]: value }))
  }

  const addTech = () => {
    if (newTech.trim() && !submission.techStack.includes(newTech.trim())) {
      updateField('techStack', [...submission.techStack, newTech.trim()])
      setNewTech('')
    }
  }

  const removeTech = (tech: string) => {
    updateField('techStack', submission.techStack.filter((t) => t !== tech))
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      updateField('keyFeatures', [...submission.keyFeatures, newFeature.trim()])
      setNewFeature('')
    }
  }

  const removeFeature = (index: number) => {
    updateField('keyFeatures', submission.keyFeatures.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      track(ANALYTICS_EVENTS.SUBMISSION_SAVED, { event_slug: slug })
      success('Draft saved successfully')
    } catch (err) {
      error('Failed to save. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      track(ANALYTICS_EVENTS.SUBMISSION_COMPLETED, {
        event_slug: slug,
        has_demo: !!submission.demoUrl,
        has_video: !!submission.videoUrl,
        has_repo: !!submission.repoUrl,
      })

      updateField('status', 'submitted')
      setConfirmSubmitOpen(false)
      success('Submission completed! Good luck!')
    } catch (err) {
      error('Submission failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isComplete =
    submission.projectName &&
    submission.tagline &&
    submission.problemStatement &&
    submission.solution &&
    submission.techStack.length > 0 &&
    submission.keyFeatures.length > 0

  return (
    <div className="py-8 pb-32 md:pb-8">
      <Container size="lg">
        {/* Back link */}
        <Link
          to="/hackathons/$slug/team"
          params={{ slug }}
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to team
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Project Submission</h1>
            <p className="text-zinc-400">Tell us about what you built</p>
          </div>
          <Badge
            variant={submission.status === 'submitted' ? 'success' : 'warning'}
            dot
          >
            {submission.status === 'submitted' ? 'Submitted' : 'Draft'}
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader title="Project Info" description="The basics about your project" />

              <div className="space-y-4">
                <Input
                  label="Project Name"
                  placeholder="What's your project called?"
                  value={submission.projectName}
                  onChange={(e) => updateField('projectName', e.target.value)}
                />

                <Input
                  label="Tagline"
                  placeholder="One sentence that describes your project"
                  value={submission.tagline}
                  onChange={(e) => updateField('tagline', e.target.value)}
                  hint="Max 100 characters"
                />
              </div>
            </Card>

            {/* Problem & Solution */}
            <Card>
              <CardHeader title="Problem & Solution" description="What problem are you solving and how?" />

              <div className="space-y-4">
                <Textarea
                  label="Problem Statement"
                  placeholder="What problem does your project solve? Who experiences this problem?"
                  value={submission.problemStatement}
                  onChange={(e) => updateField('problemStatement', e.target.value)}
                  rows={4}
                />

                <Textarea
                  label="Solution"
                  placeholder="How does your project solve this problem? What makes your approach unique?"
                  value={submission.solution}
                  onChange={(e) => updateField('solution', e.target.value)}
                  rows={4}
                />
              </div>
            </Card>

            {/* Tech Stack */}
            <Card>
              <CardHeader title="Tech Stack" description="Technologies used in your project" />

              <div className="flex flex-wrap gap-2 mb-4">
                {submission.techStack.map((tech) => (
                  <Badge key={tech} variant="default" className="pr-1">
                    {tech}
                    <button
                      onClick={() => removeTech(tech)}
                      className="ml-1 p-0.5 hover:bg-white/10 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Add technology..."
                  value={newTech}
                  onChange={(e) => setNewTech(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTech()}
                />
                <Button variant="secondary" onClick={addTech}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </Card>

            {/* Key Features */}
            <Card>
              <CardHeader title="Key Features" description="Main features of your project" />

              <div className="space-y-2 mb-4">
                {submission.keyFeatures.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg"
                  >
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="text-sm text-zinc-300 flex-1">{feature}</span>
                    <button
                      onClick={() => removeFeature(i)}
                      className="p-1 hover:bg-zinc-700 rounded"
                    >
                      <X className="w-4 h-4 text-zinc-500" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Add feature..."
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addFeature()}
                />
                <Button variant="secondary" onClick={addFeature}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </Card>

            {/* Links */}
            <Card>
              <CardHeader title="Links" description="Share your demo, video, and code" />

              <div className="space-y-4">
                <Input
                  label="Demo URL"
                  placeholder="https://your-demo.com"
                  value={submission.demoUrl}
                  onChange={(e) => updateField('demoUrl', e.target.value)}
                  leftIcon={<LinkIcon className="w-4 h-4" />}
                />

                <Input
                  label="Video Demo"
                  placeholder="https://youtube.com/watch?v=..."
                  value={submission.videoUrl}
                  onChange={(e) => updateField('videoUrl', e.target.value)}
                  leftIcon={<Video className="w-4 h-4" />}
                />

                <Input
                  label="GitHub Repository"
                  placeholder="https://github.com/username/repo"
                  value={submission.repoUrl}
                  onChange={(e) => updateField('repoUrl', e.target.value)}
                  leftIcon={<Github className="w-4 h-4" />}
                />

                <Input
                  label="Presentation/Slides"
                  placeholder="https://docs.google.com/presentation/..."
                  value={submission.presentationUrl}
                  onChange={(e) => updateField('presentationUrl', e.target.value)}
                  leftIcon={<FileText className="w-4 h-4" />}
                />
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Completion Status */}
            <Card>
              <h3 className="font-medium text-white mb-4">Completion Status</h3>

              <div className="space-y-3">
                {[
                  { label: 'Project Name', done: !!submission.projectName },
                  { label: 'Tagline', done: !!submission.tagline },
                  { label: 'Problem Statement', done: !!submission.problemStatement },
                  { label: 'Solution', done: !!submission.solution },
                  { label: 'Tech Stack', done: submission.techStack.length > 0 },
                  { label: 'Key Features', done: submission.keyFeatures.length > 0 },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        item.done ? 'bg-emerald-500/20' : 'bg-zinc-800'
                      }`}
                    >
                      {item.done && <Check className="w-3 h-3 text-emerald-400" />}
                    </div>
                    <span className={`text-sm ${item.done ? 'text-zinc-300' : 'text-zinc-500'}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              {!isComplete && (
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-200">
                    Complete all required fields before submitting
                  </p>
                </div>
              )}
            </Card>

            {/* Actions */}
            <Card>
              <div className="space-y-3">
                <Button
                  fullWidth
                  variant="secondary"
                  leftIcon={<Save className="w-4 h-4" />}
                  onClick={handleSave}
                  isLoading={isSaving}
                >
                  Save Draft
                </Button>

                <Button
                  fullWidth
                  leftIcon={<Send className="w-4 h-4" />}
                  onClick={() => setConfirmSubmitOpen(true)}
                  disabled={!isComplete || submission.status === 'submitted'}
                >
                  {submission.status === 'submitted' ? 'Submitted' : 'Submit Project'}
                </Button>
              </div>

              <p className="text-xs text-zinc-500 mt-4 text-center">
                You can edit your submission until the deadline
              </p>
            </Card>
          </div>
        </div>
      </Container>

      {/* Confirm Submit Modal */}
      <ConfirmModal
        isOpen={confirmSubmitOpen}
        onClose={() => setConfirmSubmitOpen(false)}
        onConfirm={handleSubmit}
        title="Submit Project?"
        description="Once submitted, your project will be locked for judging. You can still make edits until the deadline."
        confirmText="Submit"
        isLoading={isSubmitting}
      />
    </div>
  )
}
