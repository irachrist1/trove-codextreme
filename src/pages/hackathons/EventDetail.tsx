import { Link, useParams } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useQuery } from 'convex/react'
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  ExternalLink,
  Clock,
  ChevronRight,
  Share2,
  Bookmark,
} from 'lucide-react'
import { api } from '@convex/_generated/api'
import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { Avatar, AvatarGroup } from '@/components/ui/Avatar'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDate, formatDateRange, formatTime, formatRelativeDate, copyToClipboard } from '@/lib/utils'
import { usePageView, ANALYTICS_EVENTS, useAnalytics } from '@/lib/posthog'
import { useToast } from '@/components/ui/Toast'


export function EventDetailPage() {
  const { slug } = useParams({ from: '/hackathons/$slug' })
  const { track } = useAnalytics()
  const { success } = useToast()

  usePageView('event_detail', { event_slug: slug })

  const convexEvent = useQuery(api.events.getBySlug, { slug })
  const event = convexEvent ?? null

  const handleShare = async () => {
    const shared = await copyToClipboard(window.location.href)
    if (shared) {
      success('Link copied to clipboard')
    }
  }

  if (convexEvent === undefined) {
    return (
      <Container className="py-8">
        <Skeleton variant="rectangular" height={300} className="mb-6 rounded-2xl" />
        <Skeleton width="60%" height={40} className="mb-4" />
        <Skeleton width="100%" height={100} className="mb-6" />
      </Container>
    )
  }

  if (!event) {
    return (
      <Container className="py-8">
        <Card className="text-center py-12">
          <h2 className="text-xl font-semibold text-[var(--color-black-900)] mb-2">Event not found</h2>
          <p className="text-[var(--color-gray-400)]">This event does not exist.</p>
        </Card>
      </Container>
    )
  }

  const canRegister = event.status === 'registration_open'

  return (
    <div className="pb-24 md:pb-8">
      {/* Hero */}
      <div className="relative bg-[var(--color-offwhite-2)] py-12 md:py-20">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <StatusBadge status={event.status} />
              {event.isHybrid && <Badge variant="default">Hybrid</Badge>}
              {event.isVirtual && !event.isHybrid && <Badge variant="default">Virtual</Badge>}
            </div>

            <h1 className="text-display mb-4">{event.title}</h1>
            <p className="text-xl text-[var(--color-gray-400)] max-w-3xl mb-8">{event.shortDescription}</p>

            <div className="flex flex-wrap items-center gap-6 text-[var(--color-gray-400)]">
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {formatDateRange(event.eventStartDate, event.eventEndDate)}
              </span>
              {event.city && (
                <span className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {event.city}, {event.country}
                </span>
              )}
              <span className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {event.registrationCount} / {event.maxParticipants} participants
              </span>
              <span className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[var(--color-black-700)]" />
                <span className="text-[var(--color-black-800)] font-medium">{event.totalPrizePool}</span>
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-4 mt-8">
              {canRegister && (
                <Link to="/hackathons/$slug/register" params={{ slug }}>
                  <Button
                    size="lg"
                    onClick={() => track(ANALYTICS_EVENTS.REGISTRATION_STARTED, { event_slug: slug })}
                    className="bg-[var(--color-red-500)] hover:bg-[var(--color-red-400)]"
                  >
                    Register Now
                  </Button>
                </Link>
              )}
              <Button variant="outline" size="lg" leftIcon={<Share2 className="w-4 h-4" />} onClick={handleShare}>
                Share
              </Button>
              <Button variant="ghost" size="lg" leftIcon={<Bookmark className="w-4 h-4" />}>
                Save
              </Button>
            </div>
          </motion.div>
        </Container>
      </div>

      <Container>
        <div className="grid lg:grid-cols-3 gap-8 mt-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <h2 className="text-title mb-4">About This Event</h2>
              <div className="prose max-w-none">
                {event.description.split('\n\n').map((para, i) => (
                  <p key={i} className="text-[var(--color-black-800)] mb-4 whitespace-pre-line">{para}</p>
                ))}
              </div>
            </Card>

            {/* Tracks */}
            {event.tracks && event.tracks.length > 0 && (
              <Card>
                <h2 className="text-title mb-6">Tracks & Prizes</h2>
                <div className="space-y-6">
                  {event.tracks.map((track: any) => (
                    <div key={track.id} className="p-4 bg-[var(--color-offwhite-4)] rounded-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: track.color }} />
                        <h3 className="font-semibold text-[var(--color-black-900)]">{track.name}</h3>
                      </div>
                      <p className="text-sm text-[var(--color-gray-400)] mb-4">{track.description}</p>
                      <div className="flex flex-wrap gap-4">
                        {track.prizes.map((prize: any) => (
                          <div key={prize.place} className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-[var(--color-black-700)]" />
                            <span className="text-sm">
                              <span className="text-[var(--color-gray-400)]">{prize.title}:</span>{' '}
                              <span className="text-[var(--color-black-900)] font-medium">{prize.value}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Schedule */}
            {event.schedule && event.schedule.length > 0 && (
              <Card>
                <h2 className="text-title mb-6">Schedule</h2>
                <div className="space-y-4">
                  {event.schedule.map((item: any) => (
                    <div key={item.id} className="flex gap-4 p-4 bg-[var(--color-offwhite-4)] rounded-xl">
                      <div className="flex-shrink-0 text-center w-16">
                        <p className="text-xs text-[var(--color-gray-400)]">{formatDate(item.startTime, { month: 'short', day: 'numeric' })}</p>
                        <p className="text-sm font-medium text-[var(--color-black-900)]">{formatTime(item.startTime)}</p>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-[var(--color-black-900)]">{item.title}</h3>
                        {item.description && (
                          <p className="text-sm text-[var(--color-gray-400)] mt-1">{item.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge size="sm" variant="default">
                            {item.isVirtual ? 'Virtual' : 'In-Person'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Requirements */}
            {event.requirements && event.requirements.length > 0 && (
              <Card>
                <h2 className="text-title mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {event.requirements.map((req: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-[var(--color-black-800)]">
                      <ChevronRight className="w-4 h-4 mt-1 text-[var(--color-black-700)] flex-shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
                {event.eligibility && (
                  <p className="mt-4 text-sm text-[var(--color-gray-400)] italic">{event.eligibility}</p>
                )}
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <h3 className="text-sm font-medium text-[var(--color-gray-400)] mb-4">Key Dates</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-success-50)] flex items-center justify-center">
                    <Clock className="w-5 h-5 text-[var(--color-success-500)]" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-gray-400)]">Registration Closes</p>
                    <p className="text-sm font-medium text-[var(--color-black-900)]">{formatRelativeDate(event.registrationEndDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-info-50)] flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-[var(--color-info-500)]" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-gray-400)]">Event Starts</p>
                    <p className="text-sm font-medium text-[var(--color-black-900)]">{formatDate(event.eventStartDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-warning-50)] flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-[var(--color-warning-500)]" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-gray-400)]">Submission Deadline</p>
                    <p className="text-sm font-medium text-[var(--color-black-900)]">{formatDate(event.submissionDeadline)}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Team Size */}
            <Card>
              <h3 className="text-sm font-medium text-[var(--color-gray-400)] mb-2">Team Size</h3>
              <p className="text-[var(--color-black-900)]">{event.minTeamSize} - {event.maxTeamSize} members</p>
            </Card>

            {/* Judges */}
            {event.staff && event.staff.filter((s: any) => s.role === 'judge').length > 0 && (
              <Card>
                <h3 className="text-sm font-medium text-[var(--color-gray-400)] mb-4">Judges</h3>
                <div className="space-y-4">
                  {event.staff.filter((s: any) => s.role === 'judge').map((staff: any, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <Avatar src={staff.user.avatarUrl} name={staff.user.displayName} size="md" />
                      <div>
                        <p className="text-sm font-medium text-[var(--color-black-900)]">{staff.user.displayName}</p>
                        <p className="text-xs text-[var(--color-gray-400)]">{staff.user.bio}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Sponsors */}
            {event.sponsors && event.sponsors.length > 0 && (
              <Card>
                <h3 className="text-sm font-medium text-[var(--color-gray-400)] mb-4">Sponsors</h3>
                <div className="grid grid-cols-2 gap-4">
                  {event.sponsors.map((sponsor: any, i: number) => (
                    <div key={i} className="p-3 bg-[var(--color-offwhite-4)] rounded-lg">
                      <img
                        src={sponsor.logoUrl}
                        alt={sponsor.name}
                        className="w-full h-8 object-contain opacity-80"
                      />
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Discord CTA */}
            {event.discordUrl && (
              <Card variant="gradient">
                <h3 className="text-sm font-medium text-[var(--color-black-900)] mb-2">Join the Community</h3>
                <p className="text-xs text-[var(--color-gray-400)] mb-4">Connect with participants, mentors, and organizers.</p>
                <a href={event.discordUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" fullWidth rightIcon={<ExternalLink className="w-4 h-4" />}>
                    Join Discord
                  </Button>
                </a>
              </Card>
            )}
          </div>
        </div>
      </Container>

      {/* Sticky CTA for mobile */}
      {canRegister && (
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-[var(--color-offwhite-1)] border-t border-[var(--color-gray-100)] md:hidden">
          <Link to="/hackathons/$slug/register" params={{ slug }}>
            <Button fullWidth size="lg" className="bg-[var(--color-red-500)] hover:bg-[var(--color-red-400)]">Register Now</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
